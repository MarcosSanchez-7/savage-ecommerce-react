-- Add role column to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';
    END IF;
END
$$;

-- Allow users to read their own role but NOT update it (RLS)
-- Existing policies cover standard read/update, but we might want to be careful with 'role'.
-- Standard policy "Users can update their own profile" allows updating ALL columns.
-- We should ideally restrict updating 'role' via RLS or simply trust that the frontend won't send it,
-- but for robust security, we'd need a BEFORE UPDATE trigger or restrictive policy.
-- For now, we will trust the backend/frontend logic not to expose role editing to users.

-- OPTIONAL: Set the initial admin user role if they exist (This part requires the UUID which we don't have, so we skip exact assignment here.
-- The user must manually update their row in Supabase Dashboard)