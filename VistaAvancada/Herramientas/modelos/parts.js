// parts.js — components de l'avió: fuselatge, finestres, ales, motors, tren, llums
import * as THREE from 'three';
import { GR, lerp, clamp, suau, spow, pchip, corbaArrel, superficie, malla, torn, cos, esfera, caixa, tub,
  peca, afegirA, mat, perfilNACA, gruixNACA, curvNACA, lamina, Cub } from './geo.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// ================= FUSELATGE =================
// s = distància des de la punta del morro (m); th = angle des de dalt (positiu cap a +X, ala esquerra)
export function crearFuselatge(F) {
  const { L, W, Rt, Rb } = F, nas = F.nas, cua = F.cua;
  const kMid = Rb / (Rt + Rb);
  const nSup = corbaArrel(nas.sup), nInf = corbaArrel(nas.inf), nAmp = corbaArrel(nas.amp);
  const cSup = pchip(cua.sup), cInf = pchip(cua.inf), cAmp = pchip(cua.amp);
  const s1 = nas.Ln, s2 = L - cua.Lt, eU0 = F.eSup ?? 2, eL0 = F.eInf ?? 2;
  const Z = s => L / 2 - s;
  const sec = s => {
    let top = Rt, bot = -Rb, w = W, eU = eU0, eL = eL0;
    if (s < s1) {
      const t = s / s1;
      top = nas.zt + (Rt - nas.zt) * nSup(t);
      bot = nas.zt - (nas.zt + Rb) * nInf(t);
      w = W * nAmp(t);
      if (nas.eSup) eU = lerp(nas.eSup, eU0, suau(t));
      if (nas.eInf) eL = lerp(nas.eInf, eL0, suau(t));
    } else if (s > s2) {
      const t = (s - s2) / cua.Lt, tE = cua.zc + cua.hc, bE = cua.zc - cua.hc;
      top = tE + (Rt - tE) * cSup(t); bot = bE + (-Rb - bE) * cInf(t); w = cua.wc + (W - cua.wc) * cAmp(t);
      if (cua.eSup) eU = lerp(eU0, cua.eSup, suau(t));
      if (cua.eInf) eL = lerp(eL0, cua.eInf, suau(t));
    }
    return { top, bot, w, mid: bot + kMid * (top - bot), eU, eL };
  };
  const bony = (s, th) => {
    const a = Math.abs(Math.atan2(Math.sin(th), Math.cos(th)));
    let r = 0;
    for (const b of F.bonys || []) {
      const [p0, p1, p2, p3] = b.s;
      if (s <= p0 || s >= p3) continue;
      const fs = s < p1 ? suau((s - p0) / (p1 - p0)) : s > p2 ? suau((p3 - s) / (p3 - p2)) : 1;
      const d = (a - b.th * GR) / (b.dth * GR);
      if (Math.abs(d) >= 1) continue;
      r += b.a * fs * 0.5 * (1 + Math.cos(Math.PI * d));
    }
    return r;
  };
  const P = (s, th) => {
    const S = sec(s), st = Math.sin(th), ct = Math.cos(th);
    let x, y;
    if (ct >= 0) { x = S.w * spow(st, 2 / S.eU); y = S.mid + (S.top - S.mid) * Math.pow(ct, 2 / S.eU); }
    else { x = S.w * spow(st, 2 / S.eL); y = S.mid - (S.mid - S.bot) * Math.pow(-ct, 2 / S.eL); }
    const b = bony(s, th);
    if (b) { const dy = y - S.mid, l = Math.hypot(x, dy) || 1; x += b * x / l; y += b * dy / l; }
    return [x, y, Z(s)];
  };
  const N = (s, th) => {
    const e = 2e-3, se = clamp(s, e, L - e);
    const ds = sub(P(se + e, th), P(se - e, th)), dt = sub(P(se, th + e), P(se, th - e));
    let n = nrm(crs(ds, dt));
    const p = P(se, th), S = sec(se);
    if (n[0] * p[0] + n[1] * (p[1] - S.mid) < 0) n = n.map(v => -v);
    return n;
  };
  const sup = (s, th, off = 0) => { const p = P(s, th), n = N(s, th); return { p: [p[0] + n[0] * off, p[1] + n[1] * off, p[2] + n[2] * off], n }; };
  const thetaY = (s, y) => { let a = 0, b = Math.PI * 0.95; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (P(s, m)[1] > y) a = m; else b = m; } return (a + b) / 2; };
  const thetaX = (s, x) => { let a = 0, b = Math.PI / 2; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (P(s, m)[0] < x) a = m; else b = m; } return (a + b) / 2; };
  const rho = (s, th) => { const e = 1e-3; return Math.hypot(...sub(P(s, th + e), P(s, th - e))) / (2 * e); };

  // anells: densos al morro i a la cua
  const [nN, nM, nC] = F.anells ?? [56, 32, 48];
  const ss = [];
  for (let k = 0; k < nN; k++) ss.push(s1 * Math.pow(k / nN, 1.6));
  for (let k = 0; k < nM; k++) ss.push(lerp(s1, s2, k / nM));
  for (let k = 0; k <= nC; k++) ss.push(s2 + cua.Lt * (1 - Math.pow(1 - k / nC, 1.15)));
  const nRad = F.nRad ?? 64, thS = Math.acos(-(F.costura ?? 0.3));
  const Nu = Math.round(nRad * thS / Math.PI), Nl = nRad - Nu;
  const thI = i => i <= Nu ? -thS + 2 * thS * i / Nu : thS + (2 * Math.PI - 2 * thS) * (i - Nu) / Nl;
  const mapa = superficie(nRad, ss.length - 1, (i, j) => P(ss[j], thI(i)),
    { tancaU: true, orient: 'fora', mat: i => (i < Nu ? 'pintura' : 'ventre') });

  // tapa posterior + sortida de l'APU
  const SL = sec(L), zL = Z(L), cen = [0, SL.mid, zL];
  for (const [m, i0, i1] of [['pintura', 0, Nu], ['ventre', Nu, nRad]]) {
    const pts = [cen], tris = [];
    for (let i = i0; i <= i1; i++) pts.push(P(L, thI(i % nRad)));
    for (let k = 1; k < pts.length - 1; k++) tris.push(0, k, k + 1);
    afegirA(mapa[m], malla(pts, tris, { cap: [0, 0, -1], normals: pts.map(() => [0, 0, -1]) }));
  }
  if (cua.apu !== false) {
    const rx = cua.wc * 0.72, ry = cua.hc * 0.72;
    const apu = torn([[zL + 0.03, 1], [zL - 0.09, 1], [zL - 0.09, 0.82]], 20, { orient: null, forma: (a, r, z) => [r * rx * Math.cos(a), SL.mid + r * ry * Math.sin(a), z], material: 'metall' });
    // normals cap enfora (comprovació simple)
    mapa.metall = apu.metall;
    const pts = [[0, SL.mid, zL - 0.06]], tris = [];
    for (let i = 0; i <= 20; i++) { const a = 2 * Math.PI * i / 20; pts.push([0.85 * rx * Math.cos(a), SL.mid + 0.85 * ry * Math.sin(a), zL - 0.06]); }
    for (let k = 1; k < pts.length - 1; k++) tris.push(0, k, k + 1);
    mapa.negre = malla(pts, tris, { cap: [0, 0, -1], normals: pts.map(() => [0, 0, -1]) });
    fixaTub(mapa.metall, [0, SL.mid, zL]);
  }
  return { L, Z, sec, P, N, sup, thetaY, thetaX, rho, mapa, ss };
}
// Orienta un tub obert (normals cap enfora del seu eix Z que passa per c)
function fixaTub(pc, c) {
  let s = 0;
  for (let k = 0; k < pc.p.length; k += 3) s += pc.n[k] * (pc.p[k] - c[0]) + pc.n[k + 1] * (pc.p[k + 1] - c[1]);
  if (s < 0) { for (let k = 0; k < pc.n.length; k++) pc.n[k] = -pc.n[k]; }
  // ordre dels triangles coherent amb les normals
  let t = 0;
  for (let k = 0; k < pc.i.length; k += 3) {
    const a = pc.i[k] * 3, b = pc.i[k + 1] * 3, c2 = pc.i[k + 2] * 3, P = pc.p;
    const n = crs(sub([P[b], P[b + 1], P[b + 2]], [P[a], P[a + 1], P[a + 2]]), sub([P[c2], P[c2 + 1], P[c2 + 2]], [P[a], P[a + 1], P[a + 2]]));
    t += Math.sign(n[0] * pc.n[a] + n[1] * pc.n[a + 1] + n[2] * pc.n[a + 2]);
  }
  if (t < 0) for (let k = 0; k < pc.i.length; k += 3) { const q = pc.i[k + 1]; pc.i[k + 1] = pc.i[k + 2]; pc.i[k + 2] = q; }
}

