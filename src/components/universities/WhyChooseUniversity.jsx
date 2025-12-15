import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyChooseUniversity({ university, studentProfile }) {
  const [analysis, setAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (university && studentProfile) {
      generateAnalysis();
    }
  }, [university?.id, studentProfile?.id]);

  const generateAnalysis = async () => {
    if (!university || !studentProfile) return;

    setIsGenerating(true);

    try {
      const prompt = `Analyze why ${university.university_name} would be an excellent choice for this student based on their profile.

University Information:
- Name: ${university.university_name}
- Country: ${university.country}
- City: ${university.city}
- Type: ${university.university_type}
- Ranking: ${university.ranking || 'Not specified'}
- About: ${university.about || 'Top university'}
- International Students: ${university.international_students_percent || 'N/A'}%

Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Nationality: ${studentProfile.nationality}
- Education: ${studentProfile.education_history?.[0]?.academic_level} in ${studentProfile.education_history?.[0]?.group_subject}
- GPA: ${studentProfile.education_history?.[0]?.result_value}
- English: ${studentProfile.english_proficiency?.test_type} ${studentProfile.english_proficiency?.overall_score || ''}
- Study Destination Preference: ${studentProfile.admission_preferences?.study_destination}
- Study Area: ${studentProfile.admission_preferences?.study_area}
- Career Goals: ${studentProfile.admission_preferences?.course_alignment || 'Not specified'}
- Work Experience: ${studentProfile.work_experience?.length || 0} positions

Generate a personalized analysis explaining why this university is a great match for this student. Include:
1. Academic fit (how their background aligns with the university)
2. Career advancement opportunities
3. Location and lifestyle benefits
4. Cultural and social opportunities
5. Any standout features relevant to their goals

Be specific, persuasive, and encouraging. Focus on tangible benefits.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            summary: { type: "string" },
            key_reasons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  icon: { type: "string" }
                }
              }
            },
            personal_note: { type: "string" }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      console.error('Failed to generate analysis:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!studentProfile) {
    return null;
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Why Choose {university.university_name}?
            <span className="text-xs font-normal text-purple-600 ml-2">Personalized for you</span>
          </CardTitle>
          {analysis && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateAnalysis}
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-purple-700">Analyzing your profile...</p>
            </div>
          </div>
        ) : analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">{analysis.headline}</h3>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {analysis.key_reasons?.map((reason, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-lg p-4 border border-purple-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{reason.title}</h4>
                      <p className="text-sm text-slate-600">{reason.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {analysis.personal_note && (
              <div className="bg-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-900 italic">
                  <span className="font-semibold">Personal Note:</span> {analysis.personal_note}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <Button
              onClick={generateAnalysis}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Personalized Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}