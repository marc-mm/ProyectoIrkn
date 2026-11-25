// Capes de dibuix: aeroports, ruta del vol seleccionat, anells (selecció/conflictes), línies de conflicte,
// etiquetes DOM, i espai aeri del projecte (caixa lluminosa + cercles de seguretat).
import * as THREE from 'three';
import { llAVec, radiAlt, DEG, NM_PER_RAD, VIS } from './geo.js';
import { E } from './estat.js';
import { ST, DX, ALT } from './aviones.js';

const MAX_ANELLS = 320;
// Radi dels marcadors d'aeroport (lleugerament per sobre del terra; segueix l'escala visual d'altituds)
const rAero = () => radiAlt(0) + 0.0003 * VIS.f + 2e-6;

// ---------- Cinta: línia d'amplada constant en píxels (franja plana a l'esfera) ----------
const VERT_CINTA = /* glsl */`
attribute vec3 perp; attribute float lado; attribute float aT; attribute float aAl;
uniform float uAncho, uK, uDmax;
varying float vT, vAl;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  float dist = min(distance(cameraPosition, position), uDmax);   // uDmax: evita franges amples a prop de la càmera (pilotatge)
  vec3 p = position + perp * lado * (uAncho * 0.5 * uK * dist);
  vT = aT; vAl = aAl;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  #include <logdepthbuf_vertex>
}`;
const FRAG_CINTA = /* glsl */`
precision highp float;
uniform vec3 uCol; uniform float uOp, uDash, uTemps;
varying float vT, vAl;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  if (uDash > 0.0 && fract(vT / uDash - uTemps * 0.15) > 0.55) discard;
  gl_FragColor = vec4(uCol * uOp * vAl, uOp * vAl);
}`;

function crearCinta(escena, maxPts, ancho, color, op, dash = 0, geoComp = null) {
  let g = geoComp;
  let n = 0;
  if (!g) {
    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxPts * 6), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('perp', new THREE.BufferAttribute(new Float32Array(maxPts * 6), 3).setUsage(THREE.DynamicDrawUsage));
    const lado = new Float32Array(maxPts * 2);
    for (let i = 0; i < maxPts; i++) { lado[i * 2] = -1; lado[i * 2 + 1] = 1; }
    g.setAttribute('lado', new THREE.BufferAttribute(lado, 1));
    g.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(maxPts * 2), 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAl', new THREE.BufferAttribute(new Float32Array(maxPts * 2).fill(1), 1).setUsage(THREE.DynamicDrawUsage));
    const idx = new Uint16Array((maxPts - 1) * 6);
    for (let i = 0; i < maxPts - 1; i++) {
      const a = i * 2; idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], i * 6);
    }
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.setDrawRange(0, 0);
  }
  const uni = {
    uCol: { value: new THREE.Color(color) }, uAncho: { value: ancho }, uK: { value: 0.001 }, uDmax: { value: 1e9 },
    uOp: { value: op }, uDash: { value: dash }, uTemps: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT_CINTA, fragmentShader: FRAG_CINTA, uniforms: uni, side: THREE.DoubleSide,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false; mesh.visible = false; mesh.renderOrder = 4;
  escena.add(mesh);
  const pos = g.attributes.position.array, per = g.attributes.perp.array, aT = g.attributes.aT.array;
  return {
    mesh, uni, geo: g,
    // Omple la cinta amb n punts xyz (array pla) i calcula perpendiculars i longitud acumulada.
    set(pts, cnt) {
      n = cnt;
      let acum = 0;
      for (let i = 0; i < n; i++) {
        const x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2];
        const a = Math.max(0, i - 1) * 3, b = Math.min(n - 1, i + 1) * 3;
        const tx = pts[b] - pts[a], ty = pts[b + 1] - pts[a + 1], tz = pts[b + 2] - pts[a + 2];
        const rl = 1 / Math.hypot(x, y, z);
        const rx = x * rl, ry = y * rl, rz = z * rl;
        let px = ry * tz - rz * ty, py = rz * tx - rx * tz, pz = rx * ty - ry * tx;
        const pl = 1 / (Math.hypot(px, py, pz) || 1);
        px *= pl; py *= pl; pz *= pl;
        if (i > 0) acum += Math.hypot(x - pts[i * 3 - 3], y - pts[i * 3 - 2], z - pts[i * 3 - 1]);
        for (let k = 0; k < 2; k++) {
          const o = (i * 2 + k) * 3;
          pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
          per[o] = px; per[o + 1] = py; per[o + 2] = pz;
          aT[i * 2 + k] = acum;
        }
      }
      g.attributes.position.needsUpdate = g.attributes.perp.needsUpdate = g.attributes.aT.needsUpdate = true;
      g.setDrawRange(0, Math.max(0, (n - 1) * 6));
      mesh.visible = n > 1;
    },
    ocultar() { mesh.visible = false; },
    get n() { return n; },
  };
}

