import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Emit source maps only for production-visible stack traces if enabled.
    sourcemap: false,
    // Target modern browsers; adjust if legacy support is required.
    target: 'es2018',
    outDir: 'dist',
  },
})

