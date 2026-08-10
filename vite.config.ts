import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/R3B1RTH/',
  build: { outDir: 'dist', sourcemap: true },
  server: { port: 3000, open: true, cors: true },
  preview: { port: 4173 },
});
