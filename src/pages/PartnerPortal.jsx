import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, DollarSign, TrendingUp, Search, FileText, 
  MessageSquare, BarChart3, Settings, Home, UserPlus, Activity, Target, Bell 
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReferralFunnel from '@/components/partner/ReferralFunnel';
import CommissionDashboard from '@/components/partner/CommissionDashboard';
import EnhancedLeadSubmission from '@/components/partner/EnhancedLeadSubmission';
import PartnerAnalyticsDashboard from '@/components/partner/PartnerAnalyticsDashboard';
import ReferralSourceTracker from '@/components/partner/ReferralSourceTracker';
import AICommandInterface from '@/components/partner/AICommandInterface';
import PartnerChat from '@/components/partner/PartnerChat';
import PartnerNotifications from '@/components/partner/PartnerNotifications';
import TeamManagement from '@/components/partner/TeamManagement';
import ReferralLinkGenerator from '@/components/partner/ReferralLinkGenerator';
import ReferralPerformance from '@/components/partner/ReferralPerformance';
import EnhancedAnalytics from '@/components/partner/EnhancedAnalytics';
import StudentInteractionLog from '@/components/partner/StudentInteractionLog';
import StudentJourneyMap from '@/components/partner/StudentJourneyMap';
import AIMarketingGenerator from '@/components/partner/AIMarketingGenerator';
import PartnerTrainingModule from '@/components/partner/PartnerTrainingModule';
import PredictiveAnalytics from '@/components/partner/PredictiveAnalytics';
import AtRiskStudentsDashboard from '@/components/partner/AtRiskStudentsDashboard';

