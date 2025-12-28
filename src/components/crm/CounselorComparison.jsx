import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CounselorComparison({ counselors, students, applications }) {
  const counselorStats = counselors.map(counselor => {
    const counselorStudents = students.filter(s => s.counselor_id === counselor.id);
    const counselorApplications = applications.filter(a => 
      counselorStudents.some(s => s.id === a.student_id)
    );

    const enrolledCount = counselorApplications.filter(a => a.status === 'enrolled').length;
    const conversionRate = counselorStudents.length > 0 
      ? Math.round((enrolledCount / counselorStudents.length) * 100) 
      : 0;

    return {
      name: counselor.user_name || counselor.email?.split('@')[0] || 'Counselor',
      id: counselor.id,
      students: counselorStudents.length,
      enrolled: enrolledCount,
      conversionRate,
      applications: counselorApplications.length
    };
  }).sort((a, b) => b.conversionRate - a.conversionRate);

  const topPerformer = counselorStats[0];
  const avgConversionRate = Math.round(
    counselorStats.reduce((sum, c) => sum + c.conversionRate, 0) / counselorStats.length || 0
  );

  const chartData = counselorStats.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    'Conversion Rate': c.conversionRate,
    'Total Students': c.students,
    'Enrolled': c.enrolled
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Top Performer</p>
                <p className="font-bold text-slate-900">{topPerformer?.name}</p>
                <Badge className="bg-amber-100 text-amber-700 mt-1">
                  {topPerformer?.conversionRate}% conversion
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Conversion Rate</p>
                <p className="text-3xl font-bold text-blue-600">{avgConversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Enrolled</p>
                <p className="text-3xl font-bold text-green-600">
                  {counselorStats.reduce((sum, c) => sum + c.enrolled, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Counselor Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Conversion Rate" fill="#0066CC" />
              <Bar dataKey="Total Students" fill="#F37021" />
              <Bar dataKey="Enrolled" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {counselorStats.map((counselor, index) => (
              <div key={counselor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-slate-200 text-slate-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{counselor.name}</p>
                    <p className="text-xs text-slate-600">
                      {counselor.students} students • {counselor.applications} applications
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ 
                    color: counselor.conversionRate >= avgConversionRate ? '#10B981' : '#F59E0B'
                  }}>
                    {counselor.conversionRate}%
                  </p>
                  <p className="text-xs text-slate-600">{counselor.enrolled} enrolled</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}