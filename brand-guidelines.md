# Fuori le Mura — Brand guidelines (visual identity)

Riferimento operativo estratto dal mockup Astro (`mockup/src/`). Tutti i valori provengono da:
`styles/global.css`, `layouts/Base.astro`, `layouts/Page.astro`, `components/Hero.astro`, `components/Footer.astro`, `pages/chi-siamo.astro`.
Dove un elemento **non esiste** nel codice è indicato esplicitamente.

---

## 1. Palette colori

### Tema chiaro (default, `:root`)

| Variabile CSS   | HEX                   | RGB                        | Ruolo |
|-----------------|-----------------------|----------------------------|-------|
| `--paper`       | `#efe9db`             | 239, 233, 219              | Sfondo pagina (carta). Anche `theme-color`, testo su bottoni pieni, `::selection` text |
| `--paper-deep`  | `#e6dec9`             | 230, 222, 201              | Carta più scura. **Definita ma non usata** nel mockup |
| `--ink`         | `#1b1a17`             | 27, 26, 23                 | Testo principale, bordi bottoni, linee SVG, hover del bottone outline (fondo) |
| `--ink-soft`    | `#5f594d`             | 95, 89, 77                 | Testo secondario: etichette mono, label form, didascalie SVG |
| `--stamp`       | `#b3321d`             | 179, 50, 29                | **Unico accento** (rosso "timbro"): hover link, voce nav attiva, capolettera, bottone primario, focus ring, selezione, quote/misure nei disegni |
| `--rule`        | `rgba(27,26,23,0.22)` | 27, 26, 23 @ 22%           | Filetti/divisori tra le voci di elenco |

### Tema scuro (solo footer, variabili locali a `.ft`)

| Variabile CSS | HEX                      | RGB                    | Ruolo |
|---------------|--------------------------|------------------------|-------|
| `--f-bg`      | `#1d1b18`                | 29, 27, 24             | Sfondo footer (e header quando sovrapposto al footer) |
| `--f-ink`     | `#efe9db`                | 239, 233, 219          | Testo e bordi su scuro (= `--paper`) |
| `--f-soft`    | `#b7ae9a`                | 183, 174, 154          | Testo secondario su scuro |
| `--f-line`    | `rgba(239,233,219,0.2)`  | 239, 233, 219 @ 20%    | Divisori su scuro |
| `--f-red`     | `#ee7a5e`                | 238, 122, 94           | Accento su scuro (versione chiara del timbro): hover, bottone primario, percorso animato |

### Stati

| Elemento | Default | Hover / Active | Focus |
|---|---|---|---|
| Link testo | `color: inherit`, sottolineato 1px | `color: var(--stamp)` | `outline: 2px solid var(--stamp); outline-offset: 3px` (globale `:focus-visible`) |
| Nav desktop | ink, bordo inferiore trasparente | `--stamp` + `border-bottom: 1px solid var(--stamp)`; stesso stile per `aria-current="page"` | come sopra |
| Bottone outline `.btn` | trasparente, bordo `--ink` | fondo `--ink`, testo `--paper` | come sopra |
| Bottone pieno `.btn.solid` | fondo/bordo `--stamp`, testo `--paper` | fondo/bordo `--ink` | come sopra |
| Input form | bordo inferiore 1px `--ink` | — | bordo inferiore 2px `--stamp`, nessun outline |
| Selezione testo | — | `background: --stamp; color: --paper` | — |

### Texture di sfondo
Il `body` ha un rumore SVG inline (`feTurbulence` fractalNoise, `baseFrequency .9`, alpha `0.055`, tile 240×240) sopra `--paper`: effetto carta grezza, non un colore piatto.

---

## 2. Tipografia

### Famiglie

| Variabile | Stack | Pacchetto | Uso |
|---|---|---|---|
| `--serif` | `'Fraunces Variable', Georgia, serif` | `@fontsource-variable/fraunces` (assi `opsz`, roman + italic) | Titoli **e** corpo testo |
| `--mono`  | `'JetBrains Mono', ui-monospace, monospace` | `@fontsource/jetbrains-mono` (solo 400) | Accenti: etichette a margine, kicker, nav, bottoni, label form, metadati, didascalie |

Import (in `global.css`):
```css
@import '@fontsource-variable/fraunces/opsz.css';
@import '@fontsource-variable/fraunces/opsz-italic.css';
@import '@fontsource/jetbrains-mono/400.css';
```

### Pesi usati
- Fraunces: **400** (corpo, italic del claim hero), **450** (titolo hero, nome nel footer), **500** (h1/h2/h3, logotipo `.mark`, titoli voci `.t`, capolettera).
- JetBrains Mono: **400** unico peso.
- Corsivo: solo Fraunces italic nel testo intermedio dell'hero (`.mid`).

