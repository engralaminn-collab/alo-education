import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIEligibilityWidget() {
  const [formData, setFormData] = useState({
    degree: '',
    gpa: '',
    englishScore: '',
    targetDegree: '',
  });
  const [result, setResult] = useState(null);

  const checkEligibility = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Check study eligibility for a student with:
- Current degree: ${formData.degree}
- GPA: ${formData.gpa}
- English test score: ${formData.englishScore}
- Target degree: ${formData.targetDegree}

Provide:
- Eligible: yes/no
- Confidence: high/medium/low
- Recommendations: brief advice
- Required improvements: if any`,
        response_json_schema: {
          type: "object",
          properties: {
            eligible: { type: "boolean" },
            confidence: { type: "string" },
            message: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleCheck = () => {
    if (!formData.degree || !formData.gpa || !formData.englishScore || !formData.targetDegree) {
      return;
    }
    checkEligibility.mutate();
  };

  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-6">
        <Card className="max-w-2xl mx-auto border-2 border-purple-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6" />
              AI Eligibility Checker
            </CardTitle>
            <p className="text-purple-100 text-sm">Get instant eligibility assessment in seconds</p>
          </CardHeader>
          <CardContent className="p-6">
            {!result ? (
              <div className="space-y-4">
                <div>
                  <Label>Current Degree Level</Label>
                  <Select value={formData.degree} onValueChange={(v) => setFormData({...formData, degree: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>GPA / Grade</Label>
                  <Input
                    value={formData.gpa}
                    onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                    placeholder="e.g., 3.5 or B+"
                  />
                </div>

                <div>
                  <Label>English Test Score</Label>
                  <Input
                    value={formData.englishScore}
                    onChange={(e) => setFormData({...formData, englishScore: e.target.value})}
                    placeholder="e.g., IELTS 6.5"
                  />
                </div>

                <div>
                  <Label>Target Degree Level</Label>
                  <Select value={formData.targetDegree} onValueChange={(v) => setFormData({...formData, targetDegree: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleCheck}
                  disabled={checkEligibility.isPending}
                >
                  {checkEligibility.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Check Eligibility
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${
                    result.eligible ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    {result.eligible ? (
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-amber-600" />
                    )}
                    <div>
                      <h4 className={`font-bold text-lg ${
                        result.eligible ? 'text-emerald-900' : 'text-amber-900'
                      }`}>
                        {result.eligible ? 'You are eligible!' : 'Needs improvement'}
                      </h4>
                      <p className="text-sm text-slate-700">{result.message}</p>
                    </div>
                  </div>

                  {result.recommendations?.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2 text-blue-900">Recommendations:</h5>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setResult(null);
                      setFormData({ degree: '', gpa: '', englishScore: '', targetDegree: '' });
                    }}
                  >
                    Check Again
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}