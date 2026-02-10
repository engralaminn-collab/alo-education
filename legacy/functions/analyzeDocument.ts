import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { document_id } = await req.json();

    // Fetch document
    const document = await base44.asServiceRole.entities.Document.get(document_id);

    // AI Document Analysis using LLM with file context
    const analysisPrompt = `
You are an expert document verification AI for education consulting. Analyze this document and provide detailed insights.

Document Type: ${document.document_type}
Document Name: ${document.name}
Current Status: ${document.status}

Analyze and determine:
1. Document category/subcategory (be specific, e.g., "Academic Transcript - Undergraduate")
2. Relevant tags (e.g., "English", "2020-2024", "CGPA 3.5")
3. Validity status (official, unofficial, expired, missing elements)
4. Detected issues (missing signatures, watermarks, dates, seals)
5. Confidence score (0-100) for authenticity
6. Required actions for counselor

Return structured JSON with detailed findings.
    `;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: [document.file_url],
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string" },
          subcategory: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          validity: {
            type: "string",
            enum: ["official", "unofficial", "expired", "incomplete", "suspicious"]
          },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                severity: { type: "string", enum: ["critical", "high", "medium", "low"] }
              }
            }
          },
          confidence_score: { type: "number" },
          required_actions: {
            type: "array",
            items: { type: "string" }
          },
          extracted_info: {
            type: "object",
            properties: {
              institution: { type: "string" },
              date_range: { type: "string" },
              grade_gpa: { type: "string" }
            }
          }
        }
      }
    });

    // Update document with AI analysis
    const needsReview = aiAnalysis.issues.some(i => i.severity === 'critical' || i.severity === 'high') 
                      || aiAnalysis.confidence_score < 70 
                      || aiAnalysis.validity !== 'official';

    await base44.asServiceRole.entities.Document.update(document_id, {
      status: needsReview ? 'pending' : 'approved',
      reviewer_notes: JSON.stringify({
        ai_analysis: aiAnalysis,
        analyzed_at: new Date().toISOString(),
        needs_counselor_review: needsReview
      })
    });

    // Create task if critical issues found
    if (needsReview && document.student_id) {
      const student = await base44.asServiceRole.entities.StudentProfile.get(document.student_id);
      
      if (student.counselor_id) {
        await base44.asServiceRole.entities.Task.create({
          title: `Review ${document.document_type}: ${document.name}`,
          description: `AI detected issues: ${aiAnalysis.issues.map(i => i.issue).join('; ')}`,
          type: 'document_review',
          student_id: document.student_id,
          assigned_to: student.counselor_id,
          status: 'pending',
          priority: aiAnalysis.issues.some(i => i.severity === 'critical') ? 'urgent' : 'high',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    }

    return Response.json({
      success: true,
      analysis: aiAnalysis,
      needs_review: needsReview
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});