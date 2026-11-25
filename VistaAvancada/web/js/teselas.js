// Tessel·les d'imatges de satèl·lit (Esri World Imagery, fins a zoom 18 ≈ 0,6 m/píxel) sobre el globus, amb nivell de
// detall adaptatiu (quadtree Web Mercator). Només es demanen les tessel·les visibles que aporten més resolució que la
// textura global; mentre arriben es veu la del nivell anterior (o l'esfera base). Cada tessel·la és una malla amb
// coordenades relatives al seu centre (precisió suficient a pocs metres del terra) i el mateix shader de dia/nit.
// Si no hi ha Internet, no passa res: es continua veient la textura global.
import * as THREE from 'three';
import { GLSL_LLUM } from './shaders.js';

const URL_TESSELA = (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
const Z_ARREL = 4, Z_MAX = 18;
const MAX_CONCURRENTS = 8, MAX_CACHE = 280;
const PX_LLINDAR = 1.25;              // píxels de pantalla per texel a partir dels quals cal més detall
const DEG = Math.PI / 180;

const VERT = /* glsl */`
attribute vec2 uvG;
varying vec2 vUv, vUvG; varying vec3 vW;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vUv = uv; vUvG = uvG;
  vW = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #include <logdepthbuf_vertex>
}`;
const FRAG = /* glsl */`
precision highp float;
uniform sampler2D tTes, tNit, tAigua;
uniform vec3 uSol, uCam;
uniform float uDN, uAtm, uAlfa;
varying vec2 vUv, vUvG; varying vec3 vW;
#include <logdepthbuf_pars_fragment>
${GLSL_LLUM}
void main(){
  #include <logdepthbuf_fragment>
  vec3 Ng = normalize(vW);
  vec3 V = normalize(uCam - vW);
  vec3 dia = texture2D(tTes, vUv).rgb;
  float aigua = texture2D(tAigua, vUvG).r;
  float hc = length(uCam) - 1.0;
  float lluny = mix(0.5, 1.0, smoothstep(0.03, 0.7, hc));
  float espec = smoothstep(0.004, 0.05, hc);           // a prop, la màscara d'aigua global és massa grollera
  vec3 col = ilumina(dia, aigua, Ng, Ng, V, texture2D(tNit, vUvG).rgb, lluny, espec);
  // "Llum de lluna": de nit i a prop del terra, la imatge es continua intuint (de lluny la nit queda fosca)
  float prop = 1.0 - smoothstep(0.0, 0.03, hc);
  float fosc = 1.0 - smoothstep(-0.15, 0.2, dot(Ng, uSol));
  col += dia * vec3(0.10, 0.12, 0.17) * prop * fosc * uDN;
  gl_FragColor = vec4(col, 1.0);
}`;

// Latitud (graus) de la coordenada y de tessel·la (pot ser fraccionària) al zoom z.
const latDeY = (y, n) => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) / DEG;

