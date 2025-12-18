import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Wifi, BookOpen, Dumbbell, Home, Sparkles, Loader2 } from 'lucide-react';

export default function CampusFacilitiesSection({ university }) {
  const [facilities, setFacilities] = React.useState(null);

  const generateFacilities = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate detailed campus facilities information for this university. Include library, accommodation, sports facilities, technology resources, and dining options.

University: ${university.university_name || university.name}
Location: ${university.city}, ${university.country}
About: ${university.about || 'A prestigious institution'}

Provide realistic and comprehensive information formatted as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            library: {
              type: "object",
              properties: {
                description: { type: "string" },
                features: { type: "array", items: { type: "string" } }
              }
            },
            accommodation: {
              type: "object",
              properties: {
                description: { type: "string" },
                options: { type: "array", items: { type: "string" } }
              }
            },
            sports: {
              type: "array",
              items: { type: "string" }
            },
            technology: {
              type: "array",
              items: { type: "string" }
            },
            dining: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => setFacilities(data)
  });

  if (!facilities && !generateFacilities.isPending) {
    return (
      <Card className="border-2" style={{ borderColor: '#0066CC' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
            <Building2 className="w-5 h-5" />
            Campus Facilities
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: '#0066CC' }} />
          <p className="text-slate-600 mb-4">
            Explore world-class campus facilities and amenities
          </p>
          <Button
            onClick={() => generateFacilities.mutate()}
            style={{ backgroundColor: '#F37021', color: 'white' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Facilities Info
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (generateFacilities.isPending) {
    return (
      <Card className="border-2" style={{ borderColor: '#0066CC' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
            <Building2 className="w-5 h-5" />
            Campus Facilities
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" style={{ color: '#0066CC' }} />
          <p className="text-slate-600">Generating facilities information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Building2 className="w-5 h-5" />
          Campus Facilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {facilities?.overview && (
          <p className="text-slate-700 leading-relaxed">{facilities.overview}</p>
        )}

        {facilities?.library && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2" style={{ color: '#0066CC' }}>
              <BookOpen className="w-5 h-5" />
              Library & Learning Resources
            </h3>
            <p className="text-slate-700 mb-3">{facilities.library.description}</p>
            <div className="space-y-2">
              {facilities.library.features?.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F37021] mt-2" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {facilities?.accommodation && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2" style={{ color: '#0066CC' }}>
              <Home className="w-5 h-5" />
              Student Accommodation
            </h3>
            <p className="text-slate-700 mb-3">{facilities.accommodation.description}</p>
            <div className="grid md:grid-cols-2 gap-2">
              {facilities.accommodation.options?.map((option, index) => (
                <div key={index} className="p-2 bg-white rounded border-2 border-transparent hover:border-[#0066CC] transition-colors">
                  <p className="text-sm text-slate-700">{option}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#0066CC' }}>
              <Dumbbell className="w-5 h-5" />
              Sports & Recreation
            </h3>
            <div className="space-y-2">
              {facilities?.sports?.map((sport, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F37021]" />
                  <span className="text-sm text-slate-700">{sport}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#0066CC' }}>
              <Wifi className="w-5 h-5" />
              Technology & IT
            </h3>
            <div className="space-y-2">
              {facilities?.technology?.map((tech, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F37021]" />
                  <span className="text-sm text-slate-700">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}