import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Design doc §8.1: treat GLBs as assets so future GLTF models load via imports.
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  server: { port: 5173, open: true },
});
