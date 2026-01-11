
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cwlaqfjqgrtyhyscwpnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
