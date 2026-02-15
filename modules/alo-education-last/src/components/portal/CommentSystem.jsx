import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Lock, Eye, Clock, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CommentSystem({ studentId, applicationId, userRole }) {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('student_comment');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user-comments'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-comments', studentId],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ id: studentId });
      return profiles[0];
    },
    enabled: !!studentId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', studentId, applicationId],
    queryFn: () => {
      const query = applicationId 
        ? { student_id: studentId, application_id: applicationId }
        : { student_id: studentId };
      return base44.entities.Comment.filter(query, '-created_date');
    },
    enabled: !!studentId
  });

  const addComment = useMutation({
    mutationFn: async (data) => {
      const comment = await base44.entities.Comment.create(data);
      
      // Send email notifications
      const isInternal = ['internal_note', 'finance_note'].includes(data.comment_type);
      
      if (!isInternal) {
        // Email to student (if not the author)
        if (userRole !== 'student' && studentProfile?.email) {
          await base44.integrations.Core.SendEmail({
            to: studentProfile.email,
            subject: 'New Comment on Your Application',
            body: `Hi ${studentProfile.first_name},\n\nYou have a new comment from your counselor:\n\n"${data.content}"\n\nPlease log in to your portal to view and respond.\n\nBest regards,\nALO Education Team`
          });
        }
        
        // Email to counselor (if not the author)
        if (userRole === 'student' && studentProfile?.counselor_id) {
          const counselors = await base44.entities.Counselor.filter({ user_id: studentProfile.counselor_id });
          if (counselors[0]?.email) {
            await base44.integrations.Core.SendEmail({
              to: counselors[0].email,
              subject: `New Student Comment from ${studentProfile.first_name} ${studentProfile.last_name}`,
              body: `A student has posted a new comment:\n\n"${data.content}"\n\nPlease log in to the CRM to respond.`
            });
          }
        }
      }
      
      await base44.entities.Comment.update(comment.id, { email_sent: true });
      
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setNewComment('');
      toast.success('Comment posted and notification sent');
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    addComment.mutate({
      student_id: studentId,
      application_id: applicationId,
      author_id: user.id,
      author_name: user.full_name,
      author_role: userRole,
      comment_type: commentType,
      content: newComment
    });
  };

  // Filter comments based on user role
  const visibleComments = comments.filter(comment => {
    const isInternal = ['internal_note', 'finance_note'].includes(comment.comment_type);
    
    // Students cannot see internal notes
    if (userRole === 'student' && isInternal) {
      return false;
    }
    
    return true;
  });

  const getCommentIcon = (type) => {
    switch(type) {
      case 'internal_note':
      case 'finance_note':
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCommentColor = (type) => {
    switch(type) {
      case 'internal_note': return 'bg-red-50 border-red-200';
      case 'finance_note': return 'bg-amber-50 border-amber-200';
      case 'counselor_comment': return 'bg-blue-50 border-blue-200';
      case 'partner_comment': return 'bg-purple-50 border-purple-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Comments & Communication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {user?.full_name?.[0] || 'U'}
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between">
            {userRole !== 'student' && (
              <Select value={commentType} onValueChange={setCommentType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="counselor_comment">Public Comment</SelectItem>
                  <SelectItem value="internal_note">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      Internal Note
                    </div>
                  </SelectItem>
                  <SelectItem value="finance_note">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      Finance Note
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {userRole === 'student' && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Eye className="w-4 h-4" />
                Visible to you and your counselor
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || addComment.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {addComment.isPending ? 'Sending...' : 'Post Comment'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {visibleComments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm">No comments yet</p>
            </div>
          ) : (
            visibleComments.map(comment => {
              const isInternal = ['internal_note', 'finance_note'].includes(comment.comment_type);
              
              return (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${getCommentColor(comment.comment_type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {comment.author_name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">
                          {comment.author_name}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {comment.author_role}
                        </Badge>
                        {isInternal && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Internal Only
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {format(new Date(comment.created_date), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}