import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing connection via RPC function...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Try to call the RPC function with a dummy record
        // We use a non-existent table name to check if function exists and is callable
        // It should return error "Invalid table name" which proves connection works!

        const { data, error } = await supabase.rpc('insert_government_data', {
            p_table_name: 'test_connection',
            p_data: []
        });

        if (error) {
            if (error.message.includes('Invalid table name')) {
                console.log('✅ Connection successful!');
                console.log('   RPC function "insert_government_data" is accessible.');
                console.log('   You can now run the main import script.');
            } else if (error.message.includes('function') && error.message.includes('does not exist')) {
                console.error('❌ RPC function not found!');
                console.log('   Please run migration 007_enable_import_rpc.sql in Supabase SQL Editor.');
            } else {
                console.error('❌ Connection failed:', error.message);
            }
        } else {
            // Should not happen with invalid table name
            console.log('✅ Connection successful (unexpected success response)');
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

testConnection();
