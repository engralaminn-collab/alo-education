import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, Share2, Download, ArrowLeft, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import UniversitySelector from '@/components/universities/UniversitySelector';
import CourseSelector from '@/components/universities/CourseSelector';
import ComparisonDisplay from '@/components/universities/ComparisonDisplay';
import Footer from '@/components/landing/Footer';

export default function UniversityComparison() {
  const queryClient = useQueryClient();
  const [selectedUnis, setSelectedUnis] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [comparisonName, setComparisonName] = useState('My Comparison');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Fetch data
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => base44.entities.Scholarship.list()
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  // Save comparison mutation
  const saveComparison = useMutation({
    mutationFn: async (data) => {
      return base44.entities.UniversityComparison.create({
        name: comparisonName,
        university_ids: selectedUnis.map(u => u.id),
        notes: `Comparing ${selectedUnis.length} universities with ${selectedCourses.length} courses`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparisons'] });
      setShowSaveModal(false);
      alert('Comparison saved successfully!');
    }
  });

  const handleAddUniversity = (uni) => {
    setSelectedUnis([...selectedUnis, uni]);
  };

  const handleRemoveUniversity = (uniId) => {
    setSelectedUnis(selectedUnis.filter(u => u.id !== uniId));
  };

  const handleAddCourse = (course) => {
    setSelectedCourses([...selectedCourses, course]);
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(selectedCourses.filter(c => c.id !== courseId));
  };

  const handleDownloadComparison = () => {
    const data = {
      name: comparisonName,
      universities: selectedUnis,
      courses: selectedCourses,
      date: new Date().toLocaleDateString()
    };
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', `comparison_${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-education-blue to-alo-orange text-white py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to={createPageUrl('CourseFinder')} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Course Finder
            </Link>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h1 className="text-4xl font-bold">University Comparison Tool</h1>
                <p className="text-white/90 mt-2">
                  Compare universities side-by-side and make informed decisions
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="select" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select & Configure</TabsTrigger>
            <TabsTrigger value="compare">View Comparison</TabsTrigger>
          </TabsList>

          {/* Selection Tab */}
          <TabsContent value="select" className="space-y-8">
            {/* Comparison Name */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Comparison Name</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={comparisonName}
                  onChange={(e) => setComparisonName(e.target.value)}
                  placeholder="e.g., UK Universities 2024"
                />
              </CardContent>
            </Card>

            {/* University Selection */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📍 Select Universities
                  <span className="text-sm font-normal text-slate-600">
                    ({selectedUnis.length}/4)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UniversitySelector
                  universities={universities}
                  selected={selectedUnis}
                  onSelect={handleAddUniversity}
                  onRemove={handleRemoveUniversity}
                  maxSelect={4}
                />
              </CardContent>
            </Card>

            {/* Course Selection */}
            {universities.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📚 Select Courses (Optional)
                    <span className="text-sm font-normal text-slate-600">
                      ({selectedCourses.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CourseSelector
                    courses={courses}
                    universities={universities}
                    selected={selectedCourses}
                    onSelect={handleAddCourse}
                    onRemove={handleRemoveCourse}
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {selectedUnis.length > 0 && (
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    document.querySelector('[value="compare"]').click();
                  }}
                  className="flex-1 bg-education-blue hover:bg-blue-700 text-lg h-12"
                >
                  View Comparison
                </Button>
                {user && (
                  <Button
                    onClick={() => saveComparison.mutate()}
                    disabled={saveComparison.isPending}
                    className="flex-1 bg-alo-orange hover:bg-orange-600 text-lg h-12"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Comparison
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="compare" className="space-y-8">
            {selectedUnis.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-12">
                <p className="text-slate-500">Select universities in the configuration tab to view comparison</p>
              </Card>
            ) : (
              <>
                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                  <Button
                    onClick={handleDownloadComparison}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  {user && (
                    <Button
                      onClick={() => setShowSaveModal(true)}
                      className="gap-2 bg-education-blue hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" />
                      Save This Comparison
                    </Button>
                  )}
                </div>

                {/* Comparison Display */}
                <ComparisonDisplay
                  universities={selectedUnis}
                  courses={selectedCourses}
                  scholarships={scholarships}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}