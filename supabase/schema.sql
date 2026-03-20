-- BrewMap Supabase schema - run in Supabase SQL Editor

-- Profiles (synced from auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'owner')),
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Favorites
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  cafe_osm_id text not null,
  cafe_name text,
  cafe_lat float,
  cafe_lng float,
  created_at timestamp with time zone default now()
);

-- Reviews
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  cafe_osm_id text not null,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table reviews enable row level security;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "Users can manage own favorites" on favorites;
create policy "Users can manage own favorites" on favorites for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own reviews" on reviews;
create policy "Users can manage own reviews" on reviews for all using (auth.uid() = user_id);

drop policy if exists "Anyone can read reviews" on reviews;
create policy "Anyone can read reviews" on reviews for select using (true);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
