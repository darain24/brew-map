/** TanStack Query hook for fetching cafes via API */

"use client";

import { useQuery } from "@tanstack/react-query";
import type { Cafe } from "@/lib/types";

const STALE_TIME_MS = 5 * 60 * 1000;

async function fetchCafes(lat: number, lng: number): Promise<Cafe[]> {
  const res = await fetch(`/api/cafes?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error("Failed to fetch cafes");
  return res.json();
}

export function useCafes(lat: number | null, lng: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ["cafes", lat, lng],
    queryFn: () => fetchCafes(lat!, lng!),
    enabled: enabled && lat != null && lng != null,
    staleTime: STALE_TIME_MS,
  });
}
