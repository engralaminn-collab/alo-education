import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CommunicationParser() {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  // Fetch unprocessed messages
  const { data: messages = [] } = useQuery({
    queryKey: ['unprocessed-messages'],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date', 100);
      const processedHistory = await base44.entities.CommunicationHistory.list();
      const processedMessageIds = new Set(processedHistory.map(h => h.message_id));
      return allMessages.filter(m => !processedMessageIds.has(m.id) && m.sender_type === 'student');
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const { data: students = [] } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  // Process a single message
  const processMessage = async (message) => {
    try {
      const student = students.find(s => s.id === message.sender_id);
      if (!student) return;

      // AI Analysis
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this student communication and extract key information:

Message: "${message.content}"

Student Context:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}

Extract:
1. Sentiment (positive/neutral/negative/urgent)
2. Main concerns (array of strings)
3. Action items needed (array of strings)
4. Topics discussed (array of strings - e.g., "visa", "deadline", "fees", "documents")
5. Does this require follow-up? (boolean)
6. Priority level (low/medium/high/urgent)

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { 
              type: "string",
              enum: ["positive", "neutral", "negative", "urgent"]
            },
            concerns: { 
              type: "array",
              items: { type: "string" }
            },
            action_items: { 
              type: "array",
              items: { type: "string" }
            },
            topics: { 
              type: "array",
              items: { type: "string" }
            },
            requires_follow_up: { type: "boolean" },
            priority_level: { 
              type: "string",
              enum: ["low", "medium", "high", "urgent"]
            }
          }
        }
      });

      // Create communication history
      const history = await base44.entities.CommunicationHistory.create({
        student_id: student.id,
        message_id: message.id,
        communication_type: 'chat',
        direction: 'inbound',
        content: message.content,
        ai_analysis: analysis,
        processed: true,
        tasks_created: []
      });

      // Auto-create tasks based on action items
      const createdTaskIds = [];
      if (analysis.action_items?.length > 0) {
        for (const actionItem of analysis.action_items) {
          const task = await base44.entities.Task.create({
            title: actionItem,
            description: `Auto-generated from student communication\n\nOriginal message: "${message.content.substring(0, 200)}..."`,
            type: 'follow_up',
            student_id: student.id,
            assigned_to: student.counselor_id || created_by,
            status: 'pending',
            priority: analysis.priority_level === 'urgent' ? 'urgent' : 
                      analysis.priority_level === 'high' ? 'high' : 
                      analysis.priority_level === 'medium' ? 'medium' : 'low',
            due_date: analysis.priority_level === 'urgent' 
              ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
          createdTaskIds.push(task.id);
        }

        // Update history with task IDs
        await base44.entities.CommunicationHistory.update(history.id, {
          tasks_created: createdTaskIds
        });
      }

      // Update student status if needed
      if (analysis.sentiment === 'negative' || analysis.sentiment === 'urgent') {
        if (student.status === 'new_lead') {
          await base44.entities.StudentProfile.update(student.id, {
            status: 'contacted'
          });
        }
      }

      return { success: true, tasksCreated: createdTaskIds.length };
    } catch (error) {
      console.error('Error processing message:', error);
      return { success: false, error: error.message };
    }
  };

  // Batch process all unprocessed messages
  const processBatch = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      const results = [];
      
      for (const message of messages.slice(0, 5)) {
        const result = await processMessage(message);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const totalTasks = results.reduce((sum, r) => sum + (r.tasksCreated || 0), 0);
      
      queryClient.invalidateQueries({ queryKey: ['unprocessed-messages'] });
      queryClient.invalidateQueries({ queryKey: ['communication-history'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      
      toast.success(`Processed ${successful} messages, created ${totalTasks} tasks`);
      setProcessing(false);
    },
    onError: (error) => {
      toast.error('Processing failed: ' + error.message);
      setProcessing(false);
    }
  });

  // Auto-process when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !processing) {
      const timer = setTimeout(() => {
        processBatch.mutate();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Communication Parser
          </div>
          {messages.length > 0 && (
            <Badge className="bg-blue-100 text-blue-700">
              {messages.length} unprocessed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processing ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Analyzing communications with AI...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-slate-600">All messages processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                {messages.length} new messages will be auto-processed
              </p>
            </div>
            <Button 
              onClick={() => processBatch.mutate()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Process Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}