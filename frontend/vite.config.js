import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __VITE_BACKEND_URL__: JSON.stringify(process.env.VITE_BACKEND_URL || 'http://localhost:5000')
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/query-router': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true
      },
      '/static': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
