# 📊 Tracciamento Analytics con Google Analytics 4 (GA4)

Questo documento descrive l'architettura di tracciamento integrata nell'audioguida della Torre Angioina, l'elenco completo degli eventi registrati su GA4 e la procedura dettagliata per configurare le dimensioni e le metriche personalizzate sulla dashboard di Google Analytics.

---

## 🛠️ Architettura di Tracciamento

L'applicazione utilizza l'SDK globale `gtag.js` configurato in modalità **Privacy-First (Strictly Anonymous)** all'interno del [Layout.astro](file:///c:/Users/claan/Documents/github/audioguida_torre/src/layouts/Layout.astro). 
Per garantire la conformità al GDPR senza la necessità di un banner di consenso invasivo, la configurazione di GA4:
* Anonimizza gli indirizzi IP (`anonymize_ip: true`).
* Disabilita la profilazione pubblicitaria e i segnali cross-device (`allow_google_signals: false`, `allow_ad_personalization_signals: false`).
* Forza il trattamento restrittivo dei dati (`restricted_data_processing: true`).
* Impedisce l'uso di cookie persistenti o local storage per scopi di tracciamento (`client_storage: 'none'`).

Il tracciamento dei cambi di pagina è compatibile con le transizioni di Astro (`ClientRouter`) tramite l'ascolto dell'evento `astro:page-load`.

---

## 📈 Elenco degli Eventi Tracciati

Di seguito sono elencati gli eventi registrati dall'applicazione.

### 1. Eventi Standard di Navigazione

| Evento | Innesco | Parametri Inviati | Descrizione |
|---|---|---|---|
| `page_view` | Caricamento iniziale e cambio pagina tramite ClientRouter. | `page_title`, `page_location`, `page_path` | Misura le visite alle pagine (Home, Tappe, Privacy). |

### 2. Eventi Custom del Player Audio (Già Implementati nel Codice)

Questi eventi sono integrati nel componente del player persistente [AudioPlayer.astro](file:///c:/Users/claan/Documents/github/audioguida_torre/src/components/AudioPlayer.astro).

| Evento | Innesco | Parametri Inviati | Descrizione |
|---|---|---|---|
| `play_audio` | L'utente seleziona una tappa e avvia la riproduzione. | `audio_title` (testo)<br>`audio_id` (numero)<br>`audio_src` (testo) | Misura quale audioguida viene ascoltata e quante volte viene scelta. |
| `audio_pause` | L'utente mette in pausa l'ascolto. | `audio_title` (testo)<br>`audio_id` (numero)<br>`audio_position` (numero/secondi) | Identifica a quale secondo esatto l'utente sceglie di mettere in pausa l'audio. |
| `audio_complete` | L'audioguida della tappa giunge al termine. | `audio_title` (testo)<br>`audio_id` (numero)<br>`audio_src` (testo) | Consente di calcolare il tasso di completamento (fidelizzazione/ritenzione) della traccia. |

---

## ⚙️ Configurazione su Google Analytics 4 (GA4)

I parametri personalizzati inviati con gli eventi custom (come `audio_title`, `audio_id` ed `audio_position`) non sono visibili nei report di GA4 per impostazione predefinita. È necessario registrarli nel pannello di amministrazione.

### Fase 1: Creare le Dimensioni Personalizzate (Custom Dimensions)
Serve per abilitare i parametri descrittivi testuali e gli ID nei report.

1. Accedi a [Google Analytics](https://analytics.google.com/) e seleziona la proprietà corretta.
2. In basso a sinistra, clicca sull'icona dell'ingranaggio **Amministrazione** (Admin).
3. Sotto la sezione *Visualizzazione dei dati* (Data display), fai clic su **Definizioni personalizzate** (Custom definitions).
4. Assicurati che sia selezionata la scheda **Dimensioni personalizzate** e clicca su **Crea dimensioni personalizzate**.
5. Registra i seguenti tre parametri (uno alla volta):

| Nome dimensione | Ambito (Scope) | Descrizione | Parametro evento (Event Parameter) |
| :--- | :--- | :--- | :--- |
| `Titolo Audio` | `Evento` | Titolo descrittivo della traccia audio | `audio_title` |
| `ID Audio` | `Evento` | Numero identificativo della tappa (1-8) | `audio_id` |
| `Sorgente Audio` | `Evento` | Percorso relativo o assoluto del file MP3 | `audio_src` |

6. Clicca su **Salva** dopo la configurazione di ciascuna dimensione.

### Fase 2: Creare la Metrica Personalizzata (Custom Metric)
Serve per registrare la posizione di pausa (`audio_position`) in formato numerico quantificabile.

1. All'interno di **Definizioni personalizzate**, seleziona in alto la scheda **Metriche personalizzate** (Custom metrics).
2. Clicca su **Crea metriche personalizzate**.
3. Compila i campi in questo modo:
   * **Nome metrica:** `Posizione Pausa Audio`
   * **Ambito (Scope):** `Evento`
   * **Descrizione:** `Secondo esatto in cui l'utente ha messo in pausa la traccia`
   * **Parametro evento:** `audio_position`
   * **Unità di misura:** `Secondi` (oppure lascia *Standard / Numero intero*)
4. Clicca su **Salva**.

---

## 📊 Creazione dei Report Personalizzati (Esplorazioni)

Dopo circa 24-48 ore dall'attivazione dei tracciamenti e dalla registrazione delle definizioni personalizzate, potrai creare un report per analizzare quale tappa è stata avviata più volte.

### Creare il report "Classifica Tracce Avviate" in Esplora:
1. Nel menu a sinistra di GA4, fai clic su **Esplora** (Explore).
2. Crea un'analisi vuota (pulsante `+` **Vuoto**).
3. Configura le **Variabili** (colonna di sinistra):
   * Di fianco a **Dimensioni**, clicca sul `+` ed importa la dimensione personalizzata **Titolo Audio** (creata nella Fase 1).
   * Di fianco a **Metriche**, clicca sul `+` ed importa la metrica standard **Conteggio eventi** (Event count).
4. Configura le **Impostazioni scheda** (colonna centrale):
   * Trascina la dimensione **Titolo Audio** nella casella **Righe** (Rows).
   * Trascina la metrica **Conteggio eventi** nella casella **Valori** (Values).
5. Aggiungi un **Filtro** (in fondo alla colonna delle impostazioni):
   * Imposta il filtro su: `Nome evento` **corrisponde esattamente a** `play_audio`.
6. Ora vedrai una tabella ordinata che elenca ogni traccia e il numero preciso di volte in cui è stata avviata!

### Creare il report "Tasso di Completamento":
1. Crea una nuova analisi in **Esplora**.
2. Importa le dimensioni **Titolo Audio** e **Nome evento**.
3. Importa la metrica **Conteggio eventi**.
4. Inserisci la dimensione **Titolo Audio** nelle **Righe**, **Nome evento** nelle **Colonne** (Columns) e **Conteggio eventi** nei **Valori**.
5. Applica un filtro per includere solo gli eventi `play_audio` e `audio_complete`.
6. Questo ti mostrerà per ogni tappa quanti hanno avviato l'audio (`play_audio`) e quanti lo hanno finito (`audio_complete`), permettendoti di calcolare istantaneamente la percentuale di abbandono.
