import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, MessageSquare, FileText, Calendar, RefreshCw,
  CheckCircle, Users, Edit2, Save, X
} from 'lucide-react';
import { toast } from "sonner";

export default function EnhancedLeadScoring({ inquiry, studentProfile }) {
  const [editMode, setEditMode] = useState(false);
  const [manualAdjustment, setManualAdjustment] = useState({ points: 0, notes: '' });
  const queryClient = useQueryClient();

  const { data: engagements = [] } = useQuery({
    queryKey: ['lead-engagements', studentProfile?.id],
    queryFn: () => base44.entities.LeadEngagement.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: previousApplications = [] } = useQuery({
    queryKey: ['previous-apps', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const saveAdjustment = useMutation({
    mutationFn: (data) => base44.entities.StudentProfile.update(studentProfile.id, {
      ...studentProfile,
      lead_score_adjustment: data.points,
      lead_score_notes: data.notes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-profile']);
      setEditMode(false);
      toast.success('Lead score adjusted');
    },
  });

  const calculateLeadScore = () => {
    let score = 0;
    let maxScore = 100;
    let breakdown = [];

    // Contact Information (20 points)
    let contactScore = 0;
    if (inquiry?.email || studentProfile?.email) contactScore += 10;
    if (inquiry?.phone || studentProfile?.phone) contactScore += 10;
    score += contactScore;
    breakdown.push({
      category: 'Contact Details',
      score: contactScore,
      max: 20,
      icon: MessageSquare
    });

    // Specificity of Interest (20 points)
    let specificityScore = 0;
    if (inquiry?.country_of_interest || studentProfile?.preferred_countries?.length) specificityScore += 7;
    if (inquiry?.degree_level || studentProfile?.preferred_degree_level) specificityScore += 7;
    if (inquiry?.field_of_study || studentProfile?.preferred_fields?.length) specificityScore += 6;
    score += specificityScore;
    breakdown.push({
      category: 'Interest Specificity',
      score: specificityScore,
      max: 20,
      icon: FileText
    });

    // Engagement Level (25 points)
    let engagementScore = 0;
    const engagementPoints = engagements.reduce((sum, e) => sum + (e.points || 5), 0);
    engagementScore = Math.min(engagementPoints, 25);
    score += engagementScore;
    breakdown.push({
      category: 'Marketing Engagement',
      score: engagementScore,
      max: 25,
      icon: TrendingUp,
      details: `${engagements.length} activities`
    });

    // Previous Application History (20 points)
    let historyScore = 0;
    if (previousApplications.length > 0) {
      historyScore += 10; // Has applied before
      const enrolledCount = previousApplications.filter(a => a.status === 'enrolled').length;
      if (enrolledCount > 0) historyScore += 10; // Successfully enrolled before
    }
    score += historyScore;
    breakdown.push({
      category: 'Application History',
      score: historyScore,
      max: 20,
      icon: Calendar,
      details: `${previousApplications.length} applications`
    });

    // Referral Source (15 points)
    let referralScore = 0;
    const source = inquiry?.source || studentProfile?.source;
    if (source === 'referral') referralScore = 15;
    else if (source === 'partner') referralScore = 12;
    else if (source === 'event') referralScore = 10;
    else if (source === 'social_media') referralScore = 7;
    else if (source === 'website') referralScore = 5;
    score += referralScore;
    breakdown.push({
      category: 'Referral Source',
      score: referralScore,
      max: 15,
      icon: Users,
      details: source || 'Unknown'
    });

    // Manual Adjustment
    const adjustment = studentProfile?.lead_score_adjustment || 0;
    score += adjustment;

    // Quality tier
    let quality = 'low';
    let qualityColor = 'bg-slate-100 text-slate-700';
    let recommendation = 'Low engagement. Focus on nurturing.';
    
    if (score >= 75) {
      quality = 'hot';
      qualityColor = 'bg-red-100 text-red-700';
      recommendation = 'High-priority lead. Immediate follow-up within 2 hours.';
    } else if (score >= 50) {
      quality = 'warm';
      qualityColor = 'bg-amber-100 text-amber-700';
      recommendation = 'Good potential. Schedule consultation within 24-48 hours.';
    } else if (score >= 25) {
      quality = 'cold';
      qualityColor = 'bg-blue-100 text-blue-700';
      recommendation = 'Moderate interest. Nurture with automated campaigns.';
    }

    return { score, maxScore, breakdown, quality, qualityColor, recommendation, adjustment };
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
            <h4 className="font-semibold text-slate-900">Enhanced Lead Score</h4>
            <p className="text-sm text-slate-500">AI-powered quality assessment</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-900">{result.score}</div>
          <Badge className={result.qualityColor}>{result.quality.toUpperCase()}</Badge>
        </div>
      </div>

      <Progress value={Math.min(result.score, 100)} className="h-3" />

      <div className="space-y-2">
        {result.breakdown.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
            <div className="flex items-center gap-2 flex-1">
              <item.icon className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700">{item.category}</span>
                {item.details && (
                  <p className="text-xs text-slate-500">{item.details}</p>
                )}
              </div>
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

        {/* Manual Adjustment */}
        {editMode ? (
          <Card className="p-3 bg-white border-2 border-purple-300">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  Adjustment Points (+/-)
                </label>
                <Input
                  type="number"
                  value={manualAdjustment.points}
                  onChange={(e) => setManualAdjustment({...manualAdjustment, points: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  Reason for Adjustment
                </label>
                <Textarea
                  value={manualAdjustment.notes}
                  onChange={(e) => setManualAdjustment({...manualAdjustment, notes: e.target.value})}
                  placeholder="Explain the reason..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => saveAdjustment.mutate(manualAdjustment)}
                  disabled={saveAdjustment.isPending}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setEditMode(false);
                    setManualAdjustment({ points: 0, notes: '' });
                  }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-700">Manual Adjustment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {result.adjustment > 0 ? '+' : ''}{result.adjustment}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setEditMode(true)}>
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {studentProfile?.lead_score_notes && !editMode && (
          <div className="p-2 bg-white rounded text-xs text-slate-600 italic">
            "{studentProfile.lead_score_notes}"
          </div>
        )}
      </div>

      <div className="p-3 bg-white border border-purple-200 rounded-lg">
        <h5 className="font-medium text-purple-900 mb-1">AI Recommendation</h5>
        <p className="text-sm text-purple-700">{result.recommendation}</p>
      </div>
    </div>
  );
}