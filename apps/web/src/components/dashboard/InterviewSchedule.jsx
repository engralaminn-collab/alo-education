import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react';
import { format, isAfter, isBefore, addHours } from 'date-fns';

export default function InterviewSchedule({ studentId }) {
  const { data: appointments = [] } = useQuery({
    queryKey: ['student-appointments', studentId],
    queryFn: () => base44.entities.Appointment.filter({ student_id: studentId }, '-appointment_date'),
    enabled: !!studentId,
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-list'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  const counselorMap = counselors.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  const now = new Date();
  const upcomingAppointments = appointments.filter(apt => 
    isAfter(new Date(apt.appointment_date), now) && apt.status === 'scheduled'
  );

  if (upcomingAppointments.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Interview Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">
            No upcoming appointments scheduled
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Interview Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingAppointments.slice(0, 3).map(apt => {
          const counselor = counselorMap[apt.counselor_id];
          const aptDate = new Date(apt.appointment_date);
          const isToday = format(aptDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
          const isSoon = isBefore(aptDate, addHours(now, 2));

          return (
            <div key={apt.id} className={`p-4 rounded-xl border-2 ${
              isSoon ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{apt.title}</h4>
                {isToday && (
                  <Badge className="bg-blue-600 text-white">Today</Badge>
                )}
                {isSoon && !isToday && (
                  <Badge className="bg-orange-600 text-white">Soon</Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{format(aptDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{format(aptDate, 'h:mm a')} ({apt.duration_minutes} min)</span>
                </div>
                {counselor && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs text-blue-600">👤</span>
                    </div>
                    <span>{counselor.name}</span>
                  </div>
                )}
                {apt.meeting_link && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-green-600" />
                    <a 
                      href={apt.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Join Video Call
                    </a>
                  </div>
                )}
              </div>

              {apt.description && (
                <p className="mt-3 text-sm text-slate-600 border-t pt-2">
                  {apt.description}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}