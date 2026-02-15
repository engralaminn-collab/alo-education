import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Star, Upload, CheckCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function SubmitTestimonial() {
  const [submitted, setSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    student_name: '',
    student_photo: '',
    university: '',
    course: '',
    country: '',
    rating: 5,
    testimonial_text: '',
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const createTestimonial = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Testimonial submitted for review!');
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, student_photo: result.file_url });
      setPhotoFile(file);
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTestimonial.mutate({
      ...formData,
      student_id: studentProfile?.id,
      status: 'pending',
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-6 py-16">
          <Card className="max-w-2xl mx-auto border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Thank You!</h2>
              <p className="text-slate-600 mb-6">
                Your testimonial has been submitted and is under review. Once approved, it will be displayed on our website.
              </p>
              <Button onClick={() => window.location.href = createPageUrl('StudentDashboard')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <section className="bg-gradient-to-br from-emerald-600 to-cyan-600 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl font-bold mb-4">Share Your Success Story</h1>
            <p className="text-xl text-emerald-100">
              Help inspire future students by sharing your experience with ALO Education
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <Card className="max-w-3xl mx-auto border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Submit Your Testimonial</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Your Name *</Label>
                  <Input
                    required
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>University *</Label>
                  <Input
                    required
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="e.g., University of Oxford"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Course *</Label>
                  <Input
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="e.g., MSc Computer Science"
                  />
                </div>
                <div>
                  <Label>Country *</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(v) => setFormData({ ...formData, country: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="ireland">Ireland</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Your Photo (Optional)</Label>
                <div className="mt-2">
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-emerald-500 transition-colors">
                      {formData.student_photo ? (
                        <div className="flex items-center gap-4">
                          <img 
                            src={formData.student_photo} 
                            alt="Preview" 
                            className="w-20 h-20 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-emerald-600">Photo uploaded</p>
                            <p className="text-sm text-slate-500">Click to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600">Click to upload your photo</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label>Rating *</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= formData.rating 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Your Testimonial *</Label>
                <Textarea
                  required
                  rows={6}
                  value={formData.testimonial_text}
                  onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                  placeholder="Share your experience with ALO Education, how we helped you achieve your goals, and what you enjoyed most about studying abroad..."
                  className="mt-2"
                />
                <p className="text-sm text-slate-500 mt-1">
                  {formData.testimonial_text.length} characters
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your testimonial will be reviewed by our team before being published on the website. This usually takes 1-2 business days.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white h-12 text-lg"
                disabled={createTestimonial.isPending || uploading}
              >
                {createTestimonial.isPending ? 'Submitting...' : 'Submit Testimonial'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}