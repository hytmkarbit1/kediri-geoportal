// Layer Management Module
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './cluster.css';
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
    const enableHeavyLayers = import.meta.env.VITE_ENABLE_HEAVY_LAYERS !== 'false';

    // Define layers to load
    let tables = ['land_cover', 'admin_boundaries', 'commercial_points', 'roads', 'education_points'];

    // Only load buildings in development (localhost)
    if (enableHeavyLayers) {
        tables.push('buildings');
        console.log('✅ Heavy layers (buildings) enabled');
    } else {
        console.log('⚠️  Heavy layers (buildings) disabled in production');
    }

    for (const table of tables) {
        await loadLayer('government_data', table);
    }

    // Also load from official_data table (for RTRW and other datasets)
    await loadOfficialDataLayers();
}

// Load crowd data layers
export async function loadCrowdLayers() {
    const tables = ['user_points', 'user_polygons', 'uploaded_features'];

    for (const table of tables) {
        await loadLayer('crowd_data', table);
    }
}

// Individual layer loading functions for lazy loading
export async function loadLandCover() {
    await loadLayer('government_data', 'land_cover');
}

export async function loadAdminBoundaries() {
    await loadLayer('government_data', 'admin_boundaries');
}

export async function loadBuildings() {
    await loadLayer('government_data', 'buildings');
}

export async function loadCommercialPoints() {
    await loadLayer('government_data', 'commercial_points');
}

export async function loadRoads() {
    await loadLayer('government_data', 'roads');
}

export async function loadEducationPoints() {
    await loadLayer('government_data', 'education_points');
}

export async function loadUserPoints() {
    await loadLayer('crowd_data', 'user_points');
}

export async function loadUserPolygons() {
    await loadLayer('crowd_data', 'user_polygons');
}

export async function loadUploadedFeatures() {
    await loadLayer('crowd_data', 'uploaded_features');
}


// Load a specific layer from database
async function loadLayer(schema, table) {
    try {
        console.log(`📊 Loading ${schema}.${table}...`);

        // For large datasets, use pagination to bypass Supabase's 1000-row limit
        const shouldPaginate = ['land_cover', 'roads', 'buildings'].includes(table);

        let allData = [];

        if (shouldPaginate) {
            // Load data in chunks
            const pageSize = 1000; // Supabase's max
            let page = 0;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .schema(schema)
                    .from(table)
                    .select('*')
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) {
                    console.error(`Error loading ${schema}.${table} (page ${page}):`, error);
                    break;
                }

                if (!data || data.length === 0) {
                    hasMore = false;
                } else {
                    allData = allData.concat(data);
                    console.log(`  ✓ Loaded page ${page + 1}: ${data.length} features (total: ${allData.length})`);

                    // Stop if we got less than pageSize (last page)
                    if (data.length < pageSize) {
                        hasMore = false;
                    } else {
                        page++;
                    }

                    // Safety limit: stop after 50 pages (50,000 features)
                    if (page >= 50) {
                        console.warn(`⚠️  Reached safety limit of 50 pages for ${table}`);
                        hasMore = false;
                    }
                }
            }
        } else {
            // For small datasets, load normally
            const { data, error } = await supabase
                .schema(schema)
                .from(table)
                .select('*')
                .limit(5000);

            if (error) {
                console.error(`Error loading ${schema}.${table}:`, error);
                return;
            }

            allData = data || [];
        }

        if (allData.length === 0) {
            console.log(`No data found for ${schema}.${table}`);
            return;
        }

        // Convert to GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: allData.map(row => ({
                type: 'Feature',
                properties: { ...row, id: row.id },
                geometry: row.geom
            }))
        };

        // Determine if this layer should use clustering
        const pointLayers = ['commercial_points', 'education_points', 'user_points'];
        const useCluster = pointLayers.includes(table) && allData.length > 100;

        // Get layer group
        const group = getLayerGroup(table);

        if (useCluster) {
            // Create marker cluster group for point layers
            const clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: function (cluster) {
                    const count = cluster.getChildCount();
                    let size = 'small';
                    if (count > 100) size = 'large';
                    else if (count > 10) size = 'medium';

                    return L.divIcon({
                        html: `<div><span>${count}</span></div>`,
                        className: `marker-cluster marker-cluster-${size}`,
                        iconSize: L.point(40, 40)
                    });
                }
            });

            // Add GeoJSON to cluster group
            const layer = L.geoJSON(geojson, {
                pointToLayer: (feature, latlng) => {
                    return L.circleMarker(latlng, getStyleForLayer(table));
                },
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(createPopupContent(feature, table));
                }
            });

            clusterGroup.addLayer(layer);

            if (group) {
                group.addLayer(clusterGroup);
                console.log(`✅ Loaded ${allData.length} features for ${table} (clustered)`);
            }
        } else {
            // Add to map normally (polygons, lines, or small point datasets)
            const layer = L.geoJSON(geojson, {
                style: getStyleForLayer(table),
                pointToLayer: (feature, latlng) => {
                    return L.circleMarker(latlng, getStyleForLayer(table));
                },
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(createPopupContent(feature, table));
                }
            });

            if (group) {
                layer.addTo(group);
                console.log(`✅ Loaded ${allData.length} features for ${table}`);
            } else {
                console.warn(`Layer group not found for ${table}`);
            }
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

