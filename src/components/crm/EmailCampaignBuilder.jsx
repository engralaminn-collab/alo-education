import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Save, Send, Users } from 'lucide-react';

export default function EmailCampaignBuilder({ onClose, campaign }) {
  const [formData, setFormData] = useState(campaign || {
    name: '',
    subject: '',
    preview_text: '',
    content: '',
    segment: {
      destination: 'all',
      study_level: 'all',
      lead_source: 'all',
      status: 'all',
      lead_score_min: 0
    },
    scheduled_date: '',
    status: 'draft'
  });

  const handleSave = () => {
    toast.success('Campaign saved as draft');
    onClose();
  };

  const handleSchedule = () => {
    toast.success('Campaign scheduled successfully');
    onClose();
  };

  const handleSendNow = () => {
    toast.success('Campaign sent successfully');
    onClose();
  };

  // Calculate estimated recipients
  const estimatedRecipients = 150; // Mock calculation

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" style={{ color: '#0066CC' }} />
            {campaign ? 'Edit Campaign' : 'Create Email Campaign'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="segment">Audience</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label>Campaign Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., UK Application Deadline Reminder"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Email Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="e.g., Don't Miss Your UK Application Deadline"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Preview Text</Label>
              <Input
                value={formData.preview_text}
                onChange={(e) => setFormData({...formData, preview_text: e.target.value})}
                placeholder="Text shown in email preview"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Email Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Write your email content... Use {{first_name}}, {{destination}}, {{study_level}} for personalization"
                rows={12}
                className="mt-2 font-mono text-sm"
              />
              <p className="text-xs text-slate-600 mt-2">
                Available variables: {'{'}{'{'}}first_name{'}'}{'}'}, {'{'}{'{'}}last_name{'}'}{'}'}, {'{'}{'{'}}destination{'}'}{'}'}, {'{'}{'{'}}study_level{'}'}{'}'}, {'{'}{'{'}}counselor_name{'}'}{'}'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="segment" className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" style={{ color: '#0066CC' }} />
                <span className="font-semibold" style={{ color: '#0066CC' }}>Estimated Recipients: {estimatedRecipients}</span>
              </div>
              <p className="text-sm text-slate-600">Based on your selected criteria</p>
            </div>

            <div>
              <Label>Destination</Label>
              <Select 
                value={formData.segment.destination}
                onValueChange={(v) => setFormData({
                  ...formData, 
                  segment: {...formData.segment, destination: v}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Study Level</Label>
              <Select 
                value={formData.segment.study_level}
                onValueChange={(v) => setFormData({
                  ...formData, 
                  segment: {...formData.segment, study_level: v}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lead Source</Label>
              <Select 
                value={formData.segment.lead_source}
                onValueChange={(v) => setFormData({
                  ...formData, 
                  segment: {...formData.segment, lead_source: v}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Student Status</Label>
              <Select 
                value={formData.segment.status}
                onValueChange={(v) => setFormData({
                  ...formData, 
                  segment: {...formData.segment, status: v}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new_lead">New Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Minimum Lead Score</Label>
              <Input
                type="number"
                value={formData.segment.lead_score_min}
                onChange={(e) => setFormData({
                  ...formData, 
                  segment: {...formData.segment, lead_score_min: parseInt(e.target.value)}
                })}
                placeholder="0"
                className="mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div>
              <Label>Send Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                className="mt-2"
              />
              <p className="text-sm text-slate-600 mt-2">Leave empty to send immediately</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Campaign Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Campaign Name:</span>
                  <span className="font-medium">{formData.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Subject:</span>
                  <span className="font-medium">{formData.subject || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Recipients:</span>
                  <span className="font-medium">{estimatedRecipients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Scheduled:</span>
                  <span className="font-medium">{formData.scheduled_date || 'Send Now'}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          {formData.scheduled_date ? (
            <Button onClick={handleSchedule} style={{ backgroundColor: '#0066CC', color: 'white' }}>
              Schedule Campaign
            </Button>
          ) : (
            <Button onClick={handleSendNow} style={{ backgroundColor: '#F37021', color: '#000000' }}>
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}