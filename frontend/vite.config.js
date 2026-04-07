import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
        secure: false,
      },
      
     
      '/proxy/weather': {
        target: 'https://api.open-meteo.com',
        changeOrigin: true,
        
        rewrite: (path) => path.replace(/^\/proxy\/weather/, '/v1/forecast'),
        secure: false,
      },
      
     
      '/proxy/dust': {
        target: 'https://air-quality-api.open-meteo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/dust/, '/v1/air-quality'),
        secure: false,
      }
    },
  },
})