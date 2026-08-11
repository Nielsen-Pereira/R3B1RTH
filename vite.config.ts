import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "np-digital-61",
      project: "r3b1rth",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        disable: process.env.NODE_ENV !== 'production',
      },
    }),
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
