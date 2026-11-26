# 🧭 Project Context — Torre Angioina Audioguida

> File di onboarding rapido per Claude Code (o qualsiasi sviluppatore) in chat future.
> Aggiornato: 2026-05-28. Vedi `README.md` per i dettagli utente.

## In una frase
PWA **completamente statica** (Astro `output: 'static'`) che funge da audioguida offline-first per la Torre Angioina di San Marco Argentano: 8 tappe con audio, player persistente e trascrizione sincronizzata. Nessun backend, nessun database, nessun input utente, nessuna autenticazione.

## Stack
- **Astro 7.x** + TypeScript (strict), output statico.
- CSS custom con token Fuori le Mura (`src/styles/global.css`); font Fraunces + JetBrains Mono via Fontsource. Tailwind rimosso (2026-11-26).
- **@vite-pwa/astro** (Workbox) — `registerType: 'autoUpdate'`.
- **Vitest** + jsdom per i test.
- Node ≥ 22.23.4 (richiesto da Astro 7); build su Node 24 (`.node-version`).
- **@vite-pwa/astro 2.x** (basato su `@unplugin-pwa`): import nominato `AstroPWAIntegration`, opzioni Workbox sotto `generateSW` (non più `workbox`), `maximumFileSizeToCacheInBytes` al primo livello, tipi client da `@unplugin-pwa/core/vanillajs`. Il manifest e le sue icone entrano nel precache in automatico: non aggiungerli a `globPatterns`.

## Struttura essenziale
```
src/
  pages/
    index.astro        # home, griglia 8 tappe (legge audioguides.json)
    tappa/[id].astro   # dettaglio tappa + scroll sincronizzato col player
    privacy.astro      # informativa privacy (static)
  layouts/Layout.astro # HEAD, GA4 inline, footer, monta <AudioPlayer/>, registra SW + pre-buffering audio
  components/
    AudioPlayer.astro  # player persistente (transition:persist), logica audio client-side
    TappaCard.astro    # card singola tappa
    PWAStatus.astro    # badge stato offline (NON montato nella UI attuale)
  lib/
    audioStore.ts      # event bus (EventTarget + CustomEvent) tra pagine e player
    audioStore.test.ts # test del bus
  data/audioguides.json # UNICA fonte dati: id, titolo, descrizione, audioSrc, durata, posizione
public/audio/*.mp3      # 8 file audio statici
astro.config.ts         # config Astro + PWA/Workbox
wrangler.jsonc          # Cloudflare Workers (static assets): dist/, slash finali, 404, previews
public/_headers         # intestazioni HTTP di cache e sicurezza (Workers)
```

## Architettura runtime (come comunicano i pezzi)
- `audioStore` (singleton `EventTarget` in `src/lib/audioStore.ts`) è il bus eventi:
  `play-tappa`, `toggle-play`, `seek-relative`, `state-changed`, `progress`.
- `tappa/[id].astro` dispatcha `play-tappa` al click su "Ascolta"; `AudioPlayer.astro` lo riceve e riproduce.
- **Trucco audio chiave**: il player fa `fetch(src)` → `blob` → `URL.createObjectURL` invece di assegnare direttamente l'URL all'`<audio>`. Serve ad aggirare le Range Request di Safari/Workbox e riprodurre l'mp3 intero dalla cache offline. C'è un fallback all'URL diretto se la fetch fallisce.
- **Durata fallback**: la `durata` del JSON viene usata quando il browser riporta `duration` Infinity/NaN (tipico di mp3 dalla cache).
- **Scroll sincronizzato**: l'evento `progress` muove lo scroll della trascrizione; qualsiasi gesto manuale (`wheel`/`touchmove`) cede il controllo all'utente (`autoScroll = false`).
- View Transitions via `<ClientRouter/>`: la logica si ri-inizializza su `astro:page-load` e `astro:after-swap` (il player persiste, il body viene swappato).

