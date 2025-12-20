// Validation Utilities
import L from 'leaflet';

// Validate geometry
export function isValidGeometry(geometry) {
    if (!geometry || !geometry.type) {
        return false;
    }

    const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
    if (!validTypes.includes(geometry.type)) {
        return false;
    }

    if (!geometry.coordinates || geometry.coordinates.length === 0) {
        return false;
    }

    return true;
}

// Validate required attributes
export function validateAttributes(featureName, featureType) {
    const errors = [];

    if (!featureName || featureName.trim() === '') {
        errors.push('Feature name is required');
    }

    if (!featureType || featureType.trim() === '') {
        errors.push('Feature type is required');
    }

    return errors;
}

// Validate file format
export function isValidShapefileZip(filename) {
    return filename.toLowerCase().endsWith('.zip');
}

// Validate GeoJSON
export function isValidGeoJSON(geojson) {
    if (!geojson || typeof geojson !== 'object') {
        return false;
    }

    if (geojson.type === 'FeatureCollection') {
        return Array.isArray(geojson.features);
    }

    if (geojson.type === 'Feature') {
        return isValidGeometry(geojson.geometry);
    }

    return isValidGeometry(geojson);
}

// Sanitize user input
export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }

    return input.trim().replace(/[<>]/g, '');
}