export function crearTeselas(escena, renderer, uniGlobus, imgAigua) {
  const grup = new THREE.Group(); grup.renderOrder = -1;
  escena.add(grup);
  const mapa = new Map();            // clau "z/x/y" -> tessel·la
  let actiu = true, frameSel = -10, carregant = 0, errorsSeguits = 0, pausaFins = 0;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const frustum = new THREE.Frustum(), pv = new THREE.Matrix4(), esf = new THREE.Sphere();
  const dibuixades = [];
  const cua = [];                    // peticions d'aquesta passada: {t, prio}
  const camDir = new THREE.Vector3();

  // Màscara de mar obert (1600x800) per no baixar al detall màxim enmig de l'oceà. La màscara és molt grollera
  // (~25 km/píxel), així que només compta com a mar obert si tots els píxels a 3 de distància també són aigua
  // (més de ~75 km de la costa): les ciutats costaneres sempre tenen tot el detall.
  let aigua = null, aW = 0, aH = 0;
  try {
    const cv = document.createElement('canvas'); aW = cv.width = imgAigua.width; aH = cv.height = imgAigua.height;
    const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(imgAigua, 0, 0);
    const d = g.getImageData(0, 0, aW, aH).data;
    const brut = new Uint8Array(aW * aH);
    for (let i = 0; i < aW * aH; i++) brut[i] = d[i * 4] > 128 ? 1 : 0;
    aigua = new Uint8Array(aW * aH);
    const R = 3;
    for (let y = 0; y < aH; y++) for (let x = 0; x < aW; x++) {
      let tot = 1;
      for (let dy = -R; dy <= R && tot; dy++) for (let dx = -R; dx <= R; dx++) {
        const yy = Math.min(aH - 1, Math.max(0, y + dy)), xx = (x + dx + aW) % aW;
        if (!brut[yy * aW + xx]) { tot = 0; break; }
      }
      aigua[y * aW + x] = tot ? 255 : 0;
    }
  } catch { aigua = null; }
  const esAigua = (lat, lon) => {
    if (!aigua) return false;
    const x = Math.min(aW - 1, Math.max(0, Math.floor((lon + 180) / 360 * aW)));
    const y = Math.min(aH - 1, Math.max(0, Math.floor((90 - lat) / 180 * aH)));
    return aigua[y * aW + x] > 128;
  };

  // Obté (o crea l'objecte buit de) la tessel·la z/x/y amb el seu centre i radi angular.
  function tessela(z, x, y) {
    const clau = z + '/' + x + '/' + y;
    let t = mapa.get(clau);
    if (t) return t;
    const n = 2 ** z;
    const lon0 = x / n * 360 - 180, lon1 = (x + 1) / n * 360 - 180;
    const lat0 = latDeY(y, n), lat1 = latDeY(y + 1, n);
    const latC = latDeY(y + 0.5, n), lonC = (lon0 + lon1) / 2;
    const c = new THREE.Vector3().setFromSphericalCoords(1, (90 - latC) * DEG, (lonC + 90) * DEG);
    // setFromSphericalCoords(r, phi, theta): x = r sinφ sinθ, y = r cosφ, z = r sinφ cosθ  ->  amb θ = lon + 90°
    // dona x = cos(lat) cos(lon), z = -cos(lat) sin(lon), que és la convenció del projecte.
    const cantons = [[lat0, lon0], [lat0, lon1], [lat1, lon0], [lat1, lon1]];
    let radi = 0;
    for (const [la, lo] of cantons) {
      const v = new THREE.Vector3().setFromSphericalCoords(1, (90 - la) * DEG, (lo + 90) * DEG);
      radi = Math.max(radi, v.angleTo(c));
    }
    // Mida d'un texel (radis) a la latitud més equatorial de la tessel·la
    const latMinAbs = (lat0 > 0) === (lat1 > 0) ? Math.min(Math.abs(lat0), Math.abs(lat1)) : 0;
    const texel = (lon1 - lon0) * DEG * Math.cos(latMinAbs * DEG) / 256;
    const oceana = z >= 9 && esAigua(latC, lonC) && cantons.every(([la, lo]) => esAigua(la, lo));
    t = { clau, z, x, y, lat0, lat1, lon0, lon1, c, radi, texel, oceana, estat: 0, mesh: null, tex: null, ctrl: null, us: 0, demanada: 0 };
    mapa.set(clau, t);
    return t;
  }

  // Construeix la malla d'una tessel·la (graella en coordenades Mercator + faldó cap avall per tapar escletxes).
  function crearMalla(t) {
    const N = t.z <= 6 ? 32 : t.z <= 10 ? 20 : 12;
    const n = 2 ** t.z;
    const pos = [], uv = [], uvG = [], idx = [];
    const v = new THREE.Vector3();
    const faldo = t.radi * 0.06;
    const punt = (i, j, r) => {
      const la = latDeY(t.y + j / N, n), lo = t.lon0 + (t.lon1 - t.lon0) * i / N;
      v.setFromSphericalCoords(r, (90 - la) * DEG, (lo + 90) * DEG).sub(t.c);
      pos.push(v.x, v.y, v.z); uv.push(i / N, j / N); uvG.push((lo + 180) / 360, (la + 90) / 180);
    };
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) punt(i, j, 1);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    // Faldó: el perímetre repetit una mica per sota
    const per = [];
    for (let i = 0; i <= N; i++) per.push([i, 0]);
    for (let j = 1; j <= N; j++) per.push([N, j]);
    for (let i = N - 1; i >= 0; i--) per.push([i, N]);
    for (let j = N - 1; j >= 1; j--) per.push([0, j]);
    const base = pos.length / 3;
    for (const [i, j] of per) punt(i, j, 1 - faldo);
    for (let k = 0; k < per.length; k++) {
      const k2 = (k + 1) % per.length;
      const a = per[k][1] * (N + 1) + per[k][0], b = per[k2][1] * (N + 1) + per[k2][0];
      idx.push(a, b, base + k, b, base + k2, base + k);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('uvG', new THREE.Float32BufferAttribute(uvG, 2));
    g.setIndex(idx);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2 * Math.sin(t.radi / 2) + 1e-6);
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide,
      uniforms: {
        tTes: { value: t.tex }, tNit: uniGlobus.tNit, tAigua: uniGlobus.tAigua,
        uSol: uniGlobus.uSol, uCam: uniGlobus.uCam, uDN: uniGlobus.uDN, uAtm: uniGlobus.uAtm, uAlfa: { value: 1 },
      },
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.copy(t.c);
    mesh.frustumCulled = false; mesh.visible = false; mesh.matrixAutoUpdate = false; mesh.updateMatrix();
    mesh.renderOrder = -1;
    grup.add(mesh);
    t.mesh = mesh;
  }

  // Descarrega la imatge d'una tessel·la (fetch + decodificació fora del fil principal).
  async function carregar(t) {
    t.estat = 1; carregant++;
    t.ctrl = new AbortController();
    try {
      const r = await fetch(URL_TESSELA(t.z, t.x, t.y), { signal: t.ctrl.signal, mode: 'cors' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const bmp = await createImageBitmap(await r.blob());
      const tex = new THREE.Texture(bmp);
      tex.flipY = false; tex.anisotropy = aniso; tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      t.tex = tex;
      crearMalla(t);
      t.estat = 2; errorsSeguits = 0;
    } catch (e) {
      if (e && e.name === 'AbortError') t.estat = 0;
      else {
        t.estat = 3;
        if (++errorsSeguits > 25) { pausaFins = performance.now() + 60000; errorsSeguits = 0; }   // sense connexió: espera 1 min
      }
    } finally { carregant--; t.ctrl = null; }
  }

  // Allibera la memòria d'una tessel·la.
  function allibera(t) {
    if (t.ctrl) t.ctrl.abort();
    if (t.mesh) { grup.remove(t.mesh); t.mesh.geometry.dispose(); t.mesh.material.dispose(); t.mesh = null; }
    if (t.tex) { t.tex.image?.close?.(); t.tex.dispose(); t.tex = null; }
    t.estat = 0;
  }

  let cam, Hpx = 900, kPx = 1, hCam = 1, cosHoritzo = 0, frame = 0;

  // La tessel·la és (en part) visible: per sobre de l'horitzó i dins del camp de visió.
  function visible(t) {
    const ang = Math.acos(Math.min(1, Math.max(-1, t.c.dot(camDir))));
    if (ang - t.radi > Math.acos(Math.min(1, cosHoritzo)) + 0.02) return false;
    esf.center.copy(t.c); esf.radius = 2 * Math.sin(t.radi / 2) * 1.05;
    return frustum.intersectsSphere(esf);
  }

  // Píxels de pantalla que ocupa un texel de la tessel·la (al seu punt més proper a la càmera).
  function pxPerTexel(t) {
    const d = Math.max(hCam * 0.9, cam.position.distanceTo(t.c) - 2 * Math.sin(t.radi / 2));
    return t.texel / d * kPx;
  }

  function demana(t, prio) {
    t.us = frame;
    if (t.estat === 0) cua.push({ t, prio });
  }

  // Recorre el quadtree a partir de t i decideix què es dibuixa (t o els seus fills).
  function visita(t) {
    if (!visible(t)) return;
    t.us = frame;
    const px = pxPerTexel(t);
    if (px > PX_LLINDAR && t.z < Z_MAX && !t.oceana) {
      const fills = [];
      for (let k = 0; k < 4; k++) fills.push(tessela(t.z + 1, t.x * 2 + (k & 1), t.y * 2 + (k >> 1)));
      const vis = fills.map(visible);
      const llestos = fills.every((f, k) => !vis[k] || f.estat === 2);
      const ambError = fills.some((f, k) => vis[k] && f.estat === 3);
      if (llestos && !ambError) { for (const f of fills) visita(f); return; }
      if (!ambError) fills.forEach((f, k) => { if (vis[k]) demana(f, px * 2); });
    }
    if (t.estat === 2) { t.mesh.visible = true; dibuixades.push(t); }
    else demana(t, px * 4);           // primer es demana el nivell més groller que falta
  }

  return {
    // Actualitza les tessel·les dibuixades (cada 2 fotogrames) i gestiona descàrregues i memòria.
    actualitzar(camera, H, fr) {
      frame = fr;
      if (!actiu) return;
      if (fr - frameSel < 2) return;
      frameSel = fr;
      cam = camera; Hpx = H;
      hCam = cam.position.length() - 1;
      camDir.copy(cam.position).normalize();
      cosHoritzo = 1 / cam.position.length();
      kPx = Hpx / (2 * Math.tan(cam.fov * DEG / 2));
      cam.updateMatrixWorld();
      pv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      frustum.setFromProjectionMatrix(pv);

      for (const t of dibuixades) if (t.mesh) t.mesh.visible = false;
      dibuixades.length = 0; cua.length = 0;
      // Arrels a Z_ARREL: només si la textura global ja no té prou resolució
      const n = 2 ** Z_ARREL;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const t = tessela(Z_ARREL, x, y);
        if (!visible(t)) continue;
        if (pxPerTexel(t) * 0.75 > PX_LLINDAR) visita(t);
      }

      // Noves descàrregues per ordre de prioritat
      if (performance.now() > pausaFins) {
        cua.sort((a, b) => b.prio - a.prio);
        for (const { t } of cua) {
          if (carregant >= MAX_CONCURRENTS) break;
          if (t.estat === 0) carregar(t);
        }
      }
      // Cancel·la les descàrregues que ja no calen i allibera les tessel·les velles
      let llestes = 0;
      for (const t of mapa.values()) {
        if (t.estat === 1 && fr - t.us > 40) t.ctrl?.abort();
        if (t.estat === 2) llestes++;
      }
      if (llestes > MAX_CACHE) {
        const velles = [...mapa.values()].filter(t => t.estat === 2 && t.us < fr - 4).sort((a, b) => a.us - b.us);
        for (let i = 0; i < velles.length && llestes > MAX_CACHE * 0.85; i++) { allibera(velles[i]); llestes--; }
      }
      // Les entrades buides molt velles també es treuen del mapa
      if (mapa.size > 6000) for (const [k, t] of mapa) if (t.estat !== 1 && t.estat !== 2 && fr - t.us > 600) mapa.delete(k);
    },
    // Activa o desactiva les imatges d'alta resolució.
    ponActiu(b) {
      actiu = b;
      if (!b) { for (const t of dibuixades) if (t.mesh) t.mesh.visible = false; dibuixades.length = 0; }
      else frameSel = -10;
    },
    estat: () => ({ dibuixades: dibuixades.length, carregant, total: mapa.size, zMax: dibuixades.reduce((m, t) => Math.max(m, t.z), 0) }),
  };
}
