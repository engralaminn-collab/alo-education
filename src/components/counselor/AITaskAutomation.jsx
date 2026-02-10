import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Clock, Mail, Phone, Calendar, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AITaskAutomation({ studentId, onTasksCreated }) {
  const [automationResult, setAutomationResult] = useState(null);

  // Run automation
  const automate = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('automateTasksAndReminders', {
        student_id: studentId,
        run_for_all: !studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setAutomationResult(data);
      toast.success(`${data.actions_taken} automated actions created`);
      if (onTasksCreated) onTasksCreated();
    }
  });

  // Generate outreach draft
  const [draftParams, setDraftParams] = useState({ query_type: 'general_follow_up', channel: 'email' });
  const [outreachDraft, setOutreachDraft] = useState(null);

  const generateDraft = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generateOutreachDraft', {
        student_id: studentId,
        ...draftParams
      });
      return data;
    },
    onSuccess: (data) => {
      setOutreachDraft(data);
      toast.success('Outreach draft generated');
    }
  });

  const actionIcons = {
    call: Phone,
    email: Mail,
    whatsapp: Phone,
    meeting: Calendar,
    document_reminder: FileText,
    deadline_follow_up: Clock
  };

  const queryTypes = [
    { value: 'document_request', label: 'Document Request' },
    { value: 'application_update', label: 'Application Update' },
    { value: 'deadline_reminder', label: 'Deadline Reminder' },
    { value: 'offer_congratulations', label: 'Offer Congratulations' },
    { value: 'visa_guidance', label: 'Visa Guidance' },
    { value: 'general_follow_up', label: 'General Follow-up' }
  ];

  return (
    <div className="space-y-6">
      {/* Task Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            AI Task Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              AI analyzes student engagement, application stages, and deadlines to automatically create tasks and reminders.
            </p>
            <Button
              onClick={() => automate.mutate()}
              disabled={automate.isPending}
              className="bg-blue-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {automate.isPending ? 'Analyzing...' : 'Run Automation'}
            </Button>

            {automationResult && (
              <div className="mt-4 space-y-3">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="font-semibold text-green-900">
                    ✓ {automationResult.actions_taken} automated actions created
                  </p>
                </div>

                {automationResult.automated_actions?.map((action, i) => {
                  const Icon = actionIcons[action.action?.action_type] || CheckCircle;
                  return (
                    <div key={i} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold">{action.action?.title}</h5>
                            <Badge>{action.type === 'task_created' ? 'Task' : 'Reminder'}</Badge>
                          </div>
                          <p className="text-sm text-slate-600">{action.action?.description || action.reason}</p>
                          {action.action?.due_date && (
                            <p className="text-xs text-slate-500 mt-1">
                              Due: {new Date(action.action.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outreach Draft Generator */}
      {studentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              AI Outreach Draft Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Query Type</label>
                  <select
                    value={draftParams.query_type}
                    onChange={(e) => setDraftParams({ ...draftParams, query_type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    {queryTypes.map(qt => (
                      <option key={qt.value} value={qt.value}>{qt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Channel</label>
                  <select
                    value={draftParams.channel}
                    onChange={(e) => setDraftParams({ ...draftParams, channel: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={() => generateDraft.mutate()}
                disabled={generateDraft.isPending}
                className="bg-purple-600 w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateDraft.isPending ? 'Generating...' : 'Generate Draft'}
              </Button>

              {outreachDraft?.draft && (
                <div className="mt-4 space-y-3">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-purple-700 mb-1">SUBJECT:</p>
                    <p className="font-semibold text-purple-900">{outreachDraft.draft.subject}</p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-xs font-medium text-slate-600 mb-2">MESSAGE:</p>
                    <div className="text-sm text-slate-800 whitespace-pre-wrap">
                      {outreachDraft.draft.body}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 mb-1">KEY POINTS:</p>
                    <ul className="space-y-1">
                      {outreachDraft.draft.key_points?.map((point, i) => (
                        <li key={i} className="text-sm text-slate-700">• {point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Tone: {outreachDraft.draft.tone}</span>
                    <span>Follow-up in: {outreachDraft.draft.follow_up_days} days</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Use Draft</Button>
                    <Button size="sm" variant="outline" onClick={() => generateDraft.mutate()}>
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}