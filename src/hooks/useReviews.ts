/** Hook for managing cafe reviews via API */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "@/lib/types";

async function fetchReviews(cafeOsmId: string): Promise<Review[]> {
  const res = await fetch(`/api/reviews?cafeOsmId=${encodeURIComponent(cafeOsmId)}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

async function addReview(cafeOsmId: string, rating: number, comment: string | null) {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cafeOsmId, rating, comment }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to add review");
  }
}

async function deleteReview(reviewId: string) {
  const res = await fetch(`/api/reviews?id=${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete review");
}

export function useReviews(cafeOsmId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", cafeOsmId],
    queryFn: () => fetchReviews(cafeOsmId!),
    enabled: enabled && !!cafeOsmId,
  });

  const addMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string | null }) =>
      addReview(cafeOsmId!, rating, comment),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reviews", cafeOsmId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reviews", cafeOsmId] }),
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return {
    reviews,
    isLoading,
    averageRating,
    addReview: addMutation.mutateAsync,
    deleteReview: deleteMutation.mutateAsync,
    addReviewLoading: addMutation.isPending,
    deleteReviewLoading: deleteMutation.isPending,
  };
}