### Optical size (`font-variation-settings: 'opsz'`)
`font-optical-sizing: auto` sul body, più valori forzati:
- `14` corpo · `36` `.lead` · `72` logotipo e titoli voci · `100` claim italic hero · `144` h1/h2/h3, capolettera, display.

### Scala dimensionale

| Ruolo | Selettore | font-size | line-height | letter-spacing |
|---|---|---|---|---|
| Display hero | `.hero .title` | `clamp(2.7rem, 1rem + 7.4vw, 7.4rem)` | 0.98 | -0.03em |
| Display footer | `.ft-name` | `clamp(3rem, 1rem + 8vw, 8.5rem)` | 0.95 | -0.035em |
| H1 pagina | `.head h1` | `clamp(2.8rem, 1.2rem + 6vw, 6rem)` | 1.08 | -0.03em |
| H2 sezione home | `.section h2` | `clamp(2rem, 1.4rem + 2.4vw, 3.2rem)` | 1.08 | -0.015em |
| H2 blocco pagina | `.block h2` | `clamp(1.8rem, 1.3rem + 1.8vw, 2.6rem)` | 1.08 | -0.015em |
| H3 timeline | `.tl h3` | `1.45rem` | 1.08 | -0.015em |
| Titolo voce elenco | `.entries .t` | `1.5rem` | 1.2 | — |
| Logotipo header | `.mark` | `1.35rem` | — | -0.01em |
| Lead | `.lead` | `1.25em` | 1.5 | — |
| Corpo | `body` | `clamp(1.1rem, 1.02rem + 0.35vw, 1.28rem)` | **1.68** | — |
| Mono (etichette) | `.mono`, nav, label | `0.8125rem` (13px) | 1.55 | 0 |
| Mono (bottoni) | `.btn` | `0.875rem` (14px) | — | — |
| Capolettera | `.dropcap p:first-of-type::first-letter` | `4.1em`, float left, colore `--stamp` | 0.82 | — |

Regole globali: `h1,h2,h3 { text-wrap: balance }`, `p { text-wrap: pretty; margin: 0 0 1.1em }`, `hyphens: auto` sul corpo (disattivato su `.mono`), `text-rendering: optimizeLegibility`. Il mono non è mai maiuscolo/spaziato: tracking 0.

---

## 3. Spaziature, raggi e ombre

### Raggi
**Nessun border-radius** in tutto il progetto. Angoli vivi ovunque; gli input forzano esplicitamente `border-radius: 0`. Anche i marker della timeline sono quadrati (7×7px).

### Ombre
**Design flat**: nessun `box-shadow`. L'unica "ombra" è un `text-shadow` di alone color carta (`0 0 0.3em var(--paper), 0 0 0.6em var(--paper)…`) sui testi dell'hero, per staccarli dal disegno SVG sottostante. La profondità è data da filetti 1px e dal gradiente dell'header (`linear-gradient(var(--paper) 62%, transparent)`).

### Bordi
Sempre **1px** (`--ink`, `--rule` o `--f-line`). Unica eccezione: 2px per stato di focus (outline e bordo input).

### Container e griglia

| Token / elemento | Valore |
|---|---|
| `--gutter` (padding laterale) | `clamp(1.25rem, 4vw, 3rem)` |
| `--measure` (colonna di testo) | `36rem` |
| `.sheet` (contenitore pagina) | `max-width: 68rem`, centrato |
| Griglia `.sheet` ≥ 62rem | `11rem` (nota a margine) · `minmax(0, 36rem)` (testo) · `1fr`; `column-gap: 3rem` |
| Footer `.ft-in` | `max-width: 96rem` |
| Newsletter / tagline footer | `max-width: 28rem` / `30rem` |

Breakpoint usati: `40rem`, `52rem`, `62rem`, `72rem`.

### Ritmo verticale

| Elemento | Spazio |
|---|---|
| Sezione home `.section` | `padding-top: clamp(4rem, 9vw, 8rem)` |
| Blocco pagina interna `.block` | `margin-top: clamp(3rem, 7vw, 5.5rem)` |
| Testata pagina `.head` | `padding-top: clamp(8rem, 16vw, 12rem)` |
| Footer | `margin-top: clamp(6rem, 12vw, 11rem)`; gap interno `clamp(3rem, 6vw, 5.5rem)` |
| H1 → testo | `1.6rem` · H2 sezione → testo `1.6rem` · H2 blocco → testo `1.1rem` |
| Paragrafi | `1.1em` |
| Voce di elenco `.entries a` | `padding: 1.15rem 0` |
| Voce timeline | `padding: 0 0 2.2rem 1.6rem` |

---

## 4. Stile dei componenti chiave

### Header
Fisso, trasparente sopra l'hero; diventa "solido" con un gradiente carta→trasparente (transizione `opacity 0.25s`) dopo l'hero; passa a tema scuro sopra il footer. Logotipo testuale in Fraunces 500 (nessun logo grafico). Nav desktop in mono 13px, gap `2rem`, voce attiva sottolineata in `--stamp`. Sotto 52rem: `<details>` con `summary` "Menu" in mono dentro un riquadro bordato 1px; menu a tutto schermo con voci in serif `2.4rem`.

