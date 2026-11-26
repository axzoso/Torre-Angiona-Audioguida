---
name: Torre Viva
description: Audioguida della Torre Angioina di San Marco Argentano nel sistema visivo Fuori le Mura, carta, inchiostro e un solo timbro rosso.
colors:
  paper: "#efe9db"
  ink: "#1b1a17"
  ink-soft: "#5f594d"
  stamp: "#b3321d"
  rule: "rgba(27, 26, 23, 0.22)"
  night: "#1d1b18"
  night-ink: "#efe9db"
  night-soft: "#b7ae9a"
  night-line: "rgba(239, 233, 219, 0.2)"
  night-stamp: "#ee7a5e"
typography:
  display:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(3.4rem, 1rem + 7.4vw, 7.4rem)"
    fontWeight: 450
    lineHeight: 0.98
    letterSpacing: "-0.03em"
    fontVariation: "'opsz' 144"
  headline:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(2.4rem, 1.2rem + 5vw, 5rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.03em"
    fontVariation: "'opsz' 144"
  section:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3.2rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.015em"
    fontVariation: "'opsz' 144"
  title:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    fontVariation: "'opsz' 72"
  lead:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "1.25em"
    fontWeight: 400
    lineHeight: 1.35
    fontVariation: "'opsz' 100"
  body:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(1.1rem, 1.02rem + 0.35vw, 1.28rem)"
    fontWeight: 400
    lineHeight: 1.68
    fontVariation: "'opsz' 14"
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
    fontFeature: "tnum"
  control:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  none: "0"
spacing:
  gutter: "clamp(1.25rem, 4vw, 3rem)"
  measure: "36rem"
  sheet: "68rem"
  margin-col: "11rem"
  column-gap: "3rem"
  tap: "3rem"
  row-pad: "1.15rem"
  paragraph: "1.1em"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.3rem"
    height: "{spacing.tap}"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-solid:
    backgroundColor: "{colors.stamp}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.3rem"
    height: "{spacing.tap}"
  button-solid-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-listen:
    backgroundColor: "{colors.stamp}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.25rem"
    height: "3.75rem"
    width: "100%"
  button-listen-playing:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  entry-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "1.15rem 0"
    height: "4.5rem"
  resume-action:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1rem 1.1rem"
  resume-action-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  player-bar:
    backgroundColor: "{colors.night}"
    textColor: "{colors.night-ink}"
    width: "40rem"
  player-play:
    backgroundColor: "{colors.night-stamp}"
    textColor: "{colors.night}"
    rounded: "{rounded.none}"
    size: "3.5rem"
  player-play-hover:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.night}"
  player-control:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    typography: "{typography.control}"
    height: "{spacing.tap}"
  footer:
    backgroundColor: "{colors.night}"
    textColor: "{colors.night-ink}"
---

# Design System: Torre Viva

## Overview

**Creative North Star: "Il foglio d'archivio"**

Torre Viva è un foglio d'archivio di Fuori le Mura che si legge e si ascolta: carta grezza con grana, inchiostro caldo, un solo timbro rosso, filetti da un pixel e disegni a tratto sottile in stile rilievo. Il sistema è vincolato da `brand-guidelines.md` (identità Fuori le Mura) e lo applica a un'audioguida usata camminando, con lo smartphone in mano: le misure di lettura restano quelle di un libro, le aree toccabili quelle di un'app.

La gerarchia nasce dalla tipografia e dallo spazio, mai da contenitori. Il serif variabile Fraunces porta titoli e testo; JetBrains Mono è la voce da cartellino d'archivio per numeri di tappa, durate, stati e controlli. Le superfici sono piatte e squadrate; la profondità esiste solo come tema notte locale (footer e player fisso) e come gradiente di dissolvenza dell'header.

Il movimento è solo di stato: colore, avanzamento del segnalibro, ingresso del player. Nessuna entrata decorativa; tutto si spegne con `prefers-reduced-motion`.

**Key Characteristics:**
- Carta `#efe9db` con rumore SVG (alpha 0.055, tile 240px), mai colore piatto, mai bianco puro.
- Un solo accento: timbro rosso sulla carta, la sua versione chiara sul tema notte.
- Fraunces per tutto il testo, JetBrains Mono 400 per ogni dato e controllo, tracking 0, mai maiuscolo.
- Angoli vivi, bordi da 1px, nessuna ombra, nessuna card di contenuto: elenchi filettati. Solo le azioni possono essere riquadri bordati (Riprendi, Precedente/Successiva).
- SVG a tratto 0.8–1.4px con `vector-effect: non-scaling-stroke`, marker quadrati 7×7.
- Aree toccabili minime da 48px (`--tap`).

## Colors

Palette quasi monocroma calda, carta e inchiostro, con un timbro rosso che segna azione e stato.

