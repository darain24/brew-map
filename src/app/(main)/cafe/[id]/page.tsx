/** Cafe detail page */

import { notFound } from "next/navigation";
import { CafeDetail } from "@/components/cafe/CafeDetail";
import { fetchCafeByOsmId } from "@/lib/overpass";

export default async function CafePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cafe = await fetchCafeByOsmId(id);
  if (!cafe) notFound();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <CafeDetail cafe={cafe} />
    </div>
  );
}
