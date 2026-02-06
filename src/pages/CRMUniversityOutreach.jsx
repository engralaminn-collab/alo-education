import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CRMLayout from '@/components/crm/CRMLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, CheckCircle, Clock, Search } from 'lucide-react';
import UniversityOutreachGenerator from '@/components/crm/UniversityOutreachGenerator';
import MeetingScheduler from '@/components/crm/MeetingScheduler';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CRMUniversityOutreach() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: outreach = [] } = useQuery({
    queryKey: ['outreach'],
    queryFn: () => base44.entities.UniversityOutreach.list('-sent_date', 100)
  });

  const filteredStudents = students.filter(s =>
    (s.first_name?.toLowerCase() + ' ' + s.last_name?.toLowerCase()).includes(searchTerm.toLowerCase())
  );

  const filteredOutreach = outreach.filter(o => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const statusConfig = {
    sent: { icon: Mail, color: 'bg-blue-100 text-blue-800', label: 'Sent' },
    responded: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Responded' },
    follow_up_needed: { icon: Clock, color: 'bg-amber-100 text-amber-800', label: 'Follow-up Needed' }
  };

  return (
    <CRMLayout title="University Outreach" currentPageName="CRMUniversityOutreach">
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Outreach Campaigns</TabsTrigger>
          <TabsTrigger value="meetings">Scheduled Meetings</TabsTrigger>
          <TabsTrigger value="history">Outreach History</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Outreach Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Student Search */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">
                    Select Student
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {searchTerm && (
                    <div className="mt-2 space-y-1 border rounded-lg max-h-48 overflow-y-auto">
                      {filteredStudents.map(student => (
                        <button
                          key={student.id}
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchTerm('');
                          }}
                          className="w-full text-left p-3 hover:bg-slate-100 transition-colors"
                        >
                          <p className="font-medium text-slate-900">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Student */}
                {selectedStudent && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-education-blue">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                        <p className="text-sm text-slate-600">{selectedStudent.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedStudent(null)}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {/* Outreach Generator */}
                {selectedStudent && (
                  <UniversityOutreachGenerator
                    studentId={selectedStudent.id}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ['outreach'] });
                      setSelectedStudent(null);
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Meeting or Campus Tour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Student Search for Meetings */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">
                    Select Student
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {searchTerm && (
                    <div className="mt-2 space-y-1 border rounded-lg max-h-48 overflow-y-auto">
                      {filteredStudents.map(student => (
                        <button
                          key={student.id}
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchTerm('');
                          }}
                          className="w-full text-left p-3 hover:bg-slate-100 transition-colors"
                        >
                          <p className="font-medium text-slate-900">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedStudent && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-education-blue">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                        <p className="text-sm text-slate-600">{selectedStudent.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedStudent(null)}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {selectedStudent && (
                  <MeetingScheduler
                    studentId={selectedStudent.id}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ['appointments'] });
                      setSelectedStudent(null);
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Outreach Records */}
          <div className="space-y-4">
            {filteredOutreach.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-12">
                <p className="text-slate-500">No outreach records found</p>
              </Card>
            ) : (
              filteredOutreach.map(outreachRecord => {
                const config = statusConfig[outreachRecord.status] || statusConfig.sent;
                const Icon = config.icon;
                return (
                  <Card key={outreachRecord.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{outreachRecord.email_subject}</p>
                            <p className="text-sm text-slate-600">To: {outreachRecord.university_id}</p>
                          </div>
                          <Badge className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{outreachRecord.email_body}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Sent: {new Date(outreachRecord.sent_date).toLocaleDateString()}</span>
                          {outreachRecord.response_received && (
                            <span>Responded: {new Date(outreachRecord.response_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}