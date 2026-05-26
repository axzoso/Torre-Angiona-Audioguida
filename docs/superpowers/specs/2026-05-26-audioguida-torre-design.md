# Torre Angioina — Audioguide PWA: Design Spec

**Data:** 2026-05-26  
**Progetto:** WebApp audioguide per la Torre Angioina (XIII sec.) di San Marco Argentano  
**Contesto:** Le mura medievali schermano il segnale cellulare. L'app deve funzionare completamente offline dopo il primo caricamento e l'audio non deve interrompersi durante la navigazione tra le pagine.

---

## Stack tecnologico

| Layer | Scelta |
|---|---|
| Framework | Astro 4.x, modalità SSG (`output: 'static'`) |
| Styling | Tailwind CSS v3 |
| PWA / Offline | `@vite-pwa/astro` (Workbox, strategia `generateSW`) |
| Navigazione | Astro View Transitions (native) |
| Audio state | Vanilla TypeScript event bus (nessun UI framework) |
| TypeScript | Strict mode |

---

## Struttura directory

```
src/
  data/
    audioguides.json          ← dati delle 7 tappe
  layouts/
    Layout.astro              ← layout base: <ViewTransitions />, head, AudioPlayer
  components/
    AudioPlayer.astro         ← player persistente marcato con transition:persist
    TappaCard.astro           ← card per la home
    PWAStatus.astro           ← badge indicatore stato offline/download
  pages/
    index.astro               ← home dashboard
    tappa/[id].astro          ← pagina singola audioguida (rotta dinamica)
  lib/
    audioStore.ts             ← event bus per comunicare con il player
  styles/
    global.css                ← variabili CSS custom + Tailwind base
public/
  audio/
    tappa1.mp3 … tappa7.mp3  ← file placeholder leggeri
  icons/
    icon-192.png
    icon-512.png
```

---

## Struttura dati — audioguides.json

Ogni tappa ha i seguenti campi:

```typescript
interface Tappa {
  id: number;           // 1–7
  slug: string;         // "1"–"7" (usato nelle rotte)
  titolo: string;
  descrizione: string;  // testo completo da leggere nella pagina
  audioSrc: string;     // "/audio/tappaX.mp3"
  durata: string;       // "3:24" (formato mm:ss)
  posizione: string;    // "Piano Terra - Nord" (orientamento interno)
}
```

I 7 contenuti sono placeholder storicamente plausibili sulla Torre Angioina; verranno sostituiti con i testi e audio reali.

---

## Architettura pagine

### Home (`/`)

- Hero: titolo "Torre Angioina" + sottotitolo "San Marco Argentano, XIII secolo"
- Badge `PWAStatus` in alto a destra
- Griglia 2 colonne di 7 `TappaCard`
- Ogni card: numero tappa (accent), titolo, durata, checkmark "disponibile offline"
- Tap su una card → naviga a `/tappa/[id]`

### Pagina tappa (`/tappa/[id]`)

- Rotta dinamica generata da `getStaticPaths()` sui dati JSON
- Layout a colonna singola:
  - Numero + titolo large in cima
  - Badge posizione
  - Testo completo scrollabile (font serif per leggibilità)
  - Bottone "Ascolta" che triggera il player globale (non è un player separato)
  - Navigazione prev/next tra le tappe
- Nessun `<audio>` locale: la pagina comunica con il player globale via event bus

---

## Audio persistente — strategia dettagliata

### Perché `transition:persist`

Durante le View Transitions di Astro, il DOM viene sostituito ma gli elementi marcati con `transition:persist` vengono mantenuti e ricollegati al nuovo DOM. Questo preserva l'istanza `<audio>` e il relativo stato di riproduzione.

### Event bus (`audioStore.ts`)

