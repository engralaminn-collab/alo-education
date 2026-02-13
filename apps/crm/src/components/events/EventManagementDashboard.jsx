import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Users, Send, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function EventManagementDashboard() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showInvitations, setShowInvitations] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-event_date', 50)
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations', selectedEvent],
    queryFn: () => base44.entities.EventRegistration.filter({ 
      event_id: selectedEvent 
    }),
    enabled: !!selectedEvent
  });

  const generateInvitationMutation = useMutation({
    mutationFn: async (eventId) => {
      const { data } = await base44.functions.invoke('generateEventInvitation', {
        event_id: eventId
      });
      return data;
    },
    onSuccess: (data) => {
      setShowInvitations(data.invitations);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Invitations generated!');
    }
  });

  const sendFollowUpMutation = useMutation({
    mutationFn: async (eventId) => {
      const { data } = await base44.functions.invoke('sendEventFollowUp', {
        event_id: eventId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Follow-up sequence created!');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Event Management & Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-4">
              {events.filter(e => new Date(e.event_date) > new Date()).map(event => (
                <Card key={event.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{event.event_name}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(event.event_date).toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{event.event_type}</Badge>
                          {event.is_online && <Badge className="bg-green-100 text-green-800">Online</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {event.current_attendees || 0}
                        </p>
                        <p className="text-xs text-slate-600">Registered</p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {!event.invitation_sent && (
                        <Button
                          size="sm"
                          onClick={() => generateInvitationMutation.mutate(event.id)}
                          disabled={generateInvitationMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Invitations
                        </Button>
                      )}
                      
                      {event.invitation_sent && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Invitations Sent
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEvent(event.id)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View Registrations ({event.current_attendees || 0})
                      </Button>
                    </div>

                    {showInvitations && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <h4 className="font-semibold">Generated Invitations:</h4>
                        
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-xs font-semibold text-blue-900">Email:</p>
                          <p className="text-sm font-bold">{showInvitations.email.subject}</p>
                          <p className="text-xs mt-1">{showInvitations.email.body.substring(0, 150)}...</p>
                        </div>

                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-xs font-semibold text-green-900">SMS:</p>
                          <p className="text-xs">{showInvitations.sms.body}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {events.filter(e => new Date(e.event_date) < new Date() && e.status === 'completed').map(event => (
                <Card key={event.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{event.event_name}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(event.event_date).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {!event.follow_up_sent && (
                        <Button
                          size="sm"
                          onClick={() => sendFollowUpMutation.mutate(event.id)}
                          disabled={sendFollowUpMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Follow-Up
                        </Button>
                      )}
                      
                      {event.follow_up_sent && (
                        <Badge className="bg-purple-600">Follow-Up Sent</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Total Events</p>
                    <p className="text-3xl font-bold">{events.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Total Registrations</p>
                    <p className="text-3xl font-bold">
                      {events.reduce((sum, e) => sum + (e.current_attendees || 0), 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Avg Attendance</p>
                    <p className="text-3xl font-bold">
                      {Math.round(events.reduce((sum, e) => sum + (e.current_attendees || 0), 0) / (events.length || 1))}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}