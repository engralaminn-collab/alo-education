import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Video, MapPin, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function MeetingScheduler({ studentId, onSuccess }) {
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [meetingType, setMeetingType] = useState('virtual_meeting');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: student } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => base44.entities.StudentProfile.filter({ id: studentId })
  });

  const scheduleMeeting = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('scheduleUniversityMeeting', {
        studentId,
        universityId: selectedUniversity,
        meetingType,
        preferredDate,
        preferredTime,
        notes
      });
      return response;
    },
    onSuccess: (data) => {
      toast.success('Meeting scheduled successfully!');
      setSelectedUniversity('');
      setPreferredDate('');
      setPreferredTime('10:00');
      setNotes('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule meeting');
    }
  });

  const canSchedule = selectedUniversity && preferredDate && student && student[0];

  return (
    <div className="space-y-6">
      {/* University Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-education-blue" />
            Select University
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a university" />
            </SelectTrigger>
            <SelectContent>
              {universities.map(uni => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.university_name} - {uni.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Meeting Type */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMeetingType('virtual_meeting')}
              className={`p-4 rounded-lg border-2 transition-all ${
                meetingType === 'virtual_meeting'
                  ? 'border-education-blue bg-blue-50'
                  : 'border-slate-200 hover:border-education-blue'
              }`}
            >
              <Video className="w-6 h-6 text-education-blue mb-2" />
              <p className="font-semibold text-slate-900">Virtual Meeting</p>
              <p className="text-xs text-slate-500">1 hour meeting</p>
            </button>
            <button
              onClick={() => setMeetingType('campus_tour')}
              className={`p-4 rounded-lg border-2 transition-all ${
                meetingType === 'campus_tour'
                  ? 'border-education-blue bg-blue-50'
                  : 'border-slate-200 hover:border-education-blue'
              }`}
            >
              <MapPin className="w-6 h-6 text-alo-orange mb-2" />
              <p className="font-semibold text-slate-900">Campus Tour</p>
              <p className="text-xs text-slate-500">2 hour tour</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Preferred Date
            </label>
            <Input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              Preferred Time
            </label>
            <Input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific interests or questions for the university?"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      {canSchedule && (
        <Card className="border-l-4 border-alo-orange bg-orange-50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-slate-900">Meeting Type:</span>{' '}
                {meetingType === 'virtual_meeting' ? 'Virtual Meeting (1h)' : 'Campus Tour (2h)'}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Date & Time:</span>{' '}
                {new Date(`${preferredDate}T${preferredTime}`).toLocaleString()}
              </p>
              {selectedUniversity && (
                <p>
                  <span className="font-semibold text-slate-900">University:</span>{' '}
                  {universities.find(u => u.id === selectedUniversity)?.university_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Button */}
      <Button
        onClick={() => scheduleMeeting.mutate()}
        disabled={!canSchedule || scheduleMeeting.isPending}
        className="w-full bg-education-blue hover:bg-blue-700 h-12 text-lg"
      >
        {scheduleMeeting.isPending ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Scheduling...
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </>
        )}
      </Button>
    </div>
  );
}