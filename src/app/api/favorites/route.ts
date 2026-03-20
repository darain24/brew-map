/** API route for user favorites */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { cafeOsmId, cafeName, cafeLat, cafeLng } = body;

  if (!cafeOsmId) {
    return NextResponse.json(
      { error: "cafeOsmId is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    cafe_osm_id: cafeOsmId,
    cafe_name: cafeName ?? null,
    cafe_lat: cafeLat ?? null,
    cafe_lng: cafeLng ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Already in favorites" }, { status: 200 });
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cafeOsmId = searchParams.get("cafeOsmId");

  if (!cafeOsmId) {
    return NextResponse.json(
      { error: "cafeOsmId is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("cafe_osm_id", cafeOsmId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
