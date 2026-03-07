import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env variables locally
try {
    const envContent = fs.readFileSync('.env', 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value && key.trim() && !key.startsWith('#')) {
            process.env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
        }
    });
} catch (error) {
    console.warn("⚠️  Could not read .env file");
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSlugs() {
    const { data, error } = await supabase.from('products').select('id, name, slug').limit(5);
    console.table(data);
}
checkSlugs();
