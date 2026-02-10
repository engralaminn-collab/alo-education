import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DollarSign, FileText, CheckCircle2, Clock } from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';

export default function AccountsPortal() {
  const [selectedCommission, setSelectedCommission] = useState(null);
  const queryClient = useQueryClient();

  const { data: enrolledStudents = [] } = useQuery({
    queryKey: ['enrolled-students'],
    queryFn: () => base44.entities.StudentProfile.filter({ status: 'enrolled' })
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['commissions-all'],
    queryFn: () => base44.entities.Commission.list('-created_date')
  });

  const createCommission = useMutation({
    mutationFn: (data) => base44.entities.Commission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions-all'] });
      toast.success('Commission record created');
    }
  });

  const updateCommission = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Commission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions-all'] });
      toast.success('Commission updated');
      setSelectedCommission(null);
    }
  });

  const totalPending = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const totalPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <CRMLayout title="Accounts & Commissions">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled Students</p>
                <h3 className="text-2xl font-bold dark:text-white">{enrolledStudents.length}</h3>
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Commissions</p>
                <h3 className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Paid Commissions</p>
                <h3 className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Records */}
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Commission Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commissions.map(commission => (
              <div
                key={commission.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedCommission(commission)}
              >
                <div className="flex-1">
                  <p className="font-medium dark:text-white">Invoice #{commission.invoice_number || 'N/A'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Student ID: {commission.student_id}</p>
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commission Detail Dialog */}
      <Dialog open={!!selectedCommission} onOpenChange={(open) => !open && setSelectedCommission(null)}>
        <DialogContent className="dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Commission Details</DialogTitle>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">Amount</label>
                  <p className="font-bold text-lg dark:text-white">${selectedCommission.amount}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">Status</label>
                  <Badge className="mt-1">{selectedCommission.status}</Badge>
                </div>
              </div>

              {selectedCommission.status !== 'paid' && (
                <Button
                  onClick={() => updateCommission.mutate({
                    id: selectedCommission.id,
                    data: { 
                      status: 'paid',
                      payment_date: new Date().toISOString().split('T')[0]
                    }
                  })}
                  className="w-full bg-green-600 hover:bg-green-700 select-none"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}