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
✅ **Audio Player Custom**: Controlli intuitivi con skip ±15 secondi  
✅ **Trascrizione sincronizzata**: Il testo scorre con l'audio e cede il controllo allo scroll manuale  
✅ **Privacy-First**: Nessuna raccolta dati identificativi, Google Analytics anonimo  
✅ **Accessibilità**: Attributi ARIA, semantica HTML corretta  
✅ **Styling Moderno**: Tailwind CSS, glassmorphism, tema scuro  

---

## 🛠️ Tech Stack

| Layer | Tecnologie |
|-------|-----------|
| **Framework** | [Astro](https://astro.build) 6.3.8 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) 4.3.0 + CSS custom |
| **PWA** | [@vite-pwa/astro](https://vite-pwa-org.netlify.app/frameworks/astro.html) 1.2.0 |
| **Runtime** | Node.js ≥22.12.0 |
| **Testing** | Vitest 4.1.7 |
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
├── astro.config.ts              # Config Astro + PWA (Tailwind via @tailwindcss/vite)
├── tsconfig.json               # Config TypeScript
├── vitest.config.ts            # Config testing
└── package.json
```

---

## 🚀 Quick Start

### Prerequisiti
- Node.js ≥ 22.12.0
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

### Colori Tema
```css
--accent: #8B2635              /* Rosso wine */
--accent-hover: #A02D40
--text-primary: #F5F0EB        /* Beige chiaro */
--text-secondary: #9A8F87      /* Grigio-beige */
--glass-bg: rgba(255, 255, 255, 0.05)
--glass-border: rgba(255, 255, 255, 0.08)
```

### Design System
- **Font Serif**: Georgia (headings)
- **Font Mono**: Monospace (numeri, metadati)
- **Spacing**: Sistema Tailwind (4px base)
- **Glassmorphism**: Backdrop blur + border trasparente

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
workbox: {
  globPatterns: ['**/*.{html,css,js,ico,png,svg,mp3}'],
  maximumFileSizeToCacheInBytes: 15_000_000, // include gli mp3 (fino a ~5 MB ciascuno)
  navigateFallback: null,
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
  "name": "Torre Angioina — Audioguide",
  "short_name": "Torre Angioina",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#0A0A0A"
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

---

## 🌐 Deployment

### Coolify su VPS (Oracle Cloud Always Free, ARM)

L'app è ospitata su una VPS Oracle Always Free (Ampere A1, architettura ARM) e
gestita da [Coolify](https://coolify.io). La build avviene con **Nixpacks**, e i
file statici vengono serviti da un container **nginx:alpine**.

```bash
# Build statico (eseguita da Nixpacks in fase di deploy)
npm run build

# Output: dist/  → servito da nginx:alpine
```

**Flusso di deploy:**
1. Push su `main`
2. Il webhook di Coolify avvia il deploy
3. Nixpacks installa le dipendenze e builda il sito (`npm run build`)
4. Il container nginx:alpine serve `dist/` usando `nginx.conf` nel root del repo
5. Il service worker aggiorna la cache offline-first lato client

**Tempi:** con il webhook attivo, dal push ai nuovi file online passano circa
2–4 minuti (build su ARM). Per gli utenti che hanno già aperto la PWA,
l'aggiornamento effettivo arriva alla successiva apertura online, grazie
all'auto-update del service worker (`registerType: 'autoUpdate'`).

### Cloudflare — configurazione per PWA offline

Cloudflare è in front come proxy/DNS. Per garantire il funzionamento offline
della PWA è **obbligatorio** che `sw.js` non venga cachato dalla CDN:

**Rules → Cache Rules → Crea regola:**
- Campo: `URI Path` equals `/sw.js`
- Azione: Cache Status → **Bypass**

Senza questa regola Cloudflare serve il vecchio `sw.js` dalla CDN e il Service
Worker non si aggiorna mai → la cache precachata è sbagliata → offline non funziona.

Verificare anche che **Rocket Loader** (Speed → Optimization) sia disattivato.

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
- Styling: [Tailwind CSS](https://tailwindcss.com)
- PWA: [Vite PWA](https://vite-pwa-org.netlify.app/)

---

**Ultima modifica:** Maggio 2026  
**Versione:** 0.0.1
