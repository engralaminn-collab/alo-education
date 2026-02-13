import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const { conversation_id, message, student_id, context } = await req.json();

    // Fetch conversation history
    const messages = await base44.entities.ChatbotMessage.filter({ 
      conversation_id 
    }, '-created_date', 20);

    // Fetch student context if available
    let studentContext = '';
    if (student_id) {
      const student = await base44.entities.StudentProfile.get(student_id);
      studentContext = `Student: ${student.first_name} ${student.last_name}, Status: ${student.status}`;
    }

    // Build conversation history
    const conversationHistory = messages.map(m => 
      `${m.role}: ${m.message}`
    ).join('\n');

    // Generate AI response
    const prompt = `You are ALO Education's helpful AI assistant. Answer student questions about applications, deadlines, courses, and visa processes.

${studentContext}
Context: ${context || 'general'}
Conversation History:
${conversationHistory}

User Question: ${message}

Provide a helpful, concise response. If the question is too complex or requires personalized counselor advice, indicate that a counselor should help.

Also identify:
1. Intent of the query
2. Confidence level (0-100)
3. Whether escalation to counselor is needed
4. Suggested next steps

Return as JSON with: response, intent, confidence, needs_escalation, escalation_reason.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          intent: { type: "string" },
          confidence: { type: "number" },
          needs_escalation: { type: "boolean" },
          escalation_reason: { type: "string" }
        }
      }
    });

    // Store user message
    await base44.entities.ChatbotMessage.create({
      conversation_id,
      role: 'user',
      message,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence
    });

    // Store bot response
    await base44.entities.ChatbotMessage.create({
      conversation_id,
      role: 'bot',
      message: aiResponse.response
    });

    // Handle escalation if needed
    if (aiResponse.needs_escalation) {
      await base44.entities.ChatbotConversation.update(conversation_id, {
        status: 'escalated',
        escalation_reason: aiResponse.escalation_reason,
        escalated_at: new Date().toISOString()
      });
    }

    return Response.json({
      response: aiResponse.response,
      needs_escalation: aiResponse.needs_escalation,
      escalation_reason: aiResponse.escalation_reason
    });

  } catch (error) {
    console.error('Error generating chatbot response:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});