import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Copy } from 'lucide-react';

export default function PartnerLeadSubmission() {
  const queryClient = useQueryClient();
  const [leadData, setLeadData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country_of_interest: '',
    degree_level: '',
    intake: ''
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: staffRole } = useQuery({
    queryKey: ['staff-role', user?.id],
    queryFn: async () => {
      const roles = await base44.entities.StaffRole.filter({ user_id: user?.id });
      return roles?.[0];
    },
    enabled: !!user
  });

  const submitLead = useMutation({
    mutationFn: async () => {
      // Create referral record
      const referralCode = `REF-${Date.now()}`;
      const referral = await base44.entities.PartnerReferral.create({
        partner_id: staffRole?.partner_organization_id,
        lead_data: leadData,
        referral_code,
        status: 'submitted'
      });

      // Create student profile
      const student = await base44.entities.StudentProfile.create({
        ...leadData,
        source: `partner_${staffRole?.partner_organization_id}`,
        status: 'new_lead'
      });

      // Update referral with student ID
      await base44.entities.PartnerReferral.update(referral.id, {
        student_id: student.id
      });

      // Auto-assign counselor
      await base44.functions.invoke('autoAssignLead', { student_id: student.id });

      return { referral, student };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-referrals'] });
      toast.success('Lead submitted successfully');
      setLeadData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country_of_interest: '',
        degree_level: '',
        intake: ''
      });
    }
  });

  const referralLink = `${window.location.origin}?ref=${staffRole?.partner_organization_id}`;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="dark:bg-slate-700"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                toast.success('Link copied');
              }}
              className="select-none dark:bg-slate-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Submit New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={leadData.first_name}
              onChange={(e) => setLeadData({ ...leadData, first_name: e.target.value })}
              className="dark:bg-slate-700"
            />
            <Input
              placeholder="Last Name"
              value={leadData.last_name}
              onChange={(e) => setLeadData({ ...leadData, last_name: e.target.value })}
              className="dark:bg-slate-700"
            />
            <Input
              placeholder="Email"
              type="email"
              value={leadData.email}
              onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
              className="dark:bg-slate-700"
            />
            <Input
              placeholder="Phone"
              value={leadData.phone}
              onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
              className="dark:bg-slate-700"
            />
            <Select
              value={leadData.country_of_interest}
              onValueChange={(v) => setLeadData({ ...leadData, country_of_interest: v })}
            >
              <SelectTrigger className="dark:bg-slate-700">
                <SelectValue placeholder="Country of Interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={leadData.degree_level}
              onValueChange={(v) => setLeadData({ ...leadData, degree_level: v })}
            >
              <SelectTrigger className="dark:bg-slate-700">
                <SelectValue placeholder="Degree Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Intake (e.g., September 2026)"
              value={leadData.intake}
              onChange={(e) => setLeadData({ ...leadData, intake: e.target.value })}
              className="dark:bg-slate-700"
            />
          </div>
          <Button
            onClick={() => submitLead.mutate()}
            disabled={!leadData.email || !leadData.first_name}
            className="w-full mt-4 bg-education-blue select-none"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Submit Lead
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}