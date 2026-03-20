/** API route to get average ratings for multiple cafes */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cafeIds = searchParams.get("cafeIds");
  if (!cafeIds) {
    return NextResponse.json(
      { error: "cafeIds is required (comma-separated)" },
      { status: 400 }
    );
  }

  const ids = cafeIds.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return NextResponse.json({});

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("cafe_osm_id, rating")
    .in("cafe_osm_id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byCafe = new Map<string, { sum: number; count: number }>();
  for (const r of data ?? []) {
    const current = byCafe.get(r.cafe_osm_id) ?? { sum: 0, count: 0 };
    current.sum += r.rating;
    current.count += 1;
    byCafe.set(r.cafe_osm_id, current);
  }

  const result: Record<string, { average: number; count: number }> = {};
  byCafe.forEach((v, id) => {
    result[id] = {
      average: v.sum / v.count,
      count: v.count,
    };
  });

  return NextResponse.json(result);
}
