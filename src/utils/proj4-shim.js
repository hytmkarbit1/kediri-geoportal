/**
 * PROJ4 SHIM
 * This file allows us to 'import proj4 from "proj4"' in our source code
 * while actually using the global version loaded via CDN in map.html.
 * This fixes the 'Failed to resolve module specifier "proj4"' error.
 */

const proj4 = window.proj4;

if (!proj4) {
    console.error('❌ Proj4 not found on window object. Ensure the CDN script is loaded in HTML.');
}

export default proj4;
