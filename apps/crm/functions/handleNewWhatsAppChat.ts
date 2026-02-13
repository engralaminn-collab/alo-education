import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const payload = await req.json();
        const conversationId = payload.event?.entity_id;

        if (!conversationId) {
            return Response.json({ error: 'No conversation ID' }, { status: 400 });
        }

        // Step 1: Check if after hours
        const afterHoursCheck = await base44.asServiceRole.functions.invoke('checkAfterHours', {
            conversationId
        });

        if (afterHoursCheck.data.is_after_hours) {
            console.log('After hours - auto-reply sent, skipping assignment');
            return Response.json({ 
                message: 'After hours - auto-reply sent',
                assignment_skipped: true
            });
        }

        // Step 2: Auto-assign using AI
        const assignmentResult = await base44.asServiceRole.functions.invoke('autoAssignChat', {
            conversationId
        });

        console.log('Chat assigned:', assignmentResult.data);

        return Response.json({
            success: true,
            assigned: true,
            ...assignmentResult.data
        });
    } catch (error) {
        console.error('Error handling new chat:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});