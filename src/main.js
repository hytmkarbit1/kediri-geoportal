// Main Application Entry Point
// Proj4 is loaded via CDN in HTML to avoid bundling issues
// Ensure it's globally available for other libraries
if (typeof window !== 'undefined' && window.proj4) {
    window.proj4 = window.proj4;
}
console.log('🌍 Proj4 status:', typeof window.proj4 === 'function' ? 'OK' : 'MISSING');

import { initAuth, setupAuthUI } from './auth/auth.js';
import { initMap } from './map/map.js';
import { loadGovernmentLayers, loadCrowdLayers } from './map/layers.js';
import { createLayerControl, createLegend } from './map/controls.js';
import { setupUploadUI } from './data/upload.js';
import { setupDownloadUI, setupDownloadButtons } from './data/download.js';
import { initDrawingTools, setupDrawingUI } from './data/digitize.js';

import { loadRasterLayer } from './map/raster.js';

// Initialize application
async function init() {
    console.log('🚀 Initializing Kediri Geoportal...');

    try {
        // Initialize authentication
        await initAuth();
        console.log('✅ Authentication initialized');

        // Initialize map
        await initMap();
        console.log('✅ Map initialized');

        // Create map controls
        createLayerControl();
        createLegend();
        console.log('✅ Map controls created');

        // Initialize drawing tools
        initDrawingTools();
        console.log('✅ Drawing tools initialized');

        // Setup UI event handlers
        setupAuthUI();
        setupUploadUI();
        setupDownloadUI();
        setupDownloadButtons();
        setupDrawingUI();
        console.log('✅ UI event handlers setup');

        // Load initial data
        await loadGovernmentLayers();
        await loadCrowdLayers();
        await loadRasterLayer();
        console.log('✅ Initial data loaded');

        console.log('🎉 Kediri Geoportal ready!');

    } catch (error) {
        console.error('❌ Error initializing application:', error);
        alert('Failed to initialize application. Please check the console for details.');
    }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle auth state changes
window.addEventListener('authStateChanged', async (event) => {
    const authState = event.detail;
    console.log('Auth state changed:', authState);

    // Reload crowd data when user logs in/out
    if (authState.isAuthenticated) {
        const { loadCrowdLayers } = await import('./map/layers.js');
        await loadCrowdLayers();
    }
});
