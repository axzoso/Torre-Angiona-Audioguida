import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{html,css,js,ico,png,svg,webmanifest,woff2}'],
        maximumFileSizeToCacheInBytes: 15_000_000,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /.*\.mp3.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              rangeRequests: true, // Abilita HTTP 206 Partial Content per iOS/Safari
              matchOptions: {
                ignoreSearch: true,
                ignoreVary: true,
              },
              cacheableResponse: {
                statuses: [0, 200, 206]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Torre Viva — Audioguida della Torre Angioina',
        short_name: 'Torre Viva',
        description: 'Audioguida Torre Viva per la Torre Angioina di San Marco Argentano',
        theme_color: '#efe9db',
        background_color: '#efe9db',
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
});
