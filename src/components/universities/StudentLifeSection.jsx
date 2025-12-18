import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Coffee, Music, Sparkles, Loader2 } from 'lucide-react';

export default function StudentLifeSection({ university }) {
  const [studentLife, setStudentLife] = React.useState(null);

  const generateStudentLife = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive student life information for this university. Include clubs & societies, campus culture, social activities, and student support services.

University: ${university.university_name || university.name}
Location: ${university.city}, ${university.country}
About: ${university.about || 'A prestigious institution'}

Provide realistic and appealing information formatted as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            clubs_societies: {
              type: "array",
              items: { type: "string" }
            },
            social_activities: {
              type: "array",
              items: { type: "string" }
            },
            student_support: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => setStudentLife(data)
  });

  if (!studentLife && !generateStudentLife.isPending) {
    return (
      <Card className="border-2" style={{ borderColor: '#0066CC' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
            <Users className="w-5 h-5" />
            Student Life
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: '#0066CC' }} />
          <p className="text-slate-600 mb-4">
            Discover campus life, clubs, and student activities
          </p>
          <Button
            onClick={() => generateStudentLife.mutate()}
            style={{ backgroundColor: '#F37021', color: 'white' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Student Life Info
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (generateStudentLife.isPending) {
    return (
      <Card className="border-2" style={{ borderColor: '#0066CC' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
            <Users className="w-5 h-5" />
            Student Life
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" style={{ color: '#0066CC' }} />
          <p className="text-slate-600">Generating student life information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Users className="w-5 h-5" />
          Student Life
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {studentLife?.overview && (
          <p className="text-slate-700 leading-relaxed">{studentLife.overview}</p>
        )}

        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#0066CC' }}>
            <Heart className="w-5 h-5" />
            Clubs & Societies
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {studentLife?.clubs_societies?.map((club, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg border-2 border-transparent hover:border-[#F37021] transition-colors">
                <p className="text-sm text-slate-700">{club}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#0066CC' }}>
            <Music className="w-5 h-5" />
            Social Activities
          </h3>
          <div className="space-y-2">
            {studentLife?.social_activities?.map((activity, index) => (
              <div key={index} className="flex items-start gap-2">
                <Coffee className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                <span className="text-slate-700">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#0066CC' }}>
            <Users className="w-5 h-5" />
            Student Support Services
          </h3>
          <div className="space-y-2">
            {studentLife?.student_support?.map((service, index) => (
              <div key={index} className="flex items-start gap-2">
                <Heart className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                <span className="text-slate-700">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}