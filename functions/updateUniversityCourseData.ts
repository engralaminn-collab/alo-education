import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const updateLog = {
      started_at: new Date().toISOString(),
      universities_updated: 0,
      courses_updated: 0,
      errors: []
    };

    // Get all universities
    const universities = await base44.asServiceRole.entities.University.list();
    
    for (const uni of universities) {
      try {
        // Use AI to fetch latest university information
        const prompt = `Get the latest information for ${uni.university_name} in ${uni.country}. 
        Return JSON with: ranking, qs_ranking, times_ranking, student_population, international_students_percent, acceptance_rate, intakes, scholarships_summary, entry_requirements_summary.
        Only include data you're confident about, use null for uncertain fields.`;
        
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              ranking: { type: ["number", "null"] },
              qs_ranking: { type: ["number", "null"] },
              times_ranking: { type: ["number", "null"] },
              student_population: { type: ["number", "null"] },
              international_students_percent: { type: ["number", "null"] },
              acceptance_rate: { type: ["number", "null"] },
              intakes: { type: ["string", "null"] },
              scholarships_summary: { type: ["string", "null"] },
              entry_requirements_summary: { type: ["string", "null"] }
            }
          }
        });

        // Update university with new data (only non-null fields)
        const updateData = {};
        Object.keys(response).forEach(key => {
          if (response[key] !== null && response[key] !== undefined) {
            updateData[key] = response[key];
          }
        });
        
        if (Object.keys(updateData).length > 0) {
          updateData.last_data_update = new Date().toISOString();
          await base44.asServiceRole.entities.University.update(uni.id, updateData);
          updateLog.universities_updated++;
        }

      } catch (error) {
        updateLog.errors.push({
          university: uni.university_name,
          error: error.message
        });
      }

      // Rate limiting - wait 2 seconds between updates
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Get all courses
    const courses = await base44.asServiceRole.entities.Course.list();
    
    for (const course of courses) {
      try {
        const uni = universities.find(u => u.id === course.university_id);
        if (!uni) continue;

        // Use AI to fetch latest course information
        const prompt = `Get the latest information for the course "${course.course_title}" at ${uni.university_name}.
        Return JSON with: tuition_fee_min, tuition_fee_max, duration, intake, ielts_overall, ielts_min_each, entry_requirements, scholarship_available.
        Only include data you're confident about, use null for uncertain fields.`;
        
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              tuition_fee_min: { type: ["number", "null"] },
              tuition_fee_max: { type: ["number", "null"] },
              duration: { type: ["string", "null"] },
              intake: { type: ["string", "null"] },
              ielts_overall: { type: ["number", "null"] },
              ielts_min_each: { type: ["number", "null"] },
              entry_requirements: { type: ["string", "null"] },
              scholarship_available: { type: ["boolean", "null"] }
            }
          }
        });

        // Update course with new data (only non-null fields)
        const updateData = {};
        Object.keys(response).forEach(key => {
          if (response[key] !== null && response[key] !== undefined) {
            updateData[key] = response[key];
          }
        });
        
        if (Object.keys(updateData).length > 0) {
          updateData.last_data_update = new Date().toISOString();
          await base44.asServiceRole.entities.Course.update(course.id, updateData);
          updateLog.courses_updated++;
        }

      } catch (error) {
        updateLog.errors.push({
          course: course.course_title,
          error: error.message
        });
      }

      // Rate limiting - wait 2 seconds between updates
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    updateLog.completed_at = new Date().toISOString();
    updateLog.status = 'completed';

    // Log the update
    await base44.asServiceRole.entities.DataUpdateLog.create(updateLog);

    return Response.json({
      success: true,
      message: 'Data update completed',
      summary: {
        universities_updated: updateLog.universities_updated,
        courses_updated: updateLog.courses_updated,
        errors_count: updateLog.errors.length
      },
      log: updateLog
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});