/** Full cafe detail view with map, info, reviews */

"use client";

import { Star, MapPin, Phone, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useReviews } from "@/hooks/useReviews";
import { LoginModal } from "@/components/auth/LoginModal";
import { CafeMapClient } from "./CafeMapClient";
import type { Cafe } from "@/lib/types";
import { useState } from "react";
import { cn, formatOpeningHours } from "@/lib/utils";

type CafeDetailProps = {
  cafe: Cafe;
};

function getTagLabels(tags: Cafe["tags"]): string[] {
  const labels: string[] = [];
  if (tags.wifi) labels.push("Free Wi-Fi");
  if (tags.outdoor) labels.push("Outdoor Seating");
  if (tags.petFriendly) labels.push("Pet Friendly");
  if (tags.quiet) labels.push("Quiet Zone");
  if (tags.studyFriendly) labels.push("Study Friendly");
  return labels;
}

function ReviewForm({ cafeOsmId, onSuccess }: { cafeOsmId: string; onSuccess: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { addReview, addReviewLoading } = useReviews(cafeOsmId, true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;
    await addReview({ rating, comment: comment || null });
    setRating(0);
    setComment("");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Rating</label>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  r <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          placeholder="Share your experience..."
        />
      </div>
      <Button type="submit" disabled={rating < 1 || addReviewLoading}>
        {addReviewLoading ? "Posting..." : "Post Review"}
      </Button>
    </form>
  );
}

export function CafeDetail({ cafe }: CafeDetailProps) {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, addFavoriteLoading } = useFavorites(!!user);
  const { reviews, averageRating, deleteReview } = useReviews(cafe.id, true);
  const [loginOpen, setLoginOpen] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (isFavorite(cafe.id)) {
      await removeFavorite(cafe.id);
    } else {
      await addFavorite({ cafeOsmId: cafe.id, cafeName: cafe.name, cafeLat: cafe.lat, cafeLng: cafe.lng });
    }
  };

  const tags = getTagLabels(cafe.tags);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{cafe.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              {averageRating != null && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {averageRating.toFixed(1)}
                </span>
              )}
              {cafe.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {cafe.address}
                </span>
              )}
            </div>
          </div>
          <Button
            variant={isFavorite(cafe.id) ? "default" : "outline"}
            onClick={handleToggleFavorite}
            disabled={addFavoriteLoading}
          >
            <Heart
              className={cn("h-4 w-4 mr-2", isFavorite(cafe.id) && "fill-current")}
            />
            {isFavorite(cafe.id) ? "Saved" : "Save to Favorites"}
          </Button>
        </div>

        <div className="h-[200px] rounded-lg overflow-hidden">
          <CafeMapClient
            cafes={[cafe]}
            center={{ lat: cafe.lat, lng: cafe.lng }}
            userLocation={null}
            hoveredCafeId={null}
            onCafeClick={() => {}}
            selectedCafeId={cafe.id}
            className="h-full"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opening Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {formatOpeningHours(cafe.openingHours) ?? cafe.openingHours ?? "Hours not available"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cafe.phone && (
                <a
                  href={`tel:${cafe.phone}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {cafe.phone}
                </a>
              )}
              {cafe.website && (
                <a
                  href={cafe.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {!cafe.phone && !cafe.website && (
                <p className="text-sm text-muted-foreground">No contact info available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What People Are Saying</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4 mt-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {(r.userFullName ?? r.userEmail ?? "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">
                            {r.userFullName ?? r.userEmail ?? "Anonymous"}
                          </span>
                          {user?.id === r.userId && (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteReview(r.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </span>
                          <span>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="text-sm mt-1">{r.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-4">Write a Review</h4>
                  <ReviewForm cafeOsmId={cafe.id} onSuccess={() => {}} />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>{" "}
                  to leave a review.
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
