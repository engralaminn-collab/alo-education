import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Loader2, CheckCircle2, Award, 
  TrendingUp, Users, Globe, Star 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyChooseALO({ context = {} }) {
  const [content, setContent] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const generateMutation = useMutation({
    mutationFn: async (contextData) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compelling content writer for ALO Education, a trusted international education consultancy. Generate engaging "Why Choose ALO Education" content.

Context:
${contextData.country ? `- Student interested in: ${contextData.country}` : ''}
${contextData.field ? `- Field of study: ${contextData.field}` : ''}
${contextData.page ? `- Current page: ${contextData.page}` : ''}

ALO Education USPs:
- Founded in February 2023 by Taslima Akter
- Expert counselors with deep knowledge of UK, USA, Australia, Canada, New Zealand, Ireland, and Europe
- Personalized, transparent, and professional guidance
- Strong track record of successful admissions
- End-to-end support from application to enrollment
- Scholarship assistance and financial planning
- Free consultation and no hidden fees

Generate compelling, student-friendly content with:
1. A catchy headline
2. 3-4 unique selling points (specific to context if possible)
3. A brief success story or statistic
4. A motivational closing statement

Make it conversational, inspiring, and specific to the student's context.`,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            selling_points: {
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
            success_insight: { type: "string" },
            closing_statement: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setContent(data);
    }
  });

  React.useEffect(() => {
    // Auto-generate on mount
    generateMutation.mutate(context);
  }, [context.country, context.field, context.page]);

  if (!isVisible) return null;

  if (generateMutation.isPending) {
    return (
      <section className="py-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-alo-orange mx-auto mb-4" />
              <p className="text-slate-600">Generating personalized insights...</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!content) return null;

  const iconMap = {
    award: Award,
    users: Users,
    globe: Globe,
    trending: TrendingUp,
    star: Star,
    check: CheckCircle2,
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-alo-orange rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-education-blue rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* AI Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge className="bg-sunshine/20 text-sunshine border-sunshine/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Insights
            </Badge>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            {content.headline}
          </h2>

          {/* Selling Points */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {content.selling_points?.map((point, index) => {
              const IconComponent = iconMap[point.icon?.toLowerCase()] || CheckCircle2;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
                      <p className="text-slate-300 text-sm">{point.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Success Insight */}
          {content.success_insight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <Card className="bg-gradient-brand border-0">
                <CardContent className="p-8 text-center">
                  <Award className="w-12 h-12 text-white mx-auto mb-4" />
                  <p className="text-xl text-white font-medium">{content.success_insight}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Closing Statement */}
          {content.closing_statement && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xl text-white/90 mt-8 italic"
            >
              "{content.closing_statement}"
            </motion.p>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-8"
          >
            <Button 
              size="lg" 
              className="bg-white text-education-blue hover:bg-slate-100 px-8 h-14 text-lg"
              onClick={() => window.location.href = '/contact'}
            >
              Start Your Journey with ALO
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}