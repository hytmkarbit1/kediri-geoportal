// Raster Data Module
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import proj4 from 'proj4';
import { getLayerGroup, getMap } from './map.js';

export async function loadRasterLayer() {
    console.log('🏔️ Loading raster layer (DEM)...');
    try {
        const response = await fetch('/data/demnas_kediri.tif');
        if (!response.ok) throw new Error(`Failed to fetch raster: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);

        console.log('✅ Raster metadata:', {
            width: georaster.width,
            height: georaster.height,
            projection: georaster.projection,
            noDataValue: georaster.noDataValue,
            pixelWidth: georaster.pixelWidth,
            pixelHeight: georaster.pixelHeight,
            minValue: georaster.mins,
            maxValue: georaster.maxs
        });

        const layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.7,
            resolution: 64,
            pixelValuesToColorFn: values => {
                const val = values[0];
                if (val === georaster.noDataValue || isNaN(val)) return null;

                // Simple terrain color scale for DEM
                // Assuming Kediri elevation range approx 50m to 3000m
                if (val < 100) return '#2d5a27'; // Dark Green
                if (val < 300) return '#4d9221'; // Green
                if (val < 600) return '#a1d76a'; // Light Green
                if (val < 1000) return '#e6f5d0'; // Yellowish
                if (val < 1500) return '#fee08b'; // Yellow
                if (val < 2000) return '#fdae61'; // Orange
                if (val < 2500) return '#f46d43'; // Reddish
                return '#d53e4f'; // Dark Red
            },
            debugLevel: 0
        });

        const group = getLayerGroup('rasterData');
        if (group) {
            layer.addTo(group);
            console.log('✅ Raster layer added to map');

            const map = getMap();
            if (map && layer.getBounds) {
                map.fitBounds(layer.getBounds());
                console.log('✅ Map zoomed to raster bounds');
            }
        } else {
            console.error('❌ Raster layer group not found');
        }
    } catch (error) {
        console.error('❌ Error loading raster layer:', error);
    }
}