// Contorn arrodonit (superel·lipse) de K punts
const contorn = (a, b, n, K) => { const r = []; for (let q = 0; q < K; q++) { const t = 2 * Math.PI * q / K; r.push([a * spow(Math.cos(t), 2 / n), b * spow(Math.sin(t), 2 / n)]); } return r; };
// Rectangle arrodonit mostrejat uniformement per longitud d'arc (K punts, començant a (a, 0))
const rectArr = (a, b, r, K) => {
  r = Math.min(r, a, b); const sx = a - r, sy = b - r, per = 4 * (sx + sy) + 2 * Math.PI * r, out = [];
  for (let q = 0; q < K; q++) {
    let d = (q / K) * per + sy; if (d >= per) d -= per; // origen al punt (a, 0)
    const pts = [[2 * sy, u => [a, -sy + u]], [Math.PI * r / 2, u => [sx + r * Math.cos(u / r), sy + r * Math.sin(u / r)]], [2 * sx, u => [sx - u, b]], [Math.PI * r / 2, u => [-sx - r * Math.sin(u / r), sy + r * Math.cos(u / r)]],
      [2 * sy, u => [-a, sy - u]], [Math.PI * r / 2, u => [-sx - r * Math.cos(u / r), -sy - r * Math.sin(u / r)]], [2 * sx, u => [-sx + u, -b]], [Math.PI * r / 2, u => [sx + r * Math.sin(u / r), -sy - r * Math.cos(u / r)]]];
    for (const [l, f] of pts) { if (d <= l + 1e-9) { out.push(f(d)); break; } d -= l; }
  }
  return out;
};

// Finestres de cabina: files a banda i banda
export function finestresCabina(fus, F, cub) {
  const K = 14, off = F.off ?? 0.02, pts = [], nr = [], tris = [];
  const out = contorn(F.a, F.b, F.n ?? 3, K);
  for (const [s0, s1, pas] of F.trams) {
    const p = pas ?? F.pas, cnt = Math.floor((s1 - s0) / p + 1e-6) + 1;
    for (let k = 0; k < cnt; k++) {
      const s = s0 + k * p, th = fus.thetaY(s, F.y), rho = fus.rho(s, th), b = pts.length;
      const c = fus.sup(s, th, off); pts.push(c.p); nr.push(c.n);
      for (const [du, dv] of out) { const r = fus.sup(s + du, th - dv / rho, off); pts.push(r.p); nr.push(r.n); }
      for (let q = 0; q < K; q++) {
        const i1 = b + 1 + q, i2 = b + 1 + (q + 1) % K;
        const t = crs(sub(pts[i1], pts[b]), sub(pts[i2], pts[b]));
        if (t[0] * c.n[0] + t[1] * c.n[1] + t[2] * c.n[2] > 0) tris.push(b, i1, i2); else tris.push(b, i2, i1);
      }
    }
  }
  cub.sim({ vidre: malla(pts, tris, { normals: nr }) });
}

