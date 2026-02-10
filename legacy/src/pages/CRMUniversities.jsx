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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, Plus, Building2, MapPin, Star, Users, 
  Edit, Trash2, Globe, MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CRMLayout from '@/components/crm/CRMLayout';
import { motion } from 'framer-motion';

export default function CRMUniversities() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    ranking: '',
    description: '',
    website: '',
    acceptance_rate: '',
    student_population: '',
    international_students_percent: '',
    tuition_range_min: '',
    tuition_range_max: '',
    cover_image: '',
    logo_url: '',
    is_featured: false,
    status: 'active',
  });

  const queryClient = useQueryClient();

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['crm-universities'],
    queryFn: () => base44.entities.University.list('-created_date'),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['crm-courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const createUniversity = useMutation({
    mutationFn: (data) => base44.entities.University.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-universities'] });
      resetForm();
      toast.success('University created');
    },
  });

  const updateUniversity = useMutation({
    mutationFn: ({ id, data }) => base44.entities.University.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-universities'] });
      resetForm();
      toast.success('University updated');
    },
  });

  const deleteUniversity = useMutation({
    mutationFn: (id) => base44.entities.University.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-universities'] });
      toast.success('University deleted');
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingUniversity(null);
    setFormData({
      name: '', country: '', city: '', ranking: '', description: '',
      website: '', acceptance_rate: '', student_population: '',
      international_students_percent: '', tuition_range_min: '',
      tuition_range_max: '', cover_image: '', logo_url: '',
      is_featured: false, status: 'active',
    });
  };

  const openEdit = (uni) => {
    setEditingUniversity(uni);
    setFormData({
      name: uni.name || '',
      country: uni.country || '',
      city: uni.city || '',
      ranking: uni.ranking || '',
      description: uni.description || '',
      website: uni.website || '',
      acceptance_rate: uni.acceptance_rate || '',
      student_population: uni.student_population || '',
      international_students_percent: uni.international_students_percent || '',
      tuition_range_min: uni.tuition_range_min || '',
      tuition_range_max: uni.tuition_range_max || '',
      cover_image: uni.cover_image || '',
      logo_url: uni.logo_url || '',
      is_featured: uni.is_featured || false,
      status: uni.status || 'active',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      ranking: formData.ranking ? parseInt(formData.ranking) : null,
      acceptance_rate: formData.acceptance_rate ? parseFloat(formData.acceptance_rate) : null,
      student_population: formData.student_population ? parseInt(formData.student_population) : null,
      international_students_percent: formData.international_students_percent ? parseFloat(formData.international_students_percent) : null,
      tuition_range_min: formData.tuition_range_min ? parseInt(formData.tuition_range_min) : null,
      tuition_range_max: formData.tuition_range_max ? parseInt(formData.tuition_range_max) : null,
    };

    if (editingUniversity) {
      updateUniversity.mutate({ id: editingUniversity.id, data });
    } else {
      createUniversity.mutate(data);
    }
  };

  const filteredUniversities = universities.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.country?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  );

  const getCoursesCount = (uniId) => courses.filter(c => c.university_id === uniId).length;

  return (
    <CRMLayout 
      title="Universities"
      actions={
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add University
        </Button>
      }
    >
      {/* Search */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-slate-200" />
              <CardContent className="p-4">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((uni, index) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                <div className="relative h-40">
                  <img
                    src={uni.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=600'}
                    alt={uni.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {uni.is_featured && (
                      <Badge className="bg-amber-500 text-white">Featured</Badge>
                    )}
                    <Badge className={uni.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}>
                      {uni.status}
                    </Badge>
                  </div>
                  {uni.ranking && (
                    <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-900">
                      <Star className="w-3 h-3 mr-1" />
                      Rank #{uni.ranking}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{uni.name}</h3>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {uni.city}, {uni.country}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(uni)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm('Delete this university?')) {
                              deleteUniversity.mutate(uni.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {uni.student_population?.toLocaleString() || '-'}
                    </span>
                    <span>{getCoursesCount(uni.id)} courses</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUniversity ? 'Edit University' : 'Add University'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>University Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>World Ranking</Label>
                <Input
                  type="number"
                  value={formData.ranking}
                  onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                  className="mt-1"
                />
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

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Acceptance Rate (%)</Label>
                <Input
                  type="number"
                  value={formData.acceptance_rate}
                  onChange={(e) => setFormData({ ...formData, acceptance_rate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Student Population</Label>
                <Input
                  type="number"
                  value={formData.student_population}
                  onChange={(e) => setFormData({ ...formData, student_population: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>International %</Label>
                <Input
                  type="number"
                  value={formData.international_students_percent}
                  onChange={(e) => setFormData({ ...formData, international_students_percent: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Min Tuition (USD)</Label>
                <Input
                  type="number"
                  value={formData.tuition_range_min}
                  onChange={(e) => setFormData({ ...formData, tuition_range_min: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Tuition (USD)</Label>
                <Input
                  type="number"
                  value={formData.tuition_range_max}
                  onChange={(e) => setFormData({ ...formData, tuition_range_max: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                />
                <Label>Featured University</Label>
              </div>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingUniversity ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}