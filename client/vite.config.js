import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),        // ✅ MUST be enabled
    tailwindcss(),  // ✅ Tailwind plugin (new way)
  ],
  server: {
    proxy: {
      "/api": "http://localhost:5001",
      "/upload": "http://localhost:5001",
      "/signup": "http://localhost:5001",
      "/login": "http://localhost:5001",
      "/logout": "http://localhost:5001",
      "/me": "http://localhost:5001",
      "/chat": "http://localhost:5001",
      "/chats": "http://localhost:5001",
    },
    // Avoid native macOS file-watch issues when fsevents is blocked by Gatekeeper.
    watch: {
      usePolling: true,
    },
  },
});
