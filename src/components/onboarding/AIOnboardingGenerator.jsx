import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIOnboardingGenerator({ student, onGenerated }) {
  const queryClient = useQueryClient();

  const generateChecklist = useMutation({
    mutationFn: async () => {
      const prompt = `Create a comprehensive, personalized onboarding checklist for this student applying to study abroad.

STUDENT PROFILE:
- Name: ${student.first_name} ${student.last_name}
- Target Country: ${student.preferred_study_destinations?.[0] || student.admission_preferences?.study_destination || 'United Kingdom'}
- Study Level: ${student.admission_preferences?.study_level || 'Postgraduate'}
- Field of Study: ${student.admission_preferences?.study_area || 'Not specified'}
- IELTS Status: ${student.language_proficiency?.ielts?.overall ? 'Completed' : 'Not taken'}
- Profile Completeness: ${student.profile_completeness || 0}%

Create a checklist with 12-15 actionable items covering:
1. Profile Completion (if not 100%)
2. Document Preparation (transcripts, certificates, passport)
3. English Language Tests (IELTS/TOEFL/PTE)
4. Financial Documentation
5. University Selection & Applications
6. Visa Requirements
7. Pre-departure Preparation

For each item provide:
- title: Clear, actionable title
- description: Brief explanation of what's needed (1-2 sentences)
- category: "documents", "profile", "tests", "financial", "visa", or "other"
- priority: "low", "medium", "high", or "urgent"
- due_date: Suggested completion date (format: YYYY-MM-DD, relative to today)
- completed: false

Order by priority and typical timeline. Be specific to their target country and study level.

Return JSON array of checklist items.`;

      const items = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              priority: { type: 'string' },
              due_date: { type: 'string' },
              completed: { type: 'boolean' }
            }
          }
        }
      });

      // Add IDs and default values
      const checklistItems = items.map((item, index) => ({
        ...item,
        id: `item_${Date.now()}_${index}`,
        completed: false,
        reminder_sent: false
      }));

      // Calculate initial completion
      const completedCount = checklistItems.filter(i => i.completed).length;
      const completionPercentage = Math.round((completedCount / checklistItems.length) * 100);

      // Create checklist
      const checklist = await base44.entities.OnboardingChecklist.create({
        student_id: student.id,
        checklist_items: checklistItems,
        country_of_interest: student.preferred_study_destinations?.[0] || student.admission_preferences?.study_destination,
        study_level: student.admission_preferences?.study_level,
        completion_percentage: completionPercentage,
        ai_generated: true,
        generated_date: new Date().toISOString()
      });

      return checklist;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['onboarding-checklist']);
      toast.success('Personalized checklist generated!');
      if (onGenerated) onGenerated(data);
    },
    onError: () => {
      toast.error('Failed to generate checklist');
    }
  });

  return (
    <Button
      onClick={() => generateChecklist.mutate()}
      disabled={generateChecklist.isPending}
      className="w-full"
      style={{ backgroundColor: '#0066CC' }}
    >
      {generateChecklist.isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating Your Checklist...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate AI Onboarding Checklist
        </>
      )}
    </Button>
  );
}