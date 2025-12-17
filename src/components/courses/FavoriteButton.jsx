import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FavoriteButton({ courseId, size = "default", className }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', studentProfile?.id],
    queryFn: () => base44.entities.FavoriteCourse.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const isFavorite = favorites.some(f => f.course_id === courseId);

  const addFavorite = useMutation({
    mutationFn: () => base44.entities.FavoriteCourse.create({
      student_id: studentProfile.id,
      course_id: courseId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      toast.success('Added to favorites');
    },
  });

  const removeFavorite = useMutation({
    mutationFn: () => {
      const fav = favorites.find(f => f.course_id === courseId);
      return base44.entities.FavoriteCourse.delete(fav.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      toast.success('Removed from favorites');
    },
  });

  const handleClick = () => {
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      base44.auth.redirectToLogin(currentUrl);
      return;
    }
    if (!studentProfile) {
      toast.error('Please complete your profile first');
      return;
    }
    if (isFavorite) {
      removeFavorite.mutate();
    } else {
      addFavorite.mutate();
    }
  };

  return (
    <Button
      size={size}
      variant={isFavorite ? "default" : "outline"}
      onClick={handleClick}
      disabled={addFavorite.isPending || removeFavorite.isPending}
      className={cn(
        isFavorite && "bg-red-500 hover:bg-red-600 text-white",
        className
      )}
    >
      <Heart className={cn("w-4 h-4", size === "sm" && "w-3 h-3", isFavorite && "fill-current")} />
      {size !== "icon" && (
        <span className="ml-2">{isFavorite ? 'Saved' : 'Save'}</span>
      )}
    </Button>
  );
}