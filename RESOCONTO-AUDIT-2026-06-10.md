# 🛡️ Resoconto audit e correzioni — 10 giugno 2026

> Esito dell'audit di sicurezza e qualità del codice eseguito il 9–10 giugno 2026,
> con l'elenco completo delle correzioni applicate e le istruzioni operative per
> le modifiche manuali future (tracce audio, deploy, verifiche).

## Esito dell'audit

**Nessuna falla di sicurezza sfruttabile e nessun bug critico.**

- App completamente statica: nessun input utente, nessun backend, nessun database.
- Astro fa escaping automatico dell'output; il JS client usa solo
  `textContent`/`dataset` — nessun `innerHTML`, `eval`, `set:html`, `document.write`.
- `npm audit`: **0 vulnerabilità** nelle dipendenze.
- I file `.DS_Store` presenti localmente in `public/` e `dist/` **non** sono
  tracciati da git e quindi non finiscono in produzione (Nixpacks builda dal repo).

Sono stati però individuati e corretti 2 bug di media gravità e 4 lievi.

---

## Correzioni applicate

### 1. `src/layouts/Layout.astro`

| Correzione | Gravità | Dettaglio |
|---|---|---|
| Doppio `page_view` al primo caricamento | **Media** | `gtag('config', …)` inviava un page_view automatico **più** quello del listener su `astro:page-load` (che scatta anche al load iniziale): ogni prima apertura era contata **due volte**. Aggiunto `send_page_view: false`. |
| Pre-buffering hardcoded | Lieve | La lista degli audio da pre-scaricare era l'array fisso `[1..8]`; ora è derivata da `audioguides.json`, quindi aggiungere/togliere tappe non richiede più di toccare il Layout. |
| Commento CSP aggiornato | — | Il clickjacking (`frame-ancestors`, non esprimibile via `<meta>`) ora è coperto da `X-Frame-Options` in `nginx.conf`. |

> ⚠️ **Nota per la rendicontazione**: con il fix del doppio page_view i numeri
> GA4 **caleranno** rispetto allo storico. Non è un calo di visite: è la fine del
> conteggio gonfiato (~2× sulle prime aperture). Annotarlo nei report al Comune.

> Nota tecnica: l'import di `audioguides.json` porta il bundle del Layout da ~7KB
> a ~21KB (include le descrizioni). È precachato dal service worker e compresso in
> rete: compromesso accettabile in cambio dell'eliminazione della lista hardcoded.

### 2. `src/components/AudioPlayer.astro`

| Correzione | Gravità | Dettaglio |
|---|---|---|
| Race condition su click rapidi | Lieve | La `fetch → blob` è asincrona: cliccando rapidamente "Ascolta" su due tappe vinceva la fetch che completava per ultima, anche se non era l'ultima cliccata (audio ≠ titolo mostrato). Ora la risposta viene scartata se nel frattempo la traccia corrente è cambiata. |
| Leak di object URL nel fallback | Lieve | Nel ramo di fallback (fetch fallita) il blob precedente non veniva mai revocato. Ora `URL.revokeObjectURL` è chiamato anche lì. |

### 3. `src/pages/tappa/[id].astro`

| Correzione | Gravità | Dettaglio |
|---|---|---|
| Scroll in cima a fine traccia | Lieve | A fine audio il reset di `currentTime` a 0 generava un `timeupdate` che riportava la trascrizione in cima con animazione. Lo scroll sincronizzato ora segue l'audio **solo mentre è in riproduzione**. |

### 4. `nginx.conf`

