import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { conversationId } = await req.json();

        const conversation = await base44.asServiceRole.entities.WhatsAppConversation.get(conversationId);
        const counselors = await base44.asServiceRole.entities.Counselor.filter({ 
            status: 'active', 
            is_available: true 
        });

        if (counselors.length === 0) {
            return Response.json({ error: 'No available counselors' }, { status: 400 });
        }

        // Get student profile if exists
        const studentProfiles = await base44.asServiceRole.entities.StudentProfile.filter({ 
            phone: conversation.student_phone 
        });
        const studentProfile = studentProfiles[0];

        // Prepare counselor data for AI
        const counselorData = counselors.map(c => ({
            id: c.user_id,
            name: c.name,
            current_load: c.current_students,
            max_capacity: c.max_students,
            availability_percent: Math.round(((c.max_students - c.current_students) / c.max_students) * 100),
            specializations: c.specializations || [],
            languages: c.languages || []
        }));

        const prompt = `You are an intelligent chat routing system for ALO Education.

INCOMING CHAT:
- Student: ${conversation.student_name || 'Unknown'}
- Phone: ${conversation.student_phone}
- Tags: ${conversation.tags?.join(', ') || 'None'}
- Source: ${conversation.source}
${studentProfile ? `- Preferred countries: ${studentProfile.preferred_countries?.join(', ')}
- Degree level: ${studentProfile.preferred_degree_level}
- Fields: ${studentProfile.preferred_fields?.join(', ')}` : ''}

AVAILABLE COUNSELORS:
${JSON.stringify(counselorData, null, 2)}

ASSIGNMENT RULES:
1. Match counselor specialization to student's country preference (HIGH priority)
2. Distribute load evenly - prefer counselors with lower current_load
3. Consider language match if available
4. Avoid overloading anyone (check availability_percent)

Select the BEST counselor ID and explain why.`;

        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    selected_counselor_id: { type: 'string' },
                    reasoning: { type: 'string' },
                    confidence: { type: 'number' }
                }
            }
        });

        // Assign the chat
        await base44.asServiceRole.entities.WhatsAppConversation.update(conversationId, {
            assigned_counselor_id: aiResponse.selected_counselor_id,
            assigned_at: new Date().toISOString(),
            status: 'assigned'
        });

        // Update counselor's current student count
        const selectedCounselor = counselors.find(c => c.user_id === aiResponse.selected_counselor_id);
        if (selectedCounselor) {
            await base44.asServiceRole.entities.Counselor.update(selectedCounselor.id, {
                current_students: selectedCounselor.current_students + 1
            });
        }

        return Response.json({
            success: true,
            assigned_to: aiResponse.selected_counselor_id,
            reasoning: aiResponse.reasoning
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});