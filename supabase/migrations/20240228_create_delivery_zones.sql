-- 1. Create table for Delivery Zones
create table if not exists delivery_zones (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  points jsonb not null, -- Stores array of {lat, lng}
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table delivery_zones enable row level security;

-- 3. Create Policies
-- Allow public read access (essential for customers to calculate shipping)
create policy "Public zones are viewable by everyone" on delivery_zones for
select using (true);

-- Allow authenticated admins to full access
-- Assuming authenticated users are admins for now as per simple auth setup
create policy "Admins can insert zones" on delivery_zones for
insert
with
    check (
        auth.role () = 'authenticated'
    );

create policy "Admins can update zones" on delivery_zones for
update using (
    auth.role () = 'authenticated'
);

create policy "Admins can delete zones" on delivery_zones for delete using (
    auth.role () = 'authenticated'
);

-- 4. Realtime (Optional, for instant updates across devices)
alter publication supabase_realtime add table delivery_zones;