// generador.js — construeix els 10 models i els desa com a GLB (eina de desenvolupament)
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { Cub, mat, perfilNACA, cos, afegirA, peca } from './geo.js';
import * as P from './parts.js';
import { TIPUS, ORDRE } from './tipus.js';
import { CABINES } from './cabines.js';

// Materials del contracte (noms exactes)
const DEF_MATS = {
  pintura: { color: 0xf4f5f7, roughness: 0.42, metalness: 0.05 },
  ventre: { color: 0xc5c9cf, roughness: 0.5, metalness: 0.05 },
  accent: { color: 0xffffff, roughness: 0.42, metalness: 0.05 },
  vidre: { color: 0x1c2531, roughness: 0.15, metalness: 0.4 },
  metall: { color: 0xa3a8b0, roughness: 0.35, metalness: 0.5 },
  ala: { color: 0xc9cdd3, roughness: 0.5, metalness: 0.1 },
  negre: { color: 0x1b1b1d, roughness: 0.8, metalness: 0.0 },
  llum_vermella: { color: 0xff2a2a, emissive: 0xff0000, emissiveIntensity: 1 },
  llum_verda: { color: 0x2aff4a, emissive: 0x00ff33, emissiveIntensity: 1 },
  llum_blanca: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 },
};
const ORDRE_MATS = Object.keys(DEF_MATS);

function geometria(pc) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pc.p), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(pc.n), 3));
  const nv = pc.p.length / 3;
  g.setIndex(new THREE.BufferAttribute(nv > 65535 ? new Uint32Array(pc.i) : new Uint16Array(pc.i), 1));
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

// Material per cel·la: botes antigel (negre) al bord d'atac
const ambBotes = (base, j0 = 1) => (i, j, nu) => (j >= j0 && Math.abs(i - nu / 2) < 3 ? 'negre' : base);

export function construir(codi) {
  const T = TIPUS[codi], L = T.L, Z = s => L / 2 - s;
  const cub = new Cub();
  // --- fuselatge i finestres
  const fus = P.crearFuselatge({ L, ...T.fus });
  cub.mapa(fus.mapa);
  P.finestresCabina(fus, T.fin, cub);
  const cab = CABINES[T.pilot]?.(fus, T);
  if (cab?.mascara) P.poligonsFus(fus, cab.mascara, cub, 'negre', 0.014);
  if (cab) P.poligonsFus(fus, cab.finestres, cub, 'vidre', 0.026);
  P.portes(fus, T.portes, cub);
  // --- ala
  const A = T.ala, perf = perfilNACA(A.nc ?? 18, A.m ?? 0.02, A.p ?? 0.45);
  const est = P.estacionsAla({ ...A, z0: Z(A.s0) });
  cub.sim(P.superficieAla(est, perf, { material: 'ala', mat: A.botes ? ambBotes('ala', 2) : undefined }));
  if (A.ventral) { // element inferior del winglet AT (737 MAX)
    const Tp = est[est.nPla - 1], base = { ...Tp, x: Tp.x - 0.04, z: Tp.z - 0.12 * Tp.c, c: Tp.c * 0.8, tc: 0.09 };
    cub.sim(P.superficieAla([base, ...P.estacionsWinglet(base, A.ventral)], perfilNACA(10, 0, 0.4), { material: 'ala' }));
  }
  P.carenatsFlaps(est, A, cub);
  // --- estabilitzador horitzontal
  const H = T.ehor, estH = P.estacionsAla({ ...H, z0: Z(H.s0) });
  cub.sim(P.superficieAla(estH, perfilNACA(14, 0, 0.4), { material: 'ala', mat: H.botes ? ambBotes('ala', 1) : undefined }));
  // --- deriva (accent)
  const D = T.deriva, estD = P.estacionsDeriva({ punts: D.punts.map(p => [p[0], Z(p[1]), Z(p[2]), p[3]]), n: D.n });
  cub.mapa(P.superficieAla(estD, perfilNACA(14, 0, 0.4), { material: 'accent', mat: D.botes ? ambBotes('accent', 3) : undefined }));
  // --- motors
  const extres = [];
  const M = T.motor;
  if (T.helix) {
    P.crearGondolaHelix(M, est, cub, Z);
    const hx = P.crearHelix(M.helix);
    for (const [nom, sx] of [['helix_e', 1], ['helix_d', -1]]) extres.push({ nom, pc: hx, pos: [sx * M.x, M.y, Z(M.s) + 0.22], mat: 'negre' });
  } else {
    const mot = P.crearMotor(M), pos = [M.x, M.y, Z(M.s)];
    cub.sim(mot.mapa, mat(pos));
    P.crearPilo(M, mot, pos, est, A, cub);
  }
  // --- carenats laterals del tren (ATR)
  if (T.esponsons) {
    const S = T.esponsons, secc = [], n = 18;
    for (let k = 0; k <= n; k++) {
      const t = k / n, f = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.0)), 0.5) * (t < 0.5 ? 1 : 1);
      const g = t < 0.18 ? Math.sqrt(Math.max(0, 1 - Math.pow((0.18 - t) / 0.18, 2))) : t > 0.75 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.75) / 0.25, 2))) : 1;
      secc.push({ x: S.x, y: S.y + (1 - g) * 0.2, z: Z(lerp(S.s0, S.s1, t)), rx: S.rx * g, ry: S.ry * g, e: 2.6 });
    }
    cub.sim(cos(secc, 24, { material: 'ventre' }));
  }
  // --- antenes
  const k = T.fus.Rt / 2;
  P.antena(fus, L * 0.3, true, 0.32 * k, 0.42 * k, 'pintura', cub);
  P.antena(fus, L * 0.55, true, 0.22 * k, 0.32 * k, 'pintura', cub);
  P.antena(fus, L * 0.4, false, 0.28 * k, 0.36 * k, 'ventre', cub);
  // --- llums de navegació
  const rL = T.helix ? 0.09 : 0.11 * Math.min(1.4, Math.max(1, k));
  let pl;
  if (A.punta) { const t = est[est.nPla - 1]; pl = [t.x + 0.05, t.y + 0.02, t.z - 0.06 * t.c]; }
  else { const t = est[est.length - 1]; pl = [t.x + 0.03, t.y, t.z - 0.3 * t.c]; }
  P.llum(pl, rL, 'llum_vermella', cub);
  P.llum([-pl[0], pl[1], pl[2]], rL, 'llum_verda', cub);
  const sb = L - 0.3;
  P.llum([0, fus.sec(sb).top + 0.02, Z(sb)], rL * 0.9, 'llum_blanca', cub);
  // --- tren
  const tren = P.crearTren({ hEix: T.hEix, ...T.tren }, { Z, fus, est });
  return { cub, tren, extres };
}
const lerp = (a, b, t) => a + (b - a) * t;

