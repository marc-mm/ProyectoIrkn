// Constructor de la geometria low-poly dels monuments a partir d'una llista de "peces" (mini-llenguatge en metres).
//
// Sistema de coordenades de l'autor (el de les dades): x = est, y = amunt, z = nord, en metres.
// L'origen és el centre del monument a nivell de terra. En three.js el monument es construeix amb
// X = est, Y = amunt, Z = sud (z_three = -z_autor), que és una base dextrogira sobre el globus.
//
// Peces disponibles (totes accepten un últim paràmetre opcional d'opcions, vegeu més avall):
//   ['caixa',    x, y, z, ample, alt, fons, color]            caixa; (x,y,z) = centre de la base; ample en x (est), fons en z (nord)
//   ['cil',      x, y, z, rBaix, rDalt, alt, costats, color]  cilindre o tronc de con, base a (x,y,z)
//   ['con',      x, y, z, r, alt, costats, color]             con, base a (x,y,z)
//   ['piramide', x, y, z, ampleBase, alt, costats, color]     piràmide (4 costats = base quadrada alineada amb els eixos)
//   ['esfera',   x, y, z, r, color]                           esfera; (x,y,z) = CENTRE
//   ['cupula',   x, y, z, r, alt, color]                      mitja esfera aixafada fins a l'alçada alt, base a (x,y,z)
//   ['prisma',   x, y, z, [[px,pz],...], alt, color]          planta poligonal (punts relatius a x,z; pz cap al nord) extruïda de y a y+alt
//   ['torn',     x, y, z, [[r,h],...], costats, color]        perfil de revolució (r = radi, h = alçada sobre y); per tancar, r = 0 als extrems
//   ['barra',    x1, y1, z1, x2, y2, z2, gruix, color]        biga de secció quadrada entre dos punts
//   ['tor',      x, y, z, R, r, color]                        anell (tor); (x,y,z) = CENTRE; per defecte vertical en el pla est-amunt
//   ['arc',      x, y, z, ample, alt, gruix, fons, color]     portal amb arc de mig punt; ample en x, fons en z; base a (x,y,z)
//   ['bol',      x, y, z, rx, rz, alt, gruix, costats, color] graderia el·líptica d'estadi (anell inclinat); base a (x,y,z)
//
// Opcions (objecte opcional al final): { gir: graus, rotX: graus, rotZ: graus, esc: [sx,sy,sz], llum: true,
//   segs: n, eix: 'x'|'y'|'z' (tor), arcGraus: graus (tor) }
//   - esc s'aplica primer, després rotX (inclina cap al nord), rotZ (inclina cap a l'est), i finalment gir
//     (rotació sobre la vertical, en sentit horari vist des de dalt, com un rumb: 90 = el que apuntava al nord apunta a l'est).
//     Totes les rotacions són al voltant del punt de referència de la peça.
//   - llum: true fa que la peça brilli de nit (finestres, focus, agulles il·luminades).
//   - segs: segments de l'esfera/cúpula/tor (per defecte 10/12).
//   - eix del tor: 'z' (per defecte, eix cap al nord: anell en el pla est-amunt), 'x' (anell en el pla nord-amunt), 'y' (anell horitzontal).
// Els colors són textos '#rrggbb'.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const D = Math.PI / 180;
export const TIPUS_PECES = ['caixa', 'cil', 'con', 'piramide', 'esfera', 'cupula', 'prisma', 'torn', 'barra', 'tor', 'arc', 'bol'];

