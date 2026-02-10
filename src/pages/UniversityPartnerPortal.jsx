import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, Users, MessageSquare, Settings, LogOut, Search,
  CheckCircle, Clock, AlertCircle, TrendingUp
} from 'lucide-react';
import ALOButton from '@/components/ui/alo-button';

export default function UniversityPartnerPortal() {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [partner] = useState(JSON.parse(localStorage.getItem('partnerUser') || '{}'));

  const { data: applications = [] } = useQuery({
    queryKey: ['partner-applications', partner?.university_id],
    queryFn: async () => {
      if (!partner?.university_id) return [];
      const apps = await base44.entities.Application.filter({ 
        university_id: partner.university_id 
      });
      return apps;
    },
    enabled: !!partner?.university_id,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['partner-students', partner?.university_id],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.list();
      return profiles.filter(p => 
        applications.some(app => app.student_id === p.id)
      );
    },
  });

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800',
    submitted_to_university: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    conditional_offer: 'bg-orange-100 text-orange-800',
    unconditional_offer: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unconditional_offer':
        return <CheckCircle className="w-4 h-4" />;
      case 'conditional_offer':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const student = students.find(s => s.id === app.student_id);
    return student && (
      student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!partner?.id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Partner Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Please log in as a university partner to access this portal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-education-blue" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Partner Portal</h1>
                <p className="text-sm text-slate-500">{partner.partner_name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => localStorage.removeItem('partnerUser')}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
                </div>
                <Users className="w-8 h-8 text-education-blue opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Under Review</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {applications.filter(a => a.status === 'under_review').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Offers Sent</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {applications.filter(a => a.status?.includes('offer')).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Unique Students</p>
                  <p className="text-3xl font-bold text-slate-900">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-alo-orange opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1">
            <TabsTrigger value="applications" className="gap-2">
              <Users className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Settings className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Applications</CardTitle>
                    <CardDescription>View and manage applications from students</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredApplications.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No applications found</p>
                    </div>
                  ) : (
                    filteredApplications.map(app => {
                      const student = students.find(s => s.id === app.student_id);
                      return (
                        <div
                          key={app.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">
                                {student?.first_name} {student?.last_name}
                              </h4>
                              <p className="text-sm text-slate-500">{student?.email}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={statusColors[app.status]}>
                                  {getStatusIcon(app.status)}
                                  <span className="ml-1">{app.status?.replace(/_/g, ' ')}</span>
                                </Badge>
                                {app.priority && (
                                  <Badge variant="outline">Priority: {app.priority}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Applied</p>
                              <p className="text-sm font-medium">
                                {new Date(app.applied_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communicate with ALO Education counsellors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Messaging system coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Partner Profile</CardTitle>
                <CardDescription>Manage your university partner information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Contact Name</p>
                    <p className="text-lg font-semibold text-slate-900">{partner.partner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="text-lg font-semibold text-slate-900">{partner.partner_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Role</p>
                    <p className="text-lg font-semibold text-slate-900">{partner.role?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Last Login</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {partner.last_login ? new Date(partner.last_login).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}