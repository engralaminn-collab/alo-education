import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Phone, Mail, MessageSquare, UserPlus } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';

export default function CRMLeads() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const { data: leads = [] } = useQuery({
    queryKey: ['all-leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 500),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-leads'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-leads'],
    queryFn: () => base44.entities.University.list(),
  });

  const updateLeadStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Lead.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-leads']);
      toast.success('Lead status updated');
    },
  });

  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !search ||
      lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-purple-100 text-purple-800',
    profile_collected: 'bg-indigo-100 text-indigo-800',
    eligible_shortlisted: 'bg-cyan-100 text-cyan-800',
    documents_requested: 'bg-yellow-100 text-yellow-800',
    application_submitted: 'bg-emerald-100 text-emerald-800',
    offer_received: 'bg-green-100 text-green-800',
    closed_won: 'bg-green-500 text-white',
    closed_lost: 'bg-red-100 text-red-800',
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-600',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leads Management</h1>
            <p className="text-slate-600 mt-1">Track and manage all student leads from Course Finder</p>
          </div>
          <Button style={{ backgroundColor: '#F37021', color: '#000000' }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Manual Lead
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Total Leads</p>
              <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                {leads.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">New</p>
              <p className="text-3xl font-bold text-blue-600">
                {leads.filter(l => l.status === 'new').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                {leads.filter(l => ['contacted', 'profile_collected', 'eligible_shortlisted', 'documents_requested'].includes(l.status)).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Converted</p>
              <p className="text-3xl font-bold text-green-600">
                {leads.filter(l => l.status === 'closed_won').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="profile_collected">Profile Collected</SelectItem>
                  <SelectItem value="eligible_shortlisted">Eligible Shortlisted</SelectItem>
                  <SelectItem value="application_submitted">Application Submitted</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="course_finder_apply">Course Finder Apply</SelectItem>
                  <SelectItem value="course_finder_whatsapp">Course Finder WhatsApp</SelectItem>
                  <SelectItem value="landing_page_form">Landing Page</SelectItem>
                  <SelectItem value="manual_import">Manual Import</SelectItem>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => {
                      const course = courseMap[lead.course_id];
                      const university = universityMap[lead.university_id];
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-mono text-xs">{lead.lead_code}</TableCell>
                          <TableCell className="font-medium">{lead.full_name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-slate-600">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                              <div className="flex items-center gap-1 text-slate-600">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{course?.course_title || 'N/A'}</div>
                              <div className="text-slate-500">{university?.university_name || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lead.status}
                              onValueChange={(status) => updateLeadStatus.mutate({ id: lead.id, status })}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="profile_collected">Profile Collected</SelectItem>
                                <SelectItem value="eligible_shortlisted">Eligible</SelectItem>
                                <SelectItem value="application_submitted">Application Submitted</SelectItem>
                                <SelectItem value="closed_won">Closed Won</SelectItem>
                                <SelectItem value="closed_lost">Closed Lost</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[lead.priority] || 'bg-slate-100'}>
                              {lead.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-slate-600">
                              {lead.source?.replace(/_/g, ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {format(new Date(lead.created_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}