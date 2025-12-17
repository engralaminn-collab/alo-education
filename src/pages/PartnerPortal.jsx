import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap, TrendingUp, Users, DollarSign,
  FileText, Download, LogOut, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PartnerApplications from '@/components/partner/PartnerApplications';
import PartnerCommission from '@/components/partner/PartnerCommission';
import PartnerSubmitLead from '@/components/partner/PartnerSubmitLead';
import PartnerDownloads from '@/components/partner/PartnerDownloads';
import UniversityIntegration from '@/components/partner/UniversityIntegration';

export default function PartnerPortal() {
  const { data: user } = useQuery({
    queryKey: ['current-user-partner'],
    queryFn: () => base44.auth.me(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['partner-applications'],
    queryFn: () => base44.entities.Application.list('-created_date', 100),
    enabled: !!user,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['partner-students'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 100),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Partner Portal Login</CardTitle>
            <p className="text-center text-slate-600 text-sm">
              Submit student applications and track progress securely.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              style={{ backgroundColor: '#F37021', color: '#000000' }}
              onClick={() => base44.auth.redirectToLogin()}
            >
              Sign In to Partner Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeApplications = applications.filter(app => 
    ['submitted_to_university', 'under_review', 'conditional_offer', 'unconditional_offer'].includes(app.status)
  );

  const enrolledStudents = applications.filter(app => app.status === 'enrolled');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Partner Portal</h1>
                <p className="text-sm text-slate-600">ALO Education</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                  {user.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.full_name || user.email}</p>
                  <p className="text-xs text-slate-600">Partner Account</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => base44.auth.logout()}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to your ALO Education Partner Portal
          </h2>
          <p className="text-slate-600">
            Submit student applications and track their progress in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                    {students.length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Applications</p>
                  <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                    {activeApplications.length}
                  </p>
                </div>
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Enrolled Students</p>
                  <p className="text-3xl font-bold text-green-600">
                    {enrolledStudents.length}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Commission</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${(enrolledStudents.length * 500).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">Submit New Student</TabsTrigger>
            <TabsTrigger value="students">Submitted Students</TabsTrigger>
            <TabsTrigger value="integration">University Integration</TabsTrigger>
            <TabsTrigger value="commission">Commission Summary</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <PartnerSubmitLead />
          </TabsContent>

          <TabsContent value="students">
            <PartnerApplications applications={applications} students={students} />
          </TabsContent>

          <TabsContent value="integration">
            <UniversityIntegration />
          </TabsContent>

          <TabsContent value="commission">
            <PartnerCommission applications={applications} />
          </TabsContent>

          <TabsContent value="downloads">
            <PartnerDownloads />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}