// Load layers from official_data table (RTRW and other datasets)
export async function loadOfficialDataLayers() {
    try {
        // Get distinct layer names from official_data
        // Use a smaller limit and distinct to avoid fetching too many rows
        const { data: layers, error: layersError } = await supabase
            .from('official_data')
            .select('layer_name')
            .limit(100); // Reduced from 1000 to avoid timeout

        if (layersError) {
            console.error('Error fetching official data layers:', layersError);
            return;
        }

        if (!layers || layers.length === 0) {
            console.log('No official data layers found');
            return;
        }

        // Get unique layer names
        const uniqueLayers = [...new Set(layers.map(l => l.layer_name))];
        console.log(`Found ${uniqueLayers.length} official data layers:`, uniqueLayers);

        // Load each layer
        for (const layerName of uniqueLayers) {
            await loadOfficialDataLayer(layerName);
        }
    } catch (error) {
        console.error('Error loading official data layers:', error);
    }
}

// Load a specific layer from official_data table
async function loadOfficialDataLayer(layerName) {
    try {
        const { data, error } = await supabase
            .from('official_data')
            .select('*')
            .eq('layer_name', layerName)
            .limit(1000); // Reduced from 5000 to prevent 500 errors

        if (error) {
            console.error(`Error loading official_data.${layerName}:`, error);
            return;
        }

        if (!data || data.length === 0) {
            console.log(`No data found for official_data.${layerName}`);
            return;
        }

        // Convert to GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: data.map(row => ({
                type: 'Feature',
                properties: { ...row.properties, id: row.id, layer_name: row.layer_name },
                geometry: row.geom
            }))
        };

        // Determine style based on layer name
        const style = getStyleForOfficialLayer(layerName);

        // Add to map
        const layer = L.geoJSON(geojson, {
            style: style,
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, style);
            },
            onEachFeature: (feature, layer) => {
                layer.bindPopup(createOfficialDataPopup(feature, layerName));
            }
        });

        // Try to add to existing layer group
        let group = getLayerGroup(layerName);

        // If no specific group, try fallback groups
        if (!group) {
            group = getLayerGroup('official_data');
        }

        // If still no group, add directly to map
        if (group) {
            layer.addTo(group);
            console.log(`✅ Loaded ${data.length} features for ${layerName} (via layer group)`);
        } else {
            console.log(`⚠️  No layer group for ${layerName}, adding directly to map`);
            const map = getMap();
            if (map) {
                layer.addTo(map);
                console.log(`✅ Loaded ${data.length} features for ${layerName} (direct to map)`);
            } else {
                console.error(`❌ Cannot add ${layerName}: no map or layer group found`);
            }
        }

    } catch (error) {
        console.error(`Error loading official_data.${layerName}:`, error);
    }
}

// Get style for official data layers
function getStyleForOfficialLayer(layerName) {
    // RTRW (land use) styling
    if (layerName.includes('rtrw')) {
        return {
            fillColor: '#FFD700',
            fillOpacity: 0.4,
            color: '#FF8C00',
            weight: 2
        };
    }

    // Default style
    return {
        fillColor: '#3388ff',
        fillOpacity: 0.5,
        color: '#3388ff',
        weight: 2
    };
}

// Create popup for official data features
function createOfficialDataPopup(feature, layerName) {
    const props = feature.properties;
    let content = `<div class="popup-content">`;
    content += `<h3>${layerName.replace(/_/g, ' ').toUpperCase()}</h3>`;

    // Display all properties
    for (const [key, value] of Object.entries(props)) {
        if (key !== 'id' && key !== 'layer_name' && value !== null && value !== undefined) {
            const label = key.replace(/_/g, ' ').toUpperCase();
            content += `<p><strong>${label}:</strong> ${value}</p>`;
        }
    }

    content += `</div>`;
    return content;
}

// Dummy functions for backward compatibility if needed
export function toggleLayer(name) { console.log('Toggling', name); }
export function getLayerVisibility() { return {}; }
