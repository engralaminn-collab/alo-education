import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Users, TrendingUp, DollarSign, Settings, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMReferralManagement() {
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  const { data: referrals = [] } = useQuery({
    queryKey: ['all-referrals'],
    queryFn: () => base44.entities.Referral.list('-created_date'),
  });

  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const result = await base44.entities.ReferralSettings.list();
      return result[0];
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => {
      if (settings?.id) {
        return base44.entities.ReferralSettings.update(settings.id, data);
      }
      return base44.entities.ReferralSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-settings'] });
      toast.success('Settings updated!');
      setShowSettings(false);
    },
  });

  const updateReferralStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Referral.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-referrals'] });
      toast.success('Status updated!');
    },
  });

  const totalReferrals = referrals.length;
  const enrolledReferrals = referrals.filter(r => r.status === 'enrolled').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const conversionRate = totalReferrals > 0 ? ((enrolledReferrals / totalReferrals) * 100).toFixed(1) : 0;
  const totalRewards = referrals
    .filter(r => r.status === 'enrolled')
    .reduce((sum, r) => sum + (r.referrer_benefit_amount || 0) + (r.referred_benefit_amount || 0), 0);

  return (
    <CRMLayout currentPage="Referral Program">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Referral Program Management</h1>
            <p className="text-slate-600 mt-1">Track and manage student referrals</p>
          </div>
          <Button onClick={() => setShowSettings(!showSettings)} style={{ backgroundColor: '#F37021' }}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Referrals</p>
                  <p className="text-2xl font-bold mt-1">{totalReferrals}</p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Enrolled</p>
                  <p className="text-2xl font-bold mt-1">{enrolledReferrals}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Conversion Rate</p>
                  <p className="text-2xl font-bold mt-1">{conversionRate}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Rewards</p>
                  <p className="text-2xl font-bold mt-1">{totalRewards} BDT</p>
                </div>
                <DollarSign className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Referral Program Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updateSettingsMutation.mutate(Object.fromEntries(formData.entries()));
              }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Referrer Benefit Amount</Label>
                    <Input name="referrer_benefit_amount" type="number" defaultValue={settings?.referrer_benefit_amount || 500} />
                  </div>
                  <div>
                    <Label>Referred Benefit Amount</Label>
                    <Input name="referred_benefit_amount" type="number" defaultValue={settings?.referred_benefit_amount || 1000} />
                  </div>
                </div>
                <div>
                  <Label>Reward Trigger</Label>
                  <select name="reward_trigger" defaultValue={settings?.reward_trigger || 'enrollment'} className="w-full px-3 py-2 border rounded-md">
                    <option value="registration">Registration</option>
                    <option value="application">Application</option>
                    <option value="enrollment">Enrollment</option>
                  </select>
                </div>
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea name="terms_and_conditions" defaultValue={settings?.terms_and_conditions} rows={4} />
                </div>
                <Button type="submit" className="w-full" style={{ backgroundColor: '#0066CC' }}>
                  Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All ({totalReferrals})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingReferrals})</TabsTrigger>
                <TabsTrigger value="enrolled">Enrolled ({enrolledReferrals})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {referrals.map((ref) => (
                  <Card key={ref.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{ref.referrer_name}</h4>
                            <span className="text-slate-500">→</span>
                            <p className="text-slate-600">{ref.referred_email}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Code: {ref.referral_code}</span>
                            <span>Benefit: {ref.referrer_benefit_amount} BDT</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            ref.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                            ref.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                            ref.status === 'registered' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {ref.status}
                          </Badge>
                          <select
                            value={ref.status}
                            onChange={(e) => updateReferralStatusMutation.mutate({ id: ref.id, status: e.target.value })}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="registered">Registered</option>
                            <option value="applied">Applied</option>
                            <option value="enrolled">Enrolled</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3 mt-4">
                {referrals.filter(r => r.status === 'pending').map((ref) => (
                  <Card key={ref.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{ref.referrer_name} → {ref.referred_email}</p>
                          <p className="text-sm text-slate-500">Code: {ref.referral_code}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => updateReferralStatusMutation.mutate({ id: ref.id, status: 'registered' })}
                        >
                          Mark Registered
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="enrolled" className="space-y-3 mt-4">
                {referrals.filter(r => r.status === 'enrolled').map((ref) => (
                  <Card key={ref.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{ref.referrer_name} → {ref.referred_email}</p>
                          <p className="text-sm text-green-600">✓ Enrolled - {ref.referrer_benefit_amount} BDT earned</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enrolled</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}