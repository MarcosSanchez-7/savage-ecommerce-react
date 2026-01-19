-- Clean up existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Read Inventory" ON public.inventory;

DROP POLICY IF EXISTS "Admin Manage Inventory" ON public.inventory;

DROP POLICY IF EXISTS "Public Read Products" ON public.products;

DROP POLICY IF EXISTS "Admin Manage Products" ON public.products;

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. Public Read (Vital for Mobile/Storefront)
CREATE POLICY "Public Read Inventory" ON public.inventory FOR
SELECT USING (true);

-- 2. Admin Full Access
CREATE POLICY "Admin Manage Inventory" ON public.inventory FOR ALL USING (
    auth.role () = 'authenticated'
);

-- 3. Product Policies
CREATE POLICY "Public Read Products" ON public.products FOR
SELECT USING (true);

CREATE POLICY "Admin Manage Products" ON public.products FOR ALL USING (
    auth.role () = 'authenticated'
);