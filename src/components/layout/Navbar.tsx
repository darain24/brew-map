/** Main navigation bar for BrewMap */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Heart, User, LogIn, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "@/components/auth/LoginModal";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl text-primary hover:opacity-90 transition-opacity cursor-pointer">
            <MapPin className="h-6 w-6" />
            BrewMap
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className={pathname === "/" ? "bg-muted" : ""}>
                Explore
              </Button>
            </Link>
            <Link href="/favorites">
              <Button variant="ghost" size="sm" className={pathname === "/favorites" ? "bg-muted" : ""}>
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className={pathname === "/about" ? "bg-muted" : ""}>
                <Info className="h-4 w-4 mr-1" />
                About
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className={pathname === "/contact" ? "bg-muted" : ""}>
                <Mail className="h-4 w-4 mr-1" />
                Contact
              </Button>
            </Link>
            {!loading && (
              user ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className={pathname === "/profile" ? "bg-muted" : ""}>
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setLoginOpen(true)}>
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Button>
              )
            )}
          </nav>
        </div>
      </header>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
