// geo.js — primitives geomètriques per generar els models d'avió (eina de desenvolupament, no s'envia)
import * as THREE from 'three';

export const GR = Math.PI / 180;
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const suau = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const spow = (x, e) => (x < 0 ? -Math.pow(-x, e) : Math.pow(x, e));
export const MIRALL = new THREE.Matrix4().makeScale(-1, 1, 1);

// Interpolació monòtona (PCHIP) sobre claus [[x, y, pendent?], ...]
export function pchip(claus) {
  const n = claus.length, X = claus.map(k => k[0]), Y = claus.map(k => k[1]);
  const h = [], d = [];
  for (let i = 0; i < n - 1; i++) { h[i] = X[i + 1] - X[i]; d[i] = (Y[i + 1] - Y[i]) / h[i]; }
  const m = new Array(n).fill(0);
  if (n === 2) m[0] = m[1] = d[0];
  else {
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) m[i] = 0;
      else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
    }
    const ext = (h0, h1, d0, d1) => {
      let v = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
      if (Math.sign(v) !== Math.sign(d0)) v = 0;
      else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(v) > Math.abs(3 * d0)) v = 3 * d0;
      return v;
    };
    m[0] = ext(h[0], h[1], d[0], d[1]);
    m[n - 1] = ext(h[n - 2], h[n - 3], d[n - 2], d[n - 3]);
  }
  for (let i = 0; i < n; i++) if (claus[i].length > 2) m[i] = claus[i][2];
  return x => {
    if (x <= X[0]) return Y[0];
    if (x >= X[n - 1]) return Y[n - 1];
    let i = 0; while (x > X[i + 1]) i++;
    const t = (x - X[i]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * Y[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}
// Corba per al morro: interpolació en √t (punta roma, tangent vertical a t = 0)
export const corbaArrel = claus => { const f = pchip(claus.map(k => [Math.sqrt(k[0]), k[1]])); return t => f(Math.sqrt(clamp(t, 0, 1))); };

// ---------- Peces (geometria indexada simple: p posicions, n normals, i índexs) ----------
export const peca = () => ({ p: [], n: [], i: [] });

export function afegirA(d, s, m) {
  const off = d.p.length / 3;
  if (!m) {
    for (let k = 0; k < s.p.length; k++) { d.p.push(s.p[k]); d.n.push(s.n[k]); }
    for (let k = 0; k < s.i.length; k++) d.i.push(s.i[k] + off);
    return;
  }
  const e = m.elements, nm = new THREE.Matrix3().getNormalMatrix(m).elements, det = m.determinant();
  for (let k = 0; k < s.p.length; k += 3) {
    const x = s.p[k], y = s.p[k + 1], z = s.p[k + 2];
    d.p.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
    const a = s.n[k], b = s.n[k + 1], c = s.n[k + 2];
    const nx = nm[0] * a + nm[3] * b + nm[6] * c, ny = nm[1] * a + nm[4] * b + nm[7] * c, nz = nm[2] * a + nm[5] * b + nm[8] * c;
    const l = Math.hypot(nx, ny, nz) || 1;
    d.n.push(nx / l, ny / l, nz / l);
  }
  if (det >= 0) for (let k = 0; k < s.i.length; k++) d.i.push(s.i[k] + off);
  else for (let k = 0; k < s.i.length; k += 3) d.i.push(s.i[k] + off, s.i[k + 2] + off, s.i[k + 1] + off);
}

// Cub: acumula peces per material
export class Cub {
  constructor() { this.mats = new Map(); }
  get(mat) { let d = this.mats.get(mat); if (!d) this.mats.set(mat, d = peca()); return d; }
  afegeix(mat, pc, m) { if (pc && pc.p.length) afegirA(this.get(mat), pc, m); }
  // mapa {material: peça}; canvis: reanomenar materials
  mapa(mp, m, canvis) { for (const k in mp) this.afegeix(canvis?.[k] ?? k, mp[k], m); }
  // també la còpia simètrica respecte del pla X = 0
  sim(mp, m, canvis) {
    this.mapa(mp, m, canvis);
    const mm = MIRALL.clone(); if (m) mm.multiply(m);
    this.mapa(mp, mm, canvis);
  }
}

// ---------- Superfície paramètrica en graella ----------
// f(i, j) -> [x, y, z]; o.tancaU/tancaV: tancada en u/v; o.mat(i, j) -> material o null (cel·la buida);
// o.orient: 'fora' | 'dins' (respecte del centroide o de o.centre). Normals suaus per mitjana de cares.
export function superficie(nu, nv, f, o = {}) {
  const cu = o.tancaU ? nu : nu + 1, cv = o.tancaV ? nv : nv + 1, N = cu * cv;
  const P = new Float64Array(N * 3);
  for (let j = 0; j < cv; j++) for (let i = 0; i < cu; i++) {
    const q = f(i, j), k = (j * cu + i) * 3; P[k] = q[0]; P[k + 1] = q[1]; P[k + 2] = q[2];
  }
  const id = (i, j) => (j % cv) * cu + (i % cu);
  const igual = (a, b) => { const x = P[a * 3] - P[b * 3], y = P[a * 3 + 1] - P[b * 3 + 1], z = P[a * 3 + 2] - P[b * 3 + 2]; return x * x + y * y + z * z < 1e-12; };
  const T = [], TM = [];
  const tri = (a, b, c, m) => { if (igual(a, b) || igual(b, c) || igual(a, c)) return; T.push(a, b, c); TM.push(m); };
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const m = o.mat ? o.mat(i, j) : 'm'; if (m == null) continue;
    const a = id(i, j), b = id(i + 1, j), c = id(i + 1, j + 1), d = id(i, j + 1);
    tri(a, b, c, m); tri(a, c, d, m);
  }
  if (o.orient) orientar(P, T, o.orient, o.centre);
  const Nn = normalsCares(P, T, N);
  // pols: files o columnes col·lapsades en un punt -> normal mitjana
  const fixa = idx => {
    for (let q = 1; q < idx.length; q++) if (!igual(idx[0], idx[q])) return;
    let x = 0, y = 0, z = 0; for (const k of idx) { x += Nn[k * 3]; y += Nn[k * 3 + 1]; z += Nn[k * 3 + 2]; }
    for (const k of idx) { Nn[k * 3] = x; Nn[k * 3 + 1] = y; Nn[k * 3 + 2] = z; }
  };
  for (let j = 0; j < cv; j++) { const r = []; for (let i = 0; i < cu; i++) r.push(id(i, j)); fixa(r); }
  for (let i = 0; i < cu; i++) { const r = []; for (let j = 0; j < cv; j++) r.push(id(i, j)); fixa(r); }
  normalitza(Nn);
  return separar(P, Nn, T, TM);
}

function orientar(P, T, mode, centre) {
  let cx = 0, cy = 0, cz = 0;
  if (centre) [cx, cy, cz] = centre;
  else { const n = P.length / 3; for (let k = 0; k < P.length; k += 3) { cx += P[k]; cy += P[k + 1]; cz += P[k + 2]; } cx /= n; cy /= n; cz /= n; }
  let v = 0;
  for (let k = 0; k < T.length; k += 3) {
    const a = T[k] * 3, b = T[k + 1] * 3, c = T[k + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    v += nx * ((P[a] + P[b] + P[c]) / 3 - cx) + ny * ((P[a + 1] + P[b + 1] + P[c + 1]) / 3 - cy) + nz * ((P[a + 2] + P[b + 2] + P[c + 2]) / 3 - cz);
  }
  if ((mode === 'fora' && v < 0) || (mode === 'dins' && v > 0)) for (let k = 0; k < T.length; k += 3) { const t = T[k + 1]; T[k + 1] = T[k + 2]; T[k + 2] = t; }
}

function normalsCares(P, T, N) {
  const Nn = new Float64Array(N * 3);
  for (let k = 0; k < T.length; k += 3) {
    const a = T[k] * 3, b = T[k + 1] * 3, c = T[k + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    for (const q of [a, b, c]) { Nn[q] += nx; Nn[q + 1] += ny; Nn[q + 2] += nz; }
  }
  return Nn;
}
function normalitza(Nn) {
  for (let k = 0; k < Nn.length; k += 3) {
    const l = Math.hypot(Nn[k], Nn[k + 1], Nn[k + 2]);
    if (l > 1e-20) { Nn[k] /= l; Nn[k + 1] /= l; Nn[k + 2] /= l; } else { Nn[k] = 0; Nn[k + 1] = 1; Nn[k + 2] = 0; }
  }
}
// Separa una malla en peces per material (reindexant)
function separar(P, Nn, T, TM) {
  const out = {}, mapes = {};
  for (let t = 0; t < TM.length; t++) {
    const m = TM[t];
    let pc = out[m]; if (!pc) { pc = out[m] = peca(); mapes[m] = new Map(); }
    const mp = mapes[m];
    for (let q = 0; q < 3; q++) {
      const v = T[t * 3 + q];
      let k = mp.get(v);
      if (k === undefined) { k = pc.p.length / 3; mp.set(v, k); pc.p.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); pc.n.push(Nn[v * 3], Nn[v * 3 + 1], Nn[v * 3 + 2]); }
      pc.i.push(k);
    }
  }
  return out;
}

// Malla a partir de punts i triangles (normals suaus calculades, orientació opcional)
export function malla(punts, tris, o = {}) {
  const P = new Float64Array(punts.length * 3);
  punts.forEach((q, k) => { P[k * 3] = q[0]; P[k * 3 + 1] = q[1]; P[k * 3 + 2] = q[2]; });
  const T = tris.slice();
  if (o.orient) orientar(P, T, o.orient, o.centre);
  if (o.cap) { // orienta perquè la normal mitjana apunti cap a o.cap
    const Nt = normalsCares(P, T, punts.length); let s = 0;
    for (let k = 0; k < Nt.length; k += 3) s += Nt[k] * o.cap[0] + Nt[k + 1] * o.cap[1] + Nt[k + 2] * o.cap[2];
    if (s < 0) for (let k = 0; k < T.length; k += 3) { const t = T[k + 1]; T[k + 1] = T[k + 2]; T[k + 2] = t; }
  }
  let Nn;
  if (o.normals) { Nn = new Float64Array(punts.length * 3); o.normals.forEach((q, k) => { Nn[k * 3] = q[0]; Nn[k * 3 + 1] = q[1]; Nn[k * 3 + 2] = q[2]; }); }
  else Nn = normalsCares(P, T, punts.length);
  normalitza(Nn);
  const pc = peca();
  pc.p = Array.from(P); pc.n = Array.from(Nn); pc.i = T;
  return pc;
}

// ---------- Primitives ----------
// Revolució al voltant de l'eix Z local; perfil [[z, r], ...]; o.forma(a, r, z, j) -> [x, y, z]
export function torn(perfil, seg, o = {}) {
  const tanca = !!o.tanca, nv = tanca ? perfil.length : perfil.length - 1;
  return superficie(seg, nv, (i, j) => {
    const a = 2 * Math.PI * i / seg + (o.fase || 0), q = perfil[j % perfil.length], z = q[0], r = q[1];
    return o.forma ? o.forma(a, r, z, j) : [r * Math.cos(a), r * Math.sin(a), z];
  }, { tancaU: true, tancaV: tanca, orient: o.orient === undefined ? 'fora' : o.orient, centre: o.centre,
    mat: o.mat ? ((i, j) => o.mat(j, i)) : (() => o.material ?? 'm') });
}

// Cos de seccions superel·líptiques {x, y, z, rx, ry, e} (anells en plans Z = const)
export function cos(secc, nRad, o = {}) {
  return superficie(nRad, secc.length - 1, (i, j) => {
    const S = secc[j], a = 2 * Math.PI * i / nRad + (o.fase || 0), e = S.e ?? 2;
    return [S.x + S.rx * spow(Math.cos(a), 2 / e), S.y + S.ry * spow(Math.sin(a), 2 / e), S.z];
  }, { tancaU: true, orient: 'fora', mat: o.mat ?? (() => o.material ?? 'm') });
}

export function esfera(r, nu = 14, nv = 8, mat = 'm') {
  return superficie(nu, nv, (i, j) => {
    const a = 2 * Math.PI * i / nu, b = Math.PI * j / nv;
    return [r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)];
  }, { tancaU: true, orient: 'fora', mat: () => mat })[mat];
}

// Caixa amb normals planes, centrada a l'origen
export function caixa(sx, sy, sz) {
  const pc = peca(), h = [sx / 2, sy / 2, sz / 2];
  const cares = [[0, 1, 2], [0, -1, 2], [1, 1, 0], [1, -1, 0], [2, 1, 1], [2, -1, 1]];
  for (const [ax, sg] of cares) {
    const u = (ax + 1) % 3, v = (ax + 2) % 3, b = pc.p.length / 3;
    for (const [du, dv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const q = [0, 0, 0]; q[ax] = sg * h[ax]; q[u] = du * h[u]; q[v] = dv * h[v];
      const n = [0, 0, 0]; n[ax] = sg;
      pc.p.push(...q); pc.n.push(...n);
    }
    if (sg > 0) pc.i.push(b, b + 1, b + 2, b, b + 2, b + 3); else pc.i.push(b, b + 2, b + 1, b, b + 3, b + 2);
  }
  return pc;
}

// Tub (tronc de con) entre dos punts, amb tapes planes opcionals
export function tub(p0, p1, r0, r1 = r0, seg = 12, tapes = true) {
  const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1), d = b.clone().sub(a), len = d.length(); d.normalize();
  const u = new THREE.Vector3(1, 0, 0); if (Math.abs(d.x) > 0.9) u.set(0, 1, 0);
  const v = new THREE.Vector3().crossVectors(d, u).normalize(); u.crossVectors(v, d).normalize();
  const pc = peca(), k = (r0 - r1) / len;
  for (let i = 0; i <= seg; i++) {
    const t = 2 * Math.PI * i / seg, c = Math.cos(t), s = Math.sin(t);
    const rad = u.clone().multiplyScalar(c).add(v.clone().multiplyScalar(s));
    const n = rad.clone().add(d.clone().multiplyScalar(k)).normalize();
    for (const [q, r] of [[a, r0], [b, r1]]) { const p = q.clone().add(rad.clone().multiplyScalar(r)); pc.p.push(p.x, p.y, p.z); pc.n.push(n.x, n.y, n.z); }
  }
  for (let i = 0; i < seg; i++) { const q = i * 2; pc.i.push(q, q + 2, q + 3, q, q + 3, q + 1); }
  if (tapes) for (const [q, r, sg] of [[a, r0, -1], [b, r1, 1]]) {
    if (r <= 0) continue;
    const c0 = pc.p.length / 3; pc.p.push(q.x, q.y, q.z); pc.n.push(d.x * sg, d.y * sg, d.z * sg);
    for (let i = 0; i < seg; i++) {
      const t = 2 * Math.PI * i / seg, p = q.clone().add(u.clone().multiplyScalar(Math.cos(t) * r)).add(v.clone().multiplyScalar(Math.sin(t) * r));
      pc.p.push(p.x, p.y, p.z); pc.n.push(d.x * sg, d.y * sg, d.z * sg);
    }
    for (let i = 0; i < seg; i++) { const x = c0 + 1 + i, y = c0 + 1 + (i + 1) % seg; if (sg > 0) pc.i.push(c0, x, y); else pc.i.push(c0, y, x); }
  }
  // orientació de la superfície lateral: comprova i gira si cal
  return orientaPeca(pc, [(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2]);
}
// Gira tots els triangles d'una peça si la majoria de normals geomètriques no coincideixen amb les normals emmagatzemades
export function orientaPeca(pc) {
  let s = 0;
  for (let k = 0; k < pc.i.length; k += 3) {
    const a = pc.i[k] * 3, b = pc.i[k + 1] * 3, c = pc.i[k + 2] * 3, P = pc.p;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    s += Math.sign(nx * pc.n[a] + ny * pc.n[a + 1] + nz * pc.n[a + 2]);
  }
  if (s < 0) for (let k = 0; k < pc.i.length; k += 3) { const t = pc.i[k + 1]; pc.i[k + 1] = pc.i[k + 2]; pc.i[k + 2] = t; }
  return pc;
}

// Matriu de translació + rotació (Euler XYZ en graus) + escala
export function mat(pos = [0, 0, 0], rot = [0, 0, 0], esc = [1, 1, 1]) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * GR, rot[1] * GR, rot[2] * GR));
  return new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, new THREE.Vector3(...esc));
}

