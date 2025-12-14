import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SavedComparisons({ studentProfile }) {
  const { data: comparisons = [] } = useQuery({
    queryKey: ['saved-comparisons', studentProfile?.id],
    queryFn: () => base44.entities.SavedComparison.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="w-5 h-5" style={{ color: '#0B5ED7' }} />
          Saved Comparisons
        </CardTitle>
      </CardHeader>
      <CardContent>
        {comparisons.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <Scale className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved comparisons yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comparisons.slice(0, 3).map(comp => (
              <div key={comp.id} className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 text-sm mb-1">
                  {comp.name || 'University Comparison'}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{comp.university_ids?.length || 0} universities</span>
                  <Link to={createPageUrl('Universities')} className="text-blue-600 hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}