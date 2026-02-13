import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  CheckCircle, Clock, AlertCircle, FileText, MessageSquare, 
  Send, Calendar, TrendingUp, User, Building2, BookOpen, Edit, Save 
} from 'lucide-react';
import { format } from 'date-fns';

export default function ApplicationDetailPanel({ application, onClose }) {
  const [feedback, setFeedback] = useState('');
  const [statusUpdate, setStatusUpdate] = useState(application.status);
  const queryClient = useQueryClient();

  const { data: student } = useQuery({
    queryKey: ['student', application.student_id],
    queryFn: () => base44.entities.StudentProfile.filter({ id: application.student_id }).then(r => r[0]),
    enabled: !!application.student_id
  });

  const { data: university } = useQuery({
    queryKey: ['university', application.university_id],
    queryFn: () => base44.entities.University.filter({ id: application.university_id }).then(r => r[0]),
    enabled: !!application.university_id
  });

  const { data: course } = useQuery({
    queryKey: ['course', application.course_id],
    queryFn: () => base44.entities.Course.filter({ id: application.course_id }).then(r => r[0]),
    enabled: !!application.course_id
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', application.id],
    queryFn: () => base44.entities.Document.filter({ application_id: application.id }),
    enabled: !!application.id
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', application.id],
    queryFn: () => base44.entities.Comment.filter({ application_id: application.id }),
    enabled: !!application.id
  });

  const updateStatus = useMutation({
    mutationFn: async () => {
      return base44.entities.Application.update(application.id, { status: statusUpdate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Status updated successfully');
    }
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Comment.create({
        student_id: application.student_id,
        application_id: application.id,
        author_id: user.id,
        author_name: user.full_name,
        author_role: 'counselor',
        comment_type: 'counselor_comment',
        content: feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setFeedback('');
      toast.success('Feedback added successfully');
    }
  });

  const updateMilestone = useMutation({
    mutationFn: async (milestone) => {
      const updatedMilestones = {
        ...application.milestones,
        [milestone]: {
          completed: !application.milestones?.[milestone]?.completed,
          date: new Date().toISOString(),
        }
      };
      return base44.entities.Application.update(application.id, { 
        milestones: updatedMilestones 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Milestone updated');
    }
  });

  const statusColors = {
    draft: 'bg-slate-200 text-slate-700',
    documents_pending: 'bg-amber-200 text-amber-800',
    under_review: 'bg-blue-200 text-blue-800',
    submitted_to_university: 'bg-purple-200 text-purple-800',
    conditional_offer: 'bg-indigo-200 text-indigo-800',
    unconditional_offer: 'bg-green-200 text-green-800',
    visa_processing: 'bg-cyan-200 text-cyan-800',
    enrolled: 'bg-emerald-200 text-emerald-800',
    rejected: 'bg-red-200 text-red-800',
    withdrawn: 'bg-slate-300 text-slate-800',
  };

  const milestones = [
    { key: 'documents_submitted', label: 'Documents Submitted', icon: FileText },
    { key: 'application_submitted', label: 'Application Submitted', icon: Send },
    { key: 'offer_received', label: 'Offer Received', icon: CheckCircle },
    { key: 'visa_applied', label: 'Visa Applied', icon: FileText },
    { key: 'visa_approved', label: 'Visa Approved', icon: CheckCircle },
    { key: 'enrolled', label: 'Enrolled', icon: TrendingUp },
  ];

  const completedMilestones = milestones.filter(m => 
    application.milestones?.[m.key]?.completed
  ).length;
  const progress = (completedMilestones / milestones.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {course?.course_title || 'Loading...'}
          </h2>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {university?.university_name}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {student?.first_name} {student?.last_name}
            </div>
          </div>
        </div>
        <Badge className={statusColors[application.status]}>
          {application.status?.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-2" />
          <p className="text-xs text-slate-500">
            {completedMilestones} of {milestones.length} milestones completed
          </p>
        </CardContent>
      </Card>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Application Status</Label>
            <Select value={statusUpdate} onValueChange={setStatusUpdate}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="documents_pending">Documents Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="submitted_to_university">Submitted to University</SelectItem>
                <SelectItem value="conditional_offer">Conditional Offer</SelectItem>
                <SelectItem value="unconditional_offer">Unconditional Offer</SelectItem>
                <SelectItem value="visa_processing">Visa Processing</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {statusUpdate !== application.status && (
            <Button 
              onClick={() => updateStatus.mutate()}
              disabled={updateStatus.isPending}
              className="w-full bg-gradient-brand"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Status Change
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Application Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              const isCompleted = application.milestones?.[milestone.key]?.completed;
              const completedDate = application.milestones?.[milestone.key]?.date;

              return (
                <div 
                  key={milestone.key}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                      <Icon className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-slate-900">
                        {milestone.label}
                      </div>
                      {completedDate && (
                        <div className="text-xs text-slate-500">
                          {format(new Date(completedDate), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() => updateMilestone.mutate(milestone.key)}
                    disabled={updateMilestone.isPending}
                  >
                    {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium">{doc.name}</div>
                      <div className="text-xs text-slate-500">{doc.document_type}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    doc.status === 'approved' ? 'border-green-600 text-green-600' :
                    doc.status === 'rejected' ? 'border-red-600 text-red-600' :
                    'border-amber-600 text-amber-600'
                  }>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No documents uploaded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Counselor Notes / Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback on documents, suggest improvements, or add notes..."
              className="mt-2"
              rows={4}
            />
          </div>
          <Button 
            onClick={() => addComment.mutate()}
            disabled={!feedback.trim() || addComment.isPending}
            className="w-full bg-gradient-brand"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Comments History */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Feedback History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="border-l-4 border-education-blue pl-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(comment.created_date), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}