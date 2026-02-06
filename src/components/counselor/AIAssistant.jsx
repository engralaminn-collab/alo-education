import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Loader, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant({ studentEmail, studentId }) {
  const [activeTab, setActiveTab] = useState('draft');
  const [studentQuery, setStudentQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Draft response mutation
  const draftResponse = useMutation({
    mutationFn: (query) =>
      base44.functions.invoke('draftCounselorResponse', {
        studentEmail,
        studentQuery: query,
        conversationHistory: []
      }),
    onSuccess: () => {
      toast.success('Draft generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate draft response');
    }
  });

  // Summarize profile mutation
  const summarizeProfile = useMutation({
    mutationFn: () =>
      base44.functions.invoke('summarizeStudentProfile', { studentId }),
    onError: () => {
      toast.error('Failed to summarize profile');
    }
  });

  // Suggest courses mutation
  const suggestCourses = useMutation({
    mutationFn: () =>
      base44.functions.invoke('suggestCoursesUniversities', { studentId }),
    onError: () => {
      toast.error('Failed to generate suggestions');
    }
  });

  const handleDraftResponse = () => {
    if (!studentQuery.trim()) {
      toast.error('Please enter a student query');
      return;
    }
    draftResponse.mutate(studentQuery);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('draft')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'draft'
              ? 'border-education-blue text-education-blue'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Draft Response
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'summary'
              ? 'border-education-blue text-education-blue'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Profile Summary
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'suggestions'
              ? 'border-education-blue text-education-blue'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Course Suggestions
        </button>
      </div>

      {/* Draft Response Tab */}
      {activeTab === 'draft' && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Draft Response
            </CardTitle>
            <CardDescription>AI-powered response drafting based on student profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Student Query</label>
              <Textarea
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Enter the student's question or concern..."
                rows={3}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleDraftResponse}
              disabled={draftResponse.isPending || !studentQuery.trim()}
              className="bg-education-blue w-full"
            >
              {draftResponse.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating Draft...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Draft Response
                </>
              )}
            </Button>

            {draftResponse.data && (
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-blue-900">Generated Draft</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(draftResponse.data.draft)}
                      className="h-8"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {draftResponse.data.draft}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  💡 Tip: Review and edit this draft before sending. You can personalize it further to match your style.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Summary Tab */}
      {activeTab === 'summary' && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Profile Summary
            </CardTitle>
            <CardDescription>AI-generated comprehensive student profile analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!summarizeProfile.data ? (
              <Button
                onClick={() => summarizeProfile.mutate()}
                disabled={summarizeProfile.isPending}
                className="bg-education-blue w-full"
              >
                {summarizeProfile.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Profile Summary
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{summarizeProfile.data.student_name}</h4>
                    <p className="text-sm text-gray-600">Profile Completeness: {summarizeProfile.data.profile_completeness}%</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      summarizeProfile.reset();
                      summarizeProfile.mutate();
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{summarizeProfile.data.summary}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Course & University Suggestions
            </CardTitle>
            <CardDescription>AI-powered recommendations based on student profile and goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!suggestCourses.data ? (
              <Button
                onClick={() => suggestCourses.mutate()}
                disabled={suggestCourses.isPending}
                className="bg-education-blue w-full"
              >
                {suggestCourses.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Course Suggestions
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {suggestCourses.data.insights && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-blue-900 mb-2">Key Insights</h4>
                    <p className="text-sm text-blue-800">{suggestCourses.data.insights}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Top Recommendations</h4>
                  {suggestCourses.data.recommendations && suggestCourses.data.recommendations.length > 0 ? (
                    suggestCourses.data.recommendations.slice(0, 5).map((rec, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{rec.course_title}</h5>
                            <p className="text-sm text-gray-600">{rec.university_name}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {rec.match_score}% match
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{rec.why_recommended}</p>

                        <div className="flex flex-wrap gap-2">
                          {rec.match_reasons && rec.match_reasons.map((reason, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recommendations available</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    suggestCourses.reset();
                    suggestCourses.mutate();
                  }}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Suggestions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}