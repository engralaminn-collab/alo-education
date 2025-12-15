import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ThumbsUp, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
};

export default function UniversityReviewsList({ universityId, studentProfile }) {
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['university-reviews', universityId],
    queryFn: () => base44.entities.UniversityReview.filter({ university_id: universityId, status: 'approved' }),
    enabled: !!universityId,
  });

  const markHelpfulMutation = useMutation({
    mutationFn: ({ reviewId, currentCount }) => 
      base44.entities.UniversityReview.update(reviewId, { helpful_count: currentCount + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['university-reviews', universityId]);
      toast.success('Thank you for your feedback!');
    },
  });

  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      default:
        return 0;
    }
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 mb-2">{averageRating}</div>
              <StarRating rating={Math.round(averageRating)} size="lg" />
              <p className="text-slate-600 text-sm mt-2">Based on {reviews.length} reviews</p>
            </div>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-600">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        ) : (
          sortedReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{review.student_name}</span>
                        {review.is_verified && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} />
                        {review.graduation_year && (
                          <span className="text-sm text-slate-500">Class of {review.graduation_year}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.review_title && (
                    <h4 className="font-bold text-slate-900 mb-2">{review.review_title}</h4>
                  )}

                  <p className="text-slate-700 mb-4 leading-relaxed">{review.review_text}</p>

                  {/* Category Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-4 bg-slate-50 rounded-lg">
                    {[
                      { label: 'Academic', value: review.academic_rating },
                      { label: 'Campus', value: review.campus_rating },
                      { label: 'Facilities', value: review.facilities_rating },
                      { label: 'Location', value: review.location_rating },
                      { label: 'Support', value: review.support_rating }
                    ].map(cat => cat.value && (
                      <div key={cat.label} className="text-center">
                        <div className="text-xs text-slate-600 mb-1">{cat.label}</div>
                        <div className="font-bold text-slate-900">{cat.value.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {review.pros?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          Pros
                        </div>
                        <ul className="space-y-1">
                          {review.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2">
                          <TrendingDown className="w-4 h-4" />
                          Cons
                        </div>
                        <ul className="space-y-1">
                          {review.cons.map((con, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-red-600 mt-0.5">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommendation */}
                  {review.would_recommend !== undefined && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        {review.would_recommend ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">Would recommend</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-600">Would not recommend</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpfulMutation.mutate({ 
                          reviewId: review.id, 
                          currentCount: review.helpful_count || 0 
                        })}
                        disabled={markHelpfulMutation.isPending}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({review.helpful_count || 0})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}