```typescript
// Tipi degli eventi
type AudioEvent =
  | { type: 'play-tappa'; src: string; titolo: string; numero: number }
  | { type: 'toggle-play' }
  | { type: 'seek-relative'; seconds: number };

// Il bus è un EventTarget globale condiviso
export const audioStore = new EventTarget();

export function dispatchAudio(event: AudioEvent) {
  audioStore.dispatchEvent(new CustomEvent(event.type, { detail: event }));
}
```

### Flusso

1. Utente apre `/tappa/3` → la pagina chiama `dispatchAudio({ type: 'play-tappa', src: '/audio/tappa3.mp3', ... })`
2. `AudioPlayer` riceve l'evento, aggiorna il src solo se diverso da quello corrente (evita restart), poi avvia la riproduzione
3. Utente torna alla home → View Transition mantiene `AudioPlayer` in vita, la riproduzione continua
4. Utente apre `/tappa/5` → il player cambia traccia

### AudioPlayer UI

- Fixed bottom, z-index alto
- Glassmorphism: `bg-white/5 backdrop-blur-xl border-t border-white/8`
- Si nasconde con `opacity-0 pointer-events-none` finché non c'è una traccia attiva
- Layout orizzontale: `[N]  Titolo tappa  [−15] [▶/⏸] [+15]  [━━━━●━━━] 1:23/3:24`
- Progress bar interattiva con `input[type=range]` stilizzato in accent color
- Altezza 72px su mobile

---

## PWA — Configurazione `@vite-pwa/astro`

```typescript
// astro.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{html,css,js,ico,png,svg,mp3}'],
    maximumFileSizeToCacheInBytes: 15_000_000, // 15MB per file audio
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
})
```

### PWAStatus component

Tre stati possibili, mostrati come badge discreto in home:
- `offline-ready` → ✓ verde, "Disponibile offline"
- `updating` → spinner arancio, "Download in corso…"
- `online-only` → grigio, "Connessione richiesta"

---

## Token di design

| Token | Valore | Uso |
|---|---|---|
| `--bg` | `#0A0A0A` | Background pagine |
| `--surface` | `#111111` | Card, sezioni |
| `--accent` | `#8B2635` | Bottoni, numeri tappa, progress bar |
| `--accent-hover` | `#A02D40` | Stato hover accent |
| `--text-primary` | `#F5F0EB` | Testo principale (bianco caldo) |
| `--text-secondary` | `#9A8F87` | Sottotitoli, metadati |
| `--glass-bg` | `rgba(255,255,255,0.05)` | Player, overlay |
| `--glass-border` | `rgba(255,255,255,0.08)` | Bordi glass |

**Tipografia:**
- Titoli: `font-serif` (Georgia o system-serif) per richiamo storico
- Corpo: `font-sans` (system-ui) per leggibilità
- Numero tappa: `font-mono` bold in accent

---

## Decisioni architetturali chiave

| Decisione | Scelta | Motivazione |
|---|---|---|
| Audio persistence | `transition:persist` | Nativo Astro, zero dipendenze extra |
| PWA | `@vite-pwa/astro` | Setup dichiarativo, Workbox gestisce edge case |
| State management | Vanilla EventTarget | Nessun framework aggiuntivo, compatibile SSG |
| Routing | `getStaticPaths()` | Pre-genera tutte le 7 pagine a build time |
| Accent color | `#8B2635` borgogna | Coerente con araldica angioina e dark theme |

---

## Vincoli e note implementative

- I file audio MP3 placeholder devono essere presenti in `public/audio/` prima del build affinché Workbox li includa nel manifest di pre-cache
- `maximumFileSizeToCacheInBytes` deve essere esplicitamente aumentato a ≥15MB per gestire file audio reali
- Il player si mostra/nasconde via classe CSS, non con `display:none`, per evitare re-layout durante le transizioni
- La barra del player ha `padding-bottom` adattivo per il safe area di iPhone (env(safe-area-inset-bottom))
- Tutte le 7 pagine tappa vengono pre-generate staticamente: la scansione del QR code funziona offline perché la pagina è già in cache
