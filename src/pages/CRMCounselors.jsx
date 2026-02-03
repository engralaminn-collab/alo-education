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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Search, Plus, User, Mail, Phone, Globe, 
  Users, Award, Edit, Trash2, MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CRMLayout from '@/components/crm/CRMLayout';
import { motion } from 'framer-motion';
import CounselorPerformanceAnalytics from '@/components/crm/CounselorPerformanceAnalytics';

export default function CRMCounselors() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specializations: '',
    languages: '',
    max_students: 50,
    status: 'active',
  });

  const queryClient = useQueryClient();

  const { data: counselors = [], isLoading } = useQuery({
    queryKey: ['crm-counselors'],
    queryFn: () => base44.entities.Counselor.list('-created_date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['crm-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const createCounselor = useMutation({
    mutationFn: (data) => base44.entities.Counselor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-counselors'] });
      resetForm();
      toast.success('Counselor created');
    },
  });

  const updateCounselor = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Counselor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-counselors'] });
      resetForm();
      toast.success('Counselor updated');
    },
  });

  const deleteCounselor = useMutation({
    mutationFn: (id) => base44.entities.Counselor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-counselors'] });
      toast.success('Counselor deleted');
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingCounselor(null);
    setFormData({
      name: '', email: '', phone: '', bio: '',
      specializations: '', languages: '', max_students: 50, status: 'active',
    });
  };

  const openEdit = (counselor) => {
    setEditingCounselor(counselor);
    setFormData({
      name: counselor.name || '',
      email: counselor.email || '',
      phone: counselor.phone || '',
      bio: counselor.bio || '',
      specializations: counselor.specializations?.join(', ') || '',
      languages: counselor.languages?.join(', ') || '',
      max_students: counselor.max_students || 50,
      status: counselor.status || 'active',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
      languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
      max_students: parseInt(formData.max_students),
    };

    if (editingCounselor) {
      updateCounselor.mutate({ id: editingCounselor.id, data });
    } else {
      createCounselor.mutate(data);
    }
  };

  const filteredCounselors = counselors.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStudentCount = (counselorId) => 
    students.filter(s => s.counselor_id === counselorId).length;

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-500',
    on_leave: 'bg-amber-100 text-amber-700',
  };

  return (
    <CRMLayout 
      title="Counselors"
      actions={
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Counselor
        </Button>
      }
    >
      {/* Performance Analytics */}
      <div className="mb-6">
        <CounselorPerformanceAnalytics />
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search counselors..."
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
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCounselors.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No counselors found</h3>
            <p className="text-slate-500 mb-4">Add your first counselor to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Counselor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounselors.map((counselor, index) => {
            const studentCount = getStudentCount(counselor.id);
            const capacity = (studentCount / (counselor.max_students || 50)) * 100;
            
            return (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                          {counselor.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{counselor.name}</h3>
                          <Badge className={statusColors[counselor.status]}>
                            {counselor.status}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(counselor)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm('Delete this counselor?')) {
                                deleteCounselor.mutate(counselor.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {counselor.email}
                      </div>
                      {counselor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {counselor.phone}
                        </div>
                      )}
                    </div>

                    {counselor.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {counselor.specializations.slice(0, 3).map((spec, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {counselor.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{counselor.specializations.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500">Student Load</span>
                        <span className="font-medium">
                          {studentCount}/{counselor.max_students || 50}
                        </span>
                      </div>
                      <Progress 
                        value={capacity} 
                        className={`h-2 ${capacity > 80 ? '[&>div]:bg-red-500' : capacity > 60 ? '[&>div]:bg-amber-500' : ''}`}
                      />
                    </div>

                    {counselor.total_enrollments > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-emerald-600">
                        <Award className="w-4 h-4" />
                        {counselor.total_enrollments} successful enrollments
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCounselor ? 'Edit Counselor' : 'Add Counselor'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1"
                placeholder="Brief description of experience and expertise..."
              />
            </div>

            <div>
              <Label>Specializations (comma-separated)</Label>
              <Input
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                className="mt-1"
                placeholder="e.g. UK, Canada, Business, Engineering"
              />
            </div>

            <div>
              <Label>Languages (comma-separated)</Label>
              <Input
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                className="mt-1"
                placeholder="e.g. English, Arabic, Hindi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Students</Label>
                <Input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingCounselor ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}