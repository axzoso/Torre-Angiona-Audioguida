# 🏰 Torre Angioina — Audioguida Digitale

**Un'esperienza immersiva di scoperta storica della Torre Angioina di San Marco Argentano.**

Applicazione web interattiva che trasforma la visita al sito storico in un percorso guidato di 8 tappe, con audio sincronizzati e design ottimizzato per mobile.

---

## 📚 Documentazione

| Documento | A chi è rivolto | Contenuto |
|-----------|-----------------|-----------|
| [README.md](README.md) | Sviluppatori | Questo file: panoramica tecnica, setup, deploy. |
| [docs/analytics_ga4.md](docs/analytics_ga4.md) | Sviluppatori / Admin GA4 | Tracciamento Google Analytics 4: eventi custom, impostazione dimensioni e report. |
| [PRESENTAZIONE.md](PRESENTAZIONE.md) | Pubblico non tecnico | Cos'è l'app in parole semplici, caratteristiche, vantaggi e limiti. |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Sviluppatori / AI | Onboarding rapido: architettura, runtime, deploy, stato sicurezza, gotcha. |

---

## 📱 About

**Torre Angioina** è un'audioguida digitale per la Torre Angioina di San Marco Argentano (XIII secolo), realizzata come Progressive Web App (PWA). L'applicazione permette ai visitatori di:

- 🎧 Ascoltare descrizioni audio dettagliate tramite QR code
- 🗺️ Seguire un percorso strutturato in 8 tappe
- 🎚️ Controllare la riproduzione: play/pausa, skip ±15s, barra di avanzamento
- 📜 Leggere la trascrizione che scorre in sincrono con l'audio
- 🔌 Funzionare completamente offline dopo il primo accesso
- 📱 Accedere da qualsiasi dispositivo mobile

### Caratteristiche Principali

✅ **PWA-Ready**: Installabile su home screen, offline-first  
✅ **Responsive Design**: Ottimizzato per tutti gli schermi mobile  
✅ **Audio Player Custom**: ±15 secondi, velocità, tappa successiva, comandi da schermata di blocco  
✅ **Stato di ascolto**: tappe ascoltate e punto di ripresa salvati solo sul dispositivo  
✅ **Trascrizione sincronizzata**: Il testo scorre con l'audio e cede il controllo allo scroll manuale  
✅ **Privacy-First**: Nessuna raccolta dati identificativi, Google Analytics anonimo  
✅ **Accessibilità**: Attributi ARIA, semantica HTML corretta  
✅ **Identità Fuori le Mura**: carta e inchiostro, Fraunces + JetBrains Mono (vedi `DESIGN.md`)  

---

## 🛠️ Tech Stack

