import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CommissionTracker({ applications, students }) {
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const uniMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const studentMap = students.reduce((acc, student) => {
    acc[student.id] = student;
    return acc;
  }, {});

  const enrolledApps = applications.filter(app => app.status === 'enrolled');
  
  const commissionData = enrolledApps.map(app => ({
    ...app,
    student: studentMap[app.student_id],
    university: uniMap[app.university_id],
    commission: 1000, // Placeholder - would be calculated based on actual commission rules
    status: Math.random() > 0.5 ? 'paid' : 'pending'
  }));

  const totalPending = commissionData.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission, 0);
  const totalPaid = commissionData.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission, 0);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Pending</p>
                <p className="text-3xl font-bold text-[#F37021]">${totalPending}</p>
              </div>
              <Clock className="w-12 h-12 text-[#F37021] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">${totalPaid}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
          <p className="text-sm text-slate-600">View commission details for enrolled students</p>
        </CardHeader>
        <CardContent>
          {commissionData.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No commission data yet</p>
              <p className="text-sm text-slate-500">Commission will appear when students are enrolled</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Student Name</th>
                    <th className="text-left p-3 text-sm font-semibold">University</th>
                    <th className="text-left p-3 text-sm font-semibold">Commission Amount</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionData.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        {item.student?.first_name} {item.student?.last_name}
                      </td>
                      <td className="p-3">{item.university?.university_name}</td>
                      <td className="p-3 font-semibold">${item.commission}</td>
                      <td className="p-3">
                        <Badge className={item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {item.status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}