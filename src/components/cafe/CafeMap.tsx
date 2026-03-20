/** Leaflet map component showing cafes and user location */

"use client";

import { useEffect, useRef, useMemo } from "react";
import type { Cafe } from "@/lib/types";

type CafeMapProps = {
  cafes: Cafe[];
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  hoveredCafeId: string | null;
  onCafeClick: (cafe: Cafe) => void;
  selectedCafeId?: string | null;
  className?: string;
};

export function CafeMap({
  cafes,
  center,
  userLocation,
  hoveredCafeId,
  onCafeClick,
  selectedCafeId,
  className = "",
}: CafeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const userMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);

  const CoffeeIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    return {
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full shadow-md border-2 border-white" style="background: var(--primary); color: var(--primary-foreground)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
          <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm14 2H4v10h12V7zm2 4h2V9h-2v4z"/>
        </svg>
      </div>`,
      iconSize: [32, 32] as [number, number],
      iconAnchor: [16, 16] as [number, number],
    };
  }, []);

  const HighlightedIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    return {
      html: `<div class="flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-4 border-amber-400" style="background: var(--primary); color: var(--primary-foreground)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm14 2H4v10h12V7zm2 4h2V9h-2v4z"/>
        </svg>
      </div>`,
      iconSize: [40, 40] as [number, number],
      iconAnchor: [20, 20] as [number, number],
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.default.map(mapRef.current!).setView([center.lat, center.lng], 14);
        L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;
      map.setView([center.lat, center.lng], map.getZoom());
    });

    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapInstanceRef.current || !CoffeeIcon || !HighlightedIcon) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;
      const map = mapInstanceRef.current!;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();

      const createIcon = (opts: { html: string; iconSize: [number, number]; iconAnchor: [number, number] }, className: string) =>
        L.default.divIcon({
          className,
          html: opts.html,
          iconSize: opts.iconSize,
          iconAnchor: opts.iconAnchor,
        });

      cafes.forEach((cafe) => {
        const isHighlighted = cafe.id === hoveredCafeId || cafe.id === selectedCafeId;
        const marker = L.default.marker([cafe.lat, cafe.lng], {
          icon: createIcon(isHighlighted ? HighlightedIcon : CoffeeIcon, isHighlighted ? "custom-marker-highlighted" : "custom-marker"),
        })
          .addTo(map)
          .on("click", () => onCafeClick(cafe));

        const popup = L.default.popup().setContent(
          `<div class="p-2 min-w-[140px]">
            <p class="font-semibold text-sm">${cafe.name.replace(/</g, "&lt;")}</p>
            <a href="/cafe/${cafe.id}" class="text-primary text-sm hover:underline">View Details</a>
          </div>`
        );
        marker.bindPopup(popup);
        markersRef.current.set(cafe.id, marker);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [cafes, hoveredCafeId, selectedCafeId, CoffeeIcon, HighlightedIcon, onCafeClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;
      const map = mapInstanceRef.current!;

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      userMarkerRef.current = L.default.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        fillColor: "#3b82f6",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);
    });

    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  return <div ref={mapRef} className={`h-full min-h-[300px] rounded-lg ${className}`} />;
}
