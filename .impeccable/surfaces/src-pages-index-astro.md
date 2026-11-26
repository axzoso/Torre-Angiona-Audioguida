---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/tappa/[id].astro","src/components/AudioPlayer.astro"]
---

# Surface: audioguida Torre Viva (home percorso, pagina tappa, player persistente)

Mode: Operate (ascolto in loco, camminando). Build path: code-led (superficie Operate).

Audience/job: visitatore in loco con smartphone; arriva da QR, ascolta, legge, passa alla tappa successiva.
Constraints: identità pinned da brand-guidelines.md; ergonomia da ispirazioni2026.it; solo IT (predisposto EN); offline silenzioso; stato ascolto in localStorage.

## Direction contract

THESIS: l'audioguida come foglio d'archivio di Fuori le Mura — un percorso filettato su carta che si legge e si ascolta; rifiuta la griglia di card scure con glass e player-app arrotondato.

OWN-WORLD: carta #efe9db con grana, inchiostro #1b1a17/#5f594d, filetti rgba(27,26,23,.22), unico accento timbro #b3321d; Fraunces Variable (opsz) per titoli e testo, JetBrains Mono 400 per numeri, durate, stati, controlli; angoli vivi, nessuna ombra, SVG a tratto 1–1.4px non-scaling; player fisso in tema scuro #1d1b18/#efe9db/#ee7a5e.

STORY: il visitatore capisce subito dove si trova nel percorso (8 tappe, stato di ascolto), ascolta con un tocco, segue il racconto nella trascrizione, riprende da dove si era fermato e passa alla tappa successiva dal player o dal fondo pagina.

FIRST VIEWPORT: home — logotipo Torre Viva in header carta; titolo display "Torre Viva" con sottotitolo e disegno a curve di livello con percorso tratteggiato e 8 tacche quadrate numerate; sotto, riga "Riprendi" se presente, poi l'elenco filettato (mono numero/durata/stato a sinistra, titolo serif a destra). Tappa — "← Percorso" e "Tappa 03 di 08" mono; numero mono timbro, titolo H1, posizione; bottone pieno timbro "Ascolta · 1:38" a tutta larghezza come azione primaria above the fold; trascrizione con capolettera.
Signature interaction: segnalibro di ascolto — filetto verticale 1px a margine della trascrizione con marker quadrato 7×7 timbro che avanza col tempo dell'audio; nella home le tacche del percorso si colorano per le tappe ascoltate.
Motion grammar: nessuna entrata decorativa; solo transizioni di stato brevi (colore, marker) e scroll sincronizzato; tutto disattivato con prefers-reduced-motion.

FORM: direzione pinned dall'utente (brand-guidelines.md + ergonomia ispirazioni2026.it); seed: none (pinned) — "Applica rigorosamente il sistema visivo di Fuori le Mura" / "Prendi spunto da questo sito … solo per l'ergonomia e la struttura".

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
