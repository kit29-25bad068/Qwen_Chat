import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy local Ollama API to avoid CORS issues
      '/api': {
        target: 'http://localhost:11434',
        changeOrigin: true,
      },
    },
  },
});
