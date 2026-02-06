import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users, FileText, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Calendar, MessageSquare, Target, Award,
  Activity, BarChart3, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CRMLayout from '@/components/crm/CRMLayout';
import { toast } from 'sonner';
import LogInteractionModal from '@/components/counselor/LogInteractionModal';
import AddTaskModal from '@/components/counselor/AddTaskModal';

export default function CounselorDashboard() {
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: counselor } = useQuery({
    queryKey: ['counselor-profile', user?.id],
    queryFn: async () => {
      const counselors = await base44.entities.Counselor.filter({ user_id: user.id });
      return counselors[0];
    },
    enabled: !!user?.id
  });

  const { data: students = [] } = useQuery({
    queryKey: ['counselor-students', counselor?.user_id],
    queryFn: () => base44.entities.StudentProfile.filter({ counselor_id: counselor.user_id }),
    enabled: !!counselor?.user_id
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['counselor-applications'],
    queryFn: async () => {
      const allApps = await base44.entities.Application.list();
      return allApps.filter(app => students.some(s => s.id === app.student_id));
    },
    enabled: students.length > 0
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['counselor-tasks', counselor?.user_id],
    queryFn: () => base44.entities.CounselorTask.filter({ counselor_id: counselor.user_id }, '-due_date'),
    enabled: !!counselor?.user_id
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['counselor-interactions', counselor?.user_id],
    queryFn: () => base44.entities.CounselorInteraction.filter({ counselor_id: counselor.user_id }, '-interaction_date', 50),
    enabled: !!counselor?.user_id
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['counselor-feedback', counselor?.user_id],
    queryFn: () => base44.entities.Feedback.filter({ counselor_id: counselor.user_id, status: 'approved' }),
    enabled: !!counselor?.user_id
  });

  // Calculate metrics
  const totalApps = applications.length;
  const enrolled = applications.filter(a => a.status === 'enrolled').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const todayTasks = tasks.filter(t => {
    const due = new Date(t.due_date);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  }).length;

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  // Monthly performance
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('default', { month: 'short' });
    
    const monthApps = applications.filter(a => {
      if (!a.created_date) return false;
      const appDate = new Date(a.created_date);
      return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear();
    }).length;

    return { month, applications: monthApps };
  });

  // At-risk students (basic calculation)
  const atRiskStudents = students.filter(s => {
    const studentApps = applications.filter(a => a.student_id === s.id);
    const hasRecentActivity = interactions.some(i => {
      const daysSince = (Date.now() - new Date(i.interaction_date).getTime()) / (1000 * 60 * 60 * 24);
      return i.student_id === s.id && daysSince < 14;
    });
    return s.profile_completeness < 60 || (!hasRecentActivity && studentApps.length === 0);
  });

  return (
    <CRMLayout 
      title="Counselor Dashboard"
      actions={
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLogInteraction(true)}
            variant="outline"
            className="border-education-blue text-education-blue"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Log Interaction
          </Button>
          <Button
            onClick={() => setShowAddTask(true)}
            className="bg-gradient-to-r from-education-blue to-alo-orange"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      }
    >
      {/* Performance Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">My Students</p>
                <p className="text-3xl font-bold text-education-blue">{students.length}</p>
              </div>
              <Users className="w-10 h-10 text-education-blue/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Applications</p>
                <p className="text-3xl font-bold text-purple-600">{totalApps}</p>
                <p className="text-xs text-green-600">{enrolled} enrolled</p>
              </div>
              <FileText className="w-10 h-10 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-alo-orange">{pendingTasks}</p>
                <p className="text-xs text-red-600">{todayTasks} due today</p>
              </div>
              <Clock className="w-10 h-10 text-alo-orange/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{avgRating}</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(avgRating) ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Award className="w-10 h-10 text-yellow-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* At-Risk Students */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  At-Risk Students ({atRiskStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {atRiskStudents.slice(0, 5).map((student) => (
                    <div key={student.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {student.first_name} {student.last_name}
                          </h4>
                          <p className="text-sm text-slate-600">{student.email}</p>
                        </div>
                        <Badge className="bg-red-600 text-white">Risk</Badge>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Profile: {student.profile_completeness}%</span>
                        </div>
                        <Progress value={student.profile_completeness} className="h-2" />
                      </div>
                      <Link to={createPageUrl('CRMStudentProfile') + `?id=${student.id}`}>
                        <Button size="sm" variant="outline" className="w-full mt-2">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasks.filter(t => {
                    const due = new Date(t.due_date);
                    const today = new Date();
                    return due.toDateString() === today.toDateString();
                  }).map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge className={
                          task.priority === 'urgent' ? 'bg-red-600' :
                          task.priority === 'high' ? 'bg-orange-600' :
                          'bg-blue-600'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{task.description}</p>
                    </div>
                  ))}
                  {todayTasks === 0 && (
                    <p className="text-center text-slate-500 py-4">No tasks due today</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Application Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#0066CC" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Student Portfolio ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => {
                  const studentApps = applications.filter(a => a.student_id === student.id);
                  const healthScore = student.profile_completeness || 0;
                  
                  return (
                    <div key={student.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-education-blue/10 flex items-center justify-center font-semibold text-education-blue">
                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {student.first_name} {student.last_name}
                            </h4>
                            <p className="text-sm text-slate-600">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            healthScore >= 70 ? 'text-green-600' :
                            healthScore >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {healthScore}
                          </div>
                          <p className="text-xs text-slate-500">Health Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="font-bold text-slate-900">{studentApps.length}</p>
                          <p className="text-xs text-slate-600">Applications</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="font-bold text-green-700">
                            {studentApps.filter(a => a.status === 'enrolled').length}
                          </p>
                          <p className="text-xs text-green-600">Enrolled</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="font-bold text-blue-700">
                            {studentApps.filter(a => a.status === 'under_review' || a.status === 'submitted_to_university').length}
                          </p>
                          <p className="text-xs text-blue-600">In Progress</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={createPageUrl('CRMStudentProfile') + `?id=${student.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="bg-education-blue"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowLogInteraction(true);
                          }}
                        >
                          Log Interaction
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Tasks ({tasks.length})</CardTitle>
                <Button size="sm" onClick={() => setShowAddTask(true)} className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const student = students.find(s => s.id === task.student_id);
                  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';
                  
                  return (
                    <div key={task.id} className={`p-4 border rounded-lg ${
                      isOverdue ? 'bg-red-50 border-red-200' : 'bg-white'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{task.title}</h4>
                          <p className="text-sm text-slate-600">{task.description}</p>
                          {student && (
                            <p className="text-xs text-slate-500 mt-1">
                              Student: {student.first_name} {student.last_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={
                            task.priority === 'urgent' ? 'bg-red-600' :
                            task.priority === 'high' ? 'bg-orange-600' :
                            task.priority === 'medium' ? 'bg-blue-600' :
                            'bg-slate-600'
                          }>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{task.task_type.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interactions.map((interaction) => {
                  const student = students.find(s => s.id === interaction.student_id);
                  
                  return (
                    <div key={interaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-slate-900">
                            {student?.first_name} {student?.last_name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {new Date(interaction.interaction_date).toLocaleDateString()} • 
                            {interaction.duration_minutes} mins • {interaction.interaction_type}
                          </p>
                        </div>
                        <Badge className={
                          interaction.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                          interaction.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {interaction.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{interaction.summary}</p>
                      {interaction.follow_up_required && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          Follow-up needed by {new Date(interaction.follow_up_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#0066CC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-yellow-600 mb-2">{avgRating}</div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(avgRating) ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">Based on {feedback.length} reviews</p>
                </div>
                <div className="space-y-2">
                  {feedback.slice(0, 3).map((f) => (
                    <div key={f.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{f.title}</p>
                        <div className="flex gap-0.5">
                          {[...Array(f.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{f.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showLogInteraction && (
        <LogInteractionModal
          students={students}
          selectedStudent={selectedStudent}
          counselorId={counselor?.user_id}
          onClose={() => {
            setShowLogInteraction(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['counselor-interactions'] });
            setShowLogInteraction(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          students={students}
          counselorId={counselor?.user_id}
          onClose={() => setShowAddTask(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['counselor-tasks'] });
            setShowAddTask(false);
          }}
        />
      )}
    </CRMLayout>
  );
}