import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  CheckCircle, Upload, FileText, X, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function ApplicationForm() {
  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [highestEducation, setHighestEducation] = useState('');

  const [formData, setFormData] = useState({
    // Personal
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    alternative_phone: '',
    date_of_birth: '',
    city_of_birth: '',
    country_of_birth: '',
    nationality: '',
    dual_citizenship: false,
    second_nationality: '',
    // Mailing Address
    mailing_address: '',
    mailing_city: '',
    mailing_state: '',
    mailing_country: '',
    mailing_zip: '',
    // Permanent Address
    permanent_same_as_mailing: true,
    permanent_address: '',
    permanent_city: '',
    permanent_state: '',
    permanent_country: '',
    permanent_zip: '',
    // Emergency Contact
    emergency_name: '',
    emergency_relation: '',
    emergency_phone: '',
    emergency_email: '',
    // Passport
    has_passport: false,
    passport_number: '',
    passport_issue_date: '',
    passport_expiry_date: '',
    passport_issue_country: '',
    passport_issue_city: '',
    // Highest Education Level
    highest_education: '',
    // Academic - Grade 10
    grade_10_institution: '',
    grade_10_board: '',
    grade_10_result: '',
    grade_10_year: '',
    grade_10_documents: [],
    // Academic - Grade 12
    grade_12_institution: '',
    grade_12_board: '',
    grade_12_stream: '',
    grade_12_result: '',
    grade_12_year: '',
    grade_12_documents: [],
    // Academic - Bachelor
    bachelor_degree: '',
    bachelor_field: '',
    bachelor_institution: '',
    bachelor_year: '',
    bachelor_gpa: '',
    bachelor_scale: '',
    bachelor_documents: [],
    // Academic - Master
    master_degree: '',
    master_field: '',
    master_institution: '',
    master_year: '',
    master_gpa: '',
    master_scale: '',
    master_documents: [],
    // English Tests
    has_ielts: false,
    ielts_overall: '',
    ielts_listening: '',
    ielts_reading: '',
    ielts_writing: '',
    ielts_speaking: '',
    ielts_date: '',
    has_toefl: false,
    toefl_total: '',
    toefl_reading: '',
    toefl_listening: '',
    toefl_speaking: '',
    toefl_writing: '',
    toefl_date: '',
    has_pte: false,
    pte_overall: '',
    pte_date: '',
    has_duolingo: false,
    duolingo_score: '',
    duolingo_date: '',
    has_gre: false,
    gre_verbal: '',
    gre_quant: '',
    gre_writing: '',
    gre_date: '',
    has_gmat: false,
    gmat_total: '',
    gmat_date: '',
    has_moi: false,
    moi_details: '',
    // Work Experience
    work_experiences: [],
    // Background
    visa_refusal: false,
    visa_refusal_details: '',
    medical_condition: '',
    criminal_record: false,
    criminal_details: '',
    immigration_history: '',
    // Course preferences
    preferred_degree_level: '',
    preferred_fields: [],
    preferred_countries: [],
    budget_min: '',
    budget_max: '',
    target_intake: '',
    // Section Documents
    personal_documents: [],
    work_documents: [],
    test_documents: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: () => base44.entities.StudentProfile.filter({ email: user?.email }).then(res => res[0]),
    enabled: !!user?.email,
  });

  // Autofill from profile
  React.useEffect(() => {
    if (studentProfile) {
      setFormData(prev => ({
        ...prev,
        first_name: studentProfile.first_name || prev.first_name,
        last_name: studentProfile.last_name || prev.last_name,
        email: studentProfile.email || prev.email,
        phone: studentProfile.phone || prev.phone,
        date_of_birth: studentProfile.date_of_birth || prev.date_of_birth,
        nationality: studentProfile.nationality || prev.nationality,
        city_of_birth: studentProfile.city_of_birth || prev.city_of_birth,
        country_of_birth: studentProfile.country_of_birth || prev.country_of_birth,
        mailing_address: studentProfile.present_address?.address || prev.mailing_address,
        mailing_city: studentProfile.present_address?.city || prev.mailing_city,
        mailing_state: studentProfile.present_address?.state_district || prev.mailing_state,
        mailing_country: studentProfile.present_address?.country || prev.mailing_country,
        mailing_zip: studentProfile.present_address?.zip_code || prev.mailing_zip,
        permanent_address: studentProfile.permanent_address?.address || prev.permanent_address,
        permanent_city: studentProfile.permanent_address?.city || prev.permanent_city,
        permanent_state: studentProfile.permanent_address?.state_district || prev.permanent_state,
        permanent_country: studentProfile.permanent_address?.country || prev.permanent_country,
        permanent_zip: studentProfile.permanent_address?.zip_code || prev.permanent_zip,
        permanent_same_as_mailing: studentProfile.permanent_address?.same_as_present || prev.permanent_same_as_mailing,
      }));
    }
  }, [studentProfile]);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-application'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-application'],
    queryFn: () => base44.entities.University.filter({ status: 'active' }),
  });

  const submitApplication = useMutation({
    mutationFn: async (data) => {
      // Create or update student profile
      const existingProfiles = await base44.entities.StudentProfile.filter({ email: data.email });
      let profileId;

      if (existingProfiles.length > 0) {
        await base44.entities.StudentProfile.update(existingProfiles[0].id, {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          nationality: data.nationality,
          address: data.address,
          city: data.city,
          country: data.country,
          education: {
            highest_degree: data.highest_degree,
            field_of_study: data.field_of_study,
            institution: data.institution,
            graduation_year: parseInt(data.graduation_year),
            gpa: parseFloat(data.gpa),
            gpa_scale: parseFloat(data.gpa_scale),
          },
          english_proficiency: {
            test_type: data.test_type,
            score: parseFloat(data.score),
            test_date: data.test_date,
          },
          preferred_degree_level: data.preferred_degree_level,
          preferred_fields: data.preferred_fields,
          preferred_countries: data.preferred_countries,
          budget_min: parseFloat(data.budget_min) || 0,
          budget_max: parseFloat(data.budget_max) || 0,
          target_intake: data.target_intake,
          status: 'qualified',
        });
        profileId = existingProfiles[0].id;
      } else {
        const profile = await base44.entities.StudentProfile.create({
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          nationality: data.nationality,
          address: data.address,
          city: data.city,
          country: data.country,
          education: {
            highest_degree: data.highest_degree,
            field_of_study: data.field_of_study,
            institution: data.institution,
            graduation_year: parseInt(data.graduation_year),
            gpa: parseFloat(data.gpa),
            gpa_scale: parseFloat(data.gpa_scale),
          },
          english_proficiency: {
            test_type: data.test_type,
            score: parseFloat(data.score),
            test_date: data.test_date,
          },
          preferred_degree_level: data.preferred_degree_level,
          preferred_fields: data.preferred_fields,
          preferred_countries: data.preferred_countries,
          budget_min: parseFloat(data.budget_min) || 0,
          budget_max: parseFloat(data.budget_max) || 0,
          target_intake: data.target_intake,
          status: 'qualified',
          source: 'website',
        });
        profileId = profile.id;
      }

      // Create documents
      if (data.documents.length > 0) {
        for (const doc of data.documents) {
          await base44.entities.Document.create({
            student_id: profileId,
            document_type: doc.type,
            name: doc.name,
            file_url: doc.url,
            status: 'pending',
          });
        }
      }

      // Create inquiry for follow-up
      await base44.entities.Inquiry.create({
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
        country_of_interest: data.preferred_countries[0] || 'Not specified',
        degree_level: data.preferred_degree_level,
        field_of_study: data.preferred_fields[0] || 'Not specified',
        message: `Application submitted via online form. Target intake: ${data.target_intake}`,
        source: 'website',
        status: 'new',
      });

      return profileId;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit application. Please try again.');
    },
  });

  const handleFileUpload = async (e, section, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setFormData(prev => ({
        ...prev,
        [section]: [...(prev[section] || []), {
          type: docType,
          name: file.name,
          url: file_url,
          uploaded_at: new Date().toISOString(),
        }],
      }));
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experiences: [...prev.work_experiences, {
        company: '',
        designation: '',
        start_date: '',
        end_date: '',
        currently_working: false,
      }]
    }));
  };

  const updateWorkExperience = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.work_experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, work_experiences: updated };
    });
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required personal information');
      return false;
    }
    if (!formData.emergency_name || !formData.emergency_phone) {
      toast.error('Please provide emergency contact details');
      return false;
    }
    if (!formData.highest_education) {
      toast.error('Please select your highest level of education');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    submitApplication.mutate(formData);
  };

  const DocumentUploadSection = ({ section, docType, label }) => {
    const docs = formData[section] || [];
    const sectionDocs = docs.filter(d => d.type === docType);
    
    return (
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">{label}</p>
            {sectionDocs.length > 0 && (
              <div className="mt-2 space-y-1">
                {sectionDocs.map((doc, idx) => (
                  <p key={idx} className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {doc.name}
                  </p>
                ))}
              </div>
            )}
          </div>
          <label>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, section, docType)}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={uploading}
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </span>
            </Button>
          </label>
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-6 py-20">
          <Card className="max-w-2xl mx-auto text-center border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#0B5ED7' }}>
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
              <p className="text-slate-600 mb-8">
                Thank you for your application. Our counselors will review your information and contact you within 24-48 hours.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-slate-500">What's next?</p>
                <ul className="text-left space-y-2 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Profile review by our expert counselors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Personalized course recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Free consultation call scheduled</span>
                  </li>
                </ul>
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                className="mt-8"
                style={{ backgroundColor: '#0B5ED7' }}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-12" style={{ background: 'linear-gradient(135deg, #0B5ED7 0%, #084298 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Study Abroad Application</h1>
            <p className="text-xl opacity-90">
              Start your journey to international education
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b bg-slate-50">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                    <TabsTrigger 
                      value="personal" 
                      className="px-8 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      Personal Information
                    </TabsTrigger>
                    <TabsTrigger 
                      value="academic"
                      className="px-8 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      Academic Qualifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="work"
                      className="px-8 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      Work Experience
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tests"
                      className="px-8 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      Tests
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-8">
                  <TabsContent value="personal" className="mt-0 space-y-6">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <>
                      {studentProfile && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                          <p className="text-sm text-emerald-800 font-medium">
                            ✓ Form auto-filled from your profile
                          </p>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>First Name *</Label>
                          <Input
                            value={formData.first_name}
                            onChange={(e) => updateField('first_name', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Last Name *</Label>
                          <Input
                            value={formData.last_name}
                            onChange={(e) => updateField('last_name', e.target.value)}
                            className="mt-2"
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
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Alternative Phone</Label>
                          <Input
                            value={formData.alternative_phone}
                            onChange={(e) => updateField('alternative_phone', e.target.value)}
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
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>City of Birth</Label>
                          <Input
                            value={formData.city_of_birth}
                            onChange={(e) => updateField('city_of_birth', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Country of Birth</Label>
                          <Input
                            value={formData.country_of_birth}
                            onChange={(e) => updateField('country_of_birth', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Nationality</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Nationality *</Label>
                            <Input
                              value={formData.nationality}
                              onChange={(e) => updateField('nationality', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.dual_citizenship}
                                onChange={(e) => updateField('dual_citizenship', e.target.checked)}
                                className="w-4 h-4"
                              />
                              Dual Citizenship
                            </Label>
                            {formData.dual_citizenship && (
                              <Input
                                value={formData.second_nationality}
                                onChange={(e) => updateField('second_nationality', e.target.value)}
                                placeholder="Second nationality"
                                className="mt-2"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Mailing Address</h3>
                        <div className="space-y-4">
                          <div>
                            <Label>Address Line *</Label>
                            <Input
                              value={formData.mailing_address}
                              onChange={(e) => updateField('mailing_address', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label>City *</Label>
                              <Input
                                value={formData.mailing_city}
                                onChange={(e) => updateField('mailing_city', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>State/District</Label>
                              <Input
                                value={formData.mailing_state}
                                onChange={(e) => updateField('mailing_state', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>ZIP Code</Label>
                              <Input
                                value={formData.mailing_zip}
                                onChange={(e) => updateField('mailing_zip', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Country *</Label>
                            <Input
                              value={formData.mailing_country}
                              onChange={(e) => updateField('mailing_country', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Permanent Address</h3>
                          <Label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={formData.permanent_same_as_mailing}
                              onChange={(e) => updateField('permanent_same_as_mailing', e.target.checked)}
                              className="w-4 h-4"
                            />
                            Same as Mailing Address
                          </Label>
                        </div>
                        {!formData.permanent_same_as_mailing && (
                          <div className="space-y-4">
                            <div>
                              <Label>Address Line</Label>
                              <Input
                                value={formData.permanent_address}
                                onChange={(e) => updateField('permanent_address', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <Label>City</Label>
                                <Input
                                  value={formData.permanent_city}
                                  onChange={(e) => updateField('permanent_city', e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>State/District</Label>
                                <Input
                                  value={formData.permanent_state}
                                  onChange={(e) => updateField('permanent_state', e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>ZIP Code</Label>
                                <Input
                                  value={formData.permanent_zip}
                                  onChange={(e) => updateField('permanent_zip', e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Country</Label>
                              <Input
                                value={formData.permanent_country}
                                onChange={(e) => updateField('permanent_country', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Emergency Contact</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Name *</Label>
                            <Input
                              value={formData.emergency_name}
                              onChange={(e) => updateField('emergency_name', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Relation *</Label>
                            <Input
                              value={formData.emergency_relation}
                              onChange={(e) => updateField('emergency_relation', e.target.value)}
                              placeholder="e.g., Father, Mother, Spouse"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Phone *</Label>
                            <Input
                              value={formData.emergency_phone}
                              onChange={(e) => updateField('emergency_phone', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={formData.emergency_email}
                              onChange={(e) => updateField('emergency_email', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Passport Information</h3>
                        <div className="mb-4">
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.has_passport}
                              onChange={(e) => updateField('has_passport', e.target.checked)}
                              className="w-4 h-4"
                            />
                            I have a passport
                          </Label>
                        </div>
                        {formData.has_passport && (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label>Passport Number *</Label>
                                <Input
                                  value={formData.passport_number}
                                  onChange={(e) => updateField('passport_number', e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>Issue Country *</Label>
                                <Input
                                  value={formData.passport_issue_country}
                                  onChange={(e) => updateField('passport_issue_country', e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label>Issue City</Label>
                                <Input
                                  value={formData.passport_issue_city}
                                  onChange={(e) => updateField('passport_issue_city', e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>Issue Date *</Label>
                                <Input
                                  type="date"
                                  value={formData.passport_issue_date}
                                  onChange={(e) => updateField('passport_issue_date', e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Expiry Date *</Label>
                              <Input
                                type="date"
                                value={formData.passport_expiry_date}
                                onChange={(e) => updateField('passport_expiry_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Upload Documents</h3>
                        <div className="space-y-3">
                          <DocumentUploadSection section="personal_documents" docType="passport" label="Passport Copy" />
                          <DocumentUploadSection section="personal_documents" docType="photo" label="Recent Photograph" />
                          <DocumentUploadSection section="personal_documents" docType="other" label="Other Documents" />
                        </div>
                      </div>
                    </TabsContent>

                  <TabsContent value="academic" className="mt-0 space-y-6">
                    {studentProfile && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <p className="text-sm text-emerald-800 font-medium">
                          ✓ Form auto-filled from your profile
                        </p>
                      </div>
                    )}

                    <div>
                      <Label>Highest Level of Education *</Label>
                      <Select 
                        value={formData.highest_education} 
                        onValueChange={(v) => {
                          updateField('highest_education', v);
                          setHighestEducation(v);
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select your highest education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grade_10">Grade 10th / SSC</SelectItem>
                          <SelectItem value="grade_12">Grade 12th / HSC</SelectItem>
                          <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="master">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(formData.highest_education === 'grade_10' || formData.highest_education === 'grade_12' || formData.highest_education === 'bachelor' || formData.highest_education === 'master' || formData.highest_education === 'phd') && (
                    <>
                      <div className="pt-0 mb-6">
                        <h3 className="font-semibold mb-4">Grade 10th / SSC</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Institution Name *</Label>
                            <Input
                              value={formData.grade_10_institution}
                              onChange={(e) => updateField('grade_10_institution', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Board/Examination Body *</Label>
                            <Input
                              value={formData.grade_10_board}
                              onChange={(e) => updateField('grade_10_board', e.target.value)}
                              placeholder="e.g., CBSE, ICSE, State Board"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Result (GPA/Percentage) *</Label>
                            <Input
                              value={formData.grade_10_result}
                              onChange={(e) => updateField('grade_10_result', e.target.value)}
                              placeholder="e.g., 85% or 3.8 GPA"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Year of Completion *</Label>
                            <Input
                              type="number"
                              value={formData.grade_10_year}
                              onChange={(e) => updateField('grade_10_year', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Grade 12th / HSC</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Institution Name *</Label>
                            <Input
                              value={formData.grade_12_institution}
                              onChange={(e) => updateField('grade_12_institution', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Board/Examination Body *</Label>
                            <Input
                              value={formData.grade_12_board}
                              onChange={(e) => updateField('grade_12_board', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Stream *</Label>
                            <Select value={formData.grade_12_stream} onValueChange={(v) => updateField('grade_12_stream', v)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select stream" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="commerce">Commerce</SelectItem>
                                <SelectItem value="arts">Arts/Humanities</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Result (GPA/Percentage) *</Label>
                            <Input
                              value={formData.grade_12_result}
                              onChange={(e) => updateField('grade_12_result', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Year of Completion *</Label>
                            <Input
                              type="number"
                              value={formData.grade_12_year}
                              onChange={(e) => updateField('grade_12_year', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium mb-3">Upload Documents</h4>
                          <div className="space-y-3">
                            <DocumentUploadSection section="grade_10_documents" docType="certificate" label="Grade 10 Certificate" />
                            <DocumentUploadSection section="grade_10_documents" docType="marksheet" label="Grade 10 Marksheet" />
                          </div>
                        </div>
                      </div>
                    )}

                    {(formData.highest_education === 'grade_12' || formData.highest_education === 'bachelor' || formData.highest_education === 'master' || formData.highest_education === 'phd') && (
                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Grade 12th / HSC</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Degree Name *</Label>
                            <Input
                              value={formData.bachelor_degree}
                              onChange={(e) => updateField('bachelor_degree', e.target.value)}
                              placeholder="e.g., B.Tech, B.Com, B.A."
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Field of Study *</Label>
                            <Input
                              value={formData.bachelor_field}
                              onChange={(e) => updateField('bachelor_field', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Institution Name *</Label>
                            <Input
                              value={formData.bachelor_institution}
                              onChange={(e) => updateField('bachelor_institution', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Graduation Year</Label>
                            <Input
                              type="number"
                              value={formData.bachelor_year}
                              onChange={(e) => updateField('bachelor_year', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>GPA/CGPA</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.bachelor_gpa}
                              onChange={(e) => updateField('bachelor_gpa', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>GPA Scale</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.bachelor_scale}
                              onChange={(e) => updateField('bachelor_scale', e.target.value)}
                              placeholder="e.g., 4.0 or 10.0"
                              className="mt-2"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium mb-3">Upload Documents</h4>
                          <div className="space-y-3">
                            <DocumentUploadSection section="grade_12_documents" docType="certificate" label="Grade 12 Certificate" />
                            <DocumentUploadSection section="grade_12_documents" docType="marksheet" label="Grade 12 Marksheet" />
                          </div>
                        </div>
                      </div>
                    )}

                    {(formData.highest_education === 'bachelor' || formData.highest_education === 'master' || formData.highest_education === 'phd') && (
                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Bachelor's Degree</h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <Label>Degree Name</Label>
                              <Input
                                value={formData.master_degree}
                                onChange={(e) => updateField('master_degree', e.target.value)}
                                placeholder="e.g., M.Tech, MBA, M.A."
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Field of Study</Label>
                              <Input
                                value={formData.master_field}
                                onChange={(e) => updateField('master_field', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Institution Name</Label>
                              <Input
                                value={formData.master_institution}
                                onChange={(e) => updateField('master_institution', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Graduation Year</Label>
                              <Input
                                type="number"
                                value={formData.master_year}
                                onChange={(e) => updateField('master_year', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>GPA/CGPA</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.master_gpa}
                                onChange={(e) => updateField('master_gpa', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>GPA Scale</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={formData.master_scale}
                                onChange={(e) => updateField('master_scale', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium mb-3">Upload Documents</h4>
                          <div className="space-y-3">
                            <DocumentUploadSection section="bachelor_documents" docType="degree" label="Bachelor's Degree Certificate" />
                            <DocumentUploadSection section="bachelor_documents" docType="transcript" label="Bachelor's Transcripts" />
                          </div>
                        </div>
                      </div>
                    )}

                    {(formData.highest_education === 'master' || formData.highest_education === 'phd') && (
                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Master's Degree</h3>
                    <>
                      <p className="text-slate-600 mb-6">
                        Provide your standardized test scores (if available)
                      </p>

                      {/* IELTS */}
                      <div className="border rounded-lg p-6 mb-4">
                        <Label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={formData.has_ielts}
                            onChange={(e) => updateField('has_ielts', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">IELTS</span>
                        </Label>
                        {formData.has_ielts && (
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label>Overall Score</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={formData.ielts_overall}
                                onChange={(e) => updateField('ielts_overall', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Listening</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={formData.ielts_listening}
                                onChange={(e) => updateField('ielts_listening', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Reading</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={formData.ielts_reading}
                                onChange={(e) => updateField('ielts_reading', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Writing</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={formData.ielts_writing}
                                onChange={(e) => updateField('ielts_writing', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Speaking</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={formData.ielts_speaking}
                                onChange={(e) => updateField('ielts_speaking', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Test Date</Label>
                              <Input
                                type="date"
                                value={formData.ielts_date}
                                onChange={(e) => updateField('ielts_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* TOEFL */}
                      <div className="border rounded-lg p-6 mb-4">
                        <Label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={formData.has_toefl}
                            onChange={(e) => updateField('has_toefl', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">TOEFL</span>
                        </Label>
                        {formData.has_toefl && (
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label>Total Score</Label>
                              <Input
                                type="number"
                                value={formData.toefl_total}
                                onChange={(e) => updateField('toefl_total', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Reading</Label>
                              <Input
                                type="number"
                                value={formData.toefl_reading}
                                onChange={(e) => updateField('toefl_reading', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Listening</Label>
                              <Input
                                type="number"
                                value={formData.toefl_listening}
                                onChange={(e) => updateField('toefl_listening', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Speaking</Label>
                              <Input
                                type="number"
                                value={formData.toefl_speaking}
                                onChange={(e) => updateField('toefl_speaking', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Writing</Label>
                              <Input
                                type="number"
                                value={formData.toefl_writing}
                                onChange={(e) => updateField('toefl_writing', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Test Date</Label>
                              <Input
                                type="date"
                                value={formData.toefl_date}
                                onChange={(e) => updateField('toefl_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PTE */}
                      <div className="border rounded-lg p-6 mb-4">
                        <Label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={formData.has_pte}
                            onChange={(e) => updateField('has_pte', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">PTE</span>
                        </Label>
                        {formData.has_pte && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Overall Score</Label>
                              <Input
                                type="number"
                                value={formData.pte_overall}
                                onChange={(e) => updateField('pte_overall', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Test Date</Label>
                              <Input
                                type="date"
                                value={formData.pte_date}
                                onChange={(e) => updateField('pte_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Duolingo */}
                      <div className="border rounded-lg p-6 mb-4">
                        <Label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={formData.has_duolingo}
                            onChange={(e) => updateField('has_duolingo', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">Duolingo English Test</span>
                        </Label>
                        {formData.has_duolingo && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Score</Label>
                              <Input
                                type="number"
                                value={formData.duolingo_score}
                                onChange={(e) => updateField('duolingo_score', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Test Date</Label>
                              <Input
                                type="date"
                                value={formData.duolingo_date}
                                onChange={(e) => updateField('duolingo_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* GRE */}
                      <div className="border rounded-lg p-6 mb-4">
                        <Label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={formData.has_gre}
                            onChange={(e) => updateField('has_gre', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">GRE</span>
                        </Label>
                        {formData.has_gre && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Verbal</Label>
                              <Input
                                type="number"
                                value={formData.gre_verbal}
                                onChange={(e) => updateField('gre_verbal', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Quantitative</Label>
                              <Input
                                type="number"
                                value={formData.gre_quant}
                                onChange={(e) => updateField('gre_quant', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Analytical Writing</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={formData.gre_writing}
                                onChange={(e) => updateField('gre_writing', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Test Date</Label>
                              <Input
                                type="date"
                                value={formData.gre_date}
                                onChange={(e) => updateField('gre_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* GMAT */}
                      <div className="border rounded-lg p-6 mb-4">
                        <Label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={formData.has_gmat}
                            onChange={(e) => updateField('has_gmat', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">GMAT</span>
                        </Label>
                        {formData.has_gmat && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Total Score</Label>
                              <Input
                                type="number"
                                value={formData.gmat_total}
                                onChange={(e) => updateField('gmat_total', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Test Date</Label>
                              <Input
                                type="date"
                                value={formData.gmat_date}
                                onChange={(e) => updateField('gmat_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* MOI */}
                      <div className="border rounded-lg p-6">
                        <Label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={formData.has_moi}
                            onChange={(e) => updateField('has_moi', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">Medium of Instruction (MOI)</span>
                        </Label>
                        {formData.has_moi && (
                          <div>
                            <Label>MOI Details</Label>
                            <Textarea
                              value={formData.moi_details}
                              onChange={(e) => updateField('moi_details', e.target.value)}
                              placeholder="Describe your medium of instruction waiver eligibility"
                              className="mt-2"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Step 4: Work Experience */}
                  {currentStep === 4 && (
                    <>
                      <p className="text-slate-600 mb-6">
                        Add your work experience (optional but recommended for Master's programs)
                      </p>
                      {formData.work_experiences.map((exp, idx) => (
                        <div key={idx} className="border rounded-lg p-6 mb-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Experience {idx + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWorkExperience(idx)}
                              className="text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Company Name</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateWorkExperience(idx, 'company', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Designation/Title</Label>
                              <Input
                                value={exp.designation}
                                onChange={(e) => updateWorkExperience(idx, 'designation', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={exp.start_date}
                                onChange={(e) => updateWorkExperience(idx, 'start_date', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={exp.end_date}
                                onChange={(e) => updateWorkExperience(idx, 'end_date', e.target.value)}
                                disabled={exp.currently_working}
                                className="mt-2"
                              />
                              <Label className="flex items-center gap-2 mt-2 cursor-pointer text-sm">
                                <input
                                  type="checkbox"
                                  checked={exp.currently_working}
                                  onChange={(e) => updateWorkExperience(idx, 'currently_working', e.target.checked)}
                                  className="w-4 h-4"
                                />
                                Currently working here
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addWorkExperience}
                        className="w-full"
                      >
                        + Add Work Experience
                      </Button>

                      {formData.work_experiences.length > 0 && (
                        <div className="pt-6 border-t">
                          <h3 className="font-semibold mb-4">Upload Work Documents</h3>
                          <div className="space-y-3">
                            <DocumentUploadSection section="work_documents" docType="experience_letter" label="Experience Letters" />
                            <DocumentUploadSection section="work_documents" docType="payslip" label="Payslips" />
                            <DocumentUploadSection section="work_documents" docType="cv" label="CV/Resume" />
                          </div>
                        </div>
                      )}
                  </TabsContent>

                  <TabsContent value="tests" className="mt-0 space-y-6">
                    <>
                      <p className="text-slate-600 mb-6">
                        Please provide background information for visa and admission purposes
                      </p>
                      
                      <div className="space-y-6">
                        <div className="border rounded-lg p-6">
                          <Label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                              type="checkbox"
                              checked={formData.visa_refusal}
                              onChange={(e) => updateField('visa_refusal', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="font-semibold">Have you ever been refused a visa?</span>
                          </Label>
                          {formData.visa_refusal && (
                            <div>
                              <Label>Please provide details *</Label>
                              <Textarea
                                value={formData.visa_refusal_details}
                                onChange={(e) => updateField('visa_refusal_details', e.target.value)}
                                placeholder="Include country, date, and reason for refusal"
                                className="mt-2"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>

                        <div className="border rounded-lg p-6">
                          <Label className="mb-2 block font-semibold">Immigration History</Label>
                          <p className="text-sm text-slate-600 mb-3">
                            List countries you have visited in the last 10 years
                          </p>
                          <Textarea
                            value={formData.immigration_history}
                            onChange={(e) => updateField('immigration_history', e.target.value)}
                            placeholder="e.g., USA (2020, 2022), UK (2021)"
                            className="mt-2"
                            rows={3}
                          />
                        </div>

                        <div className="border rounded-lg p-6">
                          <Label className="mb-2 block font-semibold">Medical Conditions</Label>
                          <p className="text-sm text-slate-600 mb-3">
                            Any serious medical conditions we should be aware of?
                          </p>
                          <Textarea
                            value={formData.medical_condition}
                            onChange={(e) => updateField('medical_condition', e.target.value)}
                            placeholder="Leave blank if none"
                            className="mt-2"
                            rows={2}
                          />
                        </div>

                        <div className="border rounded-lg p-6">
                          <Label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                              type="checkbox"
                              checked={formData.criminal_record}
                              onChange={(e) => updateField('criminal_record', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="font-semibold">Have you ever been convicted of a criminal offense?</span>
                          </Label>
                          {formData.criminal_record && (
                            <div>
                              <Label>Please provide details *</Label>
                              <Textarea
                                value={formData.criminal_details}
                                onChange={(e) => updateField('criminal_details', e.target.value)}
                                placeholder="Include nature of offense, date, and outcome"
                                className="mt-2"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 6: Course Selection */}
                  {currentStep === 6 && (
                    <>
                      <div>
                        <Label>Preferred Degree Level *</Label>
                        <Select value={formData.preferred_degree_level} onValueChange={(v) => updateField('preferred_degree_level', v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="foundation">Foundation</SelectItem>
                            <SelectItem value="bachelor">Bachelor's</SelectItem>
                            <SelectItem value="master">Master's</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Preferred Countries * (Select at least one)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          {['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'Ireland'].map(country => (
                            <button
                              key={country}
                              type="button"
                              onClick={() => toggleArrayField('preferred_countries', country)}
                              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                formData.preferred_countries.includes(country)
                                  ? 'border-blue-600 text-white'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                              style={formData.preferred_countries.includes(country) ? { backgroundColor: '#0B5ED7', borderColor: '#0B5ED7' } : {}}
                            >
                              {country}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Preferred Fields (Optional)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          {['Business', 'Engineering', 'Computer Science', 'Medicine', 'Arts', 'Law'].map(field => (
                            <button
                              key={field}
                              type="button"
                              onClick={() => toggleArrayField('preferred_fields', field)}
                              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                formData.preferred_fields.includes(field)
                                  ? 'border-blue-600 text-white'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                              style={formData.preferred_fields.includes(field) ? { backgroundColor: '#0B5ED7', borderColor: '#0B5ED7' } : {}}
                            >
                              {field}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Budget (Min USD/year)</Label>
                          <Input
                            type="number"
                            value={formData.budget_min}
                            onChange={(e) => updateField('budget_min', e.target.value)}
                            className="mt-2"
                            placeholder="10000"
                          />
                        </div>
                        <div>
                          <Label>Budget (Max USD/year)</Label>
                          <Input
                            type="number"
                            value={formData.budget_max}
                            onChange={(e) => updateField('budget_max', e.target.value)}
                            className="mt-2"
                            placeholder="30000"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Target Intake</Label>
                        <Select value={formData.target_intake} onValueChange={(v) => updateField('target_intake', v)}>
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
                    </>
                  )}

                  {/* Step 7: Documents */}
                  {currentStep === 7 && (
                    <>
                      <p className="text-slate-600">
                        Upload supporting documents (optional but recommended for faster processing)
                      </p>
                      <div className="space-y-4">
                        {[
                          { type: 'passport', label: 'Passport' },
                          { type: 'transcript', label: 'Academic Transcripts' },
                          { type: 'english_test', label: 'English Test Results' },
                          { type: 'cv', label: 'CV/Resume' },
                        ].map(doc => {
                          const uploaded = formData.documents.find(d => d.type === doc.type);
                          return (
                            <div key={doc.type} className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-6 h-6 text-slate-400" />
                                  <div>
                                    <p className="font-medium text-slate-900">{doc.label}</p>
                                    {uploaded && (
                                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                        <CheckCircle className="w-4 h-4" />
                                        {uploaded.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <label>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, doc.type)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    disabled={uploading}
                                  />
                                  <Button type="button" variant="outline" disabled={uploading} asChild>
                                    <span className="cursor-pointer">
                                      <Upload className="w-4 h-4 mr-2" />
                                      {uploaded ? 'Replace' : 'Upload'}
                                    </span>
                                  </Button>
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {uploading && (
                        <div className="text-center py-4">
                          <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-slate-600 mt-2">Uploading...</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="px-8 text-white"
                style={{ backgroundColor: '#0B5ED7' }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitApplication.isPending}
                className="px-8 text-white"
                style={{ backgroundColor: '#0B5ED7' }}
              >
                {submitApplication.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}