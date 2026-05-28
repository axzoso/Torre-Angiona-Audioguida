import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{html,css,js,ico,png,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 15_000_000,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              rangeRequests: true, // Abilita HTTP 206 Partial Content per iOS/Safari
              cacheableResponse: {
                statuses: [0, 200, 206]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Torre Angioina — Audioguide',
        short_name: 'Torre Angioina',
        description: 'Audioguide per la Torre Angioina di San Marco Argentano',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\//],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
