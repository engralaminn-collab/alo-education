import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, AlertCircle, Star, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SharedNotesPanel({ studentId, currentCounselorId, currentCounselorName }) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [isImportant, setIsImportant] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['shared-notes', studentId],
    queryFn: async () => {
      try {
        return await base44.entities.SharedNote.filter({ student_id: studentId }, '-created_date');
      } catch {
        return [];
      }
    },
    enabled: !!studentId,
  });

  const createNoteMutation = useMutation({
    mutationFn: (noteData) => base44.entities.SharedNote.create({
      ...noteData,
      student_id: studentId,
      author_id: currentCounselorId,
      author_name: currentCounselorName,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-notes'] });
      setShowAddNote(false);
      setNoteContent('');
      setTags([]);
      setIsImportant(false);
      toast.success('Note added');
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!noteContent.trim()) return;
    
    createNoteMutation.mutate({
      content: noteContent,
      note_type: noteType,
      is_important: isImportant,
      tags,
    });
  };

  const noteTypeColors = {
    general: 'bg-slate-100 text-slate-700',
    concern: 'bg-red-100 text-red-700',
    achievement: 'bg-green-100 text-green-700',
    meeting: 'bg-blue-100 text-blue-700',
    follow_up: 'bg-amber-100 text-amber-700',
  };

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
            <MessageSquare className="w-5 h-5" />
            Shared Notes ({notes.length})
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddNote(!showAddNote)} style={{ backgroundColor: '#F37021' }}>
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddNote && (
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <div className="flex gap-2">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="general">General</option>
                <option value="concern">Concern</option>
                <option value="achievement">Achievement</option>
                <option value="meeting">Meeting</option>
                <option value="follow_up">Follow Up</option>
              </select>
              <Button
                size="sm"
                variant={isImportant ? 'default' : 'outline'}
                onClick={() => setIsImportant(!isImportant)}
              >
                <Star className={`w-4 h-4 ${isImportant ? 'fill-white' : ''}`} />
              </Button>
            </div>

            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Share your notes with the team..."
              rows={4}
            />

            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..."
                  className="text-sm"
                />
                <Button size="sm" onClick={addTag}>
                  <Tag className="w-3 h-3" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createNoteMutation.isPending} style={{ backgroundColor: '#0066CC' }}>
                Save Note
              </Button>
              <Button variant="outline" onClick={() => setShowAddNote(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No notes yet</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border ${
                  note.is_important ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={noteTypeColors[note.note_type]}>
                      {note.note_type}
                    </Badge>
                    {note.is_important && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </div>
                  <span className="text-xs text-slate-500">
                    {note.created_date && format(new Date(note.created_date), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-2">{note.content}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">By: {note.author_name}</p>
                  {note.tags?.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}