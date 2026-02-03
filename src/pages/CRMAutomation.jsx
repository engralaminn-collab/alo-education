import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Zap, Send, UserPlus, RefreshCw, Clock, 
  CheckCircle, Settings, Brain, Shield
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import WorkflowAutomation from '@/components/crm/WorkflowAutomation';
import CommunicationParser from '@/components/crm/CommunicationParser';

export default function CRMAutomation() {
  const queryClient = useQueryClient();
  const [automating, setAutomating] = useState(false);

  const [settings, setSettings] = useState({
    auto_follow_up: true,
    follow_up_days_before: 3,
    auto_assign_leads: true,
    auto_status_update: true,
    send_reminder_emails: true,
  });

  // Automation: Auto-assign leads to counselors
  const autoAssignLeads = useMutation({
    mutationFn: async () => {
      const inquiries = await base44.entities.Inquiry.filter({ status: 'new' });
      const counselors = await base44.entities.Counselor.filter({ 
        status: 'active', 
        is_available: true 
      });

      if (counselors.length === 0) return { assigned: 0 };

      // Sort counselors by current workload
      const sorted = counselors.sort((a, b) => 
        (a.current_students || 0) - (b.current_students || 0)
      );

      let assigned = 0;
      for (const inquiry of inquiries) {
        // Find counselor with matching specialization or lowest workload
        const counselor = sorted.find(c => 
          c.specializations?.some(s => 
            inquiry.country_of_interest?.toLowerCase().includes(s.toLowerCase())
          ) && (c.current_students || 0) < (c.max_students || 50)
        ) || sorted[0];

        if (counselor && (counselor.current_students || 0) < (counselor.max_students || 50)) {
          await base44.entities.Inquiry.update(inquiry.id, {
            assigned_to: counselor.user_id,
            status: 'contacted'
          });
          assigned++;
        }
      }

      return { assigned };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-inquiries'] });
      toast.success(`Auto-assigned ${data.assigned} new leads to counselors`);
    }
  });

  // Automation: Create follow-up tasks for upcoming deadlines
  const createFollowUpTasks = useMutation({
    mutationFn: async () => {
      const { data: user } = await base44.auth.me();
      const applications = await base44.entities.Application.filter({
        status: { $in: ['documents_pending', 'under_review', 'submitted_to_university'] }
      });

      const deadlineThreshold = new Date();
      deadlineThreshold.setDate(deadlineThreshold.getDate() + settings.follow_up_days_before);

      let created = 0;
      for (const app of applications) {
        if (app.offer_deadline) {
          const deadline = new Date(app.offer_deadline);
          if (deadline <= deadlineThreshold && deadline >= new Date()) {
            // Check if task already exists
            const existingTasks = await base44.entities.Task.filter({
              application_id: app.id,
              type: 'follow_up',
              status: { $ne: 'completed' }
            });

            if (existingTasks.length === 0) {
              await base44.entities.Task.create({
                title: `Follow up on application deadline`,
                description: `Application deadline approaching on ${app.offer_deadline}`,
                type: 'follow_up',
                student_id: app.student_id,
                application_id: app.id,
                assigned_to: app.counselor_id || user.id,
                priority: 'high',
                due_date: app.offer_deadline,
                status: 'pending'
              });
              created++;
            }
          }
        }
      }

      return { created };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast.success(`Created ${data.created} follow-up tasks for upcoming deadlines`);
    }
  });

  // Automation: Auto-update application status based on milestones
  const autoUpdateStatuses = useMutation({
    mutationFn: async () => {
      const applications = await base44.entities.Application.list();
      
      let updated = 0;
      for (const app of applications) {
        let newStatus = app.status;
        
        // If all documents submitted and status is draft
        if (app.status === 'draft' && app.milestones?.documents_submitted?.completed) {
          newStatus = 'documents_pending';
        }
        
        // If application submitted
        if (app.status === 'documents_pending' && app.milestones?.application_submitted?.completed) {
          newStatus = 'under_review';
        }
        
        // If offer received
        if (['under_review', 'submitted_to_university'].includes(app.status) && 
            app.milestones?.offer_received?.completed) {
          newStatus = 'conditional_offer';
        }
        
        // If visa approved
        if (app.milestones?.visa_approved?.completed && app.status !== 'enrolled') {
          newStatus = 'visa_processing';
        }
        
        // If enrolled
        if (app.milestones?.enrolled?.completed && app.status !== 'enrolled') {
          newStatus = 'enrolled';
        }

        if (newStatus !== app.status) {
          await base44.entities.Application.update(app.id, { status: newStatus });
          updated++;
        }
      }

      return { updated };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-applications'] });
      toast.success(`Auto-updated ${data.updated} application statuses`);
    }
  });

  const runAllAutomations = async () => {
    setAutomating(true);
    try {
      if (settings.auto_assign_leads) await autoAssignLeads.mutateAsync();
      if (settings.auto_follow_up) await createFollowUpTasks.mutateAsync();
      if (settings.auto_status_update) await autoUpdateStatuses.mutateAsync();
      toast.success('All automations completed successfully');
    } catch (error) {
      toast.error('Some automations failed');
    } finally {
      setAutomating(false);
    }
  };

  return (
    <CRMLayout 
      title="Automation & Workflows"
      actions={
        <Button 
          onClick={runAllAutomations}
          disabled={automating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {automating ? 'Running...' : 'Run All Automations'}
        </Button>
      }
    >
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Auto-Assign Leads */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Auto-Assign Leads
            </CardTitle>
            <CardDescription>
              Automatically assign new inquiries to available counselors based on specialization and workload
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Auto-Assignment</Label>
              <Switch
                checked={settings.auto_assign_leads}
                onCheckedChange={(v) => setSettings({ ...settings, auto_assign_leads: v })}
              />
            </div>
            <Button 
              onClick={() => autoAssignLeads.mutate()}
              disabled={!settings.auto_assign_leads || autoAssignLeads.isPending}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoAssignLeads.isPending ? 'animate-spin' : ''}`} />
              Run Now
            </Button>
          </CardContent>
        </Card>

        {/* Follow-up Reminders */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-amber-600" />
              Follow-up Reminders
            </CardTitle>
            <CardDescription>
              Create tasks for counselors when application deadlines are approaching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Reminders</Label>
              <Switch
                checked={settings.auto_follow_up}
                onCheckedChange={(v) => setSettings({ ...settings, auto_follow_up: v })}
              />
            </div>
            <div>
              <Label>Days before deadline</Label>
              <Input
                type="number"
                value={settings.follow_up_days_before}
                onChange={(e) => setSettings({ ...settings, follow_up_days_before: parseInt(e.target.value) })}
                className="mt-2"
                min="1"
                max="30"
              />
            </div>
            <Button 
              onClick={() => createFollowUpTasks.mutate()}
              disabled={!settings.auto_follow_up || createFollowUpTasks.isPending}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${createFollowUpTasks.isPending ? 'animate-spin' : ''}`} />
              Run Now
            </Button>
          </CardContent>
        </Card>

        {/* Auto Status Updates */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Auto Status Updates
            </CardTitle>
            <CardDescription>
              Update application statuses automatically when milestones are completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Auto-Updates</Label>
              <Switch
                checked={settings.auto_status_update}
                onCheckedChange={(v) => setSettings({ ...settings, auto_status_update: v })}
              />
            </div>
            <Button 
              onClick={() => autoUpdateStatuses.mutate()}
              disabled={!settings.auto_status_update || autoUpdateStatuses.isPending}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoUpdateStatuses.isPending ? 'animate-spin' : ''}`} />
              Run Now
            </Button>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="w-5 h-5 text-purple-600" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Send automated reminder emails to students about pending actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Email Reminders</Label>
              <Switch
                checked={settings.send_reminder_emails}
                onCheckedChange={(v) => setSettings({ ...settings, send_reminder_emails: v })}
              />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> Email notifications will be sent automatically when tasks are created or deadlines are approaching.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Features */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <WorkflowAutomation />
        <CommunicationParser />
      </div>

      {/* Automation Benefits */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Automation Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <UserPlus className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Faster Lead Response</h4>
              <p className="text-sm text-slate-600">
                New inquiries are instantly assigned to the best-fit counselor
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <Clock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Never Miss a Deadline</h4>
              <p className="text-sm text-slate-600">
                Automatic reminders ensure timely follow-ups
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Real-time Tracking</h4>
              <p className="text-sm text-slate-600">
                Application statuses update as milestones are completed
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <Brain className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">AI Intelligence</h4>
              <p className="text-sm text-slate-600">
                Smart parsing and document verification save hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}