import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send, Paperclip, Link, Settings, Phone, Video, MoreVertical,
  FileText, ExternalLink, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import CannedResponsesPanel from './CannedResponsesPanel';

export default function CounselorMessagingPanel({ conversationId, studentId, studentName, onClose }) {
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showCanned, setShowCanned] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_id: conversationId }),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      return base44.entities.DirectMessage.create({
        conversation_id: conversationId,
        sender_type: 'counselor',
        sender_id: 'current-user',
        sender_name: 'Counselor',
        recipient_type: 'student',
        recipient_id: studentId,
        recipient_name: studentName,
        message_type: 'chat',
        content: content,
        attachments: attachments,
        is_read: false,
      });
    },
    onSuccess: () => {
      setMessageText('');
      setAttachments([]);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message sent');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }
    sendMessage.mutate(messageText);
  };

  const handleAddCourseLink = () => {
    // This would open a course selector dialog
    toast.info('Course link feature coming soon');
  };

  const handleSelectCannedResponse = (content) => {
    setMessageText(content);
    setShowCanned(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{studentName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900">{studentName}</h3>
            <p className="text-xs text-slate-500">Student</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <Phone className="w-4 h-4 text-slate-600" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <Video className="w-4 h-4 text-slate-600" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <MoreVertical className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'counselor' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_type === 'counselor'
                    ? 'bg-education-blue text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs hover:underline"
                      >
                        <FileText className="w-3 h-3" />
                        {att.name}
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(msg.created_date), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Canned Responses Sidebar */}
      {showCanned && (
        <div className="w-80 border-l bg-slate-50 p-4 overflow-y-auto">
          <CannedResponsesPanel
            counselorId="current-user"
            onSelectResponse={handleSelectCannedResponse}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4 space-y-3">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded text-xs"
              >
                <FileText className="w-3 h-3 text-blue-600" />
                <span className="text-slate-700">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message... Use /keyword for quick responses"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Attach Document or Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Upload Document</label>
                    <input
                      type="file"
                      className="block w-full text-sm border rounded-lg p-2"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setAttachments([
                            ...attachments,
                            { name: e.target.files[0].name, url: '#' }
                          ]);
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleAddCourseLink} className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Add Course Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCanned(!showCanned)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Quick Responses
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={sendMessage.isPending}
            className="gap-2 bg-education-blue hover:bg-blue-700"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}