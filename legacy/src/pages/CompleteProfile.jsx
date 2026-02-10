import React, { useState } from 'react';
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
      } else {
        return base44.entities.StudentProfile.create(data);
      }
    },
    onSuccess: () => {
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
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">Career Goals *</label>
                  <Textarea
                    value={formData.career_goals}
                    onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                    placeholder="Describe your desired career path and long-term goals (e.g., Software Engineer at a tech company, Research Scientist in AI...)"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">About You</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself, your interests, and what makes you unique"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

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
    </div>
  );
}