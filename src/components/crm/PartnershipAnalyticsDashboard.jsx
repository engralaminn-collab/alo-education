import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Award, Target, AlertCircle } from 'lucide-react';

export default function PartnershipAnalyticsDashboard({ agreements, applications, universities }) {
  const analytics = useMemo(() => {
    // Conversion rates per university
    const universityPerformance = universities.map(uni => {
      const uniAgreements = agreements.filter(a => a.university_id === uni.id && a.status === 'active');
      const uniApplications = applications.filter(a => a.university_id === uni.id);
      const enrolledApps = uniApplications.filter(a => a.status === 'enrolled');
      const avgCommission = uniAgreements.length > 0 
        ? uniAgreements.reduce((sum, a) => sum + (a.commission_rate || 0), 0) / uniAgreements.length 
        : 0;
      
      return {
        university: uni.university_name,
        applications: uniApplications.length,
        enrolled: enrolledApps.length,
        conversionRate: uniApplications.length > 0 ? ((enrolledApps.length / uniApplications.length) * 100).toFixed(1) : 0,
        commission: avgCommission,
        estimatedRevenue: enrolledApps.length * 15000 * (avgCommission / 100)
      };
    }).filter(u => u.applications > 0)
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);

    // Commission earned over time (last 12 months)
    const monthlyCommissions = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthApps = applications.filter(app => {
        if (!app.created_date || app.status !== 'enrolled') return false;
        const appDate = new Date(app.created_date);
        return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear();
      });

      const revenue = monthApps.reduce((sum, app) => {
        const agreement = agreements.find(a => a.university_id === app.university_id && a.status === 'active');
        return sum + (agreement?.commission_rate ? 15000 * (agreement.commission_rate / 100) : 0);
      }, 0);

      return {
        month: monthName,
        revenue: Math.round(revenue),
        applications: monthApps.length
      };
    });

    // Success rate by agreement type
    const agreementTypePerformance = agreements.reduce((acc, agreement) => {
      const type = agreement.agreement_type;
      if (!acc[type]) {
        acc[type] = { type, totalApps: 0, enrolled: 0, count: 0, totalCommission: 0 };
      }
      
      const typeApps = applications.filter(a => a.university_id === agreement.university_id);
      const typeEnrolled = typeApps.filter(a => a.status === 'enrolled');
      
      acc[type].totalApps += typeApps.length;
      acc[type].enrolled += typeEnrolled.length;
      acc[type].count += 1;
      acc[type].totalCommission += (agreement.commission_rate || 0);
      
      return acc;
    }, {});

    const agreementTypes = Object.values(agreementTypePerformance).map(item => ({
      type: item.type,
      successRate: item.totalApps > 0 ? ((item.enrolled / item.totalApps) * 100).toFixed(1) : 0,
      avgCommission: item.count > 0 ? (item.totalCommission / item.count).toFixed(1) : 0,
      partnerships: item.count,
      applications: item.totalApps
    }));

    // Renewal dates tracking
    const now = new Date();
    const upcoming = agreements.filter(a => {
      if (!a.end_date || a.status !== 'active') return false;
      const endDate = new Date(a.end_date);
      const daysUntil = (endDate - now) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 90;
    }).map(a => ({
      ...a,
      university_name: universities.find(u => u.id === a.university_id)?.university_name,
      daysUntil: Math.ceil((new Date(a.end_date) - now) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => a.daysUntil - b.daysUntil);

    return { universityPerformance, monthlyCommissions, agreementTypes, upcoming };
  }, [agreements, applications, universities]);

  const COLORS = ['#0066CC', '#F37021', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const totalRevenue = analytics.monthlyCommissions.reduce((sum, m) => sum + m.revenue, 0);
  const avgConversionRate = analytics.universityPerformance.length > 0
    ? (analytics.universityPerformance.reduce((sum, u) => sum + parseFloat(u.conversionRate), 0) / analytics.universityPerformance.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue (12M)</p>
                <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Conversion Rate</p>
                <p className="text-3xl font-bold text-blue-600">{avgConversionRate}%</p>
              </div>
              <Target className="w-10 h-10 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Top Performer</p>
                <p className="text-lg font-bold text-purple-600 line-clamp-1">
                  {analytics.universityPerformance[0]?.university || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">{analytics.universityPerformance[0]?.conversionRate}% conversion</p>
              </div>
              <Award className="w-10 h-10 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Renewals Due</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.upcoming.length}</p>
                <p className="text-xs text-slate-500">Next 90 days</p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Rates</TabsTrigger>
          <TabsTrigger value="agreements">Agreement Types</TabsTrigger>
          <TabsTrigger value="renewals">Upcoming Renewals</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.monthlyCommissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Revenue ($)" />
                  <Line type="monotone" dataKey="applications" stroke="#0066CC" strokeWidth={2} name="Applications" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Universities by Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.universityPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="university" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversionRate" fill="#0066CC" name="Conversion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {analytics.universityPerformance.slice(0, 5).map((uni, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{uni.university}</p>
                        <p className="text-xs text-slate-500">{uni.applications} applications • {uni.enrolled} enrolled</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{uni.conversionRate}%</p>
                      <p className="text-xs text-slate-500">${uni.estimatedRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Agreement Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.agreementTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.type}: ${entry.successRate}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="successRate"
                    >
                      {analytics.agreementTypes.map((entry, index) => (
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
                <CardTitle>Agreement Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.agreementTypes.map((type, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 capitalize">{type.type}</h4>
                        <Badge style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                          {type.partnerships} agreements
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs">Success Rate</p>
                          <p className="font-bold text-blue-600">{type.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Avg Commission</p>
                          <p className="font-bold text-green-600">{type.avgCommission}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Applications</p>
                          <p className="font-bold text-purple-600">{type.applications}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="renewals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreements Expiring in Next 90 Days</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.upcoming.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>No agreements expiring soon</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.upcoming.map(agreement => (
                    <div 
                      key={agreement.id} 
                      className={`p-4 rounded-lg border-2 ${
                        agreement.daysUntil <= 30 ? 'bg-red-50 border-red-300' :
                        agreement.daysUntil <= 60 ? 'bg-orange-50 border-orange-300' :
                        'bg-yellow-50 border-yellow-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{agreement.agreement_title}</h4>
                          <p className="text-sm text-slate-600">{agreement.university_name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Expires: {new Date(agreement.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            agreement.daysUntil <= 30 ? 'bg-red-600' :
                            agreement.daysUntil <= 60 ? 'bg-orange-600' :
                            'bg-yellow-600'
                          }>
                            {agreement.daysUntil} days
                          </Badge>
                          {agreement.commission_rate && (
                            <p className="text-xs text-slate-600 mt-1">
                              {agreement.commission_rate}% commission
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}