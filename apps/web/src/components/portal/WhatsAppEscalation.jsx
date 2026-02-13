import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, AlertTriangle, Clock, CheckCircle, Send, Bell } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';

export default function WhatsAppEscalation({ studentId, counselorId }) {
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['whatsapp-messages', studentId],
    queryFn: () => base44.entities.WhatsAppMessage.filter({ student_id: studentId }, '-created_date', 20),
    enabled: !!studentId,
    refetchInterval: 30000 // Check every 30 seconds
  });

  const { data: counselor } = useQuery({
    queryKey: ['counselor-whatsapp', counselorId],
    queryFn: async () => {
      const counselors = await base44.entities.Counselor.filter({ user_id: counselorId });
      return counselors[0];
    },
    enabled: !!counselorId
  });

  const escalateMessage = useMutation({
    mutationFn: async (messageId) => {
      const message = messages.find(m => m.id === messageId);
      
      // Send WhatsApp/Email to Branch Manager and Super Admin
      await base44.integrations.Core.SendEmail({
        to: 'manager@aloeducation.com', // Replace with actual manager email
        subject: '⚠️ URGENT: Counselor Response Delay',
        body: `ESCALATION ALERT\n\nCounselor has not responded to student WhatsApp within 30 minutes.\n\nDetails:\n- Student ID: ${studentId}\n- Message Time: ${format(new Date(message.created_date), 'MMM d, yyyy h:mm a')}\n- Elapsed Time: ${differenceInMinutes(new Date(), new Date(message.created_date))} minutes\n- Message: "${message.message_content}"\n\nPlease follow up immediately.`
      });

      // Update message
      await base44.entities.WhatsAppMessage.update(messageId, {
        escalated: true,
        escalation_date: new Date().toISOString(),
        status: 'escalated'
      });

      // Create urgent task
      await base44.entities.Task.create({
        title: `URGENT: Respond to student WhatsApp`,
        description: `Student sent WhatsApp ${differenceInMinutes(new Date(), new Date(message.created_date))} minutes ago without response.\n\nMessage: "${message.message_content}"`,
        type: 'follow_up',
        student_id: studentId,
        assigned_to: counselorId,
        status: 'pending',
        priority: 'urgent',
        due_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      toast.success('Alert sent to management');
    }
  });

  // Auto-check for escalation
  useEffect(() => {
    const checkEscalation = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Office hours: 10 AM - 7 PM
      const isOfficeHours = currentHour >= 10 && currentHour < 19;
      
      if (!isOfficeHours) return;

      messages.forEach(message => {
        if (message.direction === 'inbound' && !message.responded && !message.escalated && message.is_within_office_hours) {
          const minutesSince = differenceInMinutes(now, new Date(message.created_date));
          
          if (minutesSince >= 30) {
            escalateMessage.mutate(message.id);
          }
        }
      });
    };

    const interval = setInterval(checkEscalation, 60000); // Check every minute
    checkEscalation(); // Initial check

    return () => clearInterval(interval);
  }, [messages]);

  const pendingMessages = messages.filter(m => 
    m.direction === 'inbound' && !m.responded && m.is_within_office_hours
  );

  const escalatedMessages = messages.filter(m => m.escalated);

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          WhatsApp Communications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">Pending</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{pendingMessages.length}</p>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-900">Escalated</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{escalatedMessages.length}</p>
          </div>
        </div>

        {/* Escalation Alerts */}
        {escalatedMessages.length > 0 && (
          <Alert className="bg-red-50 border-red-300">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {escalatedMessages.length} message(s) escalated to management due to delayed response
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Messages */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.slice(0, 5).map(message => {
            const minutesSince = differenceInMinutes(new Date(), new Date(message.created_date));
            const isOverdue = message.direction === 'inbound' && !message.responded && minutesSince > 30;
            
            return (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${
                  isOverdue ? 'bg-red-50 border-red-200' : 
                  message.responded ? 'bg-green-50 border-green-200' : 
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {message.direction}
                    </Badge>
                    {message.responded ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : isOverdue ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {format(new Date(message.created_date), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">
                  {message.message_content}
                </p>
                {isOverdue && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ {minutesSince} minutes without response
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div className="text-xs text-emerald-800">
              <strong>Auto-Escalation Active:</strong> Messages without response in 30 mins during office hours (10 AM - 7 PM) are automatically escalated to management.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}