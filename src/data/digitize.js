// Digitization Module - Draw features on map
import L from 'leaflet';
import 'leaflet-draw';
import { getMap, getLayerGroup } from '../map/map.js';
import { supabase } from '../config/supabase.js';
import { getAuthState } from '../auth/auth.js';
import { refreshAllLayers } from '../map/layers.js';

let drawControl = null;
let isDrawingEnabled = false;

// Initialize drawing tools
export function initDrawingTools() {
    const map = getMap();
    const drawingLayer = getLayerGroup('drawingLayer');

    // WORKAROUND: Patch the buggy readableArea function in Leaflet.draw
    // This prevents the "type is not defined" error when drawing polygons
    if (L.GeometryUtil && L.GeometryUtil.readableArea) {
        L.GeometryUtil.readableArea = function (area, isMetric) {
            // Simple area formatter without the buggy type parameter
            const areaStr = area.toFixed(2);
            return isMetric ? areaStr + ' m²' : areaStr + ' sq ft';
        };
    }

    // Drawing control options
    drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#3388ff',
                    weight: 4
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#3388ff',
                    fillOpacity: 0.4
                }
            },
            circle: {
                shapeOptions: {
                    color: '#3388ff',
                    fillOpacity: 0.4
                }
            },
            circlemarker: false,
            marker: {
                icon: L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            },
            polygon: {
                allowIntersection: true,
                shapeOptions: {
                    color: '#3388ff',
                    fillOpacity: 0.4
                }
            }
        },
        edit: {
            featureGroup: drawingLayer,
            remove: true
        }
    });

    // Handle feature creation
    map.on(L.Draw.Event.CREATED, handleFeatureCreated);

    console.log('Drawing tools initialized');
}

// Toggle drawing mode
export function toggleDrawing() {
    const map = getMap();
    const authState = getAuthState();

    if (!authState.isAuthenticated) {
        showMessage('Please login to digitize features', 'error');
        return;
    }

    if (isDrawingEnabled) {
        map.removeControl(drawControl);
        isDrawingEnabled = false;
        document.getElementById('toggle-drawing-btn')?.classList.remove('active');
    } else {
        drawControl.addTo(map);
        isDrawingEnabled = true;
        document.getElementById('toggle-drawing-btn')?.classList.add('active');
        showMessage('Drawing mode enabled. Use the toolbar to draw markers, polygons, rectangles, circles, or lines.', 'info');
    }
}

// Handle created feature
async function handleFeatureCreated(event) {
    const layer = event.layer;
    const type = event.layerType;

    // Add to drawing layer temporarily
    getLayerGroup('drawingLayer').addLayer(layer);

    // Show attribute form
    showAttributeForm(layer, type);
}

// Show attribute form dialog
function showAttributeForm(layer, geometryType) {
    const dialog = document.getElementById('attribute-dialog');
    const form = document.getElementById('attribute-form');

    // Clear previous values
    form.reset();

    // Show dialog
    dialog.style.display = 'block';

    // Handle form submission
    const submitHandler = async (e) => {
        e.preventDefault();

        const featureName = document.getElementById('feature-name').value;
        const featureType = document.getElementById('feature-type').value;
        const description = document.getElementById('feature-description').value;

        if (!featureName || !featureType) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        try {
            await saveFeature(layer, geometryType, featureName, featureType, description);

            // Close dialog
            dialog.style.display = 'none';
            form.removeEventListener('submit', submitHandler);

            // Remove from drawing layer
            getLayerGroup('drawingLayer').removeLayer(layer);

            // Refresh map
            await refreshAllLayers();

            showMessage('Feature saved successfully!', 'success');

        } catch (error) {
            console.error('Save error:', error);
            showMessage('Error saving feature: ' + error.message, 'error');
        }
    };

    form.addEventListener('submit', submitHandler);

    // Handle cancel
    document.getElementById('cancel-attribute-btn')?.addEventListener('click', () => {
        dialog.style.display = 'none';
        getLayerGroup('drawingLayer').removeLayer(layer);
        form.removeEventListener('submit', submitHandler);
    });
}

// Save feature to database
async function saveFeature(layer, geometryType, featureName, featureType, description) {
    const authState = getAuthState();

    // Convert to GeoJSON
    const geojson = layer.toGeoJSON();
    let geometry = geojson.geometry;

    // Determine table and schema based on geometry type
    let tableName;
    const schemaName = 'crowd_data';

    // Map Leaflet.draw types to database tables
    if (geometryType === 'marker') {
        tableName = 'user_points';
    } else if (geometryType === 'polygon' || geometryType === 'rectangle' || geometryType === 'circle') {
        // Rectangle and circle are converted to polygons by Leaflet
        tableName = 'user_polygons';
    } else if (geometryType === 'polyline') {
        // Polylines need special handling - they're LineString geometries
        // For now, we'll store them in user_polygons table as well
        // You may want to create a separate user_lines table in the future
        tableName = 'user_polygons';
        console.log('Note: Polylines are stored in user_polygons table. Consider creating a user_lines table.');
    } else {
        throw new Error(`Unsupported geometry type: ${geometryType}`);
    }

    // Prepare record
    const record = {
        feature_name: featureName,
        feature_type: featureType,
        description: description || null,
        geom: geometry,
        user_id: authState.user.id,
        status: 'pending'
    };

    // Insert into database
    const { data, error } = await supabase
        .schema(schemaName)
        .from(tableName)
        .insert([record]);

    if (error) {
        throw error;
    }

    return data;
}

// Setup drawing UI
export function setupDrawingUI() {
    const toggleBtn = document.getElementById('toggle-drawing-btn');
    toggleBtn?.addEventListener('click', toggleDrawing);
}

// Show message helper
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message-display');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
