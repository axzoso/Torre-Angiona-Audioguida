# Disattivare Cloudflare Zaraz (e RUM) solo per `torreviva.fuorilemura.org`

> Obiettivo: togliere i tracker iniettati all'edge **solo** sull'audioguida
> (`torreviva.fuorilemura.org`), mantenendo Zaraz attivo per il sito WordPress
> separato `fuorilemura.org`. Zaraz è una configurazione **per-zona**: non va
> spento del tutto, va **scopato per hostname**.

## Contesto (perché)

Su tutta la zona `fuorilemura.org` è attivo **Cloudflare Zaraz**, che inietta
all'edge tre tracker di terze parti — **non presenti nel codice** dell'audioguida —
tutti bloccati (correttamente) dalla CSP `<meta>` in `src/layouts/Layout.astro`:

| Tracker iniettato | Cosa è | Errore in console |
|---|---|---|
| `static.cloudflareinsights.com/beacon.min.js` | Cloudflare Web Analytics / RUM | violazione `script-src` |
| `eu-assets.i.posthog.com/static/array.js` | PostHog (usa cookie) | violazione `script-src` |
| GA4 `G-NFPY1X1K1M` → `stats.g.doubleclick.net` | Secondo GA4 con ad-tracking | violazione `connect-src` |

L'audioguida usa il **proprio GA4 `G-4GFKQ1B6XE`** (snippet temprato e cookieless
in `Layout.astro`), che è già permesso dalla CSP e funziona. Vogliamo quindi
lasciare *solo* quello sul sottodominio.

---

## Metodo consigliato — Configuration Rule (per hostname)

È il modo più pulito e affidabile: una regola di configurazione che spegne Zaraz
(e il RUM/beacon) per le richieste a quell'hostname, senza toccare il resto della zona.

1. Dashboard Cloudflare → seleziona la zona **`fuorilemura.org`**.
2. Menu laterale: **Rules → Configuration Rules** → **Create rule**.
3. **Rule name:** `Disattiva Zaraz+RUM su torreviva`.
4. **When incoming requests match** → *Custom filter expression*:
   - Field: **Hostname** · Operator: **equals** · Value: `torreviva.fuorilemura.org`
   - (espressione equivalente: `(http.host eq "torreviva.fuorilemura.org")`)
5. **Then the settings are** → attiva e imposta su **Off**:
   - **Zaraz** → `Off`
   - **Real User Monitoring (RUM)** → `Off`  *(toglie il beacon `cloudflareinsights`)*
6. **Deploy**.

> Nota: i nomi esatti dei toggle possono variare leggermente con gli aggiornamenti
> UI di Cloudflare. Cerca le voci "Zaraz" e "Real User Monitoring" / "RUM"
> nell'elenco delle impostazioni della regola.

Effetto: su `fuorilemura.org` (WordPress) Zaraz resta invariato; su
`torreviva.fuorilemura.org` non viene più iniettato nulla.

---

## Metodo alternativo — Trigger/Loading rules dentro Zaraz

Se preferisci agire dentro Zaraz (utile se vuoi escludere solo *alcuni* tool e
non tutto Zaraz):

1. Dashboard → zona `fuorilemura.org` → **Zaraz** (sezione *Tag Management*).
2. Apri **Triggers** (o, nelle UI più recenti, le *Loading rules* del singolo tool).
3. Sul trigger usato dagli strumenti (di solito **Pageview**) aggiungi una
   **regola di match** che escluda il sottodominio:
   - Variable/Field: **Host** (`{{ system.device.url }}` → host, o il campo "Hostname")
   - Operator: **does not equal**
   - Value: `torreviva.fuorilemura.org`
4. In alternativa, sui singoli tool (PostHog, GA4 `G-NFPY1X1K1M`) imposta che
   l'azione *Pageview* **non** scatti quando l'host è `torreviva.fuorilemura.org`.
5. Salva e attendi la propagazione.

> Questo metodo non rimuove il beacon **RUM/Web Analytics**, che non è gestito da
> Zaraz: per quello usa comunque la Configuration Rule del metodo consigliato
> (toggle *Real User Monitoring → Off*) oppure disattiva l'auto-injection in
> **Analytics & Logs → Web Analytics**.

---

## Verifica

Dopo il deploy della regola:

1. Apri `https://torreviva.fuorilemura.org/` in **incognito** (chiudi prima tutte
   le finestre incognito), DevTools → **Console**.
2. **Atteso:** nessun errore CSP da `cloudflareinsights`, `posthog`, `doubleclick`.
3. **Atteso:** il GA4 del codice (`G-4GFKQ1B6XE`) continua a inviare i pageview
   (lo vedi in GA4 → *Realtime*, o in DevTools → Network filtrando `collect`).
4. Controllo rapido da terminale (lo script Zaraz NON deve più comparire):
   ```bash
   curl -s -A "Mozilla/5.0" https://torreviva.fuorilemura.org/ | grep -i "zaraz\|cloudflareinsights" || echo "OK: nessuna injection"
   ```
5. Verifica che il WordPress sia intatto: `https://fuorilemura.org/` deve avere
   ancora Zaraz attivo.

## Rollback

Disattiva o elimina la **Configuration Rule** creata: Zaraz/RUM tornano attivi
sul sottodominio come prima.
