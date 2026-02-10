import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageSquare, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIWorkflowAutomation({ studentId }) {
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [channelSuggestion, setChannelSuggestion] = useState(null);
  const [followUpPlan, setFollowUpPlan] = useState(null);

  // Detect at-risk students
  const detectRisk = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('detectAtRiskStudents', {
        student_id: studentId,
        run_for_all: !studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setRiskAnalysis(data);
      toast.success(`${data.at_risk_count} at-risk students identified`);
    }
  });

  // Get channel suggestion
  const suggestChannel = useMutation({
    mutationFn: async (params) => {
      const { data } = await base44.functions.invoke('suggestCommunicationChannel', {
        student_id: studentId,
        ...params
      });
      return data;
    },
    onSuccess: (data) => {
      setChannelSuggestion(data);
      toast.success('Channel recommendation generated');
    }
  });

  // Generate follow-up plan
  const generatePlan = useMutation({
    mutationFn: async (milestone) => {
      const { data } = await base44.functions.invoke('generateFollowUpPlan', {
        student_id: studentId,
        milestone_type: milestone
      });
      return data;
    },
    onSuccess: (data) => {
      setFollowUpPlan(data);
      toast.success('Follow-up plan created');
    }
  });

  return (
    <div className="space-y-6">
      {/* At-Risk Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            AI Risk Detection & Intervention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Proactively identify students at risk of dropping out and trigger counselor interventions.
          </p>
          <Button
            onClick={() => detectRisk.mutate()}
            disabled={detectRisk.isPending}
            className="bg-orange-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {detectRisk.isPending ? 'Analyzing...' : 'Run Risk Assessment'}
          </Button>

          {riskAnalysis && (
            <div className="space-y-3 mt-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="font-semibold text-orange-900">
                  {riskAnalysis.at_risk_count} at-risk students identified
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Analyzed {riskAnalysis.students_analyzed} students
                </p>
              </div>

              {riskAnalysis.at_risk_students?.map((student, i) => (
                <div key={i} className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold">{student.student_name}</h5>
                    <Badge variant="destructive">
                      {student.risk_assessment.risk_level} risk
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium text-slate-700 mb-1">Risk Score: {student.risk_assessment.risk_score}/100</p>
                    </div>

                    {student.risk_assessment.risk_factors?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Risk Factors:</p>
                        {student.risk_assessment.risk_factors.map((factor, j) => (
                          <div key={j} className="text-xs text-slate-700 mb-1">
                            <Badge variant="outline" className="mr-1">{factor.severity}</Badge>
                            {factor.description}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        {student.interventions_created} intervention tasks created
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Channel Suggestion */}
      {studentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              AI Channel Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Get AI-powered suggestions for the best communication channel based on preferences and urgency.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Message Urgency</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" id="urgency">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message Type</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" id="type">
                  <option value="follow_up">Follow-up</option>
                  <option value="reminder">Reminder</option>
                  <option value="important_update">Important Update</option>
                  <option value="routine">Routine Check-in</option>
                </select>
              </div>
            </div>

            <Button
              onClick={() => {
                const urgency = document.getElementById('urgency').value;
                const type = document.getElementById('type').value;
                suggestChannel.mutate({ message_urgency: urgency, message_type: type });
              }}
              disabled={suggestChannel.isPending}
              className="bg-blue-600 w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {suggestChannel.isPending ? 'Analyzing...' : 'Get Channel Recommendation'}
            </Button>

            {channelSuggestion?.suggestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1">Primary Channel</p>
                    <Badge className="bg-blue-600">{channelSuggestion.suggestion.primary_channel}</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1">Backup Channel</p>
                    <Badge variant="outline">{channelSuggestion.suggestion.backup_channel}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Best Time:</strong> {channelSuggestion.suggestion.best_time}</p>
                  <p><strong>Expected Response:</strong> {channelSuggestion.suggestion.expected_response_probability}%</p>
                  <p className="text-blue-800">{channelSuggestion.suggestion.reasoning}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Follow-up Plan Generator */}
      {studentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Milestone Follow-up Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Generate personalized follow-up plans after key milestones.
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => generatePlan.mutate('offer_received')} disabled={generatePlan.isPending}>
                Offer Received
              </Button>
              <Button size="sm" onClick={() => generatePlan.mutate('visa_submitted')} disabled={generatePlan.isPending}>
                Visa Submitted
              </Button>
              <Button size="sm" onClick={() => generatePlan.mutate('visa_approved')} disabled={generatePlan.isPending}>
                Visa Approved
              </Button>
              <Button size="sm" onClick={() => generatePlan.mutate('enrolled')} disabled={generatePlan.isPending}>
                Enrolled
              </Button>
            </div>

            {followUpPlan?.follow_up_plan && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-green-900 mb-2">Immediate Actions (24-48h):</p>
                  {followUpPlan.follow_up_plan.immediate_actions?.map((action, i) => (
                    <div key={i} className="text-sm bg-white p-2 rounded mb-2">
                      <Badge className="mr-2">{action.priority}</Badge>
                      <Badge variant="outline" className="mr-2">{action.channel}</Badge>
                      {action.action}
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-900 mb-2">Short-term Follow-ups:</p>
                  {followUpPlan.follow_up_plan.short_term_followups?.slice(0, 3).map((followup, i) => (
                    <div key={i} className="text-sm bg-white p-2 rounded mb-2">
                      <span className="font-medium">Day {followup.days_from_now}:</span> {followup.followup}
                    </div>
                  ))}
                </div>

                <div className="bg-white p-3 rounded">
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    ✓ {followUpPlan.tasks_created} tasks created automatically
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}