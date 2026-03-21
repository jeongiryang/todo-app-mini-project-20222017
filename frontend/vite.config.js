import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 🚀 여기서부터 추가되는 통로(Proxy) 설정입니다!
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // 우리 백엔드 서버 주소
        changeOrigin: true,
        secure: false,
      },
    },
  },
})