// Perfil NACA de 4 xifres: retorna funció tc -> bucle [[x, y]] (TE extradós -> LE -> TE intradós), 2nc+1 punts
export const gruixNACA = x => 5 * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1036 * x * x * x * x);
export const curvNACA = (x, m, p) => m === 0 ? 0 : x < p ? m / (p * p) * (2 * p * x - x * x) : m / ((1 - p) * (1 - p)) * ((1 - 2 * p) + 2 * p * x - x * x);
export function perfilNACA(nc, m = 0.02, p = 0.4) {
  const xs = []; for (let k = 0; k <= nc; k++) xs.push(0.5 * (1 - Math.cos(Math.PI * k / nc)));
  return tc => {
    const r = [];
    for (let k = nc; k >= 0; k--) r.push([xs[k], curvNACA(xs[k], m, p) + tc * gruixNACA(xs[k])]);
    for (let k = 1; k <= nc; k++) r.push([xs[k], curvNACA(xs[k], m, p) - tc * gruixNACA(xs[k])]);
    return r;
  };
}

// Superfície de perfil aerodinàmic per estacions {o: punt del LE, d: direcció de corda, n: normal (extradós), e: envergadura, c, tc}
export function lamina(est, perfil, o = {}) {
  const loops = est.map(e => perfil(e.tc, e));
  const nu = loops[0].length - 1, nv = est.length - 1;
  const res = superficie(nu, nv, (i, j) => {
    const E = est[j], [x, y] = loops[j][i];
    return [E.o[0] + (E.d[0] * x + E.n[0] * y) * E.c, E.o[1] + (E.d[1] * x + E.n[1] * y) * E.c, E.o[2] + (E.d[2] * x + E.n[2] * y) * E.c];
  }, { orient: 'fora', mat: o.mat ? (i, j) => o.mat(i, j, nu) : () => o.material ?? 'm' });
  // tapa a la punta (i opcionalment a l'arrel)
  const tapa = (j, sg) => {
    const E = est[j], L = loops[j], nc = (L.length - 1) / 2;
    const pts = L.map(([x, y]) => [E.o[0] + (E.d[0] * x + E.n[0] * y) * E.c, E.o[1] + (E.d[1] * x + E.n[1] * y) * E.c, E.o[2] + (E.d[2] * x + E.n[2] * y) * E.c]);
    const tris = [];
    for (let k = 0; k < nc; k++) { const a = k, b = k + 1, c = 2 * nc - k - 1, d = 2 * nc - k; if (b !== c) tris.push(a, b, c); tris.push(a, c, d); }
    const dir = E.e.map(v => v * sg);
    const pc = malla(pts, tris.filter((_, q) => true), { cap: dir, normals: pts.map(() => dir) });
    const m = o.matTapa ?? o.material ?? 'm';
    (res[m] ? afegirA(res[m], pc) : (res[m] = pc));
  };
  if (o.tapa !== false) tapa(nv, 1);
  if (o.tapaArrel) tapa(0, -1);
  return res;
}
