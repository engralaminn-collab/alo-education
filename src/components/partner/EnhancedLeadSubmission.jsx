import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Copy, CheckCircle2, Loader2 } from 'lucide-react';

export default function EnhancedLeadSubmission() {
  const queryClient = useQueryClient();
  const [leadData, setLeadData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country_of_interest: '',
    degree_level: '',
    intake: '',
    field_of_study: '',
    budget_range: '',
    source_campaign: '',
    notes: ''
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
      const referralCode = `REF-${staffRole?.partner_organization_id}-${Date.now()}`;
      
      const referral = await base44.entities.PartnerReferral.create({
        partner_id: staffRole?.partner_organization_id,
        lead_data: leadData,
        referral_code,
        status: 'submitted'
      });

      const student = await base44.entities.StudentProfile.create({
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone,
        preferred_countries: [leadData.country_of_interest],
        preferred_degree_level: leadData.degree_level,
        target_intake: leadData.intake,
        preferred_fields: [leadData.field_of_study],
        source: `partner_${staffRole?.partner_organization_id}`,
        status: 'new_lead',
        notes: leadData.notes
      });

      await base44.entities.PartnerReferral.update(referral.id, {
        student_id: student.id
      });

      await base44.functions.invoke('autoAssignLead', { student_id: student.id });

      return { referral, student };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-referrals'] });
      toast.success('Lead submitted and counselor assigned!');
      setLeadData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country_of_interest: '',
        degree_level: '',
        intake: '',
        field_of_study: '',
        budget_range: '',
        source_campaign: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to submit lead: ' + error.message);
    }
  });

  const referralLink = `${window.location.origin}?ref=${staffRole?.partner_organization_id}`;

  return (
    <div className="space-y-6">
      {/* Referral Link */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-education-blue to-cyan-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Your Referral Link</h3>
              <p className="text-sm opacity-90">Share this link to track referrals automatically</p>
            </div>
            <Badge className="bg-white text-education-blue">
              Org: {staffRole?.partner_organization_id?.slice(0, 8)}
            </Badge>
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              value={referralLink}
              readOnly
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                toast.success('Link copied to clipboard!');
              }}
              className="bg-white text-education-blue hover:bg-white/90 border-0 select-none"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lead Submission Form */}
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <UserPlus className="w-5 h-5" />
            Submit New Lead
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); submitLead.mutate(); }} className="space-y-4">
            {/* Personal Information */}
            <div>
              <h4 className="font-semibold mb-3 dark:text-white">Personal Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="First Name *"
                  value={leadData.first_name}
                  onChange={(e) => setLeadData({ ...leadData, first_name: e.target.value })}
                  required
                  className="dark:bg-slate-700"
                />
                <Input
                  placeholder="Last Name *"
                  value={leadData.last_name}
                  onChange={(e) => setLeadData({ ...leadData, last_name: e.target.value })}
                  required
                  className="dark:bg-slate-700"
                />
                <Input
                  placeholder="Email Address *"
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  required
                  className="dark:bg-slate-700"
                />
                <Input
                  placeholder="Phone Number *"
                  value={leadData.phone}
                  onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                  required
                  className="dark:bg-slate-700"
                />
              </div>
            </div>

            {/* Study Preferences */}
            <div>
              <h4 className="font-semibold mb-3 dark:text-white">Study Preferences</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  value={leadData.country_of_interest}
                  onValueChange={(v) => setLeadData({ ...leadData, country_of_interest: v })}
                  required
                >
                  <SelectTrigger className="dark:bg-slate-700">
                    <SelectValue placeholder="Destination Country *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Ireland">Ireland</SelectItem>
                    <SelectItem value="New Zealand">New Zealand</SelectItem>
                    <SelectItem value="Dubai">Dubai</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={leadData.degree_level}
                  onValueChange={(v) => setLeadData({ ...leadData, degree_level: v })}
                  required
                >
                  <SelectTrigger className="dark:bg-slate-700">
                    <SelectValue placeholder="Degree Level *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Field of Study *"
                  value={leadData.field_of_study}
                  onChange={(e) => setLeadData({ ...leadData, field_of_study: e.target.value })}
                  required
                  className="dark:bg-slate-700"
                />

                <Input
                  placeholder="Target Intake (e.g., September 2026)"
                  value={leadData.intake}
                  onChange={(e) => setLeadData({ ...leadData, intake: e.target.value })}
                  className="dark:bg-slate-700"
                />

                <Select
                  value={leadData.budget_range}
                  onValueChange={(v) => setLeadData({ ...leadData, budget_range: v })}
                >
                  <SelectTrigger className="dark:bg-slate-700">
                    <SelectValue placeholder="Budget Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-10k">Under $10,000</SelectItem>
                    <SelectItem value="10k-20k">$10,000 - $20,000</SelectItem>
                    <SelectItem value="20k-30k">$20,000 - $30,000</SelectItem>
                    <SelectItem value="30k-plus">$30,000+</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Source Campaign (Optional)"
                  value={leadData.source_campaign}
                  onChange={(e) => setLeadData({ ...leadData, source_campaign: e.target.value })}
                  className="dark:bg-slate-700"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h4 className="font-semibold mb-3 dark:text-white">Additional Information</h4>
              <Textarea
                placeholder="Add any additional notes or details about the lead..."
                value={leadData.notes}
                onChange={(e) => setLeadData({ ...leadData, notes: e.target.value })}
                rows={4}
                className="dark:bg-slate-700"
              />
            </div>

            <Button
              type="submit"
              disabled={submitLead.isPending || !leadData.email || !leadData.first_name}
              className="w-full bg-education-blue hover:bg-education-blue/90 select-none"
            >
              {submitLead.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Lead
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}