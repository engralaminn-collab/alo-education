import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Parse incoming lead data from external AI marking app
    const leadData = await req.json();

    // Create inquiry from external lead
    const inquiry = await base44.asServiceRole.entities.Inquiry.create({
      name: leadData.name || leadData.full_name || 'Unknown',
      email: leadData.email,
      phone: leadData.phone || leadData.mobile || '',
      whatsapp_number: leadData.whatsapp || leadData.phone || '',
      country_of_interest: leadData.country || leadData.destination || '',
      degree_level: leadData.degree_level || leadData.level || '',
      field_of_study: leadData.field_of_study || leadData.program || '',
      message: leadData.message || leadData.notes || `Lead from external AI marking app: ${leadData.source || 'Unknown source'}`,
      source: 'External AI Marking App',
      status: 'new',
      priority: leadData.priority || 'medium',
      budget: leadData.budget || '',
      intake_preference: leadData.intake || '',
      // Store original data for reference
      notes: `External Lead Data: ${JSON.stringify(leadData)}`
    });

    // Auto-assign lead if counselor mapping exists
    if (leadData.assigned_counselor_email) {
      const counselor = await base44.asServiceRole.entities.User.filter({ 
        email: leadData.assigned_counselor_email 
      });
      if (counselor.length > 0) {
        await base44.asServiceRole.entities.Inquiry.update(inquiry.id, {
          assigned_to: counselor[0].id
        });
      }
    }

    // Auto-qualify lead
    await base44.functions.invoke('qualifyLead', { inquiry_id: inquiry.id });

    return Response.json({
      success: true,
      inquiry_id: inquiry.id,
      message: 'Lead received and created in CRM'
    });

  } catch (error) {
    console.error('Error processing external lead:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});