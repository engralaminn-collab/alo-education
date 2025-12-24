import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function OutreachResponseTracker({ outreaches, students, universities }) {
  const queryClient = useQueryClient();

  const flagUrgent = useMutation({
    mutationFn: async ({ outreachId, reason }) => {
      await base44.entities.UniversityOutreach.update(outreachId, {
        is_urgent: true,
        urgency_reason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['university-outreaches']);
      toast.success('Marked as urgent');
    }
  });

  return (
    <div className="space-y-4">
      {outreaches.map(outreach => {
        const student = students.find(s => s.id === outreach.student_id);
        const university = universities.find(u => u.id === outreach.university_id);

        return (
          <Card key={outreach.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {university?.university_name}
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Student: {student?.first_name} {student?.last_name}
                  </p>
                  <Badge className="bg-green-100 text-green-700">
                    Responded {new Date(outreach.response_date).toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              {outreach.response_content && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {outreach.response_content}
                  </p>
                </div>
              )}

              {!outreach.is_urgent && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => flagUrgent.mutate({ 
                    outreachId: outreach.id, 
                    reason: 'Requires immediate action based on response' 
                  })}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Flag as Urgent
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}