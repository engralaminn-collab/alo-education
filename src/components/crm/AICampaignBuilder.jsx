import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Send, Clock, Zap, TrendingUp, 
  Mail, Calendar, Target, Loader2, CheckCircle, Copy
} from 'lucide-react';
import { toast } from 'sonner';

const scenarioTypes = [
  { value: 'course_inquiry', label: 'Course Inquiry', icon: '📚' },
  { value: 'scholarship_inquiry', label: 'Scholarship Inquiry', icon: '🎓' },
  { value: 'application_status', label: 'Application Status', icon: '📋' },
  { value: 'partnership_proposal', label: 'Partnership Proposal', icon: '🤝' },
  { value: 'deadline_extension', label: 'Deadline Extension', icon: '⏰' },
  { value: 'general_inquiry', label: 'General Inquiry', icon: '💬' }
];

export default function AICampaignBuilder({ students = [], universities = [], courses = [] }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [campaignData, setCampaignData] = useState({
    campaign_name: '',
    scenario_type: 'course_inquiry',
    email_template: '',
    subject_template: '',
    follow_up_sequence: []
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['outreach-campaigns'],
    queryFn: () => base44.entities.OutreachCampaign.list('-created_date')
  });

  const { data: outreaches = [] } = useQuery({
    queryKey: ['university-outreaches'],
    queryFn: () => base44.entities.UniversityOutreach.list()
  });

  const generateCampaignMutation = useMutation({
    mutationFn: async ({ scenario, student, university, course }) => {
      const studentInfo = student ? `
Student: ${student.first_name} ${student.last_name}
Email: ${student.email}
Preferred Study Level: ${student.preferred_degree_level || 'Not specified'}
English Test: ${student.english_proficiency?.test_type || 'Not taken'} ${student.english_proficiency?.overall_score || ''}
Education: ${student.education_history?.[0]?.level || 'Not specified'}
` : '';

      const universityInfo = university ? `
University: ${university.university_name}
Location: ${university.city}, ${university.country}
Ranking: ${university.ranking ? '#' + university.ranking : 'N/A'}
` : '';

      const courseInfo = course ? `
Course: ${course.course_title}
Level: ${course.level}
Duration: ${course.duration}
Tuition: ${course.tuition_fee_min ? 'From £' + course.tuition_fee_min : 'Varies'}
` : '';

      const scenarioDescriptions = {
        course_inquiry: 'inquiring about course availability, entry requirements, and application process',
        scholarship_inquiry: 'requesting information about scholarship opportunities for international students',
        application_status: 'following up on a submitted application status',
        partnership_proposal: 'proposing a recruitment partnership with the university',
        deadline_extension: 'requesting an extension on application deadline',
        general_inquiry: 'general information request about programs and admissions'
      };

      const prompt = `You are an expert education counselor creating a professional university outreach email campaign.

SCENARIO: ${scenarioDescriptions[scenario]}

${studentInfo}
${universityInfo}
${courseInfo}

Generate a complete email campaign with:

1. EMAIL SUBJECT LINE: Professional, clear, compelling (max 60 characters)
2. EMAIL BODY: Formal yet warm, concise (200-300 words), include:
   - Professional greeting
   - Clear purpose statement
   - Specific student details (if applicable)
   - Clear call-to-action
   - Professional closing with ALO Education signature
3. OPTIMAL SEND TIME: Best day of week and time (business hours in university's timezone)
4. FOLLOW-UP SEQUENCE: 2 follow-up emails (at 5 days and 10 days)
   - Each with subject line and brief body
   - Progressive tone (gentle reminder → more urgent)

Make emails professional, respectful, and results-oriented. Use {{student_name}}, {{university_name}}, {{course_name}} as placeholders.

Return JSON with exact structure.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            email_body: { type: 'string' },
            optimal_send_time: {
              type: 'object',
              properties: {
                day_of_week: { type: 'string' },
                hour: { type: 'number' },
                timezone: { type: 'string' },
                reasoning: { type: 'string' }
              }
            },
            follow_ups: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  days_after: { type: 'number' },
                  subject: { type: 'string' },
                  body: { type: 'string' }
                }
              }
            },
            tips: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setCampaignData({
        ...campaignData,
        email_template: data.email_body,
        subject_template: data.subject,
        follow_up_sequence: data.follow_ups?.map(f => ({
          days_after: f.days_after,
          email_template: f.body,
          subject_template: f.subject
        })) || []
      });
      toast.success('AI campaign generated successfully!');
    }
  });

  const analyzeResponsePatternsMutation = useMutation({
    mutationFn: async () => {
      const universityOutreaches = outreaches.filter(o => o.university_id);
      
      const universityStats = {};
      universityOutreaches.forEach(o => {
        if (!universityStats[o.university_id]) {
          universityStats[o.university_id] = {
            total: 0,
            responded: 0,
            avgResponseTime: []
          };
        }
        universityStats[o.university_id].total++;
        if (o.response_received) {
          universityStats[o.university_id].responded++;
          if (o.sent_date && o.response_date) {
            const hours = (new Date(o.response_date) - new Date(o.sent_date)) / (1000 * 60 * 60);
            universityStats[o.university_id].avgResponseTime.push(hours);
          }
        }
      });

      const analysisData = Object.entries(universityStats).map(([uniId, stats]) => {
        const uni = universities.find(u => u.id === uniId);
        const responseRate = stats.total > 0 ? (stats.responded / stats.total * 100).toFixed(1) : 0;
        const avgTime = stats.avgResponseTime.length > 0
          ? (stats.avgResponseTime.reduce((a, b) => a + b, 0) / stats.avgResponseTime.length).toFixed(1)
          : 0;
        
        return {
          university: uni?.university_name || 'Unknown',
          total: stats.total,
          responseRate: parseFloat(responseRate),
          avgResponseTimeHours: parseFloat(avgTime)
        };
      }).sort((a, b) => b.responseRate - a.responseRate);

      const prompt = `Analyze these university response patterns and provide insights:

${JSON.stringify(analysisData, null, 2)}

Provide:
1. TOP PERFORMING UNIVERSITIES: Universities with best response rates
2. OPTIMAL SEND TIMES: Based on response patterns, when should emails be sent?
3. FOLLOW-UP STRATEGY: Optimal timing for follow-ups
4. IMPROVEMENT TIPS: How to increase response rates

Return actionable insights for counselors.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            top_performers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  university: { type: 'string' },
                  response_rate: { type: 'number' },
                  insight: { type: 'string' }
                }
              }
            },
            optimal_timing: {
              type: 'object',
              properties: {
                best_day: { type: 'string' },
                best_hour: { type: 'number' },
                reasoning: { type: 'string' }
              }
            },
            follow_up_strategy: {
              type: 'object',
              properties: {
                first_follow_up_days: { type: 'number' },
                second_follow_up_days: { type: 'number' },
                reasoning: { type: 'string' }
              }
            },
            improvement_tips: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      return response;
    }
  });

  const saveCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.OutreachCampaign.create({
      ...data,
      ai_generated: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-campaigns'] });
      toast.success('Campaign template saved!');
      setCampaignData({
        campaign_name: '',
        scenario_type: 'course_inquiry',
        email_template: '',
        subject_template: '',
        follow_up_sequence: []
      });
    }
  });

  const handleGenerate = () => {
    const student = students.find(s => s.id === selectedStudent);
    const university = universities.find(u => u.id === selectedUniversity);
    const course = courses.find(c => c.id === selectedCourse);

    generateCampaignMutation.mutate({
      scenario: campaignData.scenario_type,
      student,
      university,
      course
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-6 h-6" />
          AI Campaign Builder
        </CardTitle>
        <p className="text-sm text-purple-700">
          Generate personalized email campaigns with AI-powered optimization
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Mail className="w-4 h-4 mr-2" />
              Templates ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Generate Campaign */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Campaign Name</Label>
                <Input
                  value={campaignData.campaign_name}
                  onChange={(e) => setCampaignData({ ...campaignData, campaign_name: e.target.value })}
                  placeholder="e.g., January Intake Course Inquiry"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Scenario Type</Label>
                <Select 
                  value={campaignData.scenario_type}
                  onValueChange={(v) => setCampaignData({ ...campaignData, scenario_type: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioTypes.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.icon} {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Student (Optional)</Label>
                <Select value={selectedStudent || ''} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {students.slice(0, 50).map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>University (Optional)</Label>
                <Select value={selectedUniversity || ''} onValueChange={setSelectedUniversity}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {universities.slice(0, 50).map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.university_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Course (Optional)</Label>
                <Select value={selectedCourse || ''} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {courses.slice(0, 50).map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.course_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateCampaignMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {generateCampaignMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating AI Campaign...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Campaign
                </>
              )}
            </Button>

            {campaignData.email_template && (
              <div className="space-y-6 pt-6 border-t">
                <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-purple-900">Email Subject</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(campaignData.subject_template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">{campaignData.subject_template}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-purple-900">Email Body</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(campaignData.email_template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                      {campaignData.email_template}
                    </pre>
                  </div>
                </div>

                {campaignData.follow_up_sequence?.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="font-bold text-lg text-purple-900 mb-4">Follow-up Sequence</h3>
                    <div className="space-y-4">
                      {campaignData.follow_up_sequence.map((followUp, index) => (
                        <div key={index} className="border-l-4 border-purple-400 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-600 text-white">
                              Day {followUp.days_after}
                            </Badge>
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="font-semibold text-sm mb-1">{followUp.subject_template}</p>
                          <p className="text-sm text-slate-600">{followUp.email_template}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => saveCampaignMutation.mutate(campaignData)}
                    disabled={saveCampaignMutation.isPending || !campaignData.campaign_name}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save as Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generateCampaignMutation.isPending}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Saved Templates */}
          <TabsContent value="templates" className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No templates saved yet</p>
                <p className="text-sm text-slate-500">Generate and save your first campaign template</p>
              </div>
            ) : (
              campaigns.map(campaign => (
                <Card key={campaign.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                          {campaign.campaign_name}
                        </h3>
                        <Badge className="bg-purple-100 text-purple-700">
                          {scenarioTypes.find(s => s.value === campaign.scenario_type)?.label}
                        </Badge>
                      </div>
                      {campaign.response_rate && (
                        <Badge className="bg-green-100 text-green-700">
                          {campaign.response_rate}% Response
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Subject:</p>
                        <p className="text-sm font-medium text-slate-700">{campaign.subject_template}</p>
                      </div>
                      {campaign.follow_up_sequence?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {campaign.follow_up_sequence.length} follow-up emails configured
                        </div>
                      )}
                      {campaign.optimal_send_time && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          Optimal: {campaign.optimal_send_time.day_of_week} at {campaign.optimal_send_time.hour}:00
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCampaignData(campaign);
                          setActiveTab('generate');
                        }}
                        className="flex-1"
                      >
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(campaign.email_template)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Campaigns</p>
                      <p className="text-3xl font-bold text-purple-600">{campaigns.length}</p>
                    </div>
                    <Target className="w-10 h-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Outreaches</p>
                      <p className="text-3xl font-bold text-blue-600">{outreaches.length}</p>
                    </div>
                    <Send className="w-10 h-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Response Rate</p>
                      <p className="text-3xl font-bold text-green-600">
                        {outreaches.length > 0
                          ? Math.round((outreaches.filter(o => o.response_received).length / outreaches.length) * 100)
                          : 0}%
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => analyzeResponsePatternsMutation.mutate()}
              disabled={analyzeResponsePatternsMutation.isPending || outreaches.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {analyzeResponsePatternsMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Response Patterns...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Analyze Response Patterns
                </>
              )}
            </Button>

            {analyzeResponsePatternsMutation.data && (
              <div className="space-y-4 bg-white rounded-xl p-6 border-2 border-blue-200">
                {/* Top Performers */}
                {analyzeResponsePatternsMutation.data.top_performers?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Top Performing Universities
                    </h4>
                    <div className="space-y-2">
                      {analyzeResponsePatternsMutation.data.top_performers.slice(0, 5).map((performer, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-blue-900">{performer.university}</span>
                            <Badge className="bg-green-600 text-white">
                              {performer.response_rate}%
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">{performer.insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimal Timing */}
                {analyzeResponsePatternsMutation.data.optimal_timing && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Optimal Send Time
                    </h4>
                    <p className="text-lg font-semibold text-green-800 mb-2">
                      {analyzeResponsePatternsMutation.data.optimal_timing.best_day} at{' '}
                      {analyzeResponsePatternsMutation.data.optimal_timing.best_hour}:00
                    </p>
                    <p className="text-sm text-green-700">
                      {analyzeResponsePatternsMutation.data.optimal_timing.reasoning}
                    </p>
                  </div>
                )}

                {/* Follow-up Strategy */}
                {analyzeResponsePatternsMutation.data.follow_up_strategy && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recommended Follow-up Strategy
                    </h4>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-purple-800">
                        • First follow-up: {analyzeResponsePatternsMutation.data.follow_up_strategy.first_follow_up_days} days
                      </p>
                      <p className="text-sm text-purple-800">
                        • Second follow-up: {analyzeResponsePatternsMutation.data.follow_up_strategy.second_follow_up_days} days
                      </p>
                    </div>
                    <p className="text-sm text-purple-700">
                      {analyzeResponsePatternsMutation.data.follow_up_strategy.reasoning}
                    </p>
                  </div>
                )}

                {/* Improvement Tips */}
                {analyzeResponsePatternsMutation.data.improvement_tips?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-600" />
                      Improvement Tips
                    </h4>
                    <div className="space-y-2">
                      {analyzeResponsePatternsMutation.data.improvement_tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-amber-900">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}