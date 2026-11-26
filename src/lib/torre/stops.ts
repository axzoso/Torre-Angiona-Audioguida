// Inquadrature di dettaglio per le pagine delle tappe: stesso disegno della
// home, con camera e riquadro scelti per mostrare il luogo in cui ci si trova.
import { type Cam, halls, frame, renderContours, renderDefs, renderScene, stopPoint, STOPS } from './scene.ts';

type W3 = [number, number, number];
interface View {
  cam: Cam;
  around: W3[]; // punti (a phi = 0) da includere nel riquadro
}

const ASPECT = 3 / 2;
const PAD = 10;
const PAD_OUT = 16;
const OPEN: Cam = { phi: 0, D: 0 };
const hallBox = (k: keyof typeof halls, below = 1, above = 1.4): W3[] => [
  [-7.2, halls[k].f - below, 0],
  [7.2, halls[k].c + above, 0],
];

// Le tappe 1–3 sono all'esterno (torre intera o rivellino aperto),
// le 4–8 sono nelle sale (sezione aperta).
const VIEWS: View[] = [
  // 1 · primo ponte di legno, davanti alla torretta
  { cam: { phi: 66, D: 14 }, around: [[-24, 0.4, 5.4], [-12.4, 9.2, 5.4], [-12.4, -5, 5.4], [-5.2, 7.5, 0.6]] },
  // 2 · nel cortile del rivellino (fronte del rivellino asportato)
  { cam: { phi: 4, D: 6.4 }, around: [[-9.4, 6.2, 2], [-3.6, 7, 3], [-11.5, -2.4, 1], [-12.4, 8.6, 5.4]] },
  // 3 · ponte alto verso la porta sopraelevata
  { cam: { phi: 52, D: 14 }, around: [[-8.8, 5.2, 1.9], [-5.6, 9.6, 0.6], [-9.6, 1.2, 2.2], [-3.2, 4.4, 2]] },
  // 4 · sala della guarnigione
  { cam: OPEN, around: hallBox('guarnigione') },
  // 5 · armeria
  { cam: OPEN, around: hallBox('armeria') },
  // 6 · cucina
  { cam: OPEN, around: hallBox('cucina', 0.8, 1) },
  // 7 · sommità
  { cam: OPEN, around: [[-7.2, 22.4, 0], [7.2, 28.2, 0]] },
  // 8 · provvigioni (con la cisterna sotto)
  { cam: OPEN, around: [[-7.2, -5.9, 0], [7.2, 5.4, 0]] },
];

/** SVG di dettaglio per la tappa di indice i (0–7), con un solo punto rosso. */
export function stopDrawing(i: number): { viewBox: string; inner: string } {
  const v = VIEWS[i] ?? VIEWS[0];
  const [x, y, w, h] = frame([...v.around, STOPS[i]], v.cam, ASPECT, i < 3 ? PAD_OUT : PAD);
  const id = `tv-s${i + 1}`;
  const [px, py] = stopPoint(i, v.cam);
  const k = w / 120; // il punto resta di dimensione costante a schermo
  const s = 4 * k;
  const inner =
    `<defs>${renderDefs(id)}</defs>` +
    `<g>${renderContours()}</g>` +
    renderScene(v.cam, id) +
    `<rect class="pt" x="${(px - s / 2).toFixed(1)}" y="${(py - s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}"/>`;
  return { viewBox: `${x} ${y} ${w} ${h}`, inner };
}
