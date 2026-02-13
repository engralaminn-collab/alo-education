import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Share2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MyComparisons() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: comparisons = [], isLoading } = useQuery({
    queryKey: ['my-comparisons', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.UniversityComparison.filter({ user_id: user.id }, '-created_date');
    },
    enabled: !!user?.id
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['all-universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const deleteComparison = useMutation({
    mutationFn: (id) => base44.entities.UniversityComparison.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-comparisons'] });
      toast.success('Comparison deleted');
    }
  });

  const handleShare = (comparison) => {
    const shareUrl = `${window.location.origin}${createPageUrl('SharedComparison')}?token=${comparison.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const getUniversityNames = (universityIds) => {
    return universityIds
      .map(id => universities.find(u => u.id === id)?.university_name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Comparisons</h1>
          <p className="text-slate-600">View and manage your saved university comparisons</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-slate-200 rounded mb-4" />
                  <div className="h-4 bg-slate-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : comparisons.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No saved comparisons</h3>
              <p className="text-slate-600 mb-6">
                Start comparing universities to save them for later
              </p>
              <Link to={createPageUrl('Universities')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Universities
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisons.map(comparison => (
              <Card key={comparison.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{comparison.name}</CardTitle>
                  <p className="text-xs text-slate-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {format(new Date(comparison.created_date), 'MMM d, yyyy')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge variant="outline" className="mb-2">
                      {comparison.university_ids?.length || 0} Universities
                    </Badge>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {getUniversityNames(comparison.university_ids || [])}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link 
                      to={createPageUrl('SharedComparison') + `?token=${comparison.share_token}`}
                      className="flex-1"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(comparison)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteComparison.mutate(comparison.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}