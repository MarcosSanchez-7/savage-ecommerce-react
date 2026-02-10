-- Create order_requests table to store pending verifications
CREATE TABLE IF NOT EXISTS public.order_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_id BIGINT,
    total_amount NUMERIC,
    delivery_cost NUMERIC,
    status TEXT DEFAULT 'Pendiente',
    items JSONB,
    customer_info JSONB,
    product_ids TEXT[]
);

-- Enable Row Level Security
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public insert (for checkout)
CREATE POLICY "Enable insert for all users" ON public.order_requests FOR
INSERT
WITH
    CHECK (true);

-- Create policy to allow select for all users (or authenticated if prefered, but currently simulating public/anon access for admin)
CREATE POLICY "Enable select for all users" ON public.order_requests FOR
SELECT USING (true);

-- Create policy to allow delete/update for all users
CREATE POLICY "Enable delete for all users" ON public.order_requests FOR DELETE USING (true);

CREATE POLICY "Enable update for all users" ON public.order_requests FOR
UPDATE USING (true);