// Toggleable Legend Component
import './legend.css';

export class ToggleableLegend {
    constructor(map, options = {}) {
        this.map = map;
        this.layers = options.layers || {};
        this.container = null;
        this.isCollapsed = false;

        this.init();
    }

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'legend-panel';

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'legend-toggle-btn';
        toggleBtn.innerHTML = this.isCollapsed ? '📊' : '✕';
        toggleBtn.title = 'Toggle legend';
        toggleBtn.onclick = () => this.toggle();
        this.container.appendChild(toggleBtn);

        // Create content container
        const content = document.createElement('div');
        content.className = 'legend-content';

        // Add title
        const title = document.createElement('h3');
        title.className = 'legend-title';
        title.textContent = 'Map Legend';
        content.appendChild(title);

        // Generate legend items
        this.generateLegendItems(content);

        this.container.appendChild(content);

        // Add to map container
        const mapContainer = this.map.getContainer();
        mapContainer.appendChild(this.container);
    }

    generateLegendItems(container) {
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'legend-items';

        // Define layer styles and types - MUST match layers.js styles
        const layerConfig = {
            'RTRW Banyakan': { color: '#FFD700', type: 'polygon' },  // Gold (matches RTRW fillColor)
            'Land Cover': { color: '#90EE90', type: 'polygon' },      // Light green (matches land_cover fillColor)
            'Admin Boundaries': { color: '#FF6347', type: 'line' },   // Tomato red (matches admin_boundaries color)
            'Buildings': { color: '#D3D3D3', type: 'polygon' },       // Light gray (matches buildings fillColor)
            'Roads': { color: '#4682B4', type: 'line' },              // Steel blue (matches roads color)
            'Commercial Points': { color: '#FFD700', type: 'point' }, // Gold (matches commercial_points fillColor)
            'Education Points': { color: '#4169E1', type: 'point' },  // Royal blue (matches education_points fillColor)
            'User Points': { color: '#FF69B4', type: 'point' },       // Hot pink (matches user_points fillColor)
            'User Polygons': { color: '#DDA0DD', type: 'polygon' },   // Plum (matches user_polygons fillColor)
            'Elevation (DEM)': { color: 'linear-gradient(to right, #2d5a27, #4d9221, #a1d76a, #e6f5d0, #fee08b, #fdae61, #f46d43, #d53e4f)', type: 'raster' }  // Terrain gradient
        };


        // Group by type
        const sections = {
            'Polygons': [],
            'Lines': [],
            'Points': [],
            'Raster': []
        };

        Object.entries(layerConfig).forEach(([name, config]) => {
            const item = this.createLegendItem(name, config.color, config.type);

            if (config.type === 'polygon') {
                sections['Polygons'].push(item);
            } else if (config.type === 'line') {
                sections['Lines'].push(item);
            } else if (config.type === 'point') {
                sections['Points'].push(item);
            } else if (config.type === 'raster') {
                sections['Raster'].push(item);
            }
        });

        // Add sections
        Object.entries(sections).forEach(([sectionName, items]) => {
            if (items.length > 0) {
                const section = document.createElement('div');
                section.className = 'legend-section';

                const sectionTitle = document.createElement('div');
                sectionTitle.className = 'legend-section-title';
                sectionTitle.textContent = sectionName;
                section.appendChild(sectionTitle);

                items.forEach(item => section.appendChild(item));
                itemsContainer.appendChild(section);
            }
        });

        container.appendChild(itemsContainer);
    }

    createLegendItem(label, color, type) {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const swatch = document.createElement('div');
        swatch.className = `legend-swatch ${type}`;

        // Use background for gradients (raster), backgroundColor for solid colors
        if (type === 'raster') {
            swatch.style.background = color;
        } else {
            swatch.style.backgroundColor = color;
        }

        // Special styling for line type
        if (type === 'line') {
            swatch.style.height = '3px';
            swatch.style.width = '100%';
        }

        const labelEl = document.createElement('span');
        labelEl.className = 'legend-label';
        labelEl.textContent = label;

        item.appendChild(swatch);
        item.appendChild(labelEl);

        // Add elevation range for raster type
        if (type === 'raster' && label === 'Elevation (DEM)') {
            const rangeContainer = document.createElement('div');
            rangeContainer.className = 'legend-raster-range';

            const minLabel = document.createElement('span');
            minLabel.className = 'legend-range-min';
            minLabel.textContent = '50m';

            const maxLabel = document.createElement('span');
            maxLabel.className = 'legend-range-max';
            maxLabel.textContent = '3000m';

            rangeContainer.appendChild(minLabel);
            rangeContainer.appendChild(maxLabel);
            item.appendChild(rangeContainer);
        }

        return item;
    }

    toggle() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            this.container.classList.add('collapsed');
            const toggleBtn = this.container.querySelector('.legend-toggle-btn');
            toggleBtn.innerHTML = '📊';
        } else {
            this.container.classList.remove('collapsed');
            const toggleBtn = this.container.querySelector('.legend-toggle-btn');
            toggleBtn.innerHTML = '✕';
        }
    }

    addLayer(name, color, type) {
        this.layers[name] = { color, type };
        this.refresh();
    }

    removeLayer(name) {
        delete this.layers[name];
        this.refresh();
    }

    refresh() {
        // Clear and rebuild
        const content = this.container.querySelector('.legend-content');
        content.innerHTML = '';

        const title = document.createElement('h3');
        title.className = 'legend-title';
        title.textContent = 'Map Legend';
        content.appendChild(title);

        this.generateLegendItems(content);
    }

    remove() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

export default ToggleableLegend;
