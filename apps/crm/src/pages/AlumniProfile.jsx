import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  MapPin, GraduationCap, Briefcase, Award, MessageSquare,
  Linkedin, Mail, ArrowLeft, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function AlumniProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const alumniId = urlParams.get('id');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [message, setMessage] = useState('');

  const { data: alumni } = useQuery({
    queryKey: ['alumni-profile', alumniId],
    queryFn: async () => {
      const all = await base44.entities.Alumni.filter({ id: alumniId });
      return all[0];
    },
    enabled: !!alumniId,
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const sendMessage = useMutation({
    mutationFn: async (data) => {
      await base44.integrations.Core.SendEmail({
        to: alumni.email,
        subject: `New message from ${user?.full_name || 'a student'} on ALO Education`,
        body: `You received a new message from ${user?.full_name || 'a student'} (${user?.email}):\n\n${data.message}\n\n---\nReply directly to this email to connect with them.`
      });
    },
    onSuccess: () => {
      toast.success('Message sent successfully!');
      setShowContactDialog(false);
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  if (!alumni) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-12">
        <Link to={createPageUrl('AlumniNetwork')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Network
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    {alumni.photo ? (
                      <img 
                        src={alumni.photo} 
                        alt={alumni.full_name}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                        {alumni.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h1 className="text-3xl font-bold text-slate-900">{alumni.full_name}</h1>
                          <p className="text-slate-500">Class of {alumni.graduation_year}</p>
                        </div>
                        {alumni.is_featured && (
                          <Badge className="bg-amber-100 text-amber-700">
                            <Award className="w-4 h-4 mr-1" />
                            Featured Alumni
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {alumni.linkedin_url && (
                          <a href={alumni.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Linkedin className="w-4 h-4 mr-2" />
                              LinkedIn
                            </Button>
                          </a>
                        )}
                        {alumni.available_for_mentorship && user && (
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => setShowContactDialog(true)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Request Mentorship
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {alumni.bio && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-900 mb-2">About</h3>
                      <p className="text-slate-600 leading-relaxed">{alumni.bio}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-slate-500">Degree</div>
                        <div className="font-medium text-slate-900">{alumni.degree}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-slate-500">University</div>
                        <div className="font-medium text-slate-900">{alumni.university}</div>
                      </div>
                    </div>
                    {alumni.current_position && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                        <Briefcase className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm text-slate-500">Current Position</div>
                          <div className="font-medium text-slate-900">{alumni.current_position}</div>
                          {alumni.company && <div className="text-xs text-slate-500">{alumni.company}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {alumni.experience_story && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>My Study Abroad Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {alumni.experience_story}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {alumni.advice_for_students && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-cyan-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      Advice for Future Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {alumni.advice_for_students}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {alumni.available_for_mentorship && (
              <Card className="border-0 shadow-lg border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-slate-900">Available for Mentorship</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {alumni.full_name} is available to mentor students and share guidance.
                  </p>
                  {alumni.mentorship_topics && alumni.mentorship_topics.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Topics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {alumni.mentorship_topics.map((topic, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Education Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Field of Study</div>
                  <div className="font-medium capitalize">{alumni.field_of_study?.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Country</div>
                  <div className="font-medium">{alumni.country}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Graduation Year</div>
                  <div className="font-medium">{alumni.graduation_year}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Send a message to {alumni.full_name} to request mentorship or ask questions about their experience.
            </p>
            <Textarea
              rows={6}
              placeholder="Hi! I'm interested in studying at [university name] and would love to hear about your experience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowContactDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => sendMessage.mutate({ message })}
                disabled={!message || sendMessage.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessage.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}