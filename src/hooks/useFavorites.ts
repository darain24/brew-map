/** Hook for managing user favorites via API */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Favorite } from "@/lib/types";

async function fetchFavorites(): Promise<Favorite[]> {
  const res = await fetch("/api/favorites");
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

async function addFavorite(cafeOsmId: string, cafeName: string, cafeLat: number, cafeLng: number) {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cafeOsmId, cafeName, cafeLat, cafeLng }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to add favorite");
  }
}

async function removeFavorite(cafeOsmId: string) {
  const res = await fetch(`/api/favorites?cafeOsmId=${encodeURIComponent(cafeOsmId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
}

export function useFavorites(enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: ({
      cafeOsmId,
      cafeName,
      cafeLat,
      cafeLng,
    }: {
      cafeOsmId: string;
      cafeName: string;
      cafeLat: number;
      cafeLng: number;
    }) => addFavorite(cafeOsmId, cafeName, cafeLat, cafeLng),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const isFavorite = (cafeOsmId: string) =>
    favorites.some((f) => f.cafeOsmId === cafeOsmId);

  return {
    favorites,
    isLoading,
    isFavorite,
    addFavorite: addMutation.mutateAsync,
    removeFavorite: removeMutation.mutateAsync,
    addFavoriteLoading: addMutation.isPending,
    removeFavoriteLoading: removeMutation.isPending,
  };
}
