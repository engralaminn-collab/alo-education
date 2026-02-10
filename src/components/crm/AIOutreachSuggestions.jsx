import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sparkles, Send, Clock, Star, TrendingUp,
  CheckCircle2, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AIOutreachSuggestions({ students, applications, tasks, limit }) {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [customMessage, setCustomMessage] = useState({});
  const queryClient = useQueryClient();

  // Generate AI suggestions
  const generateSuggestions = () => {
    const suggestions = [];
    const now = new Date();

    students.forEach(student => {
      const studentApps = applications.filter(app => app.student_id === student.id);
      const studentTasks = tasks.filter(task => task.student_id === student.id);

      // Suggestion 1: Congratulate on offer received
      const recentOffers = studentApps.filter(app => 
        app.offer_date && 
        (now - new Date(app.offer_date)) < 7 * 24 * 60 * 60 * 1000 &&
        ['conditional_offer', 'unconditional_offer'].includes(app.status)
      );

      if (recentOffers.length > 0) {
        suggestions.push({
          id: `offer-${student.id}`,
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          type: 'congratulations',
          priority: 'high',
          message: `Congratulate on receiving ${recentOffers.length} offer${recentOffers.length > 1 ? 's' : ''}`,
          suggestedOutreach: `Hi ${student.first_name},\n\nCongratulations! 🎉 We're thrilled to see you've received an offer from ${recentOffers[0].university_id}. This is a major milestone in your study abroad journey.\n\nLet's schedule a call to discuss the next steps, including:\n- Understanding your offer conditions\n- Acceptance deadlines\n- Visa preparation\n- Scholarship opportunities\n\nWhen would be a good time to connect?\n\nBest regards,\nYour Counselor`,
          icon: Star,
          color: 'purple'
        });
      }

      // Suggestion 2: Milestone check-in
      const inProgressApps = studentApps.filter(app => 
        ['submitted_to_university', 'under_review'].includes(app.status)
      );

      if (inProgressApps.length > 0) {
        const oldestApp = inProgressApps.sort((a, b) => 
          new Date(a.applied_date) - new Date(b.applied_date)
        )[0];
        const daysSinceApplied = Math.ceil((now - new Date(oldestApp.applied_date)) / (1000 * 60 * 60 * 24));

        if (daysSinceApplied > 14) {
          suggestions.push({
            id: `followup-${student.id}`,
            studentId: student.id,
            studentName: `${student.first_name} ${student.last_name}`,
            type: 'follow_up',
            priority: 'medium',
            message: `Application under review for ${daysSinceApplied} days`,
            suggestedOutreach: `Hi ${student.first_name},\n\nI hope you're doing well! I wanted to check in regarding your application to ${oldestApp.university_id}.\n\nIt's been ${daysSinceApplied} days since submission, and applications typically take 4-8 weeks for a decision. While we wait:\n\n- Keep your documents updated\n- Prepare for potential interviews\n- Explore other university options as backup\n\nI'll keep monitoring the status and update you immediately when we hear back.\n\nStay positive!\nYour Counselor`,
            icon: Clock,
            color: 'blue'
          });
        }
      }

      // Suggestion 3: Re-engage dormant students
      if (student.status === 'qualified' && studentApps.length === 0) {
        const daysSinceCreated = Math.ceil((now - new Date(student.created_date)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreated > 14) {
          suggestions.push({
            id: `reengage-${student.id}`,
            studentId: student.id,
            studentName: `${student.first_name} ${student.last_name}`,
            type: 're_engage',
            priority: 'high',
            message: `Re-engage - No applications started`,
            suggestedOutreach: `Hi ${student.first_name},\n\nI hope this message finds you well. I noticed we haven't started your applications yet, and I wanted to reach out.\n\nStudying abroad is a big decision, and it's completely normal to need time. However, application deadlines are approaching for the ${new Date().getMonth() > 6 ? 'January' : 'September'} intake.\n\nI'd love to:\n- Understand any concerns or questions you have\n- Help you shortlist universities that match your profile\n- Create a clear timeline for your applications\n\nCan we schedule a quick call this week?\n\nLooking forward to helping you achieve your dreams!\nYour Counselor`,
            icon: TrendingUp,
            color: 'emerald'
          });
        }
      }

      // Suggestion 4: Document reminder
      const pendingDocApps = studentApps.filter(app => app.status === 'documents_pending');
      if (pendingDocApps.length > 0) {
        suggestions.push({
          id: `docs-${student.id}`,
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          type: 'document_reminder',
          priority: 'high',
          message: `${pendingDocApps.length} application(s) waiting for documents`,
          suggestedOutreach: `Hi ${student.first_name},\n\nQuick reminder: We're waiting for some documents to complete your application to ${pendingDocApps.map(a => a.university_id).join(', ')}.\n\nMissing documents can delay your application, so let's get these sorted:\n\n✓ Upload via Student Portal\n✓ Or send via WhatsApp\n✓ Or email to [your email]\n\nNeed help getting any documents? I'm here to guide you!\n\nBest,\nYour Counselor`,
          icon: CheckCircle2,
          color: 'orange'
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return limit ? suggestions.slice(0, limit) : suggestions;
  };

  const suggestions = generateSuggestions();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ studentId, message }) => {
      // This would integrate with email/SMS service
      // For now, we'll create a task as a reminder
      await base44.entities.Task.create({
        title: 'Follow up with student',
        description: message,
        student_id: studentId,
        status: 'pending',
        priority: 'high',
        due_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Outreach reminder created');
      queryClient.invalidateQueries(['tasks']);
      setExpandedSuggestion(null);
      setCustomMessage({});
    }
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-blue-100 text-blue-800',
    low: 'bg-slate-100 text-slate-800'
  };

  const iconColors = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    orange: 'text-orange-600'
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>No outreach suggestions at the moment</p>
        <p className="text-sm">Check back later for AI-powered recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map(suggestion => {
        const Icon = suggestion.icon;
        const isExpanded = expandedSuggestion === suggestion.id;

        return (
          <Card key={suggestion.id} className="border-l-4 border-l-purple-400">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Icon className={`w-5 h-5 mt-1 ${iconColors[suggestion.color]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      to={createPageUrl('CRMStudents') + `?id=${suggestion.studentId}`}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {suggestion.studentName}
                    </Link>
                    <Badge className={priorityColors[suggestion.priority]}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{suggestion.message}</p>

                  {!isExpanded ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setExpandedSuggestion(suggestion.id)}
                      className="h-8 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      View AI Suggestion
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-3 rounded-lg border">
                        <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI-Generated Message:
                        </p>
                        <Textarea
                          value={customMessage[suggestion.id] || suggestion.suggestedOutreach}
                          onChange={(e) => setCustomMessage({
                            ...customMessage,
                            [suggestion.id]: e.target.value
                          })}
                          className="text-sm min-h-[200px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            sendMessageMutation.mutate({
                              studentId: suggestion.studentId,
                              message: customMessage[suggestion.id] || suggestion.suggestedOutreach
                            });
                          }}
                          disabled={sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3 mr-1" />
                          )}
                          Create Task Reminder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setExpandedSuggestion(null);
                            setCustomMessage({});
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}