import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 4002,
    strictPort: false,
    host: true,
    hmr: true
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  define: {
    'import.meta.env.VITE_AUTH_USERNAME': JSON.stringify('OnSet-ITSM'),
    'import.meta.env.VITE_AUTH_PASSWORD': JSON.stringify('Up2025It')
  }
});