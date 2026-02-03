import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, CheckCircle, Clock, TrendingUp, Calendar, 
  MessageSquare, Star, Edit, Plus, Save, X, Phone, Mail, Video
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';
import AIAssistant from '@/components/counselor/AIAssistant';

export default function CounselorDashboard() {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingScore, setEditingScore] = useState(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [followUpDialog, setFollowUpDialog] = useState(false);
  const [commLogDialog, setCommLogDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });
  const [newComm, setNewComm] = useState({
    communication_type: 'phone',
    direction: 'outbound',
    subject: '',
    summary: '',
    sentiment: 'neutral'
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: counselorProfile } = useQuery({
    queryKey: ['counselor-profile', user?.id],
    queryFn: () => base44.entities.Counselor.filter({ user_id: user?.id }).then(res => res[0]),
    enabled: !!user?.id
  });

  const { data: myStudents = [] } = useQuery({
    queryKey: ['my-students', user?.id],
    queryFn: () => base44.entities.StudentProfile.filter({ counselor_id: user?.id }),
    enabled: !!user?.id
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: () => base44.entities.Task.filter({ 
      assigned_to: user?.id,
      status: { $in: ['pending', 'in_progress'] }
    }),
    enabled: !!user?.id
  });

  const { data: leadScores = [] } = useQuery({
    queryKey: ['my-lead-scores'],
    queryFn: async () => {
      const scores = await base44.entities.LeadScore.list();
      return scores.filter(s => 
        myStudents.some(st => st.id === s.student_id)
      );
    },
    enabled: myStudents.length > 0
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const allApps = await base44.entities.Application.list();
      return allApps.filter(app => 
        myStudents.some(st => st.id === app.student_id)
      );
    },
    enabled: myStudents.length > 0
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['my-communications'],
    queryFn: async () => {
      const allComms = await base44.entities.CommunicationHistory.list('-created_date', 100);
      return allComms.filter(comm => comm.counselor_id === user?.id);
    },
    enabled: !!user?.id
  });

  const updateLeadScore = useMutation({
    mutationFn: ({ scoreId, newScore }) => 
      base44.entities.LeadScore.update(scoreId, { 
        total_score: newScore,
        grade: newScore >= 80 ? 'A' : newScore >= 65 ? 'B' : newScore >= 50 ? 'C' : newScore >= 35 ? 'D' : 'F'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lead-scores'] });
      setEditingScore(null);
      toast.success('Lead score updated');
    }
  });

  const addNote = useMutation({
    mutationFn: () => base44.entities.Comment.create({
      student_id: selectedStudent.id,
      author_id: user.id,
      author_name: user.full_name,
      author_role: 'counselor',
      comment_type: 'counselor_comment',
      content: newNote
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-comments'] });
      setNoteDialog(false);
      setNewNote('');
      toast.success('Note added');
    }
  });

  const scheduleFollowUp = useMutation({
    mutationFn: () => base44.entities.Task.create({
      title: newTask.title,
      description: newTask.description,
      student_id: selectedStudent.id,
      assigned_to: user.id,
      status: 'pending',
      priority: newTask.priority,
      due_date: newTask.due_date,
      type: 'follow_up'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      setFollowUpDialog(false);
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
      toast.success('Follow-up scheduled');
    }
  });

  const logCommunication = useMutation({
    mutationFn: () => base44.entities.CommunicationHistory.create({
      student_id: selectedStudent.id,
      counselor_id: user.id,
      communication_type: newComm.communication_type,
      direction: newComm.direction,
      subject: newComm.subject,
      summary: newComm.summary,
      sentiment: newComm.sentiment
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-communications'] });
      setCommLogDialog(false);
      setNewComm({
        communication_type: 'phone',
        direction: 'outbound',
        subject: '',
        summary: '',
        sentiment: 'neutral'
      });
      toast.success('Communication logged');
    }
  });

  // Calculate metrics
  const totalLeads = myStudents.length;
  const activeLeads = myStudents.filter(s => 
    ['contacted', 'qualified', 'in_progress'].includes(s.status)
  ).length;
  const convertedLeads = myStudents.filter(s => s.status === 'enrolled').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  const recentComms = communications.filter(c => {
    const commDate = new Date(c.created_date);
    const daysSince = (Date.now() - commDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });

  const avgResponseTime = communications.filter(c => c.response_time_minutes).length > 0
    ? Math.round(
        communications
          .filter(c => c.response_time_minutes)
          .reduce((sum, c) => sum + c.response_time_minutes, 0) / 
        communications.filter(c => c.response_time_minutes).length / 60
      )
    : 0;

  const upcomingTasks = myTasks.filter(t => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    const daysToDue = (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysToDue <= 7;
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const gradeColors = {
    A: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    B: 'bg-blue-100 text-blue-700 border-blue-300',
    C: 'bg-amber-100 text-amber-700 border-amber-300',
    D: 'bg-orange-100 text-orange-700 border-orange-300',
    F: 'bg-red-100 text-red-700 border-red-300'
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const studentsWithScores = myStudents.map(student => {
    const score = leadScores.find(s => s.student_id === student.id);
    return { ...student, leadScore: score };
  }).sort((a, b) => (b.leadScore?.total_score || 0) - (a.leadScore?.total_score || 0));

  return (
    <CRMLayout title="My Dashboard">
      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">{totalLeads}</span>
            </div>
            <p className="text-sm text-slate-600">Total Leads</p>
            <p className="text-xs text-slate-500 mt-1">{activeLeads} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-bold text-slate-900">{conversionRate}%</span>
            </div>
            <p className="text-sm text-slate-600">Conversion Rate</p>
            <p className="text-xs text-slate-500 mt-1">{convertedLeads} enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-slate-900">{avgResponseTime}h</span>
            </div>
            <p className="text-sm text-slate-600">Avg Response Time</p>
            <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-slate-900">{recentComms.length}</span>
            </div>
            <p className="text-sm text-slate-600">Communications</p>
            <p className="text-xs text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leads">My Leads ({totalLeads})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({myTasks.length})</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="progress">Student Progress</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          {studentsWithScores.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No leads assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            studentsWithScores.map(student => (
              <Card key={student.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {student.first_name} {student.last_name}
                        </h3>
                        {student.leadScore && (
                          <Badge className={`${gradeColors[student.leadScore.grade]} border`}>
                            Grade {student.leadScore.grade}
                          </Badge>
                        )}
                        <Badge variant="outline">{student.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{student.email}</p>
                      {student.preferred_countries && (
                        <p className="text-xs text-slate-500 mt-1">
                          Interested in: {student.preferred_countries.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {student.leadScore ? (
                        editingScore?.id === student.leadScore.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={editingScore.score}
                              onChange={(e) => setEditingScore({ ...editingScore, score: parseInt(e.target.value) })}
                              className="w-20 h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => updateLeadScore.mutate({ 
                                scoreId: editingScore.id, 
                                newScore: editingScore.score 
                              })}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingScore(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-2xl font-bold text-slate-900">{student.leadScore.total_score}</p>
                              <p className="text-xs text-slate-500">Lead Score</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingScore({ 
                                id: student.leadScore.id, 
                                score: student.leadScore.total_score 
                              })}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      ) : (
                        <p className="text-sm text-slate-500">No score yet</p>
                      )}
                    </div>
                  </div>

                  {student.leadScore && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Engagement</p>
                        <Progress value={(student.leadScore.engagement_score / 50) * 100} className="h-2" />
                        <p className="text-xs font-medium text-slate-700 mt-1">
                          {student.leadScore.engagement_score}/50
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Profile</p>
                        <Progress value={(student.leadScore.profile_score / 30) * 100} className="h-2" />
                        <p className="text-xs font-medium text-slate-700 mt-1">
                          {student.leadScore.profile_score}/30
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Intent</p>
                        <Progress value={(student.leadScore.intent_score / 20) * 100} className="h-2" />
                        <p className="text-xs font-medium text-slate-700 mt-1">
                          {student.leadScore.intent_score}/20
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStudent(student);
                        setCommLogDialog(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Log Communication
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStudent(student);
                        setNoteDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setFollowUpDialog(true);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Follow-up
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No upcoming tasks</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map(task => {
                    const student = myStudents.find(s => s.id === task.student_id);
                    return (
                      <div key={task.id} className="border rounded-lg p-4">
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
                              <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-slate-900 font-medium">
                              {new Date(task.due_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-500">
                              {Math.ceil((new Date(task.due_date) - Date.now()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          {myStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No students assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            myStudents.map(student => {
              const studentComms = communications.filter(c => c.student_id === student.id);
              const studentApps = applications.filter(a => a.student_id === student.id);
              
              return (
                <div key={student.id} className="grid lg:grid-cols-3 gap-6">
                  {/* Communication History */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {student.first_name} {student.last_name}
                          </CardTitle>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(student);
                              setCommLogDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Log Communication
                          </Button>
                        </div>
                        <CardDescription>Recent communication history</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {studentComms.length === 0 ? (
                          <p className="text-center py-8 text-slate-500">No communications logged yet</p>
                        ) : (
                          <div className="space-y-3">
                            {studentComms.slice(0, 10).map(comm => (
                              <div key={comm.id} className="border-l-4 border-blue-500 bg-slate-50 rounded-r-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {comm.communication_type === 'phone' && <Phone className="w-4 h-4 text-blue-600" />}
                                    {comm.communication_type === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                                    {comm.communication_type === 'video_call' && <Video className="w-4 h-4 text-blue-600" />}
                                    <span className="text-sm font-medium text-slate-900">
                                      {comm.communication_type}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {comm.direction}
                                    </Badge>
                                    {comm.sentiment && (
                                      <Badge 
                                        className={
                                          comm.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                                          comm.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                          'bg-slate-100 text-slate-700'
                                        }
                                      >
                                        {comm.sentiment}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {new Date(comm.created_date).toLocaleDateString()}
                                  </span>
                                </div>
                                {comm.subject && (
                                  <p className="text-sm font-medium text-slate-700 mb-1">{comm.subject}</p>
                                )}
                                {comm.summary && (
                                  <p className="text-sm text-slate-600">{comm.summary}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Assistant */}
                  <div>
                    <AIAssistant 
                      student={student} 
                      communications={studentComms}
                      applications={studentApps}
                    />
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          {myStudents.map(student => {
            const studentApps = applications.filter(a => a.student_id === student.id);
            return (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {student.first_name} {student.last_name}
                  </CardTitle>
                  <CardDescription>{student.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Profile Completeness</span>
                        <span className="text-sm font-medium text-slate-900">
                          {student.profile_completeness || 0}%
                        </span>
                      </div>
                      <Progress value={student.profile_completeness || 0} />
                    </div>

                    {studentApps.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-3">
                          Applications ({studentApps.length})
                        </h4>
                        <div className="space-y-2">
                          {studentApps.map(app => (
                            <div key={app.id} className="flex items-center justify-between text-sm border-b pb-2">
                              <span className="text-slate-700">Application #{app.id.slice(0, 8)}</span>
                              <Badge variant="outline">{app.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No applications yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note for {selectedStudent?.first_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note..."
              className="min-h-32"
            />
            <Button
              onClick={() => addNote.mutate()}
              disabled={!newNote || addNote.isPending}
              className="w-full"
            >
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Communication Dialog */}
      <Dialog open={commLogDialog} onOpenChange={setCommLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Communication with {selectedStudent?.first_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <Select 
                  value={newComm.communication_type}
                  onValueChange={(v) => setNewComm({ ...newComm, communication_type: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="video_call">Video Call</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Direction</label>
                <Select 
                  value={newComm.direction}
                  onValueChange={(v) => setNewComm({ ...newComm, direction: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Subject</label>
              <Input
                value={newComm.subject}
                onChange={(e) => setNewComm({ ...newComm, subject: e.target.value })}
                placeholder="e.g., Follow-up on application status"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Summary</label>
              <Textarea
                value={newComm.summary}
                onChange={(e) => setNewComm({ ...newComm, summary: e.target.value })}
                placeholder="Brief summary of the conversation..."
                className="mt-2 min-h-24"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Sentiment</label>
              <Select 
                value={newComm.sentiment}
                onValueChange={(v) => setNewComm({ ...newComm, sentiment: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => logCommunication.mutate()}
              disabled={!newComm.summary || logCommunication.isPending}
              className="w-full"
            >
              Log Communication
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Follow-up Dialog */}
      <Dialog open={followUpDialog} onOpenChange={setFollowUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Follow-up for {selectedStudent?.first_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Task Title</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Follow-up call"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task details..."
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Due Date</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="mt-2 w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <Button
              onClick={() => scheduleFollowUp.mutate()}
              disabled={!newTask.title || !newTask.due_date || scheduleFollowUp.isPending}
              className="w-full"
            >
              Schedule Follow-up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}