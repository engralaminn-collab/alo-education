import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Zap, Mail, Calendar, TrendingUp, Target,
  Clock, Play, Pause, Settings, CheckCircle
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';

const emailSequences = {
  cold: {
    name: 'Cold Lead Nurturing',
    description: 'Educational content and profile completion reminders',
    emails: [
      { day: 0, subject: 'Welcome to ALO Education - Get Started', template: 'welcome_cold' },
      { day: 2, subject: 'Complete Your Profile - Unlock Personalized Recommendations', template: 'profile_reminder' },
      { day: 5, subject: 'Study Abroad 101: Everything You Need to Know', template: 'educational_content' },
      { day: 10, subject: 'Success Stories from Students Like You', template: 'testimonials' },
    ]
  },
  warm: {
    name: 'Warm Lead Engagement',
    description: 'Personalized course recommendations and consultation offers',
    emails: [
      { day: 0, subject: 'Your Personalized University Matches', template: 'course_recommendations' },
      { day: 1, subject: 'Book Your Free Consultation', template: 'consultation_offer' },
      { day: 4, subject: 'Application Deadline Alert - Don\'t Miss Out', template: 'deadline_reminder' },
      { day: 7, subject: 'Scholarship Opportunities for [Field]', template: 'scholarship_info' },
    ]
  },
  hot: {
    name: 'Hot Lead Conversion',
    description: 'Urgent follow-ups and immediate action required',
    emails: [
      { day: 0, subject: 'Let\'s Get Your Application Started Today', template: 'urgent_action' },
      { day: 1, subject: 'Your Counselor is Waiting - Book Now', template: 'immediate_consultation' },
      { day: 2, subject: 'Limited Seats Available - Act Fast', template: 'scarcity' },
    ]
  }
};

