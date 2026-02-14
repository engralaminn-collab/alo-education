import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, FileText, Building2, GraduationCap, 
  TrendingUp, TrendingDown, Inbox, CheckCircle,
  Clock, AlertCircle, ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CRMLayout from '@/components/crm/CRMLayout';
import CounselorPerformance from '@/components/crm/CounselorPerformance';
import { motion } from 'framer-motion';
import AtRiskAlerts from '@/components/crm/AtRiskAlerts';
import CounselorMetrics from '@/components/crm/CounselorMetrics';
import AIFollowUpGenerator from '@/components/crm/AIFollowUpGenerator';
import AIDeadlineReminders from '@/components/crm/AIDeadlineReminders';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CRMDashboard() {
  const [predictiveAnalytics, setPredictiveAnalytics] = useState(null);

  const { data: inquiries = [] } = useQuery({
    queryKey: ['crm-inquiries'],
    queryFn: () => base44.entities.Inquiry.list('-created_date', 100),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['crm-students'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 100),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['crm-applications'],
    queryFn: () => base44.entities.Application.list('-created_date', 100),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['crm-universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['crm-courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['crm-counselors'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['current-user-crm'],
    queryFn: () => base44.auth.me(),
  });

  const { data: counselorProfile } = useQuery({
    queryKey: ['counselor-profile', user?.email],
    queryFn: async () => {
      const counselors = await base44.entities.Counselor.filter({ email: user.email });
      return counselors[0];
    },
    enabled: !!user?.email,
  });

  // Generate AI Analytics
  const generateAnalytics = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generateAnalyticsReport', {
        report_type: 'dashboard_overview',
        filters: {},
        date_range: { start: null, end: null }
      });
      return data;
    },
    onSuccess: (data) => {
      setPredictiveAnalytics(data);
      toast.success('AI Analytics generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate analytics');
    }
  });

  // Calculate stats
  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const activeApplications = applications.filter(a => 
    !['enrolled', 'rejected', 'withdrawn'].includes(a.status)
  ).length;
  const enrolledCount = applications.filter(a => a.status === 'enrolled').length;

  // Weekly data for chart
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayInquiries = inquiries.filter(inq => 
      inq.created_date?.startsWith(dateStr)
    ).length;
    const dayApplications = applications.filter(app => 
      app.created_date?.startsWith(dateStr)
    ).length;
    return {
      day: format(date, 'EEE'),
      inquiries: dayInquiries,
      applications: dayApplications,
    };
  });

  // Status distribution
  const statusData = [
    { name: 'Under Review', value: applications.filter(a => a.status === 'under_review').length },
    { name: 'Offers', value: applications.filter(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)).length },
    { name: 'Visa Processing', value: applications.filter(a => a.status === 'visa_processing').length },
    { name: 'Enrolled', value: enrolledCount },
    { name: 'Other', value: applications.filter(a => !['under_review', 'conditional_offer', 'unconditional_offer', 'visa_processing', 'enrolled'].includes(a.status)).length },
  ].filter(d => d.value > 0);

  const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, link }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={createPageUrl(link)}>
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                {trend && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {trend}
                  </div>
                )}
              </div>
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <CRMLayout 
      title="Dashboard"
      actions={
        <Button
          onClick={() => generateAnalytics.mutate()}
          disabled={generateAnalytics.isPending}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {generateAnalytics.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Analytics
            </>
          )}
        </Button>
      }
    >
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Inbox}
          label="New Inquiries"
          value={newInquiries}
          trend="+12% this week"
          trendUp={true}
          color="bg-amber-500"
          link="CRMInquiries"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={students.length}
          trend="+8% this month"
          trendUp={true}
          color="bg-blue-500"
          link="CRMStudents"
        />
        <StatCard
          icon={FileText}
          label="Active Applications"
          value={activeApplications}
          color="bg-purple-500"
          link="CRMApplications"
        />
        <StatCard
          icon={CheckCircle}
          label="Enrollments"
          value={enrolledCount}
          trend="+25% this quarter"
          trendUp={true}
          color="bg-emerald-500"
          link="CRMApplications"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="inquiries" fill="#10b981" radius={[4, 4, 0, 0]} name="Inquiries" />
                <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400">
                No data yet
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Automation Tools */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <AIFollowUpGenerator counselorId={counselorProfile?.id} />
        <AIDeadlineReminders counselorId={counselorProfile?.id} />
      </div>

      {/* At-Risk Alerts */}
      <div className="mb-8">
        <AtRiskAlerts counselorId={counselorProfile?.id} />
      </div>

      {/* Counselor Metrics */}
      <div className="mb-8">
        <CounselorMetrics
          students={students}
          applications={applications}
        />
      </div>

      {/* Counselor Performance */}
      <div className="mb-8">
        <CounselorPerformance 
          counselors={counselors}
          students={students}
          applications={applications}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Inquiries</CardTitle>
            <Link to={createPageUrl('CRMInquiries')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                    {inquiry.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{inquiry.name}</p>
                    <p className="text-sm text-slate-500 truncate">{inquiry.email}</p>
                  </div>
                  <Badge className={
                    inquiry.status === 'new' ? 'bg-emerald-100 text-emerald-700' :
                    inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {inquiry.status}
                  </Badge>
                </div>
              ))}
              {inquiries.length === 0 && (
                <p className="text-center text-slate-400 py-4">No inquiries yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link to={createPageUrl('CRMApplications')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">Application #{app.id?.slice(-6)}</p>
                    <p className="text-sm text-slate-500">{app.intake || 'Intake TBD'}</p>
                  </div>
                  <Badge className={
                    app.status === 'enrolled' ? 'bg-emerald-100 text-emerald-700' :
                    ['conditional_offer', 'unconditional_offer'].includes(app.status) ? 'bg-green-100 text-green-700' :
                    app.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {app.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
              {applications.length === 0 && (
                <p className="text-center text-slate-400 py-4">No applications yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Building2 className="w-10 h-10 text-slate-400" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{universities.length}</p>
                <p className="text-slate-500">Partner Universities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <GraduationCap className="w-10 h-10 text-slate-400" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
                <p className="text-slate-500">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-10 h-10 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {applications.length > 0 
                    ? Math.round((enrolledCount / applications.length) * 100) 
                    : 0}%
                </p>
                <p className="text-slate-500">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {!predictiveAnalytics ? (
            <Card className="border-2 border-purple-200">
              <CardContent className="py-12 text-center">
                <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  AI-Powered Analytics
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Get predictive insights, student health scores, at-risk student alerts, and performance forecasts
                </p>
                <Button
                  onClick={() => generateAnalytics.mutate()}
                  disabled={generateAnalytics.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {generateAnalytics.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Analytics...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Analytics
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAnalytics.mutate()}
                  disabled={generateAnalytics.isPending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {predictiveAnalytics.alerts && predictiveAnalytics.alerts.length > 0 && (
                <PerformanceAlertsPanel alerts={predictiveAnalytics.alerts} />
              )}

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PredictiveAnalyticsDashboard analytics={predictiveAnalytics} />
                </div>
                <div>
                  <AtRiskStudentsPanel atRiskStudents={predictiveAnalytics.at_risk_students || []} />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}