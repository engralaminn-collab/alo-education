import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, TrendingUp, Users, Mail, CheckCircle, 
  AlertCircle, Phone, MessageSquare, Calendar, Flame
} from 'lucide-react';
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';
import LeadScoringEngine from '@/components/marketing/LeadScoringEngine';
import AutomatedFollowUp from '@/components/marketing/AutomatedFollowUp';
import LeadCapture from '@/components/marketing/LeadCapture';

export default function CRMMarketing() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: leads = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => base44.entities.Inquiry.list('-created_date'),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['lead-activities'],
    queryFn: () => base44.entities.LeadActivity.list('-created_date'),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.MarketingCampaign.list('-created_date'),
  });

  const newLeads = leads.filter(l => l.status === 'new');
  const contactedLeads = leads.filter(l => l.status === 'contacted');
  const convertedLeads = leads.filter(l => l.status === 'converted');
  
  const hotLeads = leads.filter(l => l.notes?.includes('Priority: HOT'));
  const warmLeads = leads.filter(l => l.notes?.includes('Priority: WARM'));

  const conversionRate = leads.length > 0 ? ((convertedLeads.length / leads.length) * 100).toFixed(1) : 0;

  const assignCounselor = useMutation({
    mutationFn: async ({ leadId, counselorId }) => {
      await base44.entities.Inquiry.update(leadId, {
        assigned_to: counselorId,
        status: 'contacted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Counselor assigned!');
    }
  });

  const getLeadPriority = (lead) => {
    if (lead.notes?.includes('Priority: HOT')) return { label: 'HOT', color: 'bg-red-100 text-red-700' };
    if (lead.notes?.includes('Priority: WARM')) return { label: 'WARM', color: 'bg-orange-100 text-orange-700' };
    if (lead.notes?.includes('Priority: COLD')) return { label: 'COLD', color: 'bg-blue-100 text-blue-700' };
    return null;
  };

  return (
    <CRMLayout title="Marketing & Leads">
      {/* Stats Dashboard */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Leads</p>
                <p className="text-3xl font-bold text-blue-600">{leads.length}</p>
              </div>
              <Target className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Hot Leads</p>
                <p className="text-3xl font-bold text-red-600">{hotLeads.length}</p>
              </div>
              <Flame className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">New Leads</p>
                <p className="text-3xl font-bold text-amber-600">{newLeads.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Converted</p>
                <p className="text-3xl font-bold text-green-600">{convertedLeads.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{conversionRate}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Leads ({leads.length})</TabsTrigger>
              <TabsTrigger value="hot">Hot ({hotLeads.length})</TabsTrigger>
              <TabsTrigger value="new">New ({newLeads.length})</TabsTrigger>
              <TabsTrigger value="contacted">Contacted ({contactedLeads.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6 space-y-3">
              {leads.map(lead => {
                const priority = getLeadPriority(lead);
                const leadActivities = activities.filter(a => a.inquiry_id === lead.id);

                return (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{lead.name}</h4>
                            {priority && (
                              <Badge className={priority.color}>
                                <Flame className="w-3 h-3 mr-1" />
                                {priority.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700">
                            {lead.country_of_interest} • {lead.degree_level} • {lead.field_of_study}
                          </p>
                          {lead.message && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{lead.message}</p>
                          )}
                        </div>
                        <Badge className={
                          lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                          lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {lead.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(lead.created_date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {leadActivities.length} activities
                          </span>
                        </div>
                        <span className="text-slate-400">Source: {lead.source || 'unknown'}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="hot" className="mt-6 space-y-3">
              {hotLeads.length === 0 ? (
                <div className="text-center py-12">
                  <Flame className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No hot leads yet. Run lead scoring to identify them.</p>
                </div>
              ) : (
                hotLeads.map(lead => (
                  <Card key={lead.id} className="border-2 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Flame className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{lead.name}</h4>
                          <p className="text-sm text-slate-600 mb-2">
                            {lead.email} • {lead.country_of_interest}
                          </p>
                          <p className="text-xs text-red-600">
                            {lead.notes?.split('\n')[2] || 'High priority lead'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-6 space-y-3">
              {newLeads.map(lead => (
                <Card key={lead.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-1">{lead.name}</h4>
                    <p className="text-sm text-slate-600 mb-2">{lead.email}</p>
                    <p className="text-xs text-slate-500">
                      Created {format(new Date(lead.created_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="contacted" className="mt-6 space-y-3">
              {contactedLeads.map(lead => (
                <Card key={lead.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-1">{lead.name}</h4>
                    <p className="text-sm text-slate-600">{lead.email}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <LeadScoringEngine leads={leads} />
          <AutomatedFollowUp leads={leads} />
          <LeadCapture source="crm_manual" />
        </div>
      </div>
    </CRMLayout>
  );
}