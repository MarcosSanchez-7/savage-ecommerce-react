-- Add visual_tag column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS visual_tag JSONB DEFAULT NULL;

-- Drop custom_tag if it exists to clean up
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custom_tag') THEN
        ALTER TABLE products DROP COLUMN custom_tag;
    END IF;
END $$;