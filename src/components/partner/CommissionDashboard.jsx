import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Clock, CheckCircle2, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CommissionDashboard({ partnerId }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  const { data: commissions = [] } = useQuery({
    queryKey: ['partner-commissions-detailed', partnerId],
    queryFn: () => base44.entities.Commission.filter({ partner_id: partnerId })
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals', partnerId],
    queryFn: () => base44.entities.PartnerReferral.filter({ partner_id: partnerId })
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  // Filter commissions
  const filteredCommissions = commissions.filter(comm => {
    if (statusFilter !== 'all' && comm.status !== statusFilter) return false;
    if (dateFrom && new Date(comm.created_date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(comm.created_date) > new Date(dateTo)) return false;
    if (searchStudent) {
      const student = students.find(s => s.id === comm.student_id);
      const studentName = `${student?.first_name} ${student?.last_name}`.toLowerCase();
      if (!studentName.includes(searchStudent.toLowerCase())) return false;
    }
    return true;
  });

  // Calculate totals
  const totalEarned = filteredCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalPending = filteredCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalApproved = filteredCommissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.amount || 0), 0);

  // Chart data
  const statusData = [
    { name: 'Paid', value: filteredCommissions.filter(c => c.status === 'paid').length, color: '#10b981' },
    { name: 'Approved', value: filteredCommissions.filter(c => c.status === 'approved').length, color: '#3b82f6' },
    { name: 'Pending', value: filteredCommissions.filter(c => c.status === 'pending').length, color: '#f59e0b' }
  ];

  // Monthly earnings
  const monthlyData = filteredCommissions
    .filter(c => c.status === 'paid' && c.payment_date)
    .reduce((acc, comm) => {
      const month = new Date(comm.payment_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + comm.amount;
      return acc;
    }, {});

  const monthlyChartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));

  const exportCSV = () => {
    const csv = [
      ['Invoice', 'Student', 'Amount', 'Status', 'Date'],
      ...filteredCommissions.map(c => {
        const student = students.find(s => s.id === c.student_id);
        return [
          c.invoice_number || 'N/A',
          `${student?.first_name || ''} ${student?.last_name || ''}`,
          c.amount,
          c.status,
          c.payment_date || c.created_date
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Earned</p>
                <h3 className="text-2xl font-bold text-green-600">${totalEarned.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                <h3 className="text-2xl font-bold text-blue-600">${totalApproved.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                <h3 className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <CardTitle className="dark:text-white">Filters</CardTitle>
            </div>
            <Button onClick={exportCSV} variant="outline" className="select-none dark:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="dark:bg-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="dark:bg-slate-700"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="dark:bg-slate-700"
            />
            <Input
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Search student..."
              className="dark:bg-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Commission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Commission List */}
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Commission Records ({filteredCommissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCommissions.map(commission => {
              const student = students.find(s => s.id === commission.student_id);
              return (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold dark:text-white">
                        {student?.first_name} {student?.last_name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        #{commission.invoice_number || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(commission.payment_date || commission.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg dark:text-white">${commission.amount}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{commission.currency || 'USD'}</p>
                    </div>
                    <Badge className={
                      commission.status === 'paid' ? 'bg-green-100 text-green-700' :
                      commission.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {commission.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}