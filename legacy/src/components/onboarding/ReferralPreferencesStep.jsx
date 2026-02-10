import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Target, ChevronRight } from 'lucide-react';

export default function ReferralPreferencesStep({ onboarding, onComplete }) {
  const [formData, setFormData] = useState({
    primary_channels: onboarding?.referral_preferences?.primary_channels || [],
    target_demographics: onboarding?.referral_preferences?.target_demographics || '',
    specialization: onboarding?.referral_preferences?.specialization || ''
  });

  const channels = [
    'Website', 'Social Media', 'Email Marketing', 'Events/Webinars', 
    'Direct Contact', 'Partner Network', 'WhatsApp', 'Referrals'
  ];

  const specializations = [
    'Undergraduate Programs', 'Postgraduate Programs', 'MBA Programs',
    'Medical Studies', 'Engineering', 'Business & Finance', 'Arts & Humanities',
    'STEM Programs', 'Pathway Programs'
  ];

  const toggleChannel = (channel) => {
    if (formData.primary_channels.includes(channel)) {
      setFormData({
        ...formData,
        primary_channels: formData.primary_channels.filter(c => c !== channel)
      });
    } else {
      setFormData({
        ...formData,
        primary_channels: [...formData.primary_channels, channel]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({ referral_preferences: formData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-education-blue" />
          Your Referral Strategy
        </CardTitle>
        <p className="text-sm text-slate-600">
          Help us understand how you acquire and work with students
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Primary Referral Channels</Label>
            <p className="text-xs text-slate-500 mb-3">Select all channels you use to attract students</p>
            <div className="flex flex-wrap gap-2">
              {channels.map(channel => (
                <Badge
                  key={channel}
                  variant={formData.primary_channels.includes(channel) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    formData.primary_channels.includes(channel)
                      ? 'bg-education-blue'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => toggleChannel(channel)}
                >
                  {channel}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Specialization</Label>
            <p className="text-xs text-slate-500 mb-3">What types of programs do you focus on?</p>
            <div className="flex flex-wrap gap-2">
              {specializations.map(spec => (
                <Badge
                  key={spec}
                  variant={formData.specialization === spec ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    formData.specialization === spec
                      ? 'bg-education-blue'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => setFormData({ ...formData, specialization: spec })}
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Target Demographics</Label>
            <p className="text-xs text-slate-500 mb-2">Describe your typical student profile</p>
            <Textarea
              value={formData.target_demographics}
              onChange={(e) => setFormData({ ...formData, target_demographics: e.target.value })}
              placeholder="e.g., Recent graduates aged 22-28, GPA 3.0+, interested in tech programs in North America..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full bg-education-blue">
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}