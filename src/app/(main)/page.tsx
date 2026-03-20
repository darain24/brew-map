/** Homepage - search, map, filters, cafe list */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CafeCard } from "@/components/cafe/CafeCard";
import { CafeFilters } from "@/components/cafe/CafeFilters";
import { CafeMapClient } from "@/components/cafe/CafeMapClient";
import { CitySearchInput } from "@/components/cafe/CitySearchInput";
import { useStore } from "@/lib/store";
import { useCafes } from "@/hooks/useCafes";
import { useCafeRatings } from "@/hooks/useCafeRatings";
import { distanceMiles, formatDistance } from "@/lib/utils";
import type { Cafe } from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

function filterCafes(cafes: Cafe[], filters: string[]): Cafe[] {
  if (filters.length === 0) return cafes;
  return cafes.filter((c) => {
    return filters.every((f) => {
      const key = f as keyof Cafe["tags"];
      return c.tags[key] === true;
    });
  });
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [mapExpanded, setMapExpanded] = useState(true);
  const searchInputRef = useRef<{ focus: () => void } | null>(null);
  const { searchLocation, setSearchLocation, activeFilters, hoveredCafeId, userLocation, setUserLocation } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const center = searchLocation
    ? { lat: searchLocation.lat, lng: searchLocation.lng }
    : userLocation ?? DEFAULT_CENTER;

  const hasLocation = !!(searchLocation || userLocation);
  const { data: cafes = [], isLoading, error } = useCafes(center.lat, center.lng, hasLocation);

  const filteredCafes = filterCafes(cafes, activeFilters);
  const cafeIds = filteredCafes.map((c) => c.id);
  const { data: ratingsMap = {} } = useCafeRatings(cafeIds);

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setSearchLocation({ lat: latitude, lng: longitude, label: "My location" });
        setSearchInput("My location");
      },
      () => {}
    );
  }, [setSearchLocation, setUserLocation]);

  const handleClear = useCallback(() => {
    setSearchInput("");
    setSearchLocation(null);
    setUserLocation(null);
  }, [setSearchLocation, setUserLocation]);

  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) return;
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchInput)}&limit=1`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        setSearchLocation({ lat: first.lat, lng: first.lng, label: first.label });
        setSearchInput(first.label);
        setUserLocation(null);
      }
    } catch {
      // Ignore geocoding errors
    }
  }, [searchInput, setSearchLocation, setUserLocation]);

  const handleSelectLocation = useCallback(
    (lat: number, lng: number, label: string) => {
      setSearchLocation({ lat, lng, label });
      setUserLocation(null);
    },
    [setSearchLocation, setUserLocation]
  );

  const handleCafeClick = useCallback((cafe: Cafe) => {
    setSearchLocation({ lat: cafe.lat, lng: cafe.lng, label: cafe.name });
    setSearchInput(cafe.name);
  }, [setSearchLocation]);

  const refPoint = userLocation ?? (searchLocation ? { lat: searchLocation.lat, lng: searchLocation.lng } : null);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.14))] md:h-[calc(100vh-theme(spacing.14))]">
      <div className="border-b bg-background p-4">
        <h1 className="text-xl font-bold text-primary mb-2">BrewMap - Find Your Perfect Spot</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <CitySearchInput
            ref={searchInputRef}
            value={searchInput}
            onChange={setSearchInput}
            onSelect={handleSelectLocation}
            onSearch={handleSearch}
            onClear={handleClear}
            hasActiveSearch={hasLocation}
            placeholder="Search city or country... (⌘K or Ctrl+K)"
          />
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outline" onClick={handleUseLocation}>
            <MapPin className="h-4 w-4 mr-1" />
            Use my location
          </Button>
          {hasLocation && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
        <div className="mt-3">
          <CafeFilters />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className="flex-1 overflow-y-auto p-4 border-r min-w-0">
          {!hasLocation ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter a city or click &quot;Use my location&quot; to find cafes.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Failed to load cafes. Please try again.
            </div>
          ) : filteredCafes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No cafes found. Try adjusting your filters or search location.
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filteredCafes.length} cafe{filteredCafes.length !== 1 ? "s" : ""} found
              </p>
              <div className="space-y-3">
                {filteredCafes.map((cafe) => (
                  <CafeCard
                    key={cafe.id}
                    cafe={cafe}
                    rating={ratingsMap[cafe.id]?.average ?? null}
                    distance={
                      refPoint
                        ? formatDistance(distanceMiles(refPoint.lat, refPoint.lng, cafe.lat, cafe.lng))
                        : null
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden md:flex md:flex-1 md:min-w-[400px] p-4">
          {hasLocation && (
            <div className="flex-1 rounded-lg overflow-hidden border">
              <CafeMapClient
                cafes={filteredCafes}
                center={center}
                userLocation={userLocation}
                hoveredCafeId={hoveredCafeId}
                onCafeClick={handleCafeClick}
                className="h-full"
              />
            </div>
          )}
        </div>

        <div className="md:hidden border-t">
          <Button
            variant="outline"
            className="w-full rounded-none"
            onClick={() => setMapExpanded(!mapExpanded)}
          >
            {mapExpanded ? "Hide Map" : "Show Map"}
          </Button>
          {mapExpanded && hasLocation && (
            <div className="h-[250px] mx-4 mb-4 rounded-lg overflow-hidden border">
              <CafeMapClient
                cafes={filteredCafes}
                center={center}
                userLocation={userLocation}
                hoveredCafeId={hoveredCafeId}
                onCafeClick={handleCafeClick}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
