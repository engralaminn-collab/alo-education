import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function AIReviewAnalysis({ reviews, type = 'university' }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reviews && reviews.length >= 3 && !analysis) {
      generateAnalysis();
    }
  }, [reviews?.length]);

  const generateAnalysis = async () => {
    if (!reviews || reviews.length < 3) return;

    setIsLoading(true);

    try {
      const reviewTexts = reviews.map(r => ({
        rating: r.rating,
        title: r.review_title || '',
        text: r.review_text,
        pros: r.pros || [],
        cons: r.cons || [],
        would_recommend: r.would_recommend
      }));

      const prompt = `Analyze these ${type} reviews and provide insights:

Reviews: ${JSON.stringify(reviewTexts.slice(0, 20), null, 2)}

Provide:
1. Overall sentiment (positive/mixed/negative)
2. Sentiment score (0-100)
3. Top 5 key pros mentioned across reviews
4. Top 5 key cons mentioned across reviews
5. Common themes
6. Recommendation summary (1-2 sentences)

Be accurate and data-driven.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["positive", "mixed", "negative"]
            },
            sentiment_score: { type: "number" },
            key_pros: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  point: { type: "string" },
                  frequency: { type: "string" }
                }
              }
            },
            key_cons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  point: { type: "string" },
                  frequency: { type: "string" }
                }
              }
            },
            themes: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      console.error('Failed to generate analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (reviews?.length < 3) {
    return (
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">AI analysis available with 3+ reviews</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600">Analyzing reviews with AI...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Button onClick={generateAnalysis} className="bg-indigo-600 hover:bg-indigo-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sentimentColors = {
    positive: 'bg-green-100 text-green-700 border-green-200',
    mixed: 'bg-amber-100 text-amber-700 border-amber-200',
    negative: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Review Analysis
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={generateAnalysis} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sentiment */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
          <div>
            <div className="text-sm text-slate-600 mb-1">Overall Sentiment</div>
            <Badge className={`${sentimentColors[analysis.sentiment]} border-2 text-base px-3 py-1`}>
              {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600 mb-1">Score</div>
            <div className="text-3xl font-bold text-indigo-600">{analysis.sentiment_score}/100</div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-white rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
          <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Key Pros */}
        {analysis.key_pros?.length > 0 && (
          <div className="p-4 bg-white rounded-lg">
            <div className="flex items-center gap-2 font-semibold text-green-700 mb-3">
              <TrendingUp className="w-5 h-5" />
              Top Strengths
            </div>
            <div className="space-y-2">
              {analysis.key_pros.map((pro, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 font-medium">{pro.point}</div>
                    <div className="text-xs text-slate-600">{pro.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Cons */}
        {analysis.key_cons?.length > 0 && (
          <div className="p-4 bg-white rounded-lg">
            <div className="flex items-center gap-2 font-semibold text-red-700 mb-3">
              <TrendingDown className="w-5 h-5" />
              Areas for Improvement
            </div>
            <div className="space-y-2">
              {analysis.key_cons.map((con, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 font-medium">{con.point}</div>
                    <div className="text-xs text-slate-600">{con.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Themes */}
        {analysis.themes?.length > 0 && (
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-3">Common Themes</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.themes.map((theme, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}