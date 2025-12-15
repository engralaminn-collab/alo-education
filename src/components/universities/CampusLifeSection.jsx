import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Music, Dumbbell, BookOpen, Coffee, 
  Heart, Globe, Lightbulb, Trophy, Calendar 
} from 'lucide-react';

const defaultCampusFeatures = [
  { icon: Users, label: 'Student Clubs', count: '200+' },
  { icon: Music, label: 'Cultural Events', count: 'Weekly' },
  { icon: Dumbbell, label: 'Sports Facilities', count: 'Modern' },
  { icon: BookOpen, label: 'Libraries', count: 'Multiple' },
  { icon: Coffee, label: 'Cafeterias', count: '10+' },
  { icon: Heart, label: 'Health Services', count: '24/7' },
  { icon: Globe, label: 'International Community', count: 'Active' },
  { icon: Trophy, label: 'Competitions', count: 'Regular' },
];

export default function CampusLifeSection({ university }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Campus Life & Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {defaultCampusFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="font-semibold text-slate-900 mb-1">{feature.label}</div>
                  <Badge variant="outline">{feature.count}</Badge>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Student Experience</h4>
            <p className="text-slate-600 leading-relaxed mb-4">
              {university.university_name} offers a vibrant campus life with a diverse international community. 
              Students have access to numerous clubs, societies, and activities that enhance their university experience 
              beyond academics. The campus provides modern facilities including state-of-the-art sports centers, 
              multiple libraries, student lounges, and recreational spaces.
            </p>
            {university.international_students_percent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">International Community</span>
                </div>
                <p className="text-sm text-blue-700">
                  {university.international_students_percent}% of students come from around the world, 
                  creating a truly diverse and multicultural environment.
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Events & Activities</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-900">Cultural Festivals</div>
                  <p className="text-sm text-slate-600">Annual celebrations showcasing global cultures</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-900">Sports Competitions</div>
                  <p className="text-sm text-slate-600">Inter-university tournaments and leagues</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-900">Innovation Challenges</div>
                  <p className="text-sm text-slate-600">Hackathons and entrepreneurship events</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Music className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-900">Arts & Music</div>
                  <p className="text-sm text-slate-600">Concerts, theater, and exhibitions</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}