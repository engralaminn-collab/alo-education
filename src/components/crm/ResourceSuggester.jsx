import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Search, ExternalLink, Sparkles, 
  FileText, DollarSign, Plane, GraduationCap
} from 'lucide-react';
import { toast } from "sonner";

const categoryIcons = {
  visa_guide: Plane,
  application_tips: FileText,
  financial_aid: DollarSign,
  country_info: BookOpen,
  test_prep: GraduationCap,
  general: BookOpen
};

export default function ResourceSuggester({ studentQuery, studentContext }) {
  const [query, setQuery] = useState(studentQuery || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing resources
  const { data: resources = [] } = useQuery({
    queryKey: ['resources-library'],
    queryFn: () => base44.entities.ResourceSuggestion.list('-view_count', 20),
  });

  // AI-powered resource suggestion
  const suggestResources = useMutation({
    mutationFn: async (searchQuery) => {
      setIsLoading(true);
      
      // First, try to match existing resources
      const matchedResources = resources.filter(r => {
        const matchesQuery = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesContext = !studentContext?.country || 
                               r.country_specific?.includes(studentContext.country) ||
                               r.country_specific?.length === 0;
        return matchesQuery && matchesContext;
      });

      // Then, use AI to suggest additional relevant information
      const prompt = `A student asked: "${searchQuery}"

${studentContext ? `Student Context:
- Country Interest: ${studentContext.country || 'Not specified'}
- Degree Level: ${studentContext.degree_level || 'Not specified'}
- Field: ${studentContext.field_of_study || 'Not specified'}
` : ''}

Provide 3-5 relevant resources or articles that would help answer this query.
Focus on: visa information, application tips, financial aid, test preparation, or country-specific info.

Return as JSON array:
[{
  "title": "Resource Title",
  "category": "visa_guide|application_tips|financial_aid|country_info|test_prep|general",
  "summary": "Brief 2-3 sentence summary",
  "keyPoints": ["point1", "point2", "point3"]
}]`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            resources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  category: { type: 'string' },
                  summary: { type: 'string' },
                  keyPoints: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      });

      setIsLoading(false);
      return {
        matched: matchedResources,
        aiGenerated: aiResponse.resources || []
      };
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast.success(`Found ${data.matched.length} existing resources and ${data.aiGenerated.length} AI suggestions`);
    },
    onError: () => {
      setIsLoading(false);
      toast.error('Failed to generate suggestions');
    }
  });

  const handleSearch = () => {
    if (query.trim()) {
      suggestResources.mutate(query);
    }
  };

  const trackResourceView = async (resourceId) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        await base44.entities.ResourceSuggestion.update(resourceId, {
          view_count: (resource.view_count || 0) + 1
        });
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          AI Resource Suggester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="What does the student need help with?"
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Suggest
          </Button>
        </div>

        {studentContext && (
          <div className="flex gap-2 flex-wrap">
            {studentContext.country && (
              <Badge variant="outline">
                {studentContext.country}
              </Badge>
            )}
            {studentContext.degree_level && (
              <Badge variant="outline">
                {studentContext.degree_level}
              </Badge>
            )}
            {studentContext.field_of_study && (
              <Badge variant="outline">
                {studentContext.field_of_study}
              </Badge>
            )}
          </div>
        )}

        {suggestions.matched?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">From Resource Library</h4>
            <div className="space-y-2">
              {suggestions.matched.slice(0, 3).map((resource) => {
                const Icon = categoryIcons[resource.category] || BookOpen;
                return (
                  <div 
                    key={resource.id}
                    onClick={() => trackResourceView(resource.id)}
                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-slate-900 text-sm">{resource.title}</h5>
                          <Badge className="text-xs" variant="outline">{resource.category}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{resource.content}</p>
                        {resource.url && (
                          <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1"
                          >
                            View Resource <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {suggestions.aiGenerated?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI-Generated Suggestions
            </h4>
            <div className="space-y-3">
              {suggestions.aiGenerated.map((resource, index) => {
                const Icon = categoryIcons[resource.category] || BookOpen;
                return (
                  <div 
                    key={index}
                    className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-white flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-semibold text-slate-900 text-sm">{resource.title}</h5>
                          <Badge className="text-xs bg-purple-100 text-purple-700">
                            {resource.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{resource.summary}</p>
                        {resource.keyPoints && (
                          <ul className="space-y-1">
                            {resource.keyPoints.map((point, i) => (
                              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                <span className="text-purple-600 mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {suggestions.matched?.length === 0 && suggestions.aiGenerated?.length === 0 && query && !isLoading && (
          <div className="text-center py-6 text-slate-500 text-sm">
            No suggestions found. Try a different query.
          </div>
        )}
      </CardContent>
    </Card>
  );
}