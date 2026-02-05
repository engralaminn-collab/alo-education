import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, Globe, GraduationCap, Briefcase, FileText,
  Calendar, CheckCircle, Plus, X, ArrowRight, ArrowLeft, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Education', icon: GraduationCap },
  { id: 4, title: 'Passport', icon: FileText },
  { id: 5, title: 'English Test', icon: Globe },
  { id: 6, title: 'Work Experience', icon: Briefcase },
  { id: 7, title: 'Preferences', icon: CheckCircle },
];

export default function CompleteProfile() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    alternative_email: '',
    phone: '',
    alternative_phone: '',
    nationality: '',
    date_of_birth: '',
    emergency_contact: { name: '', email: '', phone: '' },
    education_history: [],
    passport_details: { has_passport: false },
    english_proficiency: { has_test: false },
    work_experience: [],
    recommendation_letters: [],
    visa_history: [],
    preferred_countries: [],
    preferred_degree_level: '',
    preferred_fields: [],
    budget_max: '',
    target_intake: '',
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        ...formData,
        ...existingProfile,
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        first_name: user.full_name?.split(' ')[0] || '',
        last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [existingProfile, user]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const profileData = {
        ...formData,
        profile_completeness: calculateCompleteness(),
      };

      if (existingProfile) {
        return await base44.entities.StudentProfile.update(existingProfile.id, profileData);
      } else {
        return await base44.entities.StudentProfile.create(profileData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile saved successfully!');
      if (currentStep === 7) {
        navigate(createPageUrl('StudentPortal'));
      }
    },
    onError: () => {
      toast.error('Failed to save profile');
    },
  });

  const calculateCompleteness = () => {
    let completed = 0;
    const total = 7;

    if (formData.first_name && formData.last_name && formData.nationality && formData.date_of_birth) completed++;
    if (formData.email && formData.phone) completed++;
    if (formData.education_history?.length > 0) completed++;
    if (formData.passport_details?.has_passport) completed++;
    if (formData.english_proficiency?.has_test) completed++;
    if (formData.work_experience?.length > 0) completed++;
    if (formData.preferred_countries?.length > 0 && formData.preferred_degree_level) completed++;

    return Math.round((completed / total) * 100);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education_history: [...(prev.education_history || []), { level: '', institution: '', field_of_study: '', graduation_year: '', gpa: '', gpa_scale: '4' }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education_history: prev.education_history.filter((_, i) => i !== index)
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experience: [...(prev.work_experience || []), { company_name: '', designation: '', start_date: '', end_date: '', currently_working: false }]
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 7) {
      saveProfileMutation.mutate();
      setCurrentStep(currentStep + 1);
    } else {
      saveProfileMutation.mutate();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progress = calculateCompleteness();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
            <p className="text-slate-600">Help us understand your background and preferences</p>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-slate-500 mt-2">{progress}% Complete</p>
            </div>
          </div>

          {/* Steps Progress */}
          <div className="flex justify-between mb-8 overflow-x-auto">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 ${
                  currentStep >= step.id ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-gradient-brand text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Personal Information</h3>
                    <p className="text-sm text-slate-600 mb-6">Fill up the form according to your national document</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        placeholder="Given name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        placeholder="Family name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => updateField('date_of_birth', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Nationality *</Label>
                      <Select value={formData.nationality} onValueChange={(v) => updateField('nationality', v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bangladeshi">Bangladeshi</SelectItem>
                          <SelectItem value="indian">Indian</SelectItem>
                          <SelectItem value="pakistani">Pakistani</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                    <p className="text-sm text-slate-600 mb-6">Provide your contact details for academic communication</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        disabled
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Alternative Email</Label>
                      <Input
                        type="email"
                        value={formData.alternative_email}
                        onChange={(e) => updateField('alternative_email', e.target.value)}
                        placeholder="alternate@email.com"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Mobile Number with Country Code *</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+880 1234567890"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Alternative Number</Label>
                      <Input
                        value={formData.alternative_phone}
                        onChange={(e) => updateField('alternative_phone', e.target.value)}
                        placeholder="+880 1234567890"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Emergency Contact</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={formData.emergency_contact?.name}
                          onChange={(e) => updateNestedField('emergency_contact', 'name', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.emergency_contact?.email}
                          onChange={(e) => updateNestedField('emergency_contact', 'email', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={formData.emergency_contact?.phone}
                          onChange={(e) => updateNestedField('emergency_contact', 'phone', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Education History */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Education History</h3>
                      <p className="text-sm text-slate-600">List down all your education information here</p>
                    </div>
                    <Button onClick={addEducation} size="sm" className="bg-gradient-brand">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.education_history?.map((edu, index) => (
                    <Card key={index} className="p-4 relative">
                      <button
                        onClick={() => removeEducation(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Academic Level *</Label>
                          <Select
                            value={edu.level}
                            onValueChange={(v) => {
                              const updated = [...formData.education_history];
                              updated[index].level = v;
                              updateField('education_history', updated);
                            }}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SSC/Grade 10th">SSC/Grade 10th</SelectItem>
                              <SelectItem value="HSC/Grade 12th">HSC/Grade 12th</SelectItem>
                              <SelectItem value="Undergraduate 3 Years">Undergraduate 3 Years</SelectItem>
                              <SelectItem value="Undergraduate 4 Years">Undergraduate 4 Years</SelectItem>
                              <SelectItem value="Postgraduate/Masters">Postgraduate/Masters</SelectItem>
                              <SelectItem value="PhD">PhD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...formData.education_history];
                              updated[index].institution = e.target.value;
                              updateField('education_history', updated);
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Field of Study</Label>
                          <Input
                            value={edu.field_of_study}
                            onChange={(e) => {
                              const updated = [...formData.education_history];
                              updated[index].field_of_study = e.target.value;
                              updateField('education_history', updated);
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Graduation Year</Label>
                          <Input
                            type="number"
                            value={edu.graduation_year}
                            onChange={(e) => {
                              const updated = [...formData.education_history];
                              updated[index].graduation_year = e.target.value;
                              updateField('education_history', updated);
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>GPA</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={edu.gpa}
                            onChange={(e) => {
                              const updated = [...formData.education_history];
                              updated[index].gpa = e.target.value;
                              updateField('education_history', updated);
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>GPA Scale</Label>
                          <Select
                            value={edu.gpa_scale || '4'}
                            onValueChange={(v) => {
                              const updated = [...formData.education_history];
                              updated[index].gpa_scale = v;
                              updateField('education_history', updated);
                            }}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4">Out of 4.0</SelectItem>
                              <SelectItem value="5">Out of 5.0</SelectItem>
                              <SelectItem value="100">Percentage (%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 4: Passport Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Passport Details</h3>
                    <p className="text-sm text-slate-600 mb-6">Do you have a valid passport?</p>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="has_passport"
                      checked={formData.passport_details?.has_passport}
                      onChange={(e) => updateNestedField('passport_details', 'has_passport', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-education-blue focus:ring-education-blue"
                    />
                    <Label htmlFor="has_passport" className="cursor-pointer">Yes, I have a passport</Label>
                  </div>
                  {formData.passport_details?.has_passport && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Passport Number *</Label>
                        <Input
                          value={formData.passport_details?.passport_number}
                          onChange={(e) => updateNestedField('passport_details', 'passport_number', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Place of Issue *</Label>
                        <Input
                          value={formData.passport_details?.place_of_issue}
                          onChange={(e) => updateNestedField('passport_details', 'place_of_issue', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Issue Date *</Label>
                        <Input
                          type="date"
                          value={formData.passport_details?.issue_date}
                          onChange={(e) => updateNestedField('passport_details', 'issue_date', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Expiry Date *</Label>
                        <Input
                          type="date"
                          value={formData.passport_details?.expiry_date}
                          onChange={(e) => updateNestedField('passport_details', 'expiry_date', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: English Proficiency Test */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">English Proficiency Test</h3>
                    <p className="text-sm text-slate-600 mb-6">Provide English test scores taken recently</p>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="has_test"
                      checked={formData.english_proficiency?.has_test}
                      onChange={(e) => updateNestedField('english_proficiency', 'has_test', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-education-blue focus:ring-education-blue"
                    />
                    <Label htmlFor="has_test" className="cursor-pointer">Yes, I have taken an English test</Label>
                  </div>
                  {formData.english_proficiency?.has_test && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Test Type *</Label>
                          <Select
                            value={formData.english_proficiency?.test_type}
                            onValueChange={(v) => updateNestedField('english_proficiency', 'test_type', v)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IELTS">IELTS</SelectItem>
                              <SelectItem value="TOEFL">TOEFL</SelectItem>
                              <SelectItem value="PTE">PTE</SelectItem>
                              <SelectItem value="Duolingo">Duolingo</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Test Date</Label>
                          <Input
                            type="date"
                            value={formData.english_proficiency?.test_date}
                            onChange={(e) => updateNestedField('english_proficiency', 'test_date', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Overall Score</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={formData.english_proficiency?.overall_score}
                            onChange={(e) => updateNestedField('english_proficiency', 'overall_score', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {!formData.english_proficiency?.has_test && (
                    <div>
                      <Label>Planned Test Date</Label>
                      <Input
                        type="date"
                        value={formData.english_proficiency?.planned_test_date}
                        onChange={(e) => updateNestedField('english_proficiency', 'planned_test_date', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Work Experience */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Work Experience</h3>
                      <p className="text-sm text-slate-600">Do you have any work experience?</p>
                    </div>
                    <Button onClick={addWorkExperience} size="sm" className="bg-gradient-brand">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.work_experience?.map((work, index) => (
                    <Card key={index} className="p-4 relative">
                      <button
                        onClick={() => removeWorkExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Company Name *</Label>
                          <Input
                            value={work.company_name}
                            onChange={(e) => {
                              const updated = [...formData.work_experience];
                              updated[index].company_name = e.target.value;
                              updateField('work_experience', updated);
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Designation *</Label>
                          <Input
                            value={work.designation}
                            onChange={(e) => {
                              const updated = [...formData.work_experience];
                              updated[index].designation = e.target.value;
                              updateField('work_experience', updated);
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={work.start_date}
                            onChange={(e) => {
                              const updated = [...formData.work_experience];
                              updated[index].start_date = e.target.value;
                              updateField('work_experience', updated);
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={work.end_date}
                            onChange={(e) => {
                              const updated = [...formData.work_experience];
                              updated[index].end_date = e.target.value;
                              updateField('work_experience', updated);
                            }}
                            disabled={work.currently_working}
                            className="mt-2"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`currently_working_${index}`}
                            checked={work.currently_working}
                            onChange={(e) => {
                              const updated = [...formData.work_experience];
                              updated[index].currently_working = e.target.checked;
                              updateField('work_experience', updated);
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-education-blue focus:ring-education-blue"
                          />
                          <Label htmlFor={`currently_working_${index}`} className="cursor-pointer">
                            Currently working here
                          </Label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 7: Admission Preferences */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Admission Preferences</h3>
                    <p className="text-sm text-slate-600 mb-6">Check application requirements and deadline before adding preference</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Study Destination *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['UK', 'USA', 'Canada', 'Australia', 'Germany', 'Ireland'].map(country => (
                          <Badge
                            key={country}
                            variant={formData.preferred_countries?.includes(country) ? 'default' : 'outline'}
                            className={`cursor-pointer ${
                              formData.preferred_countries?.includes(country)
                                ? 'bg-education-blue hover:bg-education-blue/90'
                                : 'hover:bg-slate-100'
                            }`}
                            onClick={() => {
                              const current = formData.preferred_countries || [];
                              if (current.includes(country)) {
                                updateField('preferred_countries', current.filter(c => c !== country));
                              } else {
                                updateField('preferred_countries', [...current, country]);
                              }
                            }}
                          >
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Study Level *</Label>
                      <Select
                        value={formData.preferred_degree_level}
                        onValueChange={(v) => updateField('preferred_degree_level', v)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Foundation">Foundation</SelectItem>
                          <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Target Intake</Label>
                      <Select
                        value={formData.target_intake}
                        onValueChange={(v) => updateField('target_intake', v)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select intake" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January 2026">January 2026</SelectItem>
                          <SelectItem value="September 2026">September 2026</SelectItem>
                          <SelectItem value="January 2027">January 2027</SelectItem>
                          <SelectItem value="September 2027">September 2027</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Maximum Budget (USD/year)</Label>
                      <Input
                        type="number"
                        value={formData.budget_max}
                        onChange={(e) => updateField('budget_max', e.target.value)}
                        placeholder="e.g., 30000"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={saveProfileMutation.isPending}
                  className="bg-gradient-brand hover:opacity-90"
                >
                  {saveProfileMutation.isPending ? (
                    'Saving...'
                  ) : currentStep === 7 ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save & Complete
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}