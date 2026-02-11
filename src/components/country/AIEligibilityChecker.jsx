import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AIEligibilityChecker({ country }) {
  const [formData, setFormData] = useState({
    education_level: '',
    gpa: '',
    ielts_score: '',
    desired_level: '',
  });
  const [result, setResult] = useState(null);

  const checkEligibility = useMutation({
    mutationFn: async (data) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an education counselor for ${country}. A student has the following profile:
- Current Education: ${data.education_level}
- GPA: ${data.gpa}
- IELTS Score: ${data.ielts_score}
- Desired Level: ${data.desired_level}

Analyze their eligibility for studying in ${country}. Provide:
1. Overall eligibility status (Excellent/Good/Fair/Needs Improvement)
2. Specific requirements they meet
3. Areas needing improvement
4. Recommended next steps
5. Estimated chances (percentage)`,
        response_json_schema: {
          type: "object",
          properties: {
            eligibility_status: { type: "string" },
            eligible: { type: "boolean" },
            chance_percentage: { type: "number" },
            requirements_met: { type: "array", items: { type: "string" } },
            improvements_needed: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } },
            personalized_advice: { type: "string" }
          }
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: () => {
      toast.error('Failed to check eligibility');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.education_level || !formData.gpa || !formData.ielts_score || !formData.desired_level) {
      toast.error('Please fill in all fields');
      return;
    }
    checkEligibility.mutate(formData);
  };

  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              AI Eligibility Checker
            </h2>
            <p className="text-lg text-slate-600">
              Get instant AI-powered analysis of your eligibility for {country}
            </p>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              {!result ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Current Education Level *</Label>
                      <Select value={formData.education_level} onValueChange={(v) => setFormData({...formData, education_level: v})}>
                        <SelectTrigger className="h-12 mt-2">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hsc">HSC / A-Level</SelectItem>
                          <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="master">Master's Degree</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>GPA / Percentage *</Label>
                      <Input
                        type="text"
                        placeholder="e.g., 3.5 or 75%"
                        value={formData.gpa}
                        onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                        className="h-12 mt-2"
                      />
                    </div>

                    <div>
                      <Label>IELTS Score (Overall) *</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        placeholder="e.g., 6.5"
                        value={formData.ielts_score}
                        onChange={(e) => setFormData({...formData, ielts_score: e.target.value})}
                        className="h-12 mt-2"
                      />
                    </div>

                    <div>
                      <Label>Desired Study Level *</Label>
                      <Select value={formData.desired_level} onValueChange={(v) => setFormData({...formData, desired_level: v})}>
                        <SelectTrigger className="h-12 mt-2">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={checkEligibility.isPending}
                  >
                    {checkEligibility.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Your Profile...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Check My Eligibility
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Status */}
                  <div className={`p-6 rounded-2xl ${
                    result.eligible ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-amber-50 border-2 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {result.eligible ? (
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-amber-600" />
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {result.eligibility_status}
                        </h3>
                        <p className="text-lg font-semibold text-slate-700">
                          Eligibility Chance: {result.chance_percentage}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements Met */}
                  {result.requirements_met?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        Requirements You Meet
                      </h4>
                      <ul className="space-y-2">
                        {result.requirements_met.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <span className="text-emerald-600 mt-1">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements Needed */}
                  {result.improvements_needed?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {result.improvements_needed.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <span className="text-amber-600 mt-1">!</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {result.next_steps?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-600" />
                        Recommended Next Steps
                      </h4>
                      <ol className="space-y-2">
                        {result.next_steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-700">
                            <span className="font-bold text-blue-600 mt-0.5">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Personalized Advice */}
                  {result.personalized_advice && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <h4 className="font-semibold text-blue-900 mb-2">Personalized Advice</h4>
                      <p className="text-slate-700">{result.personalized_advice}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setResult(null);
                        setFormData({ education_level: '', gpa: '', ielts_score: '', desired_level: '' });
                      }}
                      className="flex-1"
                    >
                      Check Again
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                      Book Counselling
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}