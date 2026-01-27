
import { createClient } from '@supabase/supabase-js';

// Use Environment Variable first, fallback to hardcoded for stability
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cwlaqfjqgrtyhyscwpnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
}

// Safe client creation with full Mock for robustness
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        // Mock Auth Service to prevent AuthProvider crash
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: async () => ({ error: { message: 'MODO OFFLINE: Faltan claves de Supabase' } }),
            signUp: async () => ({ data: { user: null }, error: { message: 'MODO OFFLINE: Faltan claves de Supabase' } }),
            signOut: async () => ({ error: null }),
        },
        // Mock Storage
        storage: {
            from: () => ({
                upload: async () => ({ error: { message: 'FALTAN VARIABLES DE ENTORNO DE SUPABASE. Configura .env' }, data: null }),
                getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
        },
        // Mock DB Methods (from) to prevent ShopContext crash
        from: (table: string) => {
            console.warn(`Supabase Mock: Accessed table '${table}' without credentials.`);
            const queryBuilder = {
                select: () => queryBuilder,
                insert: () => queryBuilder,
                update: () => queryBuilder,
                delete: () => queryBuilder,
                upsert: () => queryBuilder,
                eq: () => queryBuilder,
                match: () => queryBuilder,
                order: () => queryBuilder,
                limit: () => queryBuilder,
                single: async () => ({ data: null, error: { message: 'Mock data: Supabase keys missing' } }),
                then: (resolve: (data: any) => void) => resolve({ data: [], error: { message: 'Mock data: Supabase keys missing' } })
            };
            return queryBuilder;
        }
    } as any;
