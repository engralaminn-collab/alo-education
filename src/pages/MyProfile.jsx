import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  User, GraduationCap, Globe, Briefcase, Target,
  Save, Camera, CheckCircle, Plus
} from 'lucide-react';
import Footer from '@/components/landing/Footer';

const countries = ['Afghanistan', 'Albania', 'Algeria', 'Egypt', 'India', 'Pakistan', 'Nigeria', 'Bangladesh', 'Indonesia', 'Other'];
const testTypes = ['ielts', 'toefl', 'pte', 'duolingo', 'none'];
const degreeTypes = ['high_school', 'diploma', 'bachelor', 'master', 'phd'];
const fields = ['business', 'engineering', 'computer_science', 'medicine', 'arts', 'law', 'science', 'other'];

export default function MyProfile() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile, isLoading } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    alternative_email: '',
    alternative_phone: '',
    date_of_birth: '',
    city_of_birth: '',
    country_of_birth: '',
    gender: '',
    marital_status: '',
    nationality: '',
    citizenship: '',
    present_address: {
      address_1: '',
      address_2: '',
      country: '',
      state_district: '',
      city: '',
      zip_code: ''
    },
    permanent_address: {
      address_1: '',
      address_2: '',
      country: '',
      state_district: '',
      city: '',
      zip_code: '',
      same_as_present: false
    },
    passport_details: {
      has_passport: true,
      passport_number: '',
      place_of_issue: '',
      issue_country: '',
      issue_date: '',
      expiry_date: ''
    },
    emergency_contact: {
      name: '',
      phone: '',
      email: '',
      relation: ''
    },
    background_info: {
      applied_for_immigration: false,
      medical_condition: false,
      visa_refusal: false,
      criminal_offence: false
    },
    multiple_citizenship: false,
    multiple_citizenship_countries: '',
    living_studying_other_country: false,
    living_studying_country: '',
    education: {
      highest_degree: '',
      field_of_study: '',
      institution: '',
      graduation_year: '',
      gpa: '',
      gpa_scale: '4',
    },
    english_proficiency: {
      test_type: '',
      score: '',
      test_date: '',
    },
    education_history: [],
    work_experience_years: '',
    preferred_countries: [],
    preferred_degree_level: '',
    preferred_fields: [],
    budget_max: '',
    target_intake: '',
  });

  useEffect(() => {
    if (studentProfile) {
      setFormData({
        first_name: studentProfile.first_name || '',
        last_name: studentProfile.last_name || '',
        email: studentProfile.email || '',
        phone: studentProfile.phone || '',
        alternative_email: studentProfile.alternative_email || '',
        alternative_phone: studentProfile.alternative_phone || '',
        date_of_birth: studentProfile.date_of_birth || '',
        city_of_birth: studentProfile.city_of_birth || '',
        country_of_birth: studentProfile.country_of_birth || '',
        gender: studentProfile.gender || '',
        marital_status: studentProfile.marital_status || '',
        nationality: studentProfile.nationality || '',
        citizenship: studentProfile.citizenship || '',
        present_address: studentProfile.present_address || { address_1: '', address_2: '', country: '', state_district: '', city: '', zip_code: '' },
        permanent_address: studentProfile.permanent_address || { address_1: '', address_2: '', country: '', state_district: '', city: '', zip_code: '', same_as_present: false },
        passport_details: studentProfile.passport_details || { has_passport: true, passport_number: '', place_of_issue: '', issue_country: '', issue_date: '', expiry_date: '' },
        emergency_contact: studentProfile.emergency_contact || { name: '', phone: '', email: '', relation: '' },
        background_info: studentProfile.background_info || { applied_for_immigration: false, medical_condition: false, visa_refusal: false, criminal_offence: false },
        multiple_citizenship: studentProfile.multiple_citizenship || false,
        multiple_citizenship_countries: studentProfile.multiple_citizenship_countries || '',
        living_studying_other_country: studentProfile.living_studying_other_country || false,
        living_studying_country: studentProfile.living_studying_country || '',
        education: studentProfile.education || { highest_degree: '', field_of_study: '', institution: '', graduation_year: '', gpa: '', gpa_scale: '4' },
        education_history: studentProfile.education_history || [],
        english_proficiency: studentProfile.english_proficiency || { test_type: '', score: '', test_date: '' },
        work_experience_years: studentProfile.work_experience_years || '',
        preferred_countries: studentProfile.preferred_countries || [],
        preferred_degree_level: studentProfile.preferred_degree_level || '',
        preferred_fields: studentProfile.preferred_fields || [],
        budget_max: studentProfile.budget_max || '',
        target_intake: studentProfile.target_intake || '',
      });
    }
  }, [studentProfile]);

  const saveProfile = useMutation({
    mutationFn: async (data) => {
      // Calculate completeness
      let completeness = 0;
      const checks = [
        data.first_name, data.last_name, data.phone, data.nationality,
        data.education?.highest_degree, data.english_proficiency?.test_type,
        data.preferred_countries?.length > 0, data.preferred_degree_level
      ];
      completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

      if (studentProfile?.id) {
        return base44.entities.StudentProfile.update(studentProfile.id, {
          ...data,
          profile_completeness: completeness,
        });
      } else {
        return base44.entities.StudentProfile.create({
          ...data,
          email: user.email,
          user_id: user.id,
          profile_completeness: completeness,
          status: 'new_lead',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save profile');
    },
  });

  const handleSave = () => {
    saveProfile.mutate(formData);
  };

  const updateField = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => {
      const arr = prev[field] || [];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const completeness = studentProfile?.profile_completeness || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-200 rounded-xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-slate-300">Complete your profile to get better course matches</p>
            </div>
            <Button 
              onClick={handleSave}
              disabled={saveProfile.isPending}
              className="mt-4 md:mt-0 bg-emerald-500 hover:bg-emerald-600"
            >
              {saveProfile.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Card */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Profile Completeness</h3>
                <p className="text-sm text-slate-500">Complete all sections for better matches</p>
              </div>
              <div className="flex items-center gap-2">
                {completeness === 100 && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                <span className="text-2xl font-bold text-emerald-600">{completeness}%</span>
              </div>
            </div>
            <Progress value={completeness} className="h-3" />
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1 rounded-xl flex-wrap h-auto">
            <TabsTrigger value="personal" className="rounded-lg">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="address" className="rounded-lg">
              <Globe className="w-4 h-4 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger value="passport" className="rounded-lg">
              <Globe className="w-4 h-4 mr-2" />
              Passport
            </TabsTrigger>
            <TabsTrigger value="education" className="rounded-lg">
              <GraduationCap className="w-4 h-4 mr-2" />
              Education
            </TabsTrigger>
            <TabsTrigger value="background" className="rounded-lg">
              <Briefcase className="w-4 h-4 mr-2" />
              Background
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg">
              <Target className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Alternative Email</Label>
                      <Input
                        type="email"
                        value={formData.alternative_email}
                        onChange={(e) => updateField('alternative_email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Phone *</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="mt-1"
                        placeholder="+8801768520331"
                      />
                    </div>
                    <div>
                      <Label>Alternative Phone</Label>
                      <Input
                        value={formData.alternative_phone}
                        onChange={(e) => updateField('alternative_phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => updateField('date_of_birth', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Gender *</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(v) => updateField('gender', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Marital Status</Label>
                      <Select 
                        value={formData.marital_status} 
                        onValueChange={(v) => updateField('marital_status', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>City of Birth</Label>
                      <Input
                        value={formData.city_of_birth}
                        onChange={(e) => updateField('city_of_birth', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Country of Birth *</Label>
                      <Select 
                        value={formData.country_of_birth} 
                        onValueChange={(v) => updateField('country_of_birth', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Nationality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Nationality *</Label>
                      <Select 
                        value={formData.nationality} 
                        onValueChange={(v) => updateField('nationality', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Citizenship *</Label>
                      <Select 
                        value={formData.citizenship} 
                        onValueChange={(v) => updateField('citizenship', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select citizenship" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Is the applicant a citizen of more than one country? *</Label>
                    <Select 
                      value={formData.multiple_citizenship ? 'yes' : 'no'} 
                      onValueChange={(v) => updateField('multiple_citizenship', v === 'yes')}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.multiple_citizenship && (
                    <div>
                      <Label>Please specify countries</Label>
                      <Input
                        value={formData.multiple_citizenship_countries}
                        onChange={(e) => updateField('multiple_citizenship_countries', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., Bangladesh, USA"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Is the applicant living and studying in any other country? *</Label>
                    <Select 
                      value={formData.living_studying_other_country ? 'yes' : 'no'} 
                      onValueChange={(v) => updateField('living_studying_other_country', v === 'yes')}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.living_studying_other_country && (
                    <div>
                      <Label>Please specify country</Label>
                      <Input
                        value={formData.living_studying_country}
                        onChange={(e) => updateField('living_studying_country', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={formData.emergency_contact.name}
                        onChange={(e) => updateField('emergency_contact.name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Relation with Applicant</Label>
                      <Input
                        value={formData.emergency_contact.relation}
                        onChange={(e) => updateField('emergency_contact.relation', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., Father"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.emergency_contact.phone}
                        onChange={(e) => updateField('emergency_contact.phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.emergency_contact.email}
                        onChange={(e) => updateField('emergency_contact.email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Address Information */}
          <TabsContent value="address">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Mailing Address</CardTitle>
                  <CardDescription>Current mailing address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Address 1 *</Label>
                    <Input
                      value={formData.present_address.address_1}
                      onChange={(e) => updateField('present_address.address_1', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Address 2</Label>
                    <Input
                      value={formData.present_address.address_2}
                      onChange={(e) => updateField('present_address.address_2', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Country *</Label>
                      <Select 
                        value={formData.present_address.country} 
                        onValueChange={(v) => updateField('present_address.country', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>State / District</Label>
                      <Input
                        value={formData.present_address.state_district}
                        onChange={(e) => updateField('present_address.state_district', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={formData.present_address.city}
                        onChange={(e) => updateField('present_address.city', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Pincode / Zip Code</Label>
                      <Input
                        value={formData.present_address.zip_code}
                        onChange={(e) => updateField('present_address.zip_code', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Permanent Address</CardTitle>
                  <CardDescription>Permanent residential address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.permanent_address.same_as_present}
                      onChange={(e) => {
                        updateField('permanent_address.same_as_present', e.target.checked);
                        if (e.target.checked) {
                          updateField('permanent_address', { 
                            ...formData.present_address, 
                            same_as_present: true 
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <Label>Same as mailing address</Label>
                  </div>

                  {!formData.permanent_address.same_as_present && (
                    <>
                      <div>
                        <Label>Address 1 *</Label>
                        <Input
                          value={formData.permanent_address.address_1}
                          onChange={(e) => updateField('permanent_address.address_1', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Address 2</Label>
                        <Input
                          value={formData.permanent_address.address_2}
                          onChange={(e) => updateField('permanent_address.address_2', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Country *</Label>
                          <Select 
                            value={formData.permanent_address.country} 
                            onValueChange={(v) => updateField('permanent_address.country', v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>State / District</Label>
                          <Input
                            value={formData.permanent_address.state_district}
                            onChange={(e) => updateField('permanent_address.state_district', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>City *</Label>
                          <Input
                            value={formData.permanent_address.city}
                            onChange={(e) => updateField('permanent_address.city', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Pincode / Zip Code</Label>
                          <Input
                            value={formData.permanent_address.zip_code}
                            onChange={(e) => updateField('permanent_address.zip_code', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Passport Information */}
          <TabsContent value="passport">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Passport Information</CardTitle>
                <CardDescription>Your passport details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Passport Number *</Label>
                    <Input
                      value={formData.passport_details.passport_number}
                      onChange={(e) => updateField('passport_details.passport_number', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Place of Issue</Label>
                    <Input
                      value={formData.passport_details.place_of_issue}
                      onChange={(e) => updateField('passport_details.place_of_issue', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label>Issue Date *</Label>
                    <Input
                      type="date"
                      value={formData.passport_details.issue_date}
                      onChange={(e) => updateField('passport_details.issue_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={formData.passport_details.expiry_date}
                      onChange={(e) => updateField('passport_details.expiry_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Issue Country *</Label>
                    <Select 
                      value={formData.passport_details.issue_country} 
                      onValueChange={(v) => updateField('passport_details.issue_country', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Background Information */}
          <TabsContent value="background">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Background Information</CardTitle>
                <CardDescription>Important background details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Has applicant applied for any type of immigration into any country? *</Label>
                  <Select 
                    value={formData.background_info.applied_for_immigration ? 'yes' : 'no'} 
                    onValueChange={(v) => updateField('background_info.applied_for_immigration', v === 'yes')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Does applicant suffer from a serious medical condition? *</Label>
                  <Select 
                    value={formData.background_info.medical_condition ? 'yes' : 'no'} 
                    onValueChange={(v) => updateField('background_info.medical_condition', v === 'yes')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Has applicant Visa refusal for any country? *</Label>
                  <Select 
                    value={formData.background_info.visa_refusal ? 'yes' : 'no'} 
                    onValueChange={(v) => updateField('background_info.visa_refusal', v === 'yes')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Has applicant ever been convicted of a criminal offence? *</Label>
                  <Select 
                    value={formData.background_info.criminal_offence ? 'yes' : 'no'} 
                    onValueChange={(v) => updateField('background_info.criminal_offence', v === 'yes')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Education History</CardTitle>
                      <CardDescription>Add your academic qualifications</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newHistory = [...(formData.education_history || []), {
                          academic_level: '',
                          institution_name: '',
                          board_name: '',
                          group_subject: '',
                          result_type: '',
                          result_value: '',
                          primary_language: '',
                          country: '',
                          state: '',
                          city: '',
                          start_date: '',
                          end_date: ''
                        }];
                        updateField('education_history', newHistory);
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Qualification
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {(formData.education_history && formData.education_history.length > 0) ? (
                    formData.education_history.map((edu, index) => (
                      <div key={index} className="p-6 border rounded-lg space-y-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold" style={{ color: 'var(--alo-blue)' }}>
                            Qualification {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newHistory = formData.education_history.filter((_, i) => i !== index);
                              updateField('education_history', newHistory);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Level of Study *</Label>
                            <Select 
                              value={edu.academic_level} 
                              onValueChange={(v) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].academic_level = v;
                                updateField('education_history', newHistory);
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SSC/Grade 10th">SSC/Grade 10th</SelectItem>
                                <SelectItem value="HSC/Grade 12th">HSC/Grade 12th</SelectItem>
                                <SelectItem value="Undergraduate/Bachelor 4 Years">Undergraduate/Bachelor 4 Years</SelectItem>
                                <SelectItem value="Undergraduate/Bachelor 3 Years">Undergraduate/Bachelor 3 Years</SelectItem>
                                <SelectItem value="Postgraduate/Masters">Postgraduate/Masters</SelectItem>
                                <SelectItem value="PGD">PGD</SelectItem>
                                <SelectItem value="PhD">PhD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Name of Institution *</Label>
                            <Input
                              value={edu.institution_name}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].institution_name = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                              placeholder="e.g., Pura D. C. High School"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <Label>Country of Study *</Label>
                            <Select 
                              value={edu.country} 
                              onValueChange={(v) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].country = v;
                                updateField('education_history', newHistory);
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map(c => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>State of Study</Label>
                            <Input
                              value={edu.state}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].state = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label>City of Study *</Label>
                            <Input
                              value={edu.city}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].city = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Name of Board / University *</Label>
                            <Input
                              value={edu.board_name}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].board_name = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                              placeholder="e.g., Dhaka"
                            />
                          </div>

                          <div>
                            <Label>Qualification Achieved / Degree Awarded</Label>
                            <Input
                              value={edu.group_subject}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].group_subject = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                              placeholder="e.g., Secondary School Certificate"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <Label>Grading System *</Label>
                            <Select 
                              value={edu.result_type} 
                              onValueChange={(v) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].result_type = v;
                                updateField('education_history', newHistory);
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Grade">Grade (Out of 5)</SelectItem>
                                <SelectItem value="Percentage">Percentage</SelectItem>
                                <SelectItem value="GPA">GPA (Out of 4)</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Score *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={edu.result_value}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].result_value = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                              placeholder="e.g., 3.44"
                            />
                          </div>

                          <div>
                            <Label>Primary Language of Instruction *</Label>
                            <Input
                              value={edu.primary_language}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].primary_language = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                              placeholder="e.g., Bangla"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Start Date *</Label>
                            <Input
                              type="date"
                              value={edu.start_date}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].start_date = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label>End Date *</Label>
                            <Input
                              type="date"
                              value={edu.end_date}
                              onChange={(e) => {
                                const newHistory = [...formData.education_history];
                                newHistory[index].end_date = e.target.value;
                                updateField('education_history', newHistory);
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No qualifications added yet</p>
                      <p className="text-sm">Click "Add Qualification" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>English Proficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label>Test Type</Label>
                      <Select 
                        value={formData.english_proficiency.test_type} 
                        onValueChange={(v) => updateField('english_proficiency.test_type', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select test" />
                        </SelectTrigger>
                        <SelectContent>
                          {testTypes.map(t => (
                            <SelectItem key={t} value={t} className="uppercase">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Score</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={formData.english_proficiency.score}
                        onChange={(e) => updateField('english_proficiency.score', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Test Date</Label>
                      <Input
                        type="date"
                        value={formData.english_proficiency.test_date}
                        onChange={(e) => updateField('english_proficiency.test_date', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
                <CardDescription>Help us find the best matches for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Preferred Countries</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'France', 'Netherlands'].map(country => (
                      <Badge
                        key={country}
                        variant={formData.preferred_countries.includes(country) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          formData.preferred_countries.includes(country) 
                            ? 'bg-emerald-500 hover:bg-emerald-600' 
                            : 'hover:bg-slate-100'
                        }`}
                        onClick={() => toggleArrayField('preferred_countries', country)}
                      >
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Preferred Degree Level</Label>
                  <Select 
                    value={formData.preferred_degree_level} 
                    onValueChange={(v) => updateField('preferred_degree_level', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fields of Interest</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fields.map(field => (
                      <Badge
                        key={field}
                        variant={formData.preferred_fields.includes(field) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all capitalize ${
                          formData.preferred_fields.includes(field) 
                            ? 'bg-emerald-500 hover:bg-emerald-600' 
                            : 'hover:bg-slate-100'
                        }`}
                        onClick={() => toggleArrayField('preferred_fields', field)}
                      >
                        {field.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Maximum Budget (USD/year)</Label>
                    <Input
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => updateField('budget_max', e.target.value)}
                      className="mt-1"
                      placeholder="e.g. 30000"
                    />
                  </div>
                  <div>
                    <Label>Target Intake</Label>
                    <Input
                      value={formData.target_intake}
                      onChange={(e) => updateField('target_intake', e.target.value)}
                      className="mt-1"
                      placeholder="e.g. September 2025"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}