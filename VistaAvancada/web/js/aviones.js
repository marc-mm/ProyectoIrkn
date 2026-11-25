// Avions: un únic InstancedMesh (silueta low-poly) + punts lluminosos + cues, amb extrapolació ortodròmica entre
// missatges 'estado' i cerca per pantalla (picking) sense crear objectes per fotograma.
// - En allunyar la càmera els avions es fan més petits i se'n mostra només una part (sempre els seleccionats,
//   els que estan en conflicte i els del projecte).
// - A prop (menys de ~8 km) els més propers es dibuixen amb el model detallat del seu tipus (modelos.js).
// - L'avió que pilota l'usuari el dibuixa el mòdul de pilotatge: aquí només se n'actualitza l'estat.
import * as THREE from 'three';
import { llAVec, baseLocal, radiAlt, NM_PER_RAD, DEG, M_A_RADIS } from './geo.js';
import { E } from './estat.js';
import { clonarModel, modelDeTipus } from './modelos.js';

export const MAX = 4096;
// Camps del Float32Array d'estat per avió (struct-of-arrays amb stride)
export const ST = 24;
export const PX = 0, FX = 3, OX = 6, DX = 9, ALT = 12, ALTO = 13, VEL = 14, T0 = 15, RUMB = 16, SCL = 17;

const L_REAL = 45 * M_A_RADIS;       // llargada real d'un avió típic (radis)
const TEMPS_CUA = 26;                // segons reals de recorregut que representa la cua
const D_LOD = 0.0013;                // distància (radis, ~8 km) per sota de la qual es fa servir el model detallat
const MAX_LOD = 10;

const COL_GRIS = new THREE.Color('#9aa6b5');
const COL_PROJ = new THREE.Color('#5ef2ff');

// Mida en píxels d'un avió segons l'altitud de la càmera: 12 px a prop, ~5,5 px amb el planeta sencer.
function pxSegonsAltura(h) {
  const t = Math.min(1, Math.max(0, Math.log(h / 0.15) / Math.log(20)));
  return 12 - 6.5 * t * t * (3 - 2 * t);
}
// Fracció d'avions que es mostren segons l'altitud de la càmera (1 a prop, 0,35 amb el planeta sencer).
function fraccioSegonsAltura(h) {
  const t = Math.min(1, Math.max(0, (Math.log(h) - Math.log(0.35)) / (Math.log(2.6) - Math.log(0.35))));
  return 1 - 0.65 * t;
}

