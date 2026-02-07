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
  MessageSquare, BarChart3, Settings, Home 
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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

  return (
    <CRMLayout title="Partner Portal">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-800 shadow-sm">
          <TabsTrigger value="overview" className="select-none">
            <Home className="w-4 h-4 mr-2" />
            Overview
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
          <TabsTrigger value="commissions" className="select-none">
            <DollarSign className="w-4 h-4 mr-2" />
            Commissions
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="settings" className="select-none">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
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

          {/* Recent Students */}
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {partnerStudents.slice(0, 5).map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium dark:text-white">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{student.email}</p>
                    </div>
                    <Badge>{student.status || 'new_lead'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
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
            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold dark:text-white mb-2">Messaging Center</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Full messaging features available
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl('CounselorChat'))}
                  className="bg-education-blue select-none"
                >
                  Open Messaging
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Commission Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {commissions.map(commission => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium dark:text-white">Invoice #{commission.invoice_number || 'N/A'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {commission.currency || 'USD'} {commission.amount}
                      </p>
                    </div>
                    <Badge className={
                      commission.status === 'paid' ? 'bg-green-100 text-green-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {commission.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab (Super Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="settings">
            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Partner Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Manage team members, permissions, and organization settings.
                </p>
                <Button className="bg-education-blue select-none">
                  Manage Team
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </CRMLayout>
  );
}