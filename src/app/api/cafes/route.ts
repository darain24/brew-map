/** API route to fetch cafes from Overpass API */

import { NextRequest, NextResponse } from "next/server";
import { fetchCafesNearby } from "@/lib/overpass";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return NextResponse.json(
      { error: "Invalid lat or lng" },
      { status: 400 }
    );
  }

  try {
    const cafes = await fetchCafesNearby(latNum, lngNum);
    return NextResponse.json(cafes);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch cafes" },
      { status: 500 }
    );
  }
}
