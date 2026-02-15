import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Download, Loader2, Mail, MessageSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AIMarketingGenerator({ partnerId }) {
  const [materialType, setMaterialType] = useState('social_post');
  const [targetCountry, setTargetCountry] = useState('');
  const [program, setProgram] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-marketing'],
    queryFn: () => base44.entities.Course.list('-created_date', 50)
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-for-marketing'],
    queryFn: () => base44.entities.Testimonial.filter({ is_published: true })
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generatePartnerMarketing', {
        partner_id: partnerId,
        material_type: materialType,
        target_country: targetCountry,
        program: program,
        testimonials: testimonials.slice(0, 3)
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast.success('Marketing material generated!');
    },
    onError: () => {
      toast.error('Failed to generate content');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const materialTypes = [
    { value: 'social_post', label: 'Social Media Post', icon: MessageSquare },
    { value: 'email_template', label: 'Email Template', icon: Mail },
    { value: 'brochure', label: 'Brochure Content', icon: FileText }
  ];

  const countries = ['UK', 'USA', 'Canada', 'Australia', 'New Zealand', 'Ireland', 'Dubai'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Marketing Materials Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Material Type</label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Country</label>
              <Select value={targetCountry} onValueChange={setTargetCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Program (Optional)</label>
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {courses.slice(0, 20).map(course => (
                    <SelectItem key={course.id} value={course.course_name}>
                      {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!targetCountry || generateMutation.isPending}
            className="w-full bg-alo-orange hover:bg-alo-orange/90"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Marketing Material
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Content</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedContent.content)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge>{materialType.replace('_', ' ')}</Badge>
              <Badge variant="outline">{targetCountry}</Badge>
              {program && <Badge variant="outline">{program}</Badge>}
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              {materialType === 'email_template' && (
                <>
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-1">Subject Line:</p>
                    <p className="font-semibold">{generatedContent.subject}</p>
                  </div>
                  <div className="border-t pt-4">
                    <div className="whitespace-pre-wrap">{generatedContent.content}</div>
                  </div>
                </>
              )}

              {materialType === 'social_post' && (
                <>
                  <div className="whitespace-pre-wrap mb-4">{generatedContent.content}</div>
                  {generatedContent.hashtags && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-slate-600">{generatedContent.hashtags}</p>
                    </div>
                  )}
                </>
              )}

              {materialType === 'brochure' && (
                <div className="space-y-4">
                  {generatedContent.sections?.map((section, i) => (
                    <div key={i}>
                      <h4 className="font-bold text-lg mb-2">{section.title}</h4>
                      <p className="text-slate-700">{section.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {generatedContent.tips && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-semibold text-amber-900 mb-2">💡 Marketing Tips:</p>
                <ul className="space-y-1 text-sm text-amber-800">
                  {generatedContent.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}