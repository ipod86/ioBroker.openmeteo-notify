import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        port: 3000,
        proxy: {
            '/adapter': { target: 'http://localhost:8081' },
            '/socket.io': { target: 'http://localhost:8081', ws: true },
        },
    },
    build: {
        outDir: '../admin',
        emptyOutDir: false,
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
            },
        },
    },
});