### Primary
- **Timbro** (stamp): l'unico accento sulla carta. Bottone primario pieno "Ascolta", capolettera della trascrizione, numero della tappa in testata, hover di link e righe, focus ring (2px), selezione del testo, marker di stato ascoltato/in ascolto, tratto percorso completato nel disegno, bordo, velo al 7% ed etichetta della card "Successiva" (piena timbro all'hover).
- **Timbro notte** (night-stamp): la versione chiara del timbro sul tema scuro. Bottone play del player, barra di avanzamento, numero di tappa nel player, hover nel footer, bordo della "tappa successiva" a fine traccia.

### Neutral
- **Carta** (paper): sfondo pagina, testo sui bottoni pieni, riempimento dei marker non attivi, `theme-color` e colore di sfondo del manifest.
- **Inchiostro** (ink): testo principale, bordi dei bottoni e dell'azione "Riprendi", tratti SVG, fondo di hover dei bottoni e stato "in riproduzione" del bottone Ascolta.
- **Inchiostro tenue** (ink-soft): metadati mono, posizione della tappa, frecce di riga a riposo, didascalie e numeri nei disegni.
- **Filetto** (rule): divisori degli elenchi, linea verticale del segnalibro di ascolto.
- **Notte** (night): fondo del footer e del player fisso.
- **Carta notte** (night-ink): testo e cursore della barra sul tema scuro.
- **Tenue notte** (night-soft): testo secondario, tempi e controlli disabilitati sul tema scuro.
- **Filetto notte** (night-line): divisori e traccia della barra sul tema scuro.

### Named Rules
**La regola del timbro unico.** Esiste un solo colore d'accento. Sulla carta è il timbro, sul tema notte il timbro notte; mai entrambi nella stessa superficie, mai un secondo colore saturo. Il rosso copre una grande area solo nel bottone primario e nel play del player.

**La regola della carta viva.** Lo sfondo è sempre carta con grana; nessun `#fff` o `#000` visibile.

## Typography

**Display Font:** Fraunces Variable (asse `opsz`, roman e italic) con Georgia
**Body Font:** Fraunces Variable con Georgia
**Label/Mono Font:** JetBrains Mono 400 con ui-monospace

**Character:** Un serif editoriale a dimensione ottica che passa dal titolo monumentale (opsz 144) al testo di lettura calmo (opsz 14), accompagnato da un mono asciutto che parla come l'etichetta di un reperto.

### Hierarchy
- **Display** (450, clamp 3.4–7.4rem, 0.98, -0.03em, opsz 144): solo il nome dell'audioguida in home; lo stesso registro (450, fino a 8.5rem, 0.95, -0.035em) firma "Fuori le Mura" nel footer.
- **Headline** (500, clamp 2.4–5rem, 1.08, -0.03em, opsz 144): H1 della pagina tappa e delle pagine documento.
- **Section** (500, clamp 2–3.2rem, 1.08, -0.015em): H2 di sezione, es. "Percorso"; H2 interni ai documenti scendono a clamp 1.5–2.1rem.
- **Title** (500, 1.5rem, 1.2, opsz 72): titolo nelle righe dell'elenco, nell'azione "Riprendi" e nelle card precedente/successiva (sotto i 40rem, dove le card sono strette, scende alla misura del corpo); logotipo header a 1.35rem, titolo nel player a 1.05rem (opsz 36).
- **Lead** (400 italic, 1.25em, 1.35, opsz 100): sottotitolo della home; nei documenti il lead è roman, 1.5 di interlinea, opsz 36.
- **Body** (400, clamp 1.1–1.28rem, 1.68, opsz 14): trascrizioni e testo, colonna `--measure` (36rem), `hyphens: auto`, `text-wrap: pretty`, paragrafi a 1.1em.
- **Label** (mono 400, 0.8125rem, 1.55, tracking 0, cifre tabulari): numeri e durate delle tappe, stati, note a margine, contesto in header, didascalie. Nei disegni SVG il mono scende a 11px.
- **Control** (mono 400, 0.875rem): testo di bottoni, link "← Percorso", controlli del player. Il bottone Ascolta sale a 1rem; il numero di tappa in testata a 2.25rem in timbro.

### Named Rules
**La regola delle due voci.** Il serif racconta, il mono misura. Ogni numero, durata, stato o controllo è mono; ogni frase da leggere è serif. Mai un sans-serif.

**La regola del cartellino.** Il mono è sempre minuscolo o in caso naturale, tracking 0, un solo peso (400). Mai maiuscoletto spaziato.

**La regola del capolettera.** Il primo paragrafo della trascrizione apre con un capolettera Fraunces 500 a 4.1em, opsz 144, in timbro.

## Layout

