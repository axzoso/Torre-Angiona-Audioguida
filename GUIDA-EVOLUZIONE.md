# 🚀 Guida all'evoluzione della webapp

> Come migliorare l'audioguida, quali funzionalità aggiungere e come organizzare
> lo sviluppo della fruizione multilingua. Documento di indirizzo: nessuna delle
> voci qui dentro è urgente, l'app è completa e funzionante così com'è.

---

## 1. Miglioramenti a basso sforzo (quick win)

In ordine di rapporto beneficio/sforzo, dal più conveniente:

1. **Media Session API** (~30 righe in `AudioPlayer.astro`). Mostra titolo della
   tappa e controlli play/pausa/±15s sulla **schermata di blocco** del telefono e
   nelle cuffie bluetooth. Per un'app il cui uso tipico è "telefono in tasca,
   cuffie alle orecchie" è il singolo miglioramento UX più efficace:
   `navigator.mediaSession.metadata = new MediaMetadata({ title, artist: 'Torre Angioina', artwork: [icone] })`
   + handler per `play`, `pause`, `seekbackward`, `seekforward`.
2. **Montare `PWAStatus.astro`** (già scritto, mai usato): badge "Disponibile
   offline" nel footer. Rassicura il visitatore prima di salire dove non c'è segnale.
3. **Autoplay tappa successiva** (opzionale, con toggle): a fine audio proporre
   "Prossima tappa →" con un piccolo countdown, sfruttando l'evento `ended` già
   gestito e `audioStore`.
4. **Hash CSP al posto di `'unsafe-inline'`** in `script-src`: hardening finale
   (vedi `RESOCONTO-AUDIT-2026-06-10.md`).
5. **CI minimale con GitHub Actions**: su ogni PR eseguire `npm run build`,
   `npm test` e `npm audit`. Evita di scoprire una build rotta solo al deploy
   Coolify. Un solo workflow da ~20 righe.
6. **Pulsante "Condividi"** sulla pagina tappa con `navigator.share()` (Web Share
   API, nativa su mobile, zero dipendenze).

## 2. Funzionalità future (roadmap di prodotto)

### Contenuti
- **Foto storiche/attuali per tappa**: il JSON può crescere con un campo
  `immagini: []`; attenzione al peso nel precache (oggi limite 15 MB in Workbox).
- **Mappa del percorso**: una piantina SVG statica della Torre con le 8 tappe
  cliccabili è coerente con l'approccio "tutto statico" (evitare tile map
  esterne: pesano, richiedono rete e allargano la CSP).
- **Modalità "solo lettura"**: chi non può/vuole ascoltare ha già la
  trascrizione; aggiungere font-size regolabile migliorerebbe l'accessibilità.

### Feedback visitatori (in roadmap nel README)
- Soluzione più sobria: link/QR a un **form esterno** (Google Form o simile) in
  fondo all'ultima tappa. Zero backend, zero dati trattati in prima persona.
  Nota: se incorporato in iframe servirebbe ampliare la CSP — meglio un semplice
  link che apre il form in una nuova scheda.

### Statistiche
- **Dashboard**: un report Looker Studio collegato a GA4 con gli eventi custom
  già tracciati (`play_audio`, `audio_complete`, `audio_pause`) copre la
  rendicontazione al Comune senza scrivere codice.
- **Alternativa privacy-first** (limite dichiarato in PRESENTAZIONE.md): Plausible
  o Umami self-hosted sulla stessa VPS Coolify eliminerebbero la dipendenza da
  Google. Migrazione semplice: gli eventi sono già centralizzati in 2 file
  (`Layout.astro` e `AudioPlayer.astro`).

### Qualità
- **Test del player**: oggi è testato solo `audioStore`. Le regressioni più
  probabili (race sulla fetch, durata fallback, eventi GA) vivono in
  `AudioPlayer.astro`: estrarre la logica pura in `src/lib/` la renderebbe
  testabile con Vitest.
- **E2E con Playwright** (anche solo 3 scenari: home → tappa → play; offline
  dopo prima visita; navigazione con player attivo).
- **Lighthouse CI** per tenere d'occhio peso pagina e PWA score.

---

## 3. Multilingua (IT / EN / FR): come organizzarlo

> Vincolo dichiarato: dipende dalla **produzione degli audio tradotti**. Il
> lavoro tecnico però si può preparare prima, così quando arrivano gli mp3 la
> pubblicazione è questione di ore.

### 3.1 Architettura consigliata

**Routing con prefisso lingua, italiano senza prefisso** (non rompe QR code e
URL esistenti):

```
/            /tappa/1/            /privacy/        ← italiano (invariato)
/en/         /en/tappa/1/         /en/privacy/     ← inglese
/fr/         /fr/tappa/1/         /fr/privacy/     ← francese
```