| Correzione | Gravità | Dettaglio |
|---|---|---|
| La regola no-cache per l'HTML non si applicava mai | **Media** | La location `~* \.html$` matchava solo URI che finiscono in `.html`, ma con `trailingSlash: 'always'` le pagine reali sono `/`, `/tappa/1/`, `/privacy/` → servite **senza alcun** `Cache-Control`. Funzionava solo perché Cloudflare di default non cacha l'HTML. Il no-cache è ora su `location /` (copre anche il manifest). |
| Header di sicurezza assenti | Media (hardening) | Aggiunti su tutte le location: `X-Frame-Options: SAMEORIGIN` (clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Ripetuti per blocco perché in nginx `add_header` **non** viene ereditato dove la location ne definisce altri. |

> ⚠️ **Al primo deploy dopo questa modifica** verificare che il container parta e
> che gli header arrivino (la sintassi non è stata validabile localmente —
> né nginx né Docker disponibili sulla macchina di sviluppo):
> ```bash
> curl -sI https://torreviva.fuorilemura.org/ | grep -iE 'x-frame|x-content|referrer|permissions|cache-control'
> ```

### 5. Documentazione allineata

- **README.md**: corretto lo snippet Workbox (gli mp3 NON sono in `globPatterns`
  ma in `runtimeCaching`); aggiunto l'avviso sulla sostituzione degli audio.
- **PROJECT_CONTEXT.md**: sezione sicurezza aggiornata (hardening applicato vs
  residuo), gotcha aggiornati.
- **docs/analytics_ga4.md**: documentato il perché di `send_page_view: false`.

---

## 🎧 Procedure manuali: gestire le tracce audio

La cache client degli mp3 è **CacheFirst senza scadenza** e con
`ignoreSearch: true` (`astro.config.ts`). Conseguenza fondamentale:

> **Un file mp3 già cachato con un certo nome non verrà MAI riscaricato.**
> Né il riuso dello stesso nome né il cache-busting via query string
> (`?v=2` viene ignorato) aggiornano chi ha già la cache.

### Sostituire un audio esistente
1. Salvare il nuovo file con un **nome diverso**: es. `public/audio/tappa3-v2.mp3`.
2. Aggiornare `audioSrc` (e `durata`, se cambiata) in `src/data/audioguides.json`.
3. Eliminare dal repo il vecchio `tappa3.mp3` (resta nelle cache dei client già
   serviti, ma è innocuo e non più referenziato).
4. Commit + push su `main` → deploy automatico via Coolify.

### Aggiungere una tappa
1. Aggiungere il file `public/audio/tappaN.mp3`.
2. Aggiungere la voce in `src/data/audioguides.json` (`id`, `titolo`,
   `descrizione`, `audioSrc`, `durata`, `posizione`).
3. Non serve altro: route `/tappa/N/`, griglia in home, navigazione prev/next e
   pre-buffering derivano tutti dal JSON.
4. Stampare il QR code che punta a `https://torreviva.fuorilemura.org/tappa/N/`
   (con lo slash finale: `trailingSlash: 'always'`).

### Rimuovere una tappa
1. Rimuovere la voce dal JSON ed eliminare l'mp3.
2. ⚠️ **L'URL `/tappa/N/` diventa un 404**: se esistono QR code fisici già
   stampati con quell'URL, vanno rimossi/ristampati, oppure va creata una regola
   di redirect su Cloudflare (Rules → Redirect Rules) verso la home.
3. La numerazione visiva usa l'`id` del JSON: gli id NON vengono ricalcolati.
   Per evitare "buchi" (1, 2, 4…) valutare se rinumerare — ma rinumerare cambia
   gli URL di TUTTI i QR successivi. In genere meglio lasciare il buco.

### Modificare solo i testi
- Titolo/descrizione/posizione: editare `src/data/audioguides.json` e basta.
- La trascrizione mostrata nella pagina tappa È la `descrizione` del JSON.

### Dopo ogni modifica
- Push su `main` → build automatica (2–4 minuti su ARM).
- Gli utenti con la PWA già installata ricevono l'aggiornamento alla successiva
  apertura **online** (auto-update del service worker).
- Se un asset sembra "non aggiornarsi" per i nuovi visitatori: purge della cache
  Cloudflare (è già successo con `/favicon.ico`).

---

## Suggerimenti residui (non applicati, facoltativi)

1. **[Bassa] Eliminare `'unsafe-inline'` da `script-src`** nella CSP: essendo il
   sito statico, lo snippet gtag inline può essere autorizzato con un hash
   `'sha256-…'` stabile, chiudendo l'ultima superficie XSS teorica.
2. **[Bassa] SRI sullo script GA**: non praticabile (gtag.js è servito dinamico
   da Google); limite noto e accettato.
3. **[Cosmetica] Titolo "Torre Vive"** nella pagina privacy (`src/pages/privacy.astro`)
   vs "Torre Angioina" altrove. Forse intenzionale (il dominio è `torreviva.…`):
   se non lo è, uniformare.
4. **[Pulizia] `PWAStatus.astro`** è codice morto (mai montato): rimuoverlo o
   montarlo, es. nel footer, per dare feedback "Disponibile offline" al visitatore.
5. **[Infra] Zaraz**: completare la disattivazione per `torreviva.fuorilemura.org`
   seguendo `DISATTIVARE-ZARAZ-TORREVIVA.md` (Configuration Rule per hostname),
   così spariscono le violazioni CSP in console e resta solo il GA4 del codice.
6. **[Infra] Cloudflare**: verificare che esista la Cache Rule **Bypass** su
   `/sw.js` e che Rocket Loader sia disattivato (vincoli critici per l'offline).
