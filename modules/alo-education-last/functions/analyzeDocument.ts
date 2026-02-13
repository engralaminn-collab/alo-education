import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, file_url } = await req.json();

    const document = await base44.entities.Document.get(document_id);

    // Extract and analyze document
    const prompt = `Analyze this document and provide a comprehensive review:

Document Type: ${document.document_type || 'Unknown'}
File Name: ${document.file_name}

Analyze for:
1. Correct document category
2. Completeness (0-100)
3. Correctness/Quality (0-100)
4. Key information extraction
5. Issues found
6. Improvement suggestions
7. Whether it requires counselor review

Extract key data based on document type (e.g., for transcripts: grades, institution; for SOP: key points; for CV: experience, education)

Return as JSON.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          document_category: { type: "string" },
          completeness_score: { type: "number" },
          correctness_score: { type: "number" },
          extracted_data: { 
            type: "object",
            additionalProperties: true
          },
          issues_found: {
            type: "array",
            items: { type: "string" }
          },
          suggestions: {
            type: "array",
            items: { type: "string" }
          },
          requires_counselor_review: { type: "boolean" },
          review_summary: { type: "string" }
        }
      }
    });

    // Store review
    const review = await base44.entities.DocumentReview.create({
      document_id,
      student_id: document.student_id,
      document_type: analysis.document_category,
      ai_category: analysis.document_category,
      completeness_score: analysis.completeness_score,
      correctness_score: analysis.correctness_score,
      extracted_data: analysis.extracted_data,
      issues_found: analysis.issues_found,
      suggestions: analysis.suggestions,
      requires_counselor_review: analysis.requires_counselor_review
    });

    return Response.json({
      review,
      analysis,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});