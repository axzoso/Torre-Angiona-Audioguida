// Stato di ascolto salvato SOLO sul dispositivo (localStorage).
// Nessun dato personale, nessun invio a server.

export interface StopState {
  t: number; // secondi raggiunti
  done: boolean;
}

interface Store {
  tappe: Record<string, StopState>;
  last: number | null;
}

const KEY = 'torreviva:ascolto:v1';
const RATE_KEY = 'torreviva:velocita:v1';

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s === 'object' && s.tappe) return s as Store;
    }
  } catch {
    /* storage non disponibile o corrotto */
  }
  return { tappe: {}, last: null };
}

function write(s: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota o modalità privata: lo stato resta solo in memoria */
  }
}

export function getStop(id: number): StopState | null {
  return read().tappe[id] ?? null;
}

export function getAll(): Store {
  return read();
}

export function savePosition(id: number, t: number): void {
  const s = read();
  const prev = s.tappe[id];
  s.tappe[id] = { t: Math.max(0, Math.floor(t)), done: prev?.done ?? false };
  s.last = id;
  write(s);
}

export function markDone(id: number): void {
  const s = read();
  s.tappe[id] = { t: 0, done: true };
  s.last = id;
  write(s);
}

export function getRate(): number {
  try {
    const r = Number(localStorage.getItem(RATE_KEY));
    return r > 0 ? r : 1;
  } catch {
    return 1;
  }
}

export function setRate(r: number): void {
  try {
    localStorage.setItem(RATE_KEY, String(r));
  } catch {
    /* ignora */
  }
}
