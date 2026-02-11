import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins or scheduled jobs can run this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all active reminders
    const reminders = await base44.asServiceRole.entities.Reminder.filter({
      is_active: true,
      status: 'active'
    });

    let processed = 0;
    let errors = 0;

    for (const reminder of reminders) {
      try {
        await processReminder(base44, reminder);
        processed++;
      } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err);
        errors++;
      }
    }

    return Response.json({
      success: true,
      processed,
      errors,
      message: `Processed ${processed} reminders with ${errors} errors`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function processReminder(base44, reminder) {
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];

  // Check if reminder should trigger based on timing
  if (!shouldTriggerReminder(reminder, now)) {
    return;
  }

  // Get matching students based on trigger conditions
  const matchingStudents = await getMatchingStudents(base44, reminder);

  for (const student of matchingStudents) {
    await createReminderNotification(base44, reminder, student);
  }

  // Update last triggered time
  await base44.asServiceRole.entities.Reminder.update(reminder.id, {
    last_triggered: now.toISOString()
  });
}

function shouldTriggerReminder(reminder, now) {
  const timing = reminder.reminder_timing;
  
  if (timing.frequency === 'once') {
    if (reminder.last_triggered) return false;
    return true;
  }

  if (timing.frequency === 'daily') {
    return true;
  }

  if (timing.frequency === 'weekly' && timing.days_of_week) {
    const dayOfWeek = now.getDay();
    return timing.days_of_week.includes(dayOfWeek);
  }

  if (timing.frequency === 'on_date' && timing.specific_date) {
    const reminderDate = timing.specific_date;
    const todayDate = now.toISOString().split('T')[0];
    return reminderDate === todayDate;
  }

  return false;
}

async function getMatchingStudents(base44, reminder) {
  const conditions = reminder.trigger_condition;
  const filter = {};

  // Build filter for students based on conditions
  if (conditions.target_audience === 'student' || conditions.target_audience === 'both') {
    // Get students with matching application statuses
    if (conditions.application_status && conditions.application_status.length > 0) {
      const applications = await base44.asServiceRole.entities.Application.filter({
        status: { $in: conditions.application_status }
      });

      const studentIds = [...new Set(applications.map(a => a.student_id))];
      
      if (studentIds.length === 0) return [];

      const students = await Promise.all(
        studentIds.map(id => base44.asServiceRole.entities.StudentProfile.filter({ id }))
      );

      return students.flat();
    }

    // Get students with missing documents
    if (conditions.document_types && conditions.document_types.length > 0) {
      const documents = await base44.asServiceRole.entities.Document.filter({
        document_type: { $in: conditions.document_types },
        status: 'pending'
      });

      const studentIds = [...new Set(documents.map(d => d.student_id))];
      
      if (studentIds.length === 0) return [];

      const students = await Promise.all(
        studentIds.map(id => base44.asServiceRole.entities.StudentProfile.filter({ id }))
      );

      return students.flat();
    }
  }

  return [];
}

async function createReminderNotification(base44, reminder, student) {
  const message = generateMessage(reminder, student);

  const reminderLog = await base44.asServiceRole.entities.ReminderLog.create({
    reminder_id: reminder.id,
    student_id: student.id,
    delivery_method: reminder.delivery_channels.email ? 'both' : 'in_app',
    message_sent: message,
    triggered_at: new Date().toISOString(),
    status: 'pending'
  });

  // Create in-app notification
  if (reminder.delivery_channels.in_app) {
    try {
      await base44.asServiceRole.entities.Notification.create({
        recipient_id: student.id,
        recipient_type: 'student',
        type: 'reminder',
        title: reminder.message_template?.subject || reminder.name,
        message: message,
        is_read: false,
        action_url: getActionUrl(reminder)
      });

      await base44.asServiceRole.entities.ReminderLog.update(reminderLog.id, {
        sent_to_student: true
      });
    } catch (err) {
      console.error('Failed to create in-app notification:', err);
    }
  }

  // Send email if enabled
  if (reminder.delivery_channels.email && student.email) {
    try {
      await base44.integrations.Core.SendEmail({
        to: student.email,
        subject: reminder.message_template?.subject || `Reminder: ${reminder.name}`,
        body: message
      });

      await base44.asServiceRole.entities.ReminderLog.update(reminderLog.id, {
        email_status: 'sent'
      });
    } catch (err) {
      console.error('Failed to send email:', err);
      await base44.asServiceRole.entities.ReminderLog.update(reminderLog.id, {
        email_status: 'failed',
        email_error: err.message
      });
    }
  }

  // Also notify counselor if applicable
  if (reminder.trigger_condition.target_audience === 'both' || reminder.trigger_condition.target_audience === 'counselor') {
    try {
      const counselor = await base44.asServiceRole.entities.User.filter({ id: reminder.counselor_id });
      if (counselor.length > 0) {
        await base44.asServiceRole.entities.Notification.create({
          recipient_id: reminder.counselor_id,
          recipient_type: 'counselor',
          type: 'reminder',
          title: `Student Alert: ${reminder.name}`,
          message: `Reminder triggered for ${student.first_name} ${student.last_name}: ${message}`,
          is_read: false,
          related_student_id: student.id
        });

        await base44.asServiceRole.entities.ReminderLog.update(reminderLog.id, {
          sent_to_counselor: true
        });
      }
    } catch (err) {
      console.error('Failed to notify counselor:', err);
    }
  }
}

function generateMessage(reminder, student) {
  let message = reminder.message_template?.body || getDefaultMessage(reminder.reminder_type);

  // Replace variables in message
  message = message.replace('{{student_name}}', `${student.first_name} ${student.last_name}`);
  message = message.replace('{{student_email}}', student.email);

  return message;
}

function getDefaultMessage(reminderType) {
  const messages = {
    application_deadline: 'Your application deadline is approaching. Please complete your application before the deadline.',
    missing_document: 'You have missing documents required for your application. Please upload them as soon as possible.',
    document_expiry: 'One of your documents is expiring soon. Please renew it to avoid delays.',
    visa_deadline: 'Your visa application deadline is approaching. Please ensure all requirements are met.',
    action_required: 'An action is required from you. Please check your dashboard for details.',
    custom: 'You have a pending action. Please review and complete it.'
  };

  return messages[reminderType] || messages.custom;
}

function getActionUrl(reminder) {
  const typeMap = {
    application_deadline: '/MyApplications',
    missing_document: '/MyDocuments',
    document_expiry: '/MyDocuments',
    visa_deadline: '/MyProfile?tab=visa',
    action_required: '/StudentDashboard'
  };

  return typeMap[reminder.reminder_type] || '/StudentDashboard';
}