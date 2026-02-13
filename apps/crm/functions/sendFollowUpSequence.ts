import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { inactivity_days = 7 } = await req.json();

        // Find inactive leads
        const students = await base44.asServiceRole.entities.StudentProfile.list();
        const communications = await base44.asServiceRole.entities.CommunicationHistory.list();

        const inactiveLeads = [];

        for (const student of students) {
            if (student.status === 'enrolled' || student.status === 'lost') continue;

            const studentComms = communications.filter(c => c.student_id === student.id);
            const lastComm = studentComms.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            )[0];

            const daysSinceLastContact = lastComm ? 
                (Date.now() - new Date(lastComm.created_date).getTime()) / (1000 * 60 * 60 * 24) : 999;

            if (daysSinceLastContact >= inactivity_days) {
                inactiveLeads.push({
                    student,
                    daysSinceLastContact: Math.round(daysSinceLastContact)
                });
            }
        }

        // Send follow-up emails
        const emailsSent = [];

        for (const { student, daysSinceLastContact } of inactiveLeads) {
            let emailSubject = '';
            let emailBody = '';

            if (daysSinceLastContact >= 30) {
                emailSubject = `${student.first_name}, we miss you! Let's continue your study abroad journey`;
                emailBody = `Hi ${student.first_name},\n\nWe noticed it's been a while since we last connected. Your dream of studying abroad is still within reach!\n\nWe'd love to help you explore:\n• New scholarship opportunities\n• Updated course recommendations\n• Visa guidance and support\n\nReply to this email or schedule a free consultation with your counselor.\n\nBest regards,\nALO Education Team`;
            } else if (daysSinceLastContact >= 14) {
                emailSubject = `Quick check-in: How's your study abroad planning going, ${student.first_name}?`;
                emailBody = `Hi ${student.first_name},\n\nJust checking in to see how your study abroad planning is progressing!\n\nIf you have any questions about:\n• Application deadlines\n• Document requirements\n• Course selection\n\nYour counselor is here to help. Let's schedule a quick call!\n\nBest regards,\nALO Education Team`;
            } else {
                emailSubject = `${student.first_name}, your next steps for studying abroad`;
                emailBody = `Hi ${student.first_name},\n\nWe wanted to follow up on your study abroad journey.\n\nHere's what you can do next:\n1. Complete your profile (currently ${student.profile_completeness || 0}% complete)\n2. Review course recommendations\n3. Start your applications\n\nNeed help? Reply to this email or call us!\n\nBest regards,\nALO Education Team`;
            }

            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: student.email,
                    subject: emailSubject,
                    body: emailBody
                });

                // Log communication
                await base44.asServiceRole.entities.CommunicationHistory.create({
                    student_id: student.id,
                    counselor_id: student.counselor_id,
                    communication_type: 'email',
                    direction: 'outbound',
                    subject: emailSubject,
                    summary: 'Automated follow-up sequence',
                    full_content: emailBody
                });

                emailsSent.push({
                    student: `${student.first_name} ${student.last_name}`,
                    email: student.email,
                    days_inactive: daysSinceLastContact
                });
            } catch (error) {
                console.error(`Failed to send email to ${student.email}:`, error);
            }
        }

        return Response.json({ 
            success: true,
            inactive_leads_found: inactiveLeads.length,
            emails_sent: emailsSent.length,
            details: emailsSent
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});