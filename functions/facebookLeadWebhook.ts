import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    
    // Facebook webhook verification (GET request)
    if (req.method === 'GET') {
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');
        
        const verifyToken = Deno.env.get('FACEBOOK_VERIFY_TOKEN');
        
        if (mode === 'subscribe' && token === verifyToken) {
            return new Response(challenge, { status: 200 });
        }
        
        return new Response('Verification failed', { status: 403 });
    }
    
    // Handle incoming lead data (POST request)
    if (req.method === 'POST') {
        try {
            const body = await req.json();
            
            // Facebook sends lead data in this format
            if (body.object === 'page' && body.entry) {
                for (const entry of body.entry) {
                    if (entry.changes) {
                        for (const change of entry.changes) {
                            if (change.field === 'leadgen' && change.value.leadgen_id) {
                                const leadgenId = change.value.leadgen_id;
                                
                                // Fetch lead details from Facebook Graph API
                                const accessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');
                                const leadResponse = await fetch(
                                    `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${accessToken}`
                                );
                                const leadData = await leadResponse.json();
                                
                                // Parse field data
                                const fieldData = {};
                                if (leadData.field_data) {
                                    leadData.field_data.forEach(field => {
                                        fieldData[field.name] = field.values[0];
                                    });
                                }
                                
                                // Create inquiry in CRM
                                await base44.asServiceRole.entities.Inquiry.create({
                                    name: fieldData.full_name || fieldData.name || 'Facebook Lead',
                                    email: fieldData.email || '',
                                    phone: fieldData.phone_number || fieldData.phone || '',
                                    country_of_interest: fieldData.country || '',
                                    degree_level: fieldData.degree_level || '',
                                    field_of_study: fieldData.field_of_study || '',
                                    message: fieldData.message || 'Lead from Facebook',
                                    source: 'Facebook Lead Ads',
                                    status: 'new',
                                    notes: `Lead ID: ${leadgenId}, Form: ${leadData.form_id || 'N/A'}`
                                });
                            }
                        }
                    }
                }
            }
            
            return Response.json({ success: true });
        } catch (error) {
            console.error('Facebook webhook error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    }
    
    return new Response('Method not allowed', { status: 405 });
});