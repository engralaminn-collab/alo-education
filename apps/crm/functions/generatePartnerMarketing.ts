import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id, material_type, target_country, program, testimonials } = await req.json();

    // Get partner info
    const staffRoles = await base44.entities.StaffRole.filter({ partner_organization_id: partner_id });
    const partnerInfo = staffRoles[0] || {};

    // Get success stories summary
    const testimonialSummary = testimonials?.length > 0
      ? testimonials.map(t => `${t.student_name} got ${t.outcome}`).join('. ')
      : 'Our students have successfully enrolled in top universities worldwide';

    let prompt = '';
    let jsonSchema = {};

    if (material_type === 'social_post') {
      prompt = `
Create an engaging social media post for promoting study abroad in ${target_country}${program ? ` for ${program}` : ''}.

Success stories context: ${testimonialSummary}

Make it:
- Attention-grabbing and conversational
- Include a call-to-action
- Use emojis appropriately
- Professional yet approachable
- Include relevant hashtags

Return JSON with: content (main post text), hashtags (string of hashtags)
`;
      jsonSchema = {
        type: "object",
        properties: {
          content: { type: "string" },
          hashtags: { type: "string" }
        }
      };
    } else if (material_type === 'email_template') {
      prompt = `
Create a professional email template for promoting study abroad opportunities in ${target_country}${program ? ` specifically for ${program}` : ''}.

Success stories: ${testimonialSummary}

Include:
- Compelling subject line
- Personalized greeting placeholder
- Benefits of studying in ${target_country}
- Clear call-to-action
- Professional sign-off

Return JSON with: subject (subject line), content (email body with [NAME] placeholder)
`;
      jsonSchema = {
        type: "object",
        properties: {
          subject: { type: "string" },
          content: { type: "string" }
        }
      };
    } else if (material_type === 'brochure') {
      prompt = `
Create compelling brochure content sections for studying in ${target_country}${program ? ` for ${program}` : ''}.

Student success: ${testimonialSummary}

Create 4-5 sections with catchy titles and informative content covering:
- Why ${target_country}
- Program highlights
- Student success stories
- Application process
- Contact CTA

Return JSON with: sections (array of {title, content})
`;
      jsonSchema = {
        type: "object",
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" }
              }
            }
          }
        }
      };
    }

    // Add tips generation to all prompts
    prompt += `\n\nAlso provide 3 marketing tips for using this content effectively.
Add tips field to JSON: tips (array of strings)`;
    
    jsonSchema.properties.tips = {
      type: "array",
      items: { type: "string" }
    };

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: jsonSchema
    });

    return Response.json({
      success: true,
      ...aiResponse
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});