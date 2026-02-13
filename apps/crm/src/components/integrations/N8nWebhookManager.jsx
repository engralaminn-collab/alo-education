import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Webhook } from 'lucide-react';
import { toast } from 'sonner';

export default function N8nWebhookManager() {
  const [copied, setCopied] = useState({});

  const webhookEndpoints = [
    {
      name: 'WhatsApp Lead Receiver',
      endpoint: '/functions/receiveWhatsAppLead',
      method: 'POST',
      description: 'Receives leads from WhatsApp',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+8801712345678',
        whatsapp_number: '+8801712345678',
        message: 'I want to study in Canada',
        country_of_interest: 'Canada',
        degree_level: 'Undergraduate'
      }
    },
    {
      name: 'Facebook Lead Receiver',
      endpoint: '/functions/receiveFacebookLead',
      method: 'POST',
      description: 'Receives leads from Facebook',
      payload: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+8801812345678',
        message: 'Interested in UK universities',
        country: 'UK',
        degree_level: 'Postgraduate'
      }
    },
    {
      name: 'Create Student',
      endpoint: '/functions/createStudentFromWebhook',
      method: 'POST',
      description: 'Creates student profile from n8n',
      payload: {
        first_name: 'Ahmed',
        last_name: 'Rahman',
        email: 'ahmed@example.com',
        phone: '+8801912345678',
        nationality: 'Bangladesh',
        preferred_countries: ['USA', 'Canada'],
        source: 'n8n Automation'
      }
    },
    {
      name: 'Update Lead Status',
      endpoint: '/functions/updateLeadFromWebhook',
      method: 'POST',
      description: 'Updates inquiry or student status',
      payload: {
        inquiry_id: 'INQUIRY_ID_HERE',
        status: 'contacted',
        notes: 'Updated via n8n automation'
      }
    },
    {
      name: 'Book Appointment',
      endpoint: '/functions/bookAppointmentFromWebhook',
      method: 'POST',
      description: 'Books counseling appointment',
      payload: {
        student_id: 'STUDENT_ID_HERE',
        counselor_id: 'COUNSELOR_ID_HERE',
        scheduled_date: '2026-02-15T10:00:00Z',
        meeting_link: 'https://zoom.us/j/123456789'
      }
    }
  ];

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied({ ...copied, [id]: false }), 2000);
  };

  const baseUrl = window.location.origin;

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-purple-600" />
            n8n Webhook Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-orange-900">
              <strong>Important:</strong> Add your webhook secret to Settings → Environment Variables:<br/>
              <code className="bg-orange-100 px-2 py-1 rounded mt-1 inline-block">WEBHOOK_SECRET=your_secret_key</code>
            </p>
          </div>

          <div className="space-y-4">
            {webhookEndpoints.map((webhook, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{webhook.name}</h3>
                      <p className="text-sm text-slate-600">{webhook.description}</p>
                    </div>
                    <Badge>{webhook.method}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Webhook URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={`${baseUrl}${webhook.endpoint}`}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(`${baseUrl}${webhook.endpoint}`, `url-${idx}`)}
                        >
                          {copied[`url-${idx}`] ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Example Payload</Label>
                      <div className="flex gap-2 mt-1">
                        <textarea
                          value={JSON.stringify(webhook.payload, null, 2)}
                          readOnly
                          className="w-full p-2 border rounded font-mono text-xs bg-slate-50"
                          rows={6}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(JSON.stringify(webhook.payload, null, 2), `payload-${idx}`)}
                        >
                          {copied[`payload-${idx}`] ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded text-xs">
                      <strong className="text-blue-900">Headers Required:</strong>
                      <pre className="mt-1 text-blue-800">x-webhook-secret: YOUR_SECRET_KEY</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}