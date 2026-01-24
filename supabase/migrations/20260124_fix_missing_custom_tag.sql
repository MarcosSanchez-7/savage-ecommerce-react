-- Migration to ensure modify the products table safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custom_tag') THEN
        ALTER TABLE products ADD COLUMN custom_tag JSONB DEFAULT NULL;
    END IF;
END $$;