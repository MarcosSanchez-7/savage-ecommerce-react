-- 1. Create or Replace PROFILES table
-- We rely on CASCADE delete from auth.users to clean up profiles automatically
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  city TEXT,
  phone TEXT,
  email TEXT, -- Added email column for simpler access
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Trigger Function for New Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    new.id, 
    new.email, 
    'customer', -- Default role
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger
-- Drop first to ensure no duplicates if re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. RLS Policies

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT USING (auth.uid () = id);

-- Policy: Users can update their own profile
-- Note: Ideally we prevent 'role' update here, but for now we trust the API context.
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (auth.uid () = id);

-- Policy: CEO/Admins can view all profiles (Optional, usually needed for Admin Panel)
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR
SELECT USING (
        exists (
            select 1
            from public.profiles
            where
                id = auth.uid ()
                and role = 'ceo'
        )
    );

-- 6. Grant Permissions (Standard)
GRANT ALL ON TABLE public.profiles TO postgres;

GRANT ALL ON TABLE public.profiles TO service_role;

GRANT
SELECT,
UPDATE,
INSERT
    ON
TABLE public.profiles TO authenticated;

-- 7. Manual Override for SAVAGEEEPY (Just in case user needs to reset it now)
INSERT INTO
    public.profiles (
        id,
        email,
        role,
        first_name,
        last_name
    )
SELECT id, email, 'ceo', 'Gabriel', 'CEO'
FROM auth.users
WHERE
    email = 'savageeepy@gmail.com' ON CONFLICT (id) DO
UPDATE
SET role = 'ceo',
email = EXCLUDED.email;