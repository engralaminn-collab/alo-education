import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, DollarSign, Target, Award } from 'lucide-react';

export default function ReferralPerformance({ partnerId }) {
  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals', partnerId],
    queryFn: () => base44.entities.PartnerReferral.filter({ partner_id: partnerId }),
    enabled: !!partnerId
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['partner-commissions', partnerId],
    queryFn: () => base44.entities.Commission.filter({ partner_id: partnerId }),
    enabled: !!partnerId
  });

  // Get unique referral codes
  const uniqueCodes = [...new Set(referrals.map(r => r.referral_code).filter(Boolean))];

  // Calculate metrics
  const totalReferrals = referrals.length;
  const convertedReferrals = referrals.filter(r => 
    r.status === 'converted' || r.status === 'enrolled'
  ).length;
  const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals * 100) : 0;

  const totalEarned = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const pendingCommissions = commissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  // Performance by referral code
  const codePerformance = uniqueCodes.map(code => {
    const codeReferrals = referrals.filter(r => r.referral_code === code);
    const converted = codeReferrals.filter(r => 
      r.status === 'converted' || r.status === 'enrolled'
    ).length;
    return {
      code,
      total: codeReferrals.length,
      converted,
      rate: codeReferrals.length > 0 ? (converted / codeReferrals.length * 100) : 0
    };
  }).sort((a, b) => b.converted - a.converted);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Referrals</p>
                <h3 className="text-2xl font-bold">{totalReferrals}</h3>
              </div>
              <Users className="w-8 h-8 text-education-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Converted</p>
                <h3 className="text-2xl font-bold text-green-600">{convertedReferrals}</h3>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Conversion Rate</p>
                <h3 className="text-2xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Earned</p>
                <h3 className="text-2xl font-bold text-green-600">${totalEarned.toFixed(0)}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Commissions Alert */}
      {pendingCommissions > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">
                  ${pendingCommissions.toFixed(2)} in pending commissions
                </p>
                <p className="text-sm text-amber-700">
                  These will be processed and paid according to the payment schedule
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Code Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {codePerformance.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No referral activity yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {codePerformance.map((perf) => (
                <div key={perf.code} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge>{perf.code}</Badge>
                      <span className="text-sm text-slate-600">
                        {perf.converted} / {perf.total} converted
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-education-blue">
                      {perf.rate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={perf.rate} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}