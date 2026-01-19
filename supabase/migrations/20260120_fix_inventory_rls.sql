-- Enable RLS on inventory if not already enabled
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access to Inventory (so storefront works for everyone)
CREATE POLICY "Public Read Inventory" ON public.inventory FOR
SELECT USING (true);

-- Allow Authenticated Users (Admins) to Manage Inventory
CREATE POLICY "Admin Manage Inventory" ON public.inventory FOR ALL USING (
    auth.role () = 'authenticated'
);

-- Ensure Products is also readable
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Products" ON public.products FOR
SELECT USING (true);

CREATE POLICY "Admin Manage Products" ON public.products FOR ALL USING (
    auth.role () = 'authenticated'
);