import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, CheckCircle, Search, Filter } from 'lucide-react';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Footer from '@/components/landing/Footer';

const eventTypeColors = {
  education_fair: 'bg-purple-100 text-purple-800',
  university_open_day: 'bg-blue-100 text-blue-800',
  webinar: 'bg-green-100 text-green-800',
  workshop: 'bg-orange-100 text-orange-800',
  deadline_reminder: 'bg-red-100 text-red-800',
  counselling_session: 'bg-cyan-100 text-cyan-800'
};

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations', user?.email],
    queryFn: () => base44.entities.EventRegistration.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: ({ eventId, email }) => 
      base44.entities.EventRegistration.create({
        event_id: eventId,
        user_email: email,
        status: 'registered'
      }),
    onSuccess: (data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
      base44.entities.Event.update(eventId, {
        registered_count: (events.find(e => e.id === eventId)?.registered_count || 0) + 1
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Successfully registered for event!');
    },
    onError: () => {
      toast.error('Failed to register. Please try again.');
    }
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || event.country === selectedCountry;
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    
    const eventDate = parseISO(event.event_date);
    const matchesDate = 
      dateFilter === 'all' ||
      (dateFilter === 'upcoming' && isFuture(eventDate)) ||
      (dateFilter === 'today' && isToday(eventDate)) ||
      (dateFilter === 'past' && isPast(eventDate));

    return matchesSearch && matchesCountry && matchesType && matchesDate;
  });

  const isRegistered = (eventId) => {
    return registrations.some(r => r.event_id === eventId);
  };

  const handleRegister = (eventId) => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }
    registerMutation.mutate({ eventId, email: user.email });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section 
        className="relative bg-gradient-to-br from-purple-600 to-blue-600 py-20 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=600&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-purple-900/70"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Events & Webinars
            </h1>
            <p className="text-xl text-white/90">
              Join our education fairs, university open days, and expert webinars to kickstart your study abroad journey
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="education_fair">Education Fair</SelectItem>
                  <SelectItem value="university_open_day">University Open Day</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="counselling_session">Counselling Session</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                  <SelectItem value="all">All Dates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-md">
                <div className="h-48 bg-slate-200 animate-pulse" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 bg-slate-200 animate-pulse rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Events Found</h3>
              <p className="text-slate-600">Try adjusting your filters to see more events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all h-full flex flex-col">
                  {event.image_url && (
                    <div 
                      className="h-48 bg-cover bg-center rounded-t-xl"
                      style={{ backgroundImage: `url(${event.image_url})` }}
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={eventTypeColors[event.event_type]}>
                        {event.event_type.replace(/_/g, ' ')}
                      </Badge>
                      {event.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-2 mb-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(event.event_date), 'MMM dd, yyyy')}
                      </div>
                      {event.event_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {event.event_time}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      {event.country && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Country:</span>
                          {event.country}
                        </div>
                      )}
                      {event.max_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.registered_count || 0} / {event.max_attendees} registered
                        </div>
                      )}
                    </div>
                    <div className="mt-auto">
                      {isRegistered(event.id) ? (
                        <Button disabled className="w-full bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Registered
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRegister(event.id)}
                          disabled={registerMutation.isPending}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Register Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}