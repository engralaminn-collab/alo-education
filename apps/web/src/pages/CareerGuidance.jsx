import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Target, TrendingUp, Award, BookOpen, Building2, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function CareerGuidance() {
  const [formData, setFormData] = useState({
    interests: '',
    academic_background: '',
    career_goals: '',
    preferred_countries: ''
  });
  const [guidance, setGuidance] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: () => base44.entities.University.filter({ status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const generateGuidanceMutation = useMutation({
    mutationFn: async (input) => {
      const prompt = `You are an expert career counselor for international education. Based on the following student information, provide comprehensive career path guidance:

Student Information:
- Interests: ${input.interests}
- Academic Background: ${input.academic_background}
- Career Goals: ${input.career_goals}
- Preferred Study Destinations: ${input.preferred_countries || 'Open to all countries'}

${studentProfile ? `
Additional Profile Data:
- Current Education Level: ${studentProfile.education_history?.[0]?.academic_level || 'Not specified'}
- English Proficiency: ${studentProfile.english_proficiency?.test_type || 'Not specified'}
- Work Experience: ${studentProfile.work_experience?.length ? 'Yes' : 'No'}
` : ''}

Available Universities: ${universities.slice(0, 10).map(u => u.university_name || u.name).join(', ')}...
Available Course Areas: ${[...new Set(courses.slice(0, 20).map(c => c.subject_area))].filter(Boolean).join(', ')}...

Please provide:
1. RECOMMENDED STUDY PATHS: Suggest 3-4 specific degree programs/fields that align with their interests and goals
2. UNIVERSITY RECOMMENDATIONS: Name 3-5 specific universities from the available list that would be good fits and explain why
3. CAREER TRAJECTORIES: Outline 2-3 potential career paths they could pursue after graduation, with typical roles and progression
4. SKILLS TO DEVELOP: List 5-7 key skills they should focus on developing during their studies
5. ACTION STEPS: Provide 3-4 immediate next steps they should take

Format the response in clear sections with bullet points. Be specific and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });

      return response;
    },
    onSuccess: (data) => {
      setGuidance(data);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    generateGuidanceMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">AI Career Path Guidance</h1>
            </div>
            <p className="text-white/90 text-lg">
              Get personalized recommendations for your study abroad journey based on your interests, background, and career aspirations
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm mb-8">
              <CardHeader>
                <CardTitle>Tell Us About Yourself</CardTitle>
                <p className="text-slate-500 text-sm">The more details you provide, the better recommendations we can offer</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label>Your Interests & Passions</Label>
                    <Textarea
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                      placeholder="e.g., Technology, healthcare, sustainability, business, arts, engineering..."
                      className="min-h-[80px]"
                      required
                    />
                  </div>

                  <div>
                    <Label>Academic Background</Label>
                    <Textarea
                      value={formData.academic_background}
                      onChange={(e) => setFormData({ ...formData, academic_background: e.target.value })}
                      placeholder="e.g., Bachelor's in Computer Science with 3.5 GPA, strong in mathematics and programming..."
                      className="min-h-[80px]"
                      required
                    />
                  </div>

                  <div>
                    <Label>Career Goals</Label>
                    <Textarea
                      value={formData.career_goals}
                      onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                      placeholder="e.g., Want to become a data scientist at a tech company, eventually lead AI research teams..."
                      className="min-h-[80px]"
                      required
                    />
                  </div>

                  <div>
                    <Label>Preferred Study Destinations (Optional)</Label>
                    <Input
                      value={formData.preferred_countries}
                      onChange={(e) => setFormData({ ...formData, preferred_countries: e.target.value })}
                      placeholder="e.g., UK, USA, Canada, Australia"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
                    disabled={generateGuidanceMutation.isPending}
                  >
                    {generateGuidanceMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Your Career Path...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Career Guidance
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {guidance && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Target className="w-5 h-5" />
                    Your Personalized Career Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {guidance}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Target, title: 'Share Your Goals', desc: 'Tell us about your interests and aspirations' },
                  { icon: Sparkles, title: 'AI Analysis', desc: 'Our AI analyzes global education opportunities' },
                  { icon: TrendingUp, title: 'Get Recommendations', desc: 'Receive personalized course and university suggestions' },
                  { icon: Award, title: 'Plan Your Path', desc: 'Follow actionable steps toward your dream career' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{step.title}</h4>
                      <p className="text-sm text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-lg font-bold mb-2">Ready to Explore?</h3>
                <p className="text-white/90 text-sm mb-4">Browse universities and courses now</p>
                <Link to={createPageUrl('Universities')}>
                  <Button className="w-full bg-white text-purple-600 hover:bg-slate-100 mb-2">
                    View Universities
                  </Button>
                </Link>
                <Link to={createPageUrl('Courses')}>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}