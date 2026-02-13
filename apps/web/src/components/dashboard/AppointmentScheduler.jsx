import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentScheduler({ studentProfile }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointment_date: '',
    duration_minutes: 30,
  });

  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ['my-appointments', studentProfile?.id],
    queryFn: () => base44.entities.Appointment.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const createAppointment = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create({
      ...data,
      student_id: studentProfile.id,
      counselor_id: studentProfile.counselor_id,
      status: 'scheduled',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-appointments']);
      setShowForm(false);
      setFormData({ title: '', description: '', appointment_date: '', duration_minutes: 30 });
      toast.success('Appointment scheduled successfully!');
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: (id) => base44.entities.Appointment.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-appointments']);
      toast.success('Appointment cancelled');
    },
  });

  const upcomingAppointments = appointments.filter(
    a => a.status === 'scheduled' && new Date(a.appointment_date) > new Date()
  ).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: '#0B5ED7' }} />
          Appointments
        </CardTitle>
        <Button 
          size="sm" 
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#0B5ED7' }}
          className="text-white"
        >
          {showForm ? 'Cancel' : 'Schedule'}
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-slate-50 rounded-xl"
            >
              <div className="space-y-4">
                <div>
                  <Label>Meeting Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Course counseling session"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Topics to discuss..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={() => createAppointment.mutate(formData)}
                  disabled={!formData.title || !formData.appointment_date || createAppointment.isPending}
                  className="w-full text-white"
                  style={{ backgroundColor: '#0B5ED7' }}
                >
                  {createAppointment.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            upcomingAppointments.map(appointment => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-slate-50 rounded-xl border-l-4"
                style={{ borderColor: '#0B5ED7' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{appointment.title}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-red-600"
                    onClick={() => cancelAppointment.mutate(appointment.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(appointment.appointment_date), 'h:mm a')}
                  </span>
                </div>
                {appointment.description && (
                  <p className="text-sm text-slate-500 mt-2">{appointment.description}</p>
                )}
                {appointment.meeting_link && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => window.open(appointment.meeting_link, '_blank')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}