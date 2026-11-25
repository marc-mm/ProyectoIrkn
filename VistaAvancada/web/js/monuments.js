// Monuments: 100 llocs emblemàtics de 50 ciutats, low-poly, col·locats a la seva posició real sobre el globus.
// Les dades són a js/monuments/dades_*.js (format a monuments_geo.js). Les malles es construeixen quan la càmera
// s'hi acosta; de lluny es veuen com una etiqueta i, en apropar-se, el model (una mica exagerat de mida a distància
// mitjana perquè es distingeixi, i a mida real de prop).
import * as THREE from 'three';
import { llAVec, baseENU, M_A_RADIS, DEG } from './geo.js';
import { E } from './estat.js';
import { construirGeometria, crearMaterialMonument } from './monuments_geo.js';

const FITXERS = ['dades_0', 'dades_1', 'dades_2', 'dades_3', 'dades_4'];
const D_ETIQUETA = 0.03;          // distància càmera-monument (radis, ~190 km) per mostrar l'etiqueta
const D_MODEL = 0.016;            // ~100 km: es construeix i es mostra el model
const MAX_ETIQUETES = 24;

export function crearMonuments(escena, contEtiquetes) {
  const llista = [];              // {nom, ciutat, pais, lat, lon, rumb, peces, P (unitari), mesh, mida, sx, sy, vis}
  const grup = new THREE.Group(); escena.add(grup);
  const e = new THREE.Vector3(), nV = new THREE.Vector3(), u = new THREE.Vector3(), s = new THREE.Vector3();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qGir = new THREE.Quaternion(), Yv = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3(), tmpV = new THREE.Vector3();
  const buf = [0, 0, 0];
  let seleccionat = null;

  // Pool d'etiquetes DOM (mateix patró que capas.js)
  const els = [];
  let usades = 0;
  function etiqueta(x, y, text, sel) {
    let d = els[usades];
    if (!d) { d = document.createElement('div'); d.className = 'et et-mon'; d._t = ''; contEtiquetes.appendChild(d); els.push(d); }
    usades++;
    if (d._t !== text) { d.textContent = text; d._t = text; }
    d.classList.toggle('sel', !!sel);
    d.style.transform = `translate(${x | 0}px,${y | 0}px)`;
    d.style.display = 'block';
  }

  // Carrega els fitxers de dades que existeixin (si en falta algun, s'ignora).
  async function carregar() {
    for (const f of FITXERS) {
      try {
        const mod = await import(`./monuments/${f}.js`);
        for (const c of mod.CIUTATS || []) for (const m of c.monuments || []) {
          if (!isFinite(m.lat) || !isFinite(m.lon)) continue;
          llAVec(m.lat, m.lon, buf, 0);
          llista.push({ nom: m.nom, ciutat: c.ciutat, pais: c.pais, lat: m.lat, lon: m.lon, rumb: m.rumb || 0, peces: m.peces,
            P: new THREE.Vector3(buf[0], buf[1], buf[2]), mesh: null, mida: 100, sx: 0, sy: 0, vis: false, error: false });
        }
      } catch (err) { console.warn('Monuments: no s\'ha pogut carregar ' + f + ': ' + err.message); }
    }
  }
  const promesa = carregar();

  // Construeix la malla d'un monument i l'orienta sobre el globus (base est-amunt-sud, girada pel rumb).
  function construir(m) {
    const r = construirGeometria(m.peces);
    if (!r.triangles) { m.error = true; return; }
    const mat = crearMaterialMonument();
    const mesh = new THREE.Mesh(r.geo, mat);
    baseENU(m.lat, m.lon, e, nV, u);
    s.copy(nV).negate();                                    // sud
    m4.makeBasis(e, u, s);
    q.setFromRotationMatrix(m4);
    qGir.setFromAxisAngle(Yv, -m.rumb * DEG);
    mesh.quaternion.copy(q).multiply(qGir);
    mesh.position.copy(m.P);
    mesh.frustumCulled = false;
    const b = r.caixa;
    m.mida = Math.max(b.max.x - b.min.x, b.max.z - b.min.z, b.max.y, 20);
    m.alcada = b.max.y;
    m.u = u.clone();
    grup.add(mesh);
    m.mesh = mesh;
  }

  return {
    llesta: promesa,
    get llista() { return llista; },
    // Actualització per fotograma: models propers, il·luminació, etiquetes i posicions de pantalla (per al clic).
    actualizar(cam, W, H, pvm, dirSol, frame) {
      usades = 0;
      const on = E.capas.monuments !== false;
      grup.visible = on;
      if (!on || !llista.length) { for (let i = 0; i < els.length; i++) els[i].style.display = 'none'; return; }
      cam.updateMatrixWorld();
      const el = pvm.elements, cp = cam.position, D = cp.length();
      const cosLim = 1 / D;
      const kPx = H / (2 * Math.tan(cam.fov * DEG / 2));
      let nEt = 0;
      for (const m of llista) {
        const d = tmp.copy(m.P).sub(cp).length();
        m.vis = false;
        if (d > D_ETIQUETA * 1.5 && !(m === seleccionat && d < 0.4)) { if (m.mesh) m.mesh.visible = false; continue; }
        const sobre = m.P.dot(cp) / D > cosLim - 0.002;
        // Model
        if (d < D_MODEL) {
          if (!m.mesh && !m.error) construir(m);
          if (m.mesh) {
            m.mesh.visible = sobre;
            // A distància mitjana s'exagera la mida (fins a ×5) perquè es distingeixi; a prop, mida real
            const ex = Math.min(5, Math.max(1, (d * 6371) / 6));
            m.mesh.scale.setScalar(M_A_RADIS * ex);
            const mat = m.mesh.material;
            tmpV.copy(dirSol).transformDirection(cam.matrixWorldInverse); mat.uniforms.uSolV.value.copy(tmpV);
            tmpV.copy(m.u).transformDirection(cam.matrixWorldInverse); mat.uniforms.uAmuntV.value.copy(tmpV);
            const el2 = m.u.dot(dirSol);
            mat.uniforms.uNit.value = 1 - THREE.MathUtils.smoothstep(el2, -0.12, 0.10);
          }
        } else if (m.mesh) m.mesh.visible = false;
        // Posició a pantalla (punt alt del monument) per a l'etiqueta i el clic
        if (!sobre) continue;
        const alc = (m.alcada || 60) * M_A_RADIS * (m.mesh ? m.mesh.scale.x / M_A_RADIS : 1);
        const X = m.P.x * (1 + alc), Y = m.P.y * (1 + alc), Z = m.P.z * (1 + alc);
        const w = el[3] * X + el[7] * Y + el[11] * Z + el[15];
        if (w <= 0) continue;
        const nx = (el[0] * X + el[4] * Y + el[8] * Z + el[12]) / w, ny = (el[1] * X + el[5] * Y + el[9] * Z + el[13]) / w;
        if (nx < -1 || nx > 1 || ny < -1 || ny > 1) continue;
        m.sx = (nx * 0.5 + 0.5) * W; m.sy = (0.5 - ny * 0.5) * H;
        m.vis = true;
        if (E.capas.etiquetas && nEt < MAX_ETIQUETES && (d < D_ETIQUETA || m === seleccionat)) {
          // De molt a prop l'etiqueta molesta: només si el monument ocupa poc a la pantalla
          const pxMida = m.mida * M_A_RADIS / d * kPx;
          if (pxMida < 260 || m === seleccionat) { etiqueta(m.sx, m.sy - 18, m.nom, m === seleccionat); nEt++; }
        }
      }
      for (let i = usades; i < els.length; i++) if (els[i].style.display !== 'none') els[i].style.display = 'none';
    },
    // Monument (visible) més proper a (x, y) en píxels; null si cap.
    pick(x, y, radi) {
      let millor = null, d2m = radi * radi;
      for (const m of llista) {
        if (!m.vis) continue;
        const dx = m.sx - x, dy = m.sy - y, d2 = dx * dx + dy * dy;
        if (d2 < d2m) { d2m = d2; millor = m; }
      }
      return millor;
    },
    // Cerca per nom de monument o de ciutat.
    cercar(text, max = 6) {
      const t = text.toLowerCase();
      const r = [];
      for (const m of llista) {
        if (m.nom.toLowerCase().includes(t) || m.ciutat.toLowerCase().includes(t)) r.push(m);
        if (r.length >= max) break;
      }
      return r;
    },
    seleccionar(m) { seleccionat = m; },
    // Mides reals del monument (construeix la malla si cal): {mida, alcada, planta} en metres.
    mides(m) {
      if (!m.mesh && !m.error) construir(m);
      const b = m.mesh ? m.mesh.geometry.boundingBox : null;
      return b ? { mida: m.mida, alcada: b.max.y, planta: Math.max(b.max.x - b.min.x, b.max.z - b.min.z) } : { mida: 200, alcada: 100, planta: 200 };
    },
    get seleccionat() { return seleccionat; },
  };
}
