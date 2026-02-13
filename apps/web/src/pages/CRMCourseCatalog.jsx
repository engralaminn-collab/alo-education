import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMCourseCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_title: '',
    subject_area: '',
    level: 'Undergraduate',
    country: '',
    university_id: '',
    duration: '',
    intake: '',
    tuition_fee_min: '',
    tuition_fee_max: '',
    ielts_required: false,
    ielts_overall: '',
    entry_requirements: '',
    overview: '',
    scholarship_available: false,
    status: 'open'
  });

  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-catalog'],
    queryFn: () => base44.entities.Course.list('-created_date', 500)
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-select'],
    queryFn: () => base44.entities.University.list('university_name')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses-catalog']);
      toast.success('Course added successfully');
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses-catalog']);
      toast.success('Course updated successfully');
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses-catalog']);
      toast.success('Course deleted successfully');
    }
  });

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({
        course_title: '',
        subject_area: '',
        level: 'Undergraduate',
        country: '',
        university_id: '',
        duration: '',
        intake: '',
        tuition_fee_min: '',
        tuition_fee_max: '',
        ielts_required: false,
        ielts_overall: '',
        entry_requirements: '',
        overview: '',
        scholarship_available: false,
        status: 'open'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCourse(null);
  };

  const handleSave = () => {
    if (!formData.course_title || !formData.university_id || !formData.level) {
      toast.error('Please fill in required fields');
      return;
    }

    const data = {
      ...formData,
      tuition_fee_min: formData.tuition_fee_min ? parseFloat(formData.tuition_fee_min) : null,
      tuition_fee_max: formData.tuition_fee_max ? parseFloat(formData.tuition_fee_max) : null,
      ielts_overall: formData.ielts_overall ? parseFloat(formData.ielts_overall) : null
    };

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filtering
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject_area?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesCountry = filterCountry === 'all' || course.country === filterCountry;

    return matchesSearch && matchesLevel && matchesCountry;
  });

  const countries = [...new Set(courses.map(c => c.country).filter(Boolean))];

  return (
    <CRMLayout 
      title="Course Catalog Management"
      actions={
        <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map(course => {
            const university = universities.find(u => u.id === course.university_id);
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{course.course_title}</CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{university?.university_name}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(course)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(course.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{course.level}</Badge>
                      <Badge variant="outline">{course.country}</Badge>
                      {course.scholarship_available && <Badge className="bg-green-500">Scholarship</Badge>}
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Subject:</span> {course.subject_area}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Duration:</span> {course.duration}
                      </p>
                      {course.tuition_fee_min && (
                        <p className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Tuition:</span> ${course.tuition_fee_min} - ${course.tuition_fee_max}
                        </p>
                      )}
                      {course.ielts_required && (
                        <p className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium">IELTS:</span> {course.ielts_overall}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No courses found. Add your first course to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Course Title *</Label>
              <Input
                value={formData.course_title}
                onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
                placeholder="e.g., Bachelor of Science in Computer Science"
              />
            </div>
            <div>
              <Label>University *</Label>
              <Select value={formData.university_id} onValueChange={(v) => setFormData({ ...formData, university_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(uni => (
                    <SelectItem key={uni.id} value={uni.id}>{uni.university_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level *</Label>
              <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject Area</Label>
              <Input
                value={formData.subject_area}
                onChange={(e) => setFormData({ ...formData, subject_area: e.target.value })}
                placeholder="e.g., Computer Science, Business"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., USA, UK, Canada"
              />
            </div>
            <div>
              <Label>Duration</Label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 3 years, 18 months"
              />
            </div>
            <div>
              <Label>Intake</Label>
              <Input
                value={formData.intake}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                placeholder="e.g., January, September"
              />
            </div>
            <div>
              <Label>Min Tuition Fee (USD)</Label>
              <Input
                type="number"
                value={formData.tuition_fee_min}
                onChange={(e) => setFormData({ ...formData, tuition_fee_min: e.target.value })}
              />
            </div>
            <div>
              <Label>Max Tuition Fee (USD)</Label>
              <Input
                type="number"
                value={formData.tuition_fee_max}
                onChange={(e) => setFormData({ ...formData, tuition_fee_max: e.target.value })}
              />
            </div>
            <div>
              <Label>IELTS Overall Score</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.ielts_overall}
                onChange={(e) => setFormData({ ...formData, ielts_overall: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Entry Requirements</Label>
              <Textarea
                value={formData.entry_requirements}
                onChange={(e) => setFormData({ ...formData, entry_requirements: e.target.value })}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Overview</Label>
              <Textarea
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave}>{editingCourse ? 'Update' : 'Create'} Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}