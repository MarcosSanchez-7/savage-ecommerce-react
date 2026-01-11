
import { createClient } from '@supabase/supabase-js';

// Hardcoded for stability against Vercel domain conflicts
const supabaseUrl = 'https://cwlaqfjqgrtyhyscwpnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
}

// Safe client creation to prevent app crash if vars are missing
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        storage: {
            from: () => ({
                upload: async () => ({ error: { message: 'FALTAN VARIABLES DE ENTORNO DE SUPABASE. Configura .env' }, data: null }),
                getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
        }
    } as any;
