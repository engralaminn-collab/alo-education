import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Users, CheckCircle2, Clock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ReferralProgram({ studentProfile }) {
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const result = await base44.entities.ReferralSettings.list();
      return result[0] || { program_active: true };
    },
  });

  const { data: myReferrals = [] } = useQuery({
    queryKey: ['my-referrals', studentProfile?.id],
    queryFn: () => base44.entities.Referral.filter({ referrer_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  // Generate unique referral code from student name and ID
  const generateReferralCode = () => {
    if (studentProfile?.referral_code) return studentProfile.referral_code;
    const firstName = (studentProfile?.first_name || '').slice(0, 3).toUpperCase();
    const lastName = (studentProfile?.last_name || '').slice(0, 2).toUpperCase();
    const idPart = studentProfile?.id?.slice(-4) || '0000';
    return `${firstName}${lastName}${idPart}`;
  };
  
  const referralCode = generateReferralCode();
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const createReferralMutation = useMutation({
    mutationFn: async (referredEmail) => {
      return base44.entities.Referral.create({
        referrer_id: studentProfile.id,
        referrer_email: studentProfile.email,
        referrer_name: `${studentProfile.first_name} ${studentProfile.last_name}`,
        referred_email: referredEmail,
        referral_code: referralCode,
        referrer_benefit_type: settings?.referrer_benefit_type,
        referrer_benefit_amount: settings?.referrer_benefit_amount,
        referred_benefit_type: settings?.referred_benefit_type,
        referred_benefit_amount: settings?.referred_benefit_amount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referrals'] });
      setEmail('');
      toast.success('Referral sent!');
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join ALO Education',
        text: `Use my referral code to get ${settings?.referred_benefit_amount} ${settings?.referred_benefit_currency} discount!`,
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  if (!settings?.program_active) return null;

  const totalReferred = myReferrals.length;
  const enrolled = myReferrals.filter(r => r.status === 'enrolled').length;
  const pending = myReferrals.filter(r => r.status === 'pending').length;
  const totalEarned = myReferrals
    .filter(r => r.status === 'enrolled')
    .reduce((sum, r) => sum + (r.referrer_benefit_amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" style={{ color: '#F37021' }} />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-900">{totalReferred}</p>
            <p className="text-xs text-blue-600">Total Referrals</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Gift className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-900">{totalEarned}</p>
            <p className="text-xs text-green-600">Total Earned (BDT)</p>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Your Referral Code
          </label>
          <div className="flex gap-2">
            <Input value={referralCode} readOnly className="font-mono" />
            <Button onClick={copyLink} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={shareLink} style={{ backgroundColor: '#F37021' }}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Share this code with friends to earn {settings?.referrer_benefit_amount} {settings?.referrer_benefit_currency} per successful enrollment!
          </p>
        </div>

        {/* Send Referral */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Invite a Friend
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={() => createReferralMutation.mutate(email)}
              disabled={!email || createReferralMutation.isPending}
              style={{ backgroundColor: '#0066CC' }}
            >
              Send
            </Button>
          </div>
        </div>

        {/* Referral List */}
        {myReferrals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900">Your Referrals</h4>
              <Link to={createPageUrl('MyReferrals')}>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {myReferrals.slice(0, 5).map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{ref.referred_email}</p>
                    <p className="text-xs text-slate-500">
                      {ref.referred_name || 'Not registered yet'}
                    </p>
                  </div>
                  <Badge className={
                    ref.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                    ref.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                    ref.status === 'registered' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {ref.status === 'enrolled' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {ref.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}