import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, TrendingUp, AlertCircle, CheckCircle2,
  BarChart3, Settings, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMWorkloadBalancer() {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const queryClient = useQueryClient();

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-workload'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-for-workload'],
    queryFn: () => base44.entities.Application.list(),
  });

  // Calculate workload for each counselor
  const counselorWorkload = counselors.map(counselor => {
    const assignedStudents = students.filter(s => s.counselor_id === counselor.user_id);
    const assignedApplications = applications.filter(a => a.assigned_counsellor === counselor.user_id);
    
    const successfulApplications = assignedApplications.filter(a => 
      a.status === 'enrolled' || a.status === 'visa_approved'
    ).length;
    
    const successRate = assignedApplications.length > 0 
      ? (successfulApplications / assignedApplications.length) * 100 
      : 0;

    const workloadPercentage = (assignedStudents.length / (counselor.max_students || 50)) * 100;

    return {
      ...counselor,
      assignedStudents: assignedStudents.length,
      assignedApplications: assignedApplications.length,
      successRate: Math.round(successRate),
      workloadPercentage: Math.min(workloadPercentage, 100),
      availableCapacity: (counselor.max_students || 50) - assignedStudents.length,
    };
  });

  // Find best counselor based on workload, specialization, and performance
  const findBestCounselor = (studentCountry, courseLevel) => {
    const availableCounselors = counselorWorkload.filter(c => 
      c.is_available && c.availableCapacity > 0
    );

    if (availableCounselors.length === 0) return null;

    // Score each counselor
    const scoredCounselors = availableCounselors.map(counselor => {
      let score = 0;

      // Workload factor (lower is better)
      score += (100 - counselor.workloadPercentage) * 0.4;

      // Specialization match
      if (counselor.specializations?.some(spec => 
        spec.toLowerCase().includes(studentCountry?.toLowerCase())
      )) {
        score += 30;
      }

      // Success rate factor
      score += counselor.successRate * 0.3;

      return { ...counselor, score };
    });

    // Sort by score (highest first)
    scoredCounselors.sort((a, b) => b.score - a.score);
    return scoredCounselors[0];
  };

  const assignNewLeadMutation = useMutation({
    mutationFn: async ({ studentId, counselorId }) => {
      await base44.entities.StudentProfile.update(studentId, {
        counselor_id: counselorId,
        status: 'contacted'
      });
      return counselorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students-for-workload'] });
      queryClient.invalidateQueries({ queryKey: ['counselors'] });
      toast.success('Lead assigned successfully!');
    },
  });

  const balanceWorkloadMutation = useMutation({
    mutationFn: async () => {
      const unassignedStudents = students.filter(s => !s.counselor_id && s.status === 'new_lead');
      
      for (const student of unassignedStudents) {
        const bestCounselor = findBestCounselor(
          student.admission_preferences?.study_destination,
          student.admission_preferences?.study_level
        );
        
        if (bestCounselor) {
          await assignNewLeadMutation.mutateAsync({
            studentId: student.id,
            counselorId: bestCounselor.user_id,
          });
        }
      }
      
      return unassignedStudents.length;
    },
    onSuccess: (count) => {
      toast.success(`Assigned ${count} unassigned leads!`);
    },
  });

  const unassignedLeads = students.filter(s => !s.counselor_id && s.status === 'new_lead').length;

  return (
    <CRMLayout currentPage="Workload Balancer">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Workload Balancer</h1>
            <p className="text-slate-600 mt-1">Intelligent counselor assignment system</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Auto-assign: {autoAssignEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button
              onClick={() => balanceWorkloadMutation.mutate()}
              disabled={balanceWorkloadMutation.isPending || unassignedLeads === 0}
              style={{ backgroundColor: '#F37021' }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Balance Workload ({unassignedLeads} leads)
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Counselors</p>
                  <p className="text-2xl font-bold mt-1">{counselors.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unassigned Leads</p>
                  <p className="text-2xl font-bold mt-1">{unassignedLeads}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg. Success Rate</p>
                  <p className="text-2xl font-bold mt-1">
                    {Math.round(counselorWorkload.reduce((sum, c) => sum + c.successRate, 0) / counselorWorkload.length || 0)}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold mt-1">{students.length}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Counselor Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselorWorkload.map(counselor => (
            <Card key={counselor.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{counselor.name}</span>
                  {counselor.is_available ? (
                    <Badge className="bg-green-100 text-green-700">Available</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700">Unavailable</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Workload</span>
                    <span className="text-sm font-semibold">
                      {counselor.assignedStudents}/{counselor.max_students || 50}
                    </span>
                  </div>
                  <Progress 
                    value={counselor.workloadPercentage} 
                    className={
                      counselor.workloadPercentage > 90 
                        ? 'bg-red-100' 
                        : counselor.workloadPercentage > 70 
                        ? 'bg-orange-100' 
                        : 'bg-green-100'
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Applications</p>
                    <p className="text-lg font-semibold">{counselor.assignedApplications}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Success Rate</p>
                    <p className="text-lg font-semibold text-green-600">{counselor.successRate}%</p>
                  </div>
                </div>

                {counselor.specializations && counselor.specializations.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-600 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {counselor.specializations.slice(0, 3).map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-slate-600">Available Capacity</span>
                  <span className={`font-bold ${
                    counselor.availableCapacity > 10 
                      ? 'text-green-600' 
                      : counselor.availableCapacity > 0 
                      ? 'text-orange-600' 
                      : 'text-red-600'
                  }`}>
                    {counselor.availableCapacity} slots
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}