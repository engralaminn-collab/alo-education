import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, Globe, Award, Clock, DollarSign, 
  ArrowRight, ArrowLeft, Check, Building2, Sparkles,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';

const steps = [
  { id: 1, title: 'Education', icon: GraduationCap },
  { id: 2, title: 'English', icon: Globe },
  { id: 3, title: 'Preferences', icon: Award },
  { id: 4, title: 'Results', icon: Sparkles },
];

export default function CourseMatcher() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    highest_degree: '',
    field_of_study: '',
    gpa: '',
    gpa_scale: '4',
    english_test: '',
    english_score: '',
    preferred_countries: [],
    preferred_degree: '',
    preferred_fields: [],
    budget_max: '',
  });
  const [matchedCourses, setMatchedCourses] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['all-universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 3) {
        matchCourses();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const matchCourses = () => {
    setIsMatching(true);
    setShowAIRecommendations(true);
    
    setTimeout(() => {
      const gpaPercent = (parseFloat(formData.gpa) / parseFloat(formData.gpa_scale)) * 100;
      const englishScore = parseFloat(formData.english_score);
      
      const matched = courses.map(course => {
        let score = 0;
        let eligibility = [];
        
        // GPA check
        if (course.requirements?.min_gpa) {
          const reqGpaPercent = (course.requirements.min_gpa / 4) * 100;
          if (gpaPercent >= reqGpaPercent) {
            score += 25;
            eligibility.push({ type: 'pass', text: 'GPA requirement met' });
          } else {
            eligibility.push({ type: 'fail', text: `GPA below requirement (${course.requirements.min_gpa})` });
          }
        } else {
          score += 20;
          eligibility.push({ type: 'pass', text: 'No GPA requirement' });
        }
        
        // English check
        if (formData.english_test === 'ielts' && course.requirements?.ielts_score) {
          if (englishScore >= course.requirements.ielts_score) {
            score += 25;
            eligibility.push({ type: 'pass', text: 'IELTS score met' });
          } else {
            eligibility.push({ type: 'fail', text: `IELTS below ${course.requirements.ielts_score}` });
          }
        } else if (formData.english_test === 'toefl' && course.requirements?.toefl_score) {
          if (englishScore >= course.requirements.toefl_score) {
            score += 25;
            eligibility.push({ type: 'pass', text: 'TOEFL score met' });
          } else {
            eligibility.push({ type: 'fail', text: `TOEFL below ${course.requirements.toefl_score}` });
          }
        } else {
          score += 20;
          eligibility.push({ type: 'pass', text: 'English requirement flexible' });
        }
        
        // Degree level match
        if (formData.preferred_degree === course.degree_level) {
          score += 25;
        } else {
          score += 10;
        }
        
        // Field match
        if (formData.preferred_fields.includes(course.field_of_study)) {
          score += 25;
        } else {
          score += 10;
        }
        
        // Country match
        const uni = universityMap[course.university_id];
        if (uni && formData.preferred_countries.some(c => 
          uni.country?.toLowerCase().includes(c.toLowerCase())
        )) {
          score += 10;
        }
        
        // Budget check
        if (formData.budget_max && course.tuition_fee) {
          if (course.tuition_fee <= parseFloat(formData.budget_max)) {
            eligibility.push({ type: 'pass', text: 'Within budget' });
          } else {
            score -= 10;
            eligibility.push({ type: 'warning', text: 'Above budget' });
          }
        }
        
        return {
          ...course,
          university: uni,
          matchScore: Math.min(100, Math.max(0, score)),
          eligibility,
        };
      });
      
      const sorted = matched.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
      setMatchedCourses(sorted);
      setIsMatching(false);
    }, 1500);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50">
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-12 text-slate-900 text-center">
              Explore courses
            </h1>
            
            {/* Tabs */}
            <div className="flex gap-3 mb-8 justify-center">
              <Button 
                className={`px-8 py-6 text-base font-medium rounded-full ${
                  currentStep === 1 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
                onClick={() => setCurrentStep(1)}
              >
                COURSES
              </Button>
              <Button 
                className={`px-8 py-6 text-base font-medium rounded-full ${
                  currentStep === 2 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
                onClick={() => setCurrentStep(2)}
              >
                UNIVERSITIES
              </Button>
            </div>
            
            {/* Search Form */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label className="text-slate-700 mb-2 block text-sm">I'm looking for:</Label>
                    <Input 
                      placeholder="Enter subject or course:"
                      className="h-12"
                      value={formData.field_of_study}
                      onChange={(e) => updateField('field_of_study', e.target.value)}
                    />
                  </div>

                  <div className="flex-1">
                    <Label className="text-slate-700 mb-2 block text-sm">I'm planning to study:</Label>
                    <Select value={formData.preferred_degree} onValueChange={(v) => updateField('preferred_degree', v)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="text-slate-700 mb-2 block text-sm">I want to study in:</Label>
                    <Select 
                      value={formData.preferred_countries[0] || ''} 
                      onValueChange={(v) => updateField('preferred_countries', [v])}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="germany">Germany</SelectItem>
                        <SelectItem value="ireland">Ireland</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white h-12 px-8"
                    onClick={() => setCurrentStep(4)}
                  >
                    <Sparkles className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your Education</CardTitle>
                    <CardDescription>Tell us about your academic background</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Highest Degree Completed</Label>
                        <Select value={formData.highest_degree} onValueChange={(v) => updateField('highest_degree', v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high_school">High School</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                            <SelectItem value="master">Master's Degree</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Field of Study</Label>
                        <Select value={formData.field_of_study} onValueChange={(v) => updateField('field_of_study', v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="computer_science">Computer Science</SelectItem>
                            <SelectItem value="medicine">Medicine</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>GPA / Grade</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 3.5"
                          value={formData.gpa}
                          onChange={(e) => updateField('gpa', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>GPA Scale</Label>
                        <Select value={formData.gpa_scale} onValueChange={(v) => updateField('gpa_scale', v)}>
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
                  </CardContent>
                </Card>
              )}

              {/* Step 2: English */}
              {currentStep === 2 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">English Proficiency</CardTitle>
                    <CardDescription>Your English test scores</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>English Test Type</Label>
                      <Select value={formData.english_test} onValueChange={(v) => updateField('english_test', v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select test" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ielts">IELTS</SelectItem>
                          <SelectItem value="toefl">TOEFL</SelectItem>
                          <SelectItem value="pte">PTE</SelectItem>
                          <SelectItem value="duolingo">Duolingo</SelectItem>
                          <SelectItem value="none">Not taken yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.english_test && formData.english_test !== 'none' && (
                      <div>
                        <Label>Score</Label>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder={formData.english_test === 'ielts' ? 'e.g. 7.0' : 'e.g. 100'}
                          value={formData.english_score}
                          onChange={(e) => updateField('english_score', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your Preferences</CardTitle>
                    <CardDescription>What are you looking for?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Preferred Countries (select multiple)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland'].map(country => (
                          <Badge
                            key={country}
                            variant={formData.preferred_countries.includes(country) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all ${
                              formData.preferred_countries.includes(country) 
                                ? 'bg-emerald-500 hover:bg-emerald-600' 
                                : 'hover:bg-slate-100'
                            }`}
                            onClick={() => {
                              const current = formData.preferred_countries;
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
                      <Label>Preferred Degree Level</Label>
                      <Select value={formData.preferred_degree} onValueChange={(v) => updateField('preferred_degree', v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelor">Bachelor's</SelectItem>
                          <SelectItem value="master">Master's</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Fields of Interest (select multiple)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Business', 'Engineering', 'Computer Science', 'Medicine', 'Arts', 'Science'].map(field => {
                          const fieldKey = field.toLowerCase().replace(' ', '_');
                          return (
                            <Badge
                              key={field}
                              variant={formData.preferred_fields.includes(fieldKey) ? 'default' : 'outline'}
                              className={`cursor-pointer transition-all ${
                                formData.preferred_fields.includes(fieldKey) 
                                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                                  : 'hover:bg-slate-100'
                              }`}
                              onClick={() => {
                                const current = formData.preferred_fields;
                                if (current.includes(fieldKey)) {
                                  updateField('preferred_fields', current.filter(f => f !== fieldKey));
                                } else {
                                  updateField('preferred_fields', [...current, fieldKey]);
                                }
                              }}
                            >
                              {field}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Maximum Budget (USD/year)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 30000"
                        value={formData.budget_max}
                        onChange={(e) => updateField('budget_max', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Results */}
              {currentStep === 4 && (
                <div>
                  <Card className="border-0 shadow-lg mb-8">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-emerald-500" />
                        Your Matched Courses
                      </CardTitle>
                      <CardDescription>Based on your profile and preferences</CardDescription>
                    </CardHeader>
                  </Card>

                  {isMatching ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-600">Finding your perfect matches...</p>
                    </div>
                  ) : matchedCourses.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                        <p className="text-slate-500">Try adjusting your preferences</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {matchedCourses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                                  course.matchScore >= 80 ? 'bg-emerald-100 text-emerald-600' :
                                  course.matchScore >= 60 ? 'bg-amber-100 text-amber-600' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {course.matchScore}%
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    <Badge className="bg-emerald-50 text-emerald-700 capitalize">
                                      {course.degree_level}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {course.field_of_study?.replace(/_/g, ' ')}
                                    </Badge>
                                  </div>
                                  <h3 className="text-lg font-bold text-slate-900 mb-1">{course.name}</h3>
                                  {course.university && (
                                    <p className="text-slate-500 flex items-center gap-1 mb-3">
                                      <Building2 className="w-4 h-4" />
                                      {course.university.name} • {course.university.city}, {course.university.country}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {course.eligibility.map((e, i) => (
                                      <span key={i} className={`text-xs flex items-center gap-1 ${
                                        e.type === 'pass' ? 'text-emerald-600' :
                                        e.type === 'fail' ? 'text-red-600' :
                                        'text-amber-600'
                                      }`}>
                                        {e.type === 'pass' ? <CheckCircle2 className="w-3 h-3" /> :
                                         e.type === 'fail' ? <AlertCircle className="w-3 h-3" /> :
                                         <AlertCircle className="w-3 h-3" />}
                                        {e.text}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                                  <Button className="bg-slate-900 hover:bg-slate-800">
                                    View
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>


        </div>
      </div>

      <Footer />
    </div>
  );
}