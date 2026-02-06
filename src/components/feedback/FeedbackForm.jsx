import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackForm({ feedbackType, relatedId, milestone, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
    would_recommend: true,
    is_public: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    onSubmit({
      ...formData,
      rating,
      feedback_type: feedbackType,
      milestone,
      [`${feedbackType}_id`]: relatedId
    });
  };

  return (
    <Card className="border-2 border-alo-orange/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-alo-orange" />
          Share Your Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">How would you rate your experience?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-alo-orange text-alo-orange'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of your experience"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label>Your Feedback</Label>
            <Textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Tell us about your experience..."
              rows={5}
              className="mt-2"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.would_recommend}
                onChange={(e) => setFormData({ ...formData, would_recommend: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-education-blue"
              />
              <span className="text-sm text-slate-700">I would recommend ALO Education to others</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-education-blue"
              />
              <span className="text-sm text-slate-700">Allow ALO Education to publish this as a testimonial</span>
            </label>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-education-blue to-alo-orange">
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}