import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Users, FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, Plus, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function ManagerCounselorWorkload() {
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: 'follow_up',
    priority: 'medium',
    due_date: ''
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['all-counselors'],
    queryFn: () => base44.entities.Counselor.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['all-applications'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['all-counselor-tasks'],
    queryFn: () => base44.entities.CounselorTask.list('-created_date')
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['counselor-feedback-all'],
    queryFn: () => base44.entities.Feedback.filter({ feedback_type: 'counselor', status: 'approved' })
  });

  const assignTask = useMutation({
    mutationFn: (data) => base44.entities.CounselorTask.create({
      ...data,
      assigned_by: user.id,
      status: 'pending'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-counselor-tasks'] });
      toast.success('Task assigned successfully');
      setShowAssignTask(false);
      setSelectedCounselor(null);
      setTaskForm({
        title: '',
        description: '',
        task_type: 'follow_up',
        priority: 'medium',
        due_date: ''
      });
    }
  });

  // Calculate counselor metrics
  const counselorMetrics = counselors.map(counselor => {
    const counselorStudents = students.filter(s => s.counselor_id === counselor.user_id);
    const studentIds = counselorStudents.map(s => s.id);
    const counselorApps = applications.filter(a => studentIds.includes(a.student_id));
    const counselorTasks = tasks.filter(t => t.counselor_id === counselor.user_id);
    const pendingTasks = counselorTasks.filter(t => t.status === 'pending');
    const overdueTasks = counselorTasks.filter(t => {
      return t.status === 'pending' && new Date(t.due_date) < new Date();
    });
    const counselorFeedback = feedback.filter(f => f.counselor_id === counselor.user_id);
    const avgRating = counselorFeedback.length > 0
      ? counselorFeedback.reduce((sum, f) => sum + f.rating, 0) / counselorFeedback.length
      : 0;

    return {
      ...counselor,
      total_students: counselorStudents.length,
      total_applications: counselorApps.length,
      enrolled: counselorApps.filter(a => a.status === 'enrolled').length,
      pending_tasks: pendingTasks.length,
      overdue_tasks: overdueTasks.length,
      avg_rating: avgRating.toFixed(1),
      workload_score: counselorStudents.length + (pendingTasks.length * 2) + (overdueTasks.length * 3)
    };
  }).sort((a, b) => b.workload_score - a.workload_score);

  const handleAssignTask = (e) => {
    e.preventDefault();
    assignTask.mutate({
      ...taskForm,
      counselor_id: selectedCounselor.user_id
    });
  };

  return (
    <CRMLayout
      title="Counselor Workload & Performance"
      actions={
        <Button
          onClick={() => setShowAssignTask(true)}
          className="bg-gradient-to-r from-education-blue to-alo-orange"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign Task
        </Button>
      }
    >
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Counselors</p>
                <p className="text-3xl font-bold text-education-blue">{counselors.length}</p>
              </div>
              <Users className="w-10 h-10 text-education-blue/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Students</p>
                <p className="text-3xl font-bold text-purple-600">{students.length}</p>
              </div>
              <Users className="w-10 h-10 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-alo-orange">
                  {tasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-alo-orange/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600">
                  {tasks.filter(t => t.status === 'pending' && new Date(t.due_date) < new Date()).length}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Counselor Performance Grid */}
      <div className="grid gap-6">
        {counselorMetrics.map((counselor) => (
          <Card key={counselor.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-education-blue/10 flex items-center justify-center font-bold text-education-blue text-lg">
                    {counselor.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{counselor.name}</h3>
                    <p className="text-sm text-slate-600">{counselor.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={
                        counselor.workload_score > 50 ? 'bg-red-600' :
                        counselor.workload_score > 30 ? 'bg-orange-600' :
                        'bg-green-600'
                      }>
                        Workload: {counselor.workload_score}
                      </Badge>
                      {counselor.avg_rating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold">{counselor.avg_rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCounselor(counselor);
                    setShowAssignTask(true);
                  }}
                  className="bg-education-blue"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </Button>
              </div>

              <div className="grid grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{counselor.total_students}</p>
                  <p className="text-xs text-slate-600">Students</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">{counselor.total_applications}</p>
                  <p className="text-xs text-slate-600">Applications</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{counselor.enrolled}</p>
                  <p className="text-xs text-slate-600">Enrolled</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">{counselor.pending_tasks}</p>
                  <p className="text-xs text-slate-600">Pending</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-700">{counselor.overdue_tasks}</p>
                  <p className="text-xs text-slate-600">Overdue</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Workload Capacity</span>
                  <span className={
                    counselor.workload_score > 50 ? 'text-red-600 font-semibold' :
                    counselor.workload_score > 30 ? 'text-orange-600' :
                    'text-green-600'
                  }>
                    {counselor.workload_score > 50 ? 'Overloaded' :
                     counselor.workload_score > 30 ? 'Moderate' : 'Available'}
                  </span>
                </div>
                <Progress
                  value={Math.min((counselor.workload_score / 60) * 100, 100)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Task Modal */}
      {showAssignTask && (
        <Dialog open={true} onOpenChange={() => {
          setShowAssignTask(false);
          setSelectedCounselor(null);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Assign Task {selectedCounselor && `to ${selectedCounselor.name}`}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignTask} className="space-y-4">
              {!selectedCounselor && (
                <div>
                  <Label>Select Counselor</Label>
                  <Select
                    value={selectedCounselor?.id || ''}
                    onValueChange={(v) => {
                      const c = counselors.find(c => c.id === v);
                      setSelectedCounselor(c);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose counselor" />
                    </SelectTrigger>
                    <SelectContent>
                      {counselors.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - Workload: {counselorMetrics.find(cm => cm.id === c.id)?.workload_score || 0}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Task Title</Label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="mt-2"
                  placeholder="Review student applications"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={taskForm.task_type} onValueChange={(v) => setTaskForm({ ...taskForm, task_type: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="document_review">Document Review</SelectItem>
                      <SelectItem value="application_review">Application Review</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="datetime-local"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAssignTask(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignTask.isPending || !selectedCounselor}>
                  {assignTask.isPending ? 'Assigning...' : 'Assign Task'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </CRMLayout>
  );
}