### Bottoni
Testo in **mono 14px**, `padding: 0.8rem 1.3rem`, bordo 1px, angoli vivi, nessuna ombra, nessuna transizione definita.
- **Secondario `.btn`**: trasparente, bordo e testo `--ink` → hover inverte (fondo ink, testo carta).
- **Primario `.btn.solid`**: fondo `--stamp`, testo `--paper` → hover fondo `--ink`.
- **Su scuro `.fbtn` / `.fbtn.solid`**: stessa struttura con `--f-ink` e `--f-red` (testo `#1d1b18` sul pieno).
- Affiancati con `gap: 0.8rem`, `flex-wrap: wrap`.

### Card
**Non esistono card** (nessun box con fondo, ombra o raggio). Il contenuto è organizzato come **elenco filettato** `.entries`: lista senza stile con `border-top` e `border-bottom: 1px solid var(--rule)` per voce; ogni voce è un link a griglia (`8.5rem 1fr` da 40rem) con metadato mono a sinistra e titolo serif 1.5rem a destra; hover colora il titolo in `--stamp`.

### Nota a margine (pattern "pagina-libro")
Ogni sezione ha un'etichetta `.margin.mono` nella colonna sinistra da 11rem (es. "Progetti", "In programma") e il testo nella colonna `--measure`.

### Timeline `.tl`
Linea verticale 1px `--ink` a sinistra; marker quadrato 7×7px `--stamp`; data in mono, titolo h3 1.45rem.

### Link
Colore ereditato, sottolineatura `1px` con `text-underline-offset: 0.2em`; hover `--stamp`. Nei link di navigazione e di elenco la sottolineatura è rimossa.

### Form
Senza riquadri: input/textarea trasparenti con solo bordo inferiore 1px `--ink`, testo serif 1.1rem; label in mono 13px `--ink-soft`; focus = bordo inferiore 2px `--stamp`. Newsletter nel footer: riga con bordo inferiore e bottone testuale mono.

### Badge
**Non presenti** nel codice. L'equivalente più vicino è l'etichetta mono colorata (`.mono.stamp`, es. "data da definire").

### Icone
**Nessuna libreria di icone**. Gli unici segni grafici sono caratteri tipografici (`↑` in "Torna su") e disegni SVG inline a tratto:
- curve di livello generate (`lib/contours.js`): stroke `0.8` (opacity 0.13) / `1.1` per le maggiori (opacity 0.26);
- tacche di griglia 1px, planimetria con tratteggio a 45°, quote e linea di misura in `--stamp` (1–1.4px);
- percorso nel footer: tratteggio `2 7` + linea `--f-red` 1.6px;
- tutti con `vector-effect: non-scaling-stroke` (spessore costante a ogni scala). Etichette SVG in mono 11px `--ink-soft`.

### Motion
Animazioni legate allo scroll (hero, footer) con smoothing via `requestAnimationFrame`; indicatore "scorri per entrare" con `ease-in-out 2.4s`. Tutto disattivato con `prefers-reduced-motion: reduce`.

---

## 5. Tono visivo e atmosfera

1. **Editoriale da libro/archivio.** Serif variabile protagonista anche nel corpo, colonna di lettura stretta (36rem), note a margine, capolettera, interlinea ampia (1.68). Si legge "con calma".
2. **Carta e inchiostro, un solo timbro.** Palette quasi monocroma calda (carta `#efe9db`, inchiostro `#1b1a17`) con un unico accento rosso `#b3321d` usato con parsimonia per azioni, stati e dettagli. Grana sottile sullo sfondo invece di superfici piatte digitali.
3. **Linguaggio cartografico/tecnico.** Curve di livello, tavole di rilievo, quote, coordinate e il mono come voce "da cartellino d'archivio" per metadati e interfaccia.
4. **Flat e squadrato.** Angoli vivi, filetti da 1px, nessuna ombra, nessuna card: la gerarchia nasce da tipografia e spazio, non da contenitori.
5. **Contrasto calmo e accessibile.** Focus visibile in rosso, skip link, menu senza JS (`<details>`), motion riducibile.

### Da evitare
- Border-radius, pillole, ombre portate, glassmorphism, gradienti decorativi.
- Card con sfondo/box: usare elenchi filettati.
- Un secondo colore d'accento o colori saturi; il rosso non va usato per grandi superfici oltre al bottone primario.
- Font sans-serif per i testi; mono in maiuscolo o con letter-spacing largo.
- Librerie di icone piene/colorate: preferire testo, tipografia o SVG a tratto sottile.
- Bianco puro `#fff` o nero puro `#000` (mai usati come colori visibili; `#000` compare solo in una mask-image dell'hero).
