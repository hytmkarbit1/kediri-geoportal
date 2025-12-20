// Helper Utilities

// Format date for display
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format area
export function formatArea(areaSqm) {
    if (areaSqm < 10000) {
        return `${areaSqm.toFixed(2)} m²`;
    } else {
        const hectares = areaSqm / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
}

// Format distance
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${meters.toFixed(2)} m`;
    } else {
        const km = meters / 1000;
        return `${km.toFixed(2)} km`;
    }
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate unique ID
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
