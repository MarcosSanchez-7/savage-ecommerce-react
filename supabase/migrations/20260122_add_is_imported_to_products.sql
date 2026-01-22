-- Migration: Add is_imported column to products
-- Description: Supports "Bajo Pedido" functionality

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_imported') THEN
        ALTER TABLE products ADD COLUMN is_imported boolean DEFAULT false;
    END IF;
END $$;