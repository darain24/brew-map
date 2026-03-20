/** API route to fetch a single cafe by OSM ID */

import { NextRequest, NextResponse } from "next/server";
import { fetchCafeByOsmId } from "@/lib/overpass";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const cafe = await fetchCafeByOsmId(id);
    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
    }
    return NextResponse.json(cafe);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch cafe" },
      { status: 500 }
    );
  }
}
