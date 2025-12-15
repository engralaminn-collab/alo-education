import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, CheckCircle, Clock, Sparkles, 
  AlertCircle, Download, ArrowRight, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';
import VisaChecklist from '@/components/visa/VisaChecklist';
import VisaDocuments from '@/components/visa/VisaDocuments';
import VisaFormAssistant from '@/components/visa/VisaFormAssistant';
import VisaProcessingTimes from '@/components/visa/VisaProcessingTimes';

const countries = [
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'usa', name: 'United States', flag: '🇺🇸' },
  { code: 'canada', name: 'Canada', flag: '🇨🇦' },
  { code: 'australia', name: 'Australia', flag: '🇦🇺' },
  { code: 'germany', name: 'Germany', flag: '🇩🇪' },
  { code: 'ireland', name: 'Ireland', flag: '🇮🇪' },
  { code: 'newzealand', name: 'New Zealand', flag: '🇳🇿' },
];

export default function VisaAssistant() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-white/10">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI Visa Application Assistant
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Get personalized guidance through your student visa application process
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {!studentProfile ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Your Profile</h3>
              <p className="text-slate-600 mb-6">
                To use the AI Visa Assistant, please complete your student profile first.
              </p>
              <Link to={createPageUrl('MyProfile')}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Select Your Destination Country
                </CardTitle>
                <CardDescription>
                  Choose the country where you plan to study to get specific visa guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => setSelectedCountry(country)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        selectedCountry.code === country.code
                          ? 'border-blue-500 bg-blue-100 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{country.flag}</div>
                      <div className="font-semibold text-sm text-slate-900">{country.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="checklist" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="form-assistant">Form Assistant</TabsTrigger>
                <TabsTrigger value="processing">Processing Times</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist">
                <VisaChecklist country={selectedCountry} studentProfile={studentProfile} />
              </TabsContent>

              <TabsContent value="documents">
                <VisaDocuments country={selectedCountry} studentProfile={studentProfile} />
              </TabsContent>

              <TabsContent value="form-assistant">
                <VisaFormAssistant 
                  country={selectedCountry} 
                  studentProfile={studentProfile}
                  applications={applications}
                />
              </TabsContent>

              <TabsContent value="processing">
                <VisaProcessingTimes country={selectedCountry} />
              </TabsContent>
            </Tabs>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-purple-900 mb-2">Need Help?</h4>
                    <p className="text-sm text-purple-800 mb-4">
                      Our AI Chatbot can answer specific visa questions and provide personalized guidance.
                    </p>
                    <Link to={createPageUrl('AICounselor')}>
                      <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                        Chat with AI Counselor
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}