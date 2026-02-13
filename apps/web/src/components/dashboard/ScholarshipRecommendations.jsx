import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ScholarshipRecommendations() {
  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          Scholarship Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">AI-Powered Matching</h4>
            <p className="text-sm text-slate-600">
              Get personalized scholarship recommendations based on your profile, with match scores and application tips.
            </p>
          </div>
        </div>

        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Link to={createPageUrl('ScholarshipFinder')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Find My Scholarships
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}