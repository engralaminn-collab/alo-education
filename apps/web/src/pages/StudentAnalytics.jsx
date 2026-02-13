import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Target, CheckCircle, Clock, Award, 
  BarChart3, LineChart, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';

export default function StudentAnalytics() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications-analytics', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites-analytics', studentProfile?.id],
    queryFn: () => base44.entities.FavoriteCourse.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents-analytics', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-analytics'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-analytics'],
    queryFn: () => base44.entities.University.list(),
  });

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
          <p className="text-slate-600">Please complete your profile to see analytics</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const profileCompleteness = studentProfile.profile_completeness || 0;
  const activeApplications = applications.filter(a => 
    !['rejected', 'withdrawn', 'enrolled'].includes(a.status)
  ).length;
  const acceptedOffers = applications.filter(a => 
    ['conditional_offer', 'unconditional_offer'].includes(a.status)
  ).length;
  const docsApproved = documents.filter(d => d.status === 'approved').length;
  const docsPending = documents.filter(d => d.status === 'pending').length;

  // Application stage distribution
  const stageDistribution = [
    { name: 'Draft', value: applications.filter(a => a.status === 'draft').length, color: '#94a3b8' },
    { name: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, color: '#3b82f6' },
    { name: 'Submitted', value: applications.filter(a => a.status === 'submitted_to_university').length, color: '#8b5cf6' },
    { name: 'Offers', value: acceptedOffers, color: '#10b981' },
    { name: 'Visa', value: applications.filter(a => a.status === 'visa_processing').length, color: '#f59e0b' },
    { name: 'Enrolled', value: applications.filter(a => a.status === 'enrolled').length, color: '#10b981' },
  ].filter(s => s.value > 0);

  // Profile strength analysis
  const profileStrength = [
    { category: 'Basic Info', score: (studentProfile.first_name && studentProfile.email && studentProfile.phone) ? 100 : 50 },
    { category: 'Education', score: studentProfile.education?.highest_degree ? 100 : 0 },
    { category: 'English Test', score: studentProfile.english_proficiency?.score ? 100 : 0 },
    { category: 'Preferences', score: studentProfile.preferred_countries?.length ? 100 : 0 },
    { category: 'Budget', score: (studentProfile.budget_min && studentProfile.budget_max) ? 100 : 0 },
  ];

  // Course match analysis
  const favoriteCourses = courses.filter(c => favorites.some(f => f.course_id === c.id));
  const matchScores = favoriteCourses.map(course => {
    let score = 50;
    if (studentProfile.preferred_fields?.includes(course.subject_area)) score += 20;
    if (studentProfile.preferred_countries?.includes(course.country)) score += 15;
    if (course.tuition_fee_min <= studentProfile.budget_max) score += 15;
    return { name: course.course_title.substring(0, 30), score: Math.min(score, 100) };
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl font-bold mb-4">Your Analytics Dashboard</h1>
            <p className="text-xl text-slate-300">
              Track your study abroad journey with data-driven insights
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Profile Strength</p>
                    <p className="text-3xl font-bold" style={{ color: '#0B5ED7' }}>{profileCompleteness}%</p>
                  </div>
                  <Target className="w-10 h-10 text-blue-200" />
                </div>
                <Progress value={profileCompleteness} className="mt-3 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Active Applications</p>
                    <p className="text-3xl font-bold text-slate-900">{activeApplications}</p>
                  </div>
                  <Clock className="w-10 h-10 text-amber-200" />
                </div>
                <p className="text-xs text-slate-500 mt-3">In progress</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Offers Received</p>
                    <p className="text-3xl font-bold text-green-600">{acceptedOffers}</p>
                  </div>
                  <Award className="w-10 h-10 text-green-200" />
                </div>
                <p className="text-xs text-slate-500 mt-3">Congratulations!</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Documents Ready</p>
                    <p className="text-3xl font-bold text-slate-900">{docsApproved}/{documents.length}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-emerald-200" />
                </div>
                <p className="text-xs text-slate-500 mt-3">{docsPending} pending review</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Application Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" style={{ color: '#0B5ED7' }} />
                Application Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stageDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {stageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <p>No applications yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Strength */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#F7941D' }} />
                Profile Strength Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profileStrength}>
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#0B5ED7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Course Match Scores */}
        {matchScores.length > 0 && (
          <Card className="border-0 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Your Saved Courses - Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matchScores.map((course, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{course.name}...</span>
                      <Badge className={
                        course.score >= 80 ? 'bg-green-100 text-green-700' :
                        course.score >= 60 ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }>
                        {course.score}% Match
                      </Badge>
                    </div>
                    <Progress value={course.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Metrics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Success Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <p className="text-3xl font-bold text-blue-900">{favorites.length}</p>
                <p className="text-sm text-blue-700">Courses Saved</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <p className="text-3xl font-bold text-green-900">{applications.length}</p>
                <p className="text-sm text-green-700">Applications Started</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <Award className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <p className="text-3xl font-bold text-purple-900">
                  {applications.length > 0 ? Math.round((acceptedOffers / applications.length) * 100) : 0}%
                </p>
                <p className="text-sm text-purple-700">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}