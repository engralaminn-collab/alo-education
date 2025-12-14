import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from "sonner";

export default function WhatsAppChat({ studentId, studentPhone, studentName }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const sendWhatsApp = useMutation({
    mutationFn: async ({ phone, message }) => {
      // Note: This requires WhatsApp Business API integration via backend functions
      // For now, sending as email notification with WhatsApp format
      const formattedMessage = `📱 WhatsApp Message:\n\n${message}\n\n---\nPlease reply via WhatsApp at: ${phone}`;
      
      const student = await base44.entities.StudentProfile.filter({ id: studentId });
      if (student[0]?.email) {
        await base44.integrations.Core.SendEmail({
          from_name: 'ALO Education',
          to: student[0].email,
          subject: 'New Message from Your Counselor',
          body: formattedMessage
        });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      setSent(true);
      setMessage('');
      toast.success('Message sent!');
      setTimeout(() => setSent(false), 3000);
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  if (!studentPhone) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          No phone number available for this student. Please update their profile.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-green-600" />
          WhatsApp Quick Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            <strong>WhatsApp Business API Integration Required:</strong> Enable backend functions in Settings to activate direct WhatsApp messaging. Currently sends via email notification.
          </AlertDescription>
        </Alert>

        <div>
          <div className="mb-2 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>To:</strong> {studentName}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Phone:</strong> {studentPhone}
            </p>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            className="mb-3"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => sendWhatsApp.mutate({ phone: studentPhone, message })}
              disabled={!message.trim() || sendWhatsApp.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {sendWhatsApp.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : sent ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {sent ? 'Sent!' : 'Send via WhatsApp'}
            </Button>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-slate-500">
            Quick templates:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage('Hi! I need to review your documents. Please check your email for details.')}
            >
              Document Request
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage('Great news! Your application has been updated. Please check your student portal.')}
            >
              Application Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage('Let\'s schedule a meeting to discuss your application progress.')}
            >
              Schedule Meeting
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}