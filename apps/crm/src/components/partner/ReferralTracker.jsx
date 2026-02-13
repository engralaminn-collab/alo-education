import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

export default function ReferralTracker({ partnerId }) {
  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals', partnerId],
    queryFn: () => base44.entities.PartnerReferral.filter({ partner_id: partnerId })
  });

  const statusCount = referrals.reduce((acc, ref) => {
    acc[ref.status] = (acc[ref.status] || 0) + 1;
    return acc;
  }, {});

  const conversionRate = referrals.length > 0 
    ? Math.round((statusCount.converted || 0) / referrals.length * 100)
    : 0;

  const totalCommission = referrals
    .filter(r => r.commission_eligible)
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Referrals</p>
                <h3 className="text-2xl font-bold dark:text-white">{referrals.length}</h3>
              </div>
              <Users className="w-8 h-8 text-education-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Conversion Rate</p>
                <h3 className="text-2xl font-bold text-green-600">{conversionRate}%</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Commission</p>
                <h3 className="text-2xl font-bold text-green-600">${totalCommission}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {referrals.slice(0, 10).map(referral => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium dark:text-white">
                    {referral.lead_data.first_name} {referral.lead_data.last_name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {referral.lead_data.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {referral.referral_code}
                    </Badge>
                    {referral.commission_eligible && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        ${referral.commission_amount}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge>{referral.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}