// Resol un vèrtex de finestra: [s, φ°] | {s, y} (vista lateral) | {s, x} | {x, y} (vista frontal, part superior del morro)
const resol = (fus, c) => {
  if (Array.isArray(c)) return [c[0], c[1] * GR];
  if (c.s === undefined) { // projecció frontal: busca s on la secció passa per (x, y)
    let a = 0.02, b = fus.ss ? fus.L * 0.3 : 10;
    const f = s => { const S = fus.sec(s); if (c.x >= S.w * 0.999) return -1; return fus.P(s, fus.thetaX(s, c.x))[1] - c.y; };
    for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (f(m) < 0) a = m; else b = m; }
    const s = (a + b) / 2; return [s, fus.thetaX(s, c.x)];
  }
  return c.y !== undefined ? [c.s, fus.thetaY(c.s, c.y)] : [c.s, fus.thetaX(c.s, c.x)];
};

// Polígons sobre la superfície del fuselatge (finestres de cabina de pilotatge, màscara)
export function poligonsFus(fus, llista, cub, material = 'vidre', off = 0.022, sim = true) {
  const pts = [], nr = [], tris = [];
  for (const W of llista) {
    const cs = W.map(c => resol(fus, c)), C = [], nSub = 4;
    for (let k = 0; k < cs.length; k++) { const a = cs[k], b = cs[(k + 1) % cs.length]; for (let q = 0; q < nSub; q++) C.push([lerp(a[0], b[0], q / nSub), lerp(a[1], b[1], q / nSub)]); }
    const cen = [C.reduce((s, c) => s + c[0], 0) / C.length, C.reduce((s, c) => s + c[1], 0) / C.length];
    const b = pts.length, K = C.length;
    const add = (s, th) => { const r = fus.sup(s, th, off); pts.push(r.p); nr.push(r.n); };
    add(cen[0], cen[1]);
    for (const f of [0.5, 1]) for (const c of C) add(lerp(cen[0], c[0], f), lerp(cen[1], c[1], f));
    const n0 = nr[b];
    const t3 = (x, y, z) => { const t = crs(sub(pts[y], pts[x]), sub(pts[z], pts[x])); if (t[0] * n0[0] + t[1] * n0[1] + t[2] * n0[2] >= 0) tris.push(x, y, z); else tris.push(x, z, y); };
    for (let q = 0; q < K; q++) {
      const a1 = b + 1 + q, a2 = b + 1 + (q + 1) % K, c1 = a1 + K, c2 = a2 + K;
      t3(b, a1, a2); t3(a1, c1, c2); t3(a1, c2, a2);
    }
  }
  const mp = { [material]: malla(pts, tris, { normals: nr }) };
  if (sim) cub.sim(mp); else cub.mapa(mp);
}

// Portes: contorn (línia gris) i finestreta
export function portes(fus, llista, cub) {
  const K = 48, pts = [], nr = [], tris = [], fp = [], fn = [], ft = [];
  for (const D of llista) {
    const th = fus.thetaY(D.s, D.y), rho = fus.rho(D.s, th), t = D.t ?? 0.022;
    const rr = D.r ?? 0.2, ext = rectArr(D.a, D.b, rr, K), int = rectArr(D.a - t, D.b - t, rr - t, K);
    const b = pts.length;
    for (const c of [...ext, ...int]) { const r = fus.sup(D.s + c[0], th - c[1] / rho, 0.012); pts.push(r.p); nr.push(r.n); }
    const n0 = nr[b];
    for (let q = 0; q < K; q++) {
      const e1 = b + q, e2 = b + (q + 1) % K, i1 = e1 + K, i2 = e2 + K;
      for (const [x, y, z] of [[e1, e2, i2], [e1, i2, i1]]) { const tt = crs(sub(pts[y], pts[x]), sub(pts[z], pts[x])); if (tt[0] * n0[0] + tt[1] * n0[1] + tt[2] * n0[2] >= 0) tris.push(x, y, z); else tris.push(x, z, y); }
    }
    if (D.fin !== false) { // finestreta de la porta
      const wa = D.fa ?? 0.11, wb = D.fb ?? 0.14, dv = D.b * 0.45, o = contorn(wa, wb, 3, 12), b2 = fp.length;
      const c = fus.sup(D.s, th - dv / rho, 0.02); fp.push(c.p); fn.push(c.n);
      for (const q of o) { const r = fus.sup(D.s + q[0], th - (dv + q[1]) / rho, 0.02); fp.push(r.p); fn.push(r.n); }
      for (let q = 0; q < 12; q++) { const x = b2, y = b2 + 1 + q, z = b2 + 1 + (q + 1) % 12; const tt = crs(sub(fp[y], fp[x]), sub(fp[z], fp[x])); if (tt[0] * c.n[0] + tt[1] * c.n[1] + tt[2] * c.n[2] >= 0) ft.push(x, y, z); else ft.push(x, z, y); }
    }
  }
  cub.sim({ negre: malla(pts, tris, { normals: nr }) });
  if (fp.length) cub.sim({ vidre: malla(fp, ft, { normals: fn }) });
}

