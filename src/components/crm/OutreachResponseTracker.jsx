<<<<<<< HEAD
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
=======
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle, Info, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ResponseAnalysisPanel from './ResponseAnalysisPanel';

export default function OutreachResponseTracker({ outreaches, students, universities }) {
  const [selectedOutreach, setSelectedOutreach] = useState(null);

  if (!outreaches || outreaches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No responses yet</p>
        </CardContent>
      </Card>
    );
  }

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'negative': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Info className="w-4 h-4 text-blue-600" />;
      case 'informational': return <Info className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      case 'neutral': return 'bg-blue-100 text-blue-700';
      case 'informational': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <div className="space-y-4">
        {outreaches.map(outreach => {
          const student = students.find(s => s.id === outreach.student_id);
          const university = universities.find(u => u.id === outreach.university_id);

          return (
            <Card 
              key={outreach.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedOutreach(outreach)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {university?.university_name || university?.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Student: {student?.first_name} {student?.last_name}
                    </p>
                    {outreach.response_summary && (
                      <p className="text-xs text-slate-600 italic line-clamp-2">
                        "{outreach.response_summary}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-green-100 text-green-700">
                      Responded
                    </Badge>
                    {outreach.response_sentiment && (
                      <Badge className={getSentimentColor(outreach.response_sentiment)}>
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(outreach.response_sentiment)}
                          {outreach.response_sentiment}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {outreach.response_date && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(outreach.response_date), 'MMM d, yyyy')}
                    </p>
                  )}
                  
                  {outreach.action_required && (
                    <div className="flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                      Action Required
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Response Detail Dialog */}
      <Dialog open={!!selectedOutreach} onOpenChange={() => setSelectedOutreach(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Response Analysis: {universities.find(u => u.id === selectedOutreach?.university_id)?.university_name}
            </DialogTitle>
          </DialogHeader>
          {selectedOutreach && (
            <ResponseAnalysisPanel
              outreach={selectedOutreach}
              student={students.find(s => s.id === selectedOutreach.student_id)}
              university={universities.find(u => u.id === selectedOutreach.university_id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
>>>>>>> last/main
  );
}