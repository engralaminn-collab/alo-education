import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, UserCheck, ClipboardList, Calendar, AlertCircle } from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import SharedNotesPanel from '@/components/crm/SharedNotesPanel';
import StudentHandoverDialog from '@/components/crm/StudentHandoverDialog';
import CaseConferenceRoom from '@/components/crm/CaseConferenceRoom';
import TaskAssignment from '@/components/crm/TaskAssignment';
import { format } from 'date-fns';

export default function CRMCollaboration() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showHandoverDialog, setShowHandoverDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user-collab'],
    queryFn: () => base44.auth.me(),
  });

  const { data: counselorProfile } = useQuery({
    queryKey: ['counselor-profile-collab', user?.email],
    queryFn: async () => {
      const counselors = await base44.entities.Counselor.filter({ email: user.email });
      return counselors[0];
    },
    enabled: !!user?.email,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['all-students-collab'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 50),
  });

  const { data: allNotes = [] } = useQuery({
    queryKey: ['all-shared-notes'],
    queryFn: () => base44.entities.SharedNote.list('-created_date', 100),
  });

  const { data: handovers = [] } = useQuery({
    queryKey: ['all-handovers'],
    queryFn: () => base44.entities.StudentHandover.filter({ status: 'pending' }),
  });

  const { data: conferences = [] } = useQuery({
    queryKey: ['all-conferences'],
    queryFn: () => base44.entities.CaseConference.filter({ status: 'active' }),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-counselor-tasks'],
    queryFn: () => base44.entities.CounselorTask.filter({ status: ['pending', 'in_progress'] }),
  });

  const myTasks = allTasks.filter(t => t.assigned_to === counselorProfile?.id);
  const myHandovers = handovers.filter(h => 
    h.from_counselor_id === counselorProfile?.id || 
    h.to_counselor_id === counselorProfile?.id
  );

  const recentNotes = allNotes.slice(0, 10);

  return (
    <CRMLayout 
      title="Collaboration Hub"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Team Workspace
          </Badge>
        </div>
      }
    >
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">My Tasks</p>
                <p className="text-2xl font-bold text-blue-700">{myTasks.length}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Active Handovers</p>
                <p className="text-2xl font-bold text-amber-700">{myHandovers.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Active Conferences</p>
                <p className="text-2xl font-bold text-purple-700">{conferences.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Recent Notes</p>
                <p className="text-2xl font-bold text-green-700">{recentNotes.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="tasks">
            <ClipboardList className="w-4 h-4 mr-2" />
            My Tasks ({myTasks.length})
          </TabsTrigger>
          <TabsTrigger value="handovers">
            <UserCheck className="w-4 h-4 mr-2" />
            Handovers ({myHandovers.length})
          </TabsTrigger>
          <TabsTrigger value="conferences">
            <MessageSquare className="w-4 h-4 mr-2" />
            Conferences ({conferences.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            <MessageSquare className="w-4 h-4 mr-2" />
            Recent Notes
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Assigned to Me</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myTasks.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No tasks assigned to you</p>
              ) : (
                myTasks.map(task => {
                  const student = students.find(s => s.id === task.student_id);
                  const priorityColors = {
                    low: 'bg-slate-100 text-slate-700',
                    medium: 'bg-blue-100 text-blue-700',
                    high: 'bg-amber-100 text-amber-700',
                    urgent: 'bg-red-100 text-red-700',
                  };

                  return (
                    <div key={task.id} className="p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{task.title}</h4>
                            <Badge className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                          </div>
                          {student && (
                            <p className="text-sm text-slate-600">
                              Student: {student.first_name} {student.last_name}
                            </p>
                          )}
                          {task.description && (
                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                      {task.due_date && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {task.due_date}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Handovers Tab */}
        <TabsContent value="handovers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Handovers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myHandovers.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No pending handovers</p>
              ) : (
                myHandovers.map(handover => {
                  const student = students.find(s => s.id === handover.student_id);
                  const isReceiving = handover.to_counselor_id === counselorProfile?.id;

                  return (
                    <div key={handover.id} className="p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">
                              {student?.first_name} {student?.last_name}
                            </h4>
                            <Badge variant={isReceiving ? 'default' : 'outline'}>
                              {isReceiving ? 'Incoming' : 'Outgoing'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {handover.handover_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            Reason: {handover.reason?.replace(/_/g, ' ')}
                          </p>
                          {handover.summary && (
                            <p className="text-sm text-slate-600 line-clamp-2">{handover.summary}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        Start: {handover.start_date}
                        {handover.end_date && ` → End: ${handover.end_date}`}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conferences Tab */}
        <TabsContent value="conferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Case Conferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conferences.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No active conferences</p>
              ) : (
                conferences.map(conf => {
                  const student = students.find(s => s.id === conf.student_id);
                  
                  return (
                    <div 
                      key={conf.id} 
                      className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{conf.title}</h4>
                          {student && (
                            <p className="text-sm text-slate-600">
                              Student: {student.first_name} {student.last_name}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {conf.participants?.length || 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {conf.discussion_points?.length || 0} messages
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Shared Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotes.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No recent notes</p>
              ) : (
                recentNotes.map(note => {
                  const student = students.find(s => s.id === note.student_id);
                  const noteTypeColors = {
                    general: 'bg-slate-100 text-slate-700',
                    concern: 'bg-red-100 text-red-700',
                    achievement: 'bg-green-100 text-green-700',
                    meeting: 'bg-blue-100 text-blue-700',
                    follow_up: 'bg-amber-100 text-amber-700',
                  };

                  return (
                    <div 
                      key={note.id} 
                      className="p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {student && (
                              <h4 className="font-semibold text-slate-900">
                                {student.first_name} {student.last_name}
                              </h4>
                            )}
                            <Badge className={noteTypeColors[note.note_type]}>
                              {note.note_type}
                            </Badge>
                            {note.is_important && (
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{note.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>By: {note.author_name}</span>
                        <span>
                          {note.created_date && format(new Date(note.created_date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {note.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {note.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Student Dialog */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedStudent(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="conference" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="conference">Conference</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value="conference" className="mt-4">
                  <CaseConferenceRoom
                    studentId={selectedStudent.id}
                    currentCounselorId={counselorProfile?.id}
                    currentCounselorName={counselorProfile?.name || user?.full_name}
                  />
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <SharedNotesPanel
                    studentId={selectedStudent.id}
                    currentCounselorId={counselorProfile?.id}
                    currentCounselorName={counselorProfile?.name || user?.full_name}
                  />
                </TabsContent>

                <TabsContent value="tasks" className="mt-4">
                  <TaskAssignment
                    studentId={selectedStudent.id}
                    currentCounselorId={counselorProfile?.id}
                    currentCounselorName={counselorProfile?.name || user?.full_name}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      <StudentHandoverDialog
        student={selectedStudent}
        isOpen={showHandoverDialog}
        onClose={() => setShowHandoverDialog(false)}
        currentCounselorId={counselorProfile?.id}
      />
    </CRMLayout>
  );
}