// Color '#rrggbb' -> [r, g, b] en 0..1 (sense conversió d'espai de color: els shaders treballen en espai de pantalla).
function rgb(hex) {
  const s = String(hex || '#cccccc').replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// Últim element si és un objecte d'opcions (no array ni text).
function opcionsDe(p) {
  const u = p[p.length - 1];
  return u && typeof u === 'object' && !Array.isArray(u) ? u : {};
}

// Geometria d'una peça en el seu sistema propi (three: X est, Y amunt, Z sud), amb el punt de referència a l'origen.
// Retorna { g, x, y, z } amb la translació en coordenades three, o llença un error si la peça no és vàlida.
function geometriaPeca(p) {
  const t = p[0], o = opcionsDe(p);
  let g, x = 0, y = 0, z = 0;
  switch (t) {
    case 'caixa': {
      [, x, y, z] = p; const [a, h, f] = [p[4], p[5], p[6]];
      g = new THREE.BoxGeometry(a, h, f); g.translate(0, h / 2, 0); break;
    }
    case 'cil': {
      [, x, y, z] = p; const [r0, r1, h, n] = [p[4], p[5], p[6], p[7]];
      g = new THREE.CylinderGeometry(r1, r0, h, Math.max(3, n | 0), 1, false); g.translate(0, h / 2, 0); break;
    }
    case 'con': {
      [, x, y, z] = p; const [r, h, n] = [p[4], p[5], p[6]];
      g = new THREE.CylinderGeometry(0, r, h, Math.max(3, n | 0), 1, false); g.translate(0, h / 2, 0); break;
    }
    case 'piramide': {
      [, x, y, z] = p; const [w, h, n0] = [p[4], p[5], p[6]];
      const n = Math.max(3, n0 | 0), r = (w / 2) / Math.cos(Math.PI / n);
      g = new THREE.CylinderGeometry(0, r, h, n, 1, false); g.rotateY(Math.PI / n); g.translate(0, h / 2, 0); break;
    }
    case 'esfera': {
      [, x, y, z] = p; const r = p[4], s = o.segs || 10;
      g = new THREE.SphereGeometry(r, s, Math.max(4, Math.round(s * 0.7))); break;
    }
    case 'cupula': {
      [, x, y, z] = p; const [r, h] = [p[4], p[5]], s = o.segs || 12;
      g = new THREE.SphereGeometry(r, s, Math.max(3, Math.round(s / 3)), 0, Math.PI * 2, 0, Math.PI / 2);
      g.scale(1, h / r, 1); break;
    }
    case 'prisma': {
      [, x, y, z] = p; const pts = p[4], h = p[5];
      if (!Array.isArray(pts) || pts.length < 3) throw new Error('prisma necessita 3 punts o més');
      const forma = new THREE.Shape(pts.map(q => new THREE.Vector2(q[0], q[1])));
      g = new THREE.ExtrudeGeometry(forma, { depth: h, bevelEnabled: false, curveSegments: 1 });
      g.rotateX(-Math.PI / 2); break;            // (sx, sy) -> (x = sx, z = -sy): sy és el nord
    }
    case 'torn': {
      [, x, y, z] = p; const perfil = p[4], n = p[5];
      if (!Array.isArray(perfil) || perfil.length < 2) throw new Error('torn necessita 2 punts o més');
      g = new THREE.LatheGeometry(perfil.map(q => new THREE.Vector2(Math.max(0, q[0]), q[1])), Math.max(3, n | 0)); break;
    }
    case 'barra': {
      const a = new THREE.Vector3(p[1], p[2], -p[3]), b = new THREE.Vector3(p[4], p[5], -p[6]), gr = p[7];
      const d = b.clone().sub(a), L = d.length();
      if (L < 1e-6) throw new Error('barra de longitud zero');
      g = new THREE.BoxGeometry(gr, L, gr); g.translate(0, L / 2, 0);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
      g.translate(a.x, a.y, a.z);
      return { g, x: 0, y: 0, z: 0, jaTraslladat: true };
    }
    case 'tor': {
      [, x, y, z] = p; const [R, r] = [p[4], p[5]], s = o.segs || 12;
      g = new THREE.TorusGeometry(R, r, Math.max(3, Math.round(s / 2)), Math.max(6, s * 2), (o.arcGraus || 360) * D);
      if (o.eix === 'x') g.rotateY(Math.PI / 2);
      else if (o.eix === 'y') g.rotateX(Math.PI / 2);
      break;
    }
    case 'arc': {
      [, x, y, z] = p; const [a, h, gr, f] = [p[4], p[5], p[6], p[7]];
      const wo = Math.max(0.1, a - 2 * gr), ho = Math.max(0.2, h - gr);
      const ry = Math.min(wo / 2, ho), yS = ho - ry;
      const s = new THREE.Shape();
      s.moveTo(-a / 2, 0); s.lineTo(-wo / 2, 0); s.lineTo(-wo / 2, yS);
      for (let k = 1; k < 10; k++) { const ang = Math.PI - k / 10 * Math.PI; s.lineTo(Math.cos(ang) * wo / 2, yS + Math.sin(ang) * ry); }
      s.lineTo(wo / 2, yS); s.lineTo(wo / 2, 0); s.lineTo(a / 2, 0); s.lineTo(a / 2, h); s.lineTo(-a / 2, h); s.closePath();
      g = new THREE.ExtrudeGeometry(s, { depth: f, bevelEnabled: false, curveSegments: 1 });
      g.translate(0, 0, -f / 2); break;
    }
    case 'bol': {
      [, x, y, z] = p; const [rx, rz, h, gr, n] = [p[4], p[5], p[6], p[7], p[8]];
      const ri = Math.max(0.5, rx - gr);
      const perfil = [[rx, 0], [rx, h], [rx - gr * 0.12, h], [ri, h * 0.08], [ri, 0], [rx, 0]];
      g = new THREE.LatheGeometry(perfil.map(q => new THREE.Vector2(q[0], q[1])), Math.max(8, n | 0));
      g.scale(1, 1, rz / rx); break;
    }
    default:
      throw new Error('tipus de peça desconegut: ' + t);
  }
  return { g, x, y, z: -z };
}

// Aplica les opcions geomètriques (esc, rotX, rotZ, gir) a la geometria d'una peça ja centrada al seu punt de referència.
function aplicaOpcions(g, o) {
  if (o.esc) g.scale(o.esc[0] ?? 1, o.esc[1] ?? 1, o.esc[2] ?? 1);
  if (o.rotX) g.rotateX(-o.rotX * D);          // positiu: la part de dalt s'inclina cap al nord (-Z de three)
  if (o.rotZ) g.rotateZ(-o.rotZ * D);          // positiu: la part de dalt s'inclina cap a l'est
  if (o.gir) g.rotateY(-o.gir * D);            // sentit horari vist des de dalt
}

// Construeix la geometria fusionada d'un monument (llista de peces). Retorna { geo, triangles, errors[], caixa }.
// Atributs: position (metres, three), aCol (color), aEmi (1 si brilla de nit).
export function construirGeometria(peces) {
  const parts = [], errors = [];
  for (let i = 0; i < (peces || []).length; i++) {
    const p = peces[i];
    try {
      if (!Array.isArray(p) || typeof p[0] !== 'string') throw new Error('la peça no és una llista ["tipus", ...]');
      const o = opcionsDe(p);
      const r = geometriaPeca(p);
      let g = r.g;
      if (!r.jaTraslladat) { aplicaOpcions(g, o); g.translate(r.x, r.y, r.z); }      // la barra no admet opcions geomètriques
      g = g.index ? g.toNonIndexed() : g;
      for (const nom of Object.keys(g.attributes)) if (nom !== 'position') g.deleteAttribute(nom);
      const n = g.attributes.position.count;
      for (let k = 0; k < n * 3; k++) if (!isFinite(g.attributes.position.array[k])) throw new Error('coordenades no vàlides (NaN)');
      const c = rgb(colorDe(p)), col = new Float32Array(n * 3), emi = new Float32Array(n).fill(o.llum ? 1 : 0);
      for (let k = 0; k < n; k++) { col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2]; }
      g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aEmi', new THREE.BufferAttribute(emi, 1));
      parts.push(g);
    } catch (e) {
      errors.push(`peça ${i} (${Array.isArray(p) ? p[0] : '?'}): ${e.message}`);
    }
  }
  const geo = parts.length ? mergeGeometries(parts, false) : new THREE.BufferGeometry();
  for (const g of parts) g.dispose();
  geo.computeBoundingBox(); geo.computeBoundingSphere();
  const triangles = geo.attributes.position ? geo.attributes.position.count / 3 : 0;
  return { geo, triangles, errors, caixa: geo.boundingBox };
}

