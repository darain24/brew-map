/** Cafe card for list view */

"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { Cafe } from "@/lib/types";
import { cn, formatOpeningHours } from "@/lib/utils";

type CafeCardProps = {
  cafe: Cafe;
  rating?: number | null;
  distance?: string | null;
};

function getTagLabels(tags: Cafe["tags"]): string[] {
  const labels: string[] = [];
  if (tags.wifi) labels.push("Wi-Fi");
  if (tags.outdoor) labels.push("Outdoor");
  if (tags.petFriendly) labels.push("Pet Friendly");
  if (tags.quiet) labels.push("Quiet");
  if (tags.studyFriendly) labels.push("Study Friendly");
  return labels;
}

export function CafeCard({ cafe, rating = null, distance }: CafeCardProps) {
  const { hoveredCafeId, setHoveredCafeId } = useStore();
  const isHovered = hoveredCafeId === cafe.id;
  const tags = getTagLabels(cafe.tags);
  const displayHours = formatOpeningHours(cafe.openingHours) ?? cafe.openingHours;

  return (
    <Link href={`/cafe/${cafe.id}`} className="block">
      <Card
        className={cn(
          "transition-all cursor-pointer hover:shadow-md hover:ring-2 hover:ring-primary/20",
          isHovered && "ring-2 ring-primary shadow-md"
        )}
        onMouseEnter={() => setHoveredCafeId(cafe.id)}
        onMouseLeave={() => setHoveredCafeId(null)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base truncate">{cafe.name}</CardTitle>
            {rating != null ? (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground shrink-0">No reviews</span>
            )}
          </div>
          <CardDescription className="flex items-center gap-1 text-xs">
            {distance && <span>{distance}</span>}
            {distance && displayHours && " • "}
            {displayHours ? (
              <span>{displayHours}</span>
            ) : (
              <span className="text-muted-foreground">Hours unknown</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {cafe.address || "Address not available"}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
