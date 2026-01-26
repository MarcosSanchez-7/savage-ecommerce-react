ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "section_id" text;

ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "is_new" boolean DEFAULT false;