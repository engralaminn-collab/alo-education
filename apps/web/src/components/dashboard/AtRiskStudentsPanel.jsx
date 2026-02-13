import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, User, TrendingDown, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AtRiskStudentsPanel({ atRiskStudents }) {
  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-600 text-white';
      case 'low': return 'bg-yellow-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-2 border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            At-Risk Students
          </CardTitle>
          <Badge className="bg-red-600 text-white">{atRiskStudents.length} Students</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {atRiskStudents.slice(0, 10).map((student, i) => (
            <div key={i} className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-red-600" />
                  <h4 className="font-semibold text-slate-900">{student.student_name}</h4>
                </div>
                <Badge className={getRiskColor(student.risk_level)}>
                  {student.risk_level} risk
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">Health Score</span>
                  <span className={`text-sm font-bold ${getScoreColor(student.health_score)}`}>
                    {student.health_score}/100
                  </span>
                </div>
                <Progress value={student.health_score} className="h-2" />
              </div>

              {student.risk_factors.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Risk Factors:</p>
                  <div className="space-y-1">
                    {student.risk_factors.map((factor, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-red-700">
                        <TrendingDown className="w-3 h-3" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="p-2 bg-white rounded border border-red-100">
                  <p className="text-slate-600">Applications</p>
                  <p className="font-bold text-slate-900">{student.metrics.applications}</p>
                </div>
                <div className="p-2 bg-white rounded border border-red-100">
                  <p className="text-slate-600">Messages</p>
                  <p className="font-bold text-slate-900">{student.metrics.messages}</p>
                </div>
              </div>

              <Link to={createPageUrl('CRMStudentProfile', `?id=${student.student_id}`)}>
                <Button size="sm" variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100">
                  <MessageSquare className="w-3 h-3 mr-2" />
                  Contact Student
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}