// ---------- Anells (punts amb shader d'anell) ----------
const VERT_ANELL = /* glsl */`
attribute float aTip, aFas;
uniform float uTemps, uPR;
varying float vTip, vT;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vTip = aTip;
  float t = fract(uTemps * 0.85 + aFas);
  vT = t;
  float s = 30.0;
  if (aTip < 0.5) s = 30.0 + 4.0 * sin(uTemps * 6.0);
  else if (aTip < 1.5) s = mix(16.0, 54.0, t);
  else if (aTip < 2.5) s = 34.0 + 3.0 * sin(uTemps * 5.0);
  else s = 24.0;
  gl_PointSize = s * uPR;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
  #include <logdepthbuf_vertex>
}`;
const FRAG_ANELL = /* glsl */`
precision highp float;
varying float vTip, vT;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float gruix = vTip < 0.5 ? 0.11 : 0.09;
  float anell = smoothstep(1.0 - gruix * 2.0, 1.0 - gruix, d) * (1.0 - smoothstep(0.96, 1.0, d));
  vec3 c; float a = anell;
  if (vTip < 0.5) c = vec3(0.7, 1.0, 1.0);
  else if (vTip < 1.5) { c = vec3(1.0, 0.18, 0.22); a *= (1.0 - vT) * 1.2; a += (1.0 - smoothstep(0.0, 0.55, d)) * 0.10; }
  else if (vTip < 2.5) c = vec3(1.0, 0.78, 0.25);
  else if (vTip < 3.5) c = vec3(0.35, 1.0, 0.6);
  else c = vec3(1.0, 0.7, 0.25);
  if (a < 0.01) discard;
  gl_FragColor = vec4(c * a, a);
}`;

const VERT_AERO = /* glsl */`
attribute float aMida, aPes;
uniform float uPR, uMin, uBrill, uR;
varying float vPes;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vPes = aPes;
  gl_Position = projectionMatrix * viewMatrix * vec4(position * uR, 1.0);
  gl_PointSize = aPes < uMin ? 0.0 : aMida * uPR;
  #include <logdepthbuf_vertex>
}`;
const FRAG_AERO = /* glsl */`
precision highp float;
varying float vPes;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float nucli = 1.0 - smoothstep(0.25, 0.45, d);
  float halo = pow(1.0 - d, 1.8) * 0.55;
  vec3 c = mix(vec3(1.0, 0.70, 0.25), vec3(1.0, 0.95, 0.8), nucli);
  float a = max(nucli, halo);
  gl_FragColor = vec4(c * a, a);
}`;

// ---------- Etiquetes DOM amb pool d'elements ----------
function crearPoolEtiquetes(cont, cls) {
  const els = [];
  let usades = 0;
  return {
    inicia() { usades = 0; },
    // Mostra una etiqueta a (x,y) amb text; reutilitza elements i només toca el DOM si canvia.
    pon(x, y, text, extraCls) {
      let e = els[usades];
      if (!e) {
        const d = document.createElement('div'); d.className = cls;
        d._t = ''; d._c = ''; cont.appendChild(d); e = d; els.push(d);
      }
      usades++;
      if (e._t !== text) { e.textContent = text; e._t = text; }
      const c = extraCls || '';
      if (e._c !== c) { e.className = cls + (c ? ' ' + c : ''); e._c = c; }
      e.style.transform = `translate(${x | 0}px,${y | 0}px)`;
      e.style.display = 'block';
    },
    acaba() { for (let i = usades; i < els.length; i++) if (els[i].style.display !== 'none') els[i].style.display = 'none'; },
  };
}

