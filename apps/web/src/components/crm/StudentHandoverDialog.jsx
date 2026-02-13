import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentHandoverDialog({ student, isOpen, onClose, currentCounselorId }) {
  const [handoverData, setHandoverData] = useState({
    to_counselor_id: '',
    reason: 'workload',
    handover_type: 'temporary',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    summary: '',
    key_priorities: [''],
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-handover'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-apps-handover', student?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: student?.id }),
    enabled: !!student,
  });

  const createHandoverMutation = useMutation({
    mutationFn: async (data) => {
      // Create handover record
      await base44.entities.StudentHandover.create({
        student_id: student.id,
        from_counselor_id: currentCounselorId,
        ...data,
      });

      // Update student's counselor if permanent
      if (data.handover_type === 'permanent') {
        await base44.entities.StudentProfile.update(student.id, {
          counselor_id: data.to_counselor_id,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-handovers'] });
      toast.success('Handover initiated');
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!handoverData.to_counselor_id || !handoverData.summary) {
      toast.error('Please fill in all required fields');
      return;
    }
    createHandoverMutation.mutate(handoverData);
  };

  const addPriority = () => {
    setHandoverData({
      ...handoverData,
      key_priorities: [...handoverData.key_priorities, ''],
    });
  };

  const updatePriority = (index, value) => {
    const updated = [...handoverData.key_priorities];
    updated[index] = value;
    setHandoverData({ ...handoverData, key_priorities: updated });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Student Handover: {student?.first_name} {student?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Summary */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-slate-700 mb-1">
              <strong>Status:</strong> {student?.status}
            </p>
            <p className="text-sm text-slate-700 mb-1">
              <strong>Applications:</strong> {applications.length} active
            </p>
            <p className="text-sm text-slate-700">
              <strong>Profile:</strong> {student?.profile_completeness || 0}% complete
            </p>
          </div>

          {/* New Counselor */}
          <div>
            <Label>Assign To *</Label>
            <select
              value={handoverData.to_counselor_id}
              onChange={(e) => setHandoverData({ ...handoverData, to_counselor_id: e.target.value })}
              className="w-full p-2 border rounded mt-1"
              required
            >
              <option value="">Select counselor...</option>
              {counselors
                .filter(c => c.id !== currentCounselorId)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          {/* Handover Type & Reason */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Handover Type</Label>
              <select
                value={handoverData.handover_type}
                onChange={(e) => setHandoverData({ ...handoverData, handover_type: e.target.value })}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="temporary">Temporary</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>
            <div>
              <Label>Reason</Label>
              <select
                value={handoverData.reason}
                onChange={(e) => setHandoverData({ ...handoverData, reason: e.target.value })}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="leave">On Leave</option>
                <option value="workload">Workload Distribution</option>
                <option value="expertise">Specialized Expertise</option>
                <option value="permanent_transfer">Permanent Transfer</option>
                <option value="temporary_coverage">Temporary Coverage</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={handoverData.start_date}
                onChange={(e) => setHandoverData({ ...handoverData, start_date: e.target.value })}
                className="mt-1"
              />
            </div>
            {handoverData.handover_type === 'temporary' && (
              <div>
                <Label>Expected Return Date</Label>
                <Input
                  type="date"
                  value={handoverData.end_date}
                  onChange={(e) => setHandoverData({ ...handoverData, end_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <Label>Student Summary for New Counselor *</Label>
            <Textarea
              value={handoverData.summary}
              onChange={(e) => setHandoverData({ ...handoverData, summary: e.target.value })}
              placeholder="Provide context about the student, their goals, progress, and any concerns..."
              rows={4}
              className="mt-1"
              required
            />
          </div>

          {/* Key Priorities */}
          <div>
            <Label>Key Priorities</Label>
            <div className="space-y-2 mt-1">
              {handoverData.key_priorities.map((priority, index) => (
                <Input
                  key={index}
                  value={priority}
                  onChange={(e) => updatePriority(index, e.target.value)}
                  placeholder={`Priority ${index + 1}...`}
                />
              ))}
              <Button size="sm" variant="outline" onClick={addPriority}>
                Add Priority
              </Button>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={handoverData.notes}
              onChange={(e) => setHandoverData({ ...handoverData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createHandoverMutation.isPending}
              style={{ backgroundColor: '#0066CC' }}
            >
              {createHandoverMutation.isPending ? 'Processing...' : 'Complete Handover'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}