// Color d'una peça segons el seu tipus (posició fixa dins la llista).
function colorDe(p) {
  const pos = { caixa: 7, cil: 8, con: 7, piramide: 7, esfera: 5, cupula: 6, prisma: 6, torn: 6, barra: 8, tor: 6, arc: 8, bol: 9 }[p[0]];
  return p[pos];
}

const VERT = /* glsl */`
attribute vec3 aCol; attribute float aEmi;
varying vec3 vCol; varying vec3 vPV; varying float vEmi;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vCol = aCol; vEmi = aEmi;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vPV = mv.xyz;
  gl_Position = projectionMatrix * mv;
  #include <logdepthbuf_vertex>
}`;
const FRAG = /* glsl */`
precision highp float;
uniform vec3 uSolV, uAmuntV; uniform float uNit, uOpac;
varying vec3 vCol; varying vec3 vPV; varying float vEmi;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  vec3 n = normalize(cross(dFdx(vPV), dFdy(vPV)));      // normal plana (estil low-poly), sempre cap a la càmera
  float dif = max(dot(n, uSolV), 0.0);
  float cel = dot(n, uAmuntV) * 0.5 + 0.5;
  float dia = 1.0 - uNit;
  vec3 c = vCol * ((0.30 + 0.22 * cel) * (0.25 + 0.75 * dia) + dif * 0.78 * dia);
  // De nit, focus càlids que il·luminen sobretot les parets (com els monuments reals)
  float paret = 1.0 - abs(dot(n, uAmuntV));
  c += vCol * vec3(1.0, 0.86, 0.62) * uNit * (0.22 + 0.48 * paret);
  c += vCol * vEmi * uNit * 1.25 + vec3(1.0, 0.85, 0.55) * vEmi * uNit * 0.25;
  gl_FragColor = vec4(c, uOpac);
}`;

