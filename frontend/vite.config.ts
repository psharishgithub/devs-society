import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app', // Allow all ngrok subdomains
      '.ngrok.io', // Allow ngrok.io domains
      '.ngrok.app', // Allow ngrok.app domains
      '*',
    ],
    cors: true, // Enable CORS
  },
})
