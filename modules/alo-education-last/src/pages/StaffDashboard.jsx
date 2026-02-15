import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Clock, CheckCircle, AlertTriangle, 
  Users, FileText, TrendingUp, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StaffDashboard() {
  const [user, setUser] = useState(null);

  useQuery({
    queryKey: ['current-user-staff'],
    queryFn: async () => {
      const u = await base44.auth.me();
      setUser(u);
      return u;
    }
  });

  const { data: myStudents = [] } = useQuery({
    queryKey: ['my-students', user?.id],
    queryFn: () => base44.entities.StudentProfile.filter({ counselor_id: user?.id }),
    enabled: !!user
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const studentIds = myStudents.map(s => s.id);
      if (studentIds.length === 0) return [];
      const apps = await base44.entities.Application.list();
      return apps.filter(a => studentIds.includes(a.student_id));
    },
    enabled: myStudents.length > 0
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: () => base44.entities.Task.filter({ assigned_to: user?.id, status: ['pending', 'in_progress'] }),
    enabled: !!user
  });

  const { data: whatsappChats = [] } = useQuery({
    queryKey: ['my-whatsapp-chats', user?.id],
    queryFn: () => base44.entities.WhatsAppConversation.filter({ assigned_counselor_id: user?.id, status: ['new', 'assigned', 'responded'] }),
    enabled: !!user
  });

  const pendingChats = whatsappChats.filter(c => c.status === 'new' || c.status === 'assigned');
  const slaViolations = whatsappChats.filter(c => c.sla_violated);
  const urgentTasks = myTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

  const pendingApplications = myApplications.filter(a => 
    a.status === 'draft' || a.status === 'documents_pending'
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Counselor Dashboard</h1>
              <p className="text-sm text-slate-600">Welcome, {user.full_name}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => base44.auth.logout()}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">My Students</p>
                  <p className="text-3xl font-bold text-blue-600">{myStudents.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Chats</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingChats.length}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">SLA Breaches</p>
                  <p className="text-3xl font-bold text-red-600">{slaViolations.length}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Urgent Tasks</p>
                  <p className="text-3xl font-bold text-purple-600">{urgentTasks.length}</p>
                </div>
                <Clock className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chats">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="chats">WhatsApp Chats</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          {/* WhatsApp Chats */}
          <TabsContent value="chats" className="mt-6 space-y-4">
            {pendingChats.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-600">All chats handled!</p>
                </CardContent>
              </Card>
            ) : (
              pendingChats.map(chat => {
                const waitTime = chat.first_message_at 
                  ? Math.floor((Date.now() - new Date(chat.first_message_at).getTime()) / 60000)
                  : 0;

                return (
                  <Card key={chat.id} className={chat.sla_violated ? 'border-2 border-red-300' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-slate-900">{chat.student_name || 'Unknown'}</h3>
                            <Badge variant={chat.status === 'new' ? 'destructive' : 'outline'}>
                              {chat.status}
                            </Badge>
                            {chat.sla_violated && (
                              <Badge className="bg-red-600 text-white">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                SLA Breach
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{chat.student_phone}</p>
                          {chat.tags?.length > 0 && (
                            <div className="flex gap-1 mb-3">
                              {chat.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-4 h-4" />
                              Waiting {waitTime} min
                            </span>
                            <span className="text-slate-500">
                              {chat.message_count} messages
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Open Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* My Students */}
          <TabsContent value="students" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {myStudents.map(student => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-sm text-slate-600">{student.email}</p>
                      </div>
                      <Badge className={
                        student.status === 'enrolled' ? 'bg-green-600' :
                        student.status === 'applied' ? 'bg-blue-600' :
                        student.status === 'in_progress' ? 'bg-amber-600' :
                        'bg-slate-600'
                      }>
                        {student.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>📍 {student.preferred_countries?.join(', ') || 'Not set'}</p>
                      <p>🎓 {student.preferred_degree_level || 'Not set'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications" className="mt-6">
            <div className="space-y-4">
              {pendingApplications.map(app => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Badge className="mb-2">{app.status}</Badge>
                        <p className="text-sm text-slate-600">
                          Student ID: {app.student_id}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks" className="mt-6">
            <div className="space-y-4">
              {myTasks.map(task => (
                <Card key={task.id} className={task.priority === 'urgent' || task.priority === 'high' ? 'border-2 border-red-300' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-900">{task.title}</h4>
                          <Badge className={
                            task.priority === 'urgent' ? 'bg-red-600' :
                            task.priority === 'high' ? 'bg-orange-600' :
                            task.priority === 'medium' ? 'bg-blue-600' :
                            'bg-slate-600'
                          }>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-sm text-slate-500">
                            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}