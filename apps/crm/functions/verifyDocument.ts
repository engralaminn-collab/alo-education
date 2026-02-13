import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { documentId } = body;

    if (!documentId) {
      return Response.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Fetch document
    const documents = await base44.asServiceRole.entities.Document.filter({ id: documentId });
    if (!documents.length) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = documents[0];

    // Fetch student profile for context
    const profiles = await base44.asServiceRole.entities.StudentProfile.filter({ id: document.student_id });
    const student = profiles[0];

    const prompt = `You are an expert document verifier for education applications. Analyze this document and flag any potential issues or inconsistencies.

Document Type: ${document.document_type}
Student Name: ${student?.first_name} ${student?.last_name}
Student Nationality: ${student?.nationality}
Student DOB: ${student?.date_of_birth || 'Not provided'}

Document URL: ${document.file_url}

Analyze the document for:
1. Authenticity concerns (if visible)
2. Quality issues (legibility, completeness)
3. Expiry dates (if applicable)
4. Name consistency with student profile
5. Date inconsistencies
6. Missing information
7. Format/requirement compliance

Provide:
- is_valid: boolean (true if no major issues)
- confidence_score: number (0-100)
- issues: array of specific issues found
- recommendations: array of specific recommendations
- summary: brief overall assessment
`;

    // Use LLM with image analysis if it's an image document
    const fileExtension = document.file_url?.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: isImage ? [document.file_url] : undefined,
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          is_valid: { type: 'boolean' },
          confidence_score: { type: 'number' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string' },
                issue: { type: 'string' }
              }
            }
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' }
          },
          summary: { type: 'string' }
        }
      }
    });

    // Log verification
    await base44.asServiceRole.entities.DocumentAccessLog.create({
      document_id: documentId,
      accessed_by: user.id,
      accessed_by_type: 'counselor',
      access_type: 'verify'
    });

    return Response.json({
      success: true,
      verification: response,
      document_type: document.document_type,
      student_name: `${student?.first_name} ${student?.last_name}`
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});