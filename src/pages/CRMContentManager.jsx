import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Search, Building2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMContentManager() {
  const [activeTab, setActiveTab] = useState('universities');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const deleteUniversityMutation = useMutation({
    mutationFn: (id) => base44.entities.University.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast.success('University deleted successfully!');
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully!');
    },
  });

  const saveUniversityMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem?.id) {
        return base44.entities.University.update(editingItem.id, data);
      }
      return base44.entities.University.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      setShowDialog(false);
      setEditingItem(null);
      toast.success('University saved successfully!');
    },
  });

  const saveCourseMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem?.id) {
        return base44.entities.Course.update(editingItem.id, data);
      }
      return base44.entities.Course.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowDialog(false);
      setEditingItem(null);
      toast.success('Course saved successfully!');
    },
  });

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, _type: type });
    setShowDialog(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (editingItem._type === 'university') {
      saveUniversityMutation.mutate(data);
    } else {
      saveCourseMutation.mutate(data);
    }
  };

  const filteredUniversities = universities.filter(u =>
    u.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject_area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CRMLayout currentPage="Content Manager">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Content Manager</h1>
            <p className="text-slate-600 mt-1">Manage universities and courses</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingItem({ _type: activeTab === 'universities' ? 'university' : 'course' });
                  setShowDialog(true);
                }}
                style={{ backgroundColor: '#F37021' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {activeTab === 'universities' ? 'University' : 'Course'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="universities" className="flex-1">
                  <Building2 className="w-4 h-4 mr-2" />
                  Universities ({universities.length})
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex-1">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Courses ({courses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="universities" className="space-y-4 mt-6">
                {filteredUniversities.map((uni) => (
                  <Card key={uni.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          {uni.logo && (
                            <img src={uni.logo} alt={uni.university_name} className="w-16 h-16 object-contain" />
                          )}
                          <div>
                            <h3 className="font-bold text-lg">{uni.university_name}</h3>
                            <p className="text-slate-600">{uni.city}, {uni.country}</p>
                            {uni.ranking && <p className="text-sm text-slate-500">Ranking: #{uni.ranking}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(uni, 'university')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Delete this university?')) {
                                deleteUniversityMutation.mutate(uni.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="courses" className="space-y-4 mt-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{course.course_title}</h3>
                          <p className="text-slate-600">{course.level} • {course.subject_area}</p>
                          <p className="text-sm text-slate-500">
                            {universities.find(u => u.id === course.university_id)?.university_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(course, 'course')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Delete this course?')) {
                                deleteCourseMutation.mutate(course.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.id ? 'Edit' : 'Add'} {editingItem?._type === 'university' ? 'University' : 'Course'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              {editingItem?._type === 'university' ? (
                <>
                  <div>
                    <Label>University Name *</Label>
                    <Input name="university_name" defaultValue={editingItem.university_name} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Country *</Label>
                      <Input name="country" defaultValue={editingItem.country} required />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input name="city" defaultValue={editingItem.city} />
                    </div>
                  </div>
                  <div>
                    <Label>Logo URL</Label>
                    <Input name="logo" defaultValue={editingItem.logo} />
                  </div>
                  <div>
                    <Label>Cover Image URL</Label>
                    <Input name="cover_image" defaultValue={editingItem.cover_image} />
                  </div>
                  <div>
                    <Label>About</Label>
                    <Textarea name="about" defaultValue={editingItem.about} rows={4} />
                  </div>
                  <div>
                    <Label>Website URL</Label>
                    <Input name="website_url" defaultValue={editingItem.website_url} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ranking</Label>
                      <Input name="ranking" type="number" defaultValue={editingItem.ranking} />
                    </div>
                    <div>
                      <Label>QS Ranking</Label>
                      <Input name="qs_ranking" type="number" defaultValue={editingItem.qs_ranking} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Course Title *</Label>
                    <Input name="course_title" defaultValue={editingItem.course_title} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Level *</Label>
                      <select name="level" defaultValue={editingItem.level} required className="w-full px-3 py-2 border rounded-md">
                        <option value="">Select...</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Postgraduate">Postgraduate</option>
                        <option value="Foundation">Foundation</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                    <div>
                      <Label>Subject Area</Label>
                      <Input name="subject_area" defaultValue={editingItem.subject_area} />
                    </div>
                  </div>
                  <div>
                    <Label>University</Label>
                    <select name="university_id" defaultValue={editingItem.university_id} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select...</option>
                      {universities.map(u => (
                        <option key={u.id} value={u.id}>{u.university_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input name="duration" defaultValue={editingItem.duration} />
                  </div>
                  <div>
                    <Label>Tuition Fee (Min)</Label>
                    <Input name="tuition_fee_min" type="number" defaultValue={editingItem.tuition_fee_min} />
                  </div>
                  <div>
                    <Label>Overview</Label>
                    <Textarea name="overview" defaultValue={editingItem.overview} rows={4} />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" style={{ backgroundColor: '#0066CC' }}>
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}