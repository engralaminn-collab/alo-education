import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Users, Send, Search, Loader2 } from 'lucide-react';

export default function GroupMessagingPanel() {
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-list'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 100)
  });

  const sendGroupMessage = useMutation({
    mutationFn: async ({ groupId, groupName, content, recipients }) => {
      return base44.entities.GroupMessage.create({
        group_id: groupId,
        group_name: groupName,
        sender_id: user?.id,
        sender_name: user?.full_name || user?.email,
        sender_type: 'counselor',
        content,
        recipients: recipients.map(s => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          type: 'student'
        })),
        read_by: [user?.id]
      });
    },
    onSuccess: () => {
      toast.success('Message sent to group');
      setMessage('');
      setSelectedStudents([]);
      setGroupName('');
      queryClient.invalidateQueries({ queryKey: ['group-messages'] });
    },
    onError: () => {
      toast.error('Failed to send group message');
    }
  });

  const handleToggleStudent = (student) => {
    if (selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleSend = () => {
    if (!message.trim() || selectedStudents.length === 0) {
      toast.error('Please select students and enter a message');
      return;
    }

    const groupId = `group_${Date.now()}`;
    const finalGroupName = groupName || `Group of ${selectedStudents.length} students`;

    sendGroupMessage.mutate({
      groupId,
      groupName: finalGroupName,
      content: message,
      recipients: selectedStudents
    });
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-0 shadow-sm dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <Users className="w-5 h-5 text-education-blue" />
          Group Messaging
        </CardTitle>
        <CardDescription className="dark:text-slate-400">
          Send messages to multiple students at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Group Name */}
        <div>
          <label className="text-sm font-medium dark:text-white">Group Name (Optional)</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., September 2026 Intake"
            className="mt-1 dark:bg-slate-700"
          />
        </div>

        {/* Selected Students */}
        {selectedStudents.length > 0 && (
          <div>
            <label className="text-sm font-medium dark:text-white mb-2 block">
              Selected ({selectedStudents.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map(s => (
                <Badge
                  key={s.id}
                  variant="outline"
                  className="cursor-pointer select-none dark:bg-slate-700 dark:text-white"
                  onClick={() => handleToggleStudent(s)}
                >
                  {s.first_name} {s.last_name} ✕
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Student Selection */}
        <div>
          <label className="text-sm font-medium dark:text-white">Select Students</label>
          <div className="mt-2 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-10 dark:bg-slate-700"
              />
            </div>

            <ScrollArea className="h-48 border dark:border-slate-700 rounded-lg p-3">
              <div className="space-y-2">
                {filteredStudents.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No students found
                  </p>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer select-none"
                      onClick={() => handleToggleStudent(student)}
                    >
                      <Checkbox
                        checked={!!selectedStudents.find(s => s.id === student.id)}
                        onCheckedChange={() => handleToggleStudent(student)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium dark:text-white">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                      </div>
                      {student.status && (
                        <Badge variant="outline" className="text-xs dark:bg-slate-700">
                          {student.status}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-medium dark:text-white">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message to the group..."
            className="mt-1 dark:bg-slate-700"
            rows={4}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || selectedStudents.length === 0 || sendGroupMessage.isPending}
          className="w-full bg-education-blue select-none"
        >
          {sendGroupMessage.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send to {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}