import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, FileX, TrendingDown, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AtRiskAlerts({ counselorId }) {
  const { data: students = [] } = useQuery({
    queryKey: ['counselor-students', counselorId],
    queryFn: () => counselorId ? 
      base44.entities.StudentProfile.filter({ counselor_id: counselorId }) :
      base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents'],
    queryFn: () => base44.entities.Document.list(),
  });

  // Identify at-risk students
  const atRiskStudents = students.filter(student => {
    const studentApps = applications.filter(a => a.student_id === student.id);
    const studentDocs = documents.filter(d => d.student_id === student.id);
    
    // Risk factors
    const hasNoApplications = studentApps.length === 0;
    const profileIncomplete = (student.profile_completeness || 0) < 50;
    const noDocuments = studentDocs.length === 0;
    const noCounselor = !student.counselor_id;
    const staleStudent = student.updated_date && 
      (new Date() - new Date(student.updated_date)) > 14 * 24 * 60 * 60 * 1000; // 14 days
    
    return hasNoApplications || profileIncomplete || noDocuments || noCounselor || staleStudent;
  }).map(student => {
    const studentApps = applications.filter(a => a.student_id === student.id);
    const studentDocs = documents.filter(d => d.student_id === student.id);
    
    const risks = [];
    if (studentApps.length === 0) risks.push({ type: 'no_applications', label: 'No applications' });
    if ((student.profile_completeness || 0) < 50) risks.push({ type: 'profile', label: 'Profile incomplete' });
    if (studentDocs.length === 0) risks.push({ type: 'no_documents', label: 'No documents' });
    if (!student.counselor_id) risks.push({ type: 'no_counselor', label: 'No counselor assigned' });
    if (student.updated_date && (new Date() - new Date(student.updated_date)) > 14 * 24 * 60 * 60 * 1000) {
      risks.push({ type: 'inactive', label: 'Inactive for 14+ days' });
    }
    
    return { ...student, risks };
  });

  const getRiskIcon = (type) => {
    switch (type) {
      case 'no_applications': return FileX;
      case 'profile': return TrendingDown;
      case 'inactive': return Clock;
      default: return AlertTriangle;
    }
  };

  return (
    <Card className="border-2 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          At-Risk Students ({atRiskStudents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {atRiskStudents.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-slate-600">All students are on track!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {atRiskStudents.slice(0, 10).map((student) => (
              <div key={student.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-slate-600">{student.email}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-700">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {student.risks.map((risk, i) => {
                    const Icon = getRiskIcon(risk.type);
                    return (
                      <Badge key={i} variant="outline" className="text-xs border-red-300 text-red-700">
                        <Icon className="w-3 h-3 mr-1" />
                        {risk.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}