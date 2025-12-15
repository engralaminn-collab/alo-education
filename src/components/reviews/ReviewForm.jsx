import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const StarInput = ({ value, onChange, label }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ReviewForm({ 
  type = 'university', 
  universityId, 
  courseId, 
  studentProfile,
  onSuccess 
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    rating: 0,
    review_title: '',
    review_text: '',
    would_recommend: true,
    pros: [''],
    cons: [''],
    graduation_year: new Date().getFullYear(),
    // University specific
    academic_rating: 0,
    campus_rating: 0,
    facilities_rating: 0,
    location_rating: 0,
    support_rating: 0,
    // Course specific
    teaching_quality_rating: 0,
    course_content_rating: 0,
    career_prospects_rating: 0,
    value_for_money_rating: 0,
    facilities_rating: 0,
  });

  const createReviewMutation = useMutation({
    mutationFn: (data) => {
      if (type === 'university') {
        return base44.entities.UniversityReview.create(data);
      } else {
        return base44.entities.CourseReview.create(data);
      }
    },
    onSuccess: () => {
      toast.success('Review submitted! It will be published after approval.');
      if (type === 'university') {
        queryClient.invalidateQueries(['university-reviews']);
      } else {
        queryClient.invalidateQueries(['course-reviews']);
      }
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    const reviewData = {
      ...formData,
      student_id: studentProfile?.id,
      student_name: studentProfile?.first_name + ' ' + studentProfile?.last_name,
      pros: formData.pros.filter(p => p.trim()),
      cons: formData.cons.filter(c => c.trim()),
      status: 'pending'
    };

    if (type === 'university') {
      reviewData.university_id = universityId;
    } else {
      reviewData.course_id = courseId;
      reviewData.university_id = universityId;
    }

    createReviewMutation.mutate(reviewData);
  };

  const addItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateItem = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <StarInput
            label="Overall Rating *"
            value={formData.rating}
            onChange={(v) => setFormData({ ...formData, rating: v })}
          />

          {/* Category Ratings */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            {type === 'university' ? (
              <>
                <StarInput label="Academic Quality" value={formData.academic_rating} 
                  onChange={(v) => setFormData({ ...formData, academic_rating: v })} />
                <StarInput label="Campus Life" value={formData.campus_rating}
                  onChange={(v) => setFormData({ ...formData, campus_rating: v })} />
                <StarInput label="Facilities" value={formData.facilities_rating}
                  onChange={(v) => setFormData({ ...formData, facilities_rating: v })} />
                <StarInput label="Location" value={formData.location_rating}
                  onChange={(v) => setFormData({ ...formData, location_rating: v })} />
                <StarInput label="Student Support" value={formData.support_rating}
                  onChange={(v) => setFormData({ ...formData, support_rating: v })} />
              </>
            ) : (
              <>
                <StarInput label="Teaching Quality" value={formData.teaching_quality_rating}
                  onChange={(v) => setFormData({ ...formData, teaching_quality_rating: v })} />
                <StarInput label="Course Content" value={formData.course_content_rating}
                  onChange={(v) => setFormData({ ...formData, course_content_rating: v })} />
                <StarInput label="Career Prospects" value={formData.career_prospects_rating}
                  onChange={(v) => setFormData({ ...formData, career_prospects_rating: v })} />
                <StarInput label="Value for Money" value={formData.value_for_money_rating}
                  onChange={(v) => setFormData({ ...formData, value_for_money_rating: v })} />
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <Label>Review Title</Label>
            <Input
              placeholder="Summarize your experience"
              value={formData.review_title}
              onChange={(e) => setFormData({ ...formData, review_title: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Review Text */}
          <div>
            <Label>Your Review *</Label>
            <Textarea
              placeholder="Share your detailed experience..."
              rows={6}
              value={formData.review_text}
              onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
              required
              className="mt-2"
            />
          </div>

          {/* Pros */}
          <div>
            <Label>Pros</Label>
            <div className="space-y-2 mt-2">
              {formData.pros.map((pro, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Add a positive point"
                    value={pro}
                    onChange={(e) => updateItem('pros', idx, e.target.value)}
                  />
                  {formData.pros.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem('pros', idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addItem('pros')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pro
              </Button>
            </div>
          </div>

          {/* Cons */}
          <div>
            <Label>Cons</Label>
            <div className="space-y-2 mt-2">
              {formData.cons.map((con, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Add a concern"
                    value={con}
                    onChange={(e) => updateItem('cons', idx, e.target.value)}
                  />
                  {formData.cons.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem('cons', idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addItem('cons')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Con
              </Button>
            </div>
          </div>

          {/* Graduation Year */}
          <div>
            <Label>Graduation Year</Label>
            <Input
              type="number"
              min="2000"
              max="2030"
              value={formData.graduation_year}
              onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
              className="mt-2"
            />
          </div>

          {/* Recommendation */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recommend"
              checked={formData.would_recommend}
              onChange={(e) => setFormData({ ...formData, would_recommend: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="recommend" className="cursor-pointer">
              I would recommend this {type} to others
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createReviewMutation.isPending}
          >
            {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}