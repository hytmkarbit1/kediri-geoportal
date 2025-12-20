#!/usr/bin/env node

/**
 * Import Admin Data Script
 * Converts GeoJSON files from data/government/fix to SQL INSERT statements
 * 
 * Usage: node scripts/import-admin-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'government', 'fix');
const OUTPUT_DIR = path.join(__dirname, '..', 'database', 'migrations');
const OUTPUT_FILE = path.join(OUTPUT_DIR, '006_import_admin_data.sql');

// Mapping of files to database tables
const FILE_MAPPINGS = {
    'administrasi_ar_kabkota.geojson': {
        table: 'government_data.admin_boundaries',
        adminLevel: 'city'
    },
    'administrasi_ar_kecamatan.geojson': {
        table: 'government_data.admin_boundaries',
        adminLevel: 'district'
    },
    'administrasi_ar_desakel.geojson': {
        table: 'government_data.admin_boundaries',
        adminLevel: 'village'
    },
    'land_cover.geojson': {
        table: 'government_data.land_cover'
    },
    'bangunan_ar.geojson': {
        table: 'government_data.buildings'
    },
    'jalan_ln.geojson': {
        table: 'government_data.roads'
    },
    'pendidikan_pt.geojson': {
        table: 'government_data.education_points'
    }
};

/**
 * Escape single quotes in SQL strings
 */
function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return `'${String(str).replace(/'/g, "''")}'`;
}

/**
 * Convert GeoJSON geometry to PostGIS geometry
 */
function geomToPostGIS(geometry) {
    const geojson = JSON.stringify(geometry).replace(/'/g, "''");
    return `ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326)`;
}

/**
 * Generate INSERT statement for admin boundaries
 */
function generateAdminBoundaryInsert(feature, adminLevel) {
    const props = feature.properties;
    const geom = geomToPostGIS(feature.geometry);

    // Extract fields from properties
    const name = escapeSql(props.NAMOBJ || props.name || props.WADMKK || props.WADMKC || props.WADMKD || 'Unknown');
    const code = escapeSql(props.KDCBPS || props.KDCPUM || props.KDCKEL || props.code || null);
    const population = props.population || props.JUMLAH_PE || 'NULL';
    const description = escapeSql(props.REMARK || props.description || null);

    return `INSERT INTO government_data.admin_boundaries (name, admin_level, code, population, description, geom)
VALUES (${name}, '${adminLevel}', ${code}, ${population}, ${description}, ${geom});`;
}

/**
 * Generate INSERT statement for land cover
 */
function generateLandCoverInsert(feature) {
    const props = feature.properties;
    const geom = geomToPostGIS(feature.geometry);

    const name = escapeSql(props.NAMOBJ || props.name || 'Unknown');
    const landType = escapeSql(props.KELAS || props.land_type || props.type || 'other');
    const areaHectares = props.area_hectares || props.LUASHA || 'NULL';
    const description = escapeSql(props.REMARK || props.description || null);

    return `INSERT INTO government_data.land_cover (name, land_type, area_hectares, description, geom)
VALUES (${name}, ${landType}, ${areaHectares}, ${description}, ${geom});`;
}

/**
 * Generate INSERT statement for buildings
 */
function generateBuildingInsert(feature) {
    const props = feature.properties;
    const geom = geomToPostGIS(feature.geometry);

    const name = escapeSql(props.NAMOBJ || props.name || null);
    const buildingType = escapeSql(props.FCODE || props.building_type || props.type || 'other');
    const floors = props.floors || props.TINGKAT || 'NULL';
    const description = escapeSql(props.REMARK || props.description || null);

    return `INSERT INTO government_data.buildings (name, building_type, floors, description, geom)
VALUES (${name}, ${buildingType}, ${floors}, ${description}, ${geom});`;
}

/**
 * Generate INSERT statement for roads
 */
function generateRoadInsert(feature) {
    const props = feature.properties;
    const geom = geomToPostGIS(feature.geometry);

    const name = escapeSql(props.NAMRJL || props.NAMOBJ || props.name || 'Unnamed Road');
    const roadType = escapeSql(props.FCODE || props.TIPJLN || props.road_type || 'other');
    const surface = escapeSql(props.PERMKL || props.surface || null);
    const lengthMeters = props.length_meters || props.PANJANG || 'NULL';
    const description = escapeSql(props.REMARK || props.description || null);

    return `INSERT INTO government_data.roads (name, road_type, surface, length_meters, description, geom)
VALUES (${name}, ${roadType}, ${surface}, ${lengthMeters}, ${description}, ${geom});`;
}

/**
 * Generate INSERT statement for education points
 */
function generateEducationInsert(feature) {
    const props = feature.properties;
    const geom = geomToPostGIS(feature.geometry);

    const name = escapeSql(props.NAMOBJ || props.name || 'Unknown');
    const educationType = escapeSql(props.FCODE || props.education_type || 'other');
    const address = escapeSql(props.ALAMAT || props.address || null);
    const studentCapacity = props.student_capacity || props.KAPASITAS || 'NULL';
    const description = escapeSql(props.REMARK || props.description || null);

    return `INSERT INTO government_data.education_points (name, education_type, address, student_capacity, description, geom)
VALUES (${name}, ${educationType}, ${address}, ${studentCapacity}, ${description}, ${geom});`;
}

/**
 * Process a single GeoJSON file
 */
function processGeoJSONFile(filename, config) {
    const filePath = path.join(DATA_DIR, filename);

    console.log(`📂 Processing: ${filename}`);

    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found, skipping...`);
        return [];
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const features = data.features || [];

    console.log(`   ✓ Found ${features.length} features`);

    const inserts = [];
    let processedCount = 0;

    for (const feature of features) {
        try {
            let sql;

            if (config.table === 'government_data.admin_boundaries') {
                sql = generateAdminBoundaryInsert(feature, config.adminLevel);
            } else if (config.table === 'government_data.land_cover') {
                sql = generateLandCoverInsert(feature);
            } else if (config.table === 'government_data.buildings') {
                sql = generateBuildingInsert(feature);
            } else if (config.table === 'government_data.roads') {
                sql = generateRoadInsert(feature);
            } else if (config.table === 'government_data.education_points') {
                sql = generateEducationInsert(feature);
            }

            if (sql) {
                inserts.push(sql);
                processedCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error processing feature: ${error.message}`);
        }
    }

    console.log(`   ✓ Generated ${processedCount} INSERT statements\n`);

    return inserts;
}

