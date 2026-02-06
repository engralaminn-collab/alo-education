import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, FileText, CheckCircle2, Loader2, Mail, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function StudentUniversityMatcher({ studentId, studentName }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [draftingEmail, setDraftingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(null);

  const findUniversities = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('findUniversitiesForStudent', {
        studentId
      });

      setRecommendations(response.data.recommendations);
      toast.success('Found ' + response.data.recommendations.length + ' matching universities');
    } catch (error) {
      toast.error('Failed to find universities: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const draftOutreachEmail = async (rec) => {
    setDraftingEmail(true);
    setSelectedUniversity(rec.university_id);
    try {
      const response = await base44.functions.invoke('draftUniversityOutreach', {
        studentId,
        universityId: rec.university_id,
        programs: rec.recommended_programs,
        reasons: rec.reasons
      });

      setEmailDraft(response.data);
      toast.success('Email drafted successfully');
    } catch (error) {
      toast.error('Failed to draft email: ' + error.message);
    } finally {
      setDraftingEmail(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  const getProbabilityColor = (prob) => {
    if (prob.toLowerCase().includes('high')) return 'bg-green-600';
    if (prob.toLowerCase().includes('moderate')) return 'bg-amber-600';
    return 'bg-slate-600';
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-6 h-6" />
            AI University Matcher & Outreach
          </CardTitle>
          <p className="text-sm text-purple-700 mt-2">
            Automatically find best-fit universities and draft personalized outreach emails
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={findUniversities}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Profile & Matching Universities...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Find Best Universities for {studentName}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top {recommendations.length} University Matches
          </h3>

          {recommendations.map((rec, idx) => (
            <Card key={rec.university_id} className="border-l-4 border-l-purple-600">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      #{idx + 1} - {rec.university?.university_name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {rec.university?.city}, {rec.university?.country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getScoreColor(rec.match_score)} border`}>
                      {rec.match_score}% Match
                    </Badge>
                    <Badge className={getProbabilityColor(rec.admission_probability)}>
                      {rec.admission_probability}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reasons */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Why This University:</p>
                  <ul className="space-y-1">
                    {rec.reasons.map((reason, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Programs */}
                {rec.recommended_programs?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Recommended Programs:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.recommended_programs.map((prog, i) => (
                        <Badge key={i} variant="outline" className="bg-white">
                          {prog}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <Button
                  onClick={() => draftOutreachEmail(rec)}
                  disabled={draftingEmail && selectedUniversity === rec.university_id}
                  className="bg-purple-600 hover:bg-purple-700 w-full mt-4"
                >
                  {draftingEmail && selectedUniversity === rec.university_id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Drafting Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Draft Outreach Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Email Draft */}
      {emailDraft && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <FileText className="w-6 h-6" />
              Email Draft Ready
            </CardTitle>
            <p className="text-sm text-green-700 mt-1">
              To: {emailDraft.recipient_name} ({emailDraft.recipient})
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs font-semibold text-slate-500 mb-1">Subject:</p>
              <p className="text-sm font-medium text-slate-900">{emailDraft.subject}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">Email Body:</p>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                {emailDraft.body}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-700 bg-white rounded-lg p-3 border border-green-200">
              <CheckCircle2 className="w-4 h-4" />
              Follow up in {emailDraft.follow_up_days} days if no response
            </div>

            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700 flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="flex-1">
                Edit Draft
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Draft saved to University Outreach records (ID: {emailDraft.outreach_id})
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}