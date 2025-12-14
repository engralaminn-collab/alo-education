import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Building2, GraduationCap, Upload, MessageSquare, Calendar, FileText, ChevronDown, ChevronUp, Bell, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusProgress = {
  draft: 10,
  documents_pending: 25,
  under_review: 40,
  submitted_to_university: 60,
  conditional_offer: 75,
  unconditional_offer: 85,
  visa_processing: 95,
  enrolled: 100,
  rejected: 0,
  withdrawn: 0,
};

const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  documents_pending: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  submitted_to_university: 'bg-purple-100 text-purple-700',
  conditional_offer: 'bg-emerald-100 text-emerald-700',
  unconditional_offer: 'bg-green-100 text-green-700',
  visa_processing: 'bg-cyan-100 text-cyan-700',
  enrolled: 'bg-emerald-500 text-white',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

const milestones = [
  { key: 'documents_submitted', label: 'Documents Submitted', icon: CheckCircle, color: 'emerald' },
  { key: 'application_submitted', label: 'Application Submitted', icon: Clock, color: 'blue' },
  { key: 'offer_received', label: 'Offer Received', icon: GraduationCap, color: 'purple' },
  { key: 'visa_applied', label: 'Visa Applied', icon: AlertCircle, color: 'amber' },
  { key: 'visa_approved', label: 'Visa Approved', icon: CheckCircle, color: 'green' },
  { key: 'enrolled', label: 'Enrolled', icon: Building2, color: 'cyan' },
];

function ApplicationCard({ app, university, course, studentProfile, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderMilestone, setReminderMilestone] = useState('');
  
  const queryClient = useQueryClient();
  const progress = statusProgress[app.status] || 0;

  const { data: documents = [] } = useQuery({
    queryKey: ['app-documents', app.id],
    queryFn: () => base44.entities.Document.filter({ application_id: app.id }),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['app-messages', app.id],
    queryFn: () => base44.entities.Message.filter({ 
      conversation_id: `app_${app.id}`
    }),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Document.create({
        student_id: studentProfile.id,
        application_id: app.id,
        document_type: 'other',
        name: file.name,
        file_url,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-documents'] });
      toast.success('Document uploaded successfully');
      setShowUpload(false);
      setUploadFile(null);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msg) => base44.entities.Message.create({
      conversation_id: `app_${app.id}`,
      sender_id: studentProfile.id,
      sender_type: 'student',
      recipient_id: app.counselor_id || studentProfile.counselor_id,
      content: msg
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-messages'] });
      toast.success('Message sent');
      setMessage('');
      setShowMessage(false);
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestone, reminderDate }) => {
      const updatedMilestones = { ...app.milestones };
      if (!updatedMilestones[milestone]) {
        updatedMilestones[milestone] = {};
      }
      updatedMilestones[milestone].reminder_date = reminderDate;
      return base44.entities.Application.update(app.id, { milestones: updatedMilestones });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Reminder set');
      setShowReminder(false);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleSetReminder = () => {
    if (reminderMilestone && reminderDate) {
      updateMilestoneMutation.mutate({ 
        milestone: reminderMilestone, 
        reminderDate 
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-slate-200 rounded-xl bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-slate-50">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 mb-1">
              {university?.university_name || 'University'}
            </h4>
            <p className="text-sm text-slate-600">
              {course?.course_title || 'Course'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[app.status]}>
              {app.status?.replace(/_/g, ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Visual Timeline */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-4">
            {milestones.map((milestone, idx) => {
              const completed = app.milestones?.[milestone.key]?.completed;
              const Icon = milestone.icon;
              const hasReminder = app.milestones?.[milestone.key]?.reminder_date;
              
              return (
                <div key={milestone.key} className="relative flex items-start gap-3 pl-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    completed 
                      ? `bg-${milestone.color}-500 text-white`
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${completed ? 'text-slate-900' : 'text-slate-500'}`}>
                          {milestone.label}
                        </p>
                        {completed && app.milestones[milestone.key]?.date && (
                          <p className="text-xs text-slate-500">
                            {format(new Date(app.milestones[milestone.key].date), 'MMM dd, yyyy')}
                          </p>
                        )}
                        {hasReminder && (
                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                            <Bell className="w-3 h-3" />
                            Reminder: {format(new Date(hasReminder), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input type="file" onChange={handleFileChange} />
                {uploadFile && (
                  <p className="text-sm text-slate-600">Selected: {uploadFile.name}</p>
                )}
                <Button onClick={handleUpload} disabled={!uploadFile || uploadMutation.isPending} className="w-full">
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showMessage} onOpenChange={setShowMessage}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Counselor
                {messages.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{messages.length}</Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Messages about this Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-lg ${
                      msg.sender_type === 'student' ? 'bg-blue-50 ml-8' : 'bg-slate-50 mr-8'
                    }`}>
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        {msg.sender_type === 'student' ? 'You' : 'Counselor'}
                      </p>
                      <p className="text-sm text-slate-700">{msg.content}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(msg.created_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleSendMessage} disabled={!message.trim() || sendMessageMutation.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showReminder} onOpenChange={setShowReminder}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Set Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Stage Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Application Stage</label>
                  <select
                    value={reminderMilestone}
                    onChange={(e) => setReminderMilestone(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select stage...</option>
                    {milestones.map(m => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Reminder Date</label>
                  <Input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSetReminder} 
                  disabled={!reminderMilestone || !reminderDate || updateMilestoneMutation.isPending}
                  className="w-full"
                >
                  Set Reminder
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {documents.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to={createPageUrl('MyDocuments')}>
                <FileText className="w-4 h-4 mr-2" />
                View Documents ({documents.length})
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ApplicationProgressTracker({ applications, universities, courses, studentProfile }) {
  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const activeApps = applications.filter(app => 
    !['rejected', 'withdrawn', 'enrolled'].includes(app.status)
  );

  if (applications.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Application Progress Tracker</span>
          <Link to={createPageUrl('MyApplications')}>
            <Button variant="ghost" size="sm">View All Applications</Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeApps.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No active applications</p>
          </div>
        ) : (
          activeApps.map((app, index) => {
            const university = universityMap[app.university_id];
            const course = courseMap[app.course_id];
            return (
              <ApplicationCard
                key={app.id}
                app={app}
                university={university}
                course={course}
                studentProfile={studentProfile}
                index={index}
              />
            );
          })
        )}
      </CardContent>
    </Card>
  );
}