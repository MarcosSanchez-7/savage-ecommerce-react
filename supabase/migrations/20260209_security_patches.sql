-- SECURITY PATCH 2026-02-09
-- Critical Fixes for Privilege Escalation and RLS Bypass
-- Version: 2 (Idempotent - Safe to run multiple times)

-- 1. Prevent Role Escalation via Profile Updates
-- Any user could previously update their own 'role' column. Now blocked.
CREATE OR REPLACE FUNCTION public.handle_profile_update_security()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed by the user themselves (or via API without Service Role)
  -- We block it immediately.
  IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'No tienes permiso para cambiar tu rol de seguridad.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_profile_role_change ON public.profiles;

CREATE TRIGGER check_profile_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_update_security();

-- 2. Fix Broken RLS on Products and Inventory
-- Previous policy allowed any 'authenticated' user (including customers) to manage inventory.

-- Drop insecure policies (if they still exist)
DROP POLICY IF EXISTS "Admin Manage Products" ON public.products;

DROP POLICY IF EXISTS "Admin Manage Inventory" ON public.inventory;

-- Drop new policies if they already exist (to avoid duplicate error)
DROP POLICY IF EXISTS "CEO Manage Products" ON public.products;

DROP POLICY IF EXISTS "CEO Manage Inventory" ON public.inventory;

DROP POLICY IF EXISTS "Public Read Products" ON public.products;

DROP POLICY IF EXISTS "Public Read Inventory" ON public.inventory;

-- Re-apply strict "CEO ONLY" policies for Management

-- PRODUCTS
-- Reading is public
CREATE POLICY "Public Read Products" ON public.products FOR
SELECT USING (true);

-- Management is STRICTLY for CEOs
CREATE POLICY "CEO Manage Products" ON public.products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

-- INVENTORY
-- Reading is public
CREATE POLICY "Public Read Inventory" ON public.inventory FOR
SELECT USING (true);

-- Management is STRICTLY for CEOs
CREATE POLICY "CEO Manage Inventory" ON public.inventory FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

-- PROFILES
-- Fix the profile update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can update their own profile non-critical" ON public.profiles;

CREATE POLICY "Users can update their own profile non-critical" ON public.profiles FOR
UPDATE USING (auth.uid () = id);
-- The Trigger 'check_profile_role_change' will run BEFORE this and stop role manipulation.