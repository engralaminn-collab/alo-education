import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Award, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyThisCourse({ course, university, studentProfile }) {
  const [aiReason, setAiReason] = useState(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentProfile) return;
      
      const msgs = await base44.entities.Message.filter({ 
        sender_id: studentProfile.id 
      }, '-created_date', 10);
      setMessages(msgs);

      const apps = await base44.entities.Application.filter({ 
        student_id: studentProfile.id 
      });
      setApplications(apps);
    };

    fetchData();
  }, [studentProfile?.id]);

  useEffect(() => {
    if (!course || !studentProfile) {
      setLoading(false);
      return;
    }
    generateReasons();
  }, [course?.id, studentProfile?.id, messages.length]);

  const generateReasons = async () => {
    setLoading(true);
    try {
      const recentMessages = messages.slice(0, 3).map(m => m.content).join('; ');
      const previousApps = applications.map(a => a.status).join(', ');

      const prompt = `As an education counselor, explain why "${course.course_title}" at ${university?.university_name || 'this university'} would be a great fit for this student:

Student Profile:
- Preferred fields: ${studentProfile.preferred_fields?.join(', ') || 'Not specified'}
- Budget: ${studentProfile.budget_min || 0} - ${studentProfile.budget_max || 0} ${studentProfile.budget_currency || 'USD'}
- Work experience: ${studentProfile.work_experience_years || 0} years
- Education: ${studentProfile.education?.highest_degree || 'Not specified'} in ${studentProfile.education?.field_of_study || 'Not specified'}
- GPA: ${studentProfile.education?.gpa || 'Not specified'}/${studentProfile.education?.gpa_scale || 4.0}
- English: ${studentProfile.english_proficiency?.test_type || 'Not specified'} ${studentProfile.english_proficiency?.score || ''}
- Recent communication: ${recentMessages || 'No messages'}
- Previous applications: ${previousApps || 'None'}
- Counselor notes: ${studentProfile.notes || 'None'}

Course Details:
- Title: ${course.course_title}
- Level: ${course.level}
- Subject: ${course.subject_area}
- Country: ${course.country}
- Duration: ${course.duration}
- Tuition: ${course.tuition_fee_min} - ${course.tuition_fee_max} ${course.currency}
- Scholarship Available: ${course.scholarship_available ? 'Yes' : 'No'}

Respond with a JSON object containing:
{
  "match_percentage": number (0-100),
  "key_benefits": [string array of 3-4 benefits],
  "career_prospects": string (1 sentence),
  "similar_success": string (describe similar successful students if applicable)
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            match_percentage: { type: 'number' },
            key_benefits: { type: 'array', items: { type: 'string' } },
            career_prospects: { type: 'string' },
            similar_success: { type: 'string' }
          }
        }
      });

      setAiReason(result);
    } catch (error) {
      console.error('Failed to generate reasons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!studentProfile) {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Analyzing course fit...</p>
        </CardContent>
      </Card>
    );
  }

  if (!aiReason) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Why This Course is Perfect for You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Match Score */}
          <div className="p-4 bg-white rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Match Score</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-3xl font-bold text-purple-600">
                  {aiReason.match_percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Key Benefits for You
            </h4>
            <div className="space-y-2">
              {aiReason.key_benefits?.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                  <Badge className="shrink-0 mt-0.5" style={{ backgroundColor: '#F7941D', color: 'white' }}>
                    {index + 1}
                  </Badge>
                  <p className="text-slate-700 text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Career Prospects */}
          {aiReason.career_prospects && (
            <div className="p-4 bg-white rounded-xl">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Career Prospects
              </h4>
              <p className="text-slate-700 text-sm">{aiReason.career_prospects}</p>
            </div>
          )}

          {/* Similar Success */}
          {aiReason.similar_success && (
            <div className="p-4 bg-purple-100 rounded-xl border border-purple-300">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Similar Student Success
              </h4>
              <p className="text-purple-800 text-sm">{aiReason.similar_success}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}