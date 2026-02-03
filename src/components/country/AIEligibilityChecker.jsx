import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIEligibilityChecker({ country }) {
  const [formData, setFormData] = useState({
    education_level: '',
    gpa: '',
    english_test: '',
    english_score: '',
    budget: '',
    preferred_field: ''
  });
  const [result, setResult] = useState(null);

  const checkEligibility = useMutation({
    mutationFn: async (data) => {
      const prompt = `As a study abroad counselor, assess this student's eligibility for studying in ${country}:

Education: ${data.education_level}
GPA: ${data.gpa}/4.0
English Test: ${data.english_test} - Score: ${data.english_score}
Budget: $${data.budget}/year
Preferred Field: ${data.preferred_field}

Provide:
1. Overall eligibility (high/medium/low)
2. Matching universities (3-5 names)
3. Estimated acceptance chance percentage
4. Required improvements if any
5. Next steps recommendation

Return as JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            eligibility: { type: "string" },
            matching_universities: { type: "array", items: { type: "string" } },
            acceptance_chance: { type: "number" },
            improvements: { type: "array", items: { type: "string" } },
            next_steps: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Eligibility assessment complete');
    },
    onError: () => {
      toast.error('Failed to assess eligibility');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.education_level || !formData.gpa || !formData.english_test) {
      toast.error('Please fill in all required fields');
      return;
    }
    checkEligibility.mutate(formData);
  };

  const eligibilityColors = {
    high: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    medium: 'bg-amber-100 text-amber-700 border-amber-300',
    low: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <Card className="max-w-4xl mx-auto border-2 border-purple-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Sparkles className="w-7 h-7" />
              AI Eligibility Checker for {country}
            </CardTitle>
            <p className="text-purple-100 mt-2">Get instant AI-powered assessment of your eligibility</p>
          </CardHeader>
          <CardContent className="p-8">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Education Level *</Label>
                    <Select value={formData.education_level} onValueChange={(v) => setFormData({...formData, education_level: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>GPA / Grade *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      max="4"
                      placeholder="e.g., 3.5"
                      value={formData.gpa}
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>English Test *</Label>
                    <Select value={formData.english_test} onValueChange={(v) => setFormData({...formData, english_test: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IELTS">IELTS</SelectItem>
                        <SelectItem value="TOEFL">TOEFL</SelectItem>
                        <SelectItem value="PTE">PTE</SelectItem>
                        <SelectItem value="Duolingo">Duolingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Test Score *</Label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="e.g., 6.5 for IELTS"
                      value={formData.english_score}
                      onChange={(e) => setFormData({...formData, english_score: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Annual Budget (USD)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 30000"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Preferred Field</Label>
                    <Input
                      placeholder="e.g., Computer Science"
                      value={formData.preferred_field}
                      onChange={(e) => setFormData({...formData, preferred_field: e.target.value})}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={checkEligibility.isPending}
                >
                  {checkEligibility.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Your Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Check My Eligibility
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Eligibility Status */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <Badge className={`${eligibilityColors[result.eligibility?.toLowerCase()]} text-lg px-6 py-2 mb-3`}>
                    {result.eligibility?.toUpperCase()} ELIGIBILITY
                  </Badge>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    {result.acceptance_chance}%
                  </div>
                  <p className="text-slate-600">Estimated Acceptance Chance</p>
                </div>

                {/* Matching Universities */}
                {result.matching_universities?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Matching Universities
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {result.matching_universities.map((uni, i) => (
                        <div key={i} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="font-medium text-slate-900">{uni}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements Needed */}
                {result.improvements?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {result.improvements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-amber-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <h3 className="font-bold text-blue-900 mb-2">Recommended Next Steps</h3>
                  <p className="text-blue-800 text-sm">{result.next_steps}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={() => setResult(null)} variant="outline" className="flex-1">
                    Check Again
                  </Button>
                  <Link to={createPageUrl('Contact')} className="flex-1">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      Book Free Counselling
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}