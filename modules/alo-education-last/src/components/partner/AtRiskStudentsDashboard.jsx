import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Mail, Phone, MessageSquare, Calendar, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AtRiskStudentsDashboard({ partnerId }) {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data: atRiskData, isLoading, refetch } = useQuery({
    queryKey: ['at-risk-students', partnerId],
    queryFn: async () => {
      const response = await base44.functions.invoke('identifyAtRiskStudents', { partner_id: partnerId });
      return response.data;
    },
    refetchInterval: 600000 // Refresh every 10 minutes
  });

  const markAsContacted = useMutation({
    mutationFn: async (studentId) => {
      const records = await base44.entities.AtRiskStudent.filter({ student_id: studentId, status: 'identified' });
      if (records[0]) {
        await base44.entities.AtRiskStudent.update(records[0].id, { status: 'contacted' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['at-risk-students'] });
      toast.success('Student marked as contacted');
    }
  });

  const riskColors = {
    low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    high: 'bg-red-100 text-red-800 border-red-300',
    critical: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  const actionIcons = {
    email: Mail,
    phone_call: Phone,
    whatsapp: MessageSquare,
    meeting: Calendar
  };

  if (isLoading) {
    return <div className="text-center py-8">Analyzing students...</div>;
  }

  const students = atRiskData?.at_risk_students || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            At-Risk Students Dashboard
            <Badge className="ml-auto">{students.length} Students Need Attention</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {['critical', 'high', 'medium', 'low'].map((level) => {
              const count = students.filter((s) => s.risk_level === level).length;
              return (
                <div key={level} className={`p-4 rounded-lg border-2 ${riskColors[level]}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm capitalize">{level} Risk</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {students.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {item.student.first_name} {item.student.last_name}
                  </h3>
                  <p className="text-sm text-slate-600">{item.student.email}</p>
                </div>
                <Badge className={riskColors[item.risk_level]}>{item.risk_level} Risk</Badge>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <strong>Last Contact:</strong> {item.days_since_last_contact} days ago
                </p>
                {item.risk_factors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span className="text-slate-700">{factor.description}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedStudent(item)}
              >
                View AI Outreach Suggestions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Outreach Modal */}
      {selectedStudent && (
        <Card className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl z-50 overflow-auto max-h-[90vh]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                AI-Generated Outreach Plan for {selectedStudent.student.first_name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedStudent.outreach_suggestions.map((suggestion, i) => {
              const Icon = actionIcons[suggestion.action_type] || MessageSquare;
              return (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-education-blue" />
                      <h4 className="font-semibold capitalize">
                        {suggestion.action_type.replace('_', ' ')}
                      </h4>
                    </div>
                    <Badge
                      className={
                        suggestion.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : suggestion.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }
                    >
                      {suggestion.priority} priority
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">
                        Suggested Message:
                      </label>
                      <div className="bg-slate-50 p-3 rounded text-sm relative">
                        <p className="whitespace-pre-wrap">{suggestion.suggested_message}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            navigator.clipboard.writeText(suggestion.suggested_message);
                            toast.success('Message copied!');
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">
                        Key Talking Points:
                      </label>
                      <ul className="space-y-1">
                        {suggestion.talking_points.map((point, j) => (
                          <li key={j} className="text-sm flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Best time to contact:</strong> {suggestion.best_time_to_contact}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1 bg-education-blue"
                onClick={() => {
                  markAsContacted.mutate(selectedStudent.student.id);
                  setSelectedStudent(null);
                }}
              >
                Mark as Contacted
              </Button>
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}