// Geometria de la silueta (nas cap a +Z, dalt +Y, ales al llarg de X, llargada 1).
function geometriaAvio() {
  const p = [];
  const tri = (a, b, c) => { p.push(...a, ...b, ...c, ...a, ...c, ...b); };   // doble cara
  const anells = [[0.5, 0.0], [0.44, 0.035], [0.34, 0.062], [0.0, 0.066], [-0.30, 0.058], [-0.5, 0.012]];
  const seg = 8;
  const pt = (z, r, k) => [Math.cos(k / seg * 2 * Math.PI) * r, Math.sin(k / seg * 2 * Math.PI) * r, z];
  for (let a = 0; a < anells.length - 1; a++) {
    for (let k = 0; k < seg; k++) {
      const [z0, r0] = anells[a], [z1, r1] = anells[a + 1];
      const A = pt(z0, r0, k), B = pt(z0, r0, k + 1), C = pt(z1, r1, k + 1), D = pt(z1, r1, k);
      p.push(...A, ...B, ...C, ...A, ...C, ...D);
    }
  }
  for (const s of [1, -1]) {
    tri([0.05 * s, 0, 0.13], [0.05 * s, 0, -0.10], [0.47 * s, 0, -0.27]);
    tri([0.05 * s, 0, 0.13], [0.47 * s, 0, -0.27], [0.47 * s, 0, -0.18]);
    tri([0.17 * s, -0.012, 0.10], [0.17 * s, -0.05, 0.05], [0.17 * s, -0.012, -0.06]);
    tri([0.02 * s, 0, -0.36], [0.02 * s, 0, -0.47], [0.19 * s, 0, -0.50]);
    tri([0.02 * s, 0, -0.36], [0.19 * s, 0, -0.50], [0.19 * s, 0, -0.45]);
  }
  tri([0, 0.04, -0.28], [0, 0.04, -0.5], [0, 0.19, -0.5]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  return g;
}

const VERT_AVIO = /* glsl */`
attribute vec3 aCol; attribute float aEst;
varying vec3 vCol; varying vec3 vNrm; varying float vEst;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vec4 wp = instanceMatrix * vec4(position, 1.0);
  vNrm = normalize(mat3(instanceMatrix) * normal);
  vCol = aCol; vEst = aEst;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}`;
const FRAG_AVIO = /* glsl */`
precision highp float;
uniform vec3 uLlum; uniform float uTemps;
varying vec3 vCol; varying vec3 vNrm; varying float vEst;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  float l = 0.52 + 0.48 * abs(dot(normalize(vNrm), uLlum));
  vec3 c = vCol * l;
  if (vEst > 1.5 && vEst < 2.5) c = mix(c, vec3(1.0), 0.55 + 0.25 * sin(uTemps * 7.0));
  else if (vEst > 2.5) c = mix(c, vec3(1.0), 0.45);
  else if (vEst > 0.5) c = mix(c, vec3(1.0, 0.15, 0.2), 0.55 + 0.25 * sin(uTemps * 9.0));
  gl_FragColor = vec4(c, 1.0);
}`;

const VERT_PTS = /* glsl */`
attribute vec3 aCol; attribute float aEst;
uniform float uPR, uBrill, uMida;
varying vec3 vCol; varying float vEst;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vCol = aCol; vEst = aEst;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
  gl_PointSize = (aEst > 1.5 ? 1.55 : 1.0) * uMida * uPR * (0.55 + 0.45 * uBrill);
  #include <logdepthbuf_vertex>
}`;
const FRAG_PTS = /* glsl */`
precision highp float;
uniform float uBrill;
varying vec3 vCol; varying float vEst;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float a = pow(1.0 - d, 2.4);
  vec3 c = vEst > 0.5 && vEst < 1.5 ? vec3(1.0, 0.2, 0.25) : vCol;
  gl_FragColor = vec4(c * a * (0.35 + 0.65 * uBrill), a);
}`;

const VERT_CUA = /* glsl */`
attribute vec3 aCol; attribute float aAl;
varying vec3 vCol; varying float vAl;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vCol = aCol; vAl = aAl;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
  #include <logdepthbuf_vertex>
}`;
const FRAG_CUA = /* glsl */`
precision highp float; uniform float uOp; varying vec3 vCol; varying float vAl;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  gl_FragColor = vec4(vCol * vAl * uOp, vAl * uOp);
}`;

export function crearAviones(escena, renderer) {
  // --- Dades per avió ---
  const F = new Float32Array(MAX * ST);
  const ids = new Int32Array(MAX), aero = new Int16Array(MAX), fase = new Uint8Array(MAX), tipo = new Int16Array(MAX);
  const vist = new Uint32Array(MAX);              // marca de l'últim estat on s'ha vist
  const base = new Uint8Array(MAX);               // 0 normal, 1 conflicte, 2 seleccionat
  const atzar = new Float32Array(MAX);            // valor estable 0..1 per decidir quins es mostren de lluny
  const cs = new Array(MAX).fill('');
  const sx = new Float32Array(MAX), sy = new Float32Array(MAX), vis = new Uint8Array(MAX), lod = new Uint8Array(MAX);
  const mapa = new Map();
  let n = 0, marca = 0, hover = -1, nMostrats = 0;
  const colors = [];                               // THREE.Color per aerolínia
  let tipus = [];                                  // [codi, nom] del catàleg
  // Avió pilotat per l'usuari: id i estat que escriu el mòdul de pilotatge
  const pil = { id: -1, x: 1, y: 0, z: 0, fx: 0, fy: 1, fz: 0, alt: 0, vel: 0, rumb: 0 };

  // --- Malla instanciada ---
  const geo = geometriaAvio();
  const aColI = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
  const aEstI = new THREE.InstancedBufferAttribute(new Float32Array(MAX), 1);
  geo.setAttribute('aCol', aColI); geo.setAttribute('aEst', aEstI);
  const uTemps = { value: 0 }, uLlum = { value: new THREE.Vector3(0.4, 0.8, 0.45).normalize() };
  const malla = new THREE.InstancedMesh(geo, new THREE.ShaderMaterial({
    vertexShader: VERT_AVIO, fragmentShader: FRAG_AVIO, uniforms: { uTemps, uLlum }, side: THREE.FrontSide,
  }), MAX);
  malla.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  malla.frustumCulled = false; malla.count = 0; malla.raycast = () => {};
  escena.add(malla);
  const mat = malla.instanceMatrix.array;

  // --- Punts lluminosos ---
  const pg = new THREE.BufferGeometry();
  const posP = new THREE.BufferAttribute(new Float32Array(MAX * 3), 3).setUsage(THREE.DynamicDrawUsage);
  const colP = new THREE.BufferAttribute(new Float32Array(MAX * 3), 3);
  const estP = new THREE.BufferAttribute(new Float32Array(MAX), 1);
  pg.setAttribute('position', posP); pg.setAttribute('aCol', colP); pg.setAttribute('aEst', estP);
  const uPR = { value: Math.min(devicePixelRatio, 1.5) }, uBrill = { value: 1 }, uMida = { value: 12 };
  const punts = new THREE.Points(pg, new THREE.ShaderMaterial({
    vertexShader: VERT_PTS, fragmentShader: FRAG_PTS, uniforms: { uPR, uBrill, uMida },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  punts.frustumCulled = false; punts.renderOrder = 3; pg.setDrawRange(0, 0);
  escena.add(punts);

  // --- Cues (2 vèrtexs per avió, degradat d'alfa) ---
  const tg = new THREE.BufferGeometry();
  const posT = new THREE.BufferAttribute(new Float32Array(MAX * 6), 3).setUsage(THREE.DynamicDrawUsage);
  const colT = new THREE.BufferAttribute(new Float32Array(MAX * 6), 3);
  const alT = new THREE.BufferAttribute(new Float32Array(MAX * 2), 1);
  for (let i = 0; i < MAX; i++) { alT.array[i * 2] = 0; alT.array[i * 2 + 1] = 1; }
  tg.setAttribute('position', posT); tg.setAttribute('aCol', colT); tg.setAttribute('aAl', alT);
  const uOpCua = { value: 0.8 };
  const cues = new THREE.LineSegments(tg, new THREE.ShaderMaterial({
    vertexShader: VERT_CUA, fragmentShader: FRAG_CUA, uniforms: { uOp: uOpCua },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  cues.frustumCulled = false; tg.setDrawRange(0, 0); cues.renderOrder = 2;
  escena.add(cues);

  // --- Models detallats dels avions propers ---
  const grupLod = new THREE.Group(); escena.add(grupLod);
  const lodActius = new Map();          // id -> {obj, clau}
  const lodLliures = new Map();         // "model|color" -> [obj...] per reutilitzar
  const cand = { i: new Int32Array(MAX_LOD), d: new Float32Array(MAX_LOD), n: 0 };
  const mBase = new THREE.Matrix4(), vX = new THREE.Vector3(), vY = new THREE.Vector3(), vZ = new THREE.Vector3();

  const pvm = new THREE.Matrix4();
  const NV = [0, 0, 0], EV = [0, 0, 0];

  // Color de l'avió i (segons la companyia) a tots els buffers que el necessiten.
  function colorDe(i) {
    const a = aero[i];
    return a === -2 ? COL_PROJ : (a >= 0 && colors[a]) ? colors[a] : COL_GRIS;
  }
  function ponColor(i) {
    const c = colorDe(i);
    aColI.setXYZ(i, c.r, c.g, c.b); colP.setXYZ(i, c.r, c.g, c.b);
    colT.setXYZ(i * 2, c.r, c.g, c.b); colT.setXYZ(i * 2 + 1, c.r, c.g, c.b);
    aColI.needsUpdate = colP.needsUpdate = colT.needsUpdate = true;
  }
  function refrescaEst(i) {
    const v = base[i] > 0 ? base[i] : (i === hover ? 3 : 0);
    if (aEstI.array[i] !== v) { aEstI.array[i] = v; estP.array[i] = v; aEstI.needsUpdate = estP.needsUpdate = true; }
  }
  // Elimina l'avió i movent l'últim al seu lloc.
  function treu(i) {
    const u = n - 1;
    mapa.delete(ids[i]);
    if (hover === i) hover = -1;
    if (i !== u) {
      F.copyWithin(i * ST, u * ST, u * ST + ST);
      ids[i] = ids[u]; aero[i] = aero[u]; fase[i] = fase[u]; tipo[i] = tipo[u]; vist[i] = vist[u]; base[i] = base[u];
      cs[i] = cs[u]; atzar[i] = atzar[u];
      mapa.set(ids[i], i);
      if (hover === u) hover = i;
      ponColor(i); refrescaEst(i);
    }
    aEstI.array[u] = 0; estP.array[u] = 0;
    n--;
  }

  // Treu (i guarda per reutilitzar) el model detallat d'un avió.
  function treuLod(id) {
    const l = lodActius.get(id);
    if (!l) return;
    grupLod.remove(l.obj);
    if (!lodLliures.has(l.clau)) lodLliures.set(l.clau, []);
    lodLliures.get(l.clau).push(l.obj);
    lodActius.delete(id);
  }

  // Col·loca el model detallat de l'avió i (posició P, endavant Fw, llargada dibuixada sLen en radis).
  function posaLod(i, X, Y, Z, px, py, pz, fx, fy, fz, sLen) {
    const id = ids[i];
    const codi = tipo[i] >= 0 && tipus[tipo[i]] ? tipus[tipo[i]][0] : 'A320';
    const model = modelDeTipus(codi), color = '#' + colorDe(i).getHexString(), clau = model + '|' + color;
    let l = lodActius.get(id);
    if (l && l.clau !== clau) { treuLod(id); l = null; }
    if (!l) {
      const lliures = lodLliures.get(clau);
      const obj = lliures && lliures.length ? lliures.pop() : clonarModel(model, color);
      if (!obj) return false;                       // el model encara s'està carregant
      grupLod.add(obj);
      l = { obj, clau }; lodActius.set(id, l);
    }
    const o = l.obj;
    o.position.set(X, Y, Z);
    vY.set(px, py, pz); vZ.set(fx, fy, fz); vX.crossVectors(vY, vZ);
    o.quaternion.setFromRotationMatrix(mBase.makeBasis(vX, vY, vZ));
    o.scale.setScalar(Math.max(sLen / o.userData.llargada, M_A_RADIS));      // mai més petit que la mida real
    if (o.userData.tren) { const f = fase[i]; o.userData.tren.visible = f === 0 || f === 1 || f === 5 || f === 6; }
    return true;
  }

  const api = {
    get n() { return n; },
    get nMostrats() { return nMostrats; },
    ids, aero, fase, tipo, cs, F, sx, sy, vis, mapa, base, pvm, pil,
    // Defineix els colors de les aerolínies i els tipus d'avió (de 'inicio').
    fijarAerolineas(arr, tipos) {
      colors.length = 0;
      for (const a of arr) colors.push(new THREE.Color(a[2]));
      tipus = tipos || [];
      for (let i = 0; i < n; i++) ponColor(i);
    },
    limpiar() { while (n > 0) treu(n - 1); mapa.clear(); hover = -1; for (const id of [...lodActius.keys()]) treuLod(id); },

    // Aplica un missatge 'estado': crea/actualitza avions i elimina els que han desaparegut.
    aplicarEstado(vuelos, ahora) {
      marca++;
      for (let k = 0; k < vuelos.length; k++) {
        const v = vuelos[k];
        let i = mapa.get(v[0]);
        const nou = i === undefined;
        if (nou) {
          if (n >= MAX) continue;
          i = n++; mapa.set(v[0], i); ids[i] = v[0]; base[i] = 0;
          atzar[i] = ((v[0] * 0.6180339887) % 1 + 1) % 1;
        }
        fase[i] = v[6]; cs[i] = v[8]; tipo[i] = v.length > 9 ? v[9] : -1;
        vist[i] = marca;
        if (nou || aero[i] !== v[7]) { aero[i] = v[7]; ponColor(i); }
        if (nou) refrescaEst(i);
        if (v[0] === pil.id) continue;             // la posició de l'avió pilotat la posa el pilotatge
        const b = i * ST;
        const rumb = v[4] * DEG;
        llAVec(v[1], v[2], F, b + PX);
        baseLocal(v[1], v[2], NV, EV);
        const s = Math.sin(rumb), c = Math.cos(rumb);
        F[b + FX] = c * NV[0] + s * EV[0]; F[b + FX + 1] = c * NV[1] + s * EV[1]; F[b + FX + 2] = c * NV[2] + s * EV[2];
        if (nou) {
          F[b + OX] = F[b + OX + 1] = F[b + OX + 2] = 0;
          F[b + DX] = F[b + PX]; F[b + DX + 1] = F[b + PX + 1]; F[b + DX + 2] = F[b + PX + 2];
          F[b + ALT] = v[3];
        } else {
          // Desplaçament actual respecte a la nova posició: es dissipa suaument (sense salts)
          F[b + OX] = F[b + DX] - F[b + PX]; F[b + OX + 1] = F[b + DX + 1] - F[b + PX + 1]; F[b + OX + 2] = F[b + DX + 2] - F[b + PX + 2];
        }
        F[b + ALTO] = v[3]; F[b + VEL] = v[5]; F[b + T0] = ahora; F[b + RUMB] = v[4];
      }
      for (let i = n - 1; i >= 0; i--) if (vist[i] !== marca && ids[i] !== pil.id) treu(i);
    },

    // Marca avions en conflicte (idsConf = Set d'ids) i l'avió seleccionat.
    marcar(idsConf, idSel) {
      for (let i = 0; i < n; i++) {
        const id = ids[i];
        base[i] = id === idSel ? 2 : (idsConf.has(id) ? 1 : 0);
        refrescaEst(i);
      }
    },
    ponHover(i) {
      if (i === hover) return;
      const ant = hover; hover = i;
      if (ant >= 0 && ant < n) refrescaEst(ant);
      if (i >= 0) refrescaEst(i);
    },
    // Posició dibuixada de l'avió amb aquest id (vector complet, a la seva altitud). Retorna false si no existeix.
    dirDeId(id, out) {
      const i = mapa.get(id);
      if (i === undefined) return false;
      const b = i * ST, r = radiAlt(F[b + ALT]);
      out.set(F[b + DX] * r, F[b + DX + 1] * r, F[b + DX + 2] * r);
      return true;
    },
    // Avió més proper a (mx,my) en píxels CSS dins del radi; -1 si cap.
    pick(mx, my, radi) {
      let millor = -1, d2m = radi * radi;
      for (let i = 0; i < n; i++) {
        if (!vis[i]) continue;
        const dx = sx[i] - mx, dy = sy[i] - my, d2 = dx * dx + dy * dy;
        if (d2 < d2m) { d2m = d2; millor = i; }
      }
      return millor;
    },
    // El pilotatge comença (id) o acaba (-1).
    ponPilotat(id) {
      if (pil.id >= 0) treuLod(pil.id);
      pil.id = id;
    },

    // Actualització per fotograma: extrapolació, matrius, punts, cues, models detallats i coordenades de pantalla.
    actualizar(ahora, tAnim, cam, W, H) {
      cam.updateMatrixWorld();
      pvm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      const el = pvm.elements;
      const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z;
      const D = Math.hypot(cx, cy, cz), ux = cx / D, uy = cy / D, uz = cz / D;
      const ca = 1 / D, sa = Math.sqrt(Math.max(0, 1 - ca * ca)), cb = 1 / 1.006, sb = Math.sqrt(1 - cb * cb);
      const cosLim = ca * cb - sa * sb;
      const alt = D - 1;
      const pxAvio = pxSegonsAltura(alt), frac = fraccioSegonsAltura(alt);
      const K = pxAvio / H * 2 * Math.tan(cam.fov * DEG / 2);
      const esc = E.pausado ? 0 : E.escala;
      const kd = esc / (3600 * NM_PER_RAD);
      const cua = E.capas.rastros;
      const suavAlt = 1 - Math.exp(-0.016 * 7);
      uTemps.value = tAnim;
      uBrill.value = Math.min(1, Math.max(0, alt * 1.4));
      uMida.value = pxAvio * 1.05;
      uLlum.value.set(ux * 0.5, uy * 0.5 + 0.55, uz * 0.5).normalize();
      cand.n = 0; nMostrats = 0;
      const iPil = pil.id >= 0 ? (mapa.get(pil.id) ?? -1) : -1;

      for (let i = 0; i < n; i++) {
        const b = i * ST;
        let px, py, pz, fx, fy, fz, a;
        if (i === iPil) {
          // Estat que escriu el pilotatge (sense extrapolar)
          px = pil.x; py = pil.y; pz = pil.z; fx = pil.fx; fy = pil.fy; fz = pil.fz; a = pil.alt;
          F[b + DX] = px; F[b + DX + 1] = py; F[b + DX + 2] = pz; F[b + PX] = px; F[b + PX + 1] = py; F[b + PX + 2] = pz;
          F[b + FX] = fx; F[b + FX + 1] = fy; F[b + FX + 2] = fz; F[b + OX] = F[b + OX + 1] = F[b + OX + 2] = 0;
          F[b + ALT] = F[b + ALTO] = a; F[b + VEL] = pil.vel; F[b + RUMB] = pil.rumb; F[b + T0] = ahora;
        } else {
          const dt = Math.min(ahora - F[b + T0], 0.6);
          const d = F[b + VEL] * kd * dt;
          const cd = Math.cos(d), sd = Math.sin(d);
          const p0x = F[b], p0y = F[b + 1], p0z = F[b + 2];
          const f0x = F[b + FX], f0y = F[b + FX + 1], f0z = F[b + FX + 2];
          const dec = Math.exp(-dt * 7);
          px = p0x * cd + f0x * sd + F[b + OX] * dec;
          py = p0y * cd + f0y * sd + F[b + OX + 1] * dec;
          pz = p0z * cd + f0z * sd + F[b + OX + 2] * dec;
          const il = 1 / Math.sqrt(px * px + py * py + pz * pz);
          px *= il; py *= il; pz *= il;
          F[b + DX] = px; F[b + DX + 1] = py; F[b + DX + 2] = pz;
          fx = f0x * cd - p0x * sd; fy = f0y * cd - p0y * sd; fz = f0z * cd - p0z * sd;
          const dp = fx * px + fy * py + fz * pz;
          fx -= dp * px; fy -= dp * py; fz -= dp * pz;
          const fl = 1 / (Math.sqrt(fx * fx + fy * fy + fz * fz) || 1);
          fx *= fl; fy *= fl; fz *= fl;
          a = F[b + ALT] += (F[b + ALTO] - F[b + ALT]) * suavAlt;
        }
        const r = radiAlt(a);
        const X = px * r, Y = py * r, Z = pz * r;
        const dx = X - cx, dy = Y - cy, dz = Z - cz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // De lluny se'n mostra només una part (sempre els seleccionats, en conflicte, del projecte i el del cursor)
        const mostra = i !== iPil && (base[i] > 0 || i === hover || aero[i] === -2 || atzar[i] < frac);
        let s = dist * K;
        if (base[i] === 2) s *= 1.35;
        if (s < L_REAL) s = L_REAL;
        // Projecció a pantalla (píxels CSS) i visibilitat respecte a l'horitzó
        const w = el[3] * X + el[7] * Y + el[11] * Z + el[15];
        let davant = false;
        if (w > 0 && (px * ux + py * uy + pz * uz) > cosLim) {
          const nx = (el[0] * X + el[4] * Y + el[8] * Z + el[12]) / w;
          const ny = (el[1] * X + el[5] * Y + el[9] * Z + el[13]) / w;
          sx[i] = (nx * 0.5 + 0.5) * W; sy[i] = (0.5 - ny * 0.5) * H;
          davant = nx > -1.05 && nx < 1.05 && ny > -1.05 && ny < 1.05;
        }
        vis[i] = mostra && davant ? 1 : 0;
        if (mostra) nMostrats++;
        lod[i] = 0;
        // Candidats a model detallat: els més propers dins de D_LOD
        if (mostra && davant && dist < D_LOD) {
          if (cand.n < MAX_LOD || dist < cand.d[cand.n - 1]) {
            let j = cand.n < MAX_LOD ? cand.n++ : MAX_LOD - 1;
            while (j > 0 && cand.d[j - 1] > dist) { cand.d[j] = cand.d[j - 1]; cand.i[j] = cand.i[j - 1]; j--; }
            cand.d[j] = dist; cand.i[j] = i;
          }
        }
        const m = i * 16, q = i * 3;
        if (!mostra) {
          for (let k = 0; k < 16; k++) mat[m + k] = 0;
          posP.array[q] = posP.array[q + 1] = posP.array[q + 2] = 0;
          if (cua) { const q2 = i * 6; for (let k = 0; k < 6; k++) posT.array[q2 + k] = 0; }
          continue;
        }
        // Matriu (columnes X = P×F, Y = P, Z = F), escalada
        mat[m] = (py * fz - pz * fy) * s; mat[m + 1] = (pz * fx - px * fz) * s; mat[m + 2] = (px * fy - py * fx) * s; mat[m + 3] = 0;
        mat[m + 4] = px * s; mat[m + 5] = py * s; mat[m + 6] = pz * s; mat[m + 7] = 0;
        mat[m + 8] = fx * s; mat[m + 9] = fy * s; mat[m + 10] = fz * s; mat[m + 11] = 0;
        mat[m + 12] = X; mat[m + 13] = Y; mat[m + 14] = Z; mat[m + 15] = 1;
        posP.array[q] = X; posP.array[q + 1] = Y; posP.array[q + 2] = Z;
        if (cua) {
          let ang = F[b + VEL] * kd * TEMPS_CUA;
          if (ang > 0.07) ang = 0.07;
          const ca2 = Math.cos(ang), sa2 = Math.sin(ang), q2 = i * 6;
          posT.array[q2] = X; posT.array[q2 + 1] = Y; posT.array[q2 + 2] = Z;
          posT.array[q2 + 3] = (px * ca2 - fx * sa2) * r; posT.array[q2 + 4] = (py * ca2 - fy * sa2) * r; posT.array[q2 + 5] = (pz * ca2 - fz * sa2) * r;
        }
      }

      // Models detallats: es posen als candidats i s'amaga la seva silueta i el seu punt
      const usats = new Set();
      for (let k = 0; k < cand.n; k++) {
        const i = cand.i[k], b = i * ST;
        const px = F[b + DX], py = F[b + DX + 1], pz = F[b + DX + 2];
        const r = radiAlt(F[b + ALT]);
        const m = i * 16;
        // Endavant = columna Z de la matriu ja calculada (normalitzada)
        const s = Math.hypot(mat[m + 8], mat[m + 9], mat[m + 10]);
        if (s === 0) continue;
        const fx = mat[m + 8] / s, fy = mat[m + 9] / s, fz = mat[m + 10] / s;
        const sLen = Math.max(cand.d[k] * K * (base[i] === 2 ? 1.35 : 1), 0);
        const X = px * r, Y = py * r, Z = pz * r;
        if (!posaLod(i, X, Y, Z, px, py, pz, fx, fy, fz, sLen)) continue;
        usats.add(ids[i]); lod[i] = 1;
        for (let j = 0; j < 16; j++) mat[m + j] = 0;
        posP.array[i * 3] = posP.array[i * 3 + 1] = posP.array[i * 3 + 2] = 0;
      }
      for (const id of [...lodActius.keys()]) if (!usats.has(id)) treuLod(id);

      malla.count = n;
      malla.instanceMatrix.needsUpdate = true;
      posP.needsUpdate = true; pg.setDrawRange(0, n);
      cues.visible = cua; if (cua) { posT.needsUpdate = true; tg.setDrawRange(0, n * 2); }
      uPR.value = Math.min(devicePixelRatio, renderer.getPixelRatio());
    },
    lod, malla, punts, cues, uOpCua,
  };
  return api;
}
