# 🏰 Torre Angioina — Audioguida Digitale

**Un'esperienza immersiva di scoperta storica della Torre Angioina di San Marco Argentano.**

Applicazione web interattiva che trasforma la visita al sito storico in un percorso guidato di 8 tappe, con audio sincronizzati e design ottimizzato per mobile.

---

## 📱 About

**Torre Angioina** è un'audioguida digitale per la Torre Angioina di San Marco Argentano (XIII secolo), realizzata come Progressive Web App (PWA). L'applicazione permette ai visitatori di:

- 🎧 Ascoltare descrizioni audio dettagliate tramite QR code
- 🗺️ Seguire un percorso strutturato in 8 tappe
- 📊 Controllare riproduzione, velocità e posizione audio
- 🔌 Funzionare completamente offline dopo il primo accesso
- 📱 Accedere da qualsiasi dispositivo mobile

### Caratteristiche Principali

✅ **PWA-Ready**: Installabile su home screen, offline-first  
✅ **Responsive Design**: Ottimizzato per tutti gli schermi mobile  
✅ **Audio Player Custom**: Controlli intuitivi con skip ±15 secondi  
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
│   │   ├── privacy.astro         # Informativa privacy
│   │   └── [404].astro           # Pagina 404
│   ├── layouts/
│   │   └── Layout.astro          # Layout principale
│   ├── components/
│   │   ├── AudioPlayer.astro     # Player audio persistente
│   │   ├── TappaCard.astro       # Card singola tappa
│   │   └── PWAStatus.astro       # Indicatore stato PWA
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
├── tailwind.config.ts           # Config Tailwind (CSS-first)
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
audioStore.dispatchEvent(new CustomEvent('play-tappa', {
  detail: { src: audioUrl, titolo, numero }
}));
```

**Eventi disponibili:**
- `play-tappa`: Richiedi riproduzione audio
- `toggle-play`: Play/Pause
- `seek-relative`: Avanti/Indietro 15 secondi

### Layout & Persistenza

- **`<AudioPlayer />`**: Persistente con `transition:persist`
- **`<ClientRouter />`**: Transizioni smooth tra pagine
- **`<slot />`**: Contenuto pagina dinamico

### Routing

- `/` → Home (grid 8 tappe)
- `/tappa/1` → Dettaglio Tappa 1
- `/privacy` → Informativa privacy
- `/404` → Pagina non trovata

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
workbox: {
  globPatterns: ['**/*.{html,css,js,ico,png,svg,mp3}'],
  maximumFileSizeToCacheInBytes: 15_000_000,
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
    "titolo": "La Fondazione della Torre",
    "numero": "01",
    "posizione": "Piazza Castello",
    "durata": "5:23",
    "descrizione": "...",
    "audioSrc": "/audio/tappa-01.mp3"
  }
]
```

---

## 🌐 Deployment

### GitHub Pages + Cloudflare

```bash
# Build statico
npm run build

# Output: dist/
```

**Deploy:**
1. Push su `main` branch
2. GitHub Actions builda automaticamente
3. Cloudflare CDN distribuisce contenuti
4. Service worker cache offline-first

---

## 🎯 Roadmap

- [ ] Geolocalizzazione QR auto-trigger
- [ ] Lingue multiple (EN, FR)
- [ ] Transcrizioni testi audio
- [ ] Dark/Light mode toggle
- [ ] Analytics dashboard
- [ ] Feedback visitatori

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
