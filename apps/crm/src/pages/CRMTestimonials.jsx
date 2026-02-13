import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Star, CheckCircle, XCircle, Eye, ThumbsUp, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMTestimonials() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const queryClient = useQueryClient();

  const { data: testimonials = [] } = useQuery({
    queryKey: ['crm-testimonials'],
    queryFn: () => base44.entities.Testimonial.list('-created_date'),
  });

  const updateTestimonial = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-testimonials'] });
      setSelectedTestimonial(null);
      toast.success('Testimonial updated');
    },
  });

  const pending = testimonials.filter(t => t.status === 'pending');
  const approved = testimonials.filter(t => t.status === 'approved');
  const rejected = testimonials.filter(t => t.status === 'rejected');

  const TestimonialCard = ({ testimonial }) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
      approved: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const config = statusConfig[testimonial.status];
    const StatusIcon = config.icon;

    return (
      <Card 
        className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => setSelectedTestimonial(testimonial)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {testimonial.student_photo ? (
              <img 
                src={testimonial.student_photo} 
                alt={testimonial.student_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                {testimonial.student_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.student_name}</h4>
                  <p className="text-sm text-slate-500">
                    {testimonial.course} • {testimonial.university}
                  </p>
                </div>
                <Badge className={config.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {testimonial.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-slate-600 line-clamp-2">
                {testimonial.testimonial_text}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTestimonial(testimonial);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {testimonial.is_featured && (
                  <Badge className="bg-blue-100 text-blue-700">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <CRMLayout title="Testimonials">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pending.map(t => <TestimonialCard key={t.id} testimonial={t} />)}
          {pending.length === 0 && (
            <p className="text-center text-slate-500 py-12">No pending testimonials</p>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approved.map(t => <TestimonialCard key={t.id} testimonial={t} />)}
          {approved.length === 0 && (
            <p className="text-center text-slate-500 py-12">No approved testimonials</p>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejected.map(t => <TestimonialCard key={t.id} testimonial={t} />)}
          {rejected.length === 0 && (
            <p className="text-center text-slate-500 py-12">No rejected testimonials</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Testimonial Review</DialogTitle>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {selectedTestimonial.student_photo && (
                  <img 
                    src={selectedTestimonial.student_photo} 
                    alt={selectedTestimonial.student_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{selectedTestimonial.student_name}</h3>
                  <p className="text-slate-600">{selectedTestimonial.course}</p>
                  <p className="text-slate-500">{selectedTestimonial.university} • {selectedTestimonial.country}</p>
                  
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < selectedTestimonial.rating 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTestimonial.testimonial_text}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTestimonial.is_featured}
                  onChange={(e) => setSelectedTestimonial({ 
                    ...selectedTestimonial, 
                    is_featured: e.target.checked 
                  })}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-500"
                />
                <label className="text-sm font-medium">Feature on homepage</label>
              </div>

              <div className="flex justify-end gap-3">
                {selectedTestimonial.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline"
                      className="text-red-600"
                      onClick={() => updateTestimonial.mutate({ 
                        id: selectedTestimonial.id, 
                        data: { status: 'rejected' } 
                      })}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => updateTestimonial.mutate({ 
                        id: selectedTestimonial.id, 
                        data: { 
                          status: 'approved',
                          is_featured: selectedTestimonial.is_featured 
                        } 
                      })}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedTestimonial.status === 'approved' && (
                  <Button 
                    onClick={() => updateTestimonial.mutate({ 
                      id: selectedTestimonial.id, 
                      data: { is_featured: selectedTestimonial.is_featured } 
                    })}
                  >
                    Update Featured Status
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}