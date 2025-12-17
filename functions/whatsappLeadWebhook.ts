import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    
    // WhatsApp webhook verification (GET request)
    if (req.method === 'GET') {
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');
        
        const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
        
        if (mode === 'subscribe' && token === verifyToken) {
            return new Response(challenge, { status: 200 });
        }
        
        return new Response('Verification failed', { status: 403 });
    }
    
    // Handle incoming WhatsApp messages (POST request)
    if (req.method === 'POST') {
        try {
            const body = await req.json();
            
            // WhatsApp sends messages in this format
            if (body.object === 'whatsapp_business_account' && body.entry) {
                for (const entry of body.entry) {
                    if (entry.changes) {
                        for (const change of entry.changes) {
                            if (change.value?.messages) {
                                for (const message of change.value.messages) {
                                    const from = message.from; // Phone number
                                    const messageText = message.text?.body || '';
                                    const contactName = change.value.contacts?.[0]?.profile?.name || 'WhatsApp Lead';
                                    
                                    // Check if this is a new conversation/lead
                                    const existingInquiries = await base44.asServiceRole.entities.Inquiry.filter({
                                        phone: from,
                                        source: 'WhatsApp'
                                    });
                                    
                                    // Only create inquiry if this is a new lead
                                    if (existingInquiries.length === 0) {
                                        await base44.asServiceRole.entities.Inquiry.create({
                                            name: contactName,
                                            email: '',
                                            phone: from,
                                            country_of_interest: '',
                                            degree_level: '',
                                            field_of_study: '',
                                            message: messageText,
                                            source: 'WhatsApp',
                                            status: 'new',
                                            notes: `First message received via WhatsApp`
                                        });
                                    } else {
                                        // Update existing inquiry with new message
                                        const inquiry = existingInquiries[0];
                                        await base44.asServiceRole.entities.Inquiry.update(inquiry.id, {
                                            notes: `${inquiry.notes || ''}\n[${new Date().toISOString()}] New message: ${messageText}`,
                                            status: inquiry.status === 'not_interested' ? 'new' : inquiry.status
                                        });
                                    }
                                    
                                    // Optional: Send auto-reply
                                    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
                                    const phoneNumberId = change.value.metadata.phone_number_id;
                                    
                                    await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${accessToken}`,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            messaging_product: 'whatsapp',
                                            to: from,
                                            text: {
                                                body: 'Thank you for contacting ALO Education! A counselor will be in touch with you shortly. 🎓'
                                            }
                                        })
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            return Response.json({ success: true });
        } catch (error) {
            console.error('WhatsApp webhook error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    }
    
    return new Response('Method not allowed', { status: 405 });
});