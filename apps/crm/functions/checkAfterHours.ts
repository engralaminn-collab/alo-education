import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { conversationId } = await req.json();

        // Get current time in Bangladesh timezone (Asia/Dhaka is UTC+6)
        const now = new Date();
        const utcHours = now.getUTCHours();
        const bangladeshHours = (utcHours + 6) % 24;

        // After hours: 6 PM (18:00) to 10 AM (10:00)
        const isAfterHours = bangladeshHours >= 18 || bangladeshHours < 10;

        if (isAfterHours) {
            // Send auto-reply
            const autoReplyMessage = `Thank you for contacting ALO Education! 🌙

Our counselors are currently offline (6:00 PM - 10:00 AM Bangladesh time).

We'll respond to your message when our team is back online at 10:00 AM.

For urgent matters, please email us at: info@aloeducation.co.uk

⏰ Office Hours: 10:00 AM - 6:00 PM (Bangladesh Time)`;

            // Create system message
            await base44.asServiceRole.entities.WhatsAppMessage.create({
                conversation_id: conversationId,
                sender_type: 'system',
                content: autoReplyMessage,
                is_auto_reply: true
            });

            return Response.json({
                is_after_hours: true,
                message: 'Auto-reply sent',
                current_hour_bangladesh: bangladeshHours
            });
        }

        return Response.json({
            is_after_hours: false,
            current_hour_bangladesh: bangladeshHours
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});