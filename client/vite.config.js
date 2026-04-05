import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),        // ✅ MUST be enabled
    tailwindcss(),  // ✅ Tailwind plugin (new way)
  ],
  server: {
    // Avoid native macOS file-watch issues when fsevents is blocked by Gatekeeper.
    watch: {
      usePolling: true,
    },
  },
});
