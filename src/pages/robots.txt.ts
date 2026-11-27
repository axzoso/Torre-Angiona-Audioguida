// robots.txt di produzione. Nelle anteprime (branch `test`) viene
// sovrascritto da quello che chiude tutto (vedi astro.config.ts).
import type { APIRoute } from 'astro';
import { abs } from '../lib/seo';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
