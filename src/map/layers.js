// Layer Management Module
import L from 'leaflet';
import { supabase } from '../config/supabase.js';
import { getMap, getLayerGroup, clearLayerGroup } from './map.js';

// Layer visibility state
const layerVisibility = {
    // Government layers
    'land_cover': true,
    'admin_boundaries': true,
    'buildings': false,
    'commercial_points': true,
    'roads': true,
    'education_points': true,
    // Crowd layers
    'user_points': true,
    'user_polygons': true,
    'uploaded_features': false
};

// Layer styles
const layerStyles = {
    land_cover: {
        fillColor: '#90EE90',
        fillOpacity: 0.4,
        color: '#228B22',
        weight: 1
    },
    admin_boundaries: {
        fillColor: 'transparent',
        color: '#FF6347',
        weight: 2,
        dashArray: '5, 5'
    },
    buildings: {
        fillColor: '#D3D3D3',
        fillOpacity: 0.6,
        color: '#696969',
        weight: 1
    },
    commercial_points: {
        radius: 6,
        fillColor: '#FFD700',
        fillOpacity: 0.8,
        color: '#FF8C00',
        weight: 2
    },
    roads: {
        color: '#4682B4',
        weight: 3,
        opacity: 0.7
    },
    education_points: {
        radius: 7,
        fillColor: '#4169E1',
        fillOpacity: 0.8,
        color: '#000080',
        weight: 2
    },
    user_points: {
        radius: 6,
        fillColor: '#FF69B4',
        fillOpacity: 0.8,
        color: '#C71585',
        weight: 2
    },
    user_polygons: {
        fillColor: '#DDA0DD',
        fillOpacity: 0.5,
        color: '#9370DB',
        weight: 2
    },
    uploaded_features: {
        fillColor: '#FFA07A',
        fillOpacity: 0.5,
        color: '#FF4500',
        weight: 2
    }
};

// Load government data layers
export async function loadGovernmentLayers() {
    const tables = ['land_cover', 'admin_boundaries', 'buildings', 'commercial_points', 'roads', 'education_points'];

    for (const table of tables) {
        await loadLayer('government_data', table);
    }
}

// Load crowd data layers
export async function loadCrowdLayers() {
    const tables = ['user_points', 'user_polygons', 'uploaded_features'];

    for (const table of tables) {
        await loadLayer('crowd_data', table);
    }
}

// Load a specific layer from database
async function loadLayer(schema, table) {
    try {
        let query = supabase
            .schema(schema)
            .from(table)
            .select('*');

        // Limit large datasets
        if (table === 'land_cover') {
            query = query.limit(2000);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Error loading ${schema}.${table}:`, error);
            return;
        }

        if (!data || data.length === 0) {
            console.log(`No data found for ${schema}.${table}`);
            return;
        }

        // Convert to GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: data.map(row => ({
                type: 'Feature',
                properties: { ...row, id: row.id },
                geometry: row.geom
            }))
        };

        // Add to map
        const layer = L.geoJSON(geojson, {
            style: getStyleForLayer(table),
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, getStyleForLayer(table));
            },
            onEachFeature: (feature, layer) => {
                layer.bindPopup(createPopupContent(feature, table));
            }
        });

        // Add to its specific layer group
        const group = getLayerGroup(table);
        if (group) {
            layer.addTo(group);
            console.log(`Loaded ${data.length} features for ${table}`);
        } else {
            console.warn(`Layer group not found for ${table}`);
        }

    } catch (error) {
        console.error(`Error loading ${schema}.${table}:`, error);
    }
}

// Get style for a layer
function getStyleForLayer(layerName) {
    return layerStyles[layerName] || {
        fillColor: '#3388ff',
        fillOpacity: 0.5,
        color: '#3388ff',
        weight: 2
    };
}

// Create popup content for a feature
function createPopupContent(feature, layerName) {
    const props = feature.properties;
    let content = `<div class="popup-content">`;
    content += `<h3>${layerName.replace(/_/g, ' ').toUpperCase()}</h3>`;

    const displayProps = ['name', 'feature_name', 'type', 'feature_type', 'description',
        'admin_level', 'building_type', 'business_type', 'road_type',
        'education_type', 'status', 'area_sqm'];

    for (const key of displayProps) {
        if (props[key]) {
            const label = key.replace(/_/g, ' ').toUpperCase();
            let value = props[key];

            if (key === 'area_sqm') {
                value = `${parseFloat(value).toFixed(2)} m²`;
            }

            content += `<p><strong>${label}:</strong> ${value}</p>`;
        }
    }

    content += `</div>`;
    return content;
}

// Refresh all layers
export async function refreshAllLayers() {
    const tables = [
        'land_cover', 'admin_boundaries', 'buildings', 'commercial_points', 'roads', 'education_points',
        'user_points', 'user_polygons', 'uploaded_features'
    ];

    tables.forEach(table => clearLayerGroup(table));
    await loadGovernmentLayers();
    await loadCrowdLayers();
}

// Dummy functions for backward compatibility if needed
export function toggleLayer(name) { console.log('Toggling', name); }
export function getLayerVisibility() { return {}; }