export function crearCapas(escena, av, cam) {
  const contEt = document.getElementById('etiquetas');
  const poolAv = crearPoolEtiquetes(contEt, 'et');
  const poolAe = crearPoolEtiquetes(contEt, 'et et-aero');

  // --- Aeroports ---
  let aeroN = 0, aeroIata = [], aeroNom = [], aeroLat = [], aeroLon = [], aeroPes = [];
  let aeroSx = new Float32Array(0), aeroSy = new Float32Array(0), aeroVis = new Uint8Array(0), aeroPos = new Float32Array(0);
  const aeroGeo = new THREE.BufferGeometry();
  const uAero = { uPR: { value: Math.min(devicePixelRatio, 1.5) }, uMin: { value: 0 }, uBrill: { value: 1 }, uR: { value: 1.0009 } };
  const aeroPts = new THREE.Points(aeroGeo, new THREE.ShaderMaterial({
    vertexShader: VERT_AERO, fragmentShader: FRAG_AERO, uniforms: uAero,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  aeroPts.frustumCulled = false; aeroPts.renderOrder = 3; escena.add(aeroPts);
  const idxAero = new Map();

  // --- Anells ---
  const ag = new THREE.BufferGeometry();
  const anPos = new THREE.BufferAttribute(new Float32Array(MAX_ANELLS * 3), 3).setUsage(THREE.DynamicDrawUsage);
  const anTip = new THREE.BufferAttribute(new Float32Array(MAX_ANELLS), 1).setUsage(THREE.DynamicDrawUsage);
  const anFas = new THREE.BufferAttribute(new Float32Array(MAX_ANELLS), 1).setUsage(THREE.DynamicDrawUsage);
  ag.setAttribute('position', anPos); ag.setAttribute('aTip', anTip); ag.setAttribute('aFas', anFas);
  const uAn = { uTemps: { value: 0 }, uPR: { value: Math.min(devicePixelRatio, 1.5) } };
  const anells = new THREE.Points(ag, new THREE.ShaderMaterial({
    vertexShader: VERT_ANELL, fragmentShader: FRAG_ANELL, uniforms: uAn,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  anells.frustumCulled = false; anells.renderOrder = 5; ag.setDrawRange(0, 0); escena.add(anells);

  // --- Línies de conflicte ---
  const lgG = new THREE.BufferGeometry();
  const lgPos = new THREE.BufferAttribute(new Float32Array(160 * 6), 3).setUsage(THREE.DynamicDrawUsage);
  lgG.setAttribute('position', lgPos); lgG.setDrawRange(0, 0);
  const lgMat = new THREE.LineBasicMaterial({ color: 0xff3347, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  const liniesConf = new THREE.LineSegments(lgG, lgMat);
  liniesConf.frustumCulled = false; liniesConf.renderOrder = 5; escena.add(liniesConf);

  // --- Ruta del vol seleccionat ---
  const MP = 512;
  const cRuta = crearCinta(escena, MP, 2.0, '#7fb4ff', 0.55, 0.012);
  // Tros volat: una cinta ampla de llum + una de nucli que comparteix la mateixa geometria
  const cRec = crearCinta(escena, MP, 9, '#4cc9f0', 0.20);
  const cRecN2 = crearCinta(escena, MP, 2.6, '#ffffff', 1.0, 0, cRec.geo);
  const bufR = new Float32Array(MP * 3);
  let rutaId = -2, rutaLong = 0;
  let orig = null, dest = null;             // vectors unitaris dels extrems de la ruta
  const origV = new Float32Array(3), destV = new Float32Array(3);
  let rutaVisible = false, infoRuta = null, fRuta = -1;

  // Perfil radial al llarg de la ruta: puja, creuer i baixa (f en 0..1).
  function perfil(f, rc) {
    const k = Math.min(1, f / 0.09, (1 - f) / 0.11);
    const s = k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
    const r0 = rAero();
    return r0 + (rc - r0) * s;
  }
  function puntsRuta(llArr, longTotal, rc, out, f0 = 0) {
    let m = llArr.length;
    const pas = m > MP ? Math.ceil(m / MP) : 1;
    let cnt = 0, acum = 0, px = 0, py = 0, pz = 0;
    for (let i = 0; i < m; i += pas) {
      const p = llArr[i];
      llAVec(p[0], p[1], out, cnt * 3);
      const x = out[cnt * 3], y = out[cnt * 3 + 1], z = out[cnt * 3 + 2];
      if (cnt > 0) acum += Math.acos(Math.min(1, Math.max(-1, x * px + y * py + z * pz)));
      px = x; py = y; pz = z;
      const r = perfil(longTotal > 0 ? f0 + acum / longTotal : 0, rc);
      out[cnt * 3] = x * r; out[cnt * 3 + 1] = y * r; out[cnt * 3 + 2] = z * r;
      cnt++;
    }
    return cnt;
  }
  function longitudAng(llArr) {
    let L = 0;
    for (let i = 1; i < llArr.length; i++) {
      const a = llArr[i - 1], b = llArr[i];
      const la1 = a[0] * DEG, la2 = b[0] * DEG, dl = (b[1] - a[1]) * DEG;
      const h = Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dl / 2) ** 2;
      L += 2 * Math.asin(Math.min(1, Math.sqrt(h)));
    }
    return L;
  }

  // --- Projecte (espai aeri) ---
  const grupProj = new THREE.Group(); grupProj.visible = false; escena.add(grupProj);
  let cBaix = null, cDalt = null, parets = null, vertLin = null, terra = null;
  const uProj = { uTemps: { value: 0 } };
  const MAX_CERC = 400, SEG_CERC = 28;
  const cercGeo = new THREE.BufferGeometry();
  const cercPos = new THREE.BufferAttribute(new Float32Array(MAX_CERC * SEG_CERC * 6), 3).setUsage(THREE.DynamicDrawUsage);
  const cercCol = new THREE.BufferAttribute(new Float32Array(MAX_CERC * SEG_CERC * 6), 3).setUsage(THREE.DynamicDrawUsage);
  cercGeo.setAttribute('position', cercPos); cercGeo.setAttribute('color', cercCol); cercGeo.setDrawRange(0, 0);
  const cercles = new THREE.LineSegments(cercGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  cercles.frustumCulled = false; cercles.renderOrder = 4; escena.add(cercles);
  const cosT = new Float32Array(SEG_CERC + 1), sinT = new Float32Array(SEG_CERC + 1);
  for (let k = 0; k <= SEG_CERC; k++) { cosT[k] = Math.cos(k / SEG_CERC * 2 * Math.PI); sinT[k] = Math.sin(k / SEG_CERC * 2 * Math.PI); }

  // Punt de la caixa per coordenades bilineals (u,v) sobre els 4 vèrtexs lat/lon.
  function puntCaixa(c, u, v, r, out, o) {
    // c = [[lat,lon] x4] en ordre NW, NE, SE, SW
    const lat = (1 - v) * ((1 - u) * c[0][0] + u * c[1][0]) + v * ((1 - u) * c[3][0] + u * c[2][0]);
    const lon = (1 - v) * ((1 - u) * c[0][1] + u * c[1][1]) + v * ((1 - u) * c[3][1] + u * c[2][1]);
    llAVec(lat, lon, out, o);
    out[o] *= r; out[o + 1] *= r; out[o + 2] *= r;
  }

  // Terra i sostre de l'espai aeri del projecte (segueixen l'escala visual d'altituds; es reconstrueixen si canvia)
  let R_BAIX = 1.0010, R_DALT = 1.0115, fCaixa = -1, caixaAct = null;

  const FV_PARET = /* glsl */`
    attribute float aV; uniform float uTemps; varying float vV;
    #include <common>
#include <logdepthbuf_pars_vertex>
    void main(){ vV = aV; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
    }`;
  const FF_PARET = /* glsl */`
    precision highp float; uniform float uTemps, uMax; varying float vV;
    #include <logdepthbuf_pars_fragment>
    void main(){
    #include <logdepthbuf_fragment>
    float a = (0.05 + 0.20 * vV * vV) * (0.85 + 0.15 * sin(uTemps * 2.0)) * uMax; gl_FragColor = vec4(vec3(0.25, 0.9, 1.0) * a, a); }`;

  function construirCaixa(caixa) {
    R_BAIX = radiAlt(0) + 0.0004 * VIS.f + 3e-6; R_DALT = radiAlt(30500); fCaixa = VIS.f; caixaAct = caixa;
    for (const o of [cBaix, cDalt, parets, vertLin, terra]) if (o) { grupProj.remove(o.mesh || o); o.geometry?.dispose?.(); }
    const SEG = 24;
    // Anells baix i dalt: perímetre amb SEG subdivisions per aresta
    const cn = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const perim = (r, tmp) => {
      let k = 0;
      for (let e = 0; e < 4; e++) {
        const a = cn[e], b = cn[(e + 1) % 4];
        for (let s = 0; s < SEG; s++) {
          const t = s / SEG;
          puntCaixa(caixa, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, r, tmp, k * 3); k++;
        }
      }
      puntCaixa(caixa, 0, 0, r, tmp, k * 3); k++;
      return k;
    };
    const tmp = new Float32Array((SEG * 4 + 1) * 3);
    cBaix = crearCinta(grupProj, SEG * 4 + 2, 2.4, '#5ef2ff', 0.95);
    cDalt = crearCinta(grupProj, SEG * 4 + 2, 1.8, '#5ef2ff', 0.6);
    cBaix.mesh.material.uniforms.uTemps = uProj.uTemps;
    let k = perim(R_BAIX, tmp); cBaix.set(tmp, k);
    k = perim(R_DALT, tmp); cDalt.set(tmp, k);
    // Arestes verticals
    const vp = new Float32Array(4 * 2 * 3);
    for (let e = 0; e < 4; e++) {
      puntCaixa(caixa, cn[e][0], cn[e][1], R_BAIX, vp, e * 6);
      puntCaixa(caixa, cn[e][0], cn[e][1], R_DALT, vp, e * 6 + 3);
    }
    const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.BufferAttribute(vp, 3));
    vertLin = new THREE.LineSegments(vg, new THREE.LineBasicMaterial({ color: 0x5ef2ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    vertLin.frustumCulled = false; grupProj.add(vertLin);
    // Parets translúcides
    const pp = [], pv = [];
    for (let e = 0; e < 4; e++) {
      const a = cn[e], b = cn[(e + 1) % 4];
      for (let s = 0; s < SEG; s++) {
        const t0 = s / SEG, t1 = (s + 1) / SEG;
        const q = new Float32Array(12);
        puntCaixa(caixa, a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, R_BAIX, q, 0);
        puntCaixa(caixa, a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, R_DALT, q, 3);
        puntCaixa(caixa, a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, R_BAIX, q, 6);
        puntCaixa(caixa, a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, R_DALT, q, 9);
        pp.push(q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7], q[8], q[3], q[4], q[5], q[9], q[10], q[11], q[6], q[7], q[8]);
        pv.push(0, 1, 0, 1, 1, 0);
      }
    }
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3)); wg.setAttribute('aV', new THREE.Float32BufferAttribute(pv, 1));
    const wm = new THREE.Mesh(wg, new THREE.ShaderMaterial({
      vertexShader: FV_PARET, fragmentShader: FF_PARET, uniforms: { uTemps: uProj.uTemps, uMax: { value: 1 } },
      side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    wm.frustumCulled = false; wm.renderOrder = 4; grupProj.add(wm); parets = wm;
    // Sòl: malla 12x12 translúcida
    const G = 14, tp = [], ti = [];
    const o = new Float32Array(3);
    for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) { puntCaixa(caixa, i / G, j / G, R_BAIX, o, 0); tp.push(o[0], o[1], o[2]); }
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const a = j * (G + 1) + i; ti.push(a, a + 1, a + G + 1, a + 1, a + G + 2, a + G + 1); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); fg.setIndex(ti);
    const fm = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x2ad4ff, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    fm.frustumCulled = false; fm.renderOrder = 3; grupProj.add(fm); terra = fm;
  }

  const tmpA = new THREE.Vector3();
  let anCount = 0;
  function posAnell(x, y, z, tip, fas) {
    if (anCount >= MAX_ANELLS) return;
    const a = anPos.array; const o = anCount * 3;
    a[o] = x; a[o + 1] = y; a[o + 2] = z;
    anTip.array[anCount] = tip; anFas.array[anCount] = fas; anCount++;
  }

  let ultimEtiq = 0, selEtiq = [], tick = 0;
  const cand = { idx: new Int32Array(48), d: new Float32Array(48), n: 0 };

  return {
    // Defineix la llista d'aeroports (de 'inicio').
    fijarAeropuertos(lista) {
      aeroN = lista.length;
      aeroIata = lista.map(a => a[0]); aeroNom = lista.map(a => a[1]);
      aeroLat = lista.map(a => a[4]); aeroLon = lista.map(a => a[5]); aeroPes = lista.map(a => a[6]);
      aeroPos = new Float32Array(aeroN * 3);
      const mida = new Float32Array(aeroN), pes = new Float32Array(aeroN);
      idxAero.clear();
      for (let i = 0; i < aeroN; i++) {
        llAVec(aeroLat[i], aeroLon[i], aeroPos, i * 3);
        mida[i] = 6 + aeroPes[i] * 1.6; pes[i] = aeroPes[i];
        idxAero.set(aeroIata[i], i);
      }
      aeroGeo.setAttribute('position', new THREE.BufferAttribute(aeroPos, 3));
      aeroGeo.setAttribute('aMida', new THREE.BufferAttribute(mida, 1));
      aeroGeo.setAttribute('aPes', new THREE.BufferAttribute(pes, 1));
      aeroGeo.setDrawRange(0, aeroN);
      aeroSx = new Float32Array(aeroN); aeroSy = new Float32Array(aeroN); aeroVis = new Uint8Array(aeroN);
    },
    iataIdx: i => aeroIata[i],
    posAeropuerto(iata, out) {
      const i = idxAero.get(iata); if (i === undefined) return false;
      out.set(aeroPos[i * 3], aeroPos[i * 3 + 1], aeroPos[i * 3 + 2]).normalize(); return true;
    },
    // Aeroport més proper a (mx,my) dins del radi (px). Retorna iata o null.
    pickAeropuerto(mx, my, radi) {
      let m = -1, d2m = radi * radi;
      for (let i = 0; i < aeroN; i++) {
        if (!aeroVis[i]) continue;
        const dx = aeroSx[i] - mx, dy = aeroSy[i] - my, d2 = dx * dx + dy * dy;
        if (d2 < d2m) { d2m = d2; m = i; }
      }
      return m >= 0 ? aeroIata[m] : null;
    },

    // Mostra la ruta d'un 'infoVuelo' (o l'amaga si info és null).
    mostrarRuta(info, forcar = false) {
      if (forcar) rutaId = -2;
      infoRuta = info; fRuta = VIS.f;
      if (!info || !info.ruta || info.ruta.length < 2) { rutaVisible = false; cRuta.ocultar(); cRec.ocultar(); cRecN2.mesh.visible = false; return; }
      rutaVisible = true;
      const L = longitudAng(info.ruta);
      const rc = radiAlt((info.nivelCrucero || 350) * 100);
      if (rutaId !== info.id || rutaLong !== info.ruta.length) {
        rutaId = info.id; rutaLong = info.ruta.length;
        const k = puntsRuta(info.ruta, L, rc, bufR);
        cRuta.set(bufR, k);
        llAVec(info.ruta[0][0], info.ruta[0][1], origV, 0);
        const u = info.ruta[info.ruta.length - 1]; llAVec(u[0], u[1], destV, 0);
        orig = origV; dest = destV;
      }
      const col = new THREE.Color(info.color || '#4cc9f0');
      cRec.uni.uCol.value.copy(col); cRuta.uni.uCol.value.copy(col).lerp(new THREE.Color('#9fc4ff'), 0.5);
      if (info.recorrido && info.recorrido.length > 1) {
        const k = puntsRuta(info.recorrido, L, rc, bufR);
        cRec.set(bufR, k); cRecN2.mesh.visible = true;
      } else { cRec.ocultar(); cRecN2.mesh.visible = false; }
    },
    ocultarRuta() { rutaVisible = false; cRuta.ocultar(); cRec.ocultar(); cRecN2.mesh.visible = false; rutaId = -2; orig = dest = null; },

    // Configura (o desactiva) la caixa de l'espai aeri del projecte.
    ponProyecto(p) {
      if (!p) { grupProj.visible = false; return; }
      construirCaixa(p.caja);
      grupProj.visible = true;
    },

    // Actualització per fotograma.
    actualizar(ahora, tAnim, W, H, selId, selIata, conflictos, hVista, frame) {
      const K = 2 * Math.tan(cam.fov * DEG / 2) / H;
      cRuta.uni.uK.value = cRec.uni.uK.value = cRecN2.uni.uK.value = K;
      cRuta.uni.uDmax.value = cRec.uni.uDmax.value = cRecN2.uni.uDmax.value = E.pilotant ? 4e-5 : 1e9;
      cRuta.uni.uTemps.value = tAnim;
      if (cBaix) { cBaix.uni.uK.value = cDalt.uni.uK.value = K; }
      uProj.uTemps.value = tAnim;
      uAn.uTemps.value = tAnim; uAn.uPR.value = uAero.uPR.value = Math.min(devicePixelRatio, 1.5);
      const vc = E.capas;
      if (rutaVisible && infoRuta && Math.abs(VIS.f - fRuta) > 0.01) this.mostrarRuta(infoRuta, true);
      if (caixaAct && grupProj.visible && Math.abs(VIS.f - fCaixa) > 0.02) construirCaixa(caixaAct);
      const rA = rAero(); uAero.uR.value = rA;
      cRuta.mesh.visible = vc.rutas && cRuta.n > 1 && rutaVisible;
      cRec.mesh.visible = vc.rutas && rutaVisible && cRec.n > 1;
      cRecN2.mesh.visible = cRec.mesh.visible;

      // Aeroports: llindar de pes segons altitud de la càmera; projecció per a cerca i etiquetes
      aeroPts.visible = vc.aeropuertos;
      const thr = hVista > 3 ? 3 : hVista > 1.4 ? 2 : hVista > 0.5 ? 1 : 0;
      uAero.uMin.value = thr;
      const el = av.pvm.elements;
      const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z;
      const D = Math.hypot(cx, cy, cz);
      const cosLim = 1 / D;      // horitzó geomètric: només punts del costat visible
      const ux = cx / D, uy = cy / D, uz = cz / D;
      poolAe.inicia();
      let nEt = 0;
      for (let i = 0; i < aeroN; i++) {
        const X = aeroPos[i * 3] * rA, Y = aeroPos[i * 3 + 1] * rA, Z = aeroPos[i * 3 + 2] * rA;
        const w = el[3] * X + el[7] * Y + el[11] * Z + el[15];
        if (w > 0 && aeroPes[i] >= thr && (X * ux + Y * uy + Z * uz) > cosLim) {
          const nx = (el[0] * X + el[4] * Y + el[8] * Z + el[12]) / w, ny = (el[1] * X + el[5] * Y + el[9] * Z + el[13]) / w;
          aeroSx[i] = (nx * 0.5 + 0.5) * W; aeroSy[i] = (0.5 - ny * 0.5) * H;
          aeroVis[i] = vc.aeropuertos && nx > -1 && nx < 1 && ny > -1 && ny < 1 ? 1 : 0;
          if (aeroVis[i] && vc.etiquetas && nEt < 36) {
            const lim = hVista < 0.35 ? 0 : hVista < 0.9 ? 2 : hVista < 1.8 ? 3 : 5;
            if (aeroPes[i] >= lim && hVista < 2.4) { poolAe.pon(aeroSx[i] + 8, aeroSy[i] - 7, aeroIata[i], aeroIata[i] === selIata ? 'sel' : ''); nEt++; }
          }
        } else aeroVis[i] = 0;
      }
      poolAe.acaba();

      // Anells: avió seleccionat, conflictes, aeroport seleccionat i extrems de la ruta
      anCount = 0;
      const F = av.F, mapa = av.mapa;
      if (selId >= 0) {
        const i = mapa.get(selId);
        if (i !== undefined) { const b = i * ST, r = radiAlt(F[b + ALT]); posAnell(F[b + DX] * r, F[b + DX + 1] * r, F[b + DX + 2] * r, 0, 0); }
      }
      let nl = 0;
      const lp = lgPos.array;
      if (vc.conflictos) {
        for (let k = 0; k < conflictos.length && nl < 150; k++) {
          const c = conflictos[k];
          const ia = mapa.get(c[0]), ib = mapa.get(c[1]);
          if (ia === undefined || ib === undefined) continue;
          const ba = ia * ST, bb = ib * ST, ra = radiAlt(F[ba + ALT]), rb = radiAlt(F[bb + ALT]);
          const ax = F[ba + DX] * ra, ay = F[ba + DX + 1] * ra, az = F[ba + DX + 2] * ra;
          const bx = F[bb + DX] * rb, by = F[bb + DX + 1] * rb, bz = F[bb + DX + 2] * rb;
          posAnell(ax, ay, az, 1, (k * 0.37) % 1); posAnell(bx, by, bz, 1, (k * 0.37) % 1);
          lp[nl * 6] = ax; lp[nl * 6 + 1] = ay; lp[nl * 6 + 2] = az; lp[nl * 6 + 3] = bx; lp[nl * 6 + 4] = by; lp[nl * 6 + 5] = bz;
          nl++;
        }
      }
      lgPos.needsUpdate = true; lgG.setDrawRange(0, nl * 2);
      lgMat.opacity = 0.55 + 0.4 * Math.sin(tAnim * 8);
      liniesConf.visible = nl > 0;
      if (selIata) {
        const i = idxAero.get(selIata);
        if (i !== undefined) posAnell(aeroPos[i * 3] * rA, aeroPos[i * 3 + 1] * rA, aeroPos[i * 3 + 2] * rA, 2, 0);
      }
      if (rutaVisible && vc.rutas && orig && dest) {
        const ra = rAero();
        posAnell(orig[0] * ra, orig[1] * ra, orig[2] * ra, 3, 0);
        posAnell(dest[0] * ra, dest[1] * ra, dest[2] * ra, 4, 0);
      }
      anPos.needsUpdate = anTip.needsUpdate = anFas.needsUpdate = true; ag.setDrawRange(0, anCount);

      // Cercles de seguretat dels avions del projecte (radi = distància de seguretat / 2)
      let nc = 0;
      if (E.modo === 'proyecto' && E.proyecto) {
        const rho0 = (E.proyecto.distanciaSeguridadNM || 2.5) / 2 / NM_PER_RAD;
        const cp = cercPos.array, cc = cercCol.array;
        const Kp = 0.45 * 17 / H * 2 * Math.tan(cam.fov * DEG / 2);
        for (let i = 0; i < av.n && nc < MAX_CERC; i++) {
          if (av.aero[i] !== -2) continue;
          const b = i * ST, r = radiAlt(F[b + ALT]);
          const px = F[b + DX], py = F[b + DX + 1], pz = F[b + DX + 2];
          const dist = Math.hypot(px * r - cx, py * r - cy, pz * r - cz);
          const rho = Math.max(rho0, dist * Kp);
          // Base tangent: T1 = normalize(P × y), T2 = P × T1
          let t1x = py * 0 - pz * 1, t1y = pz * 0 - px * 0, t1z = px * 1 - py * 0;   // P × (0,1,0)
          const tl = 1 / (Math.hypot(t1x, t1y, t1z) || 1); t1x *= tl; t1y *= tl; t1z *= tl;
          const t2x = py * t1z - pz * t1y, t2y = pz * t1x - px * t1z, t2z = px * t1y - py * t1x;
          const cr = Math.cos(rho), sr = Math.sin(rho);
          const o0 = nc * SEG_CERC * 6;
          const enConf = av.base[i] === 1;     // vermell si l'avió està en conflicte
          const cR = enConf ? 1.0 : 0.25, cG = enConf ? 0.2 : 0.95, cB = enConf ? 0.25 : 1.0;
          for (let k = 0; k < SEG_CERC; k++) {
            for (let e = 0; e < 2; e++) {
              const kk = k + e, ct = cosT[kk], st = sinT[kk];
              const o = o0 + (k * 2 + e) * 3;
              const vx = px * cr + (t1x * ct + t2x * st) * sr, vy = py * cr + (t1y * ct + t2y * st) * sr, vz = pz * cr + (t1z * ct + t2z * st) * sr;
              cp[o] = vx * r; cp[o + 1] = vy * r; cp[o + 2] = vz * r;
              cc[o] = cR; cc[o + 1] = cG; cc[o + 2] = cB;
            }
          }
          nc++;
        }
        cercPos.needsUpdate = cercCol.needsUpdate = true;
      }
      cercGeo.setDrawRange(0, nc * SEG_CERC * 2);
      cercles.visible = nc > 0 && vc.conflictos;

      // Etiquetes d'avions: els més propers a la càmera (cada 8 fotogrames), màxim 40
      if (vc.etiquetas && hVista < 1.1) {
        if (frame - ultimEtiq >= 8) {
          ultimEtiq = frame;
          cand.n = 0;
          for (let i = 0; i < av.n; i++) {
            if (!av.vis[i]) continue;
            const b = i * ST, r = 1.01;
            const dx = F[b + DX] * r - cx, dy = F[b + DX + 1] * r - cy, dz = F[b + DX + 2] * r - cz;
            const d = dx * dx + dy * dy + dz * dz;
            // Inserció en llista ordenada (màx 40)
            if (cand.n < 40 || d < cand.d[cand.n - 1]) {
              let j = cand.n < 40 ? cand.n++ : 39;
              while (j > 0 && cand.d[j - 1] > d) { cand.d[j] = cand.d[j - 1]; cand.idx[j] = cand.idx[j - 1]; j--; }
              cand.d[j] = d; cand.idx[j] = i;
            }
          }
          selEtiq.length = 0; for (let j = 0; j < cand.n; j++) selEtiq.push(av.ids[cand.idx[j]]);
        }
        poolAv.inicia();
        for (let j = 0; j < selEtiq.length; j++) {
          const i = mapa.get(selEtiq[j]);
          if (i === undefined || !av.vis[i]) continue;
          poolAv.pon(av.sx[i] + 10, av.sy[i] - 12, av.cs[i], av.ids[i] === selId ? 'sel' : '');
        }
        poolAv.acaba();
      } else { poolAv.inicia(); if (selId >= 0 && vc.etiquetas) { const i = mapa.get(selId); if (i !== undefined && av.vis[i]) poolAv.pon(av.sx[i] + 12, av.sy[i] - 14, av.cs[i], 'sel'); } poolAv.acaba(); }
    },
  };
}
