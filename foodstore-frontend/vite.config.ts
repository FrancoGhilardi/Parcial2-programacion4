import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Puerto fijo: es el origen habilitado en el CORS del backend.
  // Si está ocupado, Vite falla en vez de cambiar a otro puerto.
  server: { port: 5173, strictPort: true },
})
