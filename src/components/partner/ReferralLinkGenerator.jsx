import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link2, Copy, Plus, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralLinkGenerator({ partnerId }) {
  const [copied, setCopied] = useState(null);
  const queryClient = useQueryClient();

  const { data: referralCodes = [] } = useQuery({
    queryKey: ['referral-codes', partnerId],
    queryFn: async () => {
      const codes = await base44.entities.PartnerReferral.filter({ partner_id: partnerId });
      // Get unique codes
      return [...new Set(codes.map(c => c.referral_code))].filter(Boolean);
    },
    enabled: !!partnerId
  });

  const generateCode = useMutation({
    mutationFn: async () => {
      const code = `${partnerId}-${Date.now().toString(36).toUpperCase()}`;
      await base44.entities.PartnerReferral.create({
        partner_id: partnerId,
        referral_code: code,
        status: 'submitted',
        lead_data: {}
      });
      return code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-codes'] });
      toast.success('New referral code generated!');
    }
  });

  const copyLink = (code) => {
    const link = `${window.location.origin}/referral?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(code);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const getReferralStats = async (code) => {
    const referrals = await base44.entities.PartnerReferral.filter({ 
      partner_id: partnerId,
      referral_code: code 
    });
    return {
      total: referrals.length,
      converted: referrals.filter(r => r.status === 'converted' || r.status === 'enrolled').length
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-education-blue" />
            Referral Links & Codes
          </CardTitle>
          <Button 
            onClick={() => generateCode.mutate()}
            disabled={generateCode.isPending}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate New Code
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 mb-2">
            <strong>How it works:</strong>
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Share your unique referral link with prospects</li>
            <li>Leads are automatically assigned to you</li>
            <li>Track conversions and earn commissions</li>
          </ul>
        </div>

        {referralCodes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No referral codes yet. Generate one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referralCodes.map(code => {
              const link = `${window.location.origin}/referral?code=${code}`;
              return (
                <div key={code} className="p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Badge className="mb-2">{code}</Badge>
                      <Input
                        value={link}
                        readOnly
                        className="text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(code)}
                      className="flex-1"
                    >
                      {copied === code ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}