import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentReviews({ university }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['university-reviews', university.id],
    queryFn: async () => {
      const allTestimonials = await base44.entities.Testimonial.filter({ 
        status: 'approved',
        university: university.university_name || university.name
      });
      return allTestimonials.slice(0, 4);
    },
    enabled: !!university.id,
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
            <MessageSquare className="w-5 h-5" />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">No reviews yet for this university</p>
            <p className="text-sm text-slate-400">Be the first to share your experience!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
            <MessageSquare className="w-5 h-5" />
            Student Reviews
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {averageRating.toFixed(1)} / 5.0
            </span>
          </div>
        </div>
        <p className="text-slate-500 text-sm">
          Hear from students who studied at this university
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                  {review.student_photo ? (
                    <img 
                      src={review.student_photo} 
                      alt={review.student_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900">{review.student_name}</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (review.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-500 mb-2">
                    {review.course && (
                      <Badge variant="outline" className="text-xs">
                        {review.course}
                      </Badge>
                    )}
                    {review.country && (
                      <Badge variant="outline" className="text-xs">
                        {review.country}
                      </Badge>
                    )}
                    {review.created_date && (
                      <span className="text-xs">
                        {format(new Date(review.created_date), 'MMM yyyy')}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    "{review.testimonial_text}"
                  </p>
                  {review.is_featured && (
                    <div className="mt-2 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">Verified Review</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}