import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, student_id, document_id } = await req.json();

    // Define the JSON schema for CV parsing
    const cvSchema = {
      type: "object",
      properties: {
        full_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        date_of_birth: { type: "string" },
        address: { type: "string" },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              degree: { type: "string" },
              institution: { type: "string" },
              year: { type: "string" },
              gpa: { type: "string" }
            }
          }
        },
        work_experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              position: { type: "string" },
              duration: { type: "string" },
              description: { type: "string" }
            }
          }
        },
        skills: {
          type: "array",
          items: { type: "string" }
        },
        certifications: {
          type: "array",
          items: { type: "string" }
        },
        languages: {
          type: "array",
          items: { type: "string" }
        }
      }
    };

    // Extract CV data using AI
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: cvSchema
    });

    if (extractResult.status === 'error') {
      return Response.json({ 
        error: 'CV parsing failed', 
        details: extractResult.details 
      }, { status: 400 });
    }

    const parsedData = extractResult.output;

    // Analyze missing fields and requirements using AI
    const analysisPrompt = `
Analyze this CV data and provide:
1. List of critical missing fields for a student application
2. Whether an SOP (Statement of Purpose) is required and why
3. Profile completeness score (0-100)
4. Specific recommendations for improvement

CV Data: ${JSON.stringify(parsedData, null, 2)}

Return as JSON.
    `;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          missing_fields: {
            type: "array",
            items: { type: "string" }
          },
          sop_required: { type: "boolean" },
          sop_reason: { type: "string" },
          completeness_score: { type: "number" },
          recommendations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Create CVParsedData record
    const cvParsedData = await base44.asServiceRole.entities.CVParsedData.create({
      student_id,
      document_id,
      parsed_data: parsedData,
      missing_fields: analysis.missing_fields,
      sop_required: analysis.sop_required,
      sop_reason: analysis.sop_reason,
      completeness_score: analysis.completeness_score,
      ai_recommendations: analysis.recommendations,
      parsing_status: 'success'
    });

    // Update student profile with parsed data if fields are empty
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const updates = {};
    
    if (!student.first_name && parsedData.full_name) {
      const nameParts = parsedData.full_name.split(' ');
      updates.first_name = nameParts[0];
      updates.last_name = nameParts.slice(1).join(' ');
    }
    if (!student.email && parsedData.email) updates.email = parsedData.email;
    if (!student.phone && parsedData.phone) updates.phone = parsedData.phone;

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.StudentProfile.update(student_id, updates);
    }

    // Auto-create tasks if missing critical info or SOP required
    if (analysis.missing_fields.length > 0 || analysis.sop_required) {
      const counselor = student.counselor_id || user.id;
      
      if (analysis.missing_fields.length > 0) {
        await base44.asServiceRole.entities.Task.create({
          title: `Collect Missing Information - ${student.first_name} ${student.last_name}`,
          description: `Missing fields: ${analysis.missing_fields.join(', ')}`,
          type: 'document_review',
          student_id,
          assigned_to: counselor,
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }

      if (analysis.sop_required) {
        await base44.asServiceRole.entities.Task.create({
          title: `Request SOP - ${student.first_name} ${student.last_name}`,
          description: `Reason: ${analysis.sop_reason}`,
          type: 'document_review',
          student_id,
          assigned_to: counselor,
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    }

    return Response.json({
      success: true,
      parsed_data: cvParsedData,
      tasks_created: analysis.missing_fields.length > 0 || analysis.sop_required
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});