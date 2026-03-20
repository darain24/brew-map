/** City search input with autocomplete dropdown */

"use client";

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Suggestion = {
  lat: number;
  lng: number;
  label: string;
  city: string;
  country: string;
};

type CitySearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (lat: number, lng: number, label: string) => void;
  onSearch: () => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  hasActiveSearch?: boolean;
};

export const CitySearchInput = forwardRef<{ focus: () => void } | null, CitySearchInputProps>(function CitySearchInput({
  value,
  onChange,
  onSelect,
  onSearch,
  onClear,
  placeholder = "Search city or country...",
  className = "",
  hasActiveSearch = false,
}, ref) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      const input = containerRef.current?.querySelector("input");
      if (input instanceof HTMLInputElement) input.focus();
    },
  }));

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setSelectedIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
      setShowDropdown(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (s: Suggestion) => {
    onSelect(s.lat, s.lng, s.label);
    onChange(s.label);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") onSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowDropdown(false);
    onClear?.();
  };

  /** Any typed text or an active map search — show X so partial queries can be cleared */
  const showClear = value.trim().length > 0 || hasActiveSearch;

  return (
    <div ref={containerRef} className={`relative flex-1 flex ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        className="pl-9 pr-9"
      />
      {showClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No results</div>
          ) : (
            <ul className="py-1">
              {suggestions.map((s, i) => (
                <li key={`${s.lat}-${s.lng}-${s.label}`}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                      i === selectedIndex ? "bg-muted" : ""
                    }`}
                    onClick={() => handleSelect(s)}
                  >
                    <span className="font-medium">{s.city || s.label.split(",")[0] || s.label}</span>
                    {s.country && (
                      <span className="text-muted-foreground">
                        {s.city ? ", " : " — "}{s.country}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
});
