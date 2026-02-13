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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  User, GraduationCap, Globe, Briefcase, FileText, Shield,
  Save, Plus, Trash2, Upload, CheckCircle, AlertCircle, Clock, X
} from 'lucide-react';
import Footer from '@/components/landing/Footer';

const countries = ['Afghanistan', 'Albania', 'Algeria', 'Egypt', 'India', 'Pakistan', 'Nigeria', 'Bangladesh', 'Indonesia', 'Other'];
const qualificationLevels = ['SSC/Grade 10th', 'HSC/Grade 12th', 'Undergraduate 3 Years', 'Undergraduate 4 Years', 'Postgraduate/Masters', 'PGD', 'PhD'];
const testTypes = ['IELTS', 'UKVI', 'PTE', 'Duolingo', 'TOEFL', 'Kaplan'];
const visaTypes = ['Business Visitor', 'Refugee Visa', 'Humanitarian (HP) Visa', 'Dependent (Spouse) Visa', 'Student Visa', 'Tourist Visa', 'Migration', 'Visa Extension', 'Short Term Student Visa', 'Tier 5 (Temp Worker)', 'Child Visitor Visa', 'Indefinite Leave to Remain (ILR)', 'Citizen', 'Settled', 'Pre Settled'];

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
    alternative_email: '',
    phone: '',
    alternative_phone: '',
    nationality: '',
    date_of_birth: '',
    gender: '',
    passport_details: {
      has_passport: false,
      passport_number: '',
      place_of_issue: '',
      issue_date: '',
      expiry_date: ''
    },
    current_address: '',
    permanent_address: '',
    emergency_contact: {
      name: '',
      email: '',
      phone: ''
    },
    visa_refusal_history: {
      has_refusal: false,
      details: ''
    },
    immigration_history: '',
    visa_history: [],
    education_history: [],
    english_proficiency: {
      has_test: false,
      test_type: '',
      test_date: '',
      planned_test_date: '',
      overall_score: '',
      listening_score: '',
      reading_score: '',
      writing_score: '',
      speaking_score: '',
      expiry_date: ''
    },
    work_experience: [],
    work_experience_years: 0,
    recommendation_letters: [],
    preferred_countries: [],
    preferred_degree_level: '',
    preferred_fields: [],
    academic_background_summary: '',
    career_goals: '',
    preferred_degree_level: '',
    visa_status: 'not_applicable',
    budget_max: '',
    target_intake: '',
  });

  useEffect(() => {
    if (studentProfile) {
      setFormData(prev => ({
        ...prev,
        ...studentProfile,
        passport_details: studentProfile.passport_details || prev.passport_details,
        emergency_contact: studentProfile.emergency_contact || prev.emergency_contact,
        current_address: studentProfile.current_address || '',
        permanent_address: studentProfile.permanent_address || '',
        visa_refusal_history: studentProfile.visa_refusal_history || prev.visa_refusal_history,
        immigration_history: studentProfile.immigration_history || '',
        visa_history: studentProfile.visa_history || [],
        education_history: studentProfile.education_history || [],
        english_proficiency: studentProfile.english_proficiency || prev.english_proficiency,
        work_experience: studentProfile.work_experience || [],
        recommendation_letters: studentProfile.recommendation_letters || [],
        preferred_countries: studentProfile.preferred_countries || [],
        preferred_fields: studentProfile.preferred_fields || [],
        academic_background_summary: studentProfile.academic_background_summary || '',
        career_goals: studentProfile.career_goals || '',
        preferred_degree_level: studentProfile.preferred_degree_level || '',
        visa_status: studentProfile.visa_status || 'not_applicable'
      }));
    }
  }, [studentProfile]);

  const { data: documents = [] } = useQuery({
    queryKey: ['my-documents', user?.email],
    queryFn: async () => {
      const studentProf = await base44.entities.StudentProfile.filter({ email: user?.email });
      if (studentProf[0]?.id) {
        return base44.entities.Document.filter({ student_id: studentProf[0].id });
      }
      return [];
    },
    enabled: !!user?.email,
  });

  const saveProfile = useMutation({
    mutationFn: async (data) => {
      // Calculate completeness
      const checks = [
        data.first_name, data.last_name, data.phone, data.email, data.nationality,
        data.date_of_birth, data.passport_details?.has_passport,
        data.education_history?.length > 0, data.english_proficiency?.has_test,
        data.preferred_countries?.length > 0, data.preferred_degree_level,
        data.academic_background_summary, data.career_goals, data.visa_status
      ];
      const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

      if (studentProfile?.id) {
        return base44.entities.StudentProfile.update(studentProfile.id, {
          ...data,
          profile_completeness: completeness,
        });
      } else {
        return base44.entities.StudentProfile.create({
          ...data,
          email: user.email,
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

  const uploadDocument = useMutation({
    mutationFn: async ({ file, documentType }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Document.create({
        student_id: studentProfile?.id,
        document_type: documentType,
        name: file.name,
        file_url,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      toast.success('Document uploaded successfully!');
    },
    onError: () => {
      toast.error('Failed to upload document');
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

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education_history: [
        ...prev.education_history,
        {
          level: '',
          institution: '',
          city_country: '',
          board_university: '',
          field_of_study: '',
          gpa: '',
          gpa_scale: 4,
          graduation_year: '',
          study_duration: ''
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education_history: prev.education_history.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education_history: prev.education_history.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        {
          company_name: '',
          designation: '',
          start_date: '',
          end_date: '',
          currently_working: false,
          responsibilities: ''
        }
      ]
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }));
  };

  const updateWorkExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      )
    }));
  };

  const addVisaHistory = () => {
    setFormData(prev => ({
      ...prev,
      visa_history: [
        ...prev.visa_history,
        {
          country: '',
          visa_type: '',
          issue_date: '',
          expiry_date: '',
          visa_status: 'approved'
        }
      ]
    }));
  };

  const removeVisaHistory = (index) => {
    setFormData(prev => ({
      ...prev,
      visa_history: prev.visa_history.filter((_, i) => i !== index)
    }));
  };

  const updateVisaHistory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      visa_history: prev.visa_history.map((visa, i) => 
        i === index ? { ...visa, [field]: value } : visa
      )
    }));
  };

  const handleFileUpload = async (e, documentType) => {
    const file = e.target.files?.[0];
    if (file && studentProfile?.id) {
      uploadDocument.mutate({ file, documentType });
    } else if (!studentProfile?.id) {
      toast.error('Please save your profile first');
    }
  };

  const getDocumentStatus = (docType) => {
    const doc = documents.find(d => d.document_type === docType);
    return doc?.status || null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
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
            <TabsTrigger value="education" className="rounded-lg">
              <GraduationCap className="w-4 h-4 mr-2" />
              Education
            </TabsTrigger>
            <TabsTrigger value="work" className="rounded-lg">
              <Briefcase className="w-4 h-4 mr-2" />
              Work
            </TabsTrigger>
            <TabsTrigger value="language" className="rounded-lg">
              <Globe className="w-4 h-4 mr-2" />
              Language
            </TabsTrigger>
            <TabsTrigger value="visa" className="rounded-lg">
              <Shield className="w-4 h-4 mr-2" />
              Visa History
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>First Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Email <span className="text-red-500">*</span></Label>
                      <Input
                        type="email"
                        value={formData.email || user?.email}
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
                      <Label>Phone <span className="text-red-500">*</span></Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="mt-1"
                        placeholder="+880 1234567890"
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
                      <Label>Date of Birth <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => updateField('date_of_birth', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(v) => updateField('gender', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nationality <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.nationality} 
                        onValueChange={(v) => updateField('nationality', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select" />
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
                  <CardTitle>Passport Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={formData.passport_details.has_passport}
                      onCheckedChange={(checked) => updateField('passport_details.has_passport', checked)}
                    />
                    <Label>I have a valid passport</Label>
                  </div>

                  {formData.passport_details.has_passport && (
                    <div className="space-y-6 border-l-2 border-education-blue pl-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Passport Number</Label>
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
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Issue Date</Label>
                          <Input
                            type="date"
                            value={formData.passport_details.issue_date}
                            onChange={(e) => updateField('passport_details.issue_date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Expiry Date</Label>
                          <Input
                            type="date"
                            value={formData.passport_details.expiry_date}
                            onChange={(e) => updateField('passport_details.expiry_date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          Upload Passport
                          {getStatusIcon(getDocumentStatus('passport'))}
                        </Label>
                        <Input
                          type="file"
                          onChange={(e) => handleFileUpload(e, 'passport')}
                          className="mt-1"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Current Address <span className="text-red-500">*</span></Label>
                    <Textarea
                      value={formData.current_address}
                      onChange={(e) => updateField('current_address', e.target.value)}
                      className="mt-1"
                      rows={2}
                      placeholder="Enter your current residential address"
                    />
                  </div>
                  <div>
                    <Label>Permanent Address</Label>
                    <Textarea
                      value={formData.permanent_address}
                      onChange={(e) => updateField('permanent_address', e.target.value)}
                      className="mt-1"
                      rows={2}
                      placeholder="Enter your permanent address"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Visa & Immigration History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={formData.visa_refusal_history.has_refusal}
                        onCheckedChange={(checked) => updateField('visa_refusal_history.has_refusal', checked)}
                      />
                      <Label>I have had a visa refusal before</Label>
                    </div>

                    {formData.visa_refusal_history.has_refusal && (
                      <div className="border-l-2 border-red-500 pl-6">
                        <Label>Refusal Details <span className="text-red-500">*</span></Label>
                        <Textarea
                          value={formData.visa_refusal_history.details}
                          onChange={(e) => updateField('visa_refusal_history.details', e.target.value)}
                          className="mt-1"
                          rows={3}
                          placeholder="Please provide details about the visa refusal (country, date, reason)"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Immigration History (Optional)</Label>
                    <Textarea
                      value={formData.immigration_history}
                      onChange={(e) => updateField('immigration_history', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Any other immigration history you'd like to share"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={formData.emergency_contact.name}
                        onChange={(e) => updateField('emergency_contact.name', e.target.value)}
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
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.emergency_contact.phone}
                        onChange={(e) => updateField('emergency_contact.phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="education">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Educational Background</CardTitle>
                  <CardDescription>Add your academic qualifications</CardDescription>
                </div>
                <Button onClick={addEducation} size="sm" className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.education_history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No education history added yet</p>
                  </div>
                ) : (
                  formData.education_history.map((edu, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-6 space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div>
                        <Label>Qualification Level <span className="text-red-500">*</span></Label>
                        <Select 
                          value={edu.level} 
                          onValueChange={(v) => updateEducation(index, 'level', v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {qualificationLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {edu.level && (
                        <div className="space-y-4 border-l-2 border-education-blue pl-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Institution Name <span className="text-red-500">*</span></Label>
                              <Input
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>City / Country</Label>
                              <Input
                                value={edu.city_country}
                                onChange={(e) => updateEducation(index, 'city_country', e.target.value)}
                                className="mt-1"
                                placeholder="e.g., Dhaka, Bangladesh"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Board / University</Label>
                              <Input
                                value={edu.board_university}
                                onChange={(e) => updateEducation(index, 'board_university', e.target.value)}
                                className="mt-1"
                                placeholder="e.g., Dhaka Board, University of Dhaka"
                              />
                            </div>
                            <div>
                              <Label>Subject / Major</Label>
                              <Input
                                value={edu.field_of_study}
                                onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <Label>Result (GPA / %)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={edu.gpa}
                                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Scale</Label>
                              <Input
                                type="number"
                                value={edu.gpa_scale}
                                onChange={(e) => updateEducation(index, 'gpa_scale', e.target.value)}
                                className="mt-1"
                                placeholder="4 or 5 or 100"
                              />
                            </div>
                            <div>
                              <Label>Passing Year</Label>
                              <Input
                                type="number"
                                value={edu.graduation_year}
                                onChange={(e) => updateEducation(index, 'graduation_year', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Study Duration</Label>
                              <Input
                                value={edu.study_duration}
                                onChange={(e) => updateEducation(index, 'study_duration', e.target.value)}
                                className="mt-1"
                                placeholder="e.g., 4 years"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="flex items-center gap-2">
                              Upload Certificate
                              {getStatusIcon(getDocumentStatus(`transcript_${index}`))}
                            </Label>
                            <Input
                              type="file"
                              onChange={(e) => handleFileUpload(e, 'transcript')}
                              className="mt-1"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Add your professional experience (optional)</CardDescription>
                </div>
                <Button onClick={addWorkExperience} size="sm" className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.work_experience.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No work experience added yet</p>
                  </div>
                ) : (
                  formData.work_experience.map((work, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-6 space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Company Name</Label>
                          <Input
                            value={work.company_name}
                            onChange={(e) => updateWorkExperience(index, 'company_name', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Job Title</Label>
                          <Input
                            value={work.designation}
                            onChange={(e) => updateWorkExperience(index, 'designation', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={work.start_date}
                            onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={work.end_date}
                            onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)}
                            className="mt-1"
                            disabled={work.currently_working}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={work.currently_working}
                          onCheckedChange={(checked) => updateWorkExperience(index, 'currently_working', checked)}
                        />
                        <Label>Currently working here</Label>
                      </div>

                      <div>
                        <Label>Responsibilities</Label>
                        <Textarea
                          value={work.responsibilities}
                          onChange={(e) => updateWorkExperience(index, 'responsibilities', e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>English Proficiency</CardTitle>
                <CardDescription>Add your English language test details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={formData.english_proficiency.has_test}
                    onCheckedChange={(checked) => updateField('english_proficiency.has_test', checked)}
                  />
                  <Label>I have completed an English proficiency test</Label>
                </div>

                {formData.english_proficiency.has_test ? (
                  <div className="space-y-6 border-l-2 border-education-blue pl-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label>Test Type <span className="text-red-500">*</span></Label>
                        <Select 
                          value={formData.english_proficiency.test_type} 
                          onValueChange={(v) => updateField('english_proficiency.test_type', v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select test" />
                          </SelectTrigger>
                          <SelectContent>
                            {testTypes.map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <div>
                        <Label>Overall Score <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.english_proficiency.overall_score}
                          onChange={(e) => updateField('english_proficiency.overall_score', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={formData.english_proficiency.expiry_date}
                          onChange={(e) => updateField('english_proficiency.expiry_date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label>Listening</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.english_proficiency.listening_score}
                          onChange={(e) => updateField('english_proficiency.listening_score', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Reading</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.english_proficiency.reading_score}
                          onChange={(e) => updateField('english_proficiency.reading_score', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Writing</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.english_proficiency.writing_score}
                          onChange={(e) => updateField('english_proficiency.writing_score', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Speaking</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.english_proficiency.speaking_score}
                          onChange={(e) => updateField('english_proficiency.speaking_score', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        Upload Test Certificate
                        {getStatusIcon(getDocumentStatus('english_test'))}
                      </Label>
                      <Input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'english_test')}
                        className="mt-1"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Planned Test Date</Label>
                      <Input
                        type="date"
                        value={formData.english_proficiency.planned_test_date}
                        onChange={(e) => updateField('english_proficiency.planned_test_date', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visa">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Visa & Immigration History</CardTitle>
                  <CardDescription>Add any previous visa applications</CardDescription>
                </div>
                <Button onClick={addVisaHistory} size="sm" className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Visa Record
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.visa_history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No visa history added yet</p>
                  </div>
                ) : (
                  formData.visa_history.map((visa, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-6 space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVisaHistory(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Country</Label>
                          <Input
                            value={visa.country}
                            onChange={(e) => updateVisaHistory(index, 'country', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Visa Type</Label>
                          <Select 
                            value={visa.visa_type} 
                            onValueChange={(v) => updateVisaHistory(index, 'visa_type', v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {visaTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Issue Date</Label>
                          <Input
                            type="date"
                            value={visa.issue_date}
                            onChange={(e) => updateVisaHistory(index, 'issue_date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Expiry Date</Label>
                          <Input
                            type="date"
                            value={visa.expiry_date}
                            onChange={(e) => updateVisaHistory(index, 'expiry_date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select 
                            value={visa.visa_status} 
                            onValueChange={(v) => updateVisaHistory(index, 'visa_status', v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>Upload your supporting documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!studentProfile?.id && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">Please save your profile first before uploading documents</p>
                  </div>
                )}

                {[
                  { type: 'passport', label: 'Passport Copy' },
                  { type: 'transcript', label: 'Academic Transcripts' },
                  { type: 'degree_certificate', label: 'Degree Certificates' },
                  { type: 'english_test', label: 'English Test Certificate' },
                  { type: 'cv', label: 'CV / Resume' },
                  { type: 'sop', label: 'Statement of Purpose' },
                  { type: 'lor', label: 'Letters of Recommendation' },
                  { type: 'photo', label: 'Passport Size Photo' },
                  { type: 'financial_proof', label: 'Financial Documents' }
                ].map(({ type, label }) => {
                  const status = getDocumentStatus(type);
                  const doc = documents.find(d => d.document_type === type);
                  
                  return (
                    <div key={type} className="border rounded-lg p-4 hover:border-education-blue transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="text-gray-400" size={20} />
                          <div className="flex-1">
                            <Label className="font-medium">{label}</Label>
                            {status && (
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusIcon(status)}
                                <span className={`text-xs ${
                                  status === 'approved' ? 'text-green-600' :
                                  status === 'rejected' ? 'text-red-600' :
                                  'text-yellow-600'
                                }`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                                {doc?.reviewer_notes && (
                                  <span className="text-xs text-gray-500">- {doc.reviewer_notes}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc?.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">View</Button>
                            </a>
                          )}
                          <Input
                            type="file"
                            id={`file-${type}`}
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, type)}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-${type}`).click()}
                            disabled={!studentProfile?.id || uploadDocument.isPending}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {doc ? 'Replace' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
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
                            ? 'bg-education-blue hover:bg-education-blue/90' 
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
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="e.g. September 2026"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="career">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Academic Background</CardTitle>
                  <CardDescription>Summarize your academic achievements and strengths</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Academic Background Summary</Label>
                    <Textarea
                      value={formData.academic_background_summary}
                      onChange={(e) => updateField('academic_background_summary', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Describe your academic achievements, strengths, and key accomplishments..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Career Goals</CardTitle>
                  <CardDescription>Share your career aspirations and long-term goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Career Aspirations</Label>
                    <Textarea
                      value={formData.career_goals}
                      onChange={(e) => updateField('career_goals', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="What are your career goals? What industry or role interests you? How will studying abroad help you achieve these goals?"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Current Visa Status</CardTitle>
                  <CardDescription>Select your current visa status or situation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Visa Status <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.visa_status} 
                      onValueChange={(v) => updateField('visa_status', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select visa status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                        <SelectItem value="not_required">Not Required</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="in_process">In Process</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}