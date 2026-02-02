import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadCapture({ source = 'manual', campaignId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country_of_interest: '',
    degree_level: '',
    field_of_study: '',
    message: '',
    source: source
  });

  const createLead = useMutation({
    mutationFn: async (data) => {
      const lead = await base44.entities.Inquiry.create({
        ...data,
        status: 'new'
      });

      await base44.entities.LeadActivity.create({
        inquiry_id: lead.id,
        activity_type: 'form_submitted',
        description: 'Initial inquiry form submitted',
        metadata: { campaign_id: campaignId }
      });

      if (campaignId) {
        const campaign = await base44.entities.MarketingCampaign.get(campaignId);
        await base44.entities.MarketingCampaign.update(campaignId, {
          leads_generated: (campaign.leads_generated || 0) + 1
        });
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Lead captured successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        country_of_interest: '',
        degree_level: '',
        field_of_study: '',
        message: '',
        source: source
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to capture lead: ' + error.message);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          New Lead Capture
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); createLead.mutate(formData); }} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Country of Interest</Label>
              <Select value={formData.country_of_interest} onValueChange={(v) => setFormData({...formData, country_of_interest: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Degree Level</Label>
              <Select value={formData.degree_level} onValueChange={(v) => setFormData({...formData, degree_level: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Field of Study</Label>
              <Input
                value={formData.field_of_study}
                onChange={(e) => setFormData({...formData, field_of_study: e.target.value})}
                placeholder="e.g., Computer Science"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Tell us about your study plans..."
              rows={3}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            disabled={createLead.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {createLead.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Capturing Lead...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Capture Lead
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}