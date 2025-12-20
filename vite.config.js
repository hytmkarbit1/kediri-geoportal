// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                map: resolve(__dirname, 'map.html'),
                admin: resolve(__dirname, 'admin.html')
            },
            external: ['proj4'],
            output: {
                globals: {
                    proj4: 'proj4'
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false
            }
        }
    },
    optimizeDeps: {
        include: ['leaflet', 'leaflet-draw', '@supabase/supabase-js']
    },
    server: {
        port: 5173,
        open: true
    }
});
