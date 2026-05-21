import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const backendProxy = {
  target: "http://localhost:5001",
  changeOrigin: true,
};

export default defineConfig({
  plugins: [
    react(),        // ✅ MUST be enabled
    tailwindcss(),  // ✅ Tailwind plugin (new way)
  ],
  server: {
    proxy: {
      "/api": backendProxy,
      "/upload": backendProxy,
      "/signup": backendProxy,
      "/login": backendProxy,
      "/logout": backendProxy,
      "/me": backendProxy,
      "/chat": backendProxy,
      "/chats": backendProxy,
    },
    // Avoid native macOS file-watch issues when fsevents is blocked by Gatekeeper.
    watch: {
      usePolling: true,
    },
  },
});
