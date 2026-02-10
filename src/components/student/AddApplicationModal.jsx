import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

export default function AddApplicationModal({ open, onClose, studentId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    intake: '',
    priority: '3',
    tuition_fee: '',
    offer_deadline: '',
    student_notes: '',
  });

  const queryClient = useQueryClient();

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const results = await base44.entities.University.list();
      return results.filter(u => 
        u.university_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.country?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);
    },
    enabled: searchTerm.length >= 2,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-by-university', selectedUniversity?.id],
    queryFn: async () => {
      if (!selectedUniversity?.id) return [];
      return await base44.entities.Course.filter({ university_id: selectedUniversity.id });
    },
    enabled: !!selectedUniversity?.id,
  });

  const createApplication = useMutation({
    mutationFn: async () => {
      if (!selectedUniversity || !selectedCourse) {
        throw new Error('Please select a university and course');
      }

      const applicationData = {
        student_id: studentId,
        university_id: selectedUniversity.id,
        course_id: selectedCourse.id,
        status: 'draft',
        intake: formData.intake,
        priority: parseInt(formData.priority),
        tuition_fee: formData.tuition_fee ? parseFloat(formData.tuition_fee) : null,
        offer_deadline: formData.offer_deadline || null,
        student_notes: formData.student_notes,
        milestones: {
          documents_submitted: { completed: false },
          application_submitted: { completed: false },
          offer_received: { completed: false },
          visa_applied: { completed: false },
          visa_approved: { completed: false },
          enrolled: { completed: false },
        },
      };

      return await base44.entities.Application.create(applicationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application added successfully!');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add application');
    },
  });

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUniversity(null);
    setSelectedCourse(null);
    setFormData({
      intake: '',
      priority: '3',
      tuition_fee: '',
      offer_deadline: '',
      student_notes: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* University Search */}
          <div>
            <Label>Search University *</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type university name or country..."
                className="pl-10"
              />
            </div>
            {universities.length > 0 && !selectedUniversity && (
              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                {universities.map(uni => (
                  <button
                    key={uni.id}
                    onClick={() => {
                      setSelectedUniversity(uni);
                      setSearchTerm('');
                    }}
                    className="w-full p-3 hover:bg-slate-50 text-left border-b last:border-b-0"
                  >
                    <div className="font-semibold">{uni.university_name}</div>
                    <div className="text-sm text-slate-600">{uni.country}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedUniversity && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-900">{selectedUniversity.university_name}</div>
                  <div className="text-sm text-green-700">{selectedUniversity.country}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUniversity(null)}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* Course Selection */}
          {selectedUniversity && (
            <div>
              <Label>Select Course *</Label>
              <Select 
                value={selectedCourse?.id} 
                onValueChange={(id) => setSelectedCourse(courses.find(c => c.id === id))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_title} - {course.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Application Details */}
          {selectedCourse && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Intake</Label>
                  <Select value={formData.intake} onValueChange={(v) => setFormData({ ...formData, intake: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select intake" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January 2026">January 2026</SelectItem>
                      <SelectItem value="September 2026">September 2026</SelectItem>
                      <SelectItem value="January 2027">January 2027</SelectItem>
                      <SelectItem value="September 2027">September 2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority (1-5)</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Highest</SelectItem>
                      <SelectItem value="2">2 - High</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - Low</SelectItem>
                      <SelectItem value="5">5 - Lowest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tuition Fee (USD/year)</Label>
                  <Input
                    type="number"
                    value={formData.tuition_fee}
                    onChange={(e) => setFormData({ ...formData, tuition_fee: e.target.value })}
                    placeholder="e.g., 25000"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Offer Deadline</Label>
                  <Input
                    type="date"
                    value={formData.offer_deadline}
                    onChange={(e) => setFormData({ ...formData, offer_deadline: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.student_notes}
                  onChange={(e) => setFormData({ ...formData, student_notes: e.target.value })}
                  placeholder="Add any notes about this application..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => createApplication.mutate()}
            disabled={!selectedUniversity || !selectedCourse || createApplication.isPending}
            className="bg-gradient-brand"
          >
            {createApplication.isPending ? 'Adding...' : 'Add Application'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}