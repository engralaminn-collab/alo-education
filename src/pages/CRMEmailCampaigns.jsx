import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Mail, Send, BarChart3, Users } from 'lucide-react';
import EmailCampaignBuilder from '@/components/crm/EmailCampaignBuilder';
import CampaignPerformance from '@/components/crm/CampaignPerformance';

export default function CRMEmailCampaigns() {
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Mock campaigns data - in real app, would be from database
  const campaigns = [
    {
      id: '1',
      name: 'UK High Score Follow-up',
      subject: 'Your Study in UK Journey Awaits',
      status: 'sent',
      scheduled_date: '2025-01-15',
      recipients: 150,
      opens: 89,
      clicks: 34,
      conversions: 8,
      segment: { destination: 'United Kingdom', lead_score_min: 60 }
    },
    {
      id: '2',
      name: 'New Lead Welcome Series',
      subject: 'Welcome to ALO Education',
      status: 'scheduled',
      scheduled_date: '2025-01-20',
      recipients: 200,
      segment: { status: 'new_lead' }
    },
    {
      id: '3',
      name: 'Application Deadline Reminder',
      subject: 'Don\'t Miss Your Application Deadline',
      status: 'draft',
      recipients: 0,
      segment: { status: 'qualified' }
    }
  ];

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800',
    scheduled: 'bg-blue-100 text-blue-800',
    sending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Email Campaigns</h1>
            <p className="text-slate-600 mt-1">Create and manage personalized email campaigns</p>
          </div>
          <Button onClick={() => setShowBuilder(true)} style={{ backgroundColor: '#F37021', color: '#000000' }}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Campaigns</p>
                  <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                    {campaigns.length}
                  </p>
                </div>
                <Mail className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Recipients</p>
                  <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                    {campaigns.reduce((sum, c) => sum + (c.recipients || 0), 0)}
                  </p>
                </div>
                <Users className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Open Rate</p>
                  <p className="text-3xl font-bold text-green-600">
                    {campaigns.filter(c => c.opens).length > 0 
                      ? ((campaigns.reduce((sum, c) => sum + (c.opens || 0), 0) / 
                          campaigns.reduce((sum, c) => sum + (c.recipients || 1), 0)) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Conversions</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)}
                  </p>
                </div>
                <Send className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showBuilder && (
          <EmailCampaignBuilder
            onClose={() => setShowBuilder(false)}
            campaign={selectedCampaign}
          />
        )}

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{campaign.subject}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <span>Recipients: {campaign.recipients}</span>
                        {campaign.opens && <span>Opens: {campaign.opens} ({((campaign.opens / campaign.recipients) * 100).toFixed(1)}%)</span>}
                        {campaign.clicks && <span>Clicks: {campaign.clicks}</span>}
                        {campaign.conversions && <span>Conversions: {campaign.conversions}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === 'sent' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Stats
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowBuilder(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="scheduled">
            {campaigns.filter(c => c.status === 'scheduled').map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{campaign.name}</h3>
                      <p className="text-sm text-slate-600">Scheduled: {campaign.scheduled_date}</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="sent">
            {campaigns.filter(c => c.status === 'sent').map((campaign) => (
              <CampaignPerformance key={campaign.id} campaign={campaign} />
            ))}
          </TabsContent>

          <TabsContent value="draft">
            {campaigns.filter(c => c.status === 'draft').map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{campaign.name}</h3>
                      <p className="text-sm text-slate-600">{campaign.subject}</p>
                    </div>
                    <Button variant="outline" size="sm">Continue Editing</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {selectedCampaign && selectedCampaign.status === 'sent' && !showBuilder && (
          <CampaignPerformance 
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
          />
        )}
      </div>
    </CRMLayout>
  );
}