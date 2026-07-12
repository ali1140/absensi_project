import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ], // <-- Pastikan ada koma di sini

  server: {
    host: true,
    allowedHosts: [
      '.ply.gg'
    ],
    proxy: {
      '/src': {
        target: 'http://localhost/COBAK_REACT/SRC',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/src/, '')
      }
    }
  }
})