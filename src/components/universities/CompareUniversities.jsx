import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  X, Star, MapPin, Users, DollarSign, CheckCircle,
  Building2, ArrowRight, TrendingUp, Save, Share2, Copy, Award, Globe, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CompareUniversities({ 
  selectedUniversities = [], 
  onRemove,
  onClear 
}) {
  const [showComparison, setShowComparison] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const [savedComparison, setSavedComparison] = useState(null);
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-comparison', selectedUniversities.map(u => u.id)],
    queryFn: async () => {
      if (selectedUniversities.length === 0) return [];
      const allCourses = await base44.entities.Course.filter({ status: 'open' });
      return allCourses.filter(c => 
        selectedUniversities.some(u => u.id === c.university_id)
      );
    },
    enabled: selectedUniversities.length > 0
  });

  const getUniversityCourses = (uniId) => {
    return courses.filter(c => c.university_id === uniId);
  };

  const getPopularFields = (uniId) => {
    const uniCourses = getUniversityCourses(uniId);
    const fields = {};
    uniCourses.forEach(c => {
      if (c.subject_area) {
        fields[c.subject_area] = (fields[c.subject_area] || 0) + 1;
      }
    });
    return Object.entries(fields)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([field]) => field);
  };

  const saveComparison = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const shareToken = Math.random().toString(36).substr(2, 9);
      
      const comparison = await base44.entities.UniversityComparison.create({
        user_id: user.id,
        name: comparisonName || `Comparison - ${new Date().toLocaleDateString()}`,
        university_ids: selectedUniversities.map(u => u.id),
        share_token: shareToken,
        is_public: true
      });
      
      return comparison;
    },
    onSuccess: (comparison) => {
      queryClient.invalidateQueries({ queryKey: ['my-comparisons'] });
      setSavedComparison(comparison);
      setShowSaveDialog(false);
      toast.success('Comparison saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save comparison');
    }
  });

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${createPageUrl('SharedComparison')}?token=${savedComparison.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleSave = () => {
    if (!comparisonName.trim()) {
      toast.error('Please enter a comparison name');
      return;
    }
    saveComparison.mutate();
  };

  if (selectedUniversities.length === 0) return null;

  return (
    <>
      {/* Floating Compare Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-slate-900">
                  {selectedUniversities.length} {selectedUniversities.length === 1 ? 'University' : 'Universities'} Selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedUniversities.slice(0, 3).map(uni => (
                  <Badge key={uni.id} variant="outline" className="flex items-center gap-1">
                    {uni.name.split(' ')[0]}
                    <button
                      onClick={() => onRemove(uni.id)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedUniversities.length > 3 && (
                  <Badge variant="outline">+{selectedUniversities.length - 3} more</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={selectedUniversities.length < 2}
                >
                  Compare Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">University Comparison</DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-4 font-semibold text-slate-600 bg-slate-50 sticky left-0 z-10">
                    Criteria
                  </th>
                  {selectedUniversities.map(uni => (
                    <th key={uni.id} className="p-4 text-center min-w-[200px]">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900">{uni.name}</h4>
                        <div className="flex items-center justify-center gap-1 text-sm text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {uni.city}, {uni.country}
                        </div>
                        <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Ranking */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      World Ranking
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.ranking ? (
                        <Badge className="bg-amber-100 text-amber-700">
                          #{uni.ranking}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Tuition Fees */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      Tuition Range
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.tuition_range_min && uni.tuition_range_max ? (
                        <div className="text-sm">
                          <div className="font-semibold text-emerald-600">
                            {uni.currency || 'USD'} {uni.tuition_range_min.toLocaleString()} - {uni.tuition_range_max.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500">per year</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Contact for fees</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Student Population */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Students
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.student_population ? (
                        <div className="text-sm">
                          <div className="font-semibold">{uni.student_population.toLocaleString()}</div>
                          {uni.international_students_percent && (
                            <div className="text-xs text-slate-500">
                              {uni.international_students_percent}% international
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Acceptance Rate */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      Acceptance Rate
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.acceptance_rate ? (
                        <Badge variant="outline">{uni.acceptance_rate}%</Badge>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* QS Ranking */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      QS Ranking
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.qs_ranking ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          #{uni.qs_ranking}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Popular Fields */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-500" />
                      Popular Fields
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {getPopularFields(uni.id).length > 0 ? getPopularFields(uni.id).map((field, i) => (
                          <Badge key={i} variant="outline" className="text-xs capitalize">
                            {field.replace(/_/g, ' ')}
                          </Badge>
                        )) : <span className="text-slate-400">N/A</span>}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Entry Requirements */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      Entry Requirements
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4">
                      <div className="text-xs text-slate-600 text-left">
                        {uni.entry_requirements_summary || 'Contact university for details'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Scholarship Availability */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Scholarships
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.scholarships_summary ? (
                        <div className="text-xs text-slate-600 text-left">
                          {uni.scholarships_summary}
                        </div>
                      ) : (
                        <span className="text-slate-400">Contact for info</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Available Courses */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Available Courses
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      <div className="font-semibold text-lg">{getUniversityCourses(uni.id).length}</div>
                      <Link to={createPageUrl('Courses') + `?university=${uni.id}`}>
                        <Button size="sm" variant="link" className="text-xs">
                          View Courses
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Intakes */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      Main Intakes
                    </div>
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {uni.intakes ? (
                          uni.intakes.split(/[,/]/).map((intake, i) => (
                            <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">
                              {intake.trim()}
                            </Badge>
                          ))
                        ) : <span className="text-slate-400">N/A</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Comparison
              </Button>
              {savedComparison && (
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowComparison(false)}>
                Close
              </Button>
              <Link to={createPageUrl('Contact')}>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Get Expert Guidance
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Comparison</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Comparison Name</Label>
              <Input
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
                placeholder="e.g., Top UK Universities for Computer Science"
                className="mt-2"
              />
            </div>
            <p className="text-sm text-slate-600">
              Save this comparison to access it later and share with others.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveComparison.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {saveComparison.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}