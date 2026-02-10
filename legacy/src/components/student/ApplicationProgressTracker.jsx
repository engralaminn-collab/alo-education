import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplicationProgressTracker({ application, onRefresh }) {
  const [analysis, setAnalysis] = useState(null);

  const analyzeProgress = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('analyzeApplicationProgress', {
        application_id: application.id
      });
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast.success(`AI Analysis complete. ${data.tasks_created} tasks created.`);
      if (onRefresh) onRefresh();
    }
  });

  const healthColor = analysis?.health_score >= 75 ? 'text-green-600' : 
                      analysis?.health_score >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Progress Analysis
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeProgress.mutate()}
            disabled={analyzeProgress.isPending}
          >
            {analyzeProgress.isPending ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis ? (
          <>
            {/* Health Score */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600">Application Health</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className={`w-5 h-5 ${healthColor}`} />
                  <span className={`text-2xl font-bold ${healthColor}`}>
                    {analysis.health_score}%
                  </span>
                </div>
              </div>
              <Progress value={analysis.health_score} className="w-32" />
            </div>

            {/* Bottlenecks */}
            {analysis.bottlenecks?.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Critical Bottlenecks
                </h4>
                <div className="space-y-2">
                  {analysis.bottlenecks.map((bottleneck, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <Badge className={
                        bottleneck.severity === 'high' ? 'bg-red-500' :
                        bottleneck.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                      }>
                        {bottleneck.severity}
                      </Badge>
                      <p className="text-sm text-slate-700 flex-1">{bottleneck.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Documents */}
            {analysis.missing_documents?.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Missing Documents
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_documents.map((doc, i) => (
                    <Badge key={i} variant="outline" className="text-slate-700">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Next Actions */}
            {analysis.next_actions?.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Recommended Next Steps
                </h4>
                <ul className="space-y-1">
                  {analysis.next_actions.map((action, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Run AI analysis to identify bottlenecks and get recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}