import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, Loader2, BarChart3, Users, Mail } from 'lucide-react';
import { toast } from 'sonner';
import StudentAnalyticsDashboard from '@/components/reports/StudentAnalyticsDashboard';
import CounselorPerformanceDashboard from '@/components/reports/CounselorPerformanceDashboard';
import OutreachSuccessDashboard from '@/components/reports/OutreachSuccessDashboard';

export default function CRMReports() {
  const [reportType, setReportType] = useState('all');
  const [insightsData, setInsightsData] = useState(null);

  const generateInsights = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateCRMInsights', {
        reportType,
        dateFrom: null,
        dateTo: null
      });
      return response.data;
    },
    onSuccess: (data) => {
      setInsightsData(data.insights);
      toast.success('AI insights generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate insights: ' + error.message);
    }
  });

  const exportReport = () => {
    if (!insightsData) {
      toast.error('Generate insights first');
      return;
    }

    const reportContent = JSON.stringify(insightsData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <CRMLayout 
      currentPage="Reports"
      actions={
        <div className="flex gap-3">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="student_analytics">Student Analytics</SelectItem>
              <SelectItem value="counselor_performance">Counselor Performance</SelectItem>
              <SelectItem value="outreach_success">Outreach Success</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => generateInsights.mutate()}
            disabled={generateInsights.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generateInsights.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>

          {insightsData && (
            <Button
              onClick={exportReport}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {!insightsData ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Generate AI-Powered Insights
              </h3>
              <p className="text-slate-600 mb-6">
                Select a report type and click "Generate AI Insights" to analyze your CRM data
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-left">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <BarChart3 className="w-4 h-4" />
                    Student trends & conversion analysis
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Users className="w-4 h-4" />
                    Counselor performance & workload
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    University outreach effectiveness
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="student" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl">
              <TabsTrigger value="student">
                <BarChart3 className="w-4 h-4 mr-2" />
                Student Analytics
              </TabsTrigger>
              <TabsTrigger value="counselor">
                <Users className="w-4 h-4 mr-2" />
                Counselor Performance
              </TabsTrigger>
              <TabsTrigger value="outreach">
                <Mail className="w-4 h-4 mr-2" />
                Outreach Success
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <StudentAnalyticsDashboard insights={insightsData.student_analytics} />
            </TabsContent>

            <TabsContent value="counselor">
              <CounselorPerformanceDashboard insights={insightsData.counselor_performance} />
            </TabsContent>

            <TabsContent value="outreach">
              <OutreachSuccessDashboard insights={insightsData.outreach_success} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </CRMLayout>
  );
}