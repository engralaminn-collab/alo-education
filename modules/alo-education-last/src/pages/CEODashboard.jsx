import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Users, Clock, AlertTriangle, 
  CheckCircle2, DollarSign, Building2, Target, Activity 
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CEODashboard() {
  const [dateRange, setDateRange] = useState('30d');

  // Fetch all key data
  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => base44.entities.Inquiry.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: slaAlerts = [] } = useQuery({
    queryKey: ['sla-alerts'],
    queryFn: () => base44.entities.SLAAlert.list()
  });

  // Calculate key metrics
  const totalLeads = inquiries.length;
  const newLeads = inquiries.filter(i => i.status === 'new').length;
  const convertedLeads = inquiries.filter(i => i.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  const totalApplications = applications.length;
  const enrolledApplications = applications.filter(a => a.status === 'enrolled').length;
  const enrollmentRate = totalApplications > 0 ? ((enrolledApplications / totalApplications) * 100).toFixed(1) : 0;

  const slaBreached = inquiries.filter(i => i.sla_breached).length;
  const avgResponseTime = inquiries
    .filter(i => i.response_time_minutes)
    .reduce((sum, i) => sum + i.response_time_minutes, 0) / inquiries.filter(i => i.response_time_minutes).length || 0;

  const activeCounselors = users.filter(u => u.role === 'user' && u.is_active).length;
  const totalCounselors = users.filter(u => u.role === 'user').length;

  // Branch performance data
  const branchData = users
    .filter(u => u.branch)
    .reduce((acc, user) => {
      if (!acc[user.branch]) {
        acc[user.branch] = {
          branch: user.branch,
          counselors: 0,
          leads: 0,
          converted: 0,
          avgResponseTime: 0,
          slaBreaches: 0
        };
      }
      acc[user.branch].counselors++;
      
      const userInquiries = inquiries.filter(i => i.assigned_to === user.id);
      acc[user.branch].leads += userInquiries.length;
      acc[user.branch].converted += userInquiries.filter(i => i.status === 'converted').length;
      acc[user.branch].slaBreaches += userInquiries.filter(i => i.sla_breached).length;
      
      const responseTimes = userInquiries.filter(i => i.response_time_minutes).map(i => i.response_time_minutes);
      if (responseTimes.length > 0) {
        acc[user.branch].avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
      }
      
      return acc;
    }, {});

  const branchPerformance = Object.values(branchData).map(b => ({
    ...b,
    conversionRate: b.leads > 0 ? ((b.converted / b.leads) * 100).toFixed(1) : 0
  }));

  // Top performers
  const topCounselors = users
    .filter(u => u.role === 'user')
    .map(user => {
      const userInquiries = inquiries.filter(i => i.assigned_to === user.id);
      const converted = userInquiries.filter(i => i.status === 'converted').length;
      const convRate = userInquiries.length > 0 ? ((converted / userInquiries.length) * 100).toFixed(1) : 0;
      
      return {
        name: user.full_name,
        branch: user.branch,
        leads: userInquiries.length,
        converted,
        conversionRate: parseFloat(convRate),
        avgResponseTime: user.avg_response_time_minutes || 0
      };
    })
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5);

  // Recent SLA alerts
  const recentAlerts = slaAlerts
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  const COLORS = ['#0066CC', '#F37021', '#10B981', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CEO Dashboard</h1>
            <p className="text-gray-600 mt-1">Executive overview and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={dateRange === '7d' ? 'default' : 'outline'}
              onClick={() => setDateRange('7d')}
            >
              7 Days
            </Button>
            <Button 
              variant={dateRange === '30d' ? 'default' : 'outline'}
              onClick={() => setDateRange('30d')}
            >
              30 Days
            </Button>
            <Button 
              variant={dateRange === '90d' ? 'default' : 'outline'}
              onClick={() => setDateRange('90d')}
            >
              90 Days
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-orange-600 font-medium">{newLeads} new</span> this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-gray-600 mt-1">
                {convertedLeads} / {totalLeads} leads converted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(avgResponseTime)} min</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className={slaBreached > 0 ? 'text-red-600' : 'text-green-600'}>
                  {slaBreached} SLA breaches
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Enrollment Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollmentRate}%</div>
              <p className="text-xs text-gray-600 mt-1">
                {enrolledApplications} / {totalApplications} enrolled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SLA Alerts */}
        {recentAlerts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Active SLA Alerts ({recentAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAlerts.map(alert => {
                  const inquiry = inquiries.find(i => i.id === alert.inquiry_id);
                  return (
                    <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{inquiry?.name || 'Unknown Lead'}</p>
                        <p className="text-sm text-gray-600">{alert.alert_type.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{alert.time_elapsed_minutes} min</Badge>
                        <p className="text-xs text-gray-600 mt-1">{new Date(alert.created_date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="branches" className="space-y-4">
          <TabsList>
            <TabsTrigger value="branches">Branch Performance</TabsTrigger>
            <TabsTrigger value="counselors">Top Counselors</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="branches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance Comparison</CardTitle>
                <CardDescription>Performance metrics across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={branchPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branch" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#0066CC" name="Total Leads" />
                    <Bar dataKey="converted" fill="#10B981" name="Converted" />
                    <Bar dataKey="slaBreaches" fill="#EF4444" name="SLA Breaches" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branchPerformance.map(branch => (
                <Card key={branch.branch}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {branch.branch}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Counselors:</span>
                      <span className="font-semibold">{branch.counselors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Leads:</span>
                      <span className="font-semibold">{branch.leads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion:</span>
                      <span className="font-semibold text-green-600">{branch.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response:</span>
                      <span className="font-semibold">{branch.avgResponseTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SLA Breaches:</span>
                      <span className={`font-semibold ${branch.slaBreaches > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {branch.slaBreaches}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="counselors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Counselors</CardTitle>
                <CardDescription>Highest conversion rates this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCounselors.map((counselor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{counselor.name}</p>
                          <p className="text-sm text-gray-600">{counselor.branch}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{counselor.conversionRate}%</p>
                        <p className="text-sm text-gray-600">{counselor.converted}/{counselor.leads} converted</p>
                        <p className="text-xs text-gray-500 mt-1">Avg: {counselor.avgResponseTime} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead & Conversion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={branchPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branch" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="#0066CC" strokeWidth={2} name="Total Leads" />
                    <Line type="monotone" dataKey="converted" stroke="#10B981" strokeWidth={2} name="Converted" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          inquiries.reduce((acc, i) => {
                            acc[i.source || 'Other'] = (acc[i.source || 'Other'] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(inquiries.reduce((acc, i) => {
                          acc[i.source || 'Other'] = true;
                          return acc;
                        }, {})).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Counselors</span>
                    <span className="text-2xl font-bold">{totalCounselors}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Today</span>
                    <span className="text-2xl font-bold text-green-600">{activeCounselors}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Branches</span>
                    <span className="text-2xl font-bold">{branchPerformance.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg Leads per Counselor</span>
                    <span className="text-2xl font-bold">
                      {activeCounselors > 0 ? Math.round(totalLeads / activeCounselors) : 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}