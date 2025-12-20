// Shapefile Upload Module
import * as shapefile from 'shapefile';
import JSZip from 'jszip';
import { supabase } from '../config/supabase.js';
import { getAuthState } from '../auth/auth.js';
import { refreshAllLayers } from '../map/layers.js';

// Setup upload UI
export function setupUploadUI() {
    const uploadBtn = document.getElementById('upload-shapefile-btn');
    const fileInput = document.getElementById('shapefile-input');

    uploadBtn?.addEventListener('click', () => {
        fileInput?.click();
    });

    fileInput?.addEventListener('change', handleFileUpload);
}

// Handle file upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const authState = getAuthState();
    if (!authState.isAuthenticated) {
        showMessage('Please login to upload data', 'error');
        return;
    }

    if (!file.name.endsWith('.zip')) {
        showMessage('Please upload a zipped shapefile (.zip)', 'error');
        return;
    }

    showMessage('Processing shapefile...', 'info');

    try {
        const arrayBuffer = await file.arrayBuffer();
        const geojson = await parseShapefile(arrayBuffer);

        if (!geojson || !geojson.features || geojson.features.length === 0) {
            showMessage('No features found in shapefile', 'error');
            return;
        }

        // Upload to database
        await uploadFeatures(geojson.features, file.name);

        showMessage(`Successfully uploaded ${geojson.features.length} features!`, 'success');

        // Refresh map
        await refreshAllLayers();

        // Clear input
        event.target.value = '';

    } catch (error) {
        console.error('Upload error:', error);
        showMessage('Error uploading shapefile: ' + error.message, 'error');
    }
}

// Parse shapefile from zip
async function parseShapefile(arrayBuffer) {
    try {
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Find .shp and .dbf files
        const shpFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith('.shp'));
        const dbfFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith('.dbf'));

        if (!shpFile) {
            throw new Error('Zip must contain a .shp file');
        }

        // Get buffers
        const shpBuffer = await shpFile.async('arraybuffer');
        const dbfBuffer = dbfFile ? await dbfFile.async('arraybuffer') : undefined;

        const features = [];

        // Read shapefile
        const source = await shapefile.open(shpBuffer, dbfBuffer);

        let result = await source.read();
        while (!result.done) {
            if (result.value) {
                features.push(result.value);
            }
            result = await source.read();
        }

        return {
            type: 'FeatureCollection',
            features: features
        };
    } catch (error) {
        console.error('Shapefile parsing error:', error);
        throw new Error('Failed to parse shapefile: ' + error.message);
    }
}

// Upload features to database
async function uploadFeatures(features, filename) {
    const authState = getAuthState();

    const records = features.map(feature => {
        // Extract name and type from properties
        const props = feature.properties || {};
        // Try to find a meaningful name
        const featureName = props.name || props.NAME || props.Name || props.NAMOBJ || 'Unnamed';
        const featureType = props.type || props.TYPE || props.Type || props.REMARK || 'Unknown';

        return {
            feature_name: featureName,
            feature_type: featureType,
            description: props.description || null,
            source_filename: filename,
            attributes: props,
            geom: feature.geometry,
            user_id: authState.user.id,
            status: 'pending'
        };
    });

    // Insert into database
    const { data, error } = await supabase
        .schema('crowd_data')
        .from('uploaded_features')
        .insert(records);

    if (error) {
        throw error;
    }

    return data;
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
