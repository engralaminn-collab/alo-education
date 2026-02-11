import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, MessageSquare, User, Clock, Send, Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMMessages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageText, setMessageText] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['crm-students'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['crm-messages', selectedStudent?.id],
    queryFn: () => base44.entities.Message.filter({ 
      conversation_id: selectedStudent?.id 
    }, 'created_date'),
    enabled: !!selectedStudent?.id,
  });

  const filteredStudents = students.filter(s =>
    s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CRMLayout title="Messages">
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] min-h-[500px]">
        {/* Conversations List */}
        <Card className="border-0 shadow-sm lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedStudent?.id === student.id
                      ? 'bg-emerald-50 border-2 border-emerald-500'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-semibold">
                      {student.first_name?.charAt(0) || student.email?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">
                        {student.first_name} {student.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{student.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No conversations found
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="border-0 shadow-sm lg:col-span-2 flex flex-col">
          {selectedStudent ? (
            <>
              {/* Header */}
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold">
                    {selectedStudent.first_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </h4>
                    <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">No Messages Yet</h3>
                    <p className="text-slate-500 text-sm">
                      Start the conversation with this student
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isFromStudent = msg.sender_type === 'student';
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isFromStudent ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[70%]`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                              isFromStudent 
                                ? 'bg-slate-100 rounded-bl-md' 
                                : 'bg-emerald-500 text-white rounded-br-md'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-slate-400 ${
                              isFromStudent ? '' : 'justify-end'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {msg.created_date && format(new Date(msg.created_date), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-3">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Paperclip className="w-5 h-5 text-slate-400" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-emerald-500 hover:bg-emerald-600 shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Select a Conversation</h3>
                <p className="text-slate-500 text-sm">
                  Choose a student from the list to view messages
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </CRMLayout>
  );
}