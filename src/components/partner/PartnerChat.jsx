import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function PartnerChat({ partnerId, currentUser }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['partner-students-chat', partnerId],
    queryFn: () => base44.entities.StudentProfile.filter({ source: `partner_${partnerId}` }),
    enabled: !!partnerId
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['partner-messages', selectedConversation],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_id: selectedConversation }),
    enabled: !!selectedConversation,
    refetchInterval: 3000 // Real-time updates every 3 seconds
  });

  useEffect(() => {
    const unsubscribe = selectedConversation ? base44.entities.DirectMessage.subscribe((event) => {
      if (event.data?.conversation_id === selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ['partner-messages', selectedConversation] });
      }
    }) : null;

    return () => unsubscribe?.();
  }, [selectedConversation, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      await base44.entities.DirectMessage.create({
        conversation_id: selectedConversation,
        sender_type: 'partner',
        sender_id: currentUser?.id,
        sender_name: currentUser?.full_name,
        recipient_type: 'student',
        recipient_id: selectedStudent?.id,
        recipient_name: `${selectedStudent?.first_name} ${selectedStudent?.last_name}`,
        message_type: 'chat',
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-messages'] });
      setMessage('');
    },
    onError: () => toast.error('Failed to send message')
  });

  const selectedStudent = students.find(s => `conv_partner_${partnerId}_student_${s.id}` === selectedConversation);
  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Students
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            {filteredStudents.map(student => {
              const conversationId = `conv_partner_${partnerId}_student_${student.id}`;
              const isActive = selectedConversation === conversationId;
              
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedConversation(conversationId)}
                  className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                    isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-education-blue to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {student.first_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{student.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{student.status}</Badge>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedStudent ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-education-blue to-cyan-500 flex items-center justify-center text-white font-semibold">
                  {selectedStudent.first_name?.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </CardTitle>
                  <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn 
                            ? 'bg-education-blue text-white' 
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>
                            {new Date(msg.created_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMessage.mutate(message); }} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a student to start chatting</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}