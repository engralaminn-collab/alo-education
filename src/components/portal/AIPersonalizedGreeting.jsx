import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';

export default function AIPersonalizedGreeting({ student, applications }) {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateGreeting = async () => {
      try {
        const activeApps = applications.filter(a => 
          !['withdrawn', 'rejected', 'completed'].includes(a.status)
        );
        
        const prompt = `Generate a warm, personalized greeting for ${student.first_name}.

Student context:
- Name: ${student.first_name} ${student.last_name}
- Active applications: ${activeApps.length}
- Profile completeness: ${student.profile_completeness || 0}%
- Recent status: ${activeApps[0]?.status || 'just starting'}

Make it:
- Encouraging and motivating
- Brief (1-2 sentences max)
- Reference their current journey stage
- Professional but friendly

Return just the greeting text.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt
        });

        setGreeting(response);
      } catch (error) {
        setGreeting(`Welcome back, ${student.first_name}! Let's continue your study abroad journey.`);
      }
      setLoading(false);
    };

    if (student) {
      generateGreeting();
    }
  }, [student, applications]);

  if (loading) {
    return (
      <Card className="mb-8 border-2" style={{ borderColor: '#0066CC' }}>
        <CardContent className="p-8">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-2" style={{ borderColor: '#0066CC' }}>
      <CardContent className="p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900 mb-1">
              {greeting}
            </p>
            <p className="text-sm text-slate-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}