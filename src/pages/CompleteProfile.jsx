import React, { useState } from 'react';
<<<<<<< HEAD
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
=======
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import AcademicAchievements from '@/components/profile/AcademicAchievements';
import ExtracurricularActivities from '@/components/profile/ExtracurricularActivities';
import DocumentUpload from '@/components/profile/DocumentUpload';
import Footer from '@/components/landing/Footer';
import { toast } from 'sonner';

export default function CompleteProfile() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: studentProfile = {} } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const profile = await base44.entities.StudentProfile.filter({});
      return profile[0] || {};
    }
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const [formData, setFormData] = useState({
    first_name: studentProfile.first_name || '',
    last_name: studentProfile.last_name || '',
    email: studentProfile.email || '',
    phone: studentProfile.phone || '',
    preferred_fields: studentProfile.preferred_fields || [],
    career_goals: studentProfile.notes || '',
    bio: studentProfile.notes || ''
  });

  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      if (studentProfile.id) {
        return base44.entities.StudentProfile.update(studentProfile.id, data);
>>>>>>> last/main
      } else {
        return base44.entities.StudentProfile.create(data);
      }
    },
    onSuccess: () => {
<<<<<<< HEAD
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
=======
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
    }
  });

  const fieldOptions = [
    'Engineering', 'Business', 'Computer Science', 'Medicine', 'Law',
    'Arts & Humanities', 'Social Sciences', 'Natural Sciences', 'Architecture',
    'Economics', 'Psychology', 'Education', 'Nursing'
  ];

  const calculateCompleteness = () => {
    let score = 0;
    if (formData.first_name && formData.last_name) score += 10;
    if (formData.email) score += 10;
    if (formData.phone) score += 10;
    if (formData.preferred_fields?.length > 0) score += 15;
    if (formData.career_goals) score += 15;
    if (achievements.length > 0) score += 15;
    if (activities.length > 0) score += 15;
    if (documents.length > 0) score += 5;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  const toggleField = (field) => {
    const current = formData.preferred_fields || [];
    if (current.includes(field)) {
      setFormData({ ...formData, preferred_fields: current.filter(f => f !== field) });
    } else {
      setFormData({ ...formData, preferred_fields: [...current, field] });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-education-blue to-alo-orange text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Complete Your Profile</h1>
              <p className="text-white/90 mt-2">Enhance your profile to get better university matches</p>
            </div>
            <Link to={createPageUrl('StudentPortal')}>
              <Button variant="outline" className="text-white border-white hover:bg-white/20">
                Back to Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Completeness Bar */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Profile Completeness</h3>
                <span className="text-2xl font-bold text-education-blue">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-3" />
              <p className="text-sm text-slate-600">
                {completeness === 100
                  ? '✅ Your profile is complete! Ready for university applications.'
                  : `Complete ${100 - completeness}% more to unlock better university matches.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="border-0 shadow-lg">
>>>>>>> last/main
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
<<<<<<< HEAD
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
=======
                    <label className="text-sm font-semibold text-slate-900 block mb-2">First Name *</label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">Last Name *</label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">Phone *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
>>>>>>> last/main
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
<<<<<<< HEAD
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
=======

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Academic & Career Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-3">
                    Preferred Fields of Study *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {fieldOptions.map(field => (
                      <button
                        key={field}
                        onClick={() => toggleField(field)}
                        className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.preferred_fields?.includes(field)
                            ? 'border-education-blue bg-blue-50 text-education-blue'
                            : 'border-slate-200 text-slate-700 hover:border-education-blue'
                        }`}
                      >
                        {field}
                      </button>
                    ))}
>>>>>>> last/main
                  </div>
                </div>

                <div>
<<<<<<< HEAD
                  <Label>Preferred Study Area</Label>
                  <Input
                    value={formData.admission_preferences?.study_area || ''}
                    onChange={(e) => updateNestedField('admission_preferences', 'study_area', e.target.value)}
                    placeholder="e.g., Business, Engineering, Computer Science"
                    className="mt-2"
=======
                  <label className="text-sm font-semibold text-slate-900 block mb-2">Career Goals *</label>
                  <Textarea
                    value={formData.career_goals}
                    onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                    placeholder="Describe your desired career path and long-term goals (e.g., Software Engineer at a tech company, Research Scientist in AI...)"
                    rows={4}
>>>>>>> last/main
                  />
                </div>

                <div>
<<<<<<< HEAD
                  <Label>Preferred Intake</Label>
                  <Input
                    value={formData.admission_preferences?.intake || ''}
                    onChange={(e) => updateNestedField('admission_preferences', 'intake', e.target.value)}
                    placeholder="e.g., September 2025"
                    className="mt-2"
=======
                  <label className="text-sm font-semibold text-slate-900 block mb-2">About You</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself, your interests, and what makes you unique"
                    rows={3}
>>>>>>> last/main
                  />
                </div>
              </CardContent>
            </Card>
<<<<<<< HEAD
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
=======

            <Button
              onClick={() => updateProfile.mutate(formData)}
              disabled={updateProfile.isPending}
              className="w-full bg-education-blue hover:bg-blue-700 h-12 text-lg"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Basic Information'}
            </Button>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic">
            <AcademicAchievements achievements={achievements} onChange={setAchievements} />
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <ExtracurricularActivities activities={activities} onChange={setActivities} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentUpload
              studentId={studentProfile.id}
              documents={documents}
              onDocumentsUpdate={(docs) => queryClient.setQueryData(['documents'], docs)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
>>>>>>> last/main
    </div>
  );
}