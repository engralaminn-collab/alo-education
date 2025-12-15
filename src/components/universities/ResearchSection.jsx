import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, Microscope, BookOpen, Award, 
  TrendingUp, Lightbulb, Users, GraduationCap 
} from 'lucide-react';

const researchAreas = [
  { area: 'Engineering & Technology', icon: FlaskConical, color: 'blue' },
  { area: 'Health & Medical Sciences', icon: Microscope, color: 'red' },
  { area: 'Business & Economics', icon: TrendingUp, color: 'green' },
  { area: 'Arts & Humanities', icon: BookOpen, color: 'purple' },
  { area: 'Social Sciences', icon: Users, color: 'amber' },
  { area: 'Natural Sciences', icon: Lightbulb, color: 'cyan' },
];

export default function ResearchSection({ university }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            Research & Innovation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            {university.university_name} is a leading research institution committed to advancing 
            knowledge and innovation. Our research programs span multiple disciplines and offer 
            students opportunities to work alongside world-class researchers on cutting-edge projects.
          </p>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Research Areas</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {researchAreas.map((area, idx) => {
                const Icon = area.icon;
                return (
                  <div key={idx} className={`p-4 rounded-lg border-2 border-${area.color}-200 bg-${area.color}-50`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 text-${area.color}-600`} />
                      <span className={`font-medium text-${area.color}-900 text-sm`}>{area.area}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-indigo-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Research Centers</h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  State-of-the-art research facilities and specialized centers focusing on 
                  interdisciplinary innovation and breakthrough discoveries.
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• Advanced laboratory facilities</li>
                  <li>• Industry partnerships</li>
                  <li>• Funding opportunities</li>
                  <li>• International collaborations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Student Opportunities</h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Engage in research projects, gain hands-on experience, and contribute to 
                  academic publications while developing critical research skills.
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• Research assistantships</li>
                  <li>• Undergraduate research programs</li>
                  <li>• PhD opportunities</li>
                  <li>• Conference presentations</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
            <h4 className="font-bold text-indigo-900 mb-3">Research Impact</h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">500+</div>
                <div className="text-xs text-slate-600">Research Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">$50M+</div>
                <div className="text-xs text-slate-600">Research Funding</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 mb-1">1000+</div>
                <div className="text-xs text-slate-600">Publications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">50+</div>
                <div className="text-xs text-slate-600">Industry Partners</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}