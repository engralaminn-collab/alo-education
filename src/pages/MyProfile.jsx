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
  Save, Camera, CheckCircle
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
    phone: '',
    nationality: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
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
        phone: studentProfile.phone || '',
        nationality: studentProfile.nationality || '',
        date_of_birth: studentProfile.date_of_birth || '',
        address: studentProfile.address || '',
        city: studentProfile.city || '',
        country: studentProfile.country || '',
        education: studentProfile.education || {
          highest_degree: '', field_of_study: '', institution: '', graduation_year: '', gpa: '', gpa_scale: '4'
        },
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
          <TabsList className="bg-white shadow-sm p-1 rounded-xl">
            <TabsTrigger value="personal" className="rounded-lg">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="education" className="rounded-lg">
              <GraduationCap className="w-4 h-4 mr-2" />
              Education
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg">
              <Target className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => updateField('date_of_birth', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Nationality</Label>
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
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Academic Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Highest Degree</Label>
                      <Select 
                        value={formData.education.highest_degree} 
                        onValueChange={(v) => updateField('education.highest_degree', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                        <SelectContent>
                          {degreeTypes.map(d => (
                            <SelectItem key={d} value={d} className="capitalize">
                              {d.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Field of Study</Label>
                      <Select 
                        value={formData.education.field_of_study} 
                        onValueChange={(v) => updateField('education.field_of_study', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map(f => (
                            <SelectItem key={f} value={f} className="capitalize">
                              {f.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={formData.education.institution}
                        onChange={(e) => updateField('education.institution', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Graduation Year</Label>
                      <Input
                        type="number"
                        value={formData.education.graduation_year}
                        onChange={(e) => updateField('education.graduation_year', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>GPA</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.education.gpa}
                        onChange={(e) => updateField('education.gpa', e.target.value)}
                        className="mt-1"
                        placeholder="e.g. 3.5"
                      />
                    </div>
                  </div>
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