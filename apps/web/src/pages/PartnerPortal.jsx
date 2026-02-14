import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, FileText, DollarSign, Download, Plus, 
  Search, Filter, TrendingUp, CheckCircle, Clock 
} from 'lucide-react';
import { toast } from "sonner";
import SubmitStudentDialog from '@/components/partner/SubmitStudentDialog';
import CommissionTracker from '@/components/partner/CommissionTracker';
import PartnerApplicationsTable from '@/components/partner/PartnerApplicationsTable';

export default function PartnerPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['partner-applications'],
    queryFn: () => base44.entities.Application.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['partner-students'],
    queryFn: () => base44.entities.StudentProfile.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const stats = {
    totalStudents: students.length,
    activeApplications: applications.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length,
    commissionPending: applications.filter(a => a.status === 'enrolled').length * 1000, // Placeholder
    successRate: applications.length > 0 ? Math.round((applications.filter(a => a.status === 'enrolled').length / applications.length) * 100) : 0
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Partner Portal Login</h2>
            <p className="text-slate-600 mb-6">Submit student applications and track progress securely.</p>
            <Button 
              onClick={() => window.location.href = '/Login?redirect=/PartnerPortal'}
              style={{ backgroundColor: '#0066CC', color: 'white' }}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">Partner Portal</h1>
          <p className="text-white/90">Welcome back, {user.full_name || user.email}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-[#0066CC]">{stats.totalStudents}</p>
                </div>
                <Users className="w-12 h-12 text-[#0066CC] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Applications</p>
                  <p className="text-3xl font-bold text-[#F37021]">{stats.activeApplications}</p>
                </div>
                <FileText className="w-12 h-12 text-[#F37021] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Commission Pending</p>
                  <p className="text-3xl font-bold text-green-600">${stats.commissionPending}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.successRate}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="students">Submitted Students</TabsTrigger>
            <TabsTrigger value="submit">Submit New Student</TabsTrigger>
            <TabsTrigger value="commission">Commission</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Submitted Students</CardTitle>
                  <Button onClick={() => setShowSubmitDialog(true)} style={{ backgroundColor: '#0066CC', color: 'white' }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit New Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PartnerApplicationsTable applications={applications} students={students} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle>Submit Student Details</CardTitle>
                <p className="text-sm text-slate-600">Submit student details for admission processing</p>
              </CardHeader>
              <CardContent>
                <SubmitStudentDialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commission">
            <CommissionTracker applications={applications} students={students} />
          </TabsContent>

          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Materials & Documents</CardTitle>
                <p className="text-sm text-slate-600">Download approved marketing materials and university documents</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'ALO Education Partner Brochure', size: '2.4 MB' },
                    { name: 'University Profiles 2024', size: '5.1 MB' },
                    { name: 'Study Abroad Guide', size: '3.2 MB' },
                    { name: 'Partner Marketing Kit', size: '8.5 MB' }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#0066CC]" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-slate-500">{doc.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SubmitStudentDialog 
        open={showSubmitDialog} 
        onClose={() => setShowSubmitDialog(false)} 
      />
    </div>
  );
}