import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TestPrepProgress({ studentProfile }) {
  const englishTest = studentProfile?.english_proficiency;
  
  const testModules = [
    { name: 'IELTS', icon: BookOpen, status: englishTest?.test_type === 'IELTS' ? 'completed' : 'pending' },
    { name: 'PTE', icon: BookOpen, status: englishTest?.test_type === 'PTE' ? 'completed' : 'pending' },
    { name: 'OIETC', icon: BookOpen, status: englishTest?.test_type?.includes('OIETC') ? 'completed' : 'pending' },
    { name: 'Duolingo', icon: BookOpen, status: englishTest?.test_type?.includes('Duolingo') ? 'completed' : 'pending' },
  ];

  const completedModules = testModules.filter(m => m.status === 'completed').length;
  const progressPercentage = (completedModules / testModules.length) * 100;

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <BookOpen className="w-5 h-5" />
          Test Preparation Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {englishTest?.has_test ? (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" style={{ color: '#0066CC' }} />
                <h3 className="font-semibold" style={{ color: '#0066CC' }}>
                  {englishTest.test_type}
                </h3>
              </div>
              <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Overall Score</p>
                <p className="font-bold text-lg" style={{ color: '#F37021' }}>
                  {englishTest.overall_score}
                </p>
              </div>
              {englishTest.test_date && (
                <div>
                  <p className="text-slate-600">Test Date</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(englishTest.test_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {englishTest.listening && (
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-slate-600">Listening</p>
                  <p className="font-bold" style={{ color: '#0066CC' }}>{englishTest.listening}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Reading</p>
                  <p className="font-bold" style={{ color: '#0066CC' }}>{englishTest.reading}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Writing</p>
                  <p className="font-bold" style={{ color: '#0066CC' }}>{englishTest.writing}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Speaking</p>
                  <p className="font-bold" style={{ color: '#0066CC' }}>{englishTest.speaking}</p>
                </div>
              </div>
            )}
          </div>
        ) : englishTest?.yet_to_receive ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">Test Scheduled</h3>
            </div>
            <p className="text-sm text-amber-800">
              {englishTest.planned_date ? 
                `Planned for ${new Date(englishTest.planned_date).toLocaleDateString()}` :
                'Waiting for results'
              }
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Start Test Preparation</h3>
            <p className="text-slate-600 text-sm mb-4">
              Prepare for English proficiency tests required for admission
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-700">Available Tests</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'IELTS', path: 'IELTSTest' },
              { name: 'PTE', path: 'PTETest' },
              { name: 'OIETC', path: 'OIETCTest' },
              { name: 'Duolingo', path: 'DuolingoTest' },
            ].map((test) => (
              <Link key={test.name} to={createPageUrl(test.path)}>
                <Button variant="outline" size="sm" className="w-full">
                  {test.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <Link to={createPageUrl('LanguagePrep')}>
          <Button className="w-full" style={{ backgroundColor: '#F37021', color: '#000000' }}>
            <BookOpen className="w-4 h-4 mr-2" />
            View All Test Prep
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}