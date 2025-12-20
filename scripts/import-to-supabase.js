#!/usr/bin/env node

/**
 * Import Admin Data to Supabase (Batch Version)
 * Directly inserts GeoJSON data into Supabase using the API
 * 
 * Usage: node scripts/import-to-supabase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATA_DIR = path.join(__dirname, '..', 'data', 'government', 'fix');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Batch size for inserts
const BATCH_SIZE = 100;

/**
 * Process admin boundaries
 */
async function importAdminBoundaries(filename, adminLevel) {
    const filePath = path.join(DATA_DIR, filename);

    console.log(`\n📂 Importing ${filename} (${adminLevel})`);

    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found, skipping...`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const features = data.features || [];

    console.log(`   ✓ Found ${features.length} features`);

    let imported = 0;
    let errors = 0;

    // Process in batches
    for (let i = 0; i < features.length; i += BATCH_SIZE) {
        const batch = features.slice(i, i + BATCH_SIZE);
        const records = [];

        for (const feature of batch) {
            try {
                const props = feature.properties;

                const record = {
                    name: props.NAMOBJ || props.name || props.WADMKK || props.WADMKC || props.WADMKD || 'Unknown',
                    admin_level: adminLevel,
                    code: props.KDCBPS || props.KDCPUM || props.KDCKEL || props.code || null,
                    population: props.population || props.JUMLAH_PE || null,
                    description: props.REMARK || props.description || null,
                    geom: feature.geometry // Pass geometry object directly
                };

                records.push(record);
            } catch (error) {
                console.error(`   ❌ Error processing feature: ${error.message}`);
                errors++;
            }
        }

        // Insert batch using RPC
        if (records.length > 0) {
            const { data, error } = await supabase.rpc('insert_government_data', {
                p_table_name: 'admin_boundaries',
                p_data: records
            });

            if (error) {
                console.error(`   ❌ Batch insert error: ${error.message}`);
                errors += records.length;
            } else {
                imported += records.length;
                process.stdout.write(`\r   ⏳ Progress: ${imported}/${features.length}`);
            }
        }
    }

    console.log(`\n   ✅ Imported ${imported} records (${errors} errors)`);
}

/**
 * Process land cover
 */
async function importLandCover() {
    const filename = 'land_cover.geojson';
    const filePath = path.join(DATA_DIR, filename);

    console.log(`\n📂 Importing ${filename}`);

    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found, skipping...`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const features = data.features || [];

    console.log(`   ✓ Found ${features.length} features`);

    let imported = 0;
    let errors = 0;

    for (let i = 0; i < features.length; i += BATCH_SIZE) {
        const batch = features.slice(i, i + BATCH_SIZE);
        const records = [];

        for (const feature of batch) {
            try {
                const props = feature.properties;

                const record = {
                    name: props.NAMOBJ || props.name || 'Unknown',
                    land_type: props.KELAS || props.land_type || props.type || 'other',
                    area_hectares: props.area_hectares || props.LUASHA || null,
                    description: props.REMARK || props.description || null,
                    geom: feature.geometry
                };

                records.push(record);
            } catch (error) {
                errors++;
            }
        }

        if (records.length > 0) {
            const { data, error } = await supabase.rpc('insert_government_data', {
                p_table_name: 'land_cover',
                p_data: records
            });

            if (error) {
                console.error(`   ❌ Batch insert error: ${error.message}`);
                errors += records.length;
            } else {
                imported += records.length;
                process.stdout.write(`\r   ⏳ Progress: ${imported}/${features.length}`);
            }
        }
    }

    console.log(`\n   ✅ Imported ${imported} records (${errors} errors)`);
}

/**
 * Process buildings
 */
