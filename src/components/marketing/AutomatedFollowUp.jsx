import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomatedFollowUp({ leads }) {
  const queryClient = useQueryClient();
  const [followUpType, setFollowUpType] = useState('new_leads');

  const generateFollowUps = useMutation({
    mutationFn: async () => {
      let targetLeads = [];

      if (followUpType === 'new_leads') {
        targetLeads = leads.filter(l => l.status === 'new' && 
          (Date.now() - new Date(l.created_date).getTime()) / (1000 * 60 * 60) > 24
        );
      } else if (followUpType === 'contacted_no_response') {
        targetLeads = leads.filter(l => l.status === 'contacted' && 
          (Date.now() - new Date(l.updated_date).getTime()) / (1000 * 60 * 60 * 24) > 3
        );
      }

      const emailsSent = [];

      for (const lead of targetLeads.slice(0, 20)) {
        const prompt = `Create a follow-up email for ${lead.name} who showed interest in studying ${lead.degree_level} in ${lead.country_of_interest || 'abroad'}.

Original inquiry: "${lead.message}"

Follow-up type: ${followUpType === 'new_leads' ? 'Initial follow-up (first contact)' : 'Re-engagement (no response to first contact)'}

Email should:
1. Be warm and personalized
2. Reference their specific interests
3. Offer value (guide, consultation, webinar)
4. Include a clear call-to-action
5. Keep it concise and engaging

Return JSON with subject and body.`;

        const emailContent = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          }
        });

        await base44.integrations.Core.SendEmail({
          to: lead.email,
          from_name: 'ALO Education',
          subject: emailContent.subject,
          body: emailContent.body
        });

        await base44.entities.Inquiry.update(lead.id, {
          status: 'contacted',
          notes: `Auto follow-up sent: ${new Date().toISOString()}\n\n${lead.notes || ''}`
        });

        await base44.entities.LeadActivity.create({
          inquiry_id: lead.id,
          activity_type: 'email_sent',
          description: `Automated follow-up: ${emailContent.subject}`
        });

        emailsSent.push(lead);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return emailsSent.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success(`Sent ${count} automated follow-up emails!`);
    },
    onError: (error) => {
      toast.error('Follow-up automation failed: ' + error.message);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          Automated Follow-Ups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Follow-up Scenario</Label>
          <Select value={followUpType} onValueChange={setFollowUpType}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_leads">New Leads (24h+ no contact)</SelectItem>
              <SelectItem value="contacted_no_response">Contacted (3d+ no response)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => generateFollowUps.mutate()}
          disabled={generateFollowUps.isPending}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {generateFollowUps.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Follow-ups...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send Automated Follow-Ups
            </>
          )}
        </Button>

        <p className="text-xs text-slate-600">
          AI generates personalized follow-up emails based on lead behavior and timing.
        </p>
      </CardContent>
    </Card>
  );
}