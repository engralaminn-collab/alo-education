import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, FileText, MessageSquare, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { format } from 'date-fns';

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  approved: { 
    icon: CheckCircle, 
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  rejected: { 
    icon: XCircle, 
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
};

export default function DocumentCard({ document, isStudent = true }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ status, notes }) => 
      base44.entities.Document.update(document.id, { 
        status, 
        reviewer_notes: notes,
        reviewed_by: user?.email,
        reviewed_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document status updated');
      setNewComment('');
    },
  });

  const StatusIcon = statusConfig[document.status]?.icon || Clock;
  const config = statusConfig[document.status] || statusConfig.pending;

  return (
    <Card className="border-2 transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
            <FileText className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">{document.name}</h4>
                <p className="text-sm text-slate-500 capitalize">{document.document_type?.replace('_', ' ')}</p>
              </div>
              <Badge className={`${config.color} border flex items-center gap-1.5`}>
                <StatusIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                {document.status}
              </Badge>
            </div>

            {document.file_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(document.file_url, '_blank')}
                className="mt-2"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>
            )}

            {document.reviewer_notes && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
                <p className="text-sm font-medium text-slate-700 mb-1">Counselor Feedback:</p>
                <p className="text-sm text-slate-600">{document.reviewer_notes}</p>
                {document.reviewed_by && (
                  <p className="text-xs text-slate-500 mt-2">
                    By {document.reviewed_by} • {document.reviewed_date && format(new Date(document.reviewed_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            )}

            {!isStudent && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="text-slate-600"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {showComments ? 'Hide' : 'Add'} Feedback
                </Button>

                {showComments && (
                  <div className="mt-3 space-y-3">
                    <Textarea
                      placeholder="Add feedback or comments..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ status: 'approved', notes: newComment })}
                        disabled={updateStatus.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus.mutate({ status: 'rejected', notes: newComment })}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}