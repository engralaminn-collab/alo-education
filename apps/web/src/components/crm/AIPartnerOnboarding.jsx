import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Handshake, Loader2, Building2, Mail, User, 
  FileText, CheckCircle, Copy, Send, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIPartnerOnboarding({ universities = [] }) {
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [proposalData, setProposalData] = useState(null);
  const queryClient = useQueryClient();

  const generateProposalMutation = useMutation({
    mutationFn: async (universityId) => {
      const university = universities.find(u => u.id === universityId);
      
      if (!university) throw new Error('University not found');

      const prompt = `You are a business development expert creating a partnership proposal for ALO Education, a leading international student recruitment agency based in Bangladesh.

UNIVERSITY DETAILS:
Name: ${university.university_name}
Location: ${university.city}, ${university.country}
Ranking: ${university.ranking ? '#' + university.ranking : 'N/A'}
QS Ranking: ${university.qs_ranking || 'N/A'}
Student Population: ${university.student_population || 'N/A'}
International Students: ${university.international_students_percent ? university.international_students_percent + '%' : 'N/A'}
Website: ${university.website_url || 'N/A'}

ALO EDUCATION VALUE PROPOSITION:
- Established network of counselors across Bangladesh
- Strong track record in student recruitment
- Comprehensive student support services
- IELTS/PTE preparation programs
- Visa assistance and guidance
- Pre-departure orientation

Generate a comprehensive partnership onboarding package:

1. PARTNERSHIP PROPOSAL (200-300 words):
   - Introduction to ALO Education
   - Why partnership is mutually beneficial
   - Our recruitment capabilities and reach
   - Support services we provide
   - Expected student volume potential

2. INTRODUCTORY EMAIL (Professional, warm, 150-200 words):
   - Compelling subject line
   - Brief introduction
   - Clear value proposition
   - Call to action (schedule meeting)
   - Professional signature

3. SUGGESTED CONTACT POINTS (Top 3):
   - Position/Department
   - Why they're the right contact
   - Suggested approach

4. INITIAL MEETING AGENDA:
   - Key discussion topics
   - Questions to ask
   - Partnership terms to propose

Make it professional, data-driven, and compelling. Focus on mutual benefit and long-term partnership.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            proposal: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                body: { type: 'string' },
                key_benefits: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            email: {
              type: 'object',
              properties: {
                subject: { type: 'string' },
                body: { type: 'string' }
              }
            },
            contact_points: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  position: { type: 'string' },
                  department: { type: 'string' },
                  reasoning: { type: 'string' },
                  approach: { type: 'string' }
                }
              }
            },
            meeting_agenda: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  topic: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            next_steps: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      return { ...response, university };
    },
    onSuccess: (data) => {
      setProposalData(data);
      toast.success('Partnership proposal generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate proposal: ' + error.message);
    }
  });

  const saveAgreementMutation = useMutation({
    mutationFn: async () => {
      if (!proposalData) return;

      await base44.entities.UniversityAgreement.create({
        university_id: proposalData.university.id,
        agreement_title: proposalData.proposal.title,
        agreement_type: 'partnership',
        start_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        terms: proposalData.proposal.body
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-agreements'] });
      toast.success('Partnership agreement drafted!');
    }
  });

  const createOutreachMutation = useMutation({
    mutationFn: async () => {
      if (!proposalData) return;

      await base44.entities.UniversityOutreach.create({
        university_id: proposalData.university.id,
        outreach_type: 'general_inquiry',
        email_subject: proposalData.email.subject,
        email_body: proposalData.email.body,
        status: 'draft',
        automated: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Outreach email drafted!');
    }
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <Handshake className="w-6 h-6" />
          AI Partner Onboarding
        </CardTitle>
        <p className="text-sm text-emerald-700">
          Automate partnership proposals and initial outreach with AI
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* University Selection */}
        <div>
          <Label>Select University</Label>
          <Select value={selectedUniversityId} onValueChange={setSelectedUniversityId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a university to onboard..." />
            </SelectTrigger>
            <SelectContent>
              {universities.map(u => (
                <SelectItem key={u.id} value={u.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {u.university_name} ({u.country})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => generateProposalMutation.mutate(selectedUniversityId)}
          disabled={!selectedUniversityId || generateProposalMutation.isPending}
          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
        >
          {generateProposalMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Onboarding Package...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Onboarding Package
            </>
          )}
        </Button>

        {/* Generated Content */}
        {proposalData && (
          <div className="space-y-6 pt-6 border-t border-emerald-200">
            {/* Partnership Proposal */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Partnership Proposal
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(proposalData.proposal.body)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <h4 className="font-semibold text-emerald-800 mb-3">{proposalData.proposal.title}</h4>
              
              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {proposalData.proposal.body}
                </p>
              </div>

              {proposalData.proposal.key_benefits?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-2">KEY BENEFITS:</p>
                  <div className="space-y-2">
                    {proposalData.proposal.key_benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => saveAgreementMutation.mutate()}
                disabled={saveAgreementMutation.isPending}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save as Draft Agreement
              </Button>
            </div>

            {/* Introductory Email */}
            <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Introductory Email
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(proposalData.email.body)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Subject:</p>
                  <p className="font-semibold text-blue-900">{proposalData.email.subject}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {proposalData.email.body}
                  </pre>
                </div>
              </div>

              <Button
                onClick={() => createOutreachMutation.mutate()}
                disabled={createOutreachMutation.isPending}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Create Outreach Draft
              </Button>
            </div>

            {/* Contact Points */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
              <h3 className="font-bold text-lg text-purple-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Suggested Contact Points
              </h3>
              <div className="space-y-4">
                {proposalData.contact_points?.map((contact, idx) => (
                  <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-purple-600 text-white mb-2">
                          Contact #{idx + 1}
                        </Badge>
                        <h4 className="font-bold text-purple-900">{contact.position}</h4>
                        <p className="text-sm text-purple-700">{contact.department}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div>
                        <p className="text-xs text-purple-600 font-semibold">Why this contact:</p>
                        <p className="text-sm text-slate-700">{contact.reasoning}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-semibold">Suggested approach:</p>
                        <p className="text-sm text-slate-700">{contact.approach}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Agenda */}
            {proposalData.meeting_agenda?.length > 0 && (
              <div className="bg-white rounded-xl p-6 border-2 border-amber-200">
                <h3 className="font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Initial Meeting Agenda
                </h3>
                <div className="space-y-3">
                  {proposalData.meeting_agenda.map((item, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 rounded-lg">
                      <h5 className="font-semibold text-amber-900 mb-1">
                        {idx + 1}. {item.topic}
                      </h5>
                      <p className="text-sm text-slate-700">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {proposalData.next_steps?.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Recommended Next Steps
                </h3>
                <div className="space-y-2">
                  {proposalData.next_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-bold">{idx + 1}.</span>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}