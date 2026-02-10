-- FIX: Allow users to read their own profile to verify 'ceo' role
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Allow users to read their own profile (Critical for Admin Check)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT USING (auth.uid () = id);

-- 2. Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (auth.uid () = id);

-- 3. (Optional) Allow public read of basic info if needed, but for Admin check, (1) is sufficient.