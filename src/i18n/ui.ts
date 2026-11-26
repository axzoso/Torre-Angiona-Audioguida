// Testi dell'interfaccia. Oggi solo italiano: per aggiungere l'inglese
// basta una chiave `en` con le stesse voci (i contenuti delle tappe
// restano in src/data/audioguides.json).
export const ui = {
  it: {
    appName: 'Torre Viva',
    place: 'Torre Angioina · San Marco Argentano',
    org: 'Fuori le Mura',
    skip: 'Vai al contenuto',
    intro:
      'Otto tappe per rivivere la storia, raccontate da Raynaldo di Sancti Marci, fabbro e scutifer della Torre. Scansiona il QR code accanto a ogni punto di interesse, oppure scegli una tappa qui sotto.',
    route: 'Percorso',
    routeCount: (n: number) => `${n} tappe`,
    routeSchema: 'sezione schematica, non in scala',
    whereYouAre: (pos: string) => `Disegno della torre: dove ti trovi, ${pos}`,
    whereCaption: 'dove ti trovi · schema, non in scala',
    resume: 'Riprendi',
    resumeFrom: (t: string) => `da ${t}`,
    stop: (n: number, total: number) => `Tappa ${String(n).padStart(2, '0')} di ${String(total).padStart(2, '0')}`,
    allStops: 'Percorso',
    statusNone: 'non ascoltata',
    statusDone: 'ascoltata',
    statusStarted: (t: string) => `iniziata · ${t}`,
    statusPlaying: 'in ascolto',
    listen: 'Ascolta',
    relisten: 'Riascolta',
    resumeAt: (t: string) => `Riprendi da ${t}`,
    pause: 'Pausa',
    transcript: 'Trascrizione',
    prev: 'Tappa precedente',
    next: 'Tappa successiva',
    end: 'Fine del percorso',
    prevShort: 'Precedente',
    nextShort: 'Successiva',
    endShort: 'Fine',
    backHome: 'Torna al percorso',
    backTop: 'Torna su',
    privacy: 'Informativa sulla privacy',
    credits: 'Associazione Fuori le Mura — Comune di San Marco Argentano',
    player: 'Player audio',
    play: 'Riproduci',
    back15: 'Indietro di 15 secondi',
    fwd15: 'Avanti di 15 secondi',
    speed: (r: string) => `Velocità di riproduzione ${r}`,
    position: 'Posizione nell’audio',
    goNext: (n: string, t: string) => `Vai alla tappa ${n}: ${t}`,
    openStop: (n: string) => `Apri la tappa ${n}`,
  },
} as const;

export type Lang = keyof typeof ui;
export const lang: Lang = 'it';
export const t = ui[lang];

export const pad = (n: number) => String(n).padStart(2, '0');

export function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Divide la trascrizione in paragrafi. Se nel JSON ci sono righe vuote
// (\n\n) valgono quelle; altrimenti raggruppa le frasi in blocchi di
// circa `target` caratteri, senza mai spezzare una frase.
export function paragraphs(text: string, target = 520): string[] {
  const authored = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (authored.length > 1) return authored;
  const sentences = text.match(/[^.!?…]+(?:[.!?…]+[”"»’]?|$)\s*/g) ?? [text];
  const out: string[] = [];
  let cur = '';
  for (const s of sentences) {
    // si va a capo solo prima di una frase che inizia con maiuscola
    // (non dopo i puntini di sospensione seguiti da minuscola)
    const startsSentence = /^[A-ZÀ-Ý“"«]/.test(s.trimStart());
    if (cur && startsSentence && cur.length + s.length > target && cur.length > target * 0.55) {
      out.push(cur.trim());
      cur = '';
    }
    cur += s;
  }
  if (cur.trim()) {
    // evita un ultimo paragrafo troppo corto
    if (out.length && cur.trim().length < target * 0.35) out[out.length - 1] += ' ' + cur.trim();
    else out.push(cur.trim());
  }
  return out;
}

export function parseDurata(str: string | undefined): number {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}
