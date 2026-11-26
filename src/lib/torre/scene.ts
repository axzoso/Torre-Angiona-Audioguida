// Torre Angioina di San Marco Argentano — disegno a tratto in sezione.
//
// Modello SCHEMATICO in metri, ricavato a occhio da foto e testi delle tappe:
// non è un rilievo. Livello 0 = cortile del rivellino.
//
// Vista: proiezione "da tavola" con l'occhio all'altezza della porta (HEYE):
// le ellissi sotto l'occhio si vedono dall'alto, quelle sopra dal basso.
// Camera:
//   phi — rotazione (gradi) della torre attorno al suo asse
//   D   — profondità del piano di taglio: tutto ciò che sta davanti a z = -D
//         è asportato. D ≥ 14 → torre intera; D = 0 → metà anteriore tolta.
// Ponti, torretta e scala del cortile non vengono mai tagliati.

export interface Cam {
  phi: number;
  D: number;
}

type V2 = [number, number];
type Row = { h: number; o: number; i: number }; // raggio esterno e interno a quota h

export const W = 440;
export const H = 470;
const S = 9;
const CX = 242;
const Y0 = 282;
const HEYE = 7.5;
export const D_CLOSED = 14;

// ---------- geometria (metri) ----------
const R = 5.6; // fusto della torre
const r = 3.1; // sale interne
const PAR_OUT = 6.16; // parapetto su beccatelli
const PAR_IN = 4.95;
const TERR = 24.6;
const PAR_TOP = 27;
const FOUND = -7.4;
const RIV_IN = 10.2;
const RIV_TOP = 11.0;
const RIV_FOOT = 12.8;
const RIV_H = 1.4;
const FOOT_H = -7;
const CH = 4.25; // asse della scala nello spessore murario
const CHW = 0.45;

type Hall = { f: number; s: number; c: number; kind: 'pointed' | 'flat' | 'cross' | 'dome' };
export const halls: Record<string, Hall> = {
  cisterna: { f: -5.4, s: -2.6, c: -0.6, kind: 'pointed' },
  provvigioni: { f: 0, s: 4.6, c: 4.6, kind: 'flat' },
  guarnigione: { f: 5.2, s: 7.0, c: 9.2, kind: 'cross' },
  armeria: { f: 10.2, s: 12.6, c: 16.2, kind: 'cross' },
  cucina: { f: 17.2, s: 19.0, c: 23.4, kind: 'dome' },
};

// torretta, scala aragonese, ponti (angoli a phi = 0)
const T_A = 156;
const T_R = 13.2;
const T_HALF = 1.9;
const T_TOP = 7.8;
const ST_A0 = 126;
const ST_A1 = 166;
const ST_IN = 9.0;
const ST_TOP = 5.2;
const N_STEPS = 13;
const DOOR_A = 174;
const B1_H = 0.45;
const B1_Z = 5.4;
const B1_X0 = -24.5;

// curve di livello della motta: [raggio, quota]
const LEVELS: V2[] = [
  [12.9, -7.05], [13.6, -7.4], [14.6, -8.0], [15.9, -8.7], [17.4, -9.5],
  [19.1, -10.4], [21.0, -11.3], [23.1, -12.2],
];

// ---------- proiezione ----------
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (x: number) => (x * 180) / Math.PI;
const kz = (h: number) => Math.max(-0.3, Math.min(0.36, 0.028 * (HEYE - h)));
const P = (x: number, h: number, z = 0): V2 => [CX + x * S, Y0 - h * S - z * S * kz(h)];
const n1 = (v: number) => Math.round(v * 10) / 10;
const pth = (pts: V2[], close = false) =>
  pts.length ? 'M' + pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join('L') + (close ? 'Z' : '') : '';
const polar = (rr: number, a: number, h: number) => P(rr * Math.cos(rad(a)), h, rr * Math.sin(rad(a)));
const arcPts = (rr: number, h: number, a0: number, a1: number, n = 36, rf?: (a: number) => number): V2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return polar(rf ? rf(a) : rr, a, h);
  });
const rot = (x: number, z: number, phi: number): V2 => {
  const c = Math.cos(rad(phi));
  const s = Math.sin(rad(phi));
  return [x * c - z * s, x * s + z * c];
};
const wrap = (a: number) => ((a % 360) + 360) % 360;

/** Tratti della metà anteriore (180°–360°) ancora presenti dopo il taglio. */
function frontRanges(rr: number, D: number): V2[] {
  if (D >= rr) return [[180, 360]];
  const b = deg(Math.asin(D / rr));
  return b < 0.2 ? [] : [[180, 180 + b], [360 - b, 360]];
}
const inRanges = (a: number, rs: V2[], pad = 0) => {
  const w = wrap(a) === 0 ? 360 : wrap(a);
  return rs.some(([a0, a1]) => w >= a0 + pad && w <= a1 - pad);
};
/** Tratto rimosso (per le linee fantasma). */
function removedRange(rr: number, D: number): V2 | null {
  if (D >= rr) return null;
  const b = deg(Math.asin(D / rr));
  return [180 + b, 360 - b];
}

