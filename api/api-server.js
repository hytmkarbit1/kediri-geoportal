// WFS API Server for Kediri Geoportal
// Provides WFS-like access to all layers for external GIS tools (QGIS, ArcGIS, etc.)
// Run with: node api/api-server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.API_PORT || 3000;

// Setup Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Enable CORS for all origins (allows access from any platform/laptop)
app.use(cors());
app.use(express.json());

// Layer configuration mapping
const LAYER_CONFIG = {
    // Official data layers
    'rtrw_banyakan': { table: 'official_data', schema: 'public', filter: { layer_name: 'rtrw_banyakan' } },

    // Government data layers
    'land_cover': { table: 'land_cover', schema: 'government_data' },
    'admin_boundaries': { table: 'admin_boundaries', schema: 'government_data' },
    'buildings': { table: 'buildings', schema: 'government_data' },
    'commercial_points': { table: 'commercial_points', schema: 'government_data' },
    'roads': { table: 'roads', schema: 'government_data' },
    'education_points': { table: 'education_points', schema: 'government_data' },

    // Crowd data layers
    'user_points': { table: 'user_points', schema: 'crowd_data' },
    'user_polygons': { table: 'user_polygons', schema: 'crowd_data' },
    'uploaded_features': { table: 'uploaded_features', schema: 'crowd_data' }
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Kediri Geoportal WFS API',
        version: '1.0.0',
        endpoints: {
            layers: '/api/wfs/layers',
            layer: '/api/wfs/:layer',
            health: '/health'
        },
        documentation: 'Access any layer by name, e.g., /api/wfs/rtrw_banyakan'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List all available layers
app.get('/api/wfs/layers', async (req, res) => {
    try {
        const layers = Object.keys(LAYER_CONFIG).map(name => {
            const config = LAYER_CONFIG[name];
            return {
                name,
                schema: config.schema,
                table: config.table,
                url: `/api/wfs/${name}`
            };
        });

        // Also get dynamic layers from official_data
        const { data: officialLayers, error } = await supabase
            .from('official_data')
            .select('layer_name')
            .limit(1000);

        if (!error && officialLayers) {
            const uniqueOfficialLayers = [...new Set(officialLayers.map(l => l.layer_name))];
            uniqueOfficialLayers.forEach(layerName => {
                if (!LAYER_CONFIG[layerName]) {
                    layers.push({
                        name: layerName,
                        schema: 'public',
                        table: 'official_data',
                        url: `/api/wfs/${layerName}`
                    });
                }
            });
        }

        res.json({
            count: layers.length,
            layers
        });
    } catch (error) {
        console.error('Error listing layers:', error);
        res.status(500).json({ error: 'Failed to list layers', message: error.message });
    }
});

// Get specific layer as GeoJSON
app.get('/api/wfs/:layer', async (req, res) => {
    try {
        const layerName = req.params.layer;
        const config = LAYER_CONFIG[layerName];

        let query;
        let data, error;

        if (config) {
            // Known layer from configuration
            if (config.schema && config.schema !== 'public') {
                query = supabase.schema(config.schema).from(config.table).select('*');
            } else {
                query = supabase.from(config.table).select('*');
            }

            // Apply filter if specified
            if (config.filter) {
                for (const [key, value] of Object.entries(config.filter)) {
                    query = query.eq(key, value);
                }
            }

            // Execute query with limit
            const result = await query.limit(10000);
            data = result.data;
            error = result.error;
        } else {
            // Try to find in official_data
            const result = await supabase
                .from('official_data')
                .select('*')
                .eq('layer_name', layerName)
                .limit(10000);

            data = result.data;
            error = result.error;
        }

        if (error) {
            console.error(`Error fetching layer ${layerName}:`, error);
            return res.status(500).json({
                error: 'Failed to fetch layer',
                layer: layerName,
                message: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'Layer not found or empty',
                layer: layerName
            });
        }

        // Convert to GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: data.map(row => ({
                type: 'Feature',
                id: row.id,
                properties: row.properties || { ...row, geom: undefined, id: undefined },
                geometry: row.geom
            }))
        };

        res.json(geojson);

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Start server (bind to 0.0.0.0 for network access)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WFS API Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Accessible from network at http://<your-ip>:${PORT}`);
    console.log(`📋 List layers: http://localhost:${PORT}/api/wfs/layers`);
    console.log(`🗺️  Example layer: http://localhost:${PORT}/api/wfs/rtrw_banyakan`);
});
