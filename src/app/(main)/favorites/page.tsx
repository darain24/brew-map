/** Favorites page - protected */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { favorites, isLoading, removeFavorite, removeFavoriteLoading } = useFavorites(!!user);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {isLoading ? (
        <div className="text-muted-foreground">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No favorites yet</p>
          <p className="text-muted-foreground mt-1">
            Save cafes you love by clicking the heart on their detail page.
          </p>
          <Link href="/">
            <Button className="mt-4">Explore Cafes</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favorites.map((fav) => (
            <Card key={fav.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    <Link href={`/cafe/${fav.cafeOsmId}`} className="hover:underline">
                      {fav.cafeName ?? "Unnamed Cafe"}
                    </Link>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeFavorite(fav.cafeOsmId)}
                    disabled={removeFavoriteLoading}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fav.cafeLat != null && fav.cafeLng != null && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {fav.cafeLat.toFixed(4)}, {fav.cafeLng.toFixed(4)}
                  </p>
                )}
                <Link href={`/cafe/${fav.cafeOsmId}`}>
                  <Button variant="outline" size="sm" className="mt-2">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
