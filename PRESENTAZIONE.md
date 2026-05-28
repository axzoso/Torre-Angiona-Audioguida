# Torre Angioina — Audioguida Digitale
### Una presentazione del progetto in parole semplici

---

## Cos'è, in breve

È un'**audioguida digitale** per la Torre Angioina di San Marco Argentano. Il
visitatore, mentre cammina nel sito, inquadra un codice QR accanto a ogni punto
d'interesse e ascolta dal proprio telefono il racconto di quella tappa, con il
testo che scorre sullo schermo insieme alla voce. Il percorso è organizzato in
**otto tappe**.

Non è un'app da scaricare da uno store: si apre come un normale sito web, ma una
volta visitata può funzionare anche **senza connessione internet**.

---

## Come funziona per il visitatore

1. Inquadra il QR code con la fotocamera del telefono.
2. Si apre una pagina con la tappa: un pulsante "Ascolta", il testo del racconto
   e i collegamenti alla tappa precedente e successiva.
3. Preme play: parte l'audio e il testo scorre da solo seguendo la voce. Se
   vuole leggere con i suoi tempi, basta scorrere con il dito e il testo smette
   di muoversi da solo.
4. Un piccolo lettore resta sempre in basso, così può continuare ad ascoltare
   anche mentre sfoglia le altre tappe.

Non serve registrarsi, non serve inserire dati, non compaiono banner o
richieste. Si apre e si usa.

---

## Caratteristiche tecniche, spiegate semplici

- **È una "PWA" (Progressive Web App).** In pratica: un sito web che si comporta
  come un'app. Può essere "installato" sulla schermata principale del telefono e
  aprirsi a schermo intero, ma senza passare dagli store.

- **Funziona offline.** Dopo la prima apertura con connessione, i contenuti
  (pagine e audio) vengono salvati sul dispositivo. All'interno della Torre,
  dove il segnale può essere debole o assente, l'audioguida continua a
  funzionare. Per aiutare in questo, l'app pre-scarica con discrezione gli audio
  in sottofondo quando il telefono è inattivo.

- **È un sito "statico".** Non c'è un computer centrale (server) che elabora
  richieste in tempo reale né un archivio di dati degli utenti: sono pagine già
  pronte. Questo lo rende **veloce, economico e robusto**, con pochissime cose
  che possono rompersi.

- **Rispetto della privacy.** L'app non raccoglie nome, email, telefono o
  posizione GPS. Per contare quante persone usano l'audioguida si usa Google
  Analytics in **modalità anonima**, senza cookie di profilazione. È pensata per
  essere conforme al GDPR.

- **Sicurezza.** Trattandosi di un sito statico senza moduli da compilare né
  archivi di dati, la superficie esposta ad attacchi è molto ridotta. Sono
  comunque attive misure di protezione del browser (una policy che limita da
  quali fonti la pagina può caricare contenuti) come ulteriore precauzione.

- **Pensata per il telefono.** Grafica curata, leggibile, con attenzione
  all'accessibilità (etichette per i lettori di schermo, buon contrasto).

---

## Caratteristiche operative (gestione e manutenzione)

- **Costi di gestione molto bassi.** È ospitata su un server gratuito (piano
  "Always Free" di Oracle Cloud) e distribuita tramite Cloudflare. In pratica
  l'infrastruttura non comporta canoni significativi.

- **Aggiornamenti automatici.** Quando si pubblica una modifica, il sito si
  ricostruisce da solo e va online in pochi minuti. I visitatori che hanno già
  aperto l'app ricevono la versione aggiornata alla successiva apertura con
  connessione, senza dover reinstallare nulla.

- **Aggiungere o modificare una tappa è semplice.** I testi, i titoli e i
  riferimenti agli audio sono raccolti in un unico elenco; per cambiare un
  racconto o aggiungere una tappa si interviene lì e si sostituisce il file
  audio.

- **Nessuna dipendenza da app store.** Niente tempi di approvazione, niente
  account sviluppatore a pagamento, niente versioni separate per i diversi
  telefoni: c'è un solo indirizzo web che funziona ovunque.

---

## I vantaggi

- **Accesso immediato:** basta inquadrare un QR, niente da scaricare o
  registrare.
- **Funziona senza rete** all'interno del sito, una volta caricata.
- **Economica e sostenibile** nel tempo per l'associazione e l'amministrazione.
- **Rispettosa dei visitatori:** nessuna raccolta di dati personali.
- **Facile da aggiornare** e da arricchire con nuovi contenuti.
- **Un solo collegamento per tutti i dispositivi**, sempre aggiornato.
- **Veloce e affidabile**, con poche parti che possono guastarsi.

---

## I limiti, detti con onestà

Nessun progetto è perfetto. Vale la pena conoscere anche i confini di questo:

- **Serve una prima apertura con connessione.** L'offline funziona solo dopo che
  il telefono ha scaricato i contenuti almeno una volta. Conviene quindi
  prevedere un punto con buona connettività (es. un QR e un cartello all'ingresso
  che invitano a caricare l'audioguida prima di salire).

- **Occupa spazio sul telefono.** Gli otto audio, per funzionare offline,
  vengono salvati sul dispositivo. È poco rispetto alle app tradizionali, ma non
  è zero.

- **Per ora è in una sola lingua (italiano).** Le versioni in inglese e francese
  sono previste, ma dipendono dalla produzione degli audio tradotti.

- **Le statistiche passano da Google.** Il conteggio degli accessi si appoggia a
  Google Analytics (in forma anonima). È una scelta comoda e gratuita, ma
  significa dipendere da un servizio esterno; in futuro si potrebbe valutare
  un'alternativa che non coinvolga terze parti.

- **Dipende dai QR code fisici e dalla fotocamera.** Se un cartello con il QR
  viene danneggiato o rimosso, quella tappa va raggiunta dal menu invece che con
  la scansione.

- **Richiede JavaScript attivo** nel browser (condizione normale su quasi tutti
  i telefoni, ma va detto).

- **Non c'è ancora un canale di feedback integrato** né una dashboard di
  statistiche dedicata: sono tra i possibili sviluppi futuri.

---

## In sintesi

È uno strumento volutamente **semplice, leggero e a basso costo**, che mette al
centro l'esperienza del visitatore e il rispetto della sua privacy. Fa bene
poche cose: raccontare la Torre, funzionare anche senza rete, ed essere facile da
mantenere nel tempo. I suoi limiti sono noti e, per la maggior parte, sono scelte
consapevoli a favore della sobrietà più che difetti — con margini di crescita
chiari (altre lingue, feedback dei visitatori) per quando ci saranno le risorse
per affrontarli.

---

*Documento divulgativo. Per i dettagli tecnici si vedano `README.md` e
`PROJECT_CONTEXT.md`.*
