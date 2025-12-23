// Location Search Component
import './search.css';
import L from 'leaflet';

export class LocationSearch {
    constructor(map) {
        this.map = map;
        this.container = null;
        this.input = null;
        this.resultsContainer = null;
        this.searchMarker = null;

        this.init();
    }

    init() {
        // Create search container
        this.container = document.createElement('div');
        this.container.className = 'search-container';

        // Create input
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Search location...';
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });

        // Create search button
        const searchBtn = document.createElement('button');
        searchBtn.innerHTML = '🔍';
        searchBtn.title = 'Search';
        searchBtn.onclick = () => this.search();

        this.container.appendChild(this.input);
        this.container.appendChild(searchBtn);

        // Create results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'search-results';

        // Add to map container
        const mapContainer = this.map.getContainer();
        mapContainer.appendChild(this.container);
        mapContainer.appendChild(this.resultsContainer);
    }

    async search() {
        const query = this.input.value.trim();
        if (!query) return;

        try {
            // Use Nominatim API (free, no key required)
            // Add Kediri bias to search
            const url = `https://nominatim.openstreetmap.org/search?` +
                `format=json&q=${encodeURIComponent(query)},Kediri,Indonesia&limit=5`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Kediri-Geoportal/1.0'
                }
            });

            const results = await response.json();
            this.displayResults(results);

        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed. Please try again.');
        }
    }

    displayResults(results) {
        this.resultsContainer.innerHTML = '';

        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.innerHTML = '<div class="name">No results found</div>';
            this.resultsContainer.appendChild(noResults);
            this.resultsContainer.classList.add('active');
            return;
        }

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = result.name || result.display_name.split(',')[0];

            const address = document.createElement('div');
            address.className = 'address';
            address.textContent = result.display_name;

            item.appendChild(name);
            item.appendChild(address);

            item.onclick = () => this.selectResult(result);

            this.resultsContainer.appendChild(item);
        });

        this.resultsContainer.classList.add('active');
    }

    selectResult(result) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Fly to location
        this.map.flyTo([lat, lon], 16, {
            duration: 1.5
        });

        // Remove previous marker if exists
        if (this.searchMarker) {
            this.map.removeLayer(this.searchMarker);
        }

        // Add marker
        this.searchMarker = L.marker([lat, lon], {
            icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        }).addTo(this.map);

        this.searchMarker.bindPopup(result.display_name).openPopup();

        // Hide results
        this.resultsContainer.classList.remove('active');
        this.input.value = '';
    }
}

export default LocationSearch;
