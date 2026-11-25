// Models detallats dels avions (GLB d'~1 MB a web/modelos/) per als 10 tipus més comuns. Es carreguen sota demanda
// i el material "accent" (deriva i motors) es tenyeix amb el color de la companyia. Mentre no hi són (o si falten
// els fitxers), es continua dibuixant la silueta low-poly.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const MODELS = ['A320', 'A321', 'B738', 'B38M', 'B77W', 'B789', 'A359', 'A333', 'E190', 'AT76'];
// Tipus del catàleg -> model més semblant
const EQUIV = {
  A20N: 'A320', A320: 'A320', A319: 'A320', A21N: 'A321', A321: 'A321', B738: 'B738', B38M: 'B38M', B752: 'B738',
  B763: 'A333', A332: 'A333', A333: 'A333', A339: 'A333', A359: 'A359', A35K: 'A359', B772: 'B77W', B77W: 'B77W',
  A388: 'B77W', B748: 'B77W', B788: 'B789', B789: 'B789', E190: 'E190', E175: 'E190', CRJ9: 'E190', AT76: 'AT76', DH8D: 'AT76',
};
export const modelDeTipus = codi => EQUIV[codi] || 'A320';

const carregador = new GLTFLoader();
const cache = new Map();          // model -> {estat: 1 carregant | 2 llest | 3 error, escena, llargada}
const materials = new Map();      // "model|color" -> material accent tenyit

// Retorna el model carregat {escena, llargada} o null (i en comença la càrrega si encara no s'havia demanat).
export function obtenirModel(model) {
  let c = cache.get(model);
  if (!c) {
    c = { estat: 1, escena: null, llargada: 40 };
    cache.set(model, c);
    carregador.load(`modelos/${model}.glb`, g => {
      const esc = g.scene;
      esc.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = o.receiveShadow = false; } });
      const caixa = new THREE.Box3().setFromObject(esc);
      c.llargada = Math.max(10, caixa.max.z - caixa.min.z);
      c.escena = esc; c.estat = 2;
    }, undefined, () => { c.estat = 3; });
  }
  return c.estat === 2 ? c : null;
}

// Crea una còpia del model (geometries compartides) amb el color de la companyia a l'accent. null si no està llest.
export function clonarModel(model, colorHex) {
  const c = obtenirModel(model);
  if (!c) return null;
  const obj = c.escena.clone(true);
  const clau = model + '|' + colorHex;
  obj.traverse(o => {
    if (!o.isMesh) return;
    const tinta = m => {
      if (!m || m.name !== 'accent') return m;
      let t = materials.get(clau);
      if (!t) { t = m.clone(); t.color = new THREE.Color(colorHex); materials.set(clau, t); }
      return t;
    };
    o.material = Array.isArray(o.material) ? o.material.map(tinta) : tinta(o.material);
  });
  obj.userData.tren = obj.getObjectByName('tren') || null;
  obj.userData.llargada = c.llargada;
  return obj;
}

// Precarrega tots els models en segon pla (de mica en mica per no bloquejar l'arrencada).
export function precarregarModels() {
  MODELS.forEach((m, k) => setTimeout(() => obtenirModel(m), 1500 + k * 400));
}
