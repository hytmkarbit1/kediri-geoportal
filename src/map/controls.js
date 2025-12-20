// Map Controls Module
import L from 'leaflet';
import { getMap, getLayerGroup } from './map.js';

// Create layer control panel
export function createLayerControl() {
    const map = getMap();

    // Base layers from map.js
    const baseLayers = map.baseLayers || {};

    // Overlay layers (Individual Layer Groups)
    const overlays = {
        "Land Cover": getLayerGroup('land_cover'),
        "Admin Boundaries": getLayerGroup('admin_boundaries'),
        "Buildings": getLayerGroup('buildings'),
        "Commercial": getLayerGroup('commercial_points'),
        "Roads": getLayerGroup('roads'),
        "Education": getLayerGroup('education_points'),
        "User Points": getLayerGroup('user_points'),
        "User Polygons": getLayerGroup('user_polygons'),
        "Uploaded Data": getLayerGroup('uploaded_features'),
        "Elevation (DEM)": getLayerGroup('rasterData')
    };

    // Use standard Leaflet layer control for better basemap handling
    L.control.layers(baseLayers, overlays, {
        position: 'topright',
        collapsed: true
    }).addTo(map);
}

// Create legend
export function createLegend() {
    const Legend = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'legend leaflet-bar');
            container.innerHTML = `
                <h4>Legend</h4>
                <div class="legend-section">
                    <div class="legend-item">
                        <span class="legend-symbol" style="background: #90EE90; border: 1px solid #228B22;"></span>
                        Land Cover
                    </div>
                    <div class="legend-item">
                        <span class="legend-symbol" style="background: transparent; border: 2px dashed #FF6347;"></span>
                        Admin Boundaries
                    </div>
                    <div class="legend-item">
                        <span class="legend-symbol" style="background: #D3D3D3; border: 1px solid #696969;"></span>
                        Buildings
                    </div>
                    <div class="legend-item">
                        <span class="legend-symbol circle" style="background: #FFD700; border: 2px solid #FF8C00;"></span>
                        Commercial
                    </div>
                    <div class="legend-item">
                        <span class="legend-line" style="background: #4682B4;"></span>
                        Roads
                    </div>
                    <div class="legend-item">
                        <span class="legend-symbol circle" style="background: #4169E1; border: 2px solid #000080;"></span>
                        Education
                    </div>
                </div>

                <h4 style="margin-top: 15px;">Elevation (DEM)</h4>
                <div class="legend-section">
                    <div class="legend-item"><span class="legend-symbol" style="background: #2d5a27;"></span> < 100m</div>
                    <div class="legend-item"><span class="legend-symbol" style="background: #4d9221;"></span> 100m - 300m</div>
                    <div class="legend-item"><span class="legend-symbol" style="background: #a1d76a;"></span> 300m - 600m</div>
                    <div class="legend-item"><span class="legend-symbol" style="background: #e6f5d0;"></span> 600m - 1000m</div>
                    <div class="legend-item"><span class="legend-symbol" style="background: #fee08b;"></span> 1000m - 1500m</div>
                    <div class="legend-item"><span class="legend-symbol" style="background: #fdae61;"></span> 1500m - 2000m</div>
                    <div class="legend-item"><span class="legend-symbol" style="background: #f46d43;"></span> 2000m - 2500m</div>
                    <div class="legend-item"><span class="legend-symbol" style="background: #d53e4f;"></span> > 2500m</div>
                </div>

                <h4 style="margin-top: 15px;">Crowd Data</h4>
                <div class="legend-section">
                    <div class="legend-item">
                        <span class="legend-symbol circle" style="background: #FF69B4; border: 2px solid #C71585;"></span>
                        User Points
                    </div>
                    <div class="legend-item">
                        <span class="legend-symbol" style="background: #DDA0DD; border: 2px solid #9370DB;"></span>
                        User Polygons
                    </div>
                </div>
            `;

            L.DomEvent.disableClickPropagation(container);
            return container;
        }
    });

    new Legend().addTo(getMap());
}
