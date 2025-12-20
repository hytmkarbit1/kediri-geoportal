import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing dot notation access...');

// Default client (public schema)
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDotNotation() {
    try {
        // Try to select using dot notation
        const { data, error } = await supabase
            .from('government_data.admin_boundaries')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Dot notation failed:', error.message);
        } else {
            console.log('✅ Dot notation successful!');
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

testDotNotation();