// ================= ALES I EMPENATGES =================
// Estació: {x (lateral), y, z (Z del bord d'atac), c, tc, tw (torsió °), g (diedre local °), fle (fletxa LE °)}
export function estacionsAla(A) {
  const est = [], xTip = A.trams[A.trams.length - 1].x, flex = A.flex ?? 0, x0 = A.x0;
  const fl = x => { const u = clamp((x - x0) / (xTip - x0), 0, 1); return [flex * u * u, 2 * flex * u / (xTip - x0)]; };
  let x = x0, yb = A.y0, z = A.z0, c = A.c0, tc = A.tc0, tw = A.tw0 ?? 0;
  est.push({ x, y: yb, z, c, tc, tw, g: A.trams[0].dih, fle: A.trams[0].fle });
  A.trams.forEach((T, ti) => {
    const xA = x, ybA = yb, zA = z, cA = c, tcA = tc, twA = tw, td = Math.tan(T.dih * GR);
    for (let k = 1; k <= T.n; k++) {
      const t = k / T.n, xx = lerp(xA, T.x, t), [fy, fd] = fl(xx);
      let g = Math.atan(td + fd) / GR;
      if (k === T.n && ti < A.trams.length - 1) g = 0.5 * (g + Math.atan(Math.tan(A.trams[ti + 1].dih * GR) + fd) / GR);
      est.push({ x: xx, y: ybA + (xx - xA) * td + fy, z: zA - (xx - xA) * Math.tan(T.fle * GR), c: lerp(cA, T.c, t), tc: lerp(tcA, T.tc, t), tw: lerp(twA, T.tw ?? twA, t), g, fle: T.fle });
    }
    x = T.x; yb = ybA + (T.x - xA) * td; z = zA - (T.x - xA) * Math.tan(T.fle * GR); c = T.c; tc = T.tc; tw = T.tw ?? tw;
  });
  est.nPla = est.length;
  if (A.punta) for (const e of estacionsWinglet(est[est.length - 1], A.punta)) est.push(e);
  return est;
}
// Winglet / sharklet: arc de radi r des de la punta fins a l'angle final, i tram recte
export function estacionsWinglet(T, W) {
  const gT = T.g * GR, up = !W.avall, gW = (up ? 90 - W.cant : -(90 - W.cant)) * GR, r = W.r;
  const C = up ? [T.x - r * Math.sin(gT), T.y + r * Math.cos(gT)] : [T.x + r * Math.sin(gT), T.y - r * Math.cos(gT)];
  const pArc = g => up ? [C[0] + r * Math.sin(g), C[1] - r * Math.cos(g)] : [C[0] - r * Math.sin(g), C[1] + r * Math.cos(g)];
  const arc = r * Math.abs(gW - gT), E = pArc(gW);
  const ell = Math.max(0.01, W.l !== undefined ? W.l - arc : (W.h - (E[1] - T.y)) / Math.sin(gW));
  const Sig = arc + ell, nA = arc > 1e-3 ? (W.nA ?? 8) : 0, nS = W.nS ?? 6;
  const sw = s => (s < arc ? lerp(T.fle ?? 25, W.fle, suau(s / arc)) : W.fle) * GR;
  const ss = []; for (let k = 1; k <= nA; k++) ss.push(arc * k / nA); for (let k = 1; k <= nS; k++) ss.push(arc + ell * k / nS);
  const out = []; let z = T.z, sp = 0;
  for (const s of ss) {
    for (let q = 0; q < 6; q++) z -= (s - sp) / 6 * Math.tan(sw(sp + (s - sp) * (q + 0.5) / 6));
    sp = s;
    let p, g;
    if (s <= arc + 1e-9) { g = up ? gT + s / r : gT - s / r; p = pArc(g); } else { const d = s - arc; p = [E[0] + d * Math.cos(gW), E[1] + d * Math.sin(gW)]; g = gW; }
    const u = s / Sig;
    out.push({ x: p[0], y: p[1], z: z - (W.dz ?? 0) * u, c: lerp(T.c, W.c, Math.pow(u, W.pc ?? 0.8)), tc: lerp(T.tc, W.tc, u), tw: lerp(T.tw ?? 0, W.tw ?? 0, u), g: g / GR, fle: W.fle });
  }
  return out;
}
// Deriva: punts [[y, zLE, zTE, tc], ...]
export function estacionsDeriva(D) {
  const est = [];
  for (let k = 0; k < D.punts.length - 1; k++) {
    const A = D.punts[k], B = D.punts[k + 1], n = Array.isArray(D.n) ? D.n[k] : D.n;
    for (let q = k === 0 ? 0 : 1; q <= n; q++) {
      const t = q / n, zl = lerp(A[1], B[1], t), zt = lerp(A[2], B[2], t);
      est.push({ x: D.x ?? 0, y: lerp(A[0], B[0], t), z: zl, c: zl - zt, tc: lerp(A[3], B[3], t), tw: 0, g: D.g ?? 90 });
    }
  }
  return est;
}
export function frameEst(E) {
  const g = E.g * GR, a = (E.tw ?? 0) * GR, ca = Math.cos(a), sa = Math.sin(a);
  const n0 = [-Math.sin(g), Math.cos(g), 0], d0 = [0, 0, -1];
  return { o: [E.x, E.y, E.z], d: [d0[0] * ca - n0[0] * sa, d0[1] * ca - n0[1] * sa, d0[2] * ca - n0[2] * sa],
    n: [n0[0] * ca + d0[0] * sa, n0[1] * ca + d0[1] * sa, n0[2] * ca + d0[2] * sa], e: [Math.cos(g), Math.sin(g), 0], c: E.c, tc: E.tc };
}
export const superficieAla = (est, perfil, o) => lamina(est.map(frameEst), perfil, o);
export function interpAla(est, x) {
  const n = est.nPla ?? est.length; let k = 0;
  while (k < n - 2 && est[k + 1].x < x) k++;
  const A = est[k], B = est[k + 1], t = clamp((x - A.x) / (B.x - A.x), 0, 1), r = {};
  for (const q of ['x', 'y', 'z', 'c', 'tc', 'tw', 'g']) r[q] = lerp(A[q] ?? 0, B[q] ?? 0, t);
  return r;
}
// Punt de la superfície de l'ala (f = fracció de corda; sup = extradós)
export function puntAla(est, x, f, sup, m = 0.02, p = 0.45) {
  const E = interpAla(est, x), F = frameEst(E), y = curvNACA(f, m, p) + (sup ? 1 : -1) * E.tc * gruixNACA(f);
  return [F.o[0] + (F.d[0] * f + F.n[0] * y) * E.c, F.o[1] + (F.d[1] * f + F.n[1] * y) * E.c, F.o[2] + (F.d[2] * f + F.n[2] * y) * E.c];
}
// Carenats dels rails dels flaps (canoes sota l'ala)
export function carenatsFlaps(est, A, cub) {
  const f0 = A.flapF0 ?? 0.5, ext = A.flapExt ?? 0.3;
  for (const x of A.flaps || []) {
    const E = interpAla(est, x), c = E.c, w = (A.flapW ?? 0.12) * Math.min(1, c / 3 + 0.3), h = (A.flapH ?? 0.22) * Math.min(1, c / 3 + 0.3);
    const te = puntAla(est, x, 1, false, A.m, A.p), secc = [], nS = 14;
    for (let k = 0; k <= nS; k++) {
      const t = k / nS, f = f0 + t * (1 - f0 + ext), pr = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 1.5))), 0.6);
      let q;
      if (f <= 1) q = puntAla(est, x, f, false, A.m, A.p);
      else q = [te[0], te[1] - (f - 1) * c * 0.06, te[2] - (f - 1) * c];
      secc.push({ x: q[0], y: q[1] - h * pr * 0.3, z: q[2], rx: w * pr, ry: h * pr, e: 2.2 });
    }
    cub.sim(cos(secc, 12, { material: 'ala' }));
  }
}

