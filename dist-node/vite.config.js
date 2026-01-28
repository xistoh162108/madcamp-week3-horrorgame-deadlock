import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@game': path.resolve(__dirname, './src/game'),
            '@ui': path.resolve(__dirname, './src/ui'),
            '@assets': path.resolve(__dirname, './src/assets'),
        },
    },
});
