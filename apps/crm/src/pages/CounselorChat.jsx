import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle, Users, FileText } from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import RealTimeChat from '@/components/messaging/RealTimeChat';
import GroupMessagingPanel from '@/components/messaging/GroupMessagingPanel';
import MessageTemplatesPanel from '@/components/messaging/MessageTemplatesPanel';

export default function CounselorChat() {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageTemplate, setMessageTemplate] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['students-chat'],
    queryFn: () => base44.entities.StudentProfile.list('-updated_date', 50)
  });

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CRMLayout title="Messaging">
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-800 shadow-sm p-1">
          <TabsTrigger value="chat" className="select-none">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="group" className="select-none">
            <Users className="w-4 h-4 mr-2" />
            Group Messaging
          </TabsTrigger>
          <TabsTrigger value="templates" className="select-none">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Students List */}
            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="pl-10 dark:bg-slate-700"
                  />
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredStudents.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                        No students found
                      </p>
                    ) : (
                      filteredStudents.map(student => (
                        <div
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-3 rounded-lg cursor-pointer transition-all select-none ${
                            selectedStudent?.id === student.id
                              ? 'bg-education-blue/10 border-education-blue border'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                              {student.first_name?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm dark:text-white truncate">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <div className="md:col-span-2">
              {selectedStudent ? (
                <RealTimeChat
                  conversationId={`conv_${selectedStudent.id}`}
                  recipientId={selectedStudent.id}
                  recipientName={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                  recipientType="student"
                />
              ) : (
                <Card className="border-0 shadow-sm dark:bg-slate-800 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Select a student to chat
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Choose from the list to start a conversation
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="group">
          <div className="max-w-3xl mx-auto">
            <GroupMessagingPanel />
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="max-w-4xl mx-auto">
            <MessageTemplatesPanel
              onSelectTemplate={(template) => {
                setMessageTemplate(template.content);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}