const roughR = (base: number, i: number) => (a: number) =>
  base * (1 + 0.035 * Math.sin(rad(a) * 3 + i * 1.7) + 0.022 * Math.sin(rad(a) * 5 + i * 0.6));

// ---------- sezione di un solido di rivoluzione sul piano z = -D ----------
// rows: profilo dal basso in alto (righe con la stessa quota = gradino).
function sectionPolys(rows: Row[], D: number): V2[][] {
  const w = (rr: number) => (rr > D ? Math.sqrt(rr * rr - D * D) : -1);
  const R2 = rows.map((q) => ({ h: q.h, wo: w(q.o), wi: q.i > D ? Math.sqrt(q.i * q.i - D * D) : 0, i: q.i }));
  const idx = R2.map((q, k) => (q.wo > 0 ? k : -1)).filter((k) => k >= 0);
  if (!idx.length) return [];
  const k0 = idx[0];
  const k1 = idx[idx.length - 1];
  const rs = R2.slice(k0, k1 + 1);
  const holes = rs.map((q) => q.wi > 0);
  const anyHole = holes.some(Boolean);
  const L = rs.map((q) => [-q.wo, q.h] as V2);
  const Rt = rs.map((q) => [q.wo, q.h] as V2).reverse();
  if (!anyHole) return [[...L, ...Rt]];
  if (holes.every(Boolean)) {
    const inner = rs.map((q) => [-q.wi, q.h] as V2).reverse();
    return [[...L, ...inner], [...rs.map((q) => [q.wi, q.h] as V2), ...Rt]];
  }
  // il vuoto tocca il fondo (Π) oppure la sommità (U)
  const crossing = (a: (typeof rs)[0], b: (typeof rs)[0]): V2[] => {
    if (a.h === b.h) return [];
    const t = (a.i - D) / (a.i - b.i || 1);
    return [[0, a.h + (b.h - a.h) * Math.max(0, Math.min(1, t))]];
  };
  if (holes[0]) {
    let m = 0;
    while (holes[m + 1]) m++;
    const up = rs.slice(0, m + 1).map((q) => [q.wi, q.h] as V2);
    const down = rs.slice(0, m + 1).map((q) => [-q.wi, q.h] as V2).reverse();
    return [[...L, ...Rt, ...up, ...crossing(rs[m], rs[m + 1]), ...down]];
  }
  let m = holes.length - 1;
  while (holes[m - 1]) m--;
  const top = rs.slice(m);
  const downL = top.map((q) => [-q.wi, q.h] as V2).reverse();
  const upR = top.map((q) => [q.wi, q.h] as V2);
  const L2 = rs.map((q) => [-q.wo, q.h] as V2);
  const join = crossing(rs[m], rs[m - 1]);
  return [[...L2, ...downL, ...join, ...upR, ...Rt]];
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function sampleRows(h0: number, h1: number, n: number, f: (h: number) => [number, number], breaks: number[] = []): Row[] {
  const hs = new Set<number>([...Array.from({ length: n + 1 }, (_, k) => lerp(h0, h1, k / n)), ...breaks]);
  return [...hs].sort((a, b) => a - b).map((h) => {
    const [o, i] = f(h);
    return { h, o, i };
  });
}

const towerRows: Row[] = [
  { h: FOUND, o: R, i: 0 },
  { h: 23.0, o: R, i: 0 },
  { h: 23.0, o: R + 0.18, i: 0 },
  { h: 23.55, o: R + 0.18, i: 0 },
  { h: 23.55, o: R + 0.36, i: 0 },
  { h: 24.05, o: R + 0.36, i: 0 },
  { h: 24.05, o: PAR_OUT, i: 0 },
  { h: TERR, o: PAR_OUT, i: 0 },
  { h: TERR, o: PAR_OUT, i: PAR_IN },
  { h: PAR_TOP, o: PAR_OUT, i: PAR_IN },
];
const scarpIn = (h: number) => (h >= -0.35 ? RIV_IN : lerp(RIV_IN, RIV_FOOT - 1.55, (-0.35 - h) / (-0.35 - FOOT_H)));
const scarpOut = (h: number) => (h >= 0 ? RIV_TOP : lerp(RIV_TOP, RIV_FOOT, -h / -FOOT_H));
const wallRows = sampleRows(FOOT_H, RIV_H, 28, (h) => [scarpOut(h), scarpIn(h)], [0, -0.35]);
const fillRows = sampleRows(FOOT_H, -0.35, 20, (h) => [scarpIn(h), R]);
const paveRows: Row[] = [
  { h: -0.35, o: RIV_IN, i: R },
  { h: 0, o: RIV_IN, i: R },
];

// ---------- vuoti delle sale sul piano di taglio ----------
function vaultH(hl: Hall, rho: number): number {
  const { s, c, kind } = hl;
  if (kind === 'flat') return s;
  const q = Math.min(1, rho / r);
  if (kind === 'pointed') {
    const rp = r * 1.6;
    const cxl = rp - r;
    const rise = Math.sqrt(rp * rp - cxl * cxl);
    return s + ((c - s) / rise) * Math.sqrt(Math.max(0, rp * rp - (-rho - cxl) ** 2));
  }
  return s + (c - s) * Math.sqrt(1 - q * q);
}
function hallVoid(hl: Hall, D: number): V2[] | null {
  if (D >= r - 0.02) return null;
  const w = Math.sqrt(r * r - D * D);
  const top: V2[] = Array.from({ length: 29 }, (_, i) => {
    const x = -w + (2 * w * i) / 28;
    return [x, vaultH(hl, Math.sqrt(x * x + D * D))];
  });
  return [[-w, hl.f], ...top, [w, hl.f]];
}

// ---------- disegno ----------
const cls = (c: string, d: string) => (d ? `<path class="${c}" d="${d}"/>` : '');

export function renderContours(): string {
  return LEVELS.map(([rr, h], i) =>
    cls(i % 3 === 2 ? 'ct maj' : 'ct', pth(arcPts(rr, h, 0, 360, 96, roughR(rr, i)), true)),
  ).join('');
}

export function renderDefs(id: string): string {
  return (
    `<pattern id="${id}-hatch" patternUnits="userSpaceOnUse" width="3.6" height="3.6" patternTransform="rotate(45)"><line class="ht" x1="0" y1="0" x2="0" y2="3.6"/></pattern>` +
    `<pattern id="${id}-earth" patternUnits="userSpaceOnUse" width="7" height="7"><circle class="dot" cx="1.6" cy="1.8" r="0.55"/><circle class="dot" cx="5.2" cy="5.1" r="0.45"/><circle class="dot" cx="4.6" cy="1.2" r="0.3"/></pattern>`
  );
}

/** Tutto ciò che dipende dalla camera (le curve di livello sono a parte). */
export function renderScene(cam: Cam, id: string): string {
  const { phi, D } = cam;
  const sec = (pts: V2[]) => pts.map(([x, h]) => P(x, h, -D));
  const hatch = `url(#${id}-hatch)`;
  const earth = `url(#${id}-earth)`;
  const cut = (polys: V2[][], fill = hatch) =>
    polys
      .map((p) => {
        const d = pth(sec(p), true);
        return `<path class="cut-bg" d="${d}"/><path class="cut" style="fill:${fill}" d="${d}"/>`;
      })
      .join('');
  const defs: string[] = [];
  const out: string[] = [];

  // ===== L2: rivellino, parte posteriore (faccia interna e cimasa)
  {
    const inBot = arcPts(RIV_IN, 0, 180, 0, 72);
    const inTop = arcPts(RIV_IN, RIV_H, 180, 0, 72);
    const outTop = arcPts(RIV_TOP, RIV_H, 180, 0, 72);
    out.push(cls('face', pth([...inBot, ...inTop.slice().reverse()], true)));
    out.push(cls('face', pth([...inTop, ...outTop.slice().reverse()], true)));
    for (let a = 4; a < 180; a += 9) {
      const aa = wrap(a + phi);
      if (aa > 2 && aa < 178) out.push(cls('thin', pth([polar(RIV_IN, aa, 0), polar(RIV_IN, aa, RIV_H)])));
    }
  }

  // ===== oggetti accessori (ruotano con la torre), ciascuno con la sua profondità
  type Obj = { z: number; inside: boolean; svg: string };
  const objs: Obj[] = [];
  const W3 = (x: number, h: number, z: number) => {
    const [xx, zz] = rot(x, z, phi);
    return P(xx, h, zz);
  };
  // torretta + ponte 1
  {
    const tA = T_A + phi;
    const ux = Math.cos(rad(tA));
    const uz = Math.sin(rad(tA));
    const vx = -uz;
    const vz = ux;
    const c0x = T_R * ux;
    const c0z = T_R * uz;
    const corner = (i: number, j: number): V2 => [c0x + i * T_HALF * ux + j * T_HALF * vx, c0z + i * T_HALF * uz + j * T_HALF * vz];
    const quad = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
    const faces: [V2, V2, number][] = [];
    for (let i = 0; i < 4; i++) {
      const a = quad[i];
      const b = quad[(i + 1) % 4];
      const mz = (a[1] + b[1]) / 2 - c0z;
      if (mz < 0.01) faces.push([a, b, mz]);
    }
    faces.sort((p, q) => q[2] - p[2]);
    let s = '';
    // pali e impalcato del ponte 1
    const [bx0, bz0] = rot(B1_X0, B1_Z, phi);
    const [bx1, bz1] = rot(-T_R + T_HALF * 0.1, B1_Z, phi);
    const posts = [-22.8, -18.6].map((px) => rot(px, B1_Z, phi));
    const bridge = deck(bx0, bz0, bx1, bz1, B1_H, posts);
    const bridgeFirst = (bz0 + bz1) / 2 > c0z; // il ponte sta dietro la torretta?
    if (bridgeFirst) s += bridge;
    for (const [a, b] of faces) {
      s += cls('face', pth([P(a[0], FOOT_H, a[1]), P(b[0], FOOT_H, b[1]), P(b[0], T_TOP, b[1]), P(a[0], T_TOP, a[1])], true));
      for (let h = FOOT_H + 1.5; h < T_TOP - 0.4; h += 1.5) s += cls('thin', pth([P(a[0], h, a[1]), P(b[0], h, b[1])]));
      const mx = (a[0] + b[0]) / 2;
      const mz = (a[1] + b[1]) / 2;
      s += cls('slit', pth([P(mx, 4.6, mz), P(mx, 5.6, mz)]));
    }
    if (kz(T_TOP) > 0.004) s += cls('face', pth(quad.map(([x, z]) => P(x, T_TOP, z)), true));
    if (!bridgeFirst) s += bridge;
    objs.push({ z: c0z, inside: false, svg: s });
  }
  // scala aragonese nel cortile
  {
    const aMid = wrap((ST_A0 + ST_A1) / 2 + phi);
    const back = aMid < 180;
    let s = '';
    const side: V2[] = [];
    const treads: string[] = [];
    for (let i = 0; i < N_STEPS; i++) {
      const a0 = ST_A0 + phi + ((ST_A1 - ST_A0) * i) / N_STEPS;
      const a1 = ST_A0 + phi + ((ST_A1 - ST_A0) * (i + 1)) / N_STEPS;
      const h = (ST_TOP * (i + 1)) / N_STEPS;
      const rr = back ? ST_IN : RIV_IN;
      side.push(polar(rr, a0, h), polar(rr, a1, h));
      treads.push(pth([polar(ST_IN, a0, h), polar(RIV_IN, a0, h)]));
    }
    const rr = back ? ST_IN : RIV_IN;
    s += cls('face', pth([polar(rr, ST_A0 + phi, 0), ...side, polar(rr, ST_A1 + phi, 0)], true));
    s += treads.map((d) => cls('thin', d)).join('');
    objs.push({ z: 9.6 * Math.sin(rad(aMid)), inside: true, svg: s });
    // ponte 2: dal pianerottolo alla porta sopraelevata
    const la = ST_A1 + phi;
    const da = DOOR_A + phi;
    const lx = ST_IN * Math.cos(rad(la));
    const lz = ST_IN * Math.sin(rad(la));
    const dx = R * Math.cos(rad(da));
    const dz = R * Math.sin(rad(da));
    objs.push({ z: (lz + dz) / 2, inside: true, svg: deck(lx, lz, dx, dz, ST_TOP + 0.05, []) });
  }

  for (const o of objs.filter((o) => o.z > 0).sort((a, b) => b.z - a.z)) out.push(o.svg);

  // ===== L4: la torre
  {
    // sagoma piena (copre ciò che sta dietro)
    const silL: V2[] = [P(-R, 0), P(-R, 23), P(-PAR_OUT, 24.05), P(-PAR_OUT, PAR_TOP)];
    const topFront = crenelArc(PAR_OUT, 180, 360, phi);
    const silR: V2[] = [P(PAR_OUT, PAR_TOP), P(PAR_OUT, 24.05), P(R, 23), P(R, 0)];
    const base = arcPts(R, 0, 360, 180, 48);
    out.push(cls('face nostroke', pth([...silL, ...topFront, ...silR, ...base], true)));

    // superficie esterna rimasta (metà anteriore non asportata)
    const ext: string[] = [];
    for (const sx of [-1, 1]) {
      ext.push(cls('edge', pth([P(sx * R, 0), P(sx * R, 23)])));
      ext.push(cls('edge', pth([P(sx * R, 23), P(sx * PAR_OUT, 24.05), P(sx * PAR_OUT, merlonH(sx < 0 ? 180 : 0, phi))])));
    }
    const fR = frontRanges(R, D);
    const fP = frontRanges(PAR_OUT, D);
    for (const [a0, a1] of fR) {
      // corsi orizzontali e tratteggio verticale (ruota con la torre)
      for (let h = 3; h < 23; h += 3) ext.push(cls('course', pth(arcPts(R, h, a0, a1, 24))));
      for (let a = 0; a < 360; a += 6) {
        const aa = wrap(a + phi);
        if (inRanges(aa, [[a0, a1]], 0.5)) ext.push(cls('wall', pth([polar(R, aa, 0.5), polar(R, aa, 23)])));
      }
      ext.push(cls('back', pth(arcPts(R, 23, a0, a1, 24))));
      ext.push(cls('back', pth(arcPts(R + 0.36, 23.55, a0, a1, 24))));
    }
    for (const [a0, a1] of fP) {
      ext.push(cls('back', pth(arcPts(PAR_OUT, 24.05, a0, a1, 24))));
      // beccatelli
      for (let a = 0; a < 360; a += 7.5) {
        const aa = wrap(a + phi);
        if (inRanges(aa, [[a0, a1]], 1)) ext.push(cls('back', pth([polar(R + 0.1, aa, 23.0), polar(PAR_OUT, aa, 24.05)])));
      }
      ext.push(cls('back', pth(crenelArc(PAR_OUT, a0, a1, phi))));
    }
    // feritoie
    for (const [a, h] of SLITS) {
      const aa = wrap(a + phi);
      if (inRanges(aa, fR, 3)) ext.push(cls('slit', pth([polar(R, aa, h), polar(R, aa, h + 1.1)])));
    }
    // porta sopraelevata e stemma
    {
      const aa = wrap(DOOR_A + phi);
      if (inRanges(aa, fR, 7)) {
        const pts: V2[] = [polar(R, aa - 5.5, 5.2), polar(R, aa - 5.5, 7.0)];
        for (let i = 0; i <= 10; i++) pts.push(polar(R, aa - 5.5 + 1.1 * i, 7.0 + 0.55 * Math.sin((Math.PI * i) / 10)));
        pts.push(polar(R, aa + 5.5, 5.2));
        ext.push(cls('open', pth(pts, true)));
        const sh: V2[] = [polar(R, aa - 3, 8.9), polar(R, aa + 3, 8.9), polar(R, aa + 3, 8.35), polar(R, aa, 7.85), polar(R, aa - 3, 8.35)];
        ext.push(cls('back', pth(sh, true)));
      }
    }
    out.push(ext.join(''));

    // sezione
    out.push(cut(sectionPolys(towerRows, D)));

    // sale
    const inter: string[] = [];
    for (const [name, hl] of Object.entries(halls)) {
      const v = hallVoid(hl, D);
      if (!v) continue;
      const cid = `${id}-v-${name}`;
      const vp = pth(sec(v), true);
      defs.push(`<clipPath id="${cid}"><path d="${vp}"/></clipPath>`);
      inter.push(`<g clip-path="url(#${cid})"><path class="void" d="${vp}"/>${hallInterior(name, hl, phi)}</g>`);
      inter.push(cls('void-line', vp));
    }
    // terrazza: parapetto di fondo visto dal basso, con i merli
    if (D < PAR_IN) {
      const w = Math.sqrt(PAR_IN * PAR_IN - D * D);
      const cid = `${id}-v-sky`;
      defs.push(`<clipPath id="${cid}"><path d="${pth(sec([[-w, TERR], [w, TERR], [w, PAR_TOP + 2], [-w, PAR_TOP + 2]]), true)}"/></clipPath>`);
      const merl: V2[] = [];
      for (let a = 180; a >= 0; a -= 2) merl.push(polar(PAR_IN, a, merlonH(a, phi)));
      let g = cls('face', pth([...arcPts(PAR_IN, TERR, 180, 0), ...merl.reverse()], true));
      for (let a = 0; a < 180; a += 8) {
        const aa = wrap(a + phi);
        if (aa < 180) g += cls('wall', pth([polar(PAR_IN, aa, TERR), polar(PAR_IN, aa, PAR_TOP - 0.85)]));
      }
      inter.push(`<g clip-path="url(#${cid})">${g}</g>`);
    }
    // scale nello spessore murario, passaggi, porta
    if (D < r - 0.05) {
      const xc = Math.sqrt(CH * CH - D * D);
      const rect = (x0: number, x1: number, h0: number, h1: number) => pth(sec([[x0, h0], [x1, h0], [x1, h1], [x0, h1]]), true);
      const w = Math.sqrt(r * r - D * D);
      if (phi < 6) inter.push(cls('void', rect(-Math.sqrt(R * R - D * D) - 0.02, -w + 0.02, halls.guarnigione.f, 7.5)));
      inter.push(cls('void', rect(-xc - CHW, -xc + CHW, 0, TERR + 0.02)));
      inter.push(cls('void', rect(xc - CHW, xc + CHW, halls.guarnigione.f, TERR + 0.02)));
      inter.push(cls('void', rect(-xc, -w + 0.02, 0, 2.0)));
      for (const k of ['guarnigione', 'armeria', 'cucina']) inter.push(cls('void', rect(w - 0.02, xc, halls[k].f, halls[k].f + 2.0)));
      const st: string[] = [];
      for (let h = 0.6; h < TERR; h += 0.75) st.push(pth(sec([[-xc - CHW, h], [-xc + CHW, h]])));
      for (let h = halls.guarnigione.f + 0.6; h < TERR; h += 0.75) st.push(pth(sec([[xc - CHW, h], [xc + CHW, h]])));
      inter.push(cls('steps', st.join('')));
      // pozzo verso la cisterna (linea nascosta)
      const [px, pz] = rot(1.5, 1.3, phi);
      if (pz > -D + 0.5) {
        inter.push(cls('hidden', pth([P(px - 0.42, halls.guarnigione.f, pz), P(px - 0.42, -3.6, pz)]) + pth([P(px + 0.42, halls.guarnigione.f, pz), P(px + 0.42, -3.6, pz)])));
      }
    }
    out.push(inter.join(''));
  }

  for (const o of objs.filter((o) => o.z <= 0 && o.inside).sort((a, b) => b.z - a.z)) out.push(o.svg);

  // ===== L6: rivellino, parte anteriore rimasta + sezioni + terreno
  {
    // limite esterno rimasto a un dato angolo, per un raggio nominale rr
    const keep = (rr: number, a: number) => {
      const sa = Math.sin(rad(a));
      return sa >= 0 ? rr : Math.min(rr, D / -sa);
    };
    // parapetto + scarpa: generatrice da (RIV_TOP, RIV_H) a (RIV_FOOT, FOOT_H)
    const lowEnd = (a: number): V2 => {
      const sa = Math.sin(rad(a));
      const lim = sa >= 0 ? Infinity : D / -sa;
      const s = Math.max(0, Math.min(1, (lim - RIV_TOP) / (RIV_FOOT - RIV_TOP)));
      const rr = lerp(RIV_TOP, RIV_FOOT, s);
      return polar(rr, a, lerp(0, FOOT_H, s));
    };
    for (const [a0, a1] of frontRanges(RIV_TOP, D)) {
      const n = 40;
      const as = Array.from({ length: n + 1 }, (_, i) => a0 + ((a1 - a0) * i) / n);
      out.push(cls('face', pth([...as.map((a) => polar(RIV_TOP, a, RIV_H)), ...as.slice().reverse().map(lowEnd)], true)));
      out.push(cls('back', pth(as.map((a) => polar(RIV_TOP, a, 0)))));
      for (let a = 0; a < 360; a += 8) {
        const aa = wrap(a + phi);
        if (inRanges(aa, [[a0, a1]], 0.5)) out.push(cls('wall', pth([polar(RIV_TOP, aa, 0), lowEnd(aa)])));
      }
    }
    // cimasa vista dall'alto
    for (const [a0, a1] of frontRanges(RIV_IN, D)) {
      const n = 40;
      const as = Array.from({ length: n + 1 }, (_, i) => a0 + ((a1 - a0) * i) / n);
      out.push(cls('face', pth([...as.map((a) => polar(RIV_IN, a, RIV_H)), ...as.slice().reverse().map((a) => polar(keep(RIV_TOP, a), a, RIV_H))], true)));
    }
    out.push(cut(sectionPolys(fillRows, D), earth));
    out.push(cut(sectionPolys(paveRows, D)));
    out.push(cut(sectionPolys(wallRows, D)));
    // profilo del terreno sul piano di taglio
    for (const sx of [-1, 1]) {
      const pts: V2[] = [];
      const add = (rr: number, h: number) => {
        if (rr > D) pts.push(P(sx * Math.sqrt(rr * rr - D * D), h, -D));
      };
      if (D >= RIV_FOOT) continue;
      add(RIV_FOOT, FOOT_H);
      LEVELS.forEach(([rr, h], i) => add(roughR(rr, i)(sx < 0 ? 180 : 0), h));
      if (pts.length > 1) out.push(cls('ground', pth(pts)));
    }
  }

  for (const o of objs.filter((o) => o.z <= 0 && !o.inside).sort((a, b) => b.z - a.z)) out.push(o.svg);

  // ===== linee fantasma della parte asportata
  {
    const g: string[] = [];
    const ghost = (rr: number, h: number) => {
      const rg = removedRange(rr, D);
      if (rg) g.push(cls('ghost', pth(arcPts(rr, h, rg[0], rg[1], 40))));
    };
    ghost(PAR_OUT, PAR_TOP);
    ghost(RIV_TOP, RIV_H);
    ghost(RIV_FOOT, FOOT_H);
    out.push(g.join(''));
  }

  return `<defs>${defs.join('')}</defs>${out.join('')}`;
}

// feritoie sul fusto: [angolo, quota]
const SLITS: V2[] = [
  [196, 2.6], [214, 12.6], [232, 20.1], [252, 7.4], [271, 15.2], [292, 10.8], [313, 19.0], [334, 6.2], [352, 13.6],
  [20, 9.5], [70, 16.5], [120, 4.5], [160, 18.5],
];

function merlonH(a: number, phi: number) {
  return wrap(a - phi) % 24 < 14 ? PAR_TOP : PAR_TOP - 0.85;
}
function crenelArc(rr: number, a0: number, a1: number, phi: number): V2[] {
  const pts: V2[] = [];
  const n = Math.max(2, Math.round(Math.abs(a1 - a0) / 1.5));
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push(polar(rr, a, merlonH(a, phi)));
  }
  return pts;
}

