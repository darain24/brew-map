/** Filter bar for cafes: wifi, outdoor, pet-friendly, etc. */

"use client";

import { Wifi, Sun, PawPrint, VolumeX, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "outdoor", label: "Outdoor Seating", icon: Sun },
  { id: "petFriendly", label: "Pet Friendly", icon: PawPrint },
  { id: "quiet", label: "Quiet", icon: VolumeX },
  { id: "studyFriendly", label: "Study Friendly", icon: BookOpen },
] as const;

export function CafeFilters() {
  const { activeFilters, toggleFilter } = useStore();

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ id, label, icon: Icon }) => {
        const active = activeFilters.includes(id);
        return (
          <Badge
            key={id}
            variant={active ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all hover:opacity-90",
              active && "bg-primary"
            )}
            onClick={() => toggleFilter(id)}
          >
            <Icon className="h-3.5 w-3.5 mr-1" />
            {label}
          </Badge>
        );
      })}
    </div>
  );
}
