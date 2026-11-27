// Sitemap per Google Search Console: home e le otto tappe.
// (privacy e 404 restano fuori: non servono a chi cerca la Torre)
import type { APIRoute } from 'astro';
import audioguides from '../data/audioguides.json';
import { abs } from '../lib/seo';

export const GET: APIRoute = () => {
  const urls = ['/', ...audioguides.map((s) => `/tappa/${s.id}/`)];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${abs(u)}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