/** Quota del pendio a una certa distanza dall'asse (interpolando le curve). */
function groundH(rho: number): number {
  if (rho <= LEVELS[0][0]) return LEVELS[0][1];
  for (let i = 1; i < LEVELS.length; i++) {
    const [r0, h0] = LEVELS[i - 1];
    const [r1, h1] = LEVELS[i];
    if (rho <= r1) return lerp(h0, h1, (rho - r0) / (r1 - r0));
  }
  return LEVELS[LEVELS.length - 1][1];
}

function deck(x0: number, z0: number, x1: number, z1: number, h: number, posts: V2[]): string {
  let s = '';
  for (const [px, pz] of posts) s += cls('post', pth([P(px, h - 0.25, pz), P(px, groundH(Math.hypot(px, pz)), pz)]));
  s += cls('deck', pth([P(x0, h - 0.25, z0), P(x1, h - 0.25, z1), P(x1, h, z1), P(x0, h, z0)], true));
  s += cls('rail', pth([P(x0, h + 1, z0), P(x1, h + 1, z1)]));
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.6));
  const lx = (u: number) => x0 + (x1 - x0) * u;
  const lz = (u: number) => z0 + (z1 - z0) * u;
  for (let i = 0; i < n; i++) {
    const u0 = i / n;
    const u1 = (i + 1) / n;
    s += cls('rail thin', pth([P(lx(u0), h, lz(u0)), P(lx(u1), h + 1, lz(u1))]) + pth([P(lx(u0), h + 1, lz(u0)), P(lx(u1), h, lz(u1))]));
    s += cls('rail', pth([P(lx(u0), h, lz(u0)), P(lx(u0), h + 1, lz(u0))]));
  }
  s += cls('rail', pth([P(x1, h, z1), P(x1, h + 1, z1)]));
  return s;
}

