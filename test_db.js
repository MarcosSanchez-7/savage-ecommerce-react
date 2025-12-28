
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cwlaqfjqgrtyhyscwpnq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bGFxZmpxZ3J0eWh5c2N3cG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDM3NTcsImV4cCI6MjA4MTY3OTc1N30.qt20ysweHhOMO81o6snFuBf3z5QDL-M1E0jN-ifQC4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    console.log('--- STARTING SUPABASE TEST ---');

    // 1. Fetch Categories
    console.log('1. Fetching Categories...');
    const { data: listData, error: listError } = await supabase
        .from('categories')
        .select('*');

    if (listError) {
        console.error('FAIL: Could not fetch categories:', listError);
    } else {
        console.log(`SUCCESS: Found ${listData.length} categories.`);
        console.log(listData);
    }

    // 2. Insert Test Category
    const testId = 'test_' + Math.floor(Math.random() * 1000);
    console.log(`2. Inserting test category: ${testId}...`);

    const { data: insertData, error: insertError } = await supabase
        .from('categories')
        .insert([{ id: testId, name: 'Test Category', image: '' }])
        .select();

    if (insertError) {
        console.error('FAIL: Could not insert category:', insertError);
    } else {
        console.log('SUCCESS: Category inserted.');
    }

    // 3. Delete Test Category
    console.log(`3. Deleting test category: ${testId}...`);
    const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', testId);

    if (deleteError) {
        console.error('FAIL: Could not delete category:', deleteError);
    } else {
        console.log('SUCCESS: Category deleted.');
    }

    console.log('--- END TEST ---');
}

test();
