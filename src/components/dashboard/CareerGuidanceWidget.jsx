import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CareerGuidanceWidget() {
  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5" />
          AI Career Path Guidance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 mb-4 text-sm">
          Discover your ideal study path with AI-powered recommendations tailored to your interests, background, and career goals
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Personalized course recommendations</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Career trajectory insights</span>
          </div>
        </div>
        <Link to={createPageUrl('CareerGuidance')}>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            Get Career Guidance
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}