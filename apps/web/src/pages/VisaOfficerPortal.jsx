import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileCheck, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';

export default function VisaOfficerPortal() {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [visaNotes, setVisaNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['visa-stage-students'],
    queryFn: () => base44.entities.StudentProfile.filter({ 
      visa_status: { $in: ['pending', 'in_process'] }
    })
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-visa'],
    queryFn: () => base44.entities.Application.list()
  });

  const updateVisaStatus = useMutation({
    mutationFn: ({ id, status, notes }) => 
      base44.entities.StudentProfile.update(id, { 
        visa_status: status,
        notes: notes ? `${notes}\n\n---\n${visaNotes}` : visaNotes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visa-stage-students'] });
      toast.success('Visa status updated');
      setSelectedStudent(null);
      setVisaNotes('');
    }
  });

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
      in_process: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    return config[status] || config.pending;
  };

  return (
    <CRMLayout title="Visa Management">
      <Card className="border-0 shadow-sm dark:bg-slate-800 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-10 dark:bg-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => {
          const StatusIcon = getStatusBadge(student.visa_status).icon;
          const studentApplications = applications.filter(a => a.student_id === student.id);
          
          return (
            <Card 
              key={student.id} 
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer dark:bg-slate-800"
              onClick={() => setSelectedStudent(student)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base dark:text-white">
                      {student.first_name} {student.last_name}
                    </CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{student.email}</p>
                  </div>
                  <Badge className={getStatusBadge(student.visa_status).color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {student.visa_status || 'pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Applications</span>
                  <span className="font-medium dark:text-white">{studentApplications.length}</span>
                </div>
                {student.phone && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    📞 {student.phone}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Visa Management Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Visa Management</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <h3 className="font-semibold dark:text-white">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedStudent.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium dark:text-white">Update Visa Status</label>
                <Select 
                  defaultValue={selectedStudent.visa_status || 'pending'}
                  onValueChange={(v) => {
                    setSelectedStudent({ ...selectedStudent, visa_status: v });
                  }}
                >
                  <SelectTrigger className="mt-1 dark:bg-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_process">In Process</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium dark:text-white">Interview Notes / Comments</label>
                <Textarea
                  value={visaNotes}
                  onChange={(e) => setVisaNotes(e.target.value)}
                  placeholder="Add notes about visa interview, documents, or status..."
                  className="mt-1 dark:bg-slate-700"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedStudent(null)}
                  className="select-none dark:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateVisaStatus.mutate({
                    id: selectedStudent.id,
                    status: selectedStudent.visa_status,
                    notes: selectedStudent.notes
                  })}
                  className="bg-education-blue select-none"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}