// ================= MOTORS =================
// Turbofan en coordenades locals: eix +Z cap endavant, origen al centre del llavi d'entrada
export function crearMotor(M) {
  const rF = M.dFan / 2, rMax = M.dMax / 2, Lc = M.Lc, seg = M.seg ?? 48;
  const ri = rF * 0.985, rhl = rF * (M.hl ?? 1.06), b = rhl - ri, ro = rhl + b, a = (M.lipA ?? 0.17) * rF;
  const zF = (M.zFan ?? 0.55) * rF, rEx = (M.rEx ?? 0.86) * rF, tTE = 0.006 * rF;
  const prof = [];
  const pnt = (z, r, m, fl = 0, ch = 0) => prof.push({ z, r, m, fl, ch });
  // conducte d'entrada (del ventilador cap a la gola)
  pnt(-zF - 0.02 * rF, rF * 1.004, 'metall', 0);
  pnt(-(a + (zF - a) * 0.5), rF * 0.993, 'metall', 0.25);
  // llavi
  const nL = 10;
  for (let k = 0; k <= nL; k++) { const ps = -Math.PI / 2 + Math.PI * k / nL; pnt(-a + a * Math.cos(ps), rhl + b * Math.sin(ps), k < nL ? 'metall' : 'accent', lerp(0.45, 1, k / nL)); }
  // carenat exterior
  const cr = pchip([[0, ro], [M.xMax ?? 0.35, rMax, 0], [1, rEx]]), nC = 16;
  const chW = t => M.xebrons ? (t > 0.999 ? 1 : t > 0.93 ? 0.55 : t > 0.86 ? 0.2 : 0) : 0;
  const flW = t => 1 - suau((t - 0.35) / 0.4);
  for (let k = 1; k <= nC; k++) { const t = k / nC; pnt(-a - (Lc - a) * t, cr(t), 'accent', flW(t), chW(t)); }
  prof[prof.length - 1].m = 'metall';
  pnt(-Lc, rEx, 'metall', 0, 1); // aresta de sortida (vores separades)
  pnt(-Lc, rEx - tTE, 'metall', 0, 1);
  pnt(-Lc, rEx - tTE, 'metall', 0, 1);
  const bw = pchip([[0, rEx - tTE], [0.3, rEx * 1.03], [1, rF * 0.99]]);
  for (let k = 1; k <= 5; k++) { const t = k / 5; pnt(lerp(-Lc, -zF - 0.32 * rF, t), bw(t), 'metall', 0, k === 1 ? 0.55 : k === 2 ? 0.2 : 0); }
  const forma = (ang, r, z, j) => {
    let x = r * Math.cos(ang), y = r * Math.sin(ang);
    const Q = prof[j % prof.length];
    if (M.aplanat && Q.fl) { const s = Math.sin(ang); if (s < 0) { const k = M.aplanat * Q.fl; y *= 1 - k * s * s; x *= 1 + 0.3 * k * s * s; } }
    if (M.xebrons && Q.ch) {
      const u = ang * M.xebrons / (2 * Math.PI) + 0.5, tooth = 1 - Math.abs(2 * (u - Math.floor(u)) - 1);
      z -= (M.dXeb ?? 0.12 * rF) * (tooth - 0.5) * Q.ch;
      const rr = 1 - 0.035 * tooth * Q.ch; x *= rr; y *= rr;
    }
    if (M.ovalitat) y *= M.ovalitat;
    return [x, y, z];
  };
  const out = {};
  const ajunta = mp => { for (const k in mp) out[k] ? afegirA(out[k], mp[k]) : (out[k] = mp[k]); };
  ajunta(torn(prof.map(q => [q.z, q.r]), seg, { tanca: true, forma, mat: j => prof[j].m, centre: [0, 0, -Lc / 2] }));
  // ventilador: pales
  const nB = M.pales ?? 22, rH = (M.hub ?? 0.3) * rF, pal = perfilNACA(3, 0, 0.4);
  for (let q = 0; q < nB; q++) {
    const al = 2 * Math.PI * q / nB, er = [Math.cos(al), Math.sin(al), 0], et = [-Math.sin(al), Math.cos(al), 0], est = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4, r = lerp(rH * 0.9, rF * 0.975, t), be = lerp(M.bArrel ?? 32, M.bPunta ?? 62, t) * GR, ch = lerp(0.3, M.cPunta ?? 0.42, t) * rF;
      const d = [et[0] * Math.sin(be), et[1] * Math.sin(be), -Math.cos(be)], n = nrm(crs(er, d));
      est.push({ o: [r * er[0] - d[0] * ch / 2, r * er[1] - d[1] * ch / 2, -zF - 0.12 * rF - d[2] * ch / 2], d, n, e: er, c: ch, tc: 0.07 });
    }
    ajunta(lamina(est, pal, { material: 'metall' }));
  }
  // disc fosc darrere el ventilador (les dues cares)
  for (const [z, sg] of [[-zF - 0.34 * rF, 1], [-zF - 0.35 * rF, -1]]) {
    const pts = [[0, 0, z]], tr = [];
    for (let i = 0; i <= seg; i++) { const t = 2 * Math.PI * i / seg; pts.push([rF * 1.0 * Math.cos(t), rF * Math.sin(t), z]); }
    for (let k = 1; k < pts.length - 1; k++) tr.push(0, k, k + 1);
    ajunta({ negre: malla(pts, tr, { cap: [0, 0, sg], normals: pts.map(() => [0, 0, sg]) }) });
  }
  // con d'entrada (spinner)
  const Ls = (M.spinL ?? 0.5) * rF, sf = corbaArrel(M.spinForma ?? [[0, 0], [0.12, 0.42], [0.5, 0.82], [1, 1]]), sp = [];
  for (let k = 0; k <= 12; k++) { const t = k / 12; sp.push([-zF - 0.1 * rF + Ls * (1 - t), rH * sf(t)]); }
  sp.push([-zF - 0.3 * rF, rH]);
  ajunta(torn(sp, seg, { material: 'metall' }));
  // nucli: carenat, nozzle, ressalt fosc i con de sortida
  const rC0 = (M.rC0 ?? 0.62) * rF, rC1 = (M.rC1 ?? 0.5) * rF, Lk = (M.Lcore ?? 0.35) * rF, Lp = (M.Lplug ?? 0.45) * rF;
  const zC = -Lc - Lk, rP = rC1 * 0.72, cp = [];
  const cc = pchip([[0, rC0 * 1.02], [1, rC1]]);
  cp.push([-zF - 0.33 * rF, rH * 1.15, 'metall'], [-Lc * 0.65, rC0 * 1.1, 'metall']);
  for (let k = 0; k <= 4; k++) cp.push([lerp(-Lc, zC, k / 4), cc(k / 4), k < 4 ? 'metall' : 'negre']);
  cp.push([zC, rC1, 'negre'], [zC - 0.01, rP, 'metall'], [zC - 0.01, rP, 'metall']);
  const pf = M.plugForma ?? 0.9;
  for (let k = 1; k <= 7; k++) { const t = k / 7; cp.push([zC - 0.01 - Lp * t, rP * Math.pow(1 - t, pf) * (1 - 0.15 * t * (1 - t)), 'metall']); }
  // vores: duplica punts del canvi de material (aresta viva)
  ajunta(torn(cp.map(q => [q[0], q[1]]), seg, { mat: j => cp[j][2], centre: [0, 0, -Lc] }));
  return { mapa: out, rF, rMax, Lc, cr, a, ro, rC0, rC1, zC, Lk, Lp };
}