/**
 * Main function
 */
function main() {
    console.log('🚀 Starting Admin Data Import Script\n');
    console.log(`📁 Source directory: ${DATA_DIR}`);
    console.log(`📝 Output file: ${OUTPUT_FILE}\n`);

    let allInserts = [];

    // Header
    allInserts.push('-- Migration 006: Import Admin Data from GeoJSON files');
    allInserts.push('-- Generated automatically by scripts/import-admin-data.js');
    allInserts.push(`-- Generated on: ${new Date().toISOString()}`);
    allInserts.push('-- Run this after 005_create_triggers.sql\n');
    allInserts.push('-- This migration imports real administrative data for Kediri\n');

    // Process each file
    for (const [filename, config] of Object.entries(FILE_MAPPINGS)) {
        allInserts.push(`\n-- ========================================`);
        allInserts.push(`-- ${filename}`);
        allInserts.push(`-- Table: ${config.table}`);
        allInserts.push(`-- ========================================\n`);

        const inserts = processGeoJSONFile(filename, config);
        allInserts = allInserts.concat(inserts);
    }

    // Footer
    allInserts.push('\n-- ========================================');
    allInserts.push('-- Import Complete');
    allInserts.push('-- ========================================\n');

    // Write to file
    const sqlContent = allInserts.join('\n');
    fs.writeFileSync(OUTPUT_FILE, sqlContent, 'utf8');

    console.log('✅ SUCCESS!');
    console.log(`📝 SQL file created: ${OUTPUT_FILE}`);
    console.log(`📊 Total statements: ${allInserts.filter(line => line.startsWith('INSERT')).length}`);
    console.log('\n📋 Next steps:');
    console.log('1. Review the generated SQL file');
    console.log('2. Go to Supabase SQL Editor');
    console.log('3. Run database/migrations/006_import_admin_data.sql');
    console.log('4. Verify data appears in your tables\n');
}

// Run the script
try {
    main();
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
