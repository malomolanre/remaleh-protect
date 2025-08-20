import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative paths so assets load correctly in Capacitor (file:// scheme)
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Enable sourcemaps to debug minified ReferenceError stack traces in production
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  }
})

