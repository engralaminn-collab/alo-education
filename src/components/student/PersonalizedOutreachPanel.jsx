import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, Phone, Copy, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedOutreachPanel({ student }) {
  const [suggestions, setSuggestions] = useState(null);

  const generateOutreach = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generatePersonalizedOutreach', {
        student_id: student.id
      });
      return data;
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions);
      toast.success('AI generated personalized outreach suggestions');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const urgencyColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Personalized Outreach
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateOutreach.mutate()}
            disabled={generateOutreach.isPending}
          >
            {generateOutreach.isPending ? 'Generating...' : 'Generate Suggestions'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions ? (
          <div className="space-y-4">
            {/* Metadata */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              {suggestions.urgency_level && (
                <Badge className={urgencyColors[suggestions.urgency_level]}>
                  {suggestions.urgency_level} urgency
                </Badge>
              )}
              {suggestions.best_time_to_contact && (
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  Best time: {suggestions.best_time_to_contact}
                </span>
              )}
            </div>

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="call">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Script
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(suggestions.email?.subject)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-sm font-semibold">{suggestions.email?.subject}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Email Body</label>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(suggestions.email?.body)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-4 bg-white rounded-lg border max-h-64 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{suggestions.email?.body}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sms" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">SMS Message</label>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(suggestions.sms)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <p className="text-sm">{suggestions.sms}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {suggestions.sms?.length || 0} characters
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="call" className="space-y-4">
                {suggestions.call_script && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Opening</label>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm">{suggestions.call_script.opening}</p>
                      </div>
                    </div>
                    
                    {suggestions.call_script.talking_points?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Talking Points</label>
                        <ul className="space-y-2">
                          {suggestions.call_script.talking_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {suggestions.call_script.questions?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Questions to Ask</label>
                        <ul className="space-y-2">
                          {suggestions.call_script.questions.map((q, i) => (
                            <li key={i} className="p-2 bg-green-50 rounded border border-green-200 text-sm">
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="mb-2">Generate AI-powered outreach suggestions</p>
            <p className="text-sm">Personalized for this student's journey</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}