function hallInterior(name: string, hl: Hall, phi: number): string {
  let g = '';
  for (let a = 3; a < 360; a += 7) {
    const aa = wrap(a + phi);
    if (aa > 1 && aa < 179) g += cls('wall', pth([polar(r, aa, hl.f), polar(r, aa, hl.s)]));
  }
  g += cls('back', pth(arcPts(r, hl.f, 180, 0)));
  g += cls('back', pth(arcPts(r, hl.s, 180, 0)));
  if (hl.kind === 'cross') {
    for (const a0 of [45, 135, 225, 315]) {
      const a = wrap(a0 + phi);
      if (a > 179) continue;
      const pts: V2[] = [];
      for (let i = 0; i <= 24; i++) {
        const s = 1 - i / 24;
        pts.push(polar(r * s, a, hl.s + (hl.c - hl.s) * Math.sqrt(1 - s * s)));
      }
      g += cls('rib', pth(pts));
    }
    // lunette sulla parete, tra le imposte dei costoloni
    for (const a0 of [45, 135, 225, 315]) {
      const pts: V2[] = [];
      for (let i = 0; i <= 24; i++) {
        const a = a0 + phi + (90 * i) / 24;
        const aw = wrap(a);
        if (aw > 0.5 && aw < 179.5) pts.push(polar(r, aw, hl.s + (hl.c - hl.s) * 0.62 * Math.sin((Math.PI * i) / 24)));
        else if (pts.length) break;
      }
      if (pts.length > 1) g += cls('back', pth(pts));
    }
  }
  if (hl.kind === 'dome') {
    for (let i = 1; i <= 6; i++) {
      const t = i / 7;
      g += cls('rib', pth(arcPts(r * Math.cos((t * Math.PI) / 2), hl.s + (hl.c - hl.s) * Math.sin((t * Math.PI) / 2), 180, 0)));
    }
  }
  if (hl.kind === 'flat') {
    // solaio novecentesco: travi tagliate dal piano
    for (let x = -2.6; x <= 2.7; x += 1.3) {
      const a = P(x - 0.16, hl.s, 0);
      const b = P(x + 0.16, hl.s - 0.38, 0);
      g += `<rect class="beam" x="${n1(a[0])}" y="${n1(a[1])}" width="${n1(b[0] - a[0])}" height="${n1(b[1] - a[1])}"/>`;
    }
  }
  if (name === 'cisterna') {
    for (const [x0, x1, h] of [[-2.6, -0.6, -4.5], [0.2, 2.4, -4.5], [-1.6, 1.2, -4.9]] as const) {
      g += cls('water', pth([P(x0, h, 0.9), P(x1, h, 0.9)]));
    }
  }
  const back = (a: number) => {
    const w = wrap(a + phi);
    return w > 8 && w < 172 ? w : null;
  };
  const niche = (a0: number, h0: number, h1: number, w: number) => {
    const a = back(a0);
    if (a === null) return '';
    const pts: V2[] = [polar(r, a - w, h0), polar(r, a - w, h1)];
    for (let i = 0; i <= 10; i++) pts.push(polar(r, a - w + (2 * w * i) / 10, h1 + 0.5 * Math.sin((Math.PI * i) / 10)));
    pts.push(polar(r, a + w, h0));
    return cls('open', pth(pts, true));
  };
  const hood = (a0: number, h0: number, h1: number) => {
    const a = back(a0);
    if (a === null) return '';
    return (
      cls('back', pth([polar(r, a - 13, h0), polar(r, a - 13, h0 + 0.9), polar(r, a - 6, h1), polar(r, a + 6, h1), polar(r, a + 13, h0 + 0.9), polar(r, a + 13, h0)])) +
      cls('back', pth([polar(r, a - 13, h0 + 0.9), polar(r, a + 13, h0 + 0.9)]))
    );
  };
  if (name === 'guarnigione') {
    g += hood(90, hl.f, hl.s - 0.1);
    const [px, pz] = rot(1.5, 1.3, phi);
    g += cls('back', pth(Array.from({ length: 25 }, (_, i) => {
      const t = (2 * Math.PI * i) / 24;
      return P(px + 0.42 * Math.cos(t), hl.f, pz + 0.42 * Math.sin(t));
    }), true));
  }
  if (name === 'armeria') g += niche(42, 12.1, 13.3, 9) + niche(138, 12.1, 13.3, 9) + hood(90, hl.f, 12.2);
  if (name === 'cucina') g += niche(118, hl.f + 0.6, hl.f + 1.5, 12) + hood(62, hl.f, 18.9);
  if (name === 'provvigioni') g += niche(90, 1.4, 3.0, 11);
  return g;
}

