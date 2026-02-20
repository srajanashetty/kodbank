import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API to backend - cookies work reliably when same origin
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Standard Vite output to 'dist' inside frontend folder
    outDir: 'dist',
  },
})
