# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitatori della Torre Angioina di San Marco Argentano (CS) che percorrono il monumento a piedi, con lo smartphone in mano o in tasca. Arrivano a ogni tappa scansionando il QR code posto sul punto di interesse, ascoltano il racconto e leggono la trascrizione. Uso in loco, spesso con connessione debole o assente, luce naturale variabile (cortile, sale interne, terrazza panoramica).

## Product Purpose

Audioguida digitale "Torre Viva": 8 tappe narrate in prima persona da Raynaldo di Sancti Marci, fabbro e scutifer della Torre, che accompagna il visitatore dentro una torre "viva", abitata dalla memoria di chi l'ha difesa. Successo = il visitatore ascolta le tappe in sequenza senza attriti, anche offline, e capisce dove si trova nel percorso.

## Positioning

Un racconto in prima persona legato fisicamente ai luoghi della Torre, curato dall'Associazione Fuori le Mura con il Comune di San Marco Argentano, utilizzabile senza installare app e senza connessione.

## Operating Context

- Accesso via QR code a `/tappa/<n>/`; home con l'elenco del percorso.
- Ascolto in movimento: il player resta attivo cambiando pagina; il testo scorre con l'audio.
- PWA statica offline-first (Astro static + Workbox); gli audio vengono pre-scaricati in silenzio in background.
- Dominio di produzione: torreviva.fuorilemura.org (Cloudflare Workers, static assets).

## Capabilities and Constraints

- Contenuti: unica fonte `src/data/audioguides.json` (id, titolo, descrizione/trascrizione, audioSrc, durata, posizione).
- Lingua: solo italiano oggi; struttura da tenere predisposta per l'inglese (testi e audio EN non esistono: non inventarli).
- Preparazione offline: resta silenziosa, nessun blocco esplicito di download in UI (decisione 2026-11-26).
- Stato di ascolto (tappe ascoltate, punto di ripresa) salvato solo in localStorage sul dispositivo; nessun invio a server.
- Nessun backend, nessun account, nessun input utente. CSP restrittiva in `Layout.astro` (font solo `'self'`).
- `trailingSlash: 'always'` obbligatorio; per sostituire un audio va rinominato il file.
- GA4 anonimo con eventi custom (`play_audio`, `audio_pause`, `audio_complete`) da preservare.

## Brand Commitments

- Nome mostrato: **Torre Viva** (sottotitolo Torre Angioina · San Marco Argentano), firmato Associazione **Fuori le Mura**.
- Identità visiva vincolante: `brand-guidelines.md` (sistema Fuori le Mura — carta e inchiostro, un solo accento rosso timbro, Fraunces + JetBrains Mono, flat, angoli vivi, elenchi filettati, SVG a tratto sottile in stile rilievo/archivio).
- Ergonomia di riferimento (solo funzionale, non visiva): audioguida "Ispirazioni" del MArRC, ispirazioni2026.it.

## Evidence on Hand

- 8 tappe con trascrizioni complete e audio in `public/audio/tappa1-8.mp3`.
- Nessuna fotografia del monumento nel repository; nessuna pianta verificata della Torre (non disegnarne una come se fosse reale).

## Product Principles

1. Ascoltare prima di tutto: l'azione di ascolto e il player sono sempre a un tocco.
2. Funziona senza rete: niente che dipenda dalla connessione durante la visita.
3. Sapere dove sono: numero di tappa, stato di ascolto e tappa successiva sempre leggibili.
4. Lettura calma: la trascrizione è un testo da leggere, non un riempitivo.

## Accessibility & Inclusion

Target touch ampi per uso camminando; contrasto alto anche in esterno; focus visibile; `prefers-reduced-motion` rispettato; player controllabile da schermata di blocco (Media Session).