// Material comú dels monuments. Uniforms: uSolV (direcció del sol en espai de càmera), uAmuntV (vertical local en espai
// de càmera), uNit (0 de dia, 1 de nit), uOpac (opacitat, per a l'aparició gradual).
export function crearMaterialMonument() {
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide,
    uniforms: {
      uSolV: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() }, uAmuntV: { value: new THREE.Vector3(0, 1, 0) },
      uNit: { value: 0 }, uOpac: { value: 1 },
    },
  });
}

// Valida una llista de ciutats. Retorna una llista de textos d'error (buida si tot és correcte).
export function validarCiutats(ciutats) {
  const errs = [];
  if (!Array.isArray(ciutats)) return ['CIUTATS no és una llista'];
  for (const c of ciutats) {
    const nomC = c && c.ciutat || '?';
    if (!c || typeof c.ciutat !== 'string') errs.push('ciutat sense nom');
    if (!Array.isArray(c.monuments) || c.monuments.length < 2) errs.push(`${nomC}: calen 2 monuments`);
    for (const m of c.monuments || []) {
      if (typeof m.nom !== 'string') errs.push(`${nomC}: monument sense nom`);
      if (!isFinite(m.lat) || !isFinite(m.lon) || Math.abs(m.lat) > 90 || Math.abs(m.lon) > 180) errs.push(`${nomC} / ${m.nom}: lat/lon no vàlides`);
      const r = construirGeometria(m.peces);
      for (const e of r.errors) errs.push(`${nomC} / ${m.nom}: ${e}`);
      if (r.triangles > 6000) errs.push(`${nomC} / ${m.nom}: massa triangles (${r.triangles}, màxim 6000)`);
      if (r.triangles === 0) errs.push(`${nomC} / ${m.nom}: sense geometria`);
      r.geo.dispose();
    }
  }
  return errs;
}
