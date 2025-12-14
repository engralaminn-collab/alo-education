import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  CheckCircle, ArrowRight, ArrowLeft, Upload, FileText,
  User, GraduationCap, BookOpen, File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';

const steps = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Academic History', icon: GraduationCap },
  { id: 3, title: 'Course Selection', icon: BookOpen },
  { id: 4, title: 'Documents', icon: File },
];

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Personal
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
    // Academic
    highest_degree: '',
    field_of_study: '',
    institution: '',
    graduation_year: '',
    gpa: '',
    gpa_scale: '',
    // English
    test_type: '',
    score: '',
    test_date: '',
    // Course preferences
    preferred_degree_level: '',
    preferred_fields: [],
    preferred_countries: [],
    budget_min: '',
    budget_max: '',
    target_intake: '',
    // Documents
    documents: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

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

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, {
          type: docType,
          name: file.name,
          url: file_url,
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

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.highest_degree || !formData.institution) {
        toast.error('Please fill in your academic information');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.preferred_degree_level || formData.preferred_countries.length === 0) {
        toast.error('Please select your course preferences');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep()) return;
    submitApplication.mutate(formData);
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
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center z-10 flex-1">
                      <div 
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${
                          isCompleted ? 'bg-green-600' : isActive ? 'bg-white border-4' : 'bg-white'
                        }`}
                        style={isActive ? { borderColor: '#0B5ED7' } : {}}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-7 h-7 text-white" />
                        ) : (
                          <Icon className={`w-6 h-6 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                        )}
                      </div>
                      <span className={`text-sm font-medium text-center ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.title}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="flex-1 h-1 bg-slate-200 -mx-4 mt-6">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: currentStep > step.id ? '100%' : '0%',
                            backgroundColor: '#0B5ED7'
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <>
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
                          <Label>Date of Birth</Label>
                          <Input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => updateField('date_of_birth', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Nationality</Label>
                          <Input
                            value={formData.nationality}
                            onChange={(e) => updateField('nationality', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>City</Label>
                          <Input
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <Input
                            value={formData.country}
                            onChange={(e) => updateField('country', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Academic History */}
                  {currentStep === 2 && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Highest Degree *</Label>
                          <Select value={formData.highest_degree} onValueChange={(v) => updateField('highest_degree', v)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high_school">High School</SelectItem>
                              <SelectItem value="bachelor">Bachelor's</SelectItem>
                              <SelectItem value="master">Master's</SelectItem>
                              <SelectItem value="phd">PhD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Field of Study</Label>
                          <Input
                            value={formData.field_of_study}
                            onChange={(e) => updateField('field_of_study', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Institution *</Label>
                          <Input
                            value={formData.institution}
                            onChange={(e) => updateField('institution', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Graduation Year</Label>
                          <Input
                            type="number"
                            value={formData.graduation_year}
                            onChange={(e) => updateField('graduation_year', e.target.value)}
                            className="mt-2"
                            placeholder="2020"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>GPA</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.gpa}
                            onChange={(e) => updateField('gpa', e.target.value)}
                            className="mt-2"
                            placeholder="3.5"
                          />
                        </div>
                        <div>
                          <Label>GPA Scale</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.gpa_scale}
                            onChange={(e) => updateField('gpa_scale', e.target.value)}
                            className="mt-2"
                            placeholder="4.0"
                          />
                        </div>
                      </div>
                      <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">English Proficiency</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <Label>Test Type</Label>
                            <Select value={formData.test_type} onValueChange={(v) => updateField('test_type', v)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select test" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ielts">IELTS</SelectItem>
                                <SelectItem value="toefl">TOEFL</SelectItem>
                                <SelectItem value="pte">PTE</SelectItem>
                                <SelectItem value="duolingo">Duolingo</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Score</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={formData.score}
                              onChange={(e) => updateField('score', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Test Date</Label>
                            <Input
                              type="date"
                              value={formData.test_date}
                              onChange={(e) => updateField('test_date', e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Course Selection */}
                  {currentStep === 3 && (
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

                  {/* Step 4: Documents */}
                  {currentStep === 4 && (
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