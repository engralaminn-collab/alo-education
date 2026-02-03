import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ApplicationNotesPanel({ applicationId }) {
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-notes'],
    queryFn: () => base44.auth.me()
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['application-notes', applicationId],
    queryFn: async () => {
      const allComments = await base44.entities.Comment.list('-created_date');
      return allComments.filter(c => c.application_id === applicationId);
    },
    enabled: !!applicationId
  });

  const addNote = useMutation({
    mutationFn: () => base44.entities.Comment.create({
      application_id: applicationId,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_role: 'counselor',
      comment_type: 'internal_note',
      content: newNote
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-notes'] });
      setNewNote('');
      toast.success('Note added');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4" />
          Internal Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a counselor note..."
            rows={3}
          />
          <Button
            onClick={() => addNote.mutate()}
            disabled={!newNote || addNote.isPending}
            size="sm"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-4">No notes yet</p>
          ) : (
            notes.map(note => (
              <div key={note.id} className="border rounded-lg p-3 bg-slate-50">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {note.author_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(note.created_date), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}