import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Send, CheckCircle, AlertCircle, Loader2, 
  Mail, MessageSquare, FileText, TrendingUp, Clock, Copy
} from 'lucide-react';
import { toast } from "sonner";

export default function N8nAutomation() {
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [testData, setTestData] = useState({});

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Get function endpoints
  const functionUrls = {
    lead_webhook: `${window.location.origin}/functions/n8nLeadWebhook`,
    application_webhook: `${window.location.origin}/functions/n8nApplicationWebhook`,
    document_reminder: `${window.location.origin}/functions/n8nDocumentReminder`,
    lead_scoring: `${window.location.origin}/functions/n8nLeadScoring`,
    daily_report: `${window.location.origin}/functions/dailyReport`,
    send_to_n8n: `${window.location.origin}/functions/sendToN8n`
  };

  const workflows = [
    {
      id: 'send_whatsapp',
      name: 'Send WhatsApp Message',
      icon: MessageSquare,
      color: 'bg-green-500',
      description: 'Send WhatsApp messages via Meta Cloud API'
    },
    {
      id: 'send_email',
      name: 'Send Email',
      icon: Mail,
      color: 'bg-blue-500',
      description: 'Send emails via Gmail SMTP'
    },
    {
      id: 'lead_scoring',
      name: 'Lead Scoring',
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: 'Calculate lead priority and score'
    },
    {
      id: 'document_reminder',
      name: 'Document Reminder',
      icon: FileText,
      color: 'bg-orange-500',
      description: 'Send reminders for missing documents'
    },
    {
      id: 'daily_report',
      name: 'Daily Report',
      icon: Clock,
      color: 'bg-indigo-500',
      description: 'Generate and send daily management report'
    }
  ];

  const triggerWorkflow = useMutation({
    mutationFn: async ({ workflow, data }) => {
      const response = await base44.functions.invoke('sendToN8n', { 
        workflow, 
        data 
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Workflow triggered successfully!');
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-slate-600">Only administrators can access automation settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">n8n Automation</h1>
          </div>
          <p className="text-slate-300">Integrate and manage workflow automations</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="webhooks">
          <TabsList className="mb-6">
            <TabsTrigger value="webhooks">Webhook Endpoints</TabsTrigger>
            <TabsTrigger value="triggers">Trigger Workflows</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Webhooks (n8n → Base44)</CardTitle>
                <CardDescription>
                  Use these endpoints in your n8n workflows to send data to Base44
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(functionUrls).map(([key, url]) => (
                  <div key={key} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(url)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <code className="text-xs bg-slate-900 text-green-400 p-2 rounded block overflow-x-auto">
                      {url}
                    </code>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Security Note</h4>
                  <p className="text-sm text-blue-800">
                    Set the <code className="bg-blue-100 px-2 py-0.5 rounded">N8N_WEBHOOK_SECRET</code> environment 
                    variable in your Base44 settings and include it as <code className="bg-blue-100 px-2 py-0.5 rounded">x-webhook-secret</code> header 
                    in your n8n HTTP requests.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="triggers" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {workflows.map((workflow) => {
                const Icon = workflow.icon;
                return (
                  <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 ${workflow.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle>{workflow.name}</CardTitle>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setSelectedWorkflow(workflow.id)}
                        className="w-full"
                        variant={selectedWorkflow === workflow.id ? "default" : "outline"}
                      >
                        Configure & Test
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedWorkflow && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Workflow: {workflows.find(w => w.id === selectedWorkflow)?.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Test Data (JSON)</Label>
                    <Textarea
                      rows={6}
                      placeholder='{"phone": "+880...", "message": "Test"}'
                      value={JSON.stringify(testData, null, 2)}
                      onChange={(e) => {
                        try {
                          setTestData(JSON.parse(e.target.value));
                        } catch {}
                      }}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => triggerWorkflow.mutate({ 
                      workflow: selectedWorkflow, 
                      data: testData 
                    })}
                    disabled={triggerWorkflow.isPending}
                    className="w-full"
                  >
                    {triggerWorkflow.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Trigger Workflow
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>n8n Setup Guide</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Step 1: Install n8n</h3>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
npm install -g n8n{'\n'}
n8n start
                </pre>

                <h3>Step 2: Create Webhooks in n8n</h3>
                <ol>
                  <li>Create a new workflow in n8n</li>
                  <li>Add a "Webhook" node</li>
                  <li>Set the HTTP Method to POST</li>
                  <li>Copy the webhook URL and save it as <code>N8N_WEBHOOK_URL</code> in Base44</li>
                </ol>

                <h3>Step 3: Configure Environment Variables</h3>
                <p>In Base44 Settings → Environment Variables, add:</p>
                <ul>
                  <li><code>N8N_WEBHOOK_URL</code> - Your n8n webhook base URL</li>
                  <li><code>N8N_WEBHOOK_SECRET</code> - Secret key for security</li>
                </ul>

                <h3>Step 4: Example Workflows</h3>
                
                <h4>WhatsApp Automation</h4>
                <ol>
                  <li>Webhook Trigger (receive from Base44)</li>
                  <li>Meta WhatsApp Business node</li>
                  <li>Send message to phone number from webhook data</li>
                </ol>

                <h4>Daily Report (CRON)</h4>
                <ol>
                  <li>Cron node (9:00 PM daily)</li>
                  <li>HTTP Request to <code>{functionUrls.daily_report}</code></li>
                  <li>Format report data</li>
                  <li>Send via Telegram/Email</li>
                </ol>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-yellow-900 font-semibold mb-2">Need Help?</h4>
                  <p className="text-yellow-800 text-sm">
                    Contact your system administrator for detailed n8n workflow templates and setup assistance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}