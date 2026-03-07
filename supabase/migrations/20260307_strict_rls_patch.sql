-- SECURITY PATCH 2026-03-07
-- Fixes critical data leaks in Orders, Blog Posts, and Delivery Zones

-- 1. FIX ORDERS TABLE (Data Leak Prevention)
-- Previous policies exposed all orders to any public user.

DROP POLICY IF EXISTS "Enable read for all users" ON public.orders;

DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;

-- Reading and Updating orders should only be for CEOs (or authenticated admins)
CREATE POLICY "CEO Read Orders" ON public.orders FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.role = 'ceo'
        )
    );

CREATE POLICY "CEO Update Orders" ON public.orders FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

-- Note: We keep "Enable insert for all users" so customers can checkout anonymously

-- 2. FIX ORDER_REQUESTS TABLE (Data Leak Prevention)
-- Previous policies allowed any public user to view, edit or delete any pending order request.

DROP POLICY IF EXISTS "Public can view order_requests" ON public.order_requests;

DROP POLICY IF EXISTS "Public can update order_requests" ON public.order_requests;

DROP POLICY IF EXISTS "Public can delete order_requests" ON public.order_requests;

CREATE POLICY "CEO Read Order Requests" ON public.order_requests FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.role = 'ceo'
        )
    );

CREATE POLICY "CEO Update Order Requests" ON public.order_requests FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

CREATE POLICY "CEO Delete Order Requests" ON public.order_requests FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

-- 3. FIX BLOG POSTS (Vandalism Prevention)
-- Previous policies allowed ANY user (even non-logged in) to create/edit/delete posts because using(true)

DROP POLICY IF EXISTS "Admin full access" ON public.blog_posts;

DROP POLICY IF EXISTS "Admin update access" ON public.blog_posts;

DROP POLICY IF EXISTS "Admin delete access" ON public.blog_posts;

CREATE POLICY "CEO Insert Blog Posts" ON public.blog_posts FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.role = 'ceo'
        )
    );

CREATE POLICY "CEO Update Blog Posts" ON public.blog_posts FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

CREATE POLICY "CEO Delete Blog Posts" ON public.blog_posts FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

-- 4. FIX DELIVERY ZONES (Vandalism Prevention)
-- Previous policies allowed ANY logged in user (auth.role() = 'authenticated') to delete the store's zones.

DROP POLICY IF EXISTS "Admins can insert zones" ON public.delivery_zones;

DROP POLICY IF EXISTS "Admins can update zones" ON public.delivery_zones;

DROP POLICY IF EXISTS "Admins can delete zones" ON public.delivery_zones;

CREATE POLICY "CEO Insert Zones" ON public.delivery_zones FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.role = 'ceo'
        )
    );

CREATE POLICY "CEO Update Zones" ON public.delivery_zones FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);

CREATE POLICY "CEO Delete Zones" ON public.delivery_zones FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'ceo'
    )
);