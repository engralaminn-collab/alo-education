import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadScoringEngine({ leads }) {
  const queryClient = useQueryClient();

  const scoreLeads = useMutation({
    mutationFn: async () => {
      const scoredLeads = [];

      for (const lead of leads.filter(l => l.status === 'new')) {
        let score = 0;
        let reasoning = [];

        // Email domain quality
        if (lead.email?.includes('@gmail.com') || lead.email?.includes('@yahoo.com')) {
          score += 10;
          reasoning.push('Personal email (+10)');
        } else {
          score += 15;
          reasoning.push('Corporate email (+15)');
        }

        // Has phone number
        if (lead.phone) {
          score += 15;
          reasoning.push('Phone provided (+15)');
        }

        // Detailed message
        if (lead.message?.length > 100) {
          score += 20;
          reasoning.push('Detailed inquiry (+20)');
        } else if (lead.message?.length > 50) {
          score += 10;
          reasoning.push('Some details (+10)');
        }

        // High-value countries
        if (['United States', 'United Kingdom', 'Canada', 'Australia'].includes(lead.country_of_interest)) {
          score += 15;
          reasoning.push('High-demand country (+15)');
        }

        // High-value degree levels
        if (['Postgraduate', 'PhD'].includes(lead.degree_level)) {
          score += 15;
          reasoning.push('Advanced degree (+15)');
        }

        // Source quality
        if (lead.source === 'referral') {
          score += 25;
          reasoning.push('Referral source (+25)');
        } else if (lead.source === 'organic_search') {
          score += 20;
          reasoning.push('Organic search (+20)');
        }

        // Speed of response (if created recently)
        const hoursSinceCreated = (Date.now() - new Date(lead.created_date).getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreated < 24) {
          score += 10;
          reasoning.push('Fresh lead (+10)');
        }

        scoredLeads.push({
          id: lead.id,
          score,
          reasoning: reasoning.join(', '),
          priority: score >= 70 ? 'hot' : score >= 50 ? 'warm' : 'cold'
        });
      }

      // Update leads with scores
      for (const scored of scoredLeads) {
        await base44.entities.Inquiry.update(scored.id, {
          notes: `Lead Score: ${scored.score}/100\nPriority: ${scored.priority.toUpperCase()}\n${scored.reasoning}\n\n${leads.find(l => l.id === scored.id)?.notes || ''}`
        });
      }

      return scoredLeads;
    },
    onSuccess: (scored) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      const hot = scored.filter(s => s.priority === 'hot').length;
      toast.success(`Scored ${scored.length} leads: ${hot} hot leads identified!`);
    },
    onError: (error) => {
      toast.error('Failed to score leads: ' + error.message);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Lead Scoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Automatically score and prioritize leads based on profile quality, engagement, and conversion potential.
        </p>
        <Button
          onClick={() => scoreLeads.mutate()}
          disabled={scoreLeads.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {scoreLeads.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scoring Leads...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Score All New Leads
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}