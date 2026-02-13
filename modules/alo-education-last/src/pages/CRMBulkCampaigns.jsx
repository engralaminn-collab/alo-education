import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Send, Users, Filter, Mail, MessageSquare, Loader2, 
  CheckCircle, AlertCircle, Plus, Eye
} from 'lucide-react';
import { toast } from 'sonner';

export default function CRMBulkCampaigns() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState({});
  const [previewStudents, setPreviewStudents] = useState([]);
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: 'email',
    subject: '',
    message: '',
    filter_criteria: {},
  });

  const { data: students = [] } = useQuery({
    queryKey: ['crm-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['bulk-campaigns'],
    queryFn: () => base44.entities.BulkCampaign?.list() || [],
  });

  // Filter students based on criteria
  const filterStudents = (criteria) => {
    let filtered = students;

    if (criteria.status) {
      filtered = filtered.filter(s => s.status === criteria.status);
    }
    if (criteria.country) {
      filtered = filtered.filter(s => 
        s.preferred_countries?.includes(criteria.country)
      );
    }
    if (criteria.degreeLevel) {
      filtered = filtered.filter(s => 
        s.preferred_degree_level === criteria.degreeLevel
      );
    }
    if (criteria.profileCompleteness) {
      const min = criteria.profileCompleteness;
      filtered = filtered.filter(s => 
        (s.profile_completeness || 0) >= min
      );
    }

    return filtered;
  };

  const previewSegment = () => {
    const filtered = filterStudents(selectedSegment);
    setPreviewStudents(filtered);
  };

  const createCampaign = useMutation({
    mutationFn: async (campaign) => {
      const targetStudents = filterStudents(campaign.filter_criteria);
      
      // Create campaign record
      const newCampaign = await base44.entities.BulkCampaign.create({
        ...campaign,
        target_count: targetStudents.length,
        sent_count: 0,
        status: 'scheduled',
      });

      // Send via backend function
      const result = await base44.functions.invoke('sendBulkCampaign', {
        campaign_id: newCampaign.id,
        type: campaign.type,
        subject: campaign.subject,
        message: campaign.message,
        recipients: targetStudents.map(s => ({
          id: s.id,
          email: s.email,
          phone: s.phone,
          name: `${s.first_name} ${s.last_name}`,
        })),
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-campaigns'] });
      toast.success('Campaign created successfully');
      setShowCreateDialog(false);
      setCampaignData({
        name: '',
        type: 'email',
        subject: '',
        message: '',
        filter_criteria: {},
      });
      setSelectedSegment({});
    },
    onError: () => {
      toast.error('Failed to create campaign');
    },
  });

  const handleSegmentChange = (field, value) => {
    setSelectedSegment({ ...selectedSegment, [field]: value });
  };

  const handleSubmit = () => {
    if (!campaignData.name || !campaignData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const targetCount = filterStudents(selectedSegment).length;
    if (targetCount === 0) {
      toast.error('No students match the selected criteria');
      return;
    }

    createCampaign.mutate({
      ...campaignData,
      filter_criteria: selectedSegment,
    });
  };

  const targetCount = filterStudents(selectedSegment).length;

  return (
    <CRMLayout title="Bulk Campaigns" currentPage="CRMBulkCampaigns">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Campaign Management</h2>
            <p className="text-slate-600">Send targeted emails and SMS to student segments</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Campaigns Sent</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Emails</p>
                  <p className="text-2xl font-bold">
                    {campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">SMS Sent</p>
                  <p className="text-2xl font-bold">
                    {campaigns.filter(c => c.type === 'sms').reduce((sum, c) => sum + (c.sent_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No campaigns yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.slice(0, 10).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                        <Badge variant={campaign.type === 'email' ? 'default' : 'secondary'}>
                          {campaign.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {campaign.sent_count || 0} / {campaign.target_count || 0} sent
                      </p>
                    </div>
                    <Badge className={
                      campaign.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Campaign Info */}
              <div className="space-y-4">
                <div>
                  <Label>Campaign Name *</Label>
                  <Input
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    placeholder="e.g., UK Applications Reminder"
                  />
                </div>

                <div>
                  <Label>Campaign Type *</Label>
                  <Select 
                    value={campaignData.type} 
                    onValueChange={(value) => setCampaignData({ ...campaignData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {campaignData.type === 'email' && (
                  <div>
                    <Label>Email Subject *</Label>
                    <Input
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                      placeholder="Subject line"
                    />
                  </div>
                )}

                <div>
                  <Label>Message *</Label>
                  <Textarea
                    value={campaignData.message}
                    onChange={(e) => setCampaignData({ ...campaignData, message: e.target.value })}
                    placeholder="Your message to students..."
                    rows={6}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use placeholders: {'{{first_name}}'}, {'{{last_name}}'}, {'{{preferred_countries}}'}
                  </p>
                </div>
              </div>

              {/* Audience Segmentation */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Target Audience
                </h3>

                <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <Label>Student Status</Label>
                    <Select 
                      value={selectedSegment.status || 'all'} 
                      onValueChange={(value) => handleSegmentChange('status', value === 'all' ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="new_lead">New Leads</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Preferred Country</Label>
                    <Select 
                      value={selectedSegment.country || 'all'} 
                      onValueChange={(value) => handleSegmentChange('country', value === 'all' ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Degree Level</Label>
                    <Select 
                      value={selectedSegment.degreeLevel || 'all'} 
                      onValueChange={(value) => handleSegmentChange('degreeLevel', value === 'all' ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="bachelor">Bachelor's</SelectItem>
                        <SelectItem value="master">Master's</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-900">
                        Target: {targetCount} students
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={previewSegment}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview Students */}
              {previewStudents.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <h4 className="font-medium text-slate-900 mb-3">Preview Recipients</h4>
                  <div className="space-y-2">
                    {previewStudents.slice(0, 10).map((student) => (
                      <div key={student.id} className="text-sm text-slate-600">
                        {student.first_name} {student.last_name} - {student.email}
                      </div>
                    ))}
                    {previewStudents.length > 10 && (
                      <p className="text-sm text-slate-500 italic">
                        + {previewStudents.length - 10} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createCampaign.isPending || targetCount === 0}
                >
                  {createCampaign.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}