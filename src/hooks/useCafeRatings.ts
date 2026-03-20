/** Hook to fetch average ratings for multiple cafes */

"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchRatings(cafeIds: string[]): Promise<Record<string, { average: number; count: number }>> {
  if (cafeIds.length === 0) return {};
  const res = await fetch(`/api/reviews/ratings?cafeIds=${cafeIds.join(",")}`);
  if (!res.ok) return {};
  return res.json();
}

export function useCafeRatings(cafeIds: string[]) {
  return useQuery({
    queryKey: ["cafeRatings", [...cafeIds].sort().join(",")],
    queryFn: () => fetchRatings(cafeIds),
    enabled: cafeIds.length > 0,
  });
}
