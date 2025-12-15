import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, ThumbsUp, CheckCircle, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function UniversityReviewsSection({ universityId }) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    academic_rating: 5,
    campus_rating: 5,
    facilities_rating: 5,
    location_rating: 5,
    support_rating: 5,
    review_title: '',
    review_text: '',
    course_studied: '',
    would_recommend: true,
    pros: [],
    cons: []
  });
  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');

  const queryClient = useQueryClient();

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

  const { data: reviews = [] } = useQuery({
    queryKey: ['university-reviews', universityId],
    queryFn: () => base44.entities.UniversityReview.filter({ 
      university_id: universityId, 
      status: 'approved' 
    }, '-created_date'),
    enabled: !!universityId,
  });

  const submitReview = useMutation({
    mutationFn: async (data) => {
      if (!user) {
        throw new Error('Please log in to submit a review');
      }
      return await base44.entities.UniversityReview.create({
        ...data,
        university_id: universityId,
        student_id: studentProfile?.id,
        student_name: user.full_name || user.email,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Review submitted! It will be visible after approval.');
      setShowReviewDialog(false);
      queryClient.invalidateQueries(['university-reviews', universityId]);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit review');
    }
  });

  const resetForm = () => {
    setReviewForm({
      rating: 5,
      academic_rating: 5,
      campus_rating: 5,
      facilities_rating: 5,
      location_rating: 5,
      support_rating: 5,
      review_title: '',
      review_text: '',
      course_studied: '',
      would_recommend: true,
      pros: [],
      cons: []
    });
    setProInput('');
    setConInput('');
  };

  const addPro = () => {
    if (proInput.trim()) {
      setReviewForm(prev => ({ ...prev, pros: [...prev.pros, proInput.trim()] }));
      setProInput('');
    }
  };

  const addCon = () => {
    if (conInput.trim()) {
      setReviewForm(prev => ({ ...prev, cons: [...prev.cons, conInput.trim()] }));
      setConInput('');
    }
  };

  const removePro = (index) => {
    setReviewForm(prev => ({ ...prev, pros: prev.pros.filter((_, i) => i !== index) }));
  };

  const removeCon = (index) => {
    setReviewForm(prev => ({ ...prev, cons: prev.cons.filter((_, i) => i !== index) }));
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingBreakdown = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const avgCategoryRatings = {
    academic: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.academic_rating || 0), 0) / reviews.length).toFixed(1) : 0,
    campus: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.campus_rating || 0), 0) / reviews.length).toFixed(1) : 0,
    facilities: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.facilities_rating || 0), 0) / reviews.length).toFixed(1) : 0,
    location: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.location_rating || 0), 0) / reviews.length).toFixed(1) : 0,
    support: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.support_rating || 0), 0) / reviews.length).toFixed(1) : 0,
  };

  const RatingStars = ({ rating, size = 'sm', interactive = false, onChange }) => {
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} ${interactive ? 'cursor-pointer hover:fill-amber-400 hover:text-amber-400' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Overall Score */}
            <div className="flex flex-col items-center justify-center md:w-1/3 border-r border-slate-200 pr-8">
              <div className="text-6xl font-bold" style={{ color: 'var(--alo-blue)' }}>{avgRating}</div>
              <RatingStars rating={Math.round(avgRating)} size="lg" />
              <p className="text-slate-600 mt-2">{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{star}★</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${reviews.length > 0 ? (ratingBreakdown[star] / reviews.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 w-8">{ratingBreakdown[star]}</span>
                </div>
              ))}
            </div>

            {/* Category Ratings */}
            <div className="md:w-1/3 border-l border-slate-200 pl-8">
              <h4 className="font-semibold text-slate-900 mb-4">Category Ratings</h4>
              <div className="space-y-3">
                {[
                  { label: 'Academic', value: avgCategoryRatings.academic, icon: Award },
                  { label: 'Campus Life', value: avgCategoryRatings.campus, icon: MessageSquare },
                  { label: 'Facilities', value: avgCategoryRatings.facilities, icon: TrendingUp },
                  { label: 'Location', value: avgCategoryRatings.location, icon: Star },
                  { label: 'Support', value: avgCategoryRatings.support, icon: ThumbsUp }
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--alo-blue)' }}>{value}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-center">
            <Button
              onClick={() => setShowReviewDialog(true)}
              className="font-semibold"
              style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--alo-blue)' }}>
                        {review.student_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{review.student_name}</h4>
                          {review.is_verified && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        {review.course_studied && (
                          <p className="text-sm text-slate-500">{review.course_studied}</p>
                        )}
                        {review.graduation_year && (
                          <p className="text-xs text-slate-400">Class of {review.graduation_year}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <RatingStars rating={review.rating} size="md" />
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(review.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {review.review_title && (
                  <h3 className="font-semibold text-slate-900 mb-2">{review.review_title}</h3>
                )}
                
                <p className="text-slate-600 mb-4 leading-relaxed">{review.review_text}</p>

                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {review.pros?.length > 0 && (
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h5 className="font-semibold text-emerald-700 mb-2 text-sm">Pros</h5>
                        <ul className="space-y-1">
                          {review.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-emerald-600">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons?.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-700 mb-2 text-sm">Cons</h5>
                        <ul className="space-y-1">
                          {review.cons.map((con, i) => (
                            <li key={i} className="text-sm text-red-600">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {review.would_recommend && (
                  <Badge className="bg-blue-100 text-blue-700">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Would Recommend
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Write Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Overall Rating *</label>
              <RatingStars
                rating={reviewForm.rating}
                size="lg"
                interactive
                onChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
              />
            </div>

            {/* Category Ratings */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'academic_rating', label: 'Academic Quality' },
                { key: 'campus_rating', label: 'Campus Life' },
                { key: 'facilities_rating', label: 'Facilities' },
                { key: 'location_rating', label: 'Location' },
                { key: 'support_rating', label: 'Student Support' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-sm font-medium mb-2 block">{label}</label>
                  <RatingStars
                    rating={reviewForm[key]}
                    size="md"
                    interactive
                    onChange={(rating) => setReviewForm(prev => ({ ...prev, [key]: rating }))}
                  />
                </div>
              ))}
            </div>

            {/* Review Title */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Review Title *</label>
              <Input
                placeholder="Summarize your experience"
                value={reviewForm.review_title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, review_title: e.target.value }))}
              />
            </div>

            {/* Course Studied */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Course Studied</label>
              <Input
                placeholder="e.g., MSc Computer Science"
                value={reviewForm.course_studied}
                onChange={(e) => setReviewForm(prev => ({ ...prev, course_studied: e.target.value }))}
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Your Review *</label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewForm.review_text}
                onChange={(e) => setReviewForm(prev => ({ ...prev, review_text: e.target.value }))}
                rows={6}
              />
            </div>

            {/* Pros */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Pros</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a positive aspect"
                  value={proInput}
                  onChange={(e) => setProInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                />
                <Button onClick={addPro} type="button">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {reviewForm.pros.map((pro, i) => (
                  <Badge key={i} className="bg-emerald-100 text-emerald-700">
                    {pro}
                    <button onClick={() => removePro(i)} className="ml-2">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Cons</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a negative aspect"
                  value={conInput}
                  onChange={(e) => setConInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                />
                <Button onClick={addCon} type="button">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {reviewForm.cons.map((con, i) => (
                  <Badge key={i} className="bg-red-100 text-red-700">
                    {con}
                    <button onClick={() => removeCon(i)} className="ml-2">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Would Recommend */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommend"
                checked={reviewForm.would_recommend}
                onChange={(e) => setReviewForm(prev => ({ ...prev, would_recommend: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="recommend" className="text-sm font-medium cursor-pointer">
                I would recommend this university
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => submitReview.mutate(reviewForm)}
                disabled={!reviewForm.review_title || !reviewForm.review_text || submitReview.isPending}
                className="flex-1"
                style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
              >
                {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}