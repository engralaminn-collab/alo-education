import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Clock, TrendingUp, Mail, Target, Calendar, Zap, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AICampaignCreator() {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    outreachType: 'course_inquiry',
    objective: '',
    studentCriteria: {
      nationality: '',
      preferredCountries: [],
      preferredLevel: ''
    },
    universityCriteria: {
      countries: [],
      ranking: ''
    },
    targetUniversities: []
  });
  const [generatedCampaign, setGeneratedCampaign] = useState(null);

  const queryClient = useQueryClient();

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list()
  });

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateOutreachCampaign', data);
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedCampaign(data);
      setStep(2);
      queryClient.invalidateQueries({ queryKey: ['outreach-campaigns'] });
      toast.success('Campaign generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate campaign: ' + error.message);
    }
  });

  const handleGenerate = () => {
    if (!campaignData.objective) {
      toast.error('Please enter campaign objective');
      return;
    }
    generateMutation.mutate(campaignData);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (step === 1) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <CardTitle>AI Campaign Creator</CardTitle>
          </div>
          <CardDescription>
            Let AI design the perfect university outreach campaign based on your criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Outreach Type */}
          <div>
            <Label>Outreach Type</Label>
            <Select
              value={campaignData.outreachType}
              onValueChange={(v) => setCampaignData({ ...campaignData, outreachType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course_inquiry">Course Inquiry</SelectItem>
                <SelectItem value="scholarship_inquiry">Scholarship Inquiry</SelectItem>
                <SelectItem value="partnership_proposal">Partnership Proposal</SelectItem>
                <SelectItem value="application_status">Application Status</SelectItem>
                <SelectItem value="deadline_extension">Deadline Extension</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Objective */}
          <div>
            <Label>Campaign Objective *</Label>
            <Textarea
              placeholder="E.g., Secure partnerships with top UK universities for our Bangladeshi students interested in engineering programs..."
              value={campaignData.objective}
              onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
              className="h-24"
            />
          </div>

          {/* Student Criteria */}
          <div className="space-y-3 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Target Student Profile
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nationality</Label>
                <Input
                  placeholder="e.g., Bangladesh"
                  value={campaignData.studentCriteria.nationality}
                  onChange={(e) => setCampaignData({
                    ...campaignData,
                    studentCriteria: { ...campaignData.studentCriteria, nationality: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label className="text-xs">Preferred Level</Label>
                <Select
                  value={campaignData.studentCriteria.preferredLevel}
                  onValueChange={(v) => setCampaignData({
                    ...campaignData,
                    studentCriteria: { ...campaignData.studentCriteria, preferredLevel: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any Level</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* University Criteria */}
          <div className="space-y-3 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Target Universities
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Countries</Label>
                <Select
                  onValueChange={(v) => {
                    const current = campaignData.universityCriteria.countries;
                    if (!current.includes(v)) {
                      setCampaignData({
                        ...campaignData,
                        universityCriteria: { ...campaignData.universityCriteria, countries: [...current, v] }
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 flex-wrap mt-2">
                  {campaignData.universityCriteria.countries.map(c => (
                    <Badge key={c} variant="secondary" className="gap-1">
                      {c}
                      <button
                        onClick={() => setCampaignData({
                          ...campaignData,
                          universityCriteria: {
                            ...campaignData.universityCriteria,
                            countries: campaignData.universityCriteria.countries.filter(x => x !== c)
                          }
                        })}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Ranking Preference</Label>
                <Select
                  value={campaignData.universityCriteria.ranking}
                  onValueChange={(v) => setCampaignData({
                    ...campaignData,
                    universityCriteria: { ...campaignData.universityCriteria, ranking: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Ranking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any Ranking</SelectItem>
                    <SelectItem value="top100">Top 100</SelectItem>
                    <SelectItem value="top200">Top 200</SelectItem>
                    <SelectItem value="top500">Top 500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {generateMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Campaign...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 2 && generatedCampaign) {
    const { campaign, analysis, matching_students, target_universities_count } = generatedCampaign;

    return (
      <div className="space-y-4">
        {/* Header */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle>{analysis.campaign_name}</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Create New Campaign
              </Button>
            </div>
            <CardDescription className="flex gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {matching_students} students
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {target_universities_count} universities
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {analysis.success_metrics?.expected_response_rate}% expected response
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Campaign Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Target Audience</h4>
              <p className="text-sm text-slate-600">{analysis.target_audience}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Strategy</h4>
              <p className="text-sm text-slate-600">{analysis.strategy}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Key Messaging Points</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.key_messaging?.map((msg, i) => (
                  <li key={i} className="text-sm text-slate-600">{msg}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Sequence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="initial">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="initial">Initial Email</TabsTrigger>
                <TabsTrigger value="followup1">Follow-up 1</TabsTrigger>
                <TabsTrigger value="followup2">Follow-up 2</TabsTrigger>
              </TabsList>

              <TabsContent value="initial" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-semibold">Subject Line</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.email_templates.initial.subject)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-100 rounded text-sm">
                    {analysis.email_templates.initial.subject}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-semibold">Email Body</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.email_templates.initial.body)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-100 rounded text-sm whitespace-pre-wrap">
                    {analysis.email_templates.initial.body}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="followup1" className="space-y-4 mt-4">
                <Badge variant="outline" className="mb-2">
                  Send after {analysis.email_templates.follow_up_1.days_after || 7} days if no response
                </Badge>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-semibold">Subject Line</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.email_templates.follow_up_1.subject)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-100 rounded text-sm">
                    {analysis.email_templates.follow_up_1.subject}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-semibold">Email Body</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.email_templates.follow_up_1.body)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-100 rounded text-sm whitespace-pre-wrap">
                    {analysis.email_templates.follow_up_1.body}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="followup2" className="space-y-4 mt-4">
                <Badge variant="outline" className="mb-2">
                  Send after {analysis.email_templates.follow_up_2.days_after || 14} days if no response
                </Badge>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-semibold">Subject Line</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.email_templates.follow_up_2.subject)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-100 rounded text-sm">
                    {analysis.email_templates.follow_up_2.subject}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-semibold">Email Body</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.email_templates.follow_up_2.body)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-100 rounded text-sm whitespace-pre-wrap">
                    {analysis.email_templates.follow_up_2.body}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Optimal Timing & Success Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Optimal Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                <span className="text-sm font-medium">Best Day</span>
                <Badge>{analysis.optimal_timing.day_of_week}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                <span className="text-sm font-medium">Best Time</span>
                <Badge>{analysis.optimal_timing.hour}:00 {analysis.optimal_timing.timezone}</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-2">{analysis.optimal_timing.rationale}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="text-sm font-medium">Expected Response Rate</span>
                <Badge className="bg-green-600">{analysis.success_metrics?.expected_response_rate}%</Badge>
              </div>
              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Key Indicators</Label>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.success_metrics?.key_indicators?.map((indicator, i) => (
                    <li key={i} className="text-xs text-slate-600">{indicator}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* A/B Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">A/B Testing Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 border rounded bg-blue-50">
                <Badge variant="outline" className="mb-2">Variation A</Badge>
                <p className="text-sm">{analysis.ab_testing?.subject_variation_a}</p>
              </div>
              <div className="p-3 border rounded bg-green-50">
                <Badge variant="outline" className="mb-2">Variation B</Badge>
                <p className="text-sm">{analysis.ab_testing?.subject_variation_b}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">{analysis.ab_testing?.testing_strategy}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}