// Pilona entre el motor (posició global esquerra) i l'ala
export function crearPilo(M, mot, pos, est, A, cub) {
  const [X, Y, Zh] = pos, E = interpAla(est, X), zLE = E.z, yW = E.y + (E.c * 0.02);
  const zF = Zh - (M.piloF ?? 0.18) * mot.Lc, zB = Zh - mot.Lc - Math.max(0.2, mot.Lk) * (M.piloB ?? 0.85);
  const wM = (M.piloW ?? 0.15) * mot.rMax, secc = [], nS = 16;
  for (let k = 0; k <= nS; k++) {
    const t = k / nS, z = lerp(zF, zB, t);
    const u = clamp((mot.a - (z - Zh)) / (mot.Lc - mot.a), 0, 1);
    const rt = (z - Zh) > -mot.Lc ? mot.cr(u) : lerp(mot.rC0, mot.rC1, clamp((Zh - mot.Lc - z) / Math.max(0.01, mot.Lk), 0, 1));
    const yb = Y + rt * (M.ovalitat ?? 1) - 0.12 * mot.rMax;
    const yt = lerp(yb + 0.35 * mot.rMax, yW, suau((zF - z) / Math.max(0.3, (zF - zLE) * (M.piloPend ?? 1.0))));
    const w = wM * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.45);
    secc.push({ x: X, y: (yb + yt) / 2, z, rx: Math.max(w, 1e-4) * (k === 0 || k === nS ? 0 : 1), ry: Math.max(0.01, (yt - yb) / 2) * (k === 0 || k === nS ? 0 : 1), e: 3 });
  }
  cub.sim(cos(secc, 12, { material: 'ala' }));
}