Astro lo supporta nativamente (`i18n` in `astro.config.ts` con
`defaultLocale: 'it'` e `prefixDefaultLocale: false`); le route restano statiche
e generate da `getStaticPaths`.

**Dati**: un file JSON per lingua, stessa struttura e stessi `id`:

```
src/data/audioguides.it.json
src/data/audioguides.en.json
src/data/audioguides.fr.json
```

Meglio di un unico JSON annidato per tre ragioni: chi traduce lavora su un file
isolato senza poter rompere le altre lingue; il bundle del Layout importa solo
la lingua corrente; il diff in PR è leggibile.

**Audio**: una cartella per lingua, stessi nomi file:

```
public/audio/it/tappa1.mp3
public/audio/en/tappa1.mp3
public/audio/fr/tappa1.mp3
```

(Comporta lo spostamento degli mp3 attuali in `audio/it/` — i client con la
vecchia cache continueranno a funzionare perché ricevono i nuovi URL dal nuovo
HTML; vale la regola "nuovo percorso = nuova cache" descritta nel resoconto.)

**UI cromata** (etichette "Ascolta l'audioguida", "Precedente", footer, ecc.):
un piccolo dizionario `src/i18n/ui.ts` con le ~15 stringhe per lingua. Non serve
una libreria i18n: il sito è statico e le stringhe sono poche.

### 3.2 Scelte UX

- **Selettore lingua** nell'header (IT · EN · FR), che mantiene la pagina
  corrente cambiando solo il prefisso (`/tappa/3/` ↔ `/en/tappa/3/`).
- **QR code: restano language-neutral** e puntano all'URL italiano. Il visitatore
  straniero cambia lingua dal selettore e da lì la navigazione prev/next resta
  nella sua lingua. In alternativa si può aggiungere un suggerimento non invasivo
  basato su `navigator.language` ("View this page in English?") — mai un
  redirect automatico, che è ostile e complica la cache del SW.
- **`hreflang`** nei `<head>` per il SEO multilingua (Astro i18n lo facilita).

### 3.3 PWA e offline: il punto delicato

Con 3 lingue gli mp3 triplicano (~24 file). **Non vanno precachati tutti**:
gonfierebbe la prima visita e lo storage di ogni telefono con audio che
l'utente non ascolterà mai. La strategia attuale è già quella giusta e va solo
estesa:

- Il `runtimeCaching` CacheFirst su `*.mp3` copre qualunque lingua senza
  modifiche (il pattern matcha anche `audio/en/…`).
- Il **pre-buffering** in `Layout.astro` deve scaricare **solo la lingua della
  pagina corrente** (oggi importa il JSON italiano; con i JSON per lingua basta
  importare quello giusto in base al locale della pagina).
- HTML/CSS/JS di tutte le lingue restano nel precache (sono leggeri).

### 3.4 Piano di lavoro a fasi

| Fase | Contenuto | Quando |
|---|---|---|
| **A — Predisposizione** (si può fare subito) | Config `i18n` Astro, split di `audioguides.json` in `audioguides.it.json`, spostamento mp3 in `audio/it/`, dizionario `ui.ts`, selettore lingua (mostrato solo se esiste >1 lingua). Output identico all'attuale per l'utente. | Indipendente dagli audio |
| **B — Prima lingua (EN)** | `audioguides.en.json` (testi tradotti), mp3 inglesi in `audio/en/`, pagine generate, hreflang, test offline in entrambe le lingue. | Quando arrivano gli audio EN |
| **C — Francese** | Replica della fase B: a quel punto è puro inserimento dati. | Quando arrivano gli audio FR |

La fase A è il grosso del lavoro tecnico (~1 giornata) e conviene farla in un
branch dedicato con QR di test, perché tocca i percorsi degli mp3. B e C sono
operazioni quasi solo redazionali.

### 3.5 Trappole da evitare

- **Non duplicare le pagine a mano** (`index-en.astro`…): usare i18n di Astro e
  un'unica pagina parametrica per lingua, o la manutenzione triplica.
- **Non tradurre gli `id`** né i nomi file: `id` e struttura del JSON sono il
  contratto tra le lingue; cambia solo il contenuto testuale e l'`audioSrc`.
- **Eventi GA4**: aggiungere un parametro `lang` a `page_view`/`play_audio` per
  distinguere le lingue nei report (nuova dimensione personalizzata in GA4,
  stessa procedura di `docs/analytics_ga4.md`).
- **Ricordare la regola mp3**: anche per le nuove lingue, un audio sostituito =
  file rinominato (cache CacheFirst senza scadenza).
