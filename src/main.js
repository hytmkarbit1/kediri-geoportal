// Main Application Entry Point
import { initAuth, setupAuthUI } from './auth/auth.js';
import { initMap, getMap, layerGroups } from './map/map.js';
import { loadGovernmentLayers, loadCrowdLayers } from './map/layers.js';
import { createLayerControl } from './map/controls.js';
import { CustomLayerControl } from './map/custom-layer-control.js';
import { ToggleableLegend } from './components/legend.js';
import { LoadingProgress } from './components/loading.js';
import { LocationSearch } from './components/search.js';
import { setupUploadUI } from './data/upload.js';
import { setupDownloadUI, setupDownloadButtons } from './data/download.js';
import { initDrawingTools, setupDrawingUI } from './data/digitize.js';

// Create global loading progress instance
const loadingProgress = new LoadingProgress();

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

        // DON'T load layers automatically - lazy load on demand
        // await loadGovernmentLayers();
        // await loadCrowdLayers();
        // await loadRasterLayer();

        console.log('ℹ️  Layers will load on demand when toggled');

        // Create custom layer control after map is ready
        const map = getMap();
        const customControl = new CustomLayerControl(map, {
            baseLayers: map.baseLayers || {},
            overlayLayers: {
                'Land Cover': layerGroups.land_cover,
                'Admin Boundaries': layerGroups.admin_boundaries,
                'Buildings': layerGroups.buildings,
                'Commercial Points': layerGroups.commercial_points,
                'Roads': layerGroups.roads,
                'Education Points': layerGroups.education_points,
                'RTRW Banyakan': layerGroups.rtrw_banyakan,
                'User Points': layerGroups.user_points,
                'User Polygons': layerGroups.user_polygons,
                'Elevation (DEM)': layerGroups.rasterData
            },
            defaultChecked: false // All layers unchecked by default
        });

        // Track which individual layers have been loaded
        const loadedLayers = new Set();

        // Override toggle to lazy load layers with progress bar
        const originalToggle = customControl.toggleOverlay.bind(customControl);
        customControl.toggleOverlay = async function (name, show) {
            const layerGroup = customControl.overlayLayers[name];

            if (show && !loadedLayers.has(name)) {
                console.log(`📥 Lazy loading: ${name}`);

                // Show progress bar
                loadingProgress.start(1);
                loadingProgress.updateMessage(`Loading ${name}...`);

                try {
                    // Load ONLY the specific layer that was toggled
                    if (name === 'Land Cover') {
                        const { loadLandCover } = await import('./map/layers.js');
                        await loadLandCover();
                    } else if (name === 'Admin Boundaries') {
                        const { loadAdminBoundaries } = await import('./map/layers.js');
                        await loadAdminBoundaries();
                    } else if (name === 'Buildings') {
                        const { loadBuildings } = await import('./map/layers.js');
                        await loadBuildings();
                    } else if (name === 'Commercial Points') {
                        const { loadCommercialPoints } = await import('./map/layers.js');
                        await loadCommercialPoints();
                    } else if (name === 'Roads') {
                        const { loadRoads } = await import('./map/layers.js');
                        await loadRoads();
                    } else if (name === 'Education Points') {
                        const { loadEducationPoints } = await import('./map/layers.js');
                        await loadEducationPoints();
                    } else if (name === 'RTRW Banyakan') {
                        const { loadOfficialDataLayers } = await import('./map/layers.js');
                        await loadOfficialDataLayers();
                    } else if (name === 'User Points') {
                        const { loadUserPoints } = await import('./map/layers.js');
                        await loadUserPoints();
                    } else if (name === 'User Polygons') {
                        const { loadUserPolygons } = await import('./map/layers.js');
                        await loadUserPolygons();
                    } else if (name === 'Elevation (DEM)') {
                        // Conditionally load raster and proj4 only if enabled
                        const enableRaster = import.meta.env.VITE_ENABLE_RASTER !== 'false';
                        if (enableRaster) {
                            // Dynamically import proj4 first
                            const proj4Module = await import('proj4');
                            window.proj4 = proj4Module.default;
                            console.log('✅ Proj4 loaded for raster support');

                            // Then import and load raster layer
                            const { loadRasterLayer } = await import('./map/raster.js');
                            await loadRasterLayer();
                        } else {
                            console.log('⚠️  Raster layer disabled in production');
                        }
                    }

                    loadedLayers.add(name);
                    loadingProgress.complete();
                } catch (error) {
                    console.error(`Error loading ${name}:`, error);
                    loadingProgress.hide();
                }
            }

            // Show/hide ONLY the specific layer that was toggled
            if (layerGroup) {
                if (show) {
                    if (!map.hasLayer(layerGroup)) {
                        layerGroup.addTo(map);
                        console.log(`✅ Showing layer: ${name}`);
                    }
                } else {
                    if (map.hasLayer(layerGroup)) {
                        map.removeLayer(layerGroup);
                        console.log(`✅ Hiding layer: ${name}`);
                    }
                }
            }
        };

        console.log('✅ Custom layer control created');

        // Create toggleable legend
        const legend = new ToggleableLegend(map);
        console.log('✅ Toggleable legend created');

        // Create location search
        const locationSearch = new LocationSearch(map);
        console.log('✅ Location search created');

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

        // Handle URL parameters for flyTo from admin panel
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('lat') && urlParams.has('lng')) {
            const lat = parseFloat(urlParams.get('lat'));
            const lng = parseFloat(urlParams.get('lng'));
            const zoom = parseInt(urlParams.get('zoom')) || 16;
            const name = urlParams.get('name') || 'Feature';

            // Fly to location
            map.setView([lat, lng], zoom);

            // Add marker
            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(`<strong>${name}</strong>`).openPopup();

            console.log(`✅ Flew to: ${name} (${lat}, ${lng})`);
        }

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
