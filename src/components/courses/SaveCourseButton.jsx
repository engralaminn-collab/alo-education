import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SaveCourseButton({ courseId, studentId, variant = "ghost", size = "icon" }) {
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorite-courses', studentId],
    queryFn: () => base44.entities.FavoriteCourse.filter({ student_id: studentId }),
    enabled: !!studentId,
  });

  const isSaved = favorites.some(fav => fav.course_id === courseId);

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.FavoriteCourse.create({
      student_id: studentId,
      course_id: courseId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-courses'] });
      toast.success('Course saved to favorites!');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      const fav = favorites.find(f => f.course_id === courseId);
      if (fav) await base44.entities.FavoriteCourse.delete(fav.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-courses'] });
      toast.success('Course removed from favorites');
    },
  });

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!studentId) {
      toast.error('Please log in to save courses');
      return;
    }
    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={saveMutation.isPending || unsaveMutation.isPending}
      className={isSaved ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-red-500'}
    >
      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
    </Button>
  );
}