| Layer | Tecnologie |
|-------|-----------|
| **Framework** | [Astro](https://astro.build) 7.4 |
| **Styling** | CSS custom con token (`src/styles/global.css`), font self-hosted via Fontsource |
| **PWA** | [@vite-pwa/astro](https://unplugin-pwa.netlify.app/frameworks/astro) 2.x (Workbox 8) |
| **Runtime** | Node.js ≥22.23.4 (build su Node 24, vedi `.node-version`) |
| **Testing** | Vitest 4.1 |
| **TypeScript** | Strict mode |

**Composizione linguistica del progetto:**
- Astro: 82.4%
- TypeScript: 15.4%
- CSS: 2.2%

---

## 📦 Project Structure

```
audioguida-torre/
├── src/
│   ├── pages/
│   │   ├── index.astro           # Home con griglia 8 tappe
│   │   ├── tappa/[id].astro      # Pagina dettaglio singola tappa
│   │   └── privacy.astro         # Informativa privacy
│   ├── layouts/
│   │   └── Layout.astro          # Layout principale (header GA4, footer, player)
│   ├── components/
│   │   ├── AudioPlayer.astro     # Player audio persistente
│   │   ├── TappaCard.astro       # Card singola tappa
│   │   └── PWAStatus.astro       # Indicatore stato PWA (non montato nella UI)
│   ├── lib/
│   │   └── audioStore.ts         # Event bus per comunicazione audio
│   ├── data/
│   │   └── audioguides.json      # Dati tappe (titolo, audio, descrizione)
│   └── styles/
│       └── global.css            # CSS globale + variabili tema
├── public/
│   ├── manifest.webmanifest      # Configurazione PWA
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── audio/
│       └── *.mp3                 # File audio tappe
├── astro.config.ts              # Config Astro + PWA
├── tsconfig.json               # Config TypeScript
├── vitest.config.ts            # Config testing
└── package.json
```

---

## 🚀 Quick Start

### Prerequisiti
- Node.js ≥ 22.23.4 (consigliato 24, vedi `.node-version`)
- npm 10+

### Installazione

```bash
# Clone il repository
git clone https://github.com/axzoso/audioguida_torre.git
cd audioguida_torre

# Installa dipendenze
npm install
```

### Comandi Sviluppo

```bash
# Avvia dev server (localhost:4321)
npm run dev

# Build per produzione
npm run build

# Anteprima build locale
npm run preview

# Esegui test
npm run test

# CLI Astro
npm run astro -- --help
```

---

## 📖 Architettura & Flusso

### Audio Store (Event Bus)
Comunicazione centralizzata tra componenti tramite `CustomEvent`:

```typescript
// src/lib/audioStore.ts
audioStore.playTappa({ src: audioUrl, titolo, numero, durata });
```

**Eventi disponibili:**
- `play-tappa`: Richiedi riproduzione audio (detail: `src`, `titolo`, `numero`, `durata`)
- `toggle-play`: Play/Pause
- `seek-relative`: Avanti/Indietro 15 secondi
- `state-changed`: Notifica play/pausa effettiva del player
- `progress`: Avanzamento riproduzione (usato per lo scroll sincronizzato del testo)

### Layout & Persistenza

- **`<AudioPlayer />`**: Persistente con `transition:persist`
- **`<ClientRouter />`**: Transizioni smooth tra pagine
- **`<slot />`**: Contenuto pagina dinamico

### Routing

URL con trailing slash obbligatorio (`trailingSlash: 'always'`), così le richieste
coincidono con le chiavi della cache del service worker e la navigazione funziona offline.

- `/` → Home (grid 8 tappe)
- `/tappa/1/` → Dettaglio Tappa 1
- `/privacy/` → Informativa privacy

---

## 🎨 Tema & Styling

### Colori Tema (sistema Fuori le Mura)
```css
--paper: #efe9db      /* sfondo carta, con grana SVG */
--ink: #1b1a17        /* testo */
--ink-soft: #5f594d   /* testo secondario */
--rule: rgba(27,26,23,0.22)  /* filetti */
--stamp: #b3321d      /* unico accento, rosso timbro */
/* tema scuro solo per footer e player: --f-bg #1d1b18, --f-red #ee7a5e */
```

### Design System
- **Serif**: Fraunces Variable (titoli e testo, optical sizing)
- **Mono**: JetBrains Mono 400 (numeri, durate, controlli, metadati)
- Angoli vivi, nessuna ombra, nessuna card: elenchi filettati e SVG a tratto sottile
- Riferimenti completi: `brand-guidelines.md` e `DESIGN.md`

---

## 🔐 Privacy & Compliance

✅ **GDPR Compliant**
- ❌ No personal data collection
- ✅ Google Analytics 4 anonimo (IP anonimizzato)
- ✅ No tracking cookies
- ✅ Technical cookies only (Cloudflare)

Vedi [Privacy Policy](src/pages/privacy.astro) per dettagli completi.

---

## 📱 PWA Features

### Configurazione Workbox

```javascript
// astro.config.ts
trailingSlash: 'always',
// @vite-pwa/astro 2.x: AstroPWAIntegration({ ... })
maximumFileSizeToCacheInBytes: 15_000_000,
generateSW: {
  // manifest e icone del manifest sono inclusi in automatico dalla v2
  globPatterns: ['**/*.{html,css,js,ico,svg,woff2}'],
  navigateFallback: null,
  // Gli mp3 NON sono nel precache: sono gestiti a runtime con strategia
  // CacheFirst (cacheName: 'audio-cache', ignoreSearch: true).
  runtimeCaching: [ /* *.mp3 → CacheFirst */ ],
}
```

**Functionalità:**
- ✅ Offline-first
- ✅ Auto-update service worker
- ✅ Installable su home screen
- ✅ Standalone mode

### Manifest
```json
{
  "name": "Torre Viva — Audioguida della Torre Angioina",
  "short_name": "Torre Viva",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#efe9db"
}
```

---

## 🧪 Testing

```bash
# Esegui suite test
npm run test

# Watch mode
npm run test -- --watch
```

Test con **Vitest** + **jsdom** per testing di componenti Astro.

---

## 📊 Dati Tappe

Struttura `src/data/audioguides.json`:

```json
[
  {
    "id": 1,
    "titolo": "L'Ingresso",
    "descrizione": "...",
    "audioSrc": "/audio/tappa1.mp3",
    "durata": "1:38",
    "posizione": "Scale in pietra - Ingresso principale"
  }
]
```

> La `durata` è usata anche come fallback dal player quando il browser non riesce
> a determinare la durata reale dell'mp3 (tipico dei file serviti dalla cache).

> ⚠️ **Per sostituire un audio bisogna rinominare il file** (es. `tappa3-v2.mp3`,
> aggiornando `audioSrc` nel JSON). Gli mp3 sono cachati lato client con
> CacheFirst senza scadenza: chi ha già la cache non scaricherebbe mai la nuova
> versione con lo stesso nome. Il cache-busting via query string NON funziona
> (`ignoreSearch: true`).

---

## 🌐 Deployment

Produzione: **https://torreviva.fuorilemura.org**, servito da **Cloudflare
Workers (static assets)**: solo file statici, nessun codice Worker. Il dominio
è un *custom domain* del Worker `torreviva` nella zona Cloudflare
`fuorilemura.org`.

Configurazione nel repo:

- `wrangler.jsonc` — nome del Worker, cartella `dist/`, gestione degli slash
  finali (`auto-trailing-slash`: `/tappa/1` → `/tappa/1/`), pagina 404 e
  blocco `previews` (richiesto da `wrangler preview` per le anteprime).
- `public/_headers` — intestazioni di cache e sicurezza: `sw.js` e `workbox-*`
  mai in cache, manifest sempre rivalidato, asset in `_astro/` immutabili
  (1 anno), audio 1 giorno, icone 7 giorni; su tutto il sito
  `frame-ancestors 'self'` + X-Frame-Options, nosniff, Referrer-Policy e
  Permissions-Policy. La CSP completa resta nel `<meta>` di `Layout.astro`.
- `.node-version` — Node 24 per la build.

**Workers Builds (collegato a GitHub):**
- Branch di produzione: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Branch non di produzione: `npx wrangler preview` → ogni branch ottiene un
  URL di anteprima `<id-versione>-torreviva.cla-antonucci.workers.dev`

**Flusso di deploy:**
1. Push su `main`
2. Workers Builds installa le dipendenze, builda il sito e pubblica `dist/`
   (un paio di minuti; l'esito compare come check sul commit in GitHub)
3. Il service worker aggiorna la cache offline dei visitatori alla successiva
   apertura online (`registerType: 'autoUpdate'`)

Prova in locale con il runtime di Cloudflare:

```bash
npm run build && npx wrangler dev   # http://localhost:8787
```

### Cloudflare — vincoli per la PWA offline

- `sw.js` non deve mai essere servito vecchio: lo garantisce `public/_headers`
  (`no-store`). La vecchia Cache Rule *Bypass* su `/sw.js` della zona non è più
  necessaria con Workers, ma può restare.
- **Rocket Loader** (Speed → Optimization) disattivato.
- **Zaraz** e Web Analytics/RUM disattivati per questo host: iniettano script
  bloccati dalla CSP (vedi `DISATTIVARE-ZARAZ-TORREVIVA.md`).
- **Always Use HTTPS** da tenere attivo (SSL/TLS → Edge Certificates): su `http://` il
  service worker non si registra e l'offline non funziona.
- Gli audio su Workers rispondono `200` anche alle Range request (non `206`): il
  player scarica l'mp3 intero come blob, quindi la riproduzione non ne risente.

---

## 🎯 Roadmap

- [x] Trascrizione testi sincronizzata con l'audio (scroll proporzionale)
- [ ] Lingue multiple (EN, FR) — dipende dalla produzione dell'audio tradotto
- [ ] Feedback visitatori (form esterno)
- [ ] Analytics dashboard — al momento si usa GA4

---

## 🤝 Contributing

Contributi benvenuti! Per questioni/feature:

1. Apri una Issue con dettagli
2. Crea un branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

---

## 📄 License

Questo progetto è privato. Per informazioni contatta il maintainer.

---

## 📧 Contatti

- **GitHub**: [@axzoso](https://github.com/axzoso)
- **Associazione**: Fuori le Mura

---

## 🙏 Credits

Realizzato con ❤️ per la Torre Angioina di San Marco Argentano.

- Framework: [Astro](https://astro.build)
- Font: [Fraunces](https://fonts.google.com/specimen/Fraunces) e [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via [Fontsource](https://fontsource.org)
- PWA: [Vite PWA](https://vite-pwa-org.netlify.app/)

---

**Ultima modifica:** Maggio 2026  
**Versione:** 0.0.1
