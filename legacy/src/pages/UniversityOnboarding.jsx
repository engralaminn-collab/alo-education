import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle, Clock, AlertCircle, Upload, Building2, User, BookOpen, 
  FileText, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { toast } from 'sonner';

export default function UniversityOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    university_name: '',
    website: '',
    country: '',
    city: '',
    about: '',
    logo_url: '',
    cover_image_url: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    primary_contact_role: '',
    secondary_contacts: [],
    course_catalog_url: '',
    admission_requirements_summary: '',
    english_test_requirements: {
      ielts_minimum: 6.5,
      pte_minimum: 65,
      toefl_minimum: 90,
      duolingo_minimum: 100,
    },
    application_deadline: '',
    intake_dates: [],
    scholarships_available: false,
    scholarship_details: '',
    terms_accepted: false,
  });

  const queryClient = useQueryClient();
  const totalSteps = 6;

  const submitOnboarding = useMutation({
    mutationFn: async (data) => {
      return base44.entities.UniversityOnboarding.create({
        ...data,
        onboarding_status: 'submitted',
        completion_percentage: 100,
        submitted_date: new Date().toISOString(),
      });
    },
    onSuccess: (result) => {
      toast.success('University onboarding submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      setFormData({
        university_name: '',
        website: '',
        country: '',
        city: '',
        about: '',
        logo_url: '',
        cover_image_url: '',
        primary_contact_name: '',
        primary_contact_email: '',
        primary_contact_phone: '',
        primary_contact_role: '',
        secondary_contacts: [],
        course_catalog_url: '',
        admission_requirements_summary: '',
        english_test_requirements: {
          ielts_minimum: 6.5,
          pte_minimum: 65,
          toefl_minimum: 90,
          duolingo_minimum: 100,
        },
        application_deadline: '',
        intake_dates: [],
        scholarships_available: false,
        scholarship_details: '',
        terms_accepted: false,
      });
      setCurrentStep(1);
    },
    onError: (error) => {
      toast.error('Failed to submit onboarding. Please try again.');
      console.error(error);
    },
  });

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: 'University Profile', icon: Building2 },
    { number: 2, title: 'Contact Personnel', icon: User },
    { number: 3, title: 'Admission Requirements', icon: FileText },
    { number: 4, title: 'Course Catalog', icon: BookOpen },
    { number: 5, title: 'Scholarships', icon: CheckCircle },
    { number: 6, title: 'Review & Submit', icon: ArrowRight },
  ];

  const canProceed = () => {
    switch(currentStep) {
      case 1:
        return formData.university_name && formData.country && formData.primary_contact_email;
      case 2:
        return formData.primary_contact_name && formData.primary_contact_email && formData.primary_contact_phone;
      case 3:
        return formData.admission_requirements_summary;
      case 4:
        return formData.course_catalog_url;
      case 5:
        return true;
      case 6:
        return formData.terms_accepted;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-education-blue to-alo-orange text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">University Partner Onboarding</h1>
          <p className="text-white/90">Complete your profile and start connecting with ALO Education students</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Progress Bar */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">Step {currentStep} of {totalSteps}</h3>
              <span className="text-sm font-semibold text-education-blue">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-education-blue to-alo-orange h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step Indicator */}
        <div className="mb-12">
          <div className="grid grid-cols-6 gap-2">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <motion.button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isActive
                      ? 'bg-education-blue text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StepIcon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-semibold line-clamp-2">{step.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-0 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: University Profile */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      University Name *
                    </label>
                    <Input
                      placeholder="e.g., University of Oxford"
                      value={formData.university_name}
                      onChange={(e) => handleFieldChange('university_name', e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Website
                      </label>
                      <Input
                        placeholder="https://www.university.edu"
                        value={formData.website}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Country *
                      </label>
                      <Input
                        placeholder="e.g., United Kingdom"
                        value={formData.country}
                        onChange={(e) => handleFieldChange('country', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      City
                    </label>
                    <Input
                      placeholder="e.g., Oxford"
                      value={formData.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      About Your University
                    </label>
                    <Textarea
                      placeholder="Brief description of your university..."
                      value={formData.about}
                      onChange={(e) => handleFieldChange('about', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Logo URL
                      </label>
                      <Input
                        placeholder="https://..."
                        value={formData.logo_url}
                        onChange={(e) => handleFieldChange('logo_url', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Cover Image URL
                      </label>
                      <Input
                        placeholder="https://..."
                        value={formData.cover_image_url}
                        onChange={(e) => handleFieldChange('cover_image_url', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Personnel */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Provide primary contact details. You can add additional contacts later.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Contact Name *
                    </label>
                    <Input
                      placeholder="Full name"
                      value={formData.primary_contact_name}
                      onChange={(e) => handleFieldChange('primary_contact_name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="contact@university.edu"
                      value={formData.primary_contact_email}
                      onChange={(e) => handleFieldChange('primary_contact_email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      placeholder="+1-234-567-8900"
                      value={formData.primary_contact_phone}
                      onChange={(e) => handleFieldChange('primary_contact_phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Role/Title
                    </label>
                    <Input
                      placeholder="e.g., Admissions Officer"
                      value={formData.primary_contact_role}
                      onChange={(e) => handleFieldChange('primary_contact_role', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Admission Requirements */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      General Admission Requirements *
                    </label>
                    <Textarea
                      placeholder="Describe general admission requirements (GPA, documents, etc.)..."
                      value={formData.admission_requirements_summary}
                      onChange={(e) => handleFieldChange('admission_requirements_summary', e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-4">English Test Minimums</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">IELTS Overall</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="9"
                          value={formData.english_test_requirements.ielts_minimum}
                          onChange={(e) => handleFieldChange('english_test_requirements', {
                            ...formData.english_test_requirements,
                            ielts_minimum: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">PTE Score</label>
                        <Input
                          type="number"
                          min="0"
                          max="90"
                          value={formData.english_test_requirements.pte_minimum}
                          onChange={(e) => handleFieldChange('english_test_requirements', {
                            ...formData.english_test_requirements,
                            pte_minimum: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">TOEFL iBT</label>
                        <Input
                          type="number"
                          min="0"
                          max="120"
                          value={formData.english_test_requirements.toefl_minimum}
                          onChange={(e) => handleFieldChange('english_test_requirements', {
                            ...formData.english_test_requirements,
                            toefl_minimum: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">Duolingo</label>
                        <Input
                          type="number"
                          min="0"
                          max="160"
                          value={formData.english_test_requirements.duolingo_minimum}
                          onChange={(e) => handleFieldChange('english_test_requirements', {
                            ...formData.english_test_requirements,
                            duolingo_minimum: parseInt(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Application Deadline
                      </label>
                      <Input
                        type="date"
                        value={formData.application_deadline}
                        onChange={(e) => handleFieldChange('application_deadline', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Intake Dates (comma-separated)
                      </label>
                      <Input
                        placeholder="January, September"
                        value={formData.intake_dates.join(', ')}
                        onChange={(e) => handleFieldChange('intake_dates', 
                          e.target.value.split(',').map(d => d.trim())
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Course Catalog */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Alert>
                    <Upload className="h-4 w-4" />
                    <AlertDescription>
                      Provide your course catalog as a file URL (PDF, Excel, or document)
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Course Catalog URL *
                    </label>
                    <Input
                      placeholder="https://... (PDF, Excel, or document link)"
                      value={formData.course_catalog_url}
                      onChange={(e) => handleFieldChange('course_catalog_url', e.target.value)}
                    />
                  </div>

                  <div className="bg-slate-50 p-6 rounded-lg text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">
                      Make sure your course catalog includes:
                    </p>
                    <ul className="text-sm text-slate-600 space-y-2 max-w-md mx-auto">
                      <li>✓ Course titles and codes</li>
                      <li>✓ Program duration and format</li>
                      <li>✓ Tuition fees</li>
                      <li>✓ Intake dates</li>
                      <li>✓ Entry requirements</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 5: Scholarships */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                    <Checkbox
                      id="scholarships"
                      checked={formData.scholarships_available}
                      onCheckedChange={(checked) => handleFieldChange('scholarships_available', checked)}
                    />
                    <label htmlFor="scholarships" className="text-sm font-semibold text-slate-900 cursor-pointer">
                      We offer scholarships
                    </label>
                  </div>

                  {formData.scholarships_available && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Scholarship Details
                      </label>
                      <Textarea
                        placeholder="Describe scholarship opportunities, eligibility criteria, amounts, etc..."
                        value={formData.scholarship_details}
                        onChange={(e) => handleFieldChange('scholarship_details', e.target.value)}
                        rows={5}
                      />
                    </div>
                  )}

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">Additional Information</h4>
                    <p className="text-sm text-slate-600">
                      You'll be able to add more detailed scholarship information and manage your profile after onboarding is complete.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 6: Review & Submit */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Review your information before submitting. Our team will verify and activate your profile within 2-3 business days.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4 bg-slate-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">University Information</p>
                      <p className="font-semibold text-slate-900">{formData.university_name}</p>
                      <p className="text-sm text-slate-600">{formData.city}, {formData.country}</p>
                    </div>

                    <hr />

                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Primary Contact</p>
                      <p className="font-semibold text-slate-900">{formData.primary_contact_name}</p>
                      <p className="text-sm text-slate-600">{formData.primary_contact_email}</p>
                    </div>

                    <hr />

                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Key Details</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>✓ Admission requirements provided</li>
                        <li>✓ Course catalog uploaded</li>
                        {formData.scholarships_available && <li>✓ Scholarships available</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={formData.terms_accepted}
                      onCheckedChange={(checked) => handleFieldChange('terms_accepted', checked)}
                    />
                    <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                      I confirm that the information provided is accurate and complete. I agree to the ALO Education partnership terms.
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-3">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-education-blue hover:bg-blue-700 gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => submitOnboarding.mutate(formData)}
                disabled={!canProceed() || submitOnboarding.isPending}
                className="bg-gradient-to-r from-education-blue to-alo-orange hover:opacity-90 gap-2"
              >
                {submitOnboarding.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Onboarding
                    <CheckCircle className="w-4 h-4" />
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