Il contenitore `.sheet` è largo al massimo 68rem, centrato, con margine laterale `--gutter` (clamp 1.25–3rem). Da 62rem entra il pattern "pagina-libro": griglia a tre colonne, nota a margine da 11rem, colonna di testo `minmax(0, 36rem)`, resto libero, `column-gap` 3rem. Sotto 62rem la nota a margine si impila sopra il testo o scompare quando duplica informazioni già in testata.

L'elenco delle tappe usa righe a griglia `3.75rem | 1fr | auto` (da 40rem `8.5rem | 1fr | auto`): metadato mono a sinistra, titolo e posizione serif al centro, freccia a destra; righe alte almeno 4.5rem con padding verticale 1.15rem. La home da 52rem affianca testo e disegno del percorso (1.1fr / 1fr, allineati in basso); sotto, il disegno è centrato a max 19rem.

Il ritmo verticale è fluido: sezioni separate da clamp 2.5–5rem, footer staccato da clamp 5–9rem. Ogni area toccabile è alta almeno `--tap` (3rem); l'azione primaria Ascolta è a tutta larghezza, alta 3.75rem, sopra la piega. Quando il player è visibile il body riceve `padding-bottom` pari alla sua altezza e lo scroll-padding ne tiene conto. Header e player rispettano le safe area (`env(safe-area-inset-*)`).

Breakpoint osservati: 40rem, 52rem, 62rem.

## Elevation & Depth

Il sistema è piatto: nessun `box-shadow`, nessun `text-shadow`, nessun glass. La profondità si costruisce in tre soli modi: filetti da 1px, il gradiente dell'header sticky (carta piena fino al 62%, poi trasparente) che dissolve il contenuto che vi scorre sotto, e il tema notte locale che stacca footer e player dalla carta.

### Named Rules
**La regola del foglio piatto.** Niente si solleva dalla carta. Uno strato si distingue per filetto o per inversione carta/notte, mai per ombra.

## Shapes

Angoli vivi ovunque (`border-radius: 0`, forzato anche su bottoni e cursore della barra). Bordi sempre da 1px (inchiostro, filetto o filetto notte); l'unica eccezione è il focus a 2px. Il segno ricorrente è il quadrato: tacche delle tappe nel disegno, marker di stato 7×7 nell'elenco, segnalibro 7×7 nella trascrizione, cursore 12×12 della barra. I disegni sono SVG a tratto (curve di livello 0.8px a opacità 0.13, maggiori 1.1px a 0.26; percorso tratteggiato `2 7` a 1.2px; tratto completato 1.4px in timbro), sempre `non-scaling-stroke`. Le icone di play e pausa sono SVG a tratto 1.4px su viewBox 16, mai riempite; le frecce di navigazione (→ ←) sono caratteri tipografici.

## Components

### Buttons
Tattili e asciutti: testo mono, bordo da 1px, angoli vivi, nessuna ombra.
- **Shape:** angoli vivi (0), altezza minima 3rem.
- **Outline:** trasparente, bordo e testo inchiostro, padding 0.8rem 1.3rem; hover inverte (fondo inchiostro, testo carta).
- **Solid (primario):** fondo e bordo timbro, testo carta; hover fondo e bordo inchiostro.
- **Ascolta:** variante solid a tutta larghezza, alta 3.75rem, icona play/pausa a tratto a sinistra, etichetta allineata a sinistra e durata mono a destra ("Ascolta · 1:38"). In riproduzione passa a fondo inchiostro e mostra la pausa.
- **Focus:** contorno 2px timbro, offset 3px (sul tema notte: timbro notte).

### Elenco filettato (righe tappa)
- **Struttura:** lista senza stile con filetto sopra e sotto ogni voce; ogni voce è un unico link a griglia.
- **Contenuto:** numero e durata mono a sinistra, titolo Title e posizione serif 0.95rem in inchiostro tenue, stato mono con marker quadrato 7×7, freccia → in inchiostro tenue.
- **Stati:** hover e tocco colorano titolo, numero e freccia in timbro; la freccia scorre di 3px (0.2s ease-out). Stato "ascoltata": testo inchiostro, marker pieno timbro; "in ascolto": testo e marker timbro.

### Precedente / successiva
Due card affiancate in fondo alla tappa, sempre sulla stessa riga (griglia a due colonne uguali, gap 0.5rem): la direzione è il lato. Ogni card è un unico link, padding 0.85rem 0.9rem 1rem, alta almeno 6.75rem; in alto l'etichetta di funzione mono con la freccia, in basso il titolo con il numero mono.
- **Precedente:** colonna sinistra, "← Precedente" in inchiostro tenue, bordo 1px filetto; hover bordo inchiostro e freccia che scorre a sinistra.
- **Successiva:** sempre nella colonna destra (alla prima tappa la sinistra resta vuota), allineata a destra a specchio, "Successiva →" ed etichetta/numero in timbro, bordo 1px timbro e velo timbro al 7% (`color-mix`); hover pieno timbro con testo carta e freccia che scorre a destra. All'ultima tappa diventa "Fine →" con "Torna al percorso".
- Gli hover valgono solo con `(hover: hover)`, per non restare accesi dopo il tocco.

