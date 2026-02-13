import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Mail, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';

export default function ScheduledReportsManager() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [newReport, setNewReport] = useState({
    report_name: '',
    report_type: 'all',
    frequency: 'weekly',
    recipients: ''
  });

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => base44.entities.ScheduledReport.list()
  });

  const createReport = useMutation({
    mutationFn: async (data) => {
      return base44.entities.ScheduledReport.create({
        ...data,
        recipients: data.recipients.split(',').map(e => e.trim()).filter(e => e)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Scheduled report created');
      setShowDialog(false);
      setNewReport({ report_name: '', report_type: 'all', frequency: 'weekly', recipients: '' });
    },
    onError: () => toast.error('Failed to create report')
  });

  const toggleReport = useMutation({
    mutationFn: async (report) => {
      return base44.entities.ScheduledReport.update(report.id, {
        is_active: !report.is_active
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Report status updated');
    }
  });

  const deleteReport = useMutation({
    mutationFn: async (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Report deleted');
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Scheduled Reports
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Automated Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Report Name</Label>
                <Input
                  value={newReport.report_name}
                  onChange={(e) => setNewReport({ ...newReport, report_name: e.target.value })}
                  placeholder="Weekly Performance Report"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select value={newReport.report_type} onValueChange={(v) => setNewReport({ ...newReport, report_type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    <SelectItem value="student_analytics">Student Analytics</SelectItem>
                    <SelectItem value="counselor_performance">Counselor Performance</SelectItem>
                    <SelectItem value="outreach_success">Outreach Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={newReport.frequency} onValueChange={(v) => setNewReport({ ...newReport, frequency: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recipients (comma-separated emails)</Label>
                <Input
                  value={newReport.recipients}
                  onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                  placeholder="manager@alo.com, admin@alo.com"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => createReport.mutate(newReport)}
                disabled={createReport.isPending}
                className="w-full bg-blue-600"
              >
                {createReport.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {scheduledReports.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No scheduled reports yet</p>
        ) : (
          <div className="space-y-3">
            {scheduledReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{report.report_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{report.report_type}</Badge>
                    <Badge variant="outline">{report.frequency}</Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Mail className="w-3 h-3" />
                      {report.recipients.length} recipients
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={report.is_active ? 'bg-green-600' : 'bg-slate-400'}>
                    {report.is_active ? 'Active' : 'Paused'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleReport.mutate(report)}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReport.mutate(report.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}