# BrewMap

**Find your perfect coffee spot.** Search any city, filter by WiFi, outdoor seating, pet-friendly—save favorites and share what you love.

---

## What is BrewMap?

BrewMap is a full-stack cafe discovery app that helps you find and explore cafes anywhere in the world. Search by city or use your location, see results on an interactive map, filter by amenities, read and write reviews, and keep a list of favorites—all without needing paid map or geocoding APIs.

### Highlights

- **Free data** — Cafes from OpenStreetMap via Overpass, geocoding via Nominatim. No API keys for maps or search.
- **Full-featured** — City search with autocomplete, interactive Leaflet map, filters, reviews, favorites, auth, and a contact form.
- **Modern stack** — Next.js 14, TypeScript, Supabase, TanStack Query, Zustand, shadcn/ui.

---

## Features

| Area | What you get |
|------|--------------|
| **Search** | City/country autocomplete (⌘K / Ctrl+K), “Use my location”, clear partial input anytime |
| **Map** | Leaflet + OSM tiles, click cafes to jump to details, expandable panel |
| **Filters** | WiFi, outdoor seating, pet-friendly, wheelchair access, and more |
| **Cafe detail** | Opening hours, ratings, reviews, save to favorites, distance from you |
| **Favorites** | Persistent saved cafes (requires login) |
| **Reviews** | Rate 1–5 stars, leave comments (login required) |
| **Profile** | Update display name, email, password; manage reviews |
| **Auth** | Email/password and Google OAuth via Supabase |
| **Contact** | Contact form powered by EmailJS |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui, Lucide icons |
| **State & data** | Zustand, TanStack Query (React Query) |
| **Backend** | Next.js API routes (Nominatim proxy, geocode, reviews) |
| **Database & auth** | Supabase (PostgreSQL + Auth) |
| **Maps & cafe data** | Leaflet, react-leaflet, OpenStreetMap tiles, Overpass API |
| **Language** | TypeScript (strict) |

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the schema from `supabase/schema.sql`
3. In **Authentication → Providers**, enable Email (and optionally Google OAuth)
4. For Google OAuth, add redirect URL: `http://localhost:3000/auth/callback`

### 3. Environment variables

Copy the example env and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `NEXT_PUBLIC_APP_URL` | App URL (optional, defaults to localhost in dev) |
| `NEXT_PUBLIC_EMAILJS_*` | EmailJS keys for the contact form (optional) |

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

The `supabase/schema.sql` script creates:

- **profiles** — User profiles (display name, avatar, role), auto-created on signup
- **favorites** — Saved cafes per user (linked by OSM ID)
- **reviews** — Ratings (1–5) and comments per cafe
- **RLS policies** — Users can manage only their own favorites and reviews; reviews are readable by everyone

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables
4. In Supabase, add the redirect URL: `https://your-app.vercel.app/auth/callback`

---

## License

MIT
