import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Users, CheckCircle, Target, Award,
  MessageSquare, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CounselorPerformance({ counselors, students, applications }) {
  const counselorStats = counselors.map(counselor => {
    const assignedStudents = students.filter(s => s.counselor_id === counselor.id);
    const studentApplications = applications.filter(app =>
      assignedStudents.some(s => s.id === app.student_id)
    );
    const enrollments = studentApplications.filter(a => a.status === 'enrolled').length;
    const conversionRate = studentApplications.length > 0 
      ? (enrollments / studentApplications.length) * 100 
      : 0;

    return {
      ...counselor,
      assignedCount: assignedStudents.length,
      applicationCount: studentApplications.length,
      enrollments,
      conversionRate: Math.round(conversionRate),
    };
  }).sort((a, b) => b.conversionRate - a.conversionRate);

  const topPerformers = counselorStats.slice(0, 5);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: '#F7941D' }} />
          Counselor Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topPerformers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No counselor data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Performers List */}
            <div className="space-y-4">
              {topPerformers.map((counselor, index) => (
                <div key={counselor.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: index === 0 ? '#F7941D' : '#0B5ED7' }}
                      >
                        {counselor.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{counselor.name}</h4>
                        <p className="text-sm text-slate-500">{counselor.assignedCount} students</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        counselor.conversionRate >= 70 ? 'bg-green-100 text-green-700' :
                        counselor.conversionRate >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }
                    >
                      {counselor.conversionRate}% Success
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-slate-500 mb-1">Applications</p>
                      <p className="text-lg font-bold text-slate-900">{counselor.applicationCount}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-slate-500 mb-1">Enrollments</p>
                      <p className="text-lg font-bold text-slate-900">{counselor.enrollments}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-slate-500 mb-1">Capacity</p>
                      <p className="text-lg font-bold text-slate-900">
                        {Math.round((counselor.current_students / counselor.max_students) * 100)}%
                      </p>
                    </div>
                  </div>

                  <Progress value={counselor.conversionRate} className="h-2" />
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Conversion Rate Comparison</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topPerformers}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="conversionRate" 
                    fill="#0B5ED7"
                    radius={[4, 4, 0, 0]}
                    name="Conversion Rate %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}