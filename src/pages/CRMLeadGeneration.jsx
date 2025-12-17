import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Plus, Facebook, Globe, Phone, Mail, User, 
  TrendingUp, Target, Users, Filter, Download
} from 'lucide-react';
import { format } from 'date-fns';

export default function CRMLeadGeneration() {
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const queryClient = useQueryClient();

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    country_of_interest: '',
    degree_level: '',
    field_of_study: '',
    message: '',
    source: 'manual',
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['all-leads'],
    queryFn: () => base44.entities.Inquiry.list('-created_date', 100),
  });

  const createLeadMutation = useMutation({
    mutationFn: (data) => base44.entities.Inquiry.create({
      ...data,
      status: 'new',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-leads'] });
      setAddLeadOpen(false);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        country_of_interest: '',
        degree_level: '',
        field_of_study: '',
        message: '',
        source: 'manual',
      });
      toast.success('Lead added successfully');
    },
  });

  const filteredLeads = leads.filter(lead => {
    const statusMatch = filterStatus === 'all' || lead.status === filterStatus;
    const sourceMatch = filterSource === 'all' || lead.source === filterSource;
    return statusMatch && sourceMatch;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const sourceColors = {
    facebook: 'bg-blue-100 text-blue-700',
    website: 'bg-emerald-100 text-emerald-700',
    manual: 'bg-purple-100 text-purple-700',
    referral: 'bg-amber-100 text-amber-700',
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    converted: 'bg-emerald-100 text-emerald-700',
    not_interested: 'bg-slate-100 text-slate-700',
  };

  return (
    <CRMLayout currentPage="Lead Generation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lead Generation</h1>
            <p className="text-slate-600">Manage and track all incoming leads</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Leads
            </Button>
            <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead Manually
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={newLead.name}
                      onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                      placeholder="John Doe"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      placeholder="john@example.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                      placeholder="+1234567890"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Lead Source *</Label>
                    <Select value={newLead.source} onValueChange={(v) => setNewLead({...newLead, source: v})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="website">Website Form</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Country of Interest</Label>
                    <Input
                      value={newLead.country_of_interest}
                      onChange={(e) => setNewLead({...newLead, country_of_interest: e.target.value})}
                      placeholder="United Kingdom"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Degree Level</Label>
                    <Select value={newLead.degree_level} onValueChange={(v) => setNewLead({...newLead, degree_level: v})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's</SelectItem>
                        <SelectItem value="master">Master's</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="foundation">Foundation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={newLead.field_of_study}
                      onChange={(e) => setNewLead({...newLead, field_of_study: e.target.value})}
                      placeholder="Business, Engineering, etc."
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newLead.message}
                      onChange={(e) => setNewLead({...newLead, message: e.target.value})}
                      placeholder="Additional information..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => createLeadMutation.mutate(newLead)}
                  disabled={!newLead.name || !newLead.email || createLeadMutation.isPending}
                  className="w-full mt-4"
                >
                  Add Lead
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Leads</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">New Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Contacted</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.contacted}</p>
                </div>
                <Phone className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Converted</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.converted}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facebook Integration Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Facebook className="w-5 h-5" />
              Facebook Lead Ads Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-4">
              Connect your Facebook Lead Ads to automatically import leads into the CRM. 
              Leads will appear here with source "facebook" automatically.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Facebook className="w-4 h-4 mr-2" />
              Connect Facebook
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Interest</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Source</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{lead.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <div>{lead.country_of_interest || '-'}</div>
                          <div className="text-xs text-slate-500">{lead.degree_level || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={sourceColors[lead.source] || 'bg-slate-100 text-slate-700'}>
                            {lead.source}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {format(new Date(lead.created_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}