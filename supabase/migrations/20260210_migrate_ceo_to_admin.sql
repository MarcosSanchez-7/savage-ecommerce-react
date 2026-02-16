-- MIGRATION: Standardize role from 'ceo' to 'admin'
UPDATE public.profiles SET role = 'admin' WHERE role = 'ceo';

-- Ensure new created users get defaults correctly or have proper role column
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';