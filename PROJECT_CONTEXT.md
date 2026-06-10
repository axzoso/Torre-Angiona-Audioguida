# 🧭 Project Context — Torre Angioina Audioguida

> File di onboarding rapido per Claude Code (o qualsiasi sviluppatore) in chat future.
> Aggiornato: 2026-05-28. Vedi `README.md` per i dettagli utente.

## In una frase
PWA **completamente statica** (Astro `output: 'static'`) che funge da audioguida offline-first per la Torre Angioina di San Marco Argentano: 8 tappe con audio, player persistente e trascrizione sincronizzata. Nessun backend, nessun database, nessun input utente, nessuna autenticazione.

## Stack
- **Astro 6.x** + TypeScript (strict), output statico.
- **Tailwind CSS 4** via `@tailwindcss/vite`.
- **@vite-pwa/astro** (Workbox) — `registerType: 'autoUpdate'`.
- **Vitest** + jsdom per i test.
- Node ≥ 22.12.0.

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
nginx.conf              # config del container nginx:alpine in produzione
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
- VPS Oracle Always Free (ARM) → **Coolify** → build con **Nixpacks** (`npm run build`) → `dist/` servito da **nginx:alpine** (usa `nginx.conf` del repo).
- **Cloudflare** in front (proxy/DNS).
- ⚠️ Vincoli operativi critici per l'offline:
  - `sw.js` NON deve essere cachato dalla CDN → Cloudflare Cache Rule: `URI Path == /sw.js` → **Bypass**.
  - **Rocket Loader disattivato** su Cloudflare.
  - `trailingSlash: 'always'` è obbligatorio: gli URL devono coincidere con le chiavi della cache del SW.

## Stato sicurezza (audit 2026-05-28)
**Nessuna vulnerabilità sfruttabile nel codice.** `npm audit` = 0 vulnerabilità. App statica → superficie d'attacco minima (no input utente, no backend, contenuti fidati dal repo). Astro auto-escapa tutto l'output; il JS client usa solo `textContent`/`dataset`, mai `innerHTML`/`set:html`.

Hardening applicato (2026-06-10):
1. ✅ **Header di sicurezza HTTP in `nginx.conf`**: `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` su tutte le location (ripetuti per blocco: `add_header` non è ereditato dove la location ne definisce altri). La CSP resta nel `<meta>` di `Layout.astro`.
2. ✅ **Fix cache HTML**: la vecchia location `~* \.html$` non matchava mai gli URL reali (`/tappa/1/` ecc. sono directory) → `Cache-Control: no-cache, must-revalidate` ora è su `location /`, così il ciclo di update del SW è garantito anche se cambiano le cache rule Cloudflare.

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