// Turbohèlix (ATR): góndola sota l'ala, en coordenades globals (costat esquerre)
export function crearGondolaHelix(M, est, cub, Z) {
  const X = M.x, Y = M.y, z0 = Z(M.s), E = interpAla(est, X), yW = E.y - E.c * 0.02, zLE = E.z, secc = [], n = 22;
  const len = M.len;
  for (let k = 0; k <= n; k++) {
    const t = k / n, z = z0 - len * t;
    // perfil superior: de l'spinner a l'ala; inferior: baixa ràpid i puja al final
    const top = lerp(Y + M.rSp, yW + 0.1, suau((z0 - z) / Math.max(0.5, z0 - zLE)));
    const bot = Y - M.rSp - (M.baix - M.rSp) * suau(t / 0.22) + (M.baix + (yW - Y) * 0.6) * suau((t - 0.62) / 0.38);
    const w = M.rSp + (M.ample - M.rSp) * suau(t / 0.2) - (M.ample - 0.02) * suau((t - 0.7) / 0.3);
    const f = k === n ? 0 : 1;
    secc.push({ x: X, y: (top + bot) / 2, z, rx: w * f, ry: Math.max(0.02, (top - bot) / 2) * f, e: 2.3 });
  }
  cub.sim(cos(secc, 28, { material: 'accent' }));
  // presa d'aire inferior (fosca)
  const zi = z0 - 0.35, yi = Y - M.rSp - 0.14, pts = [[X, yi, zi]], tr = [];
  for (let i = 0; i <= 16; i++) { const t = 2 * Math.PI * i / 16; pts.push([X + 0.2 * Math.cos(t), yi + 0.09 * Math.sin(t), zi + 0.12]); }
  for (let k = 1; k < pts.length - 1; k++) tr.push(0, k, k + 1);
  cub.sim({ negre: malla(pts, tr, { cap: [0, 0.3, 1], normals: pts.map(() => nrm([0, 0.2, 1])) }) });
  // spinner
  const sp = [], sf = corbaArrel([[0, 0], [0.1, 0.32], [0.5, 0.8], [1, 1]]);
  for (let k = 0; k <= 12; k++) { const t = k / 12; sp.push([M.lSp * (1 - t), M.rSp * 0.98 * sf(t)]); }
  sp.push([-0.15, M.rSp * 0.98]);
  cub.sim(torn(sp, 32, { material: 'metall' }), mat([X, Y, z0]));
}
// Hèlix: pales al voltant de l'eix Z local (origen al centre del boixet)
export function crearHelix(H) {
  const out = peca(), pal = perfilNACA(3, 0.02, 0.4);
  for (let q = 0; q < H.pales; q++) {
    const al = 2 * Math.PI * q / H.pales + (H.fase ?? 0.3), er = [Math.cos(al), Math.sin(al), 0], et = [-Math.sin(al), Math.cos(al), 0], est = [];
    const nS = 8;
    for (let k = 0; k <= nS; k++) {
      const t = k / nS, r = lerp(H.r0, H.R, t);
      const ch = H.c * (t < 0.45 ? lerp(0.75, 1, suau(t / 0.45)) : lerp(1, 0.35, Math.pow((t - 0.45) / 0.55, 1.6)));
      const be = Math.atan(H.pas / (2 * Math.PI * Math.max(r, 0.3 * H.R)));
      const d = [et[0] * Math.cos(be) * H.sentit, et[1] * Math.cos(be) * H.sentit, -Math.sin(be)], n = nrm(crs(er, d));
      const sk = (t * t) * H.c * 0.6; // fletxa de la pala (cimitarra)
      est.push({ o: [r * er[0] - d[0] * ch * 0.3 + et[0] * sk * H.sentit * 0.0, r * er[1] - d[1] * ch * 0.3, -d[2] * ch * 0.3 + 0.0 - sk * 0.15], d, n, e: er, c: ch, tc: lerp(0.16, 0.06, t) });
    }
    afegirA(out, lamina(est, pal, { material: 'negre' }).negre);
  }
  return out;
}

// ================= TREN D'ATERRATGE =================
function roda(D, A) {
  const R = D / 2, rr = R * 0.56, w = A / 2, rc = (R + rr) / 2, hr = (R - rr) / 2, pr = [];
  for (let k = 0; k < 16; k++) { const ps = 2 * Math.PI * k / 16; pr.push([w * spow(Math.cos(ps), 2 / 3), rc + hr * spow(Math.sin(ps), 2 / 2.6)]); }
  const tyre = torn(pr, 28, { tanca: true, material: 'negre', centre: [0, 0, 0] }).negre;
  const out = { negre: peca(), metall: peca() };
  afegirA(out.negre, tyre, mat([0, 0, 0], [0, 90, 0]));
  const hub = torn([[w * 0.62, 0], [w * 0.6, rr * 0.35], [w * 0.68, rr * 0.75], [w * 0.8, rr * 1.04]], 24, { material: 'metall', centre: [0, 0, 0] }).metall;
  afegirA(out.metall, hub, mat([0, 0, 0], [0, 90, 0]));
  afegirA(out.metall, hub, mat([0, 0, 0], [0, -90, 0]));
  return out;
}
const placa = (c, sx, sy, sz, rot = [0, 0, 0]) => { const p = peca(); afegirA(p, caixa(sx, sy, sz), mat(c, rot)); return p; };