## Deployment
- **Cloudflare Workers static assets** (dal 2026-11-26; prima VPS Oracle + Coolify, dismessa). Worker `torreviva`, custom domain `torreviva.fuorilemura.org` nella zona `fuorilemura.org`.
- Config nel repo: `wrangler.jsonc` (`assets.directory: ./dist`, `html_handling: auto-trailing-slash`, `not_found_handling: 404-page`, `previews: {}`) + `public/_headers` (cache e sicurezza; le regole che matchano lo stesso URL si sommano → `Cache-Control` solo su percorsi specifici, mai su `/*`).
- **Workers Builds** collegato a GitHub: produzione = `main` (`npm run build` → `npx wrangler deploy`); altri branch → `npx wrangler preview` (richiede il blocco `previews`, anche vuoto) → URL `<id8>-torreviva.cla-antonucci.workers.dev`. Esito visibile come check sul commit.
- ⚠️ Vincoli operativi critici per l'offline:
  - `sw.js` e `workbox-*` mai in cache HTTP → `no-store` in `public/_headers`.
  - Il precache esclude `404.html`: su Workers `/404/` reindirizza e farebbe fallire l'install del SW.
  - Il pre-buffering degli mp3 in `Layout.astro` parte solo quando il SW controlla la pagina (`controllerchange`): i fetch precedenti non passano dalla `audio-cache` e quegli audio mancherebbero offline (bug visto su iPhone, risolto 2026-11-26).
  - Font mai inlined come `data:` (`vite.build.assetsInlineLimit` in `astro.config.ts`): la CSP ha `font-src 'self'`.
  - `trailingSlash: 'always'` è obbligatorio: gli URL devono coincidere con le chiavi della cache del SW.
  - Su Cloudflare: Rocket Loader e Zaraz/RUM disattivati, Always Use HTTPS attivo.
  - Range request sugli mp3: Workers risponde 200 (non 206); il player usa fetch → blob, quindi è ininfluente.

## Stato sicurezza (audit 2026-05-28)
**Nessuna vulnerabilità sfruttabile nel codice.** `npm audit` = 0 vulnerabilità. App statica → superficie d'attacco minima (no input utente, no backend, contenuti fidati dal repo). Astro auto-escapa tutto l'output; il JS client usa solo `textContent`/`dataset`, mai `innerHTML`/`set:html`.

Hardening applicato (2026-06-10):
1. ✅ **Header di sicurezza HTTP** (allora in `nginx.conf`, dal 2026-11-26 in `public/_headers`): `X-Frame-Options`, `Content-Security-Policy: frame-ancestors 'self'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` su tutto il sito. La CSP completa resta nel `<meta>` di `Layout.astro`.
2. ✅ **Cache HTML**: le pagine (`/`, `/tappa/1/`, …) usano il default di Workers `max-age=0, must-revalidate`, così il ciclo di update del SW è garantito.

Hardening residuo (difensivo, non urgente):
1. **[Bassa]** `'unsafe-inline'` in `script-src`: eliminabile autorizzando lo snippet gtag via hash `'sha256-…'` (sito statico, l'hash è stabile).
2. **[Bassa]** Nessuna SRI sullo script GA (inerente a gtag.js dinamico).
3. **[Cosmetica]** La privacy page intitola l'app "Torre Vive" invece di "Torre Angioina" (forse intenzionale: il dominio è torreviva).

## Privacy
GDPR-oriented: GA4 hardened in `Layout.astro` (`anonymize_ip`, `allow_google_signals:false`, `allow_ad_personalization_signals:false`, `restricted_data_processing:true`, `client_storage:'none'` → niente cookie persistenti). Nessun dato personale raccolto. Solo cookie tecnici Cloudflare.

## Comandi
```bash
npm run dev      # dev server localhost:4321
npm run build    # build statico → dist/
npm run preview  # anteprima build
npm run test     # vitest run
```

## Note / gotcha per modifiche future
- Aggiungere/modificare una tappa = editare SOLO `src/data/audioguides.json` + aggiungere `public/audio/tappaN.mp3`. Le route `/tappa/[id]/` sono generate da `getStaticPaths`.
- ⚠️ **Per sostituire un audio esistente va rinominato il file** (es. `tappa3-v2.mp3` + aggiornare `audioSrc`): la cache runtime è CacheFirst senza scadenza e con `ignoreSearch: true`, quindi né il riuso del nome né il cache-busting via query aggiornano chi ha già la cache.
- Il pre-buffering audio in `Layout.astro` deriva la lista da `audioguides.json` (non più hardcoded).
- `PWAStatus.astro` esiste ma non è montato in nessuna pagina.
- `maximumFileSizeToCacheInBytes: 15MB` in Workbox per includere gli mp3 nel precache — alzare se gli audio crescono.
- I file audio sono in `globPatterns`? No: gli mp3 sono gestiti via `runtimeCaching` (CacheFirst, `cacheName: 'audio-cache'`), non nel precache globale.
