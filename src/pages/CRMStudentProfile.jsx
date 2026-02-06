import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Plus, Trash2, User, GraduationCap, Briefcase, Shield, FileText, Target, DollarSign } from 'lucide-react';
import StudentUniversityMatcher from '@/components/crm/StudentUniversityMatcher';

const countries = ['Bangladesh', 'India', 'Pakistan', 'Nepal', 'Sri Lanka', 'Nigeria', 'Ghana', 'Kenya', 'Other'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CRMStudentProfile() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('id');
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: () => base44.entities.StudentProfile.filter({ id: studentId }),
    enabled: !!studentId,
    select: (data) => data[0]
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
    city_of_birth: '',
    country_of_birth: '',
    current_address: '',
    permanent_address: '',
    office_address: '',
    emergency_contact: { name: '', email: '', phone: '' },
    passport_details: {
      has_passport: false,
      passport_number: '',
      place_of_issue: '',
      issue_date: '',
      expiry_date: '',
      passport_nationality: ''
    },
    education_history: [],
    english_proficiency: {
      has_test: false,
      test_status: 'planning',
      test_type: '',
      test_date: '',
      expiry_date: '',
      trt_certificate_id: '',
      overall_score: '',
      listening_score: '',
      reading_score: '',
      writing_score: '',
      speaking_score: ''
    },
    work_experience: [],
    recommendation_letters: [],
    visa_history: [],
    has_applied_immigration: false,
    immigration_countries: '',
    has_medical_condition: false,
    medical_condition_details: '',
    has_criminal_offence: false,
    criminal_offence_details: '',
    admission_preferences: [],
    funding_status: '',
    sponsor: '',
    source_of_fund: '',
    counselor_id: '',
    status: 'new_lead'
  });

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        emergency_contact: student.emergency_contact || { name: '', email: '', phone: '' },
        passport_details: student.passport_details || formData.passport_details,
        education_history: student.education_history || [],
        english_proficiency: student.english_proficiency || formData.english_proficiency,
        work_experience: student.work_experience || [],
        recommendation_letters: student.recommendation_letters || [],
        visa_history: student.visa_history || [],
        admission_preferences: student.admission_preferences || []
      });
    }
  }, [student]);

  const saveProfile = useMutation({
    mutationFn: async (data) => {
      if (studentId) {
        return base44.entities.StudentProfile.update(studentId, data);
      }
      return base44.entities.StudentProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save profile');
    }
  });

  const updateField = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education_history: [...prev.education_history, {
        level: '',
        institute_type: '',
        institution: '',
        group_department_subject: '',
        board_name: '',
        result: '',
        medium_of_instruction: '',
        course_start_year: '',
        course_start_month: '',
        course_end_year: '',
        course_end_month: '',
        study_gap: false,
        gap_from: '',
        gap_to: ''
      }]
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
      work_experience: [...prev.work_experience, {
        company_name: '',
        designation: '',
        department: '',
        job_role: '',
        start_date: '',
        end_date: '',
        currently_working: false
      }]
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

  const addRecommendation = () => {
    setFormData(prev => ({
      ...prev,
      recommendation_letters: [...prev.recommendation_letters, {
        referee_name: '',
        institution: '',
        email: '',
        phone: '',
        notes: ''
      }]
    }));
  };

  const removeRecommendation = (index) => {
    setFormData(prev => ({
      ...prev,
      recommendation_letters: prev.recommendation_letters.filter((_, i) => i !== index)
    }));
  };

  const updateRecommendation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      recommendation_letters: prev.recommendation_letters.map((lor, i) => 
        i === index ? { ...lor, [field]: value } : lor
      )
    }));
  };

  const addVisaHistory = () => {
    setFormData(prev => ({
      ...prev,
      visa_history: [...prev.visa_history, {
        applied_country: '',
        visa_type: '',
        applicant_status: 'Main Applicant',
        has_refusal: false,
        rejection_date: '',
        rejection_reason: ''
      }]
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

  const addAdmissionPreference = () => {
    setFormData(prev => ({
      ...prev,
      admission_preferences: [...prev.admission_preferences, {
        study_destination: '',
        study_level: '',
        program_title: '',
        institute_name: '',
        intake: '',
        enrollment_priority: 1,
        application_pathway: 'Provider'
      }]
    }));
  };

  const removeAdmissionPreference = (index) => {
    setFormData(prev => ({
      ...prev,
      admission_preferences: prev.admission_preferences.filter((_, i) => i !== index)
    }));
  };

  const updateAdmissionPreference = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      admission_preferences: prev.admission_preferences.map((pref, i) => 
        i === index ? { ...pref, [field]: value } : pref
      )
    }));
  };

  if (isLoading) {
    return (
      <CRMLayout currentPage="Students">
        <div className="p-6">Loading...</div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout currentPage="Students">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {studentId ? 'Edit Student Profile' : 'New Student Profile'}
          </h1>
          <Button 
            onClick={() => saveProfile.mutate(formData)}
            disabled={saveProfile.isPending}
            className="bg-education-blue"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid grid-cols-9 w-full">
            <TabsTrigger value="personal"><User className="w-4 h-4 mr-2" />Personal</TabsTrigger>
            <TabsTrigger value="passport"><Shield className="w-4 h-4 mr-2" />Passport</TabsTrigger>
            <TabsTrigger value="education"><GraduationCap className="w-4 h-4 mr-2" />Education</TabsTrigger>
            <TabsTrigger value="english"><FileText className="w-4 h-4 mr-2" />English</TabsTrigger>
            <TabsTrigger value="work"><Briefcase className="w-4 h-4 mr-2" />Work</TabsTrigger>
            <TabsTrigger value="lor"><FileText className="w-4 h-4 mr-2" />LOR</TabsTrigger>
            <TabsTrigger value="visa"><Shield className="w-4 h-4 mr-2" />Visa</TabsTrigger>
            <TabsTrigger value="preferences"><Target className="w-4 h-4 mr-2" />Preferences</TabsTrigger>
            <TabsTrigger value="matcher">🎯 AI Matcher</TabsTrigger>
          </TabsList>

          {/* Personal & Contact */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal & Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={formData.first_name} onChange={(e) => updateField('first_name', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input value={formData.last_name} onChange={(e) => updateField('last_name', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input type="date" value={formData.date_of_birth} onChange={(e) => updateField('date_of_birth', e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City of Birth</Label>
                    <Input value={formData.city_of_birth} onChange={(e) => updateField('city_of_birth', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Country of Birth</Label>
                    <Select value={formData.country_of_birth} onValueChange={(v) => updateField('country_of_birth', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Alternative Email</Label>
                    <Input type="email" value={formData.alternative_email} onChange={(e) => updateField('alternative_email', e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone *</Label>
                    <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Alternative Phone</Label>
                    <Input value={formData.alternative_phone} onChange={(e) => updateField('alternative_phone', e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Current Address *</Label>
                    <Textarea value={formData.current_address} onChange={(e) => updateField('current_address', e.target.value)} className="mt-1" rows={2} />
                  </div>
                  <div>
                    <Label>Permanent Address</Label>
                    <Textarea value={formData.permanent_address} onChange={(e) => updateField('permanent_address', e.target.value)} className="mt-1" rows={2} />
                  </div>
                  <div>
                    <Label>Office Address</Label>
                    <Textarea value={formData.office_address} onChange={(e) => updateField('office_address', e.target.value)} className="mt-1" rows={2} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={formData.emergency_contact.name} onChange={(e) => updateField('emergency_contact.name', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={formData.emergency_contact.email} onChange={(e) => updateField('emergency_contact.email', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={formData.emergency_contact.phone} onChange={(e) => updateField('emergency_contact.phone', e.target.value)} className="mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Passport */}
          <TabsContent value="passport">
            <Card>
              <CardHeader>
                <CardTitle>Passport Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={formData.passport_details.has_passport}
                    onCheckedChange={(checked) => updateField('passport_details.has_passport', checked)}
                  />
                  <Label>Do you have any Passport?</Label>
                </div>

                {formData.passport_details.has_passport && (
                  <div className="space-y-4 border-l-4 border-education-blue pl-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Passport Number *</Label>
                        <Input value={formData.passport_details.passport_number} onChange={(e) => updateField('passport_details.passport_number', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Place of Issue *</Label>
                        <Input value={formData.passport_details.place_of_issue} onChange={(e) => updateField('passport_details.place_of_issue', e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Issue Date *</Label>
                        <Input type="date" value={formData.passport_details.issue_date} onChange={(e) => updateField('passport_details.issue_date', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Expiry Date *</Label>
                        <Input type="date" value={formData.passport_details.expiry_date} onChange={(e) => updateField('passport_details.expiry_date', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Nationality (Passport) *</Label>
                        <Select value={formData.passport_details.passport_nationality} onValueChange={(v) => updateField('passport_details.passport_nationality', v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education History */}
          <TabsContent value="education">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education History</CardTitle>
                <Button onClick={addEducation} size="sm" className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.education_history.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No education history added</p>
                ) : (
                  formData.education_history.map((edu, index) => (
                    <div key={index} className="border-2 rounded-lg p-6 space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(index)}
                        className="absolute top-2 right-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Qualification Level *</Label>
                          <Select value={edu.level} onValueChange={(v) => updateEducation(index, 'level', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SSC/Grade 10th">SSC/Grade 10th</SelectItem>
                              <SelectItem value="HSC/Grade 12th">HSC/Grade 12th</SelectItem>
                              <SelectItem value="Undergraduate 3 Years">Undergraduate 3 Years</SelectItem>
                              <SelectItem value="Undergraduate 4 Years">Undergraduate 4 Years</SelectItem>
                              <SelectItem value="Postgraduate/Masters">Postgraduate/Masters</SelectItem>
                              <SelectItem value="PGD">PGD</SelectItem>
                              <SelectItem value="PhD">PhD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Institute Type</Label>
                          <Input value={edu.institute_type} onChange={(e) => updateEducation(index, 'institute_type', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Institute Name *</Label>
                          <Input value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Group/Department/Subject</Label>
                          <Input value={edu.group_department_subject} onChange={(e) => updateEducation(index, 'group_department_subject', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Board Name</Label>
                          <Input value={edu.board_name} onChange={(e) => updateEducation(index, 'board_name', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Result *</Label>
                          <Input value={edu.result} onChange={(e) => updateEducation(index, 'result', e.target.value)} className="mt-1" placeholder="GPA / Percentage" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label>Medium of Instruction</Label>
                          <Input value={edu.medium_of_instruction} onChange={(e) => updateEducation(index, 'medium_of_instruction', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Start Year *</Label>
                          <Input type="number" value={edu.course_start_year} onChange={(e) => updateEducation(index, 'course_start_year', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Start Month</Label>
                          <Select value={edu.course_start_month} onValueChange={(v) => updateEducation(index, 'course_start_month', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>End Year *</Label>
                          <Input type="number" value={edu.course_end_year} onChange={(e) => updateEducation(index, 'course_end_year', e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={edu.study_gap}
                          onCheckedChange={(checked) => updateEducation(index, 'study_gap', checked)}
                        />
                        <Label>Study Gap?</Label>
                      </div>

                      {edu.study_gap && (
                        <div className="grid md:grid-cols-2 gap-4 pl-6">
                          <div>
                            <Label>Gap From</Label>
                            <Input type="date" value={edu.gap_from} onChange={(e) => updateEducation(index, 'gap_from', e.target.value)} className="mt-1" />
                          </div>
                          <div>
                            <Label>Gap To</Label>
                            <Input type="date" value={edu.gap_to} onChange={(e) => updateEducation(index, 'gap_to', e.target.value)} className="mt-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* English Proficiency */}
          <TabsContent value="english">
            <Card>
              <CardHeader>
                <CardTitle>English Proficiency / Test Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Do you have any English Proficiency Test?</Label>
                  <Select value={formData.english_proficiency.test_status} onValueChange={(v) => updateField('english_proficiency.test_status', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="yet_to_receive">Yet to Receive</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.english_proficiency.test_status === 'yes' && (
                  <div className="space-y-4 border-l-4 border-education-blue pl-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Test Type *</Label>
                        <Select value={formData.english_proficiency.test_type} onValueChange={(v) => updateField('english_proficiency.test_type', v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IELTS">IELTS</SelectItem>
                            <SelectItem value="IELTS-UKVI">IELTS-UKVI</SelectItem>
                            <SelectItem value="OIETC">OIETC</SelectItem>
                            <SelectItem value="PTE">PTE</SelectItem>
                            <SelectItem value="TOEFL">TOEFL</SelectItem>
                            <SelectItem value="GRE">GRE</SelectItem>
                            <SelectItem value="GMAT">GMAT</SelectItem>
                            <SelectItem value="DET">DET</SelectItem>
                            <SelectItem value="SAT">SAT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Test Date *</Label>
                        <Input type="date" value={formData.english_proficiency.test_date} onChange={(e) => updateField('english_proficiency.test_date', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input type="date" value={formData.english_proficiency.expiry_date} onChange={(e) => updateField('english_proficiency.expiry_date', e.target.value)} className="mt-1" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>TRT No / Certificate ID</Label>
                        <Input value={formData.english_proficiency.trt_certificate_id} onChange={(e) => updateField('english_proficiency.trt_certificate_id', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Overall Score *</Label>
                        <Input type="number" step="0.5" value={formData.english_proficiency.overall_score} onChange={(e) => updateField('english_proficiency.overall_score', e.target.value)} className="mt-1" />
                      </div>
                    </div>

                    {(['IELTS', 'IELTS-UKVI', 'PTE'].includes(formData.english_proficiency.test_type)) && (
                      <div>
                        <h4 className="font-semibold mb-3">Component Scores</h4>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label>Listening</Label>
                            <Input type="number" step="0.5" value={formData.english_proficiency.listening_score} onChange={(e) => updateField('english_proficiency.listening_score', e.target.value)} className="mt-1" />
                          </div>
                          <div>
                            <Label>Reading</Label>
                            <Input type="number" step="0.5" value={formData.english_proficiency.reading_score} onChange={(e) => updateField('english_proficiency.reading_score', e.target.value)} className="mt-1" />
                          </div>
                          <div>
                            <Label>Writing</Label>
                            <Input type="number" step="0.5" value={formData.english_proficiency.writing_score} onChange={(e) => updateField('english_proficiency.writing_score', e.target.value)} className="mt-1" />
                          </div>
                          <div>
                            <Label>Speaking</Label>
                            <Input type="number" step="0.5" value={formData.english_proficiency.speaking_score} onChange={(e) => updateField('english_proficiency.speaking_score', e.target.value)} className="mt-1" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Experience - Similar pattern */}
          <TabsContent value="work">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Button onClick={addWorkExperience} size="sm" className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.work_experience.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No work experience added</p>
                ) : (
                  formData.work_experience.map((work, index) => (
                    <div key={index} className="border-2 rounded-lg p-6 space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkExperience(index)}
                        className="absolute top-2 right-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Company Name *</Label>
                          <Input value={work.company_name} onChange={(e) => updateWorkExperience(index, 'company_name', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Designation *</Label>
                          <Input value={work.designation} onChange={(e) => updateWorkExperience(index, 'designation', e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Department</Label>
                          <Input value={work.department} onChange={(e) => updateWorkExperience(index, 'department', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Job Role</Label>
                          <Input value={work.job_role} onChange={(e) => updateWorkExperience(index, 'job_role', e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date *</Label>
                          <Input type="date" value={work.start_date} onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input type="date" value={work.end_date} onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)} className="mt-1" disabled={work.currently_working} />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={work.currently_working}
                          onCheckedChange={(checked) => updateWorkExperience(index, 'currently_working', checked)}
                        />
                        <Label>Currently Working</Label>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOR */}
          <TabsContent value="lor">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recommendation Letters (LOR)</CardTitle>
                <Button onClick={addRecommendation} size="sm" className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reference
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.recommendation_letters.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No references added</p>
                ) : (
                  formData.recommendation_letters.map((lor, index) => (
                    <div key={index} className="border-2 rounded-lg p-6 space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecommendation(index)}
                        className="absolute top-2 right-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Referee Name *</Label>
                          <Input value={lor.referee_name} onChange={(e) => updateRecommendation(index, 'referee_name', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Institution</Label>
                          <Input value={lor.institution} onChange={(e) => updateRecommendation(index, 'institution', e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input type="email" value={lor.email} onChange={(e) => updateRecommendation(index, 'email', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={lor.phone} onChange={(e) => updateRecommendation(index, 'phone', e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div>
                        <Label>Notes / Summary</Label>
                        <Textarea value={lor.notes} onChange={(e) => updateRecommendation(index, 'notes', e.target.value)} className="mt-1" rows={2} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visa History */}
          <TabsContent value="visa">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Background & Visa History</CardTitle>
                <Button onClick={addVisaHistory} size="sm" className="bg-education-blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Visa
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.visa_history.map((visa, index) => (
                  <div key={index} className="border-2 rounded-lg p-6 space-y-4 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVisaHistory(index)}
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Applied Country *</Label>
                        <Input value={visa.applied_country} onChange={(e) => updateVisaHistory(index, 'applied_country', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Visa Type *</Label>
                        <Select value={visa.visa_type} onValueChange={(v) => updateVisaHistory(index, 'visa_type', v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Student Visa">Student Visa</SelectItem>
                            <SelectItem value="Tourist Visa">Tourist Visa</SelectItem>
                            <SelectItem value="Dependent Visa">Dependent Visa</SelectItem>
                            <SelectItem value="Short Term Student Visa">Short Term Student Visa</SelectItem>
                            <SelectItem value="Business Visitor">Business Visitor</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Applicant Status</Label>
                        <Select value={visa.applicant_status} onValueChange={(v) => updateVisaHistory(index, 'applicant_status', v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Main Applicant">Main Applicant</SelectItem>
                            <SelectItem value="Dependent">Dependent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={visa.has_refusal}
                        onCheckedChange={(checked) => updateVisaHistory(index, 'has_refusal', checked)}
                      />
                      <Label>Visa Refusal?</Label>
                    </div>

                    {visa.has_refusal && (
                      <div className="grid md:grid-cols-2 gap-4 pl-6">
                        <div>
                          <Label>Rejection Date</Label>
                          <Input type="date" value={visa.rejection_date} onChange={(e) => updateVisaHistory(index, 'rejection_date', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Rejection Reason</Label>
                          <Textarea value={visa.rejection_reason} onChange={(e) => updateVisaHistory(index, 'rejection_reason', e.target.value)} className="mt-1" rows={2} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={formData.has_applied_immigration}
                      onCheckedChange={(checked) => updateField('has_applied_immigration', checked)}
                    />
                    <Label>Have you applied for any program/immigration to any country?</Label>
                  </div>

                  {formData.has_applied_immigration && (
                    <div>
                      <Label>Countries</Label>
                      <Input value={formData.immigration_countries} onChange={(e) => updateField('immigration_countries', e.target.value)} className="mt-1" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={formData.has_medical_condition}
                      onCheckedChange={(checked) => updateField('has_medical_condition', checked)}
                    />
                    <Label>Serious Medical Condition?</Label>
                  </div>

                  {formData.has_medical_condition && (
                    <Textarea value={formData.medical_condition_details} onChange={(e) => updateField('medical_condition_details', e.target.value)} className="mt-1" rows={2} placeholder="Details" />
                  )}

                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={formData.has_criminal_offence}
                      onCheckedChange={(checked) => updateField('has_criminal_offence', checked)}
                    />
                    <Label>Criminal Offence?</Label>
                  </div>

                  {formData.has_criminal_offence && (
                    <Textarea value={formData.criminal_offence_details} onChange={(e) => updateField('criminal_offence_details', e.target.value)} className="mt-1" rows={2} placeholder="Details" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Matcher */}
          <TabsContent value="matcher">
            <StudentUniversityMatcher 
              studentId={studentId} 
              studentName={`${formData.first_name} ${formData.last_name}`}
            />
          </TabsContent>

          {/* Preferences & Funding */}
          <TabsContent value="preferences">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Admission Preferences</CardTitle>
                  <Button onClick={addAdmissionPreference} size="sm" className="bg-education-blue">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Preference
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.admission_preferences.map((pref, index) => (
                    <div key={index} className="border-2 rounded-lg p-6 space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAdmissionPreference(index)}
                        className="absolute top-2 right-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Study Destination *</Label>
                          <Input value={pref.study_destination} onChange={(e) => updateAdmissionPreference(index, 'study_destination', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Study Level *</Label>
                          <Input value={pref.study_level} onChange={(e) => updateAdmissionPreference(index, 'study_level', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Program Title *</Label>
                          <Input value={pref.program_title} onChange={(e) => updateAdmissionPreference(index, 'program_title', e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label>Institute Name *</Label>
                          <Input value={pref.institute_name} onChange={(e) => updateAdmissionPreference(index, 'institute_name', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Intake</Label>
                          <Input value={pref.intake} onChange={(e) => updateAdmissionPreference(index, 'intake', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Input type="number" value={pref.enrollment_priority} onChange={(e) => updateAdmissionPreference(index, 'enrollment_priority', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Pathway</Label>
                          <Select value={pref.application_pathway} onValueChange={(v) => updateAdmissionPreference(index, 'application_pathway', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Provider">Provider</SelectItem>
                              <SelectItem value="B2B">B2B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Study Funding Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Funding Status</Label>
                      <Select value={formData.funding_status} onValueChange={(v) => updateField('funding_status', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Self">Self</SelectItem>
                          <SelectItem value="Loan">Loan</SelectItem>
                          <SelectItem value="Scholarship">Scholarship</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sponsor</Label>
                      <Select value={formData.sponsor} onValueChange={(v) => updateField('sponsor', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Applicant">Applicant</SelectItem>
                          <SelectItem value="Parents">Parents</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Dependent">Dependent</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Source of Fund</Label>
                      <Input value={formData.source_of_fund} onChange={(e) => updateField('source_of_fund', e.target.value)} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}