// ---------- percorso e tappe (vista finale: phi = 0, D = 0) ----------
type W3 = [number, number, number];
const F = (k: string, d = 0.45) => halls[k].f + d;
const stairPt = (u: number): W3 => {
  const a = rad(ST_A0 + (ST_A1 - ST_A0) * u);
  return [9.6 * Math.cos(a), ST_TOP * u + 0.25, 9.6 * Math.sin(a)];
};
const land: V2 = [ST_IN * Math.cos(rad(ST_A1)), ST_IN * Math.sin(rad(ST_A1))];
const door: V2 = [R * Math.cos(rad(DOOR_A)), R * Math.sin(rad(DOOR_A))];
const tc: V2 = [T_R * Math.cos(rad(T_A)), T_R * Math.sin(rad(T_A))];

/** Punti delle 8 tappe nello spazio (a phi = 0), nell'ordine della visita. */
export const STOPS: W3[] = [
  [-20.6, B1_H + 0.3, B1_Z],
  [-7.2, 0.3, 2.6],
  [-7.3, ST_TOP + 0.35, (land[1] + door[1]) / 2 + 0.05],
  [0, F('guarnigione'), 0],
  [0, F('armeria'), 0],
  [0, F('cucina'), 0],
  [0, TERR + 0.45, 0],
  [0, F('provvigioni'), 0],
];
const ROUTE: W3[] = [
  STOPS[0],
  [tc[0] - T_HALF, B1_H + 0.3, B1_Z],
  [tc[0] + T_HALF * 0.2, 0.3, tc[1] - 0.6],
  STOPS[1],
  ...[0, 0.25, 0.5, 0.75, 1].map(stairPt),
  STOPS[2],
  [-R, F('guarnigione'), 0],
  STOPS[3],
  [CH, F('guarnigione'), 0],
  [CH, F('armeria'), 0],
  STOPS[4],
  [0, F('armeria', 1.25), 0],
  [CH, F('armeria', 1.25), 0],
  [CH, F('cucina'), 0],
  STOPS[5],
  [0, F('cucina', 1.25), 0],
  [CH, F('cucina', 1.25), 0],
  [CH, TERR + 0.45, 0],
  STOPS[6],
  [-CH, TERR + 0.45, 0],
  [-CH, F('provvigioni'), 0],
  STOPS[7],
];

