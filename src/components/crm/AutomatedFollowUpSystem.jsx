import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, FileX, Clock } from 'lucide-react';

export default function AutomatedFollowUpSystem() {
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['followup-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['followup-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['followup-documents'],
    queryFn: () => base44.entities.Document.list(),
  });

  const sendFollowUp = useMutation({
    mutationFn: async ({ student, missingDocs }) => {
      const prompt = `Generate a friendly follow-up email reminder for ${student.first_name} ${student.last_name}.

They haven't uploaded the following required documents:
${missingDocs.join('\n')}

Make it:
- Friendly and encouraging
- Not pushy
- Offer help if needed
- Include a deadline (7 days from now)

Return JSON with subject and body.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      await base44.integrations.Core.SendEmail({
        to: student.email,
        subject: response.subject,
        body: response.body
      });

      // Log the follow-up
      await base44.entities.NotificationLog.create({
        student_id: student.id,
        channel: 'email',
        recipient: student.email,
        subject: response.subject,
        body: response.body,
        trigger_event: 'automated_document_reminder',
        status: 'sent'
      });

      return { student: student.email, success: true };
    }
  });

  useEffect(() => {
    const checkAndSendReminders = async () => {
      const requiredDocs = ['passport', 'transcript', 'degree_certificate', 'english_test'];
      
      for (const app of applications) {
        if (app.status === 'lead' || app.status === 'profile_ready') {
          const student = students.find(s => s.id === app.student_id);
          if (!student?.email) continue;

          const studentDocs = documents.filter(d => d.student_id === app.student_id && d.status === 'approved');
          const uploadedTypes = studentDocs.map(d => d.document_type);
          const missingDocs = requiredDocs.filter(doc => !uploadedTypes.includes(doc));

          // Check if we already sent a reminder in last 7 days
          const recentLogs = await base44.entities.NotificationLog.filter({
            student_id: student.id,
            trigger_event: 'automated_document_reminder'
          });

          const lastReminder = recentLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
          const daysSinceLastReminder = lastReminder 
            ? (Date.now() - new Date(lastReminder.created_date).getTime()) / (1000 * 60 * 60 * 24)
            : 999;

          if (missingDocs.length > 0 && daysSinceLastReminder > 7) {
            await sendFollowUp.mutateAsync({ student, missingDocs });
            // Wait 2 seconds between emails
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      queryClient.invalidateQueries(['followup-documents']);
      queryClient.invalidateQueries(['followup-applications']);
    };

    // Run check on mount
    checkAndSendReminders();

    // Run every 24 hours
    const interval = setInterval(checkAndSendReminders, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [applications, students, documents]);

  // This is a background component, no UI rendered
  return null;
}