// src/map/map.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// ============================================
// CRITICAL FIX: Leaflet icon path issue in Vite
// ============================================
// This fixes the "marker-icon.png not found" error in production
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ============================================
// Map Instance
// ============================================
let map = null;
let drawnItems = null;
let baseLayers = {};
let overlayLayers = {};
let drawControl = null;

// Backward compatibility: Layer groups
export const layerGroups = {};

/**
 * Initialize the map
 * @param {string} containerId - ID of the map container element
 * @param {Object} options - Map initialization options
 * @returns {Promise<L.Map>} - Leaflet map instance
 */
export async function initializeMap(containerId = 'map', options = {}) {
    try {
        console.log('🗺️ Initializing map...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Check if container exists
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Map container '${containerId}' not found in DOM`);
        }

        // Destroy existing map if any
        if (map) {
            console.log('⚠️ Removing existing map instance');
            map.remove();
            map = null;
        }

        // Default options for Kediri
        const defaultOptions = {
            center: [-7.817, 112.017], // Kediri coordinates
            zoom: 12,
            minZoom: 8,
            maxZoom: 19,
            zoomControl: true,
            attributionControl: true
        };

        const mapOptions = { ...defaultOptions, ...options };

        // Create map instance
        map = L.map(containerId, mapOptions);

        // Initialize base layers
        initializeBaseLayers();
        map.baseLayers = baseLayers; // Attach for compatibility with controls.js

        // Initialize drawing layer
        initializeDrawingLayer();

        // Add scale control
        L.control.scale({
            position: 'bottomleft',
            imperial: false,
            metric: true
        }).addTo(map);

        // Note: Layer control is now handled by controls.js for better consistency
        // with the existing app structure.

        // Initialize standard layer groups for backward compatibility
        layerGroups.land_cover = L.layerGroup().addTo(map);
        layerGroups.admin_boundaries = L.layerGroup().addTo(map);
        layerGroups.buildings = L.layerGroup(); // Hidden by default
        layerGroups.commercial_points = L.layerGroup().addTo(map);
        layerGroups.roads = L.layerGroup().addTo(map);
        layerGroups.education_points = L.layerGroup().addTo(map);
        layerGroups.user_points = L.layerGroup().addTo(map);
        layerGroups.user_polygons = L.layerGroup().addTo(map);
        layerGroups.uploaded_features = L.layerGroup();
        layerGroups.rasterData = L.layerGroup().addTo(map);
        layerGroups.drawingLayer = L.featureGroup().addTo(map);

        console.log('✅ Map initialized successfully');
        return map;

    } catch (error) {
        console.error('❌ Map initialization failed:', error);
        throw error;
    }
}

/**
 * Initialize base map layers
 */
function initializeBaseLayers() {
    // OpenStreetMap (default)
    baseLayers['OpenStreetMap'] = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            subdomains: ['a', 'b', 'c']
        }
    );

    // CartoDB Light
    baseLayers['CartoDB Light'] = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
            subdomains: 'abcd'
        }
    );

    // CartoDB Dark
    baseLayers['CartoDB Dark'] = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
            subdomains: 'abcd'
        }
    );

    // Satellite (ESRI)
    baseLayers['Satellite'] = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: 'Tiles © Esri',
            maxZoom: 19
        }
    );

    // Add default basemap to map
    baseLayers['OpenStreetMap'].addTo(map);

    console.log('✅ Base layers initialized');
}

/**
 * Initialize drawing layer and controls
 */
function initializeDrawingLayer() {
    // Create feature group for drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Configure draw control
    const drawOptions = {
        position: 'topleft',
        draw: {
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#e74c3c',
                    message: '<strong>Error:</strong> Shape edges cannot cross!'
                },
                shapeOptions: {
                    color: '#3498db',
                    weight: 3,
                    opacity: 0.8,
                    fillOpacity: 0.4
                },
                showArea: true,
                metric: true
            },
            polyline: {
                shapeOptions: {
                    color: '#e74c3c',
                    weight: 3,
                    opacity: 0.8
                },
                metric: true
            },
            rectangle: {
                shapeOptions: {
                    color: '#3498db',
                    weight: 3,
                    opacity: 0.8,
                    fillOpacity: 0.4
                },
                showArea: true,
                metric: true
            },
            circle: false, // Disable circle (not supported in GeoJSON)
            circlemarker: {
                color: '#e67e22',
                fillColor: '#e67e22',
                fillOpacity: 0.8,
                radius: 8
            },
            marker: {
                icon: new L.Icon.Default()
            }
        },
        edit: {
            featureGroup: drawnItems,
            remove: true,
            edit: {
                selectedPathOptions: {
                    maintainColor: true,
                    opacity: 0.3
                }
            }
        }
    };

    // Add draw control to map
    drawControl = new L.Control.Draw(drawOptions);
    map.addControl(drawControl);

    // Setup event handlers
    setupDrawEventHandlers();

    console.log('✅ Drawing layer initialized');
}

/**
 * Setup event handlers for drawing tools
 */
function setupDrawEventHandlers() {
    // Feature created
    map.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        const type = event.layerType;

        console.log(`✏️ Feature created: ${type}`);

        // Add layer to drawn items
        drawnItems.addLayer(layer);

        // Emit custom event for application to handle
        const customEvent = new CustomEvent('feature:created', {
            detail: {
                layer: layer,
                type: type,
                geojson: layer.toGeoJSON()
            }
        });
        window.dispatchEvent(customEvent);
    });

    // Features edited
    map.on(L.Draw.Event.EDITED, (event) => {
        const layers = event.layers;
        let count = 0;

        layers.eachLayer((layer) => {
            count++;
            console.log('✏️ Feature edited');
        });

        // Emit custom event
        const customEvent = new CustomEvent('features:edited', {
            detail: {
                layers: layers,
                count: count
            }
        });
        window.dispatchEvent(customEvent);
    });

    // Features deleted
    map.on(L.Draw.Event.DELETED, (event) => {
        const layers = event.layers;
        let count = 0;

        layers.eachLayer((layer) => {
            count++;
            console.log('🗑️ Feature deleted');
        });

        // Emit custom event
        const customEvent = new CustomEvent('features:deleted', {
            detail: {
                layers: layers,
                count: count
            }
        });
        window.dispatchEvent(customEvent);
    });

    // Draw started
    map.on(L.Draw.Event.DRAWSTART, (event) => {
        console.log(`🖊️ Drawing started: ${event.layerType}`);
    });

    // Draw stopped
    map.on(L.Draw.Event.DRAWSTOP, (event) => {
        console.log('🖊️ Drawing stopped');
    });
}

/**
 * Add GeoJSON layer to map
 * @param {Object} geojson - GeoJSON feature collection
 * @param {Object} options - Layer styling options
 * @returns {L.GeoJSON} - Leaflet GeoJSON layer
 */
export function addGeoJSONLayer(geojson, options = {}) {
    if (!map) {
        throw new Error('Map not initialized. Call initializeMap() first.');
    }

    const defaultOptions = {
        style: (feature) => ({
            color: options.color || '#3498db',
            weight: options.weight || 2,
            opacity: options.opacity || 0.8,
            fillColor: options.fillColor || '#3498db',
            fillOpacity: options.fillOpacity || 0.4
        }),
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: options.radius || 8,
                fillColor: options.fillColor || '#e74c3c',
                color: options.color || '#c0392b',
                weight: options.weight || 2,
                opacity: options.opacity || 1,
                fillOpacity: options.fillOpacity || 0.8
            });
        },
        onEachFeature: (feature, layer) => {
            // Create popup content
            if (feature.properties) {
                let popupContent = '<div class="feature-popup" style="max-width: 300px;">';
                popupContent += '<h4 style="margin: 0 0 10px 0; color: #2c3e50;">Feature Properties</h4>';

                for (const [key, value] of Object.entries(feature.properties)) {
                    if (value !== null && value !== undefined) {
                        popupContent += `
              <div style="margin-bottom: 5px;">
                <strong style="color: #7f8c8d;">${key}:</strong> 
                <span>${value}</span>
              </div>
            `;
                    }
                }

                popupContent += '</div>';
                layer.bindPopup(popupContent);
            }

            // Add hover effect
            layer.on({
                mouseover: (e) => {
                    const layer = e.target;
                    if (layer.setStyle) {
                        layer.setStyle({
                            weight: 5,
                            opacity: 1,
                            fillOpacity: 0.7
                        });
                    }
                },
                mouseout: (e) => {
                    const layer = e.target;
                    if (layer.setStyle) {
                        layer.setStyle({
                            weight: options.weight || 2,
                            opacity: options.opacity || 0.8,
                            fillOpacity: options.fillOpacity || 0.4
                        });
                    }
                }
            });
        }
    };

    const layerOptions = { ...defaultOptions, ...options };
    const layer = L.geoJSON(geojson, layerOptions);

    layer.addTo(map);

    // Store in overlay layers with unique ID
    const layerId = options.layerId || `layer_${Date.now()}`;
    overlayLayers[layerId] = layer;

    console.log(`✅ GeoJSON layer added: ${layerId}`);

    return layer;
}

/**
 * Remove layer from map
 * @param {string} layerId - ID of the layer to remove
 */
export function removeLayer(layerId) {
    if (!map) return;

    const layer = overlayLayers[layerId];
    if (layer) {
        map.removeLayer(layer);
        delete overlayLayers[layerId];
        console.log(`✅ Layer removed: ${layerId}`);
    } else {
        console.warn(`⚠️ Layer not found: ${layerId}`);
    }
}

/**
 * Clear all drawn items
 */
export function clearDrawnItems() {
    if (drawnItems) {
        drawnItems.clearLayers();
        console.log('✅ Drawn items cleared');
    }
}

/**
 * Get all drawn features as GeoJSON
 * @returns {Object} - GeoJSON feature collection
 */
export function getDrawnFeatures() {
    if (!drawnItems) return null;

    return drawnItems.toGeoJSON();
}

/**
 * Fit map to layer bounds
 * @param {L.Layer} layer - Leaflet layer
 */
export function fitBounds(layer) {
    if (!map || !layer) return;

    if (layer.getBounds) {
        map.fitBounds(layer.getBounds(), {
            padding: [50, 50],
            maxZoom: 16
        });
        console.log('✅ Map bounds fitted to layer');
    }
}

/**
 * Change basemap
 * @param {string} basemapName - Name of the basemap
 */
export function changeBasemap(basemapName) {
    if (!map) return;

    // Remove all base layers
    Object.values(baseLayers).forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });

    // Add selected basemap
    if (baseLayers[basemapName]) {
        baseLayers[basemapName].addTo(map);
        console.log(`✅ Basemap changed to: ${basemapName}`);
    } else {
        console.warn(`⚠️ Basemap not found: ${basemapName}`);
        // Fallback to OpenStreetMap
        baseLayers['OpenStreetMap'].addTo(map);
    }
}

/**
 * Get current map bounds
 * @returns {Object} - Bounds object {north, south, east, west}
 */
export function getMapBounds() {
    if (!map) return null;

    const bounds = map.getBounds();
    return {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
    };
}

/**
 * Get map instance
 * @returns {L.Map} - Leaflet map instance
 */
export function getMap() {
    return map;
}

/**
 * Destroy map instance
 */
export function destroyMap() {
    if (map) {
        map.remove();
        map = null;
        drawnItems = null;
        baseLayers = {};
        overlayLayers = {};
        drawControl = null;
        // Clear layer groups
        Object.keys(layerGroups).forEach(key => delete layerGroups[key]);
        console.log('✅ Map destroyed');
    }
}

// Backward compatibility aliases
export const initMap = initializeMap;

export function getLayerGroup(name) {
    return layerGroups[name];
}

export function clearLayerGroup(groupName) {
    if (layerGroups[groupName]) {
        layerGroups[groupName].clearLayers();
    }
}

// Export for backward compatibility
export default {
    initializeMap,
    addGeoJSONLayer,
    removeLayer,
    clearDrawnItems,
    getDrawnFeatures,
    fitBounds,
    changeBasemap,
    getMapBounds,
    getMap,
    destroyMap
};
