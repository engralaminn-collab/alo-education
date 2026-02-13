import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Users, Phone, CheckCircle, GraduationCap, XCircle } from 'lucide-react';

export default function ReferralFunnel({ partnerId }) {
  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals', partnerId],
    queryFn: () => base44.entities.PartnerReferral.filter({ partner_id: partnerId })
  });

  const funnelStages = [
    { key: 'submitted', label: 'Submitted', icon: Users, color: 'bg-blue-500' },
    { key: 'contacted', label: 'Contacted', icon: Phone, color: 'bg-indigo-500' },
    { key: 'qualified', label: 'Qualified', icon: CheckCircle, color: 'bg-purple-500' },
    { key: 'converted', label: 'Converted', icon: GraduationCap, color: 'bg-green-500' },
    { key: 'enrolled', label: 'Enrolled', icon: GraduationCap, color: 'bg-emerald-500' }
  ];

  const stageCounts = funnelStages.map(stage => ({
    ...stage,
    count: referrals.filter(r => r.status === stage.key).length
  }));

  const totalLeads = referrals.length;
  const lostLeads = referrals.filter(r => r.status === 'lost').length;

  return (
    <div className="space-y-6">
      {/* Visual Funnel */}
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Lead Progression Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageCounts.map((stage, idx) => {
              const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0;
              const Icon = stage.icon;
              
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold dark:text-white">{stage.label}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {stage.count} leads ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {stage.count}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  {idx < stageCounts.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Lost Leads */}
            {lostLeads > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">Lost Leads</p>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        {lostLeads} leads lost ({((lostLeads / totalLeads) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700">{lostLeads}</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Conversion Rate</p>
            <h3 className="text-3xl font-bold text-green-600">
              {totalLeads > 0 ? (((stageCounts.find(s => s.key === 'converted')?.count || 0) / totalLeads) * 100).toFixed(1) : 0}%
            </h3>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Enrollment Rate</p>
            <h3 className="text-3xl font-bold text-emerald-600">
              {totalLeads > 0 ? (((stageCounts.find(s => s.key === 'enrolled')?.count || 0) / totalLeads) * 100).toFixed(1) : 0}%
            </h3>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Drop-off Rate</p>
            <h3 className="text-3xl font-bold text-red-600">
              {totalLeads > 0 ? ((lostLeads / totalLeads) * 100).toFixed(1) : 0}%
            </h3>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}