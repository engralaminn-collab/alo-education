import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, CheckCircle, Clock, Star } from 'lucide-react';

export default function CounselorMetricsTracker({ counselor, students, applications, tasks }) {
  // Calculate metrics
  const counselorStudents = students.filter(s => s.counselor_id === counselor.id);
  const counselorApplications = applications.filter(a => 
    counselorStudents.some(s => s.id === a.student_id)
  );
  const counselorTasks = tasks.filter(t => t.assigned_to === counselor.id);

  // Conversion rate: enrolled / total students
  const enrolledCount = counselorApplications.filter(a => a.status === 'enrolled').length;
  const conversionRate = counselorStudents.length > 0 
    ? Math.round((enrolledCount / counselorStudents.length) * 100) 
    : 0;

  // Task completion rate
  const completedTasks = counselorTasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = counselorTasks.length > 0
    ? Math.round((completedTasks / counselorTasks.length) * 100)
    : 0;

  // Average response time (mock - would need real message data)
  const avgResponseTime = '2.3 hrs';

  // Student satisfaction (mock - would need real feedback data)
  const studentSatisfaction = 4.5;

  // Active students (not enrolled, not lost)
  const activeStudents = counselorStudents.filter(s => 
    s.status !== 'enrolled' && s.status !== 'lost'
  ).length;

  const metrics = [
    {
      label: 'Total Students',
      value: counselorStudents.length,
      icon: Users,
      color: '#0066CC',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: conversionRate >= 30 ? '#10B981' : conversionRate >= 20 ? '#F59E0B' : '#EF4444',
      bgColor: conversionRate >= 30 ? 'bg-green-50' : conversionRate >= 20 ? 'bg-amber-50' : 'bg-red-50',
      trend: conversionRate >= 30 ? '+5%' : conversionRate >= 20 ? '-2%' : '-8%'
    },
    {
      label: 'Task Completion',
      value: `${taskCompletionRate}%`,
      icon: CheckCircle,
      color: taskCompletionRate >= 80 ? '#10B981' : taskCompletionRate >= 60 ? '#F59E0B' : '#EF4444',
      bgColor: taskCompletionRate >= 80 ? 'bg-green-50' : taskCompletionRate >= 60 ? 'bg-amber-50' : 'bg-red-50'
    },
    {
      label: 'Avg Response Time',
      value: avgResponseTime,
      icon: Clock,
      color: '#F37021',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Student Satisfaction',
      value: studentSatisfaction.toFixed(1),
      icon: Star,
      color: studentSatisfaction >= 4.5 ? '#10B981' : studentSatisfaction >= 4 ? '#F59E0B' : '#EF4444',
      bgColor: studentSatisfaction >= 4.5 ? 'bg-green-50' : studentSatisfaction >= 4 ? 'bg-amber-50' : 'bg-red-50',
      maxValue: '5.0'
    },
    {
      label: 'Active Students',
      value: activeStudents,
      icon: Users,
      color: '#8B5CF6',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold" style={{ color: metric.color }}>
                      {metric.value}
                    </p>
                    {metric.maxValue && (
                      <p className="text-sm text-slate-500">/ {metric.maxValue}</p>
                    )}
                  </div>
                  {metric.trend && (
                    <div className="flex items-center gap-1 mt-1">
                      {metric.trend.startsWith('+') ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <p className={`text-xs ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend} vs last month
                      </p>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" style={{ color: metric.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}