import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth-api': {
        target: 'http://64.225.99.124:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
      },
      '/news-api': {
        target: 'http://64.225.99.124:8082',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/news-api/, ''),
      },
    },
  },
})