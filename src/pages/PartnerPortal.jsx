import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, DollarSign, TrendingUp, Search } from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';

export default function PartnerPortal() {
  const [search, setSearch] = useState('');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myStudents = [] } = useQuery({
    queryKey: ['partner-students', user?.id],
    queryFn: () => base44.entities.StudentProfile.filter({ 
      source: `partner_${user?.id}` 
    }),
    enabled: !!user
  });

  const { data: myCommissions = [] } = useQuery({
    queryKey: ['partner-commissions', user?.id],
    queryFn: () => base44.entities.Commission.filter({ partner_id: user?.id }),
    enabled: !!user
  });

  const totalEarned = myCommissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const totalPending = myCommissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const filteredStudents = myStudents.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CRMLayout title="Partner Portal">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
                <h3 className="text-2xl font-bold dark:text-white">{myStudents.length}</h3>
              </div>
              <Users className="w-8 h-8 text-education-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Earned</p>
                <h3 className="text-2xl font-bold text-green-600">${totalEarned.toFixed(2)}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
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
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">My Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-10 dark:bg-slate-700"
            />
          </div>

          <div className="space-y-2">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div>
                  <p className="font-medium dark:text-white">{student.first_name} {student.last_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{student.email}</p>
                </div>
                <Badge>{student.status || 'new_lead'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}