import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UniversityFavoriteButton({ universityId, size = "default", className }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: savedComparisons = [] } = useQuery({
    queryKey: ['saved-comparisons', studentProfile?.id],
    queryFn: () => base44.entities.SavedComparison.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const isFavorite = savedComparisons.some(c => 
    c.university_ids?.includes(universityId)
  );

  const addFavorite = useMutation({
    mutationFn: () => base44.entities.SavedComparison.create({
      student_id: studentProfile.id,
      name: 'Favorite',
      university_ids: [universityId],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-comparisons']);
      toast.success('Added to favorites');
    },
  });

  const removeFavorite = useMutation({
    mutationFn: () => {
      const fav = savedComparisons.find(c => 
        c.university_ids?.length === 1 && c.university_ids[0] === universityId
      );
      if (fav) return base44.entities.SavedComparison.delete(fav.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-comparisons']);
      toast.success('Removed from favorites');
    },
  });

  const handleClick = () => {
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