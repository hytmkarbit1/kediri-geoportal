// Custom Layer Control Component
import './layer-control.css';

export class CustomLayerControl {
    constructor(map, options = {}) {
        this.map = map;
        this.baseLayers = options.baseLayers || {};
        this.overlayLayers = options.overlayLayers || {};
        this.container = null;
        this.isCollapsed = false;
        this.defaultChecked = options.defaultChecked !== undefined ? options.defaultChecked : true;

        this.init();
    }

    init() {
        // Create container (starts collapsed)
        this.container = document.createElement('div');
        this.container.className = 'custom-layer-control';

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'layer-control-toggle';
        toggleBtn.innerHTML = '🗺️';
        toggleBtn.title = 'Toggle layers';
        toggleBtn.onclick = () => this.toggle();
        this.container.appendChild(toggleBtn);

        // Create sections container
        const sectionsContainer = document.createElement('div');
        sectionsContainer.className = 'control-sections';

        // Create basemaps section
        this.createBasemapsSection(sectionsContainer);

        // Create overlays section
        this.createOverlaysSection(sectionsContainer);

        this.container.appendChild(sectionsContainer);

        // Add to map container
        const mapContainer = this.map.getContainer();
        mapContainer.appendChild(this.container);
    }

    createBasemapsSection(parent) {
        const section = document.createElement('div');
        section.className = 'control-section';

        const heading = document.createElement('h4');
        heading.textContent = 'Basemaps';
        section.appendChild(heading);

        // Get current basemap
        let currentBasemap = null;
        Object.entries(this.baseLayers).forEach(([name, layer]) => {
            if (this.map.hasLayer(layer)) {
                currentBasemap = name;
            }
        });

        // Create radio buttons for basemaps
        Object.entries(this.baseLayers).forEach(([name, layer]) => {
            const label = document.createElement('label');
            label.className = 'radio-label';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'basemap';
            radio.value = name;
            radio.checked = name === currentBasemap;
            radio.onchange = () => this.changeBasemap(name);

            const span = document.createElement('span');
            span.textContent = name;

            label.appendChild(radio);
            label.appendChild(span);
            section.appendChild(label);
        });

        parent.appendChild(section);
    }

    createOverlaysSection(parent) {
        const section = document.createElement('div');
        section.className = 'control-section';

        const heading = document.createElement('h4');
        heading.textContent = 'Map Overlays';
        section.appendChild(heading);

        // Create checkboxes for overlays
        Object.entries(this.overlayLayers).forEach(([name, layer]) => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `layer-${name.replace(/\s+/g, '-').toLowerCase()}`;
            // Use defaultChecked option, default to false (unchecked)
            checkbox.checked = this.defaultChecked && this.map.hasLayer(layer);
            checkbox.onchange = (e) => this.toggleOverlay(name, e.target.checked);

            const span = document.createElement('span');
            span.textContent = name;

            label.appendChild(checkbox);
            label.appendChild(span);
            section.appendChild(label);
        });

        parent.appendChild(section);
    }

    changeBasemap(name) {
        // Remove all basemaps
        Object.values(this.baseLayers).forEach(layer => {
            if (this.map.hasLayer(layer)) {
                this.map.removeLayer(layer);
            }
        });

        // Add selected basemap
        if (this.baseLayers[name]) {
            this.baseLayers[name].addTo(this.map);
            console.log(`✅ Basemap changed to: ${name}`);
        }
    }

    toggleOverlay(name, show) {
        const layer = this.overlayLayers[name];
        if (!layer) return;

        if (show) {
            if (!this.map.hasLayer(layer)) {
                layer.addTo(this.map);
                console.log(`✅ Overlay enabled: ${name}`);
            }
        } else {
            if (this.map.hasLayer(layer)) {
                this.map.removeLayer(layer);
                console.log(`✅ Overlay disabled: ${name}`);
            }
        }
    }

    toggle() {
        if (this.container.classList.contains('expanded')) {
            this.container.classList.remove('expanded');
        } else {
            this.container.classList.add('expanded');
        }
    }

    addOverlay(name, layer, visible = true) {
        this.overlayLayers[name] = layer;
        if (visible) {
            layer.addTo(this.map);
        }
        this.refresh();
    }

    removeOverlay(name) {
        const layer = this.overlayLayers[name];
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }
        delete this.overlayLayers[name];
        this.refresh();
    }

    refresh() {
        // Clear and rebuild the control
        this.container.innerHTML = '';
        this.init();
    }

    remove() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

export default CustomLayerControl;
