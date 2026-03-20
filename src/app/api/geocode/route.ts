/** Geocoding API - proxies Nominatim with proper User-Agent */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limit = searchParams.get("limit") ?? "8";

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q.trim())}&limit=${limit}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "BrewMap/1.0 (contact@brewmap.app)",
      },
    });
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    return NextResponse.json(
      (data as Array<{ lat: string; lon: string; display_name: string; address?: Record<string, string> }>).map(
        (p) => ({
          lat: parseFloat(p.lat),
          lng: parseFloat(p.lon),
          label: p.display_name,
          city: p.address?.city ?? p.address?.town ?? p.address?.village ?? p.address?.municipality ?? "",
          country: p.address?.country ?? "",
        })
      )
    );
  } catch {
    return NextResponse.json([]);
  }
}
