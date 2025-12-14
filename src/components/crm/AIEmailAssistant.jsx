import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Copy, Send, RefreshCw, History, TrendingUp, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const emailTemplates = {
  welcome: {
    title: 'Welcome & Initial Consultation',
    context: 'First contact with a new inquiry, offering consultation and initial guidance'
  },
  follow_up: {
    title: 'Application Follow-Up',
    context: 'Following up on pending application or missing documents'
  },
  offer_congratulations: {
    title: 'Offer Letter Received',
    context: 'Congratulating student on receiving university offer and next steps'
  },
  visa_guidance: {
    title: 'Visa Application Support',
    context: 'Providing visa application guidance and document checklist'
  },
  document_request: {
    title: 'Document Request',
    context: 'Requesting specific documents for application processing'
  },
  status_update: {
    title: 'Application Status Update',
    context: 'Updating student on application progress'
  },
};

export default function AIEmailAssistant({ 
  studentName, 
  studentEmail, 
  studentContext,
  onSend
}) {
  const [templateType, setTemplateType] = useState('welcome');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [effectivenessRating, setEffectivenessRating] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch counselor's past templates for learning
  const { data: pastTemplates = [] } = useQuery({
    queryKey: ['email-templates', user?.id, templateType],
    queryFn: async () => {
      if (!user?.id) return [];
      const templates = await base44.entities.EmailTemplate.filter({
        counselor_id: user.id,
        template_type: templateType
      }, '-created_date', 5);
      return templates;
    },
    enabled: !!user?.id
  });

  const generateEmail = useMutation({
    mutationFn: async () => {
      const template = emailTemplates[templateType];
      
      // Build learning context from past edits
      const learningContext = pastTemplates.length > 0 ? `
Previous successful emails by this counselor:
${pastTemplates.slice(0, 3).map((t, i) => `
Example ${i + 1}:
${t.edited_content || t.original_content}
`).join('\n')}

Note the counselor's writing style, tone, and preferences from these examples.
` : '';

      const prompt = `You are a professional education counselor at ALO Education. Generate a personalized, warm, and professional email.

Template Type: ${template.title}
Context: ${template.context}
Student Name: ${studentName}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}
${studentContext ? `Student Background: ${JSON.stringify(studentContext)}` : ''}

${learningContext}

Requirements:
- Professional yet friendly tone
- Personalized to the student
- Clear call-to-action
- Include ALO Education branding
- Keep it concise (200-300 words)
- Sign off as the counselor
${pastTemplates.length > 0 ? '- Match the style and tone from previous examples' : ''}

Generate the email body only (no subject line).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedEmail(data);
      setOriginalEmail(data);
      setIsEditing(true);
      toast.success('Email generated with personalized learning');
    },
    onError: () => {
      toast.error('Failed to generate email');
    }
  });

  // Save template with edits for learning
  const saveTemplate = useMutation({
    mutationFn: async ({ rating }) => {
      const hasEdits = generatedEmail !== originalEmail;
      
      // Calculate edits summary
      let editsSummary = '';
      if (hasEdits) {
        const originalWords = originalEmail.split(' ').length;
        const editedWords = generatedEmail.split(' ').length;
        const wordDiff = editedWords - originalWords;
        editsSummary = `Edited: ${Math.abs(wordDiff)} words ${wordDiff > 0 ? 'added' : 'removed'}`;
      }

      return await base44.entities.EmailTemplate.create({
        counselor_id: user.id,
        template_type: templateType,
        original_content: originalEmail,
        edited_content: hasEdits ? generatedEmail : originalEmail,
        edits_summary: editsSummary,
        context_used: additionalContext,
        usage_count: 1,
        effectiveness_rating: rating,
        student_context: studentContext
      });
    },
    onSuccess: () => {
      toast.success('Template saved! Future emails will learn from this.');
      setEffectivenessRating(0);
    }
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast.success('Email copied to clipboard');
  };

  const handleSend = () => {
    if (onSend) {
      onSend(generatedEmail);
    }
  };

  const hasEdits = generatedEmail !== originalEmail && originalEmail !== '';

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Email Assistant
            {pastTemplates.length > 0 && (
              <Badge className="bg-purple-100 text-purple-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                Learning Enabled
              </Badge>
            )}
          </CardTitle>
          {pastTemplates.length > 0 && (
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Your Email History</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {pastTemplates.map((template, i) => (
                    <div key={template.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{template.template_type}</Badge>
                        {template.effectiveness_rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(template.effectiveness_rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {template.edited_content || template.original_content}
                      </p>
                      <button
                        onClick={() => {
                          setGeneratedEmail(template.edited_content || template.original_content);
                          setIsEditing(true);
                          setShowHistory(false);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 mt-2"
                      >
                        Use as template
                      </button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Email Template</Label>
          <Select value={templateType} onValueChange={setTemplateType}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(emailTemplates).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">
            {emailTemplates[templateType].context}
          </p>
        </div>

        <div>
          <Label>Additional Context (Optional)</Label>
          <Textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Add specific details like university name, program, dates, etc."
            className="mt-2"
            rows={3}
          />
        </div>

        <Button 
          onClick={() => generateEmail.mutate()}
          disabled={generateEmail.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Sparkles className={`w-4 h-4 mr-2 ${generateEmail.isPending ? 'animate-spin' : ''}`} />
          {generateEmail.isPending ? 'Generating...' : 
           pastTemplates.length > 0 ? 'Generate with AI Learning' : 'Generate Email'}
        </Button>

        {generatedEmail && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Generated Email</Label>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => generateEmail.mutate()}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {hasEdits && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✏️ You've made edits. Save this template to improve future AI suggestions!
                </p>
              </div>
            )}

            <Textarea
              value={generatedEmail}
              onChange={(e) => setGeneratedEmail(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Label className="text-sm">Rate effectiveness:</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setEffectivenessRating(rating)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        rating <= effectivenessRating 
                          ? 'fill-amber-500 text-amber-500' 
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => saveTemplate.mutate({ rating: effectivenessRating })}
                disabled={saveTemplate.isPending || effectivenessRating === 0}
                variant="outline"
                className="flex-1"
              >
                Save Template & Learn
              </Button>
              {onSend && (
                <Button 
                  onClick={handleSend}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}