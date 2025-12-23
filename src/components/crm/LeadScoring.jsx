import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, User, FileText, MessageSquare, CheckCircle
} from 'lucide-react';

export default function LeadScoring({ inquiry, studentProfile }) {
  const calculateLeadScore = () => {
    let score = 0;
    let maxScore = 100;
    let breakdown = [];

    // Contact Information (40 points)
    let contactScore = 0;
    if (inquiry?.email) contactScore += 20;
    if (inquiry?.phone) contactScore += 20;
    score += contactScore;
    breakdown.push({
      category: 'Contact Details',
      score: contactScore,
      max: 40,
      icon: MessageSquare
    });

    // Specificity of Interest (35 points)
    let specificityScore = 0;
    if (inquiry?.country_of_interest) specificityScore += 12;
    if (inquiry?.degree_level) specificityScore += 12;
    if (inquiry?.field_of_study) specificityScore += 11;
    score += specificityScore;
    breakdown.push({
      category: 'Interest Specificity',
      score: specificityScore,
      max: 35,
      icon: FileText
    });

    // Engagement Level (25 points)
    let engagementScore = 0;
    if (inquiry?.message && inquiry.message.length > 100) engagementScore += 15;
    else if (inquiry?.message && inquiry.message.length > 50) engagementScore += 10;
    else if (inquiry?.message) engagementScore += 5;
    
    if (inquiry?.status === 'contacted') engagementScore += 10;
    
    score += engagementScore;
    breakdown.push({
      category: 'Engagement',
      score: engagementScore,
      max: 25,
      icon: TrendingUp
    });

    // Determine quality tier
    let quality = 'low';
    let qualityColor = 'bg-slate-100 text-slate-700';
    let recommendation = 'Low engagement. Focus on profile completion first.';
    
    if (score >= 75) {
      quality = 'hot';
      qualityColor = 'bg-red-100 text-red-700';
      recommendation = 'High-priority lead. Immediate follow-up recommended within 2 hours.';
    } else if (score >= 50) {
      quality = 'warm';
      qualityColor = 'bg-amber-100 text-amber-700';
      recommendation = 'Good potential. Schedule consultation within 24-48 hours.';
    } else if (score >= 25) {
      quality = 'cold';
      qualityColor = 'bg-blue-100 text-blue-700';
      recommendation = 'Moderate interest. Nurture with automated email campaign.';
    }

    return { score, maxScore, breakdown, quality, qualityColor, recommendation };
  };

  const result = calculateLeadScore();

  return (
    <div className="space-y-4 p-4 border border-purple-200 bg-purple-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">AI Lead Score</h4>
            <p className="text-sm text-slate-500">Quality assessment</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-900">{result.score}</div>
          <Badge className={result.qualityColor}>{result.quality.toUpperCase()}</Badge>
        </div>
      </div>

      <Progress value={result.score} className="h-3" />

      <div className="space-y-2">
        {result.breakdown.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
            <div className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{item.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {item.score}/{item.max}
              </span>
              {item.score === item.max && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-white border border-purple-200 rounded-lg">
        <h5 className="font-medium text-purple-900 mb-1">AI Recommendation</h5>
        <p className="text-sm text-purple-700">{result.recommendation}</p>
      </div>
    </div>
  );
}