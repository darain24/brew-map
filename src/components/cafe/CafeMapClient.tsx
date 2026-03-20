/** Client wrapper for CafeMap - loads Leaflet only on client */

"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cafe } from "@/lib/types";

const CafeMapInner = dynamic(
  () => import("./CafeMap").then((m) => ({ default: m.CafeMap })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[300px] w-full rounded-lg" />,
  }
);

type Props = {
  cafes: Cafe[];
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  hoveredCafeId: string | null;
  onCafeClick: (cafe: Cafe) => void;
  selectedCafeId?: string | null;
  className?: string;
};

export function CafeMapClient(props: Props) {
  return <CafeMapInner {...props} />;
}
