// Map Initialization Module
import L from 'leaflet';

export let map = null;
export let layerGroups = {};

// Initialize the map
export function initMap() {
    // Create map centered on Kediri, Indonesia
    map = L.map('map', {
        center: [-7.8167, 112.0167], // Kediri coordinates
        zoom: 13,
        zoomControl: false
    });

    // Add zoom control to top right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add scale control
    L.control.scale({
        position: 'bottomleft',
        imperial: false
    }).addTo(map);

    // Define base layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });

    const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google Satellite',
        maxZoom: 20
    });

    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
        maxZoom: 17
    });

    // Add default basemap
    osm.addTo(map);

    // Store base layers for control
    map.baseLayers = {
        "OpenStreetMap": osm,
        "Satellite": satellite,
        "Terrain": topo
    };

    // Initialize individual layer groups for each data type
    layerGroups.land_cover = L.layerGroup().addTo(map);
    layerGroups.admin_boundaries = L.layerGroup().addTo(map);
    layerGroups.buildings = L.layerGroup(); // Hidden by default
    layerGroups.commercial_points = L.layerGroup().addTo(map);
    layerGroups.roads = L.layerGroup().addTo(map);
    layerGroups.education_points = L.layerGroup().addTo(map);

    layerGroups.user_points = L.layerGroup().addTo(map);
    layerGroups.user_polygons = L.layerGroup().addTo(map);
    layerGroups.uploaded_features = L.layerGroup(); // Hidden by default

    layerGroups.rasterData = L.layerGroup().addTo(map);
    layerGroups.drawingLayer = L.featureGroup().addTo(map);

    console.log('Map initialized successfully');
    return map;
}

// Get map instance
export function getMap() {
    return map;
}

// Get layer group by name
export function getLayerGroup(name) {
    return layerGroups[name];
}

// Clear all layers from a group
export function clearLayerGroup(groupName) {
    if (layerGroups[groupName]) {
        layerGroups[groupName].clearLayers();
    }
}

// Fit map to layer bounds
export function fitToLayer(layer) {
    if (layer && layer.getBounds) {
        map.fitBounds(layer.getBounds(), { padding: [50, 50] });
    }
}