// Escena exportable: node arrel = codi; fill "tren"
export function escena(codi) {
  const { cub, tren, extres } = construir(codi);
  const mats = {};
  for (const k of ORDRE_MATS) mats[k] = new THREE.MeshStandardMaterial({ name: k, ...DEF_MATS[k] });
  const root = new THREE.Group(); root.name = codi;
  for (const m of ORDRE_MATS) { const pc = cub.mats.get(m); if (!pc) continue; const me = new THREE.Mesh(geometria(pc), mats[m]); me.name = `${codi}_${m}`; root.add(me); }
  for (const x of extres) { const me = new THREE.Mesh(geometria(x.pc), mats[x.mat]); me.name = x.nom; me.position.set(...x.pos); root.add(me); }
  const gt = new THREE.Group(); gt.name = 'tren';
  for (const m of ORDRE_MATS) { const pc = tren.mats.get(m); if (!pc) continue; const me = new THREE.Mesh(geometria(pc), mats[m]); me.name = `tren_${m}`; gt.add(me); }
  root.add(gt);
  const sc = new THREE.Scene(); sc.name = codi; sc.add(root);
  for (const [m] of cub.mats) if (!mats[m]) throw new Error(`material desconegut ${m}`);
  return { sc, root };
}

function estadistica(root) {
  let tris = 0, verts = 0, malles = 0;
  root.traverse(o => { if (o.isMesh) { malles++; tris += o.geometry.index.count / 3; verts += o.geometry.attributes.position.count; } });
  root.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(root), s = b.getSize(new THREE.Vector3());
  return { tris, verts, malles, b, s };
}

async function log(t) { try { await fetch('/__log', { method: 'POST', body: t }); } catch (e) { } }
window.addEventListener('error', e => log(`ERROR ${e.message} ${e.filename}:${e.lineno}`));
window.addEventListener('unhandledrejection', e => log(`REJECT ${e.reason?.stack || e.reason}`));

export async function generar(codis, desar = true) {
  const taula = document.getElementById('resum'), estat = document.getElementById('estat');
  const fila = c => { const tr = document.createElement('tr'); tr.innerHTML = c.map(x => `<td>${x}</td>`).join(''); taula.appendChild(tr); };
  fila(['codi', 'bytes', 'triangles', 'vèrtexs', 'malles', 'llarg Z', 'env X', 'alt Y', 'ref L/env/alt', 'error']);
  const exp = new GLTFExporter();
  for (const codi of codis) {
    try {
      const t0 = performance.now();
      const { sc, root } = escena(codi);
      const e = estadistica(root), T = TIPUS[codi];
      const buf = await exp.parseAsync(sc, { binary: true });
      if (desar) { const r = await fetch(`/__save/${codi}.glb`, { method: 'POST', body: buf }); if (!r.ok) throw new Error('desar: ' + r.status); }
      fila([codi, buf.byteLength, e.tris, e.verts, e.malles, e.s.z.toFixed(2), e.s.x.toFixed(2), e.s.y.toFixed(2), `${T.L}/${T.env}/${T.alt}`, '']);
      await log(`${codi} ${buf.byteLength} B, ${e.tris} tri, ${e.malles} malles, ${(performance.now() - t0).toFixed(0)} ms, mida ${e.s.x.toFixed(2)} x ${e.s.y.toFixed(2)} x ${e.s.z.toFixed(2)}, ymin ${e.b.min.y.toFixed(2)}`);
    } catch (err) {
      fila([codi, '', '', '', '', '', '', '', '', String(err.stack || err).replace(/</g, '&lt;')]);
      await log(`ERROR ${codi}: ${err.stack || err}`);
    }
  }
  estat.textContent = 'FET';
}
