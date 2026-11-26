// Curve di livello deterministiche (build-time) per i disegni a tratto.
// Ogni curva è una chiusa "collinare": raggio base + somma di armoniche,
// lisciata con Catmull-Rom → Bézier cubiche.

type Pt = [number, number];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function smoothClosed(pts: Pt[]): string {
  const n = pts.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}

export interface Contour {
  d: string;
  major: boolean;
}

export function contours(opts: {
  cx: number;
  cy: number;
  levels: number;
  r0: number;
  step: number;
  seed?: number;
  squash?: number;
}): Contour[] {
  const { cx, cy, levels, r0, step, seed = 7, squash = 0.78 } = opts;
  const rand = rng(seed);
  const harmonics = [2, 3, 5, 7].map((k) => ({
    k,
    a: (0.05 + rand() * 0.07) / Math.sqrt(k - 1),
    ph: rand() * Math.PI * 2,
    drift: (rand() - 0.5) * 0.5,
  }));
  const out: Contour[] = [];
  const N = 48;
  for (let l = 0; l < levels; l++) {
    const r = r0 + l * step;
    const pts: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      let m = 1;
      for (const h of harmonics) m += h.a * (1 + l * 0.04) * Math.sin(h.k * th + h.ph + h.drift * l);
      pts.push([cx + Math.cos(th) * r * m, cy + Math.sin(th) * r * m * squash]);
    }
    out.push({ d: smoothClosed(pts), major: l % 4 === 3 });
  }
  return out;
}
