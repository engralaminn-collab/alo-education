import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Trash2, Eye, Calendar, ArrowRight,
  Bookmark, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SavedComparisons({ studentProfile }) {
  const queryClient = useQueryClient();

  const { data: savedComparisons = [] } = useQuery({
    queryKey: ['saved-comparisons', studentProfile?.id],
    queryFn: () => base44.entities.SavedComparison.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-comparisons'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, u) => {
    acc[u.id] = u;
    return acc;
  }, {});

  const deleteComparison = useMutation({
    mutationFn: (id) => base44.entities.SavedComparison.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-comparisons']);
      toast.success('Comparison deleted');
    },
    onError: () => {
      toast.error('Failed to delete comparison');
    }
  });

  const viewComparison = (comparison) => {
    const universityIds = comparison.university_ids.join(',');
    window.location.href = createPageUrl('Universities') + `?compare=${universityIds}`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-purple-600" />
            Saved Comparisons
          </CardTitle>
        </div>
        <Link to={createPageUrl('Universities')}>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {savedComparisons.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1 text-sm">No saved comparisons</h3>
            <p className="text-slate-500 text-sm mb-4">
              Compare universities and save them for later review
            </p>
            <Link to={createPageUrl('Universities')}>
              <Button size="sm" variant="outline">
                Browse Universities
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedComparisons.map((comparison) => (
              <div key={comparison.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {comparison.name || 'University Comparison'}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Saved {format(new Date(comparison.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewComparison(comparison)}
                      className="h-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteComparison.mutate(comparison.id)}
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {comparison.university_ids?.slice(0, 3).map((uniId) => {
                    const uni = universityMap[uniId];
                    return uni ? (
                      <Badge key={uniId} variant="outline" className="text-xs">
                        <Building2 className="w-3 h-3 mr-1" />
                        {uni.name}
                      </Badge>
                    ) : null;
                  })}
                  {comparison.university_ids?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{comparison.university_ids.length - 3} more
                    </Badge>
                  )}
                </div>

                {comparison.notes && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {comparison.notes}
                  </p>
                )}

                <Button
                  size="sm"
                  onClick={() => viewComparison(comparison)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  View Comparison
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}