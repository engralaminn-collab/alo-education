import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, course_ids } = await req.json();

    // Fetch student and their applications
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });
    
    // Fetch the courses being checked
    const courses = await Promise.all(
      course_ids.map(id => base44.asServiceRole.entities.Course.get(id))
    );

    // Fetch courses from existing applications
    const appliedCourses = await Promise.all(
      applications
        .filter(app => app.course_id)
        .map(app => base44.asServiceRole.entities.Course.get(app.course_id))
    );

    // AI conflict detection
    const conflictPrompt = `
You are an expert academic advisor. Analyze these courses for conflicts, overlaps, and compatibility issues.

Student Profile:
- Academic Background: ${student.academic_background_summary || 'Not specified'}
- Work Experience: ${student.work_experience_years || 0} years
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}

Currently Applied Courses:
${appliedCourses.map(c => `
- ${c.course_title}
  Level: ${c.level}
  Subject: ${c.subject_area}
  Duration: ${c.duration}
  University: ${c.university_id}
  Overview: ${c.overview?.substring(0, 200) || 'No overview'}
`).join('\n') || 'None'}

New Courses Being Considered:
${courses.map(c => `
- ${c.course_title}
  Level: ${c.level}
  Subject: ${c.subject_area}
  Duration: ${c.duration}
  University: ${c.university_id}
  Entry Requirements: ${c.entry_requirements || 'Not specified'}
  Overview: ${c.overview?.substring(0, 200) || 'No overview'}
`).join('\n')}

Identify:
1. Direct conflicts (same subject, same level, same university)
2. Content overlaps (similar curriculum, redundant topics)
3. Scheduling conflicts (intake timing, duration overlap)
4. Progression conflicts (level mismatches, prerequisites issues)
5. Geographic conflicts (same location, visa complications)
6. Strategic concerns (too similar, portfolio diversity issues)
7. Complementary opportunities (courses that work well together)
`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: conflictPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          conflicts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                conflict_type: { 
                  type: "string",
                  enum: ["direct_conflict", "content_overlap", "scheduling", "progression", "geographic", "strategic"]
                },
                severity: { 
                  type: "string",
                  enum: ["critical", "high", "medium", "low"]
                },
                courses_involved: {
                  type: "array",
                  items: { type: "string" }
                },
                description: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          overlaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                courses: {
                  type: "array",
                  items: { type: "string" }
                },
                overlap_percentage: { type: "number" },
                overlapping_topics: {
                  type: "array",
                  items: { type: "string" }
                },
                recommendation: { type: "string" }
              }
            }
          },
          complementary_pairs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                courses: {
                  type: "array",
                  items: { type: "string" }
                },
                synergy_description: { type: "string" },
                combined_benefit: { type: "string" }
              }
            }
          },
          overall_assessment: { type: "string" },
          recommended_portfolio: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: aiAnalysis,
      courses_analyzed: courses.length,
      existing_applications: appliedCourses.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});