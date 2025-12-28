import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, Filter, MoreVertical, Mail, Phone, 
  MapPin, Calendar, User, FileText, MessageSquare,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';
import AIStudentInsights from '@/components/crm/AIStudentInsights';

const statusConfig = {
  new_lead: { color: 'bg-blue-100 text-blue-700', label: 'New Lead' },
  contacted: { color: 'bg-amber-100 text-amber-700', label: 'Contacted' },
  qualified: { color: 'bg-purple-100 text-purple-700', label: 'Qualified' },
  in_progress: { color: 'bg-cyan-100 text-cyan-700', label: 'In Progress' },
  applied: { color: 'bg-indigo-100 text-indigo-700', label: 'Applied' },
  enrolled: { color: 'bg-emerald-100 text-emerald-700', label: 'Enrolled' },
  lost: { color: 'bg-slate-100 text-slate-500', label: 'Lost' },
};

export default function CRMStudents() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['crm-students'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date'),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['all-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['all-documents'],
    queryFn: () => base44.entities.Document.list(),
  });

  const updateStudent = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StudentProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-students'] });
      toast.success('Student updated');
    },
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / perPage);
  const paginatedStudents = filteredStudents.slice((page - 1) * perPage, page * perPage);

  return (
    <CRMLayout 
      title="Students"
      actions={
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          Export CSV
        </Button>
      }
    >
      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search students..."
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
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Counselor</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
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
              ) : paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((student) => {
                  const status = statusConfig[student.status] || statusConfig.new_lead;
                  const counselor = counselors.find(c => c.id === student.counselor_id);
                  
                  return (
                    <TableRow 
                      key={student.id} 
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                            {student.first_name?.charAt(0) || student.email?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-sm text-slate-500">{student.nationality}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-slate-600">{student.email}</p>
                          <p className="text-slate-400">{student.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {counselor ? (
                          <span className="text-sm text-slate-600">{counselor.name}</span>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-200">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500 capitalize">
                          {student.source?.replace(/_/g, ' ') || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500">
                          {student.created_date && format(new Date(student.created_date), 'MMM d, yyyy')}
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}>
                              <User className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              View Applications
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStudent.mutate({ id: student.id, data: { status: 'lost' } });
                              }}
                            >
                              Mark as Lost
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredStudents.length)} of {filteredStudents.length}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm px-3">Page {page} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStudent.first_name?.charAt(0) || selectedStudent.email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <Badge className={statusConfig[selectedStudent.status]?.color}>
                    {statusConfig[selectedStudent.status]?.label}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedStudent.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{selectedStudent.nationality || '-'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500">Assign Counselor</label>
                    <Select 
                      value={selectedStudent.counselor_id || ''} 
                      onValueChange={(v) => {
                        updateStudent.mutate({ 
                          id: selectedStudent.id, 
                          data: { counselor_id: v } 
                        });
                        setSelectedStudent({ ...selectedStudent, counselor_id: v });
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select counselor" />
                      </SelectTrigger>
                      <SelectContent>
                        {counselors.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Update Status</label>
                    <Select 
                      value={selectedStudent.status} 
                      onValueChange={(v) => {
                        updateStudent.mutate({ 
                          id: selectedStudent.id, 
                          data: { status: v } 
                        });
                        setSelectedStudent({ ...selectedStudent, status: v });
                      }}
                    >
                      <SelectTrigger className="mt-1">
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
              </div>

              {selectedStudent.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedStudent.notes}</p>
                </div>
              )}

              <AIStudentInsights 
                student={selectedStudent}
                applications={applications}
                documents={documents}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}