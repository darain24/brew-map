/** Cafe detail page */

import { notFound } from "next/navigation";
import { CafeDetail } from "@/components/cafe/CafeDetail";

async function getCafe(osmId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/cafes/${encodeURIComponent(osmId)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function CafePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cafe = await getCafe(id);
  if (!cafe) notFound();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <CafeDetail cafe={cafe} />
    </div>
  );
}
