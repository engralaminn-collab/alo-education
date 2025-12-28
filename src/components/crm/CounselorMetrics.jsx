import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, CheckCircle, TrendingUp, Target,
  Award, Clock, FileText, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function CounselorMetrics({ students = [], applications = [] }) {
  // Calculate metrics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => !['enrolled', 'lost'].includes(s.status)).length;
  const enrolledCount = applications.filter(a => a.status === 'enrolled').length;
  const conversionRate = applications.length > 0 ? (enrolledCount / applications.length) * 100 : 0;
  
  const avgResponseTime = "< 2 hours"; // Placeholder
  const studentSatisfaction = 92; // Placeholder

  // Applications by status
  const statusData = [
    { status: 'Draft', count: applications.filter(a => a.status === 'draft').length },
    { status: 'Submitted', count: applications.filter(a => a.status === 'submitted_to_university').length },
    { status: 'Offers', count: applications.filter(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)).length },
    { status: 'Visa', count: applications.filter(a => a.status === 'visa_processing').length },
    { status: 'Enrolled', count: enrolledCount },
  ];

  // Monthly trend (mock data)
  const trendData = [
    { month: 'Jan', students: 12, enrolled: 3 },
    { month: 'Feb', students: 15, enrolled: 5 },
    { month: 'Mar', students: 18, enrolled: 7 },
    { month: 'Apr', students: 22, enrolled: 9 },
    { month: 'May', students: 25, enrolled: 11 },
    { month: 'Jun', students: totalStudents, enrolled: enrolledCount },
  ];

  const MetricCard = ({ icon: Icon, label, value, subtext, color }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
            {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          subtext={`${activeStudents} active`}
          color="bg-blue-500"
        />
        <MetricCard
          icon={CheckCircle}
          label="Enrollments"
          value={enrolledCount}
          subtext="This year"
          color="bg-green-500"
        />
        <MetricCard
          icon={Target}
          label="Conversion Rate"
          value={`${Math.round(conversionRate)}%`}
          subtext="Apps to enrollment"
          color="bg-purple-500"
        />
        <MetricCard
          icon={Award}
          label="Satisfaction"
          value={`${studentSatisfaction}%`}
          subtext="Student rating"
          color="bg-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="status" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0066CC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#0066CC" strokeWidth={2} dot={{ fill: '#0066CC' }} name="Students" />
                <Line type="monotone" dataKey="enrolled" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Enrolled" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Response Time</span>
              <span className="text-sm font-semibold text-green-600">{avgResponseTime}</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Student Satisfaction</span>
              <span className="text-sm font-semibold text-green-600">{studentSatisfaction}%</span>
            </div>
            <Progress value={studentSatisfaction} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Goal Achievement</span>
              <span className="text-sm font-semibold text-blue-600">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}