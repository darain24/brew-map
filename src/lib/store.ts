/** Zustand store for BrewMap global state */

import { create } from "zustand";
import type { SearchLocation } from "./types";

type Store = {
  searchLocation: SearchLocation | null;
  activeFilters: string[];
  hoveredCafeId: string | null;
  userLocation: { lat: number; lng: number } | null;
  setSearchLocation: (loc: SearchLocation | null) => void;
  toggleFilter: (filter: string) => void;
  setHoveredCafeId: (id: string | null) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
};

export const useStore = create<Store>((set) => ({
  searchLocation: null,
  activeFilters: [],
  hoveredCafeId: null,
  userLocation: null,
  setSearchLocation: (loc) => set({ searchLocation: loc }),
  toggleFilter: (filter) =>
    set((s) => ({
      activeFilters: s.activeFilters.includes(filter)
        ? s.activeFilters.filter((f) => f !== filter)
        : [...s.activeFilters, filter],
    })),
  setHoveredCafeId: (id) => set({ hoveredCafeId: id }),
  setUserLocation: (loc) => set({ userLocation: loc }),
}));
