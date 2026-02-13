import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, Clock, FileX, TrendingDown, 
  Mail, Phone, MessageSquare 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudentRiskAlerts({ students, applications, limit }) {
  // Detect at-risk students
  const detectRisks = () => {
    const risks = [];
    const now = new Date();

    students.forEach(student => {
      const studentApps = applications.filter(app => app.student_id === student.id);

      // Risk 1: Low profile completeness
      if (student.profile_completeness < 50) {
        risks.push({
          id: `profile-${student.id}`,
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          type: 'profile_incomplete',
          severity: 'medium',
          message: `Profile only ${student.profile_completeness}% complete`,
          recommendation: 'Send profile completion reminder',
          icon: FileX,
          color: 'orange'
        });
      }

      // Risk 2: Approaching deadlines
      studentApps.forEach(app => {
        if (app.offer_deadline) {
          const deadline = new Date(app.offer_deadline);
          const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 7 && daysUntil > 0 && app.status === 'conditional_offer') {
            risks.push({
              id: `deadline-${app.id}`,
              studentId: student.id,
              studentName: `${student.first_name} ${student.last_name}`,
              type: 'deadline_approaching',
              severity: daysUntil <= 3 ? 'high' : 'medium',
              message: `Offer deadline in ${daysUntil} days`,
              recommendation: 'Urgent: Follow up on offer acceptance',
              icon: Clock,
              color: daysUntil <= 3 ? 'red' : 'orange'
            });
          }
        }
      });

      // Risk 3: No recent activity
      const lastUpdate = student.updated_date ? new Date(student.updated_date) : new Date(student.created_date);
      const daysSinceUpdate = Math.ceil((now - lastUpdate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate > 14 && student.status === 'in_progress') {
        risks.push({
          id: `inactive-${student.id}`,
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          type: 'inactive',
          severity: 'medium',
          message: `No activity for ${daysSinceUpdate} days`,
          recommendation: 'Check in with student',
          icon: TrendingDown,
          color: 'orange'
        });
      }

      // Risk 4: No applications started
      if (studentApps.length === 0 && student.status === 'qualified') {
        const daysSinceCreated = Math.ceil((now - new Date(student.created_date)) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated > 7) {
          risks.push({
            id: `no-apps-${student.id}`,
            studentId: student.id,
            studentName: `${student.first_name} ${student.last_name}`,
            type: 'no_applications',
            severity: 'high',
            message: `No applications started after ${daysSinceCreated} days`,
            recommendation: 'Schedule consultation to start applications',
            icon: AlertTriangle,
            color: 'red'
          });
        }
      }
    });

    // Sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return limit ? risks.slice(0, limit) : risks;
  };

  const risks = detectRisks();

  const severityColors = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    low: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  const iconColors = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600'
  };

  if (risks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>No risk alerts detected</p>
        <p className="text-sm">All students are on track!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {risks.map(risk => {
        const Icon = risk.icon;
        return (
          <Card key={risk.id} className={`border-l-4 ${severityColors[risk.severity]}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Icon className={`w-5 h-5 mt-1 ${iconColors[risk.color]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      to={createPageUrl('CRMStudents') + `?id=${risk.studentId}`}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {risk.studentName}
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{risk.message}</p>
                  <p className="text-xs text-slate-600 mb-3">
                    💡 <span className="font-medium">Recommendation:</span> {risk.recommendation}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                    <Link to={createPageUrl('CRMStudents') + `?id=${risk.studentId}`}>
                      <Button size="sm" variant="default" className="h-8 text-xs">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}