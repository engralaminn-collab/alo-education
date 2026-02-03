import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, CheckCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoCommunicationMonitor() {
  const [processing, setProcessing] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students-monitor'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const parseAndLogCommunication = async (message) => {
    try {
      // Find student profile
      const student = students.find(s => s.email === message.recipient_id || s.id === message.recipient_id);
      if (!student) return;

      const prompt = `Parse this communication between counselor and student. Extract key information:

Student: ${student.first_name} ${student.last_name}
Current Status: ${student.status}

Message Content:
${message.content}

Extract and return JSON with:
1. "student_concerns": Array of main concerns or questions raised
2. "counselor_actions": Array of actions taken or promised
3. "sentiment": Student sentiment (positive/neutral/negative/frustrated/excited/anxious)
4. "urgency_level": Urgency (low/medium/high/critical)
5. "follow_up_needed": Boolean
6. "key_dates": Array of mentioned dates (objects with date and description)
7. "status_change_recommended": Recommended status if change needed
8. "action_items": Array of specific tasks to create
9. "communication_summary": One sentence summary`;

      const parsed = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            student_concerns: { type: "array", items: { type: "string" } },
            counselor_actions: { type: "array", items: { type: "string" } },
            sentiment: { type: "string" },
            urgency_level: { type: "string" },
            follow_up_needed: { type: "boolean" },
            key_dates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            status_change_recommended: { type: "string" },
            action_items: { type: "array", items: { type: "string" } },
            communication_summary: { type: "string" }
          }
        }
      });

      // Create tasks
      const createdTaskIds = [];
      if (parsed.action_items?.length > 0) {
        for (const actionItem of parsed.action_items) {
          const task = await base44.entities.Task.create({
            title: actionItem,
            description: `Auto-created from conversation with ${student.first_name}`,
            student_id: student.id,
            assigned_to: student.counselor_id || message.sender_id,
            status: 'pending',
            priority: parsed.urgency_level === 'critical' ? 'urgent' : 
                     parsed.urgency_level === 'high' ? 'high' : 'medium',
            type: 'follow_up',
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
          createdTaskIds.push(task.id);
        }
      }

      // Update student status if recommended
      let statusChange = null;
      if (parsed.status_change_recommended && parsed.status_change_recommended !== student.status) {
        await base44.entities.StudentProfile.update(student.id, {
          status: parsed.status_change_recommended
        });
        statusChange = { from: student.status, to: parsed.status_change_recommended };
      }

      // Log communication
      await base44.entities.CommunicationLog.create({
        student_id: student.id,
        counselor_id: message.sender_id,
        message_id: message.id,
        communication_type: 'chat',
        original_text: message.content,
        summary: parsed.communication_summary,
        student_concerns: parsed.student_concerns || [],
        counselor_actions: parsed.counselor_actions || [],
        sentiment: parsed.sentiment,
        urgency_level: parsed.urgency_level,
        follow_up_needed: parsed.follow_up_needed,
        key_dates: parsed.key_dates || [],
        action_items: parsed.action_items || [],
        tasks_created: createdTaskIds,
        status_change: statusChange,
        parsed_at: new Date().toISOString()
      });

      setRecentActivity(prev => [{
        timestamp: new Date(),
        student: `${student.first_name} ${student.last_name}`,
        summary: parsed.communication_summary,
        tasksCreated: createdTaskIds.length,
        statusChanged: statusChange !== null
      }, ...prev.slice(0, 9)]);

      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['communication-logs'] });

    } catch (error) {
      console.error('Auto-parsing error:', error);
    }
  };

  useEffect(() => {
    // Subscribe to new messages
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type === 'create') {
        const message = event.data;
        
        // Only parse counselor messages to students
        if (message.sender_type === 'counselor' && message.content.length > 50) {
          setProcessing(true);
          parseAndLogCommunication(message).finally(() => {
            setProcessing(false);
          });
        }
      }
    });

    return unsubscribe;
  }, [students]);

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-emerald-900">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Auto Communication Monitor
          </span>
          <Badge className={processing ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'}>
            {processing ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-emerald-800 mb-4">
          <p className="font-medium mb-1">Monitoring all counselor-student communications</p>
          <p className="text-xs text-emerald-600">Auto-parsing messages, creating tasks, and updating student records</p>
        </div>

        {recentActivity.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Recent Activity</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-emerald-200 text-xs">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-slate-900">{activity.student}</p>
                    <p className="text-slate-500">{activity.timestamp.toLocaleTimeString()}</p>
                  </div>
                  <p className="text-slate-700 mb-2">{activity.summary}</p>
                  <div className="flex gap-2">
                    {activity.tasksCreated > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {activity.tasksCreated} task{activity.tasksCreated > 1 ? 's' : ''} created
                      </Badge>
                    )}
                    {activity.statusChanged && (
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        Status updated
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentActivity.length === 0 && (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
            <p className="text-sm text-emerald-700">
              Waiting for communications to monitor...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}