export function routePath(): string {
  return pth(ROUTE.map(([x, h, z]) => P(x, h, z)));
}

/** Posizione a schermo di una tappa per una data camera. */
export function stopPoint(i: number, cam: Cam): V2 {
  const [x, h, z] = STOPS[i];
  const [xx, zz] = rot(x, z, cam.phi);
  return P(xx, h, zz);
}

/** Riquadro (viewBox) attorno a punti del mondo, con proporzioni fisse. */
export function frame(pts: W3[], cam: Cam, aspect: number, pad: number): [number, number, number, number] {
  const sp = pts.map(([x, h, z]) => {
    const [xx, zz] = rot(x, z, cam.phi);
    return P(xx, h, zz);
  });
  let x0 = Math.min(...sp.map((p) => p[0])) - pad;
  let x1 = Math.max(...sp.map((p) => p[0])) + pad;
  let y0 = Math.min(...sp.map((p) => p[1])) - pad;
  let y1 = Math.max(...sp.map((p) => p[1])) + pad;
  const w = x1 - x0;
  const h = y1 - y0;
  if (w / h > aspect) {
    const nh = w / aspect;
    y0 -= (nh - h) / 2;
    y1 = y0 + nh;
  } else {
    const nw = h * aspect;
    x0 -= (nw - w) / 2;
    x1 = x0 + nw;
  }
  return [n1(x0), n1(y0), n1(x1 - x0), n1(y1 - y0)];
}

/** Camera dell'animazione in home: t = 0 torre intera, t = 1 sezione aperta. */
export function homeCam(t: number): Cam {
  const u = Math.max(0, Math.min(1, t));
  return { phi: 64 * (1 - u), D: D_CLOSED * Math.pow(1 - u, 1.3) };
}
