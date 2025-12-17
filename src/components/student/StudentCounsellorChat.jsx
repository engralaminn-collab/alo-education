import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Send, Paperclip, X, Download } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';

export default function StudentCounsellorChat({ studentProfile, application }) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const conversationId = application?.id || studentProfile?.id || 'general';

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: () => base44.entities.Message.filter(
      { conversation_id: conversationId },
      '-created_date',
      100
    ),
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
  });

  const { data: counselor } = useQuery({
    queryKey: ['counselor', studentProfile?.counselor_id],
    queryFn: () => base44.entities.Counselor.filter({ id: studentProfile.counselor_id }),
    enabled: !!studentProfile?.counselor_id,
  });

  const sendMessage = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Message.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages', conversationId]);
      setMessage('');
      setAttachments([]);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments([...attachments, { name: file.name, url: file_url }]);
      toast.success('File attached');
    } catch (error) {
      toast.error('Failed to upload file');
    }
    setUploadingFile(false);
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;

    sendMessage.mutate({
      conversation_id: conversationId,
      sender_id: studentProfile?.user_id,
      sender_type: 'student',
      recipient_id: studentProfile?.counselor_id,
      content: message,
      attachments: attachments,
      is_read: false
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const counselorData = counselor?.[0];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#0066CC' }}>
            {counselorData?.name?.charAt(0) || 'C'}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {counselorData?.name || 'Your Counsellor'}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Online
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p>Start a conversation with your counsellor</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isStudent = msg.sender_type === 'student';
            return (
              <div key={msg.id} className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isStudent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-lg p-3`}>
                  <p className="text-sm">{msg.content}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att, idx) => (
                        <a 
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs underline"
                        >
                          <Download className="w-3 h-3" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {format(new Date(msg.created_date), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <Badge key={idx} variant="outline" className="gap-2">
                {att.name}
                <button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            onClick={handleSend}
            disabled={sendMessage.isPending}
            style={{ backgroundColor: '#F37021', color: '#000000' }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}