async function importBuildings() {
    const filename = 'bangunan_ar.geojson';
    const filePath = path.join(DATA_DIR, filename);

    console.log(`\n📂 Importing ${filename}`);
    console.log(`   ⚠️  This file has 381,950 features - this will take a while!`);

    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found, skipping...`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const features = data.features || [];

    console.log(`   ✓ Found ${features.length} features`);

    let imported = 0;
    let errors = 0;

    for (let i = 0; i < features.length; i += BATCH_SIZE) {
        const batch = features.slice(i, i + BATCH_SIZE);
        const records = [];

        for (const feature of batch) {
            try {
                const props = feature.properties;

                const record = {
                    name: props.NAMOBJ || props.name || null,
                    building_type: props.FCODE || props.building_type || props.type || 'other',
                    floors: props.floors || props.TINGKAT || null,
                    description: props.REMARK || props.description || null,
                    geom: feature.geometry
                };

                records.push(record);
            } catch (error) {
                errors++;
            }
        }

        if (records.length > 0) {
            const { data, error } = await supabase.rpc('insert_government_data', {
                p_table_name: 'buildings',
                p_data: records
            });

            if (error) {
                console.error(`   ❌ Batch insert error: ${error.message}`);
                errors += records.length;
            } else {
                imported += records.length;
                process.stdout.write(`\r   ⏳ Progress: ${imported}/${features.length} (${((imported / features.length) * 100).toFixed(1)}%)`);
            }
        }
    }

    console.log(`\n   ✅ Imported ${imported} records (${errors} errors)`);
}

/**
 * Process roads
 */
async function importRoads() {
    const filename = 'jalan_ln.geojson';
    const filePath = path.join(DATA_DIR, filename);

    console.log(`\n📂 Importing ${filename}`);

    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found, skipping...`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const features = data.features || [];

    console.log(`   ✓ Found ${features.length} features`);

    let imported = 0;
    let errors = 0;

    for (let i = 0; i < features.length; i += BATCH_SIZE) {
        const batch = features.slice(i, i + BATCH_SIZE);
        const records = [];

        for (const feature of batch) {
            try {
                const props = feature.properties;

                const record = {
                    name: props.NAMRJL || props.NAMOBJ || props.name || 'Unnamed Road',
                    road_type: props.FCODE || props.TIPJLN || props.road_type || 'other',
                    surface: props.PERMKL || props.surface || null,
                    length_meters: props.length_meters || props.PANJANG || null,
                    description: props.REMARK || props.description || null,
                    geom: feature.geometry
                };

                records.push(record);
            } catch (error) {
                errors++;
            }
        }

        if (records.length > 0) {
            const { data, error } = await supabase.rpc('insert_government_data', {
                p_table_name: 'roads',
                p_data: records
            });

            if (error) {
                console.error(`   ❌ Batch insert error: ${error.message}`);
                errors += records.length;
            } else {
                imported += records.length;
                process.stdout.write(`\r   ⏳ Progress: ${imported}/${features.length}`);
            }
        }
    }

    console.log(`\n   ✅ Imported ${imported} records (${errors} errors)`);
}

/**
 * Process education points
 */
async function importEducation() {
    const filename = 'pendidikan_pt.geojson';
    const filePath = path.join(DATA_DIR, filename);

    console.log(`\n📂 Importing ${filename}`);

    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found, skipping...`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const features = data.features || [];

    console.log(`   ✓ Found ${features.length} features`);

    let imported = 0;
    let errors = 0;

    for (let i = 0; i < features.length; i += BATCH_SIZE) {
        const batch = features.slice(i, i + BATCH_SIZE);
        const records = [];

        for (const feature of batch) {
            try {
                const props = feature.properties;

                const record = {
                    name: props.NAMOBJ || props.name || 'Unknown',
                    education_type: props.FCODE || props.education_type || 'other',
                    address: props.ALAMAT || props.address || null,
                    student_capacity: props.student_capacity || props.KAPASITAS || null,
                    description: props.REMARK || props.description || null,
                    geom: feature.geometry
                };

                records.push(record);
            } catch (error) {
                errors++;
            }
        }

        if (records.length > 0) {
            const { data, error } = await supabase.rpc('insert_government_data', {
                p_table_name: 'education_points',
                p_data: records
            });

            if (error) {
                console.error(`   ❌ Batch insert error: ${error.message}`);
                errors += records.length;
            } else {
                imported += records.length;
                process.stdout.write(`\r   ⏳ Progress: ${imported}/${features.length}`);
            }
        }
    }

    console.log(`\n   ✅ Imported ${imported} records (${errors} errors)`);
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting Direct Import to Supabase\n');
    console.log(`📁 Source directory: ${DATA_DIR}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);

    const startTime = Date.now();

    try {
        // Import in order
        await importAdminBoundaries('administrasi_ar_kabkota.geojson', 'city');
        await importAdminBoundaries('administrasi_ar_kecamatan.geojson', 'district');
        await importAdminBoundaries('administrasi_ar_desakel.geojson', 'village');
        await importLandCover();
        await importEducation();
        await importRoads();

        // Buildings last (largest file)
        console.log('\n⚠️  WARNING: Building import may take 30+ minutes due to size');
        console.log('You can skip this by pressing Ctrl+C\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await importBuildings();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

        console.log('\n\n✅ IMPORT COMPLETE!');
        console.log(`⏱️  Total time: ${duration} minutes`);
        console.log('\n📋 Next steps:');
        console.log('1. Open your Supabase dashboard');
        console.log('2. Go to Table Editor');
        console.log('3. Verify data in government_data schema');
        console.log('4. Test the map in your application\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
