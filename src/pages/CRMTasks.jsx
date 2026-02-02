import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  CheckCircle, Clock, AlertCircle, Plus, Calendar,
  User, FileText, Trash2
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';
import AutomatedTaskManager from '@/components/crm/AutomatedTaskManager';

const priorityConfig = {
  low: { color: 'bg-slate-100 text-slate-700', icon: Clock },
  medium: { color: 'bg-blue-100 text-blue-700', icon: Clock },
  high: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  urgent: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

const statusConfig = {
  pending: { color: 'bg-slate-100 text-slate-700', icon: Clock },
  in_progress: { color: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { color: 'bg-slate-100 text-slate-500', icon: Clock }
};

export default function CRMTasks() {
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'follow_up',
    student_id: '',
    priority: 'medium',
    due_date: '',
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['crm-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['crm-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      setShowNewTask(false);
      setNewTask({ title: '', description: '', type: 'follow_up', student_id: '', priority: 'medium', due_date: '' });
      toast.success('Task created successfully');
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      setSelectedTask(null);
      toast.success('Task updated successfully');
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast.success('Task deleted');
    },
  });

  const myTasks = tasks.filter(t => t.assigned_to === user?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  
  const overdueTasks = myTasks.filter(t => 
    t.status !== 'completed' && t.due_date && isPast(new Date(t.due_date))
  );
  const todayTasks = myTasks.filter(t => t.due_date && isToday(new Date(t.due_date)));
  const tomorrowTasks = myTasks.filter(t => t.due_date && isTomorrow(new Date(t.due_date)));

  const studentMap = students.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});

  const TaskCard = ({ task }) => {
    const student = studentMap[task.student_id];
    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';
    const StatusIcon = statusConfig[task.status].icon;
    const PriorityIcon = priorityConfig[task.priority].icon;

    return (
      <Card 
        className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => setSelectedTask(task)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">{task.title}</h4>
              {student && (
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {student.first_name} {student.last_name}
                </p>
              )}
            </div>
            <Badge className={priorityConfig[task.priority].color}>
              <PriorityIcon className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge className={statusConfig[task.status].color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {task.status.replace('_', ' ')}
            </Badge>
            {task.due_date && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <CRMLayout 
      title="Task Management"
      actions={
        <Button onClick={() => setShowNewTask(true)} className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      }
    >
      {/* AI Task Automation */}
      <div className="mb-8">
        <AutomatedTaskManager />
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Today</p>
                <p className="text-3xl font-bold text-blue-600">{todayTasks.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tomorrow</p>
                <p className="text-3xl font-bold text-amber-600">{tomorrowTasks.length}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{completedTasks.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingTasks.map(task => <TaskCard key={task.id} task={task} />)}
              {pendingTasks.length === 0 && (
                <p className="text-center text-slate-500 py-8">No pending tasks</p>
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4 mt-4">
              {inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}
              {inProgressTasks.length === 0 && (
                <p className="text-center text-slate-500 py-8">No tasks in progress</p>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
              {completedTasks.length === 0 && (
                <p className="text-center text-slate-500 py-8">No completed tasks</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Task Dialog */}
      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task details..."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={newTask.type} onValueChange={(v) => setNewTask({ ...newTask, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="visa_check">Visa Check</SelectItem>
                    <SelectItem value="document_review">Document Review</SelectItem>
                    <SelectItem value="offer_letter">Offer Letter</SelectItem>
                    <SelectItem value="interview_prep">Interview Prep</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                  <SelectTrigger>
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
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Student</Label>
                <Select value={newTask.student_id} onValueChange={(v) => setNewTask({ ...newTask, student_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewTask(false)}>Cancel</Button>
              <Button 
                onClick={() => createTask.mutate({ ...newTask, assigned_to: user?.id })}
                disabled={!newTask.title}
              >
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={selectedTask.status} 
                  onValueChange={(v) => setSelectedTask({ ...selectedTask, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={4}
                  value={selectedTask.notes || ''}
                  onChange={(e) => setSelectedTask({ ...selectedTask, notes: e.target.value })}
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => {
                    deleteTask.mutate(selectedTask.id);
                    setSelectedTask(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button>
                  <Button onClick={() => updateTask.mutate({ id: selectedTask.id, data: selectedTask })}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}