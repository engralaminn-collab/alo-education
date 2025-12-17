import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign } from 'lucide-react';

export default function PartnerCommission({ applications }) {
  const enrolledApplications = applications.filter(app => app.status === 'enrolled');
  
  const commissionData = enrolledApplications.map(app => ({
    id: app.id,
    student_id: app.student_id,
    university_id: app.university_id,
    amount: 500, // Default commission
    status: 'Pending',
  }));

  const totalCommission = commissionData.reduce((sum, item) => sum + item.amount, 0);
  const paidCommission = commissionData.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
  const pendingCommission = totalCommission - paidCommission;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Commission</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${totalCommission.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-slate-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  ${paidCommission.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-slate-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending</p>
                <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                  ${pendingCommission.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
          <CardDescription>
            View commission details for enrolled students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>University ID</TableHead>
                  <TableHead>Commission Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                      No commission records yet
                    </TableCell>
                  </TableRow>
                ) : (
                  commissionData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.student_id.substring(0, 8)}...</TableCell>
                      <TableCell>{item.university_id?.substring(0, 8) || 'N/A'}...</TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        ${item.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={item.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}