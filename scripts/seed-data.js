// Data Seeding Script for RTRW Banyakan
// Run with: node scripts/seed-data.js

import 'dotenv/config';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client (Use SERVICE_ROLE_KEY to bypass RLS for seeding)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Define File Path (RTRW GeoJSON location)
const FILE_PATH = String.raw`C:\Users\acer\Documents\kediri-geoportal\data\government\rtrw_ar_banyakan.geojson`;

async function seedRTRW() {
    console.log('🌱 Starting RTRW data seeding...');
    console.log(`📁 Reading file: ${FILE_PATH}`);

    // Read the GeoJSON file
    try {
        const rawData = fs.readFileSync(FILE_PATH, 'utf8');
        const geojson = JSON.parse(rawData);

        console.log(`✅ Found ${geojson.features.length} features in GeoJSON.`);

        // Check if data already exists
        const { count, error: countError } = await supabase
            .from('official_data')
            .select('*', { count: 'exact', head: true })
            .eq('layer_name', 'rtrw_banyakan');

        if (countError) {
            console.error('❌ Error checking existing data:', countError);
        } else if (count > 0) {
            console.log(`⚠️  Found ${count} existing features for rtrw_banyakan`);
            console.log('Do you want to delete and re-import? (Ctrl+C to cancel, or wait 5 seconds to proceed)');
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Delete existing data
            const { error: deleteError } = await supabase
                .from('official_data')
                .delete()
                .eq('layer_name', 'rtrw_banyakan');

            if (deleteError) {
                console.error('❌ Error deleting existing data:', deleteError);
                process.exit(1);
            }
            console.log('✅ Deleted existing data');
        }

        // Process features in chunks to avoid timeouts
        const CHUNK_SIZE = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < geojson.features.length; i += CHUNK_SIZE) {
            const chunk = geojson.features.slice(i, i + CHUNK_SIZE);
            const records = chunk.map(feature => ({
                layer_name: 'rtrw_banyakan',
                properties: feature.properties,
                geom: feature.geometry // PostGIS handles GeoJSON geometry objects automatically
            }));

            const { data, error } = await supabase
                .from('official_data')
                .insert(records);

            if (error) {
                console.error(`❌ Error inserting chunk ${i / CHUNK_SIZE + 1}:`, error);
                errorCount += chunk.length;
            } else {
                successCount += chunk.length;
                console.log(`✅ Inserted chunk ${i / CHUNK_SIZE + 1} (${successCount}/${geojson.features.length})`);
            }
        }

        console.log('\n🎉 Seeding complete!');
        console.log(`✅ Successfully uploaded: ${successCount} features`);
        if (errorCount > 0) {
            console.log(`❌ Failed: ${errorCount} features`);
        }

    } catch (err) {
        console.error("❌ Could not read file. Ensure path is correct:", FILE_PATH);
        console.error(err);
        process.exit(1);
    }
}

// Run the seeding function
seedRTRW();
