import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { document_id } = payload;

    if (!document_id) {
      return Response.json({ error: 'document_id required' }, { status: 400 });
    }

    const document = await base44.asServiceRole.entities.Document.get(document_id);
    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Use AI to analyze document
    const verificationPrompt = `Analyze this ${document.document_type} document for:
1. Readability and clarity
2. Completeness of required information
3. Authenticity indicators
4. Expiry dates (if applicable)
5. Any potential issues or red flags

Document type: ${document.document_type}
Document name: ${document.name}

Provide verification result in JSON format with:
{
  "is_valid": boolean,
  "confidence_score": number (0-100),
  "issues": array of strings,
  "recommendations": array of strings
}`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: verificationPrompt,
      file_urls: [document.file_url],
      response_json_schema: {
        type: "object",
        properties: {
          is_valid: { type: "boolean" },
          confidence_score: { type: "number" },
          issues: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Update document with AI verification
    const status = aiResponse.is_valid && aiResponse.confidence_score > 70 ? 'approved' : 'pending';
    const reviewerNotes = `AI Verification (Confidence: ${aiResponse.confidence_score}%)\n\nIssues: ${aiResponse.issues.join(', ') || 'None'}\n\nRecommendations: ${aiResponse.recommendations.join(', ') || 'None'}`;

    await base44.asServiceRole.entities.Document.update(document_id, {
      status,
      reviewer_notes: reviewerNotes,
      reviewed_by: 'AI System',
      reviewed_date: new Date().toISOString().split('T')[0]
    });

    return Response.json({ 
      success: true, 
      verification: aiResponse,
      status
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});