### Riprendi
L'unica area bordata della home, perché è un'azione: bordo 1px inchiostro, padding 1rem 1.1rem, larga al massimo 36rem. Etichetta mono timbro e tempo mono tenue sulla prima riga, titolo della tappa sotto. Hover inverte su inchiostro, con etichetta in timbro notte e tempo in tenue notte. Nascosta quando non c'è un punto di ripresa.

### Navigation
- **Header:** sticky, carta con dissolvenza verso il basso, alto 4rem; logotipo testuale Fraunces 500 1.35rem a sinistra, contesto mono tenue a destra ("Fuori le Mura" in home, "Tappa 03 di 08" in tappa).
- **Ritorno:** link mono "← Percorso" in inchiostro tenue, alto 3rem, hover timbro.
- **Skip link:** blocco inchiostro con testo carta mono, visibile solo al focus.

### Player fisso
Barra in tema notte ancorata al fondo, filetto notte in alto, contenuto centrato a max 40rem. Entra salendo (0.35s, `cubic-bezier(0.16, 1, 0.3, 1)`) solo quando c'è un audio. Dall'alto: barra di avanzamento sottile (traccia 2px, area di tocco 2.75rem, cursore quadrato 12px carta notte, avanzamento timbro notte); riga con numero mono timbro notte, titolo serif troncato, tempi mono tabulari; cinque controlli (velocità, −15, play, +15, tappa successiva). Il play è un quadrato pieno 3.5rem in timbro notte con icona a tratto, hover carta notte. A fine traccia il controllo "tappa successiva" si incornicia in timbro notte e diventa l'azione evidente.

### Footer
Tema notte, nome "Fuori le Mura" in display 450, tagline in tenue notte, link in elenco filettato notte con righe da 3rem, crediti mono.

### Segnalibro di ascolto (signature)
A margine della trascrizione corre un filetto verticale da 1px; un marker quadrato 7×7 scende lungo di esso in proporzione al tempo dell'audio (transizione `top` 0.4s lineare). A riposo è carta bordata inchiostro, durante l'ascolto pieno timbro.

### Disegno del percorso (signature)
Curve di livello generate, tacche di griglia sul bordo, percorso tratteggiato e otto tacche quadrate numerate in mono 11px. Le tappe ascoltate si riempiono di timbro, la tappa corrente ha bordo timbro 1.4px, il tratto completato si traccia in timbro (0.6s). Didascalia mono tenue 0.75rem: è uno schema, non una pianta.

## Do's and Don'ts

### Do:
- **Do** usare la carta con grana come unico sfondo chiaro e il tema notte solo per footer e player.
- **Do** riservare il timbro ad azione, stato e dettaglio: bottone primario, capolettera, numero di tappa, marker, focus, hover.
- **Do** scrivere ogni numero, durata, stato e controllo in JetBrains Mono 400 con cifre tabulari, tracking 0.
- **Do** organizzare i contenuti in elenchi filettati da 1px con metadato mono a sinistra e titolo serif.
- **Do** tenere ogni area toccabile alta almeno 3rem e l'azione di ascolto a tutta larghezza sopra la piega.
- **Do** disegnare in SVG a tratto 0.8–1.4px con `vector-effect: non-scaling-stroke` e marker quadrati 7×7.
- **Do** limitare il movimento a transizioni di stato brevi (0.2–0.6s) e spegnerlo con `prefers-reduced-motion`.

### Don't:
- **Don't** usare border-radius, pillole, ombre portate, glassmorphism o gradienti decorativi (l'unico gradiente ammesso è la dissolvenza dell'header).
- **Don't** introdurre card di contenuto con fondo o riquadro: i riquadri bordati sono solo azioni (Riprendi, Precedente/Successiva) e solo la "Successiva" porta il velo timbro.
- **Don't** aggiungere un secondo colore d'accento né colori saturi; non stendere il rosso su grandi superfici oltre al bottone primario e al play.
- **Don't** usare font sans-serif, né il mono in maiuscolo o con letter-spacing largo.
- **Don't** mettere etichette mono decorative sopra i titoli: il mono sopra un titolo compare solo come numero di tappa o come etichetta di funzione dentro una riga-azione.
- **Don't** usare librerie di icone piene o colorate, né `#fff` o `#000` visibili.
- **Don't** disegnare piante o vedute della Torre come se fossero rilievi reali: i disegni sono schemi dichiarati.
