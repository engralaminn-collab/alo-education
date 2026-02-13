import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ExternalAppIntegration() {
  const [copied, setCopied] = useState(false);

  const webhookUrl = `${window.location.origin}/api/functions/receiveExternalLead`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Webhook URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePayload = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    whatsapp: "+1234567890",
    country: "USA",
    degree_level: "Postgraduate",
    field_of_study: "Computer Science",
    message: "Interested in Masters program",
    priority: "high",
    budget: "20000-30000",
    intake: "September 2026",
    source: "AI Marking App"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-600" />
            External AI Marking App Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600">Active</Badge>
            <span className="text-sm text-slate-600">
              Ready to receive leads from your AI marking app
            </span>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-2 block">
              Webhook URL
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Configure this URL in your AI marking app to send leads automatically
            </p>
            <div className="flex gap-2">
              <Input 
                value={webhookUrl} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(webhookUrl)}
                variant="outline"
                className="gap-2"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                Copy
              </Button>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Setup Instructions</h4>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Copy the webhook URL above</li>
              <li>2. Go to your AI marking app settings/integrations</li>
              <li>3. Add a new webhook and paste the URL</li>
              <li>4. Set the request method to <strong>POST</strong></li>
              <li>5. Configure the payload format (see below)</li>
              <li>6. Test the integration by sending a sample lead</li>
            </ol>
          </div>

          {/* Expected Payload Format */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Expected JSON Payload Format</h4>
            <p className="text-xs text-slate-600 mb-3">
              Your AI marking app should send lead data in this format:
            </p>
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>

          {/* Field Mapping */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Field Mapping</h4>
            <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-600">name or full_name →</span>
                <span className="font-medium">Student Name</span>
                
                <span className="text-slate-600">email →</span>
                <span className="font-medium">Email (Required)</span>
                
                <span className="text-slate-600">phone or mobile →</span>
                <span className="font-medium">Phone Number</span>
                
                <span className="text-slate-600">country or destination →</span>
                <span className="font-medium">Preferred Country</span>
                
                <span className="text-slate-600">degree_level or level →</span>
                <span className="font-medium">Degree Level</span>
                
                <span className="text-slate-600">field_of_study or program →</span>
                <span className="font-medium">Field of Study</span>
              </div>
            </div>
          </div>

          {/* Auto Features */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Automatic Features</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>✓ Leads automatically created as inquiries</li>
              <li>✓ AI qualification scoring applied</li>
              <li>✓ Auto-assignment to counselors (if configured)</li>
              <li>✓ SLA monitoring starts immediately</li>
              <li>✓ Lead nurturing campaigns triggered</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}