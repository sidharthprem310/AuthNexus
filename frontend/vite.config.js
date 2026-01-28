import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:5008',
        changeOrigin: true,
      },
      '/mfa': {
        target: 'http://127.0.0.1:5008',
        changeOrigin: true,
      },
      '/oauth': {
        target: 'http://127.0.0.1:5008',
        changeOrigin: true,
      }
    }
  }
})
