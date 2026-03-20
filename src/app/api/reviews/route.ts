/** API route for cafe reviews */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cafeOsmId = searchParams.get("cafeOsmId");
  if (!cafeOsmId) {
    return NextResponse.json(
      { error: "cafeOsmId is required" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, user_id, cafe_osm_id, rating, comment, created_at")
    .eq("cafe_osm_id", cafeOsmId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const userIds = Array.from(new Set((reviews ?? []).map((r) => r.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { fullName: p.full_name, email: p.email }])
  );

  const enriched = (reviews ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    cafeOsmId: r.cafe_osm_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    userFullName: profileMap.get(r.user_id)?.fullName ?? null,
    userEmail: profileMap.get(r.user_id)?.email ?? null,
  }));

  return NextResponse.json(enriched);
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
  const { cafeOsmId, rating, comment } = body;

  if (!cafeOsmId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "cafeOsmId and rating (1-5) are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    cafe_osm_id: cafeOsmId,
    rating: Number(rating),
    comment: comment ?? null,
  });

  if (error) {
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
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "id is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
