import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from /<repo-name>/. The deploy workflow
// sets VITE_BASE accordingly. Locally and on custom domains, base stays '/'.
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 3200, // three.js + react-globe.gl bundle is large by design
  },
})
