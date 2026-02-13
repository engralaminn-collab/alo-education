import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, Plus, GraduationCap, Building2, Clock, 
  DollarSign, Edit, Trash2, MoreVertical, Award
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CRMLayout from '@/components/crm/CRMLayout';

const degreeLevels = ['foundation', 'bachelor', 'master', 'phd', 'diploma', 'certificate'];
const fieldsOfStudy = ['business', 'engineering', 'computer_science', 'medicine', 'arts', 'law', 'science', 'social_sciences', 'education', 'hospitality', 'architecture', 'other'];

export default function CRMCourses() {
  const [search, setSearch] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    university_id: '',
    degree_level: '',
    field_of_study: '',
    duration_months: '',
    tuition_fee: '',
    currency: 'USD',
    description: '',
    scholarship_available: false,
    is_featured: false,
    status: 'open',
  });

  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['crm-courses'],
    queryFn: () => base44.entities.Course.list('-created_date'),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['crm-universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  const createCourse = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-courses'] });
      resetForm();
      toast.success('Course created');
    },
  });

  const updateCourse = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-courses'] });
      resetForm();
      toast.success('Course updated');
    },
  });

  const deleteCourse = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-courses'] });
      toast.success('Course deleted');
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    setFormData({
      name: '', university_id: '', degree_level: '', field_of_study: '',
      duration_months: '', tuition_fee: '', currency: 'USD', description: '',
      scholarship_available: false, is_featured: false, status: 'open',
    });
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || '',
      university_id: course.university_id || '',
      degree_level: course.degree_level || '',
      field_of_study: course.field_of_study || '',
      duration_months: course.duration_months || '',
      tuition_fee: course.tuition_fee || '',
      currency: course.currency || 'USD',
      description: course.description || '',
      scholarship_available: course.scholarship_available || false,
      is_featured: course.is_featured || false,
      status: course.status || 'open',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      duration_months: formData.duration_months ? parseInt(formData.duration_months) : null,
      tuition_fee: formData.tuition_fee ? parseFloat(formData.tuition_fee) : null,
    };

    if (editingCourse) {
      updateCourse.mutate({ id: editingCourse.id, data });
    } else {
      createCourse.mutate(data);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      universityMap[c.university_id]?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesDegree = degreeFilter === 'all' || c.degree_level === degreeFilter;
    return matchesSearch && matchesDegree;
  });

  return (
    <CRMLayout 
      title="Courses"
      actions={
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      }
    >
      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={degreeFilter} onValueChange={setDegreeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Degrees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degrees</SelectItem>
                {degreeLevels.map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Tuition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-slate-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => {
                  const university = universityMap[course.university_id];
                  
                  return (
                    <TableRow key={course.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{course.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs capitalize">
                                {course.field_of_study?.replace(/_/g, ' ')}
                              </Badge>
                              {course.scholarship_available && (
                                <Badge className="bg-amber-100 text-amber-700 text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  Scholarship
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {university?.name || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-700 capitalize">
                          {course.degree_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {course.duration_months || '-'} months
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          {course.tuition_fee?.toLocaleString() || '-'} {course.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          course.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                          course.status === 'closed' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(course)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                if (confirm('Delete this course?')) {
                                  deleteCourse.mutate(course.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Course Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>University *</Label>
              <Select 
                value={formData.university_id} 
                onValueChange={(v) => setFormData({ ...formData, university_id: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(uni => (
                    <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Degree Level *</Label>
                <Select 
                  value={formData.degree_level} 
                  onValueChange={(v) => setFormData({ ...formData, degree_level: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeLevels.map(d => (
                      <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Field of Study</Label>
                <Select 
                  value={formData.field_of_study} 
                  onValueChange={(v) => setFormData({ ...formData, field_of_study: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldsOfStudy.map(f => (
                      <SelectItem key={f} value={f} className="capitalize">{f.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tuition Fee</Label>
                <Input
                  type="number"
                  value={formData.tuition_fee}
                  onChange={(e) => setFormData({ ...formData, tuition_fee: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.scholarship_available}
                  onCheckedChange={(v) => setFormData({ ...formData, scholarship_available: v })}
                />
                <Label>Scholarship Available</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                />
                <Label>Featured</Label>
              </div>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingCourse ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}