-- Migration: Add image_alts to products and ensure inventory deletion
-- Created manually to resolve missing column and deletion issues

-- 1. Add image_alts column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_alts') THEN
        ALTER TABLE products ADD COLUMN image_alts text[];
    END IF;
END $$;

-- 2. Ensure Inventory FK has CASCADE delete (or we handle it in code, but CASCADE is better)
-- We try to drop the constraint and re-add it with CASCADE.
-- Note: You might need to check the actual constraint name using:
-- SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'inventory' AND constraint_type = 'FOREIGN KEY';
-- Assuming default naming or just relying on code-side deletion if this is too risky to guess.

-- Safe Fallback: We will handle deletion in ShopContext.tsx to be 100% sure without risky DDL guessing.