export default function PartnerPortal() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: staffRole } = useQuery({
    queryKey: ['staff-role', user?.id],
    queryFn: async () => {
      const roles = await base44.entities.StaffRole.filter({ user_id: user?.id });
      return roles?.[0];
    },
    enabled: !!user
  });

  const { data: partnerStudents = [] } = useQuery({
    queryKey: ['partner-students', staffRole?.partner_organization_id],
    queryFn: () => base44.entities.StudentProfile.filter({ 
      source: `partner_${staffRole?.partner_organization_id}` 
    }),
    enabled: !!staffRole?.partner_organization_id
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['partner-applications'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['partner-commissions', staffRole?.partner_organization_id],
    queryFn: () => base44.entities.Commission.filter({ 
      partner_id: staffRole?.partner_organization_id 
    }),
    enabled: !!staffRole?.partner_organization_id
  });

  const partnerApplications = allApplications.filter(app =>
    partnerStudents.some(s => s.id === app.student_id)
  );

  const totalEarned = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const totalPending = commissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const filteredStudents = partnerStudents.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const accessLevel = staffRole?.partner_access_level || 'standard';
  const isSuperAdmin = accessLevel === 'super_admin';
  const isCounselor = accessLevel === 'counselor' || isSuperAdmin;

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ['unread-notifications', user?.id],
    queryFn: async () => {
      const notifs = await base44.entities.Notification.filter({ user_id: user?.id });
      return notifs.filter(n => !n.is_read);
    },
    enabled: !!user?.id
  });

  return (
    <CRMLayout title="Partner Portal">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-800 shadow-sm">
          <TabsTrigger value="overview" className="select-none">
            <Activity className="w-4 h-4 mr-2" />
            Funnel
          </TabsTrigger>
          <TabsTrigger value="submit-lead" className="select-none">
            <UserPlus className="w-4 h-4 mr-2" />
            Submit Lead
          </TabsTrigger>
          <TabsTrigger value="students" className="select-none">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="applications" className="select-none">
            <FileText className="w-4 h-4 mr-2" />
            Applications
          </TabsTrigger>
          {isCounselor && (
            <TabsTrigger value="messaging" className="select-none">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messaging
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="select-none relative">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="commissions" className="select-none">
            <DollarSign className="w-4 h-4 mr-2" />
            Commissions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="select-none">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="sources" className="select-none">
            <Target className="w-4 h-4 mr-2" />
            Sources
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="settings" className="select-none">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ReferralPerformance partnerId={staffRole?.partner_organization_id} />
          <ReferralFunnel partnerId={staffRole?.partner_organization_id} />
        </TabsContent>

        {/* Lead Submission Tab */}
        <TabsContent value="submit-lead" className="space-y-4">
          {/* Role Badge */}
          <Card className="border-0 shadow-sm bg-education-blue text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Your Access Level</p>
                  <h3 className="text-xl font-bold">
                    {accessLevel === 'super_admin' ? 'Super Admin' : 
                     accessLevel === 'counselor' ? 'Counselor' : 'Standard'}
                  </h3>
                </div>
                <Badge className="bg-white text-education-blue">Partner</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
                    <h3 className="text-2xl font-bold dark:text-white">{partnerStudents.length}</h3>
                  </div>
                  <Users className="w-8 h-8 text-education-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Applications</p>
                    <h3 className="text-2xl font-bold dark:text-white">{partnerApplications.length}</h3>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Earned</p>
                    <h3 className="text-2xl font-bold text-green-600">${totalEarned.toFixed(2)}</h3>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                    <h3 className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</h3>
                  </div>
                  <TrendingUp className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lead Submission Content */}
        <TabsContent value="submit-lead" className="space-y-6">
          <ReferralLinkGenerator partnerId={staffRole?.partner_organization_id} />
          <EnhancedLeadSubmission partnerId={staffRole?.partner_organization_id} />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <StudentInteractionLog partnerId={staffRole?.partner_organization_id} />
          
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="dark:text-white">All Students</CardTitle>
                {isCounselor && (
                  <Button 
                    onClick={() => navigate(createPageUrl('CompleteProfile'))}
                    className="bg-education-blue select-none"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="pl-10 dark:bg-slate-700"
                />
              </div>

              <div className="space-y-2">
                {filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(createPageUrl('CRMStudentProfile') + `?id=${student.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-education-blue to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {student.first_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>{student.status || 'new_lead'}</Badge>
                      {isCounselor && (
                        <Button size="sm" variant="outline" className="select-none dark:bg-slate-600">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partnerApplications.map(app => {
                  const student = partnerStudents.find(s => s.id === app.student_id);
                  return (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium dark:text-white">
                            {student?.first_name} {student?.last_name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {app.intake || 'N/A'}
                          </p>
                        </div>
                        <Badge>{app.status || 'draft'}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messaging Tab (Counselor access) */}
        {isCounselor && (
          <TabsContent value="messaging">
            <PartnerChat partnerId={staffRole?.partner_organization_id} currentUser={user} />
          </TabsContent>
        )}

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <PartnerNotifications partnerId={staffRole?.partner_organization_id} currentUser={user} />
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <CommissionDashboard partnerId={staffRole?.partner_organization_id} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <PredictiveAnalytics partnerId={staffRole?.partner_organization_id} />
          <EnhancedAnalytics partnerId={staffRole?.partner_organization_id} />
          <StudentJourneyMap partnerId={staffRole?.partner_organization_id} />
          <PartnerAnalyticsDashboard partnerId={staffRole?.partner_organization_id} />
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <ReferralSourceTracker partnerId={staffRole?.partner_organization_id} />
        </TabsContent>

        {/* Settings Tab (Super Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <PartnerTrainingModule 
              partnerId={staffRole?.partner_organization_id}
              userId={user?.id}
              specialization={staffRole?.specialization}
              targetMarkets={staffRole?.target_markets}
            />
            <AIMarketingGenerator partnerId={staffRole?.partner_organization_id} />
            <TeamManagement partnerId={staffRole?.partner_organization_id} />
            <AICommandInterface partnerId={staffRole?.partner_organization_id} />
          </TabsContent>
        )}
      </Tabs>
    </CRMLayout>
  );
}