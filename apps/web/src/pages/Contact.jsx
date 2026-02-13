import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Mail, Phone, MapPin, Clock, Send, CheckCircle,
  GraduationCap, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import WhyChooseALO from '@/components/landing/WhyChooseALO';

export default function Contact() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedUniversity = urlParams.get('university');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country_of_interest: '',
    degree_level: '',
    field_of_study: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const createInquiry = useMutation({
    mutationFn: (data) => base44.entities.Inquiry.create(data),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Your inquiry has been submitted!');
    },
    onError: () => {
      toast.error('Failed to submit. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.country_of_interest || !formData.degree_level) {
      toast.error('Please select a country and degree level.');
      return;
    }
    createInquiry.mutate({
      ...formData,
      source: 'website',
      status: 'new',
    });
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium mb-4">
                <MessageSquare className="w-4 h-4" />
                ALO Education Contact
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-white/90">
                Start your study abroad journey with ALO Education - Book a free consultation today
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  <span className="text-education-blue">ALO Education</span> Contact
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Reach out to ALO Education for personalized guidance on your study abroad journey. We're here to help you achieve your dreams.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-education-blue transition-all">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-education-blue/10 to-alo-orange/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-education-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Phone</h4>
                    <p className="text-education-blue font-medium">+880 1234 567890</p>
                    <p className="text-slate-600 text-sm">Dhaka, Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-alo-orange transition-all">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-alo-orange/10 to-education-blue/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-alo-orange" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                    <p className="text-alo-orange font-medium">info@aloeducation.com</p>
                    <p className="text-slate-600 text-sm">admissions@aloeducation.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-education-blue transition-all">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-education-blue/10 to-alo-orange/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-education-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">ALO Education Office</h4>
                    <p className="text-slate-600 text-sm">House 123, Road 45</p>
                    <p className="text-slate-600 text-sm">Gulshan, Dhaka 1212, Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-alo-orange transition-all">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-alo-orange/10 to-education-blue/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-alo-orange" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Working Hours</h4>
                    <p className="text-slate-600 text-sm">Sat - Thu: 10AM - 7PM</p>
                    <p className="text-slate-600 text-sm">Friday: Closed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {submitted ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-brand-light flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-education-blue" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Thank You!</h2>
                    <p className="text-slate-600 mb-6">
                      Your inquiry has been submitted successfully. One of our counselors will contact you within 24 hours.
                    </p>
                    <Button 
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                    >
                      Submit Another Inquiry
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-education-blue to-alo-orange flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      Book Free Consultation with ALO Education
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and our expert counselors will get back to you within 24 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="John Doe"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="john@example.com"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+971 50 123 4567"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Country of Interest *</Label>
                          <Select 
                            value={formData.country_of_interest} 
                            onValueChange={(v) => updateField('country_of_interest', v)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usa">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="australia">Australia</SelectItem>
                              <SelectItem value="germany">Germany</SelectItem>
                              <SelectItem value="ireland">Ireland</SelectItem>
                              <SelectItem value="other">Other / Not Sure</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Degree Level *</Label>
                          <Select 
                            value={formData.degree_level} 
                            onValueChange={(v) => updateField('degree_level', v)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bachelor">Bachelor's</SelectItem>
                              <SelectItem value="master">Master's</SelectItem>
                              <SelectItem value="phd">PhD</SelectItem>
                              <SelectItem value="diploma">Diploma</SelectItem>
                              <SelectItem value="foundation">Foundation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Field of Study</Label>
                          <Select 
                            value={formData.field_of_study} 
                            onValueChange={(v) => updateField('field_of_study', v)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="computer_science">Computer Science</SelectItem>
                              <SelectItem value="medicine">Medicine</SelectItem>
                              <SelectItem value="arts">Arts</SelectItem>
                              <SelectItem value="law">Law</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          value={formData.message}
                          onChange={(e) => updateField('message', e.target.value)}
                          placeholder="Tell us about your study abroad goals..."
                          className="mt-2"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-brand text-white h-12 text-lg hover:opacity-90"
                        disabled={createInquiry.isPending}
                      >
                        {createInquiry.isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Inquiry
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <WhyChooseALO context={{ page: 'contact', country: formData.country_of_interest, field: formData.field_of_study }} />

      <Footer />
    </div>
  );
}
