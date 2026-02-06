import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, Clock, AlertCircle, RefreshCw, 
  Mail, CheckCircle, Sparkles, Eye 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CRMApplicationStatusMonitor() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: statusUpdates = [] } = useQuery({
    queryKey: ['all-status-updates'],
    queryFn: () => base44.entities.ApplicationStatusUpdate.list('-created_date', 100)
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-monitor'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-monitor'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const runStatusCheck = useMutation({
    mutationFn: () => base44.functions.invoke('checkApplicationStatusUpdates', {}),
    onSuccess: (response) => {
      toast.success(`Checked ${response.data.applications_checked} applications`);
      queryClient.invalidateQueries({ queryKey: ['all-status-updates'] });
    },
    onError: () => {
      toast.error('Failed to run status check');
    }
  });

  const autoDetected = statusUpdates.filter(u => u.auto_detected);
  const manualUpdates = statusUpdates.filter(u => !u.auto_detected);
  const recentUpdates = statusUpdates.slice(0, 20);

  const stuckApplications = applications.filter(app => {
    const daysSinceUpdate = app.updated_date 
      ? (Date.now() - new Date(app.updated_date).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    return daysSinceUpdate > 30 && app.status === 'under_review';
  });

  const approachingDeadlines = applications.filter(app => {
    if (!app.offer_deadline) return false;
    const daysUntil = (new Date(app.offer_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 7;
  });

  return (
    <CRMLayout
      title="Application Status Monitor"
      actions={
        <Button
          onClick={() => runStatusCheck.mutate()}
          disabled={runStatusCheck.isPending}
          className="bg-blue-600"
        >
          {runStatusCheck.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Status Check
            </>
          )}
        </Button>
      }
    >
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Auto-Detected</p>
                <p className="text-3xl font-bold text-purple-600">{autoDetected.length}</p>
              </div>
              <Sparkles className="w-10 h-10 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Manual Updates</p>
                <p className="text-3xl font-bold text-blue-600">{manualUpdates.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Stuck Applications</p>
                <p className="text-3xl font-bold text-orange-600">{stuckApplications.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Urgent Deadlines</p>
                <p className="text-3xl font-bold text-red-600">{approachingDeadlines.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Updates</TabsTrigger>
          <TabsTrigger value="automated">AI Detected</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Status Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUpdates.map(update => {
                  const app = applications.find(a => a.id === update.application_id);
                  const student = students.find(s => s.id === app?.student_id);

                  return (
                    <div key={update.id} className="p-4 border rounded-lg bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {student?.first_name} {student?.last_name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {update.previous_status?.replace(/_/g, ' ')} → <span className="font-semibold">{update.new_status?.replace(/_/g, ' ')}</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {update.auto_detected && (
                            <Badge className="bg-purple-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Detected
                            </Badge>
                          )}
                          <Badge className={
                            update.update_source === 'email' ? 'bg-blue-600' :
                            update.update_source === 'webhook' ? 'bg-green-600' :
                            'bg-slate-600'
                          }>
                            {update.update_source}
                          </Badge>
                        </div>
                      </div>

                      {update.confidence_score && (
                        <p className="text-xs text-slate-500 mb-2">
                          Confidence: {update.confidence_score}%
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{format(new Date(update.created_date), 'MMM d, yyyy HH:mm')}</span>
                        {update.notification_sent_student && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Student notified
                          </span>
                        )}
                        {update.notification_sent_counselor && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Counselor notified
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI-Detected Status Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {autoDetected.map(update => {
                  const app = applications.find(a => a.id === update.application_id);
                  const student = students.find(s => s.id === app?.student_id);

                  return (
                    <div key={update.id} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {student?.first_name} {student?.last_name}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Status: <span className="font-semibold">{update.new_status?.replace(/_/g, ' ')}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Confidence: {update.confidence_score}%
                          </p>
                        </div>
                        <Badge className="bg-purple-600">
                          {update.update_source}
                        </Badge>
                      </div>

                      {update.detected_from_email && (
                        <div className="mt-3 p-3 bg-white rounded border text-xs">
                          <p className="font-semibold text-slate-700 mb-1">Email Excerpt:</p>
                          <p className="text-slate-600 line-clamp-3">{update.detected_from_email}</p>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 mt-2">
                        {format(new Date(update.created_date), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  );
                })}

                {autoDetected.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No AI-detected updates yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-6">
            {/* Stuck Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Stuck Applications (30+ days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stuckApplications.map(app => {
                    const student = students.find(s => s.id === app.student_id);
                    const daysSinceUpdate = app.updated_date 
                      ? Math.floor((Date.now() - new Date(app.updated_date).getTime()) / (1000 * 60 * 60 * 24))
                      : 999;

                    return (
                      <div key={app.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              Stuck in "{app.status.replace(/_/g, ' ')}" for {daysSinceUpdate} days
                            </p>
                          </div>
                          <Badge className="bg-orange-600">
                            Action Needed
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {stuckApplications.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p>No stuck applications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Approaching Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Urgent Deadlines (Next 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approachingDeadlines.map(app => {
                    const student = students.find(s => s.id === app.student_id);
                    const daysUntil = Math.ceil(
                      (new Date(app.offer_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div key={app.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              Deadline in {daysUntil} days: {format(new Date(app.offer_deadline), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge className="bg-red-600">
                            {daysUntil} days
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {approachingDeadlines.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p>No urgent deadlines</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}