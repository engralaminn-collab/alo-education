import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Search, MoreVertical, FileText, Building2, 
  Calendar, DollarSign, CheckCircle, Clock, XCircle,
  GraduationCap, User, Send, Mail, Plane
} from 'lucide-react';
import MilestoneTracker from '@/components/applications/MilestoneTracker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';

const statusConfig = {
  draft: { color: 'bg-slate-100 text-slate-700', label: 'Draft' },
  documents_pending: { color: 'bg-amber-100 text-amber-700', label: 'Docs Pending' },
  under_review: { color: 'bg-blue-100 text-blue-700', label: 'Under Review' },
  submitted_to_university: { color: 'bg-purple-100 text-purple-700', label: 'Submitted' },
  conditional_offer: { color: 'bg-emerald-100 text-emerald-700', label: 'Conditional Offer' },
  unconditional_offer: { color: 'bg-green-100 text-green-700', label: 'Unconditional' },
  visa_processing: { color: 'bg-cyan-100 text-cyan-700', label: 'Visa Processing' },
  enrolled: { color: 'bg-emerald-500 text-white', label: 'Enrolled' },
  rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
  withdrawn: { color: 'bg-slate-100 text-slate-500', label: 'Withdrawn' },
};

export default function CRMApplications() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['crm-applications'],
    queryFn: () => base44.entities.Application.list('-created_date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['crm-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['crm-universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['crm-courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const studentMap = students.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const updateApplication = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Application.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-applications'] });
      toast.success('Application updated');
    },
  });

  const filteredApplications = applications.filter(app => {
    const student = studentMap[app.student_id];
    const course = courseMap[app.course_id];
    const university = universityMap[app.university_id];
    
    const matchesSearch = 
      student?.email?.toLowerCase().includes(search.toLowerCase()) ||
      student?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      course?.name?.toLowerCase().includes(search.toLowerCase()) ||
      university?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const activeCount = applications.filter(a => 
    !['enrolled', 'rejected', 'withdrawn'].includes(a.status)
  ).length;
  const offersCount = applications.filter(a => 
    ['conditional_offer', 'unconditional_offer'].includes(a.status)
  ).length;
  const enrolledCount = applications.filter(a => a.status === 'enrolled').length;

  return (
    <CRMLayout 
      title="Applications"
      actions={
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          Create Application
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Offers</p>
            <p className="text-2xl font-bold text-emerald-600">{offersCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Enrolled</p>
            <p className="text-2xl font-bold text-green-600">{enrolledCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-slate-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => {
                  const student = studentMap[app.student_id];
                  const course = courseMap[app.course_id];
                  const university = universityMap[app.university_id];
                  const status = statusConfig[app.status] || statusConfig.draft;
                  
                  return (
                    <TableRow 
                      key={app.id} 
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedApp(app)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                            {student?.first_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-xs text-slate-500">{student?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900 truncate max-w-[200px]">
                          {course?.name || '-'}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{course?.degree_level}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">{university?.name || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{app.intake || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500">
                          {app.applied_date && format(new Date(app.applied_date), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              updateApplication.mutate({ 
                                id: app.id, 
                                data: { status: 'under_review' } 
                              });
                            }}>
                              Move to Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-4">
                {/* Milestone Tracker */}
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-4">Application Milestones</h4>
                  <MilestoneTracker application={selectedApp} variant="vertical" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Student</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {studentMap[selectedApp.student_id]?.first_name} {studentMap[selectedApp.student_id]?.last_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {studentMap[selectedApp.student_id]?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Status</h4>
                    <Select 
                      value={selectedApp.status} 
                      onValueChange={(v) => {
                        updateApplication.mutate({ id: selectedApp.id, data: { status: v } });
                        setSelectedApp({ ...selectedApp, status: v });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Course</h4>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-slate-400" />
                      <span>{courseMap[selectedApp.course_id]?.name || '-'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">University</h4>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      <span>{universityMap[selectedApp.university_id]?.name || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Intake</h4>
                    <Input 
                      value={selectedApp.intake || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, intake: e.target.value })}
                      placeholder="e.g. September 2025"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Tuition Fee</h4>
                    <Input 
                      type="number"
                      value={selectedApp.tuition_fee || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, tuition_fee: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Scholarship</h4>
                    <Input 
                      type="number"
                      value={selectedApp.scholarship_amount || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, scholarship_amount: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Update Milestones</h4>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                      {['documents_submitted', 'application_submitted', 'offer_received', 'visa_applied', 'visa_approved', 'enrolled'].map(key => {
                        const milestone = selectedApp.milestones?.[key] || {};
                        const labels = {
                          documents_submitted: 'Documents Submitted',
                          application_submitted: 'Application Submitted',
                          offer_received: 'Offer Received',
                          visa_applied: 'Visa Applied',
                          visa_approved: 'Visa Approved',
                          enrolled: 'Enrolled'
                        };
                        
                        return (
                          <div key={key} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                            <input
                              type="checkbox"
                              checked={milestone.completed || false}
                              onChange={(e) => {
                                const newMilestones = { 
                                  ...selectedApp.milestones,
                                  [key]: {
                                    ...milestone,
                                    completed: e.target.checked,
                                    date: e.target.checked ? new Date().toISOString() : milestone.date
                                  }
                                };
                                setSelectedApp({ ...selectedApp, milestones: newMilestones });
                              }}
                              className="w-5 h-5 rounded border-slate-300 text-emerald-500 cursor-pointer"
                            />
                            <label className="text-sm font-medium flex-1 cursor-pointer">
                              {labels[key]}
                            </label>
                            {milestone.completed && milestone.date && (
                              <span className="text-xs text-slate-400">
                                {format(new Date(milestone.date), 'MMM d')}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Counselor Notes</h4>
                    <Textarea 
                      rows={4}
                      value={selectedApp.counselor_notes || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, counselor_notes: e.target.value })}
                      placeholder="Add notes..."
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                updateApplication.mutate({
                  id: selectedApp.id,
                  data: {
                    status: selectedApp.status,
                    intake: selectedApp.intake,
                    tuition_fee: selectedApp.tuition_fee,
                    scholarship_amount: selectedApp.scholarship_amount,
                    counselor_notes: selectedApp.counselor_notes,
                    milestones: selectedApp.milestones,
                  }
                });
                setSelectedApp(null);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}