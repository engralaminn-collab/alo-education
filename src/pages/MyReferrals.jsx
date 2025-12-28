import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, Copy, Users, CheckCircle2, Clock, Share2, 
  Mail, Trophy, TrendingUp, Star, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/landing/Footer';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyReferrals() {
  const [email, setEmail] = useState('');
  const [referredName, setReferredName] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const result = await base44.entities.ReferralSettings.list();
      return result[0] || {
        program_active: true,
        referrer_benefit_amount: 500,
        referrer_benefit_currency: 'BDT',
        referred_benefit_amount: 1000,
        referred_benefit_currency: 'BDT',
        reward_trigger: 'enrollment'
      };
    },
  });

  const { data: myReferrals = [] } = useQuery({
    queryKey: ['my-referrals', studentProfile?.id],
    queryFn: () => base44.entities.Referral.filter({ referrer_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

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
    mutationFn: async ({ referredEmail, referredName }) => {
      return base44.entities.Referral.create({
        referrer_id: studentProfile.id,
        referrer_email: studentProfile.email,
        referrer_name: `${studentProfile.first_name} ${studentProfile.last_name}`,
        referred_email: referredEmail,
        referred_name: referredName,
        referral_code: referralCode,
        referrer_benefit_type: settings?.referrer_benefit_type || 'discount',
        referrer_benefit_amount: settings?.referrer_benefit_amount || 500,
        referred_benefit_type: settings?.referred_benefit_type || 'discount',
        referred_benefit_amount: settings?.referred_benefit_amount || 1000,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referrals'] });
      setEmail('');
      setReferredName('');
      toast.success('Referral invitation sent successfully!');
    },
    onError: (error) => {
      toast.error('Failed to send referral. Please try again.');
    }
  });

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join ALO Education',
        text: `Use my referral code "${referralCode}" to get ${settings?.referred_benefit_amount} ${settings?.referred_benefit_currency} discount on ALO Education services!`,
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  const totalReferred = myReferrals.length;
  const registered = myReferrals.filter(r => r.status === 'registered').length;
  const applied = myReferrals.filter(r => r.status === 'applied').length;
  const enrolled = myReferrals.filter(r => r.status === 'enrolled').length;
  const pending = myReferrals.filter(r => r.status === 'pending').length;
  
  const totalEarned = myReferrals
    .filter(r => r.referrer_benefit_claimed)
    .reduce((sum, r) => sum + (r.referrer_benefit_amount || 0), 0);

  const potentialEarnings = myReferrals
    .filter(r => !r.referrer_benefit_claimed && r.status !== 'pending')
    .reduce((sum, r) => sum + (r.referrer_benefit_amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-3">Referral Program</h1>
            <p className="text-xl opacity-90">
              Earn rewards by referring friends to ALO Education
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2" style={{ borderColor: '#0066CC' }}>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3" style={{ color: '#0066CC' }} />
              <p className="text-3xl font-bold text-slate-900">{totalReferred}</p>
              <p className="text-sm text-slate-600">Total Referrals</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <p className="text-3xl font-bold text-green-900">{enrolled}</p>
              <p className="text-sm text-green-700">Enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-2" style={{ borderColor: '#F37021', backgroundColor: '#FFF5F0' }}>
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 mx-auto mb-3" style={{ color: '#F37021' }} />
              <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                {totalEarned.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">Earned ({settings?.referrer_benefit_currency})</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-amber-600" />
              <p className="text-3xl font-bold text-amber-900">
                {potentialEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-amber-700">Pending Rewards</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Share Your Link */}
            <Card className="border-2" style={{ borderColor: '#F37021' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
                  <Share2 className="w-5 h-5" />
                  Share Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">
                    Your Unique Referral Code
                  </label>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      value={referralCode} 
                      readOnly 
                      className="font-mono text-2xl font-bold text-center"
                      style={{ color: '#0066CC' }}
                    />
                    <Button onClick={copyLink} size="lg" variant="outline">
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Or Share Full Link
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      value={referralLink} 
                      readOnly 
                      className="text-sm"
                    />
                    <Button onClick={shareLink} style={{ backgroundColor: '#F37021' }}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-semibold mb-1">
                    💰 Earn {settings?.referrer_benefit_amount} {settings?.referrer_benefit_currency} per referral!
                  </p>
                  <p className="text-xs text-blue-700">
                    Your friends get {settings?.referred_benefit_amount} {settings?.referred_benefit_currency} discount too!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Send Invitation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
                  <Mail className="w-5 h-5" />
                  Invite a Friend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Friend's Name
                    </label>
                    <Input
                      placeholder="Enter name"
                      value={referredName}
                      onChange={(e) => setReferredName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Friend's Email
                    </label>
                    <Input
                      type="email"
                      placeholder="friend@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => createReferralMutation.mutate({ referredEmail: email, referredName })}
                    disabled={!email || createReferralMutation.isPending}
                    className="w-full"
                    style={{ backgroundColor: '#F37021' }}
                  >
                    {createReferralMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral History */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#0066CC' }}>Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="all">All ({totalReferred})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pending})</TabsTrigger>
                    <TabsTrigger value="enrolled">Enrolled ({enrolled})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {myReferrals.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No referrals yet</p>
                        <p className="text-sm text-slate-400">Start sharing your referral code!</p>
                      </div>
                    ) : (
                      myReferrals.map((ref) => (
                        <div key={ref.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {ref.referred_name || ref.referred_email}
                              </p>
                              <p className="text-sm text-slate-600">{ref.referred_email}</p>
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
                          {ref.registered_date && (
                            <p className="text-xs text-slate-500">
                              Registered: {new Date(ref.registered_date).toLocaleDateString()}
                            </p>
                          )}
                          {ref.enrolled_date && (
                            <div className="mt-2 flex items-center gap-2">
                              <Gift className="w-4 h-4" style={{ color: '#F37021' }} />
                              <span className="text-sm font-semibold" style={{ color: '#F37021' }}>
                                Earned: {ref.referrer_benefit_amount} {settings?.referrer_benefit_currency}
                              </span>
                              {ref.referrer_benefit_claimed && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Claimed</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-3">
                    {myReferrals.filter(r => r.status === 'pending').map((ref) => (
                      <div key={ref.id} className="p-4 border rounded-lg">
                        <p className="font-semibold">{ref.referred_email}</p>
                        <p className="text-sm text-slate-500">Awaiting registration</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="enrolled" className="space-y-3">
                    {myReferrals.filter(r => r.status === 'enrolled').map((ref) => (
                      <div key={ref.id} className="p-4 border rounded-lg bg-green-50">
                        <p className="font-semibold">{ref.referred_name}</p>
                        <p className="text-sm text-slate-600">{ref.referred_email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">
                            Reward: {ref.referrer_benefit_amount} {settings?.referrer_benefit_currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How it Works */}
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#0066CC' }}>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Share Your Code</p>
                    <p className="text-xs text-slate-600">Send your referral link to friends</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-sm">They Register</p>
                    <p className="text-xs text-slate-600">Friends use your code to sign up</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F37021', color: 'white' }}>
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Get Rewards</p>
                    <p className="text-xs text-slate-600">Earn when they enroll in a program</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Info */}
            <Card style={{ backgroundColor: '#F37021', color: 'white' }}>
              <CardContent className="p-6">
                <Star className="w-12 h-12 mb-4" />
                <h3 className="font-bold text-xl mb-2">Exclusive Rewards</h3>
                <p className="text-white/90 mb-4 text-sm">
                  For every successful referral, you earn {settings?.referrer_benefit_amount} {settings?.referrer_benefit_currency} 
                  and your friend gets {settings?.referred_benefit_amount} {settings?.referred_benefit_currency} discount!
                </p>
                {settings?.terms_and_conditions && (
                  <p className="text-xs text-white/70">
                    {settings.terms_and_conditions}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Back to Dashboard */}
            <Card>
              <CardContent className="p-6">
                <Link to={createPageUrl('StudentDashboard')}>
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}