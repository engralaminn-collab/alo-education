import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { partner_email, password } = await req.json();

    if (!partner_email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Fetch partner by email
    const partners = await base44.asServiceRole.entities.UniversityPartner.filter({
      partner_email: partner_email
    });

    if (partners.length === 0) {
      return Response.json({ error: 'Partner not found' }, { status: 401 });
    }

    const partner = partners[0];

    // In production, use proper bcrypt verification
    // For now, simple validation
    if (partner.password_hash !== password) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!partner.is_active || !partner.verified) {
      return Response.json({ error: 'Partner account not active' }, { status: 403 });
    }

    // Update last login
    await base44.asServiceRole.entities.UniversityPartner.update(partner.id, {
      last_login: new Date().toISOString()
    });

    // Fetch university details
    const university = await base44.asServiceRole.entities.University.get(partner.university_id);

    return Response.json({
      success: true,
      partner: {
        id: partner.id,
        partner_name: partner.partner_name,
        partner_email: partner.partner_email,
        role: partner.role,
        university_id: partner.university_id,
        university_name: university?.university_name,
      },
      token: `partner_${partner.id}_${Date.now()}` // Simple token
    });
  } catch (error) {
    console.error('Partner login error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});