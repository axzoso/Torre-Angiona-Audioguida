import { defineConfig } from 'astro/config';
import { AstroPWAIntegration } from '@vite-pwa/astro';
import { appendFile, writeFile } from 'node:fs/promises';

// Build di anteprima (branch `test`): la variabile PUBLIC_ANTEPRIMA=1 è
// impostata solo nelle impostazioni delle anteprime di Workers Builds.
// In produzione non c'è e il sito resta indicizzabile.
const ANTEPRIMA = process.env.PUBLIC_ANTEPRIMA === '1';

/** Anteprima fuori dai motori di ricerca: intestazione X-Robots-Tag su tutto
 *  il sito e robots.txt che chiude tutto (oltre al meta robots in Layout). */
const anteprimaNoindex = {
  name: 'anteprima-noindex',
  hooks: {
    'astro:build:done': async ({ dir }: { dir: URL }) => {
      if (!ANTEPRIMA) return;
      await appendFile(new URL('_headers', dir), '\n# Solo anteprima: fuori dai motori di ricerca\n/*\n  X-Robots-Tag: noindex, nofollow\n');
      await writeFile(new URL('robots.txt', dir), 'User-agent: *\nDisallow: /\n');
    },
  },
};

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  vite: {
    build: {
      // I font non vanno mai inlined come data: (la CSP ha font-src 'self'):
      // restano file .woff2 in /_astro/, precaricati dal service worker.
      assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
    },
  },
  integrations: [
    anteprimaNoindex,
    AstroPWAIntegration({
      registerType: 'autoUpdate',
      // v2: il limite di dimensione è un'opzione di primo livello
      maximumFileSizeToCacheInBytes: 15_000_000,
      // v2: le opzioni Workbox di generateSW stanno sotto `generateSW` (era `workbox`)
      generateSW: {
        // le icone del manifest (png) sono già incluse in automatico dalla v2
        globPatterns: ['**/*.{html,css,js,ico,svg,woff2}'],
        // la 404 non serve offline e su Cloudflare /404/ reindirizza: fuori dal precache
        globIgnores: ['404.html'],
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
