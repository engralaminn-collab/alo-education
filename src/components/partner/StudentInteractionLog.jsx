import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, FileText, Plus, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentInteractionLog({ partnerId }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [interaction, setInteraction] = useState({
    type: 'call',
    subject: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['partner-students', partnerId],
    queryFn: () => base44.entities.StudentProfile.filter({ counselor_id: partnerId }),
    enabled: !!partnerId
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['student-interactions', selectedStudent],
    queryFn: () => base44.entities.CounselorInteraction.filter({ 
      student_id: selectedStudent 
    }, '-created_date'),
    enabled: !!selectedStudent
  });

  const logMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.CounselorInteraction.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-interactions']);
      toast.success('Interaction logged successfully');
      setInteraction({ type: 'call', subject: '', notes: '' });
      setShowForm(false);
    }
  });

  const generateSummary = async () => {
    if (interactions.length === 0) return;
    
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('summarizeStudentCommunication', {
        student_id: selectedStudent,
        interactions: interactions.slice(0, 10)
      });
      
      toast.success('Summary generated');
      return response.data.summary;
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedStudent || !interaction.subject) {
      toast.error('Please select student and add subject');
      return;
    }

    logMutation.mutate({
      student_id: selectedStudent,
      counselor_id: partnerId,
      interaction_type: interaction.type,
      subject: interaction.subject,
      notes: interaction.notes,
      interaction_date: new Date().toISOString()
    });
  };

  const getIcon = (type) => {
    const icons = {
      call: <Phone className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      message: <MessageSquare className="w-4 h-4" />,
      note: <FileText className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Student Interaction Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedStudent && (
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Interaction
              </Button>
            )}
          </div>

          {showForm && (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4 space-y-3">
                <Select value={interaction.type} onValueChange={(v) => setInteraction({...interaction, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>

                <Input 
                  placeholder="Subject / Topic"
                  value={interaction.subject}
                  onChange={(e) => setInteraction({...interaction, subject: e.target.value})}
                />

                <Textarea 
                  placeholder="Notes / Details"
                  value={interaction.notes}
                  onChange={(e) => setInteraction({...interaction, notes: e.target.value})}
                  rows={4}
                />

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={logMutation.isPending}>
                    {logMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Interaction
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedStudent && interactions.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Recent Interactions</h4>
                <Button variant="outline" size="sm" onClick={generateSummary} disabled={generating}>
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  AI Summary
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {interactions.map((int) => (
                  <Card key={int.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 rounded">
                          {getIcon(int.interaction_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium">{int.subject}</h5>
                            <Badge variant="outline">
                              {new Date(int.interaction_date || int.created_date).toLocaleDateString()}
                            </Badge>
                          </div>
                          {int.notes && (
                            <p className="text-sm text-slate-600">{int.notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {selectedStudent && interactions.length === 0 && !showForm && (
            <div className="text-center py-8 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No interactions logged yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}