export default function CRMLeadNurturing() {
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    auto_nurturing_enabled: true,
    auto_task_assignment: true,
    hot_lead_response_hours: 2,
    warm_lead_response_hours: 24,
    cold_lead_response_days: 3,
  });

  const [isRunning, setIsRunning] = useState(false);

  const { data: inquiries = [] } = useQuery({
    queryKey: ['crm-inquiries-nurturing'],
    queryFn: () => base44.entities.Inquiry.list(),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['crm-counselors-nurturing'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  // Calculate lead score
  const calculateLeadScore = (inquiry) => {
    let score = 0;
    if (inquiry.email) score += 20;
    if (inquiry.phone) score += 20;
    if (inquiry.country_of_interest) score += 15;
    if (inquiry.degree_level) score += 15;
    if (inquiry.field_of_study) score += 15;
    if (inquiry.message && inquiry.message.length > 50) score += 15;
    return score;
  };

  // Get lead quality
  const getLeadQuality = (score) => {
    if (score >= 75) return 'hot';
    if (score >= 50) return 'warm';
    return 'cold';
  };

  // Run nurturing workflow
  const runNurturingWorkflow = useMutation({
    mutationFn: async () => {
      const results = {
        emailsSent: 0,
        tasksCreated: 0,
        leadsProcessed: 0,
      };

      for (const inquiry of inquiries) {
        if (inquiry.status === 'converted' || inquiry.status === 'not_interested') continue;

        const score = calculateLeadScore(inquiry);
        const quality = getLeadQuality(score);
        results.leadsProcessed++;

        // Send nurturing emails
        if (settings.auto_nurturing_enabled) {
          const sequence = emailSequences[quality];
          const daysSinceCreation = Math.floor(
            (new Date() - new Date(inquiry.created_date)) / (1000 * 60 * 60 * 24)
          );

          for (const email of sequence.emails) {
            if (email.day === daysSinceCreation) {
              try {
                await base44.integrations.Core.SendEmail({
                  to: inquiry.email,
                  subject: email.subject,
                  body: await generateEmailContent(inquiry, quality, email.template)
                });
                results.emailsSent++;
              } catch (error) {
                console.error('Email sending failed:', error);
              }
            }
          }
        }

        // Create tasks based on lead score
        if (settings.auto_task_assignment && !inquiry.assigned_to) {
          let dueDate = new Date();
          
          if (quality === 'hot') {
            dueDate.setHours(dueDate.getHours() + parseInt(settings.hot_lead_response_hours));
          } else if (quality === 'warm') {
            dueDate.setHours(dueDate.getHours() + parseInt(settings.warm_lead_response_hours));
          } else {
            dueDate.setDate(dueDate.getDate() + parseInt(settings.cold_lead_response_days));
          }

          // Assign to counselor with lowest workload
          const availableCounselors = counselors
            .filter(c => c.is_available && (c.current_students || 0) < (c.max_students || 50))
            .sort((a, b) => (a.current_students || 0) - (b.current_students || 0));

          if (availableCounselors.length > 0) {
            const assignedCounselor = availableCounselors[0];

            try {
              await base44.entities.Task.create({
                title: `Follow up with ${quality.toUpperCase()} lead: ${inquiry.name}`,
                description: `Lead score: ${score}/100. ${inquiry.message || 'No message provided.'}`,
                type: 'follow_up',
                assigned_to: assignedCounselor.user_id,
                priority: quality === 'hot' ? 'urgent' : quality === 'warm' ? 'high' : 'medium',
                due_date: dueDate.toISOString().split('T')[0],
                status: 'pending',
                notes: `Interest: ${inquiry.country_of_interest}, ${inquiry.degree_level}, ${inquiry.field_of_study}`
              });

              await base44.entities.Inquiry.update(inquiry.id, {
                assigned_to: assignedCounselor.user_id,
                status: 'contacted'
              });

              results.tasksCreated++;
            } catch (error) {
              console.error('Task creation failed:', error);
            }
          }
        }
      }

      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-inquiries-nurturing'] });
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast.success(`Workflow complete: ${data.emailsSent} emails sent, ${data.tasksCreated} tasks created`);
    },
    onError: () => {
      toast.error('Workflow failed');
    }
  });

  // Generate email content using AI
  const generateEmailContent = async (inquiry, quality, template) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional, personalized email for a ${quality} lead.

Student Name: ${inquiry.name}
Interest: ${inquiry.country_of_interest}, ${inquiry.degree_level}, ${inquiry.field_of_study}
Template Type: ${template}

Create a warm, encouraging email (150-200 words) that:
- Addresses the student by name
- Relates to their specific interests
- Provides value (not just sales)
- Has a clear call-to-action
- Signs off from ALO Education team

Email body only:`,
      });
      return response;
    } catch {
      return `Dear ${inquiry.name},\n\nThank you for your interest in studying abroad. Our team will be in touch soon.\n\nBest regards,\nALO Education`;
    }
  };

  const executeWorkflow = async () => {
    setIsRunning(true);
    try {
      await runNurturingWorkflow.mutateAsync();
    } finally {
      setIsRunning(false);
    }
  };

  // Stats
  const stats = inquiries.reduce((acc, inq) => {
    if (inq.status === 'converted' || inq.status === 'not_interested') return acc;
    
    const score = calculateLeadScore(inq);
    const quality = getLeadQuality(score);
    
    acc[quality] = (acc[quality] || 0) + 1;
    if (!inq.assigned_to) acc.unassigned = (acc.unassigned || 0) + 1;
    
    return acc;
  }, { hot: 0, warm: 0, cold: 0, unassigned: 0 });

  return (
    <CRMLayout 
      title="Lead Nurturing Workflows"
      actions={
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {settings.auto_nurturing_enabled ? 'Active' : 'Paused'}
          </Badge>
          <Button 
            onClick={executeWorkflow}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2 animate-pulse" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Workflow Now
              </>
            )}
          </Button>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Hot Leads</p>
                <p className="text-3xl font-bold text-slate-900">{stats.hot}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Warm Leads</p>
                <p className="text-3xl font-bold text-slate-900">{stats.warm}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Cold Leads</p>
                <p className="text-3xl font-bold text-slate-900">{stats.cold}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Unassigned</p>
                <p className="text-3xl font-bold text-slate-900">{stats.unassigned}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Settings */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-600" />
              Automation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label>Auto Email Nurturing</Label>
              <Switch
                checked={settings.auto_nurturing_enabled}
                onCheckedChange={(v) => setSettings({ ...settings, auto_nurturing_enabled: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label>Auto Task Assignment</Label>
              <Switch
                checked={settings.auto_task_assignment}
                onCheckedChange={(v) => setSettings({ ...settings, auto_task_assignment: v })}
              />
            </div>

            <div>
              <Label>Hot Lead Response Time (hours)</Label>
              <Input
                type="number"
                value={settings.hot_lead_response_hours}
                onChange={(e) => setSettings({ ...settings, hot_lead_response_hours: e.target.value })}
                className="mt-2"
                min="1"
                max="24"
              />
            </div>

            <div>
              <Label>Warm Lead Response Time (hours)</Label>
              <Input
                type="number"
                value={settings.warm_lead_response_hours}
                onChange={(e) => setSettings({ ...settings, warm_lead_response_hours: e.target.value })}
                className="mt-2"
                min="1"
                max="72"
              />
            </div>

            <div>
              <Label>Cold Lead Response Time (days)</Label>
              <Input
                type="number"
                value={settings.cold_lead_response_days}
                onChange={(e) => setSettings({ ...settings, cold_lead_response_days: e.target.value })}
                className="mt-2"
                min="1"
                max="14"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Email Sequences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(emailSequences).map(([key, sequence]) => (
              <div key={key} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{sequence.name}</h4>
                  <Badge className={
                    key === 'hot' ? 'bg-red-100 text-red-700' :
                    key === 'warm' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    {sequence.emails.length} emails
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{sequence.description}</p>
                <div className="space-y-1">
                  {sequence.emails.map((email, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Day {email.day}: {email.subject}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>How Lead Nurturing Works</CardTitle>
          <CardDescription>Automated workflow based on AI-powered lead scoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Lead Scoring</h4>
              <p className="text-sm text-slate-600">
                AI analyzes profile completeness, contact info, and engagement level
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Categorization</h4>
              <p className="text-sm text-slate-600">
                Leads sorted into Hot (75+), Warm (50-74), or Cold (&lt;50) categories
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Email Sequences</h4>
              <p className="text-sm text-slate-600">
                Targeted email campaigns based on lead quality and interests
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Task Assignment</h4>
              <p className="text-sm text-slate-600">
                Automatic counselor assignment with priority-based follow-up deadlines
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}