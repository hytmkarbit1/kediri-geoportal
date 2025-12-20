// Data Download Module
import { supabase } from '../config/supabase.js';
import shpwrite from 'shp-write';

// Setup download UI
export function setupDownloadUI() {
    const downloadBtn = document.getElementById('download-data-btn');
    downloadBtn?.addEventListener('click', showDownloadDialog);
}

// Show download dialog
function showDownloadDialog() {
    const dialog = document.getElementById('download-dialog');
    if (dialog) {
        dialog.style.display = 'block';
    }
}

// Hide download dialog
export function hideDownloadDialog() {
    const dialog = document.getElementById('download-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

// Download data as GeoJSON
export async function downloadAsGeoJSON(schema, table) {
    try {
        showMessage('Preparing download...', 'info');

        const { data, error } = await supabase
            .schema(schema)
            .from(table)
            .select('*');

        if (error) throw error;

        if (!data || data.length === 0) {
            showMessage('No data available for download', 'warning');
            return;
        }

        // Convert to GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: data.map(row => ({
                type: 'Feature',
                properties: { ...row, geom: undefined },
                geometry: row.geom
            }))
        };

        // Create download
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}_${new Date().toISOString().split('T')[0]}.geojson`;
        a.click();
        URL.revokeObjectURL(url);

        showMessage('Download complete!', 'success');

    } catch (error) {
        console.error('Download error:', error);
        showMessage('Error downloading data: ' + error.message, 'error');
    }
}

// Download data as Shapefile
export async function downloadAsShapefile(schema, table) {
    try {
        showMessage('Preparing shapefile download...', 'info');

        const { data, error } = await supabase
            .schema(schema)
            .from(table)
            .select('*');

        if (error) throw error;

        if (!data || data.length === 0) {
            showMessage('No data available for download', 'warning');
            return;
        }

        // Convert to GeoJSON format for shp-write
        const geojson = {
            type: 'FeatureCollection',
            features: data.map(row => ({
                type: 'Feature',
                properties: { ...row, geom: undefined, id: row.id },
                geometry: row.geom
            }))
        };

        // Generate shapefile
        const options = {
            folder: table,
            types: {
                point: 'points',
                polygon: 'polygons',
                line: 'lines'
            }
        };

        shpwrite.download(geojson, options);

        showMessage('Shapefile download complete!', 'success');

    } catch (error) {
        console.error('Shapefile download error:', error);
        showMessage('Error creating shapefile: ' + error.message, 'error');
    }
}

// Setup download buttons
export function setupDownloadButtons() {
    // Government data downloads
    document.getElementById('download-land-cover')?.addEventListener('click', () => {
        downloadAsGeoJSON('government_data', 'land_cover');
    });

    document.getElementById('download-admin-boundaries')?.addEventListener('click', () => {
        downloadAsGeoJSON('government_data', 'admin_boundaries');
    });

    document.getElementById('download-buildings')?.addEventListener('click', () => {
        downloadAsGeoJSON('government_data', 'buildings');
    });

    document.getElementById('download-commercial')?.addEventListener('click', () => {
        downloadAsGeoJSON('government_data', 'commercial_points');
    });

    document.getElementById('download-roads')?.addEventListener('click', () => {
        downloadAsGeoJSON('government_data', 'roads');
    });

    document.getElementById('download-education')?.addEventListener('click', () => {
        downloadAsGeoJSON('government_data', 'education_points');
    });

    // Crowd data downloads
    document.getElementById('download-user-points')?.addEventListener('click', () => {
        downloadAsGeoJSON('crowd_data', 'user_points');
    });

    document.getElementById('download-user-polygons')?.addEventListener('click', () => {
        downloadAsGeoJSON('crowd_data', 'user_polygons');
    });

    // Close dialog
    document.getElementById('close-download-dialog')?.addEventListener('click', hideDownloadDialog);
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
