import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { course_id, run_for_all } = await req.json();

    // Fetch courses
    const courses = run_for_all 
      ? await base44.asServiceRole.entities.Course.list('-created_date', 500)
      : [await base44.asServiceRole.entities.Course.get(course_id)];

    const categorized = [];

    for (const course of courses) {
      // AI categorization based on course details
      const categorizationPrompt = `
Analyze this course and provide detailed categorization:

Course Title: ${course.course_title}
Subject Area: ${course.subject_area || 'Not specified'}
Level: ${course.level}
Overview: ${course.overview || 'No overview available'}
Entry Requirements: ${course.entry_requirements || 'Not specified'}

Provide:
1. Primary subject category (e.g., Business, Engineering, Computer Science, Medicine, etc.)
2. Subcategories (up to 3)
3. Difficulty level (Beginner, Intermediate, Advanced, Expert)
4. Career paths this course prepares for
5. Prerequisites (inferred from entry requirements)
6. Skills gained
7. Industry focus
8. Study mode suitability (Full-time, Part-time, Online, Hybrid)
`;

      const aiCategories = await base44.integrations.Core.InvokeLLM({
        prompt: categorizationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            primary_category: { type: "string" },
            subcategories: {
              type: "array",
              items: { type: "string" }
            },
            difficulty_level: { 
              type: "string", 
              enum: ["Beginner", "Intermediate", "Advanced", "Expert"] 
            },
            career_paths: {
              type: "array",
              items: { type: "string" }
            },
            prerequisites: {
              type: "array",
              items: { type: "string" }
            },
            skills_gained: {
              type: "array",
              items: { type: "string" }
            },
            industry_focus: { type: "string" },
            study_modes: {
              type: "array",
              items: { type: "string" }
            },
            recommended_for_profiles: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Update course with AI categories
      const updatedCourse = await base44.asServiceRole.entities.Course.update(course.id, {
        ai_categories: aiCategories,
        subject_area: aiCategories.primary_category
      });

      categorized.push({
        course_id: course.id,
        course_title: course.course_title,
        categories: aiCategories
      });
    }

    return Response.json({
      success: true,
      categorized_count: categorized.length,
      courses: categorized
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});