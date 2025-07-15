import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ], // <-- Pastikan ada koma di sini

  // --- TAMBAHKAN BLOK INI ---
  server: {
    host: true,
    allowedHosts: [
      '.ply.gg'
    ]
  }
  // --------------------------
})