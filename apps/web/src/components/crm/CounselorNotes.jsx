import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Mail, CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';

export default function CounselorNotes({ applicationId, studentId }) {
  const [note, setNote] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const queryClient = useQueryClient();

  const { data: application } = useQuery({
    queryKey: ['application-notes', applicationId],
    queryFn: () => base44.entities.Application.filter({ id: applicationId }).then(r => r[0]),
    enabled: !!applicationId,
  });

  const { data: student } = useQuery({
    queryKey: ['student-notes', studentId],
    queryFn: () => base44.entities.StudentProfile.filter({ id: studentId }).then(r => r[0]),
    enabled: !!studentId,
  });

  const existingNotes = application?.counselor_notes || '';

  const addNote = useMutation({
    mutationFn: async () => {
      const timestamp = new Date().toISOString();
      const newNoteText = `[${format(new Date(), 'MMM dd, yyyy HH:mm')}]\n${note}\n\n`;
      const updatedNotes = newNoteText + existingNotes;

      // Update application
      await base44.entities.Application.update(applicationId, {
        counselor_notes: updatedNotes
      });

      // Send email if enabled
      if (sendEmail && student?.email) {
        const emailBody = `Dear ${student.first_name || 'Student'},

Your counselor has added a new note to your application:

"${note}"

You can view your full application status by logging into your student portal.

Best regards,
ALO Education Team

---
This is an automated message. Please do not reply to this email.`;

        await base44.integrations.Core.SendEmail({
          from_name: 'ALO Education',
          to: student.email,
          subject: 'New Update on Your Application',
          body: emailBody
        });
      }

      return updatedNotes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['application-notes']);
      setNote('');
      toast.success(sendEmail ? 'Note added and email sent!' : 'Note added successfully!');
    },
    onError: () => {
      toast.error('Failed to add note');
    },
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Counselor Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for the student..."
            rows={4}
            className="mb-3"
          />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={sendEmail}
                onCheckedChange={setSendEmail}
                id="email-toggle"
              />
              <Label htmlFor="email-toggle" className="text-sm cursor-pointer">
                Send email notification to student
              </Label>
            </div>
            <Button
              onClick={() => addNote.mutate()}
              disabled={!note.trim() || addNote.isPending}
              size="sm"
            >
              {addNote.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Add Note
            </Button>
          </div>
        </div>

        {existingNotes && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-slate-700 mb-3">Previous Notes:</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {existingNotes.split('\n\n').filter(n => n.trim()).map((noteText, idx) => {
                const match = noteText.match(/\[(.*?)\]\n(.*)/s);
                if (match) {
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-slate-500">{match[1]}</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{match[2]}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}