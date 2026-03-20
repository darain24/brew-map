/** Profile page - protected */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Star } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const supabase = createClient();

  const hasPasswordAuth = user?.app_metadata?.provider === "email";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data?.full_name) setFullName(data.full_name);
      if (user.email) setNewEmail(user.email);
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase is stable
  }, [user?.id, user?.email]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      if (hasPasswordAuth && currentPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user!.email!,
          password: currentPassword,
        });
        if (signInError) {
          setPasswordError("Current password is incorrect");
          setPasswordSaving(false);
          return;
        }
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="h-10 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl">
              {(user.email ?? "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangeEmail} className="space-y-4">
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
                {emailSuccess && (
                  <p className="text-sm text-green-600">Check your new email to confirm the change.</p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    required
                  />
                </div>
                <Button type="submit" disabled={emailSaving}>
                  {emailSaving ? "Updating..." : "Update email"}
                </Button>
              </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
              {!hasPasswordAuth ? (
                <p className="text-sm text-muted-foreground">
                  You signed in with a social provider. Set a password below to enable password sign-in.
                </p>
              ) : null}
              <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-600">Password updated successfully.</p>
                )}
                {hasPasswordAuth && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current password</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {hasPasswordAuth ? "New password" : "Password"}
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={passwordSaving}>
                  {passwordSaving ? "Updating..." : "Update password"}
                </Button>
              </form>
          </CardContent>
        </Card>

        <UserReviewsSection userId={user.id} />
      </div>
    </div>
  );
}

function UserReviewsSection({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<Array<{
    id: string;
    cafe_osm_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    cafe_name?: string;
  }>>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reviews")
        .select("id, cafe_osm_id, rating, comment, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setReviews(data ?? []);
    }
    load();
  }, [userId, supabase]);

  const handleDelete = async (reviewId: string) => {
    await fetch(`/api/reviews?id=${reviewId}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
          <CardContent>
            <p className="text-muted-foreground">You haven&apos;t written any reviews yet.</p>
          </CardContent>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex justify-between items-start gap-4 p-3 rounded-lg bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">
                  <a href={`/cafe/${r.cafe_osm_id}`} className="hover:underline">
                    Cafe {r.cafe_osm_id}
                  </a>
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(r.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