// Retorna un Cub amb tot el tren (costat esquerre + simètric)
export function crearTren(G, ctx) {
  const cub = new Cub(), yG = -G.hEix, Z = ctx.Z;
  // --- tren de morro
  const Nd = G.morro, zn = Z(Nd.s), Rn = Nd.D / 2, yAx = yG + Rn, yTop = ctx.fus.sec(Nd.s).bot + 0.35;
  const rs = Nd.r ?? 0.09, sep = Nd.sep ?? (Nd.A + 0.12), zAx = zn - (Nd.rake ?? 0.12);
  cub.afegeix('metall', tub([0, yTop, zn], [0, yAx + Rn * 0.6, zn - (Nd.rake ?? 0.12) * 0.7], rs, rs, 12));
  cub.afegeix('metall', tub([0, yAx + Rn * 0.75, zn - (Nd.rake ?? 0.12) * 0.75], [0, yAx, zAx], rs * 0.7, rs * 0.7, 10));
  cub.afegeix('metall', tub([-sep / 2, yAx, zAx], [sep / 2, yAx, zAx], rs * 0.45, rs * 0.45, 8));
  cub.afegeix('metall', tub([0, yTop - 0.05, zn + (yTop - yAx) * 0.55], [0, lerp(yTop, yAx, 0.55), zn], rs * 0.5, rs * 0.5, 8));
  for (const sx of [-1, 1]) cub.mapa(roda(Nd.D, Nd.A), mat([sx * sep / 2, yAx, zAx]));
  if (Nd.portes !== false) {
    const dl = Nd.portaL ?? 1.2, dh = Nd.portaH ?? 0.7, xd = Nd.portaX ?? 0.42, yb = ctx.fus.sec(Nd.s).bot;
    for (const sx of [-1, 1]) cub.afegeix('ventre', placa([sx * xd, yb - dh / 2 + 0.08, zn - dl * 0.15], 0.03, dh, dl));
  }
  // --- tren principal
  const Mg = G.princ, R = Mg.D / 2, rsm = Mg.r ?? 0.14, xg = Mg.via / 2, zg = Z(Mg.s), yA = yG + R;
  const yT = Mg.yTop ?? (ctx.est ? interpAla(ctx.est, xg).y + 0.05 : -1);
  const sepM = Mg.sep ?? (Mg.A + 0.15);
  const L = new Cub();
  const eixos = Mg.tipus === 'bogie6' ? [-1, 0, 1] : Mg.tipus === 'bogie4' ? [-0.5, 0.5] : [0];
  const pas = Mg.pas ?? 1.45, bogie = eixos.length > 1;
  const yPiv = bogie ? yA + R * 0.35 : yA;
  if (Mg.tipus === 'braç') { // ATR: braç arrossegat des del carenat lateral
    const piv = [xg - 0.05, yT, zg + 0.75];
    L.afegeix('metall', tub(piv, [xg, yA, zg], rsm, rsm * 0.8, 10));
    L.afegeix('metall', tub([xg, yT + 0.1, zg + 0.1], [xg, lerp(yT, yA, 0.6), lerp(zg + 0.75, zg, 0.6)], rsm * 0.7, rsm * 0.7, 10));
  } else {
    L.afegeix('metall', tub([xg, yT, zg], [xg, yPiv + R * 0.55, zg], rsm, rsm, 14));
    L.afegeix('metall', tub([xg, yPiv + R * 0.8, zg], [xg, yPiv, zg], rsm * 0.72, rsm * 0.72, 12));
    // tirant lateral
    L.afegeix('metall', tub([xg, lerp(yT, yPiv, 0.45), zg], [xg - (Mg.brac ?? 1.4), yT + 0.1, zg + 0.15], rsm * 0.4, rsm * 0.4, 8));
    // compàs (torque links)
    L.afegeix('metall', placa([xg, yPiv + R * 0.75, zg + rsm * 1.3], 0.06, R * 0.6, 0.08, [0, 0, 0]));
  }
  if (bogie) L.afegeix('metall', tub([xg, yPiv, zg + pas * eixos[0] - 0.3], [xg, yPiv, zg + pas * eixos[eixos.length - 1] + 0.3], rsm * 0.55, rsm * 0.55, 10));
  for (const e of eixos) {
    const z = zg + e * pas;
    if (bogie) L.afegeix('metall', tub([xg, yPiv, z], [xg, yA, z], rsm * 0.35, rsm * 0.35, 6));
    L.afegeix('metall', tub([xg - sepM / 2, yA, z], [xg + sepM / 2, yA, z], rsm * 0.35, rsm * 0.35, 8));
    for (const sx of [-1, 1]) L.mapa(roda(Mg.D, Mg.A), mat([xg + sx * sepM / 2, yA, z]));
  }
  if (Mg.porta) { // porta de la cama
    const ph = (yT - yPiv) * 0.75, pw = Mg.porta;
    L.afegeix('ventre', placa([xg + rsm + 0.06, yT - ph / 2 - 0.05, zg], 0.03, ph, pw));
  }
  for (const [m, pc] of L.mats) cub.sim({ [m]: pc });
  return cub;
}

// Antena de pala petita (base dins del fuselatge)
export function antena(fus, s, amunt, alt, corda, material, cub) {
  const S = fus.sec(s), y0 = amunt ? S.top - 0.06 : S.bot + 0.06, sg = amunt ? 1 : -1, Z = fus.Z;
  const est = estacionsDeriva({ punts: [[y0, Z(s), Z(s + corda), 0.12], [y0 + sg * alt, Z(s + corda * 0.75), Z(s + corda * 1.15), 0.1]], n: 1, g: amunt ? 90 : -90 });
  cub.mapa(superficieAla(est, perfilNACA(3, 0, 0.4), { material }));
}
// Llum de navegació
export function llum(p, r, material, cub) { cub.afegeix(material, esfera(r, 12, 8, 'm'), mat(p)); }
