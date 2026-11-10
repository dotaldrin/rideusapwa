import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg'],
    manifest: {
      name: 'RideUSA', short_name: 'RideUSA', description: 'Book your next ride with RideUSA',
      start_url: '/', display: 'standalone', background_color: '#f5f7fc', theme_color: '#0a1731',
      icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, {src:'/icon-512.png',sizes:'512x512',type:'image/png'}]
    },
    workbox: { navigateFallback: '/index.html', navigateFallbackDenylist: [/^\/api\//] }
  })],
  server: { port: 5175, strictPort: true, proxy: { '/api': { target: 'https://localhost:44347', changeOrigin: true, secure: false } } }
});
