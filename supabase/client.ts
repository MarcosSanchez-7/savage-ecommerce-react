import { createClient } from '@supabase/supabase-js';

// SECURE CONFIG: Use ONLY import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('FATAL: Missing Supabase environment variables! Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
