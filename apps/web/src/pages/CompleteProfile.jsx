import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  User, Mail, Phone, MapPin, GraduationCap, 
  Briefcase, FileText, Globe, CheckCircle, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState('personal');

  const { data: user } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile-complete', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else if (user) {
      setFormData({
        email: user.email,
        first_name: user.full_name?.split(' ')[0] || '',
        last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
        education_history: [{}],
        work_experience: [],
        recommendation_letters: [],
        visa_history: [],
      });
    }
  }, [profile, user]);

  const saveProfile = useMutation({
    mutationFn: async (data) => {
      // Calculate completeness
      const totalFields = 50;
      const filledFields = Object.values(data).filter(v => v && v !== '').length;
      data.profile_completeness = Math.round((filledFields / totalFields) * 100);

      if (profile?.id) {
        return base44.entities.StudentProfile.update(profile.id, data);
      } else {
        return base44.entities.StudentProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-profile-complete']);
      toast.success('Profile saved successfully!');
      navigate(createPageUrl('StudentDashboard'));
    },
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const tabs = [
    { value: 'personal', label: 'Personal Info', icon: User },
    { value: 'contact', label: 'Contact', icon: Phone },
    { value: 'education', label: 'Education', icon: GraduationCap },
    { value: 'passport', label: 'Passport', icon: Globe },
    { value: 'english', label: 'English Test', icon: FileText },
    { value: 'work', label: 'Work Experience', icon: Briefcase },
    { value: 'preferences', label: 'Study Preferences', icon: CheckCircle },
  ];

  const completeness = formData.profile_completeness || 0;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-6 max-w-5xl">
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                <p className="text-slate-500 mt-1">Fill in all details to unlock your student portal</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{completeness}%</p>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
            </div>
            <Progress value={completeness} className="h-2 mt-4" />
          </CardHeader>
        </Card>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-7 w-full mb-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.first_name || ''}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.last_name || ''}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => updateField('date_of_birth', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nationality *</Label>
                    <Input
                      value={formData.nationality || ''}
                      onChange={(e) => updateField('nationality', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Marital Status</Label>
                    <Select value={formData.marital_status} onValueChange={(v) => updateField('marital_status', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>City of Birth</Label>
                    <Input
                      value={formData.city_of_birth || ''}
                      onChange={(e) => updateField('city_of_birth', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Country of Birth</Label>
                    <Input
                      value={formData.country_of_birth || ''}
                      onChange={(e) => updateField('country_of_birth', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Email *</Label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="mt-2"
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Alternative Email</Label>
                    <Input
                      type="email"
                      value={formData.alternative_email || ''}
                      onChange={(e) => updateField('alternative_email', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Alternative Phone</Label>
                    <Input
                      value={formData.alternative_phone || ''}
                      onChange={(e) => updateField('alternative_phone', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Present Address</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Address</Label>
                      <Textarea
                        value={formData.present_address?.address || ''}
                        onChange={(e) => updateNestedField('present_address', 'address', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Country</Label>
                        <Input
                          value={formData.present_address?.country || ''}
                          onChange={(e) => updateNestedField('present_address', 'country', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={formData.present_address?.city || ''}
                          onChange={(e) => updateNestedField('present_address', 'city', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Preferred Study Destination</Label>
                    <Input
                      value={formData.admission_preferences?.study_destination || ''}
                      onChange={(e) => updateNestedField('admission_preferences', 'study_destination', e.target.value)}
                      placeholder="e.g., UK, USA, Canada"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Study Level</Label>
                    <Select 
                      value={formData.admission_preferences?.study_level} 
                      onValueChange={(v) => updateNestedField('admission_preferences', 'study_level', v)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate/Masters</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Preferred Study Area</Label>
                  <Input
                    value={formData.admission_preferences?.study_area || ''}
                    onChange={(e) => updateNestedField('admission_preferences', 'study_area', e.target.value)}
                    placeholder="e.g., Business, Engineering, Computer Science"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Preferred Intake</Label>
                  <Input
                    value={formData.admission_preferences?.intake || ''}
                    onChange={(e) => updateNestedField('admission_preferences', 'intake', e.target.value)}
                    placeholder="e.g., September 2025"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => navigate(createPageUrl('StudentDashboard'))}>
            Save & Exit
          </Button>
          <Button 
            onClick={() => saveProfile.mutate(formData)}
            disabled={saveProfile.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}