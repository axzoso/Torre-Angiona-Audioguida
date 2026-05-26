# Torre Angioina Audioguide PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first offline-capable PWA with 7 audioguide pages for the Torre Angioina, featuring a persistent audio player that survives page navigations via Astro View Transitions.

**Architecture:** Astro 4.x SSG generates all 7 tappa pages statically. A single `AudioPlayer.astro` component lives in the base Layout marked `transition:persist` — Astro reuses its DOM node (including the `<audio>` element) across all navigations. Pages communicate with the player via a vanilla TypeScript `EventTarget` event bus (`audioStore.ts`). `@vite-pwa/astro` pre-caches all assets including MP3 files at first visit via Workbox.

**Tech Stack:** Astro 4, Tailwind CSS 3, @vite-pwa/astro, Vitest + jsdom (unit tests), TypeScript strict

---

## File Map

| File | Role |
|---|---|
| `astro.config.ts` | Astro config: output static, Tailwind + PWA integrations |
| `tailwind.config.cjs` | Tailwind v3 content paths + custom color tokens |
| `vitest.config.ts` | Vitest setup with jsdom environment |
| `src/styles/global.css` | Tailwind base + CSS custom properties (design tokens) |
| `src/data/audioguides.json` | Array of 7 tappa objects (id, titolo, descrizione, audioSrc, durata, posizione) |
| `src/lib/audioStore.ts` | EventTarget singleton: playTappa, togglePlay, seekRelative, reportState |
| `src/lib/audioStore.test.ts` | Vitest unit tests for audioStore |
| `src/layouts/Layout.astro` | Base HTML shell: ViewTransitions, head meta, AudioPlayer slot |
| `src/components/AudioPlayer.astro` | Fixed-bottom player with `transition:persist` — the only `<audio>` element |
| `src/components/PWAStatus.astro` | Badge: offline-ready / updating / online-only |
| `src/components/TappaCard.astro` | Card for home grid (numero, titolo, durata, offline check) |
| `src/pages/index.astro` | Home: hero + PWAStatus + 7-card grid |
| `src/pages/tappa/[id].astro` | Detail page: testo completo + Ascolta button + prev/next nav |
| `public/audio/tappa{1-7}.mp3` | Placeholder files (0-byte); replace with real audio before production |
| `public/icons/icon-192.png` | Placeholder PWA icon 192×192 |
| `public/icons/icon-512.png` | Placeholder PWA icon 512×512 |

---

## Task 1: Initialize Astro project and install all dependencies

**Files:**
- Create: `package.json`, `astro.config.ts`, `tsconfig.json`, `src/env.d.ts` (via CLI)

- [ ] **Step 1: Initialize Astro in the current directory**

```bash
cd /Users/claudio/github/audioguida_torre
npm create astro@latest . -- --template minimal --typescript strict --no-git --install --yes
```

Expected output: Astro project initialized, `node_modules` installed. The `docs/` directory is left untouched.

- [ ] **Step 2: Add Tailwind CSS integration**

```bash
npx astro add tailwind --yes
```

Expected output: `@astrojs/tailwind` installed, `tailwind.config.cjs` created, `astro.config.ts` updated to include `tailwind()`.

- [ ] **Step 3: Install @vite-pwa/astro and Vitest**

```bash
npm install -D @vite-pwa/astro vitest jsdom
```

Expected output: packages added to devDependencies, no errors.

- [ ] **Step 4: Add test script to package.json**

Open `package.json`. Add `"test": "vitest run"` inside the `"scripts"` object. Example after edit:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git init
git add -A
git commit -m "chore: initialize Astro project with Tailwind and PWA deps"
```

---

## Task 2: Configure astro.config.ts

**Files:**
- Modify: `astro.config.ts`

- [ ] **Step 1: Replace astro.config.ts with complete configuration**

Overwrite `astro.config.ts` with this content:

```typescript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'static',
  integrations: [
    tailwind(),
    AstroPWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{html,css,js,ico,png,svg,mp3,webmanifest}'],
        maximumFileSizeToCacheInBytes: 15_000_000,
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
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
```

- [ ] **Step 2: Create vitest.config.ts**

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add astro.config.ts vitest.config.ts
git commit -m "feat: configure Astro with PWA and Vitest"
```

---

## Task 3: Tailwind config and global CSS design tokens

**Files:**
- Modify: `tailwind.config.cjs`
- Create: `src/styles/global.css`

- [ ] **Step 1: Update tailwind.config.cjs with custom color palette**

Replace the contents of `tailwind.config.cjs`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#8B2635',
        'accent-hover': '#A02D40',
        surface: '#111111',
      },
      textColor: {
        primary: '#F5F0EB',
        secondary: '#9A8F87',
      },
      backgroundColor: {
        base: '#0A0A0A',
        surface: '#111111',
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Create src/styles/global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent: #8B2635;
  --accent-hover: #A02D40;
  --text-primary: #F5F0EB;
  --text-secondary: #9A8F87;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.08);
}

html,
body {
  background-color: #0A0A0A;
  color: #F5F0EB;
  min-height: 100vh;
}

/* Progress bar and range inputs use accent color */
input[type='range'] {
  accent-color: var(--accent);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Safe area padding for iOS notch/home bar */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.cjs src/styles/global.css
git commit -m "feat: add design tokens and global CSS"
```

---

## Task 4: Create audioguides.json data layer

**Files:**
- Create: `src/data/audioguides.json`

- [ ] **Step 1: Create the data directory and JSON file**

Create `src/data/audioguides.json`:

```json
[
  {
    "id": 1,
    "slug": "1",
    "titolo": "Ingresso e Portale Medievale",
    "descrizione": "Varcate la soglia della Torre Angioina, edificata per volere di Carlo I d'Angiò nel XIII secolo. Il portale che si apre davanti a voi è uno dei rari esempi di architettura militare normanna sopravvissuti in Calabria. Osservate i conci di pietra calcarea locale, tagliati a regola d'arte dai maestri picapietra al servizio degli Angioini. La forma a tutto sesto dell'arco riflette l'influenza dell'architettura francese portata dagli invasori, che si fuse con le tradizioni costruttive locali ereditate dall'epoca normanna. La soglia che calpestate ha visto passare feudatari, soldati, mercanti e pellegrini nel corso di sette secoli di storia. San Marco Argentano fu per lungo tempo un baluardo strategico a controllo delle vie di comunicazione tra la costa tirrenica e l'entroterra silano.",
    "audioSrc": "/audio/tappa1.mp3",
    "durata": "3:24",
    "posizione": "Piano Terra — Ingresso Nord"
  },
  {
    "id": 2,
    "slug": "2",
    "titolo": "La Sala delle Guardie",
    "descrizione": "Questa grande sala al piano terra ospitava il corpo di guardia permanente della torre. Le nicchie scavate nello spessore delle mura — osservate quanto sono profonde, quasi due metri — erano destinate a riporre armi, torce e le provviste dei soldati di stanza. Le mura raggiungono qui lo spessore massimo di tre metri e ottanta: una barriera quasi invalicabile per le tecnologie belliche del tempo. Il pavimento originale, in lastre di pietra battuta, è ancora in parte visibile sotto il consolidamento moderno. Immaginatelo percorso giorno e notte dai soldati angioini, che dovevano rispondere a turni di guardia rigidissimi. La fessura verticale nella parete orientale non è una semplice finestra: è una feritoia progettata per permettere il tiro con l'arco o la balestra mantenendo il massimo della protezione per l'arciere.",
    "audioSrc": "/audio/tappa2.mp3",
    "durata": "2:58",
    "posizione": "Piano Terra — Sala Est"
  },
  {
    "id": 3,
    "slug": "3",
    "titolo": "Il Pozzo Interno e le Cisterne",
    "descrizione": "Uno degli elementi più ingegnosi dell'intera fortezza è questo pozzo, scavato al centro del cortile interno per garantire l'autonomia idrica in caso di assedio prolungato. I costruttori medievali avevano una comprensione sofisticata dell'idrogeologia locale: il pozzo fu posizionato esattamente sopra una falda freatica che ancora oggi mantiene un livello costante. Accanto al pozzo si aprono le bocche delle cisterne sotterranee, capaci di raccogliere l'acqua piovana convogliata dai tetti e dalle terrazze attraverso un sistema di canalette incastonate nei muri perimetrali. Si stima che le cisterne potessero garantire autonomia idrica per un presidio di cinquanta uomini per almeno sei mesi. Una torre che resistesse agli assedi non si poteva concepire senza questa riserva silenziosa.",
    "audioSrc": "/audio/tappa3.mp3",
    "durata": "3:10",
    "posizione": "Cortile Interno — Centro"
  },
  {
    "id": 4,
    "slug": "4",
    "titolo": "La Scala a Chiocciola e il Primo Piano",
    "descrizione": "La scala a chiocciola che sale verso il piano superiore è un capolavoro di geometria applicata. Girate in senso orario salendo: non è una casualità. Questa scelta progettuale, comune a quasi tutte le torri medievali europee, favorisce il difensore che scende respingendo un attaccante che sale. Un soldato destrorso che scende può usare la spada liberamente verso il centro della scala; il soldato che attacca salendo ha il braccio destro ostacolato dal pilastro centrale. Ogni gradino è leggermente irregolare, differenza intenzionale che rallenta il passo di chi non conosce la scala. Al primo piano si apriva il quartiere del castellano, il responsabile militare della torre. Qui la qualità costruttiva è superiore: le pareti riportano tracce di intonaco bianco e, in un angolo, i resti di una decorazione geometrica che doveva rendere l'ambiente più degno del suo occupante.",
    "audioSrc": "/audio/tappa4.mp3",
    "durata": "3:45",
    "posizione": "Vano Scale — Lato Ovest"
  },
  {
    "id": 5,
    "slug": "5",
    "titolo": "La Camera del Castellano",
    "descrizione": "Questo ambiente al primo piano era il cuore decisionale della torre. Il castellano — di norma un nobile di rango medio nominato direttamente dalla corona angioina — qui amministrava i registri fiscali dei villaggi dipendenti, riceveva i delegati dei feudatari locali e pianificava la difesa del territorio. La finestra con seduta in pietra, che vedete sul lato meridionale, era pensata per lo studio e la lettura: orientata a sud garantisce la massima luce naturale per la maggior parte della giornata. I ganci in ferro ancora infissi nella parete nord servivano per appendere arazzi che isolavano dal freddo e, al tempo stesso, ostentavano il rango del proprietario. Un documento del 1297 conservato nell'Archivio di Stato di Cosenza cita espressamente questa camera come luogo in cui fu siglato un accordo di confine tra il castellano e i monaci del vicino convento.",
    "audioSrc": "/audio/tappa5.mp3",
    "durata": "4:02",
    "posizione": "Primo Piano — Camera Sud"
  },
  {
    "id": 6,
    "slug": "6",
    "titolo": "Il Camminamento di Ronda",
    "descrizione": "Siete ora sul camminamento di ronda, il percorso continuo che correva lungo la sommità delle mura e permetteva ai soldati di pattugliare il perimetro della torre. Da qui il controllo visivo era assoluto: nelle giornate limpide si scorgono la catena del Pollino a nord, i contrafforti della Sila a est e, nelle condizioni atmosferiche migliori, una striscia di mare sul versante tirrenico a ovest. Questa visibilità non era un lusso ma una necessità strategica: qualsiasi movimento di truppe nemiche sul territorio poteva essere avvistato con ore di anticipo, dando tempo al presidio di prepararsi o di inviare messaggeri alle fortezze alleate. Le merlature che vedete sono state in parte ricostruite nel restauro del 1987, ma la forma a coda di rondine riprende fedelmente le tracce delle merlature originali documentate negli scavi.",
    "audioSrc": "/audio/tappa6.mp3",
    "durata": "3:30",
    "posizione": "Sommità — Camminamento Perimetrale"
  },
  {
    "id": 7,
    "slug": "7",
    "titolo": "La Torre nel Tempo: dal Medioevo a Oggi",
    "descrizione": "Concludete il vostro percorso guardando la torre nella sua interezza, cogliendone la stratificazione storica. Costruita dagli Angioini nel XIII secolo come struttura puramente militare, la torre cambiò funzione più volte nel corso dei secoli. Nel Quattrocento, sotto il dominio aragonese, divenne sede di un piccolo tribunale locale. Nel Seicento fu adibita a carcere mandamentale, funzione che mantenne fino all'Unità d'Italia. Nel 1943 subì danni da un bombardamento alleato che distrusse parte del camminamento di ronda. I restauri del dopoguerra e il consolidamento del 1987 l'hanno restituita alla città come monumento aperto al pubblico. Oggi la Torre Angioina è simbolo identitario di San Marco Argentano: la vedete raffigurata nello stemma comunale e nelle ceramiche artigianali prodotte nel centro storico. Sette secoli di storia racchiusi in mura che, come avete toccato con mano, resistono ancora.",
    "audioSrc": "/audio/tappa7.mp3",
    "durata": "4:15",
    "posizione": "Sommità — Punto Panoramico"
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/audioguides.json
git commit -m "feat: add 7-tappa audioguide data"
```

---

## Task 5: Create audioStore.ts and Vitest unit tests

**Files:**
- Create: `src/lib/audioStore.ts`
- Create: `src/lib/audioStore.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `src/lib/audioStore.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioStore } from './audioStore';

describe('audioStore', () => {
  beforeEach(() => {
    // Reset state between tests
    audioStore.reportState(false, '');
  });

  it('dispatches play-tappa event with correct detail', () => {
    const handler = vi.fn();
    audioStore.addEventListener('play-tappa', handler);

    audioStore.playTappa({ src: '/audio/tappa1.mp3', titolo: 'Ingresso', numero: 1 });

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ src: '/audio/tappa1.mp3', titolo: 'Ingresso', numero: 1 });

    audioStore.removeEventListener('play-tappa', handler);
  });

  it('dispatches toggle-play event', () => {
    const handler = vi.fn();
    audioStore.addEventListener('toggle-play', handler);

    audioStore.togglePlay();

    expect(handler).toHaveBeenCalledOnce();
    audioStore.removeEventListener('toggle-play', handler);
  });

  it('dispatches seek-relative event with correct seconds', () => {
    const handler = vi.fn();
    audioStore.addEventListener('seek-relative', handler);

    audioStore.seekRelative(-15);

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ seconds: -15 });

    audioStore.removeEventListener('seek-relative', handler);
  });

  it('tracks current tappa after playTappa', () => {
    const info = { src: '/audio/tappa3.mp3', titolo: 'Il Pozzo', numero: 3 };
    audioStore.playTappa(info);
    expect(audioStore.current).toEqual(info);
  });

  it('updates playing state via reportState', () => {
    audioStore.reportState(true, '/audio/tappa1.mp3');
    expect(audioStore.playing).toBe(true);

    audioStore.reportState(false, '/audio/tappa1.mp3');
    expect(audioStore.playing).toBe(false);
  });

  it('dispatches state-changed event on reportState', () => {
    const handler = vi.fn();
    audioStore.addEventListener('state-changed', handler);

    audioStore.reportState(true, '/audio/tappa2.mp3');

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ playing: true, src: '/audio/tappa2.mp3' });

    audioStore.removeEventListener('state-changed', handler);
  });
});
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
npm test
```

Expected: FAIL — "Cannot find module './audioStore'"

- [ ] **Step 3: Create audioStore.ts to make tests pass**

Create `src/lib/audioStore.ts`:

```typescript
export interface TappaInfo {
  src: string;
  titolo: string;
  numero: number;
}

class AudioStore extends EventTarget {
  private _current: TappaInfo | null = null;
  private _playing = false;

  get current(): TappaInfo | null {
    return this._current;
  }

  get playing(): boolean {
    return this._playing;
  }

  playTappa(info: TappaInfo): void {
    this._current = info;
    this.dispatchEvent(new CustomEvent('play-tappa', { detail: info }));
  }

  togglePlay(): void {
    this.dispatchEvent(new CustomEvent('toggle-play'));
  }

  seekRelative(seconds: number): void {
    this.dispatchEvent(new CustomEvent('seek-relative', { detail: { seconds } }));
  }

  reportState(playing: boolean, src: string): void {
    this._playing = playing;
    this.dispatchEvent(new CustomEvent('state-changed', { detail: { playing, src } }));
  }
}

export const audioStore = new AudioStore();
```

- [ ] **Step 4: Run tests — verify they PASS**

```bash
npm test
```

Expected:
```
✓ src/lib/audioStore.test.ts (6)
  ✓ audioStore > dispatches play-tappa event with correct detail
  ✓ audioStore > dispatches toggle-play event
  ✓ audioStore > dispatches seek-relative event with correct seconds
  ✓ audioStore > tracks current tappa after playTappa
  ✓ audioStore > updates playing state via reportState
  ✓ audioStore > dispatches state-changed event on reportState
Test Files  1 passed (1)
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/audioStore.ts src/lib/audioStore.test.ts
git commit -m "feat: add audioStore event bus with unit tests"
```

---

## Task 6: Create AudioPlayer.astro

**Files:**
- Create: `src/components/AudioPlayer.astro`

- [ ] **Step 1: Create AudioPlayer.astro**

Create `src/components/AudioPlayer.astro`:

```astro
---
// No server-side props needed — purely client-side
---

<div
  id="audio-player"
  transition:persist
  transition:name="audio-player"
  class="fixed bottom-0 left-0 right-0 z-50 opacity-0 pointer-events-none transition-opacity duration-300"
  aria-label="Player audio"
  aria-hidden="true"
>
  <div
    class="bg-white/5 backdrop-blur-xl border-t border-white/[0.08] px-4 pt-3"
    style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))"
  >
    <!-- Row 1: info + controls -->
    <div class="flex items-center gap-3 max-w-lg mx-auto">
      <!-- Numero tappa -->
      <span
        id="player-numero"
        class="font-mono font-bold text-lg shrink-0 w-6 text-center"
        style="color: var(--accent)"
      >1</span>

      <!-- Titolo (truncated) -->
      <span id="player-titolo" class="text-sm truncate flex-1" style="color: var(--text-primary)">
        —
      </span>

      <!-- Controls -->
      <div class="flex items-center gap-1 shrink-0">
        <button
          id="btn-back"
          aria-label="Indietro 15 secondi"
          class="flex flex-col items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors text-xs font-mono"
          style="color: var(--text-secondary)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mb-0.5">
            <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          <span class="leading-none">15</span>
        </button>

        <button
          id="btn-play"
          aria-label="Play"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style="background-color: var(--accent)"
        >
          <!-- Populated by JS -->
          <svg id="icon-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <polygon points="6,3 20,12 6,21"/>
          </svg>
          <svg id="icon-pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 hidden">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>

        <button
          id="btn-forward"
          aria-label="Avanti 15 secondi"
          class="flex flex-col items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors text-xs font-mono"
          style="color: var(--text-secondary)"
        >
          <span class="leading-none">15</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mt-0.5">
            <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l4-4-4-4v4C7.58 7 4 10.58 4 15s3.58 8 8 8 8-3.58 8-8h-2z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Row 2: progress -->
    <div class="flex items-center gap-2 max-w-lg mx-auto mt-2">
      <span id="player-current" class="text-xs font-mono w-9 shrink-0" style="color: var(--text-secondary)">0:00</span>
      <input
        type="range"
        id="progress-bar"
        min="0"
        max="100"
        value="0"
        step="0.1"
        class="flex-1 h-1 cursor-pointer"
        aria-label="Posizione audio"
      />
      <span id="player-duration" class="text-xs font-mono w-9 shrink-0 text-right" style="color: var(--text-secondary)">0:00</span>
    </div>
  </div>

  <audio id="audio-element" preload="metadata"></audio>
</div>

<script>
  import { audioStore } from '../lib/audioStore';

  const player = document.getElementById('audio-player') as HTMLDivElement;
  const audio = document.getElementById('audio-element') as HTMLAudioElement;
  const btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  const btnBack = document.getElementById('btn-back') as HTMLButtonElement;
  const btnFwd = document.getElementById('btn-forward') as HTMLButtonElement;
  const progressBar = document.getElementById('progress-bar') as HTMLInputElement;
  const elCurrent = document.getElementById('player-current') as HTMLSpanElement;
  const elDuration = document.getElementById('player-duration') as HTMLSpanElement;
  const elTitolo = document.getElementById('player-titolo') as HTMLSpanElement;
  const elNumero = document.getElementById('player-numero') as HTMLSpanElement;
  const iconPlay = document.getElementById('icon-play') as SVGElement;
  const iconPause = document.getElementById('icon-pause') as SVGElement;

  function fmt(s: number): string {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function showPlayer(): void {
    player.classList.remove('opacity-0', 'pointer-events-none');
    player.setAttribute('aria-hidden', 'false');
  }

  function setPlayingUI(playing: boolean): void {
    if (playing) {
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
      btnPlay.setAttribute('aria-label', 'Pausa');
    } else {
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
      btnPlay.setAttribute('aria-label', 'Play');
    }
  }

  // Listen for play-tappa events from pages
  audioStore.addEventListener('play-tappa', (e: Event) => {
    const { src, titolo, numero } = (e as CustomEvent<{ src: string; titolo: string; numero: number }>).detail;
    const resolvedSrc = new URL(src, window.location.href).href;

    elTitolo.textContent = titolo;
    elNumero.textContent = String(numero);
    showPlayer();

    if (audio.src !== resolvedSrc) {
      audio.src = src;
      audio.load();
    }
    audio.play().catch(() => {/* browser may block autoplay */});
  });

  // Listen for toggle-play events
  audioStore.addEventListener('toggle-play', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  // Listen for seek-relative events
  audioStore.addEventListener('seek-relative', (e: Event) => {
    const { seconds } = (e as CustomEvent<{ seconds: number }>).detail;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
  });

  // Player button handlers
  btnPlay.addEventListener('click', () => audioStore.togglePlay());
  btnBack.addEventListener('click', () => audioStore.seekRelative(-15));
  btnFwd.addEventListener('click', () => audioStore.seekRelative(15));

  // Sync progress bar with audio
  audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration) && audio.duration > 0) {
      progressBar.value = String((audio.currentTime / audio.duration) * 100);
      elCurrent.textContent = fmt(audio.currentTime);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    elDuration.textContent = fmt(audio.duration);
  });

  audio.addEventListener('play', () => {
    setPlayingUI(true);
    audioStore.reportState(true, audio.src);
  });

  audio.addEventListener('pause', () => {
    setPlayingUI(false);
    audioStore.reportState(false, audio.src);
  });

  audio.addEventListener('ended', () => {
    setPlayingUI(false);
    progressBar.value = '0';
    audioStore.reportState(false, audio.src);
  });

  // Allow scrubbing via progress bar
  progressBar.addEventListener('input', () => {
    if (!isNaN(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(progressBar.value) / 100) * audio.duration;
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AudioPlayer.astro
git commit -m "feat: add persistent AudioPlayer component with transition:persist"
```

---

## Task 7: Create Layout.astro

**Files:**
- Modify: `src/layouts/Layout.astro` (create if not present)

- [ ] **Step 1: Write Layout.astro**

Create or overwrite `src/layouts/Layout.astro`:

```astro
---
import { ViewTransitions } from 'astro:transitions';
import AudioPlayer from '../components/AudioPlayer.astro';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Torre Angioina — Audioguide',
  description = 'Audioguide per la Torre Angioina di San Marco Argentano, XIII secolo.',
} = Astro.props;
---

<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content={description} />
    <meta name="theme-color" content="#0A0A0A" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>{title}</title>
    <ViewTransitions />
  </head>
  <body class="bg-[#0A0A0A] text-[#F5F0EB] min-h-screen antialiased">
    <!-- Main content with bottom padding for the fixed player -->
    <main class="pb-28">
      <slot />
    </main>

    <!-- Persistent global audio player -->
    <AudioPlayer />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Layout with ViewTransitions and persistent AudioPlayer"
```

---

## Task 8: Create PWAStatus.astro

**Files:**
- Create: `src/components/PWAStatus.astro`

- [ ] **Step 1: Create PWAStatus.astro**

Create `src/components/PWAStatus.astro`:

```astro
---
// Client-side only component
---

<div id="pwa-status" class="opacity-0 transition-opacity duration-500">
  <div id="pwa-badge" class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full">
    <span id="pwa-dot" class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
    <span id="pwa-text" class="font-medium">Caricamento…</span>
  </div>
</div>

<script>
  const statusEl = document.getElementById('pwa-status') as HTMLDivElement;
  const badgeEl = document.getElementById('pwa-badge') as HTMLDivElement;
  const dotEl = document.getElementById('pwa-dot') as HTMLSpanElement;
  const textEl = document.getElementById('pwa-text') as HTMLSpanElement;

  function show(): void {
    statusEl.classList.remove('opacity-0');
  }

  function setReady(): void {
    dotEl.className = 'w-1.5 h-1.5 rounded-full bg-green-500';
    textEl.textContent = 'Disponibile offline';
    badgeEl.className =
      'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/40';
    show();
  }

  function setUpdating(): void {
    dotEl.className = 'w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse';
    textEl.textContent = 'Download in corso…';
    badgeEl.className =
      'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-900/30 text-amber-400 border border-amber-800/40';
    show();
  }

  function setOnlineOnly(): void {
    dotEl.className = 'w-1.5 h-1.5 rounded-full bg-gray-500';
    textEl.textContent = 'Online richiesto';
    badgeEl.className =
      'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-gray-800/60 text-gray-400 border border-gray-700/40';
    show();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg) {
          setOnlineOnly();
          return;
        }
        if (reg.installing || reg.waiting) {
          setUpdating();
        } else if (reg.active) {
          setReady();
        }
        reg.addEventListener('updatefound', () => setUpdating());
      })
      .catch(() => setOnlineOnly());

    navigator.serviceWorker.addEventListener('controllerchange', () => setReady());
  } else {
    setOnlineOnly();
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PWAStatus.astro
git commit -m "feat: add PWAStatus offline indicator component"
```

---

## Task 9: Create TappaCard.astro

**Files:**
- Create: `src/components/TappaCard.astro`

- [ ] **Step 1: Create TappaCard.astro**

Create `src/components/TappaCard.astro`:

```astro
---
interface Props {
  id: number;
  titolo: string;
  durata: string;
  posizione: string;
}

const { id, titolo, durata, posizione } = Astro.props;
---

<a
  href={`/tappa/${id}`}
  class="group block rounded-xl border p-4 transition-all duration-200 hover:border-accent/60 hover:bg-white/[0.03] active:scale-[0.98]"
  style="background-color: var(--glass-bg); border-color: var(--glass-border); backdrop-filter: blur(12px)"
>
  <!-- Header row: numero + durata -->
  <div class="flex items-start justify-between mb-3">
    <span
      class="font-mono font-bold text-2xl leading-none"
      style="color: var(--accent)"
    >
      {String(id).padStart(2, '0')}
    </span>
    <span class="text-xs font-mono" style="color: var(--text-secondary)">{durata}</span>
  </div>

  <!-- Titolo -->
  <h2
    class="font-serif text-base font-semibold leading-snug mb-2 group-hover:text-white transition-colors"
    style="color: var(--text-primary)"
  >
    {titolo}
  </h2>

  <!-- Posizione -->
  <p class="text-xs leading-none" style="color: var(--text-secondary)">{posizione}</p>

  <!-- Offline available indicator -->
  <div class="flex items-center gap-1.5 mt-3">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-green-500">
      <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd"/>
    </svg>
    <span class="text-xs text-green-500/80">Disponibile offline</span>
  </div>
</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TappaCard.astro
git commit -m "feat: add TappaCard component"
```

---

## Task 10: Create index.astro (Home page)

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write index.astro**

Overwrite `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import TappaCard from '../components/TappaCard.astro';
import PWAStatus from '../components/PWAStatus.astro';
import audioguides from '../data/audioguides.json';
---

<Layout title="Torre Angioina — Audioguide">
  <!-- Header -->
  <header class="relative px-5 pt-14 pb-8 overflow-hidden">
    <!-- Decorative blur orb -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
      style="background: radial-gradient(circle, #8B2635, transparent)"
      aria-hidden="true"
    ></div>

    <div class="relative flex items-start justify-between">
      <div>
        <p class="text-xs font-mono tracking-widest uppercase mb-2" style="color: var(--accent)">
          San Marco Argentano · XIII sec.
        </p>
        <h1 class="font-serif text-4xl font-bold leading-tight" style="color: var(--text-primary)">
          Torre<br />Angioina
        </h1>
        <p class="mt-3 text-sm leading-relaxed max-w-xs" style="color: var(--text-secondary)">
          Sette tappe per scoprire otto secoli di storia. Scansiona il codice QR accanto a ogni punto di interesse.
        </p>
      </div>
      <div class="shrink-0 mt-1">
        <PWAStatus />
      </div>
    </div>
  </header>

  <!-- Tappa grid -->
  <section class="px-5 pb-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xs font-mono tracking-widest uppercase" style="color: var(--text-secondary)">
        Percorso · 7 tappe
      </h2>
    </div>
    <div class="grid grid-cols-2 gap-3">
      {audioguides.map((tappa) => (
        <TappaCard
          id={tappa.id}
          titolo={tappa.titolo}
          durata={tappa.durata}
          posizione={tappa.posizione}
        />
      ))}
    </div>
  </section>

  <!-- Footer -->
  <footer class="px-5 py-6 border-t" style="border-color: var(--glass-border)">
    <p class="text-xs text-center" style="color: var(--text-secondary)">
      Torre Angioina di San Marco Argentano<br />
      <span class="opacity-50">Audioguide · versione digitale</span>
    </p>
  </footer>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add home page with 7-card grid"
```

---

## Task 11: Create tappa/[id].astro (detail page)

**Files:**
- Create: `src/pages/tappa/[id].astro`

- [ ] **Step 1: Create the tappa detail page**

Create `src/pages/tappa/[id].astro`:

```astro
---
import type { GetStaticPaths } from 'astro';
import Layout from '../../layouts/Layout.astro';
import audioguides from '../../data/audioguides.json';

export const getStaticPaths = (() => {
  return audioguides.map((tappa) => ({
    params: { id: String(tappa.id) },
    props: { tappa },
  }));
}) satisfies GetStaticPaths;

interface Props {
  tappa: (typeof audioguides)[0];
}

const { tappa } = Astro.props;

const currentIndex = audioguides.findIndex((t) => t.id === tappa.id);
const prev = currentIndex > 0 ? audioguides[currentIndex - 1] : null;
const next = currentIndex < audioguides.length - 1 ? audioguides[currentIndex + 1] : null;
---

<Layout
  title={`${tappa.titolo} — Torre Angioina`}
  description={tappa.descrizione.slice(0, 160)}
>
  <!-- Back navigation -->
  <nav class="px-5 pt-10 pb-4">
    <a
      href="/"
      class="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
      style="color: var(--text-secondary)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clip-rule="evenodd"/>
      </svg>
      Tutte le tappe
    </a>
  </nav>

  <!-- Tappa header -->
  <header class="px-5 pb-6 relative overflow-hidden">
    <div
      class="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
      style="background: radial-gradient(circle, #8B2635, transparent)"
      aria-hidden="true"
    ></div>

    <div class="relative">
      <p class="font-mono font-bold text-6xl leading-none mb-4" style="color: var(--accent)">
        {String(tappa.id).padStart(2, '0')}
      </p>
      <h1 class="font-serif text-2xl font-bold leading-snug mb-2" style="color: var(--text-primary)">
        {tappa.titolo}
      </h1>
      <p class="text-xs font-mono" style="color: var(--text-secondary)">{tappa.posizione}</p>
    </div>
  </header>

  <!-- Play button -->
  <div class="px-5 mb-8">
    <button
      id="btn-ascolta"
      class="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-white transition-all active:scale-[0.97]"
      style="background-color: var(--accent)"
      data-src={tappa.audioSrc}
      data-titolo={tappa.titolo}
      data-numero={tappa.id}
      data-durata={tappa.durata}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
        <polygon points="6,3 20,12 6,21"/>
      </svg>
      Ascolta l'audioguida · {tappa.durata}
    </button>
  </div>

  <!-- Description text -->
  <article class="px-5 pb-10">
    <div
      class="rounded-2xl p-5 border"
      style="background-color: var(--glass-bg); border-color: var(--glass-border); backdrop-filter: blur(12px)"
    >
      <p class="font-serif text-base leading-relaxed" style="color: var(--text-primary)">
        {tappa.descrizione}
      </p>
    </div>
  </article>

  <!-- Prev / Next navigation -->
  <nav class="px-5 pb-6 grid grid-cols-2 gap-3">
    {prev ? (
      <a
        href={`/tappa/${prev.id}`}
        class="flex flex-col gap-1 p-3 rounded-xl border transition-colors hover:border-accent/40"
        style="background-color: var(--glass-bg); border-color: var(--glass-border)"
      >
        <span class="text-xs" style="color: var(--text-secondary)">← Precedente</span>
        <span class="text-sm font-medium truncate" style="color: var(--text-primary)">{prev.titolo}</span>
      </a>
    ) : <div></div>}

    {next ? (
      <a
        href={`/tappa/${next.id}`}
        class="flex flex-col gap-1 p-3 rounded-xl border text-right transition-colors hover:border-accent/40"
        style="background-color: var(--glass-bg); border-color: var(--glass-border)"
      >
        <span class="text-xs" style="color: var(--text-secondary)">Successiva →</span>
        <span class="text-sm font-medium truncate" style="color: var(--text-primary)">{next.titolo}</span>
      </a>
    ) : <div></div>}
  </nav>
</Layout>

<script>
  import { audioStore } from '../../lib/audioStore';

  // Hydrate the Ascolta button on every navigation to this page
  function initPlayButton(): void {
    const btn = document.getElementById('btn-ascolta') as HTMLButtonElement | null;
    if (!btn) return;

    btn.addEventListener('click', () => {
      const src = btn.dataset.src!;
      const titolo = btn.dataset.titolo!;
      const numero = parseInt(btn.dataset.numero!, 10);

      audioStore.playTappa({ src, titolo, numero });
    });
  }

  // Run on initial load
  initPlayButton();

  // Re-run after each View Transition (page swap)
  document.addEventListener('astro:page-load', initPlayButton);
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/tappa/
git commit -m "feat: add tappa detail pages with dynamic routing"
```

---

## Task 12: Create placeholder assets

**Files:**
- Create: `public/audio/tappa{1-7}.mp3`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`

- [ ] **Step 1: Create placeholder audio files**

```bash
node -e "
const fs = require('fs');
fs.mkdirSync('public/audio', { recursive: true });
// Minimal ID3v2 header + silent MPEG frame (valid enough for browser to not error out completely)
// This is a 1-frame silent MP3 at 128kbps, 44100Hz, stereo
const silentFrame = Buffer.from([
  0xFF,0xFB,0x90,0x00, // MPEG1 Layer3 128kbps 44100Hz stereo sync
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
]);
for (let i = 1; i <= 7; i++) {
  fs.writeFileSync(\`public/audio/tappa\${i}.mp3\`, silentFrame);
  console.log(\`Created tappa\${i}.mp3\`);
}
"
```

Expected output:
```
Created tappa1.mp3
Created tappa2.mp3
...
Created tappa7.mp3
```

> **Note:** These are placeholder files. Replace them with real audio recordings before deploying. The file structure and service worker caching are fully set up.

- [ ] **Step 2: Create placeholder PWA icons**

```bash
node -e "
const fs = require('fs');
fs.mkdirSync('public/icons', { recursive: true });
// Minimal 1×1 dark red PNG (valid PNG file, placeholder only)
const png = Buffer.from(
  '89504e470d0a1a0a0000000d494844520000000100000001080200000090' +
  '7753de0000000c4944415408d76360f8cf000000020001e221bc33000000' +
  '0049454e44ae426082',
  'hex'
);
fs.writeFileSync('public/icons/icon-192.png', png);
fs.writeFileSync('public/icons/icon-512.png', png);
console.log('Icons created');
"
```

Expected output: `Icons created`

> **Note:** Replace these with proper 192×192 and 512×512 PNGs (e.g., the tower logo) before deploying.

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "feat: add placeholder audio files and PWA icons"
```

---

## Task 13: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run unit tests**

```bash
npm test
```

Expected:
```
Test Files  1 passed (1)
Tests       6 passed (6)
```

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: build completes without TypeScript errors. Output in `dist/`. The console should show Workbox generating the service worker with MP3 files listed in the precache manifest.

Look for lines like:
```
Generating a service worker...
The service worker at dist/sw.js will precache ... files, totaling ... bytes.
```

- [ ] **Step 3: If build fails — common fixes**

| Error | Fix |
|---|---|
| `Cannot find module '@vite-pwa/astro'` | Run `npm install -D @vite-pwa/astro` again |
| `Type error in tappa/[id].astro` | Check `satisfies GetStaticPaths` import from `'astro'` |
| `transition:persist` unknown directive | Confirm Astro version ≥ 3.0: `npx astro --version` |
| Workbox missing MP3s | Confirm files exist in `public/audio/` before building |

- [ ] **Step 4: Smoke-test with preview server**

```bash
npm run preview
```

Open `http://localhost:4321` in a mobile-sized browser viewport (DevTools → responsive mode, 390×844). Verify:
- Home page renders 7 cards in a 2-column grid
- Tapping a card navigates to the tappa detail page
- Tapping "Ascolta" shows the player bar at the bottom
- Navigating back to home keeps the player visible and audio playing
- DevTools → Application → Service Workers shows the SW registered
- DevTools → Application → Cache Storage shows HTML, CSS, JS and MP3 files cached

- [ ] **Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: Torre Angioina PWA — complete initial implementation"
```

---

## Post-build checklist (before production)

- [ ] Replace `public/audio/tappa{1-7}.mp3` with real recordings
- [ ] Replace `public/icons/icon-192.png` and `icon-512.png` with real tower artwork
- [ ] Test actual offline behavior: load in Chrome, go offline in DevTools, reload
- [ ] Verify audio continues playing across page navigations on a real iOS/Android device
- [ ] Add `apple-touch-icon` link tag in Layout.astro pointing to the real icon
