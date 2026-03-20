/** Overpass API helper for fetching cafe data from OpenStreetMap */

import type { Cafe } from "./types";

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
  bounds?: number[];
};

type OverpassResponse = {
  elements: OverpassElement[];
};

function parseOpeningHours(hours: string | undefined): string | null {
  if (!hours) return null;
  return hours;
}

function parseBoolTag(tags: Record<string, string> | undefined, key: string): boolean {
  if (!tags || !tags[key]) return false;
  const v = tags[key].toLowerCase();
  return v === "yes" || v === "true" || v === "1";
}

function hasWifi(tags: Record<string, string> | undefined): boolean {
  if (!tags) return false;
  return parseBoolTag(tags, "internet_access") || parseBoolTag(tags, "wifi");
}

function hasOutdoor(tags: Record<string, string> | undefined): boolean {
  if (!tags) return false;
  return (
    parseBoolTag(tags, "outdoor_seating") ||
    tags["outdoor_seating"] === "yes" ||
    tags["seating"]?.toLowerCase().includes("outdoor")
  );
}

function hasPetFriendly(tags: Record<string, string> | undefined): boolean {
  if (!tags) return false;
  return (
    parseBoolTag(tags, "dogs") ||
    parseBoolTag(tags, "dog") ||
    tags["pets"]?.toLowerCase().includes("yes")
  );
}

function buildAddress(tags: Record<string, string> | undefined): string {
  if (!tags) return "";
  const parts: string[] = [];
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:housenumber"]) parts.unshift(tags["addr:housenumber"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
  return parts.filter(Boolean).join(", ") || "Address not available";
}

export async function fetchCafesNearby(lat: number, lng: number, radiusMeters = 3000): Promise<Cafe[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
      way["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
    );
    out body center;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch cafes from Overpass API");
  const data: OverpassResponse = await res.json();

  const cafes: Cafe[] = [];
  const seen = new Set<string>();

  for (const el of data.elements) {
    const osmId = `${el.type[0]}${el.id}`;
    if (seen.has(osmId)) continue;
    seen.add(osmId);

    let lat: number;
    let lng: number;
    if (el.type === "node" && el.lat != null && el.lon != null) {
      lat = el.lat;
      lng = el.lon;
    } else if (el.center) {
      lat = el.center.lat;
      lng = el.center.lon;
    } else continue;

    const tags = el.tags ?? {};
    const name = tags["name"] ?? "Unnamed Cafe";
    const address = buildAddress(tags);

    cafes.push({
      id: osmId,
      name,
      lat,
      lng,
      address,
      tags: {
        wifi: hasWifi(tags),
        outdoor: hasOutdoor(tags),
        petFriendly: hasPetFriendly(tags),
        quiet: parseBoolTag(tags, "quiet") || tags["atmosphere"]?.toLowerCase().includes("quiet"),
        studyFriendly:
          hasWifi(tags) ||
          parseBoolTag(tags, "laptop") ||
          tags["internet_access"] === "wlan",
      },
      openingHours: parseOpeningHours(tags["opening_hours"]),
      phone: tags["phone"] ?? tags["contact:phone"] ?? null,
      website: tags["website"] ?? tags["contact:website"] ?? null,
    });
  }

  return cafes;
}

export async function fetchCafeByOsmId(osmId: string): Promise<Cafe | null> {
  const isNode = osmId.startsWith("n");
  const isWay = osmId.startsWith("w");
  const numStr = osmId.slice(1);
  const num = parseInt(numStr, 10);
  if ((!isNode && !isWay) || isNaN(num)) return null;

  const type = isNode ? "node" : "way";
  const query = `
    [out:json][timeout:10];
    ${type}(${num});
    out body center;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data: OverpassResponse = await res.json();
  const el = data.elements?.[0];
  if (!el) return null;

  let lat: number;
  let lng: number;
  if (el.type === "node" && el.lat != null && el.lon != null) {
    lat = el.lat;
    lng = el.lon;
  } else if (el.center) {
    lat = el.center.lat;
    lng = el.center.lon;
  } else return null;

  const tags = el.tags ?? {};
  const name = tags["name"] ?? "Unnamed Cafe";
  const address = buildAddress(tags);

  return {
    id: osmId,
    name,
    lat,
    lng,
    address,
    tags: {
      wifi: hasWifi(tags),
      outdoor: hasOutdoor(tags),
      petFriendly: hasPetFriendly(tags),
      quiet: parseBoolTag(tags, "quiet") || (tags["atmosphere"]?.toLowerCase().includes("quiet") ?? false),
      studyFriendly:
        hasWifi(tags) ||
        parseBoolTag(tags, "laptop") ||
        tags["internet_access"] === "wlan",
    },
    openingHours: parseOpeningHours(tags["opening_hours"]),
    phone: tags["phone"] ?? tags["contact:phone"] ?? null,
    website: tags["website"] ?? tags["contact:website"] ?? null,
  };
}
