// Utilitats geogràfiques: conversió lat/lon <-> vector 3D i càlculs ortodròmics.
// Convenció: radi 1 = 6371 km. Mapatge compatible amb les textures equirectangulars
// (lon 0 al centre de la imatge) i amb el UV de SphereGeometry de three.js:
//   x = cos(lat)·cos(lon), y = sin(lat), z = -cos(lat)·sin(lon)
export const DEG = Math.PI / 180;
export const NM_PER_RAD = 3440.065;     // milles nàutiques per radian (sobre la superfície)
export const K_ALT = 0.0125 / 35000;    // exageració d'altitud en vista llunyana: FL350 = 0.0125 radis (×7,5)
export const K_REAL = 0.3048 / 6371000; // radis per peu a escala real
export const M_A_RADIS = 1 / 6371000;   // radis per metre
export const R_TERRA = 1.0006;          // radi dels avions a terra en vista llunyana

// Escala visual de les altituds: exagerada quan la càmera és lluny (es veuen les capes de trànsit) i real quan
// s'acosta al terra (els avions, els monuments i el terreny encaixen). Es recalcula cada fotograma.
export const VIS = { kAlt: K_ALT, base: R_TERRA - 1, f: 1 };
export function actualitzaEscalaVisual(hCam) {
  const t = Math.min(1, Math.max(0, (hCam - 0.006) / (0.06 - 0.006)));
  const f = t * t * (3 - 2 * t);
  VIS.f = f;
  VIS.kAlt = K_REAL + (K_ALT - K_REAL) * f;
  VIS.base = 1.5 * M_A_RADIS + (R_TERRA - 1 - 1.5 * M_A_RADIS) * f;
}

// Escriu a out (array/Float32Array) a l'índex i el vector unitari de (lat, lon) en graus.
export function llAVec(lat, lon, out, i = 0) {
  const la = lat * DEG, lo = lon * DEG, c = Math.cos(la);
  out[i] = c * Math.cos(lo);
  out[i + 1] = Math.sin(la);
  out[i + 2] = -c * Math.sin(lo);
  return out;
}

// Vector unitari -> [lat, lon] en graus (escriu a out[0], out[1]).
export function vecALl(x, y, z, out) {
  const l = Math.hypot(x, y, z) || 1;
  out[0] = Math.asin(Math.max(-1, Math.min(1, y / l))) / DEG;
  out[1] = Math.atan2(-z, x) / DEG;
  return out;
}

// Vectors tangents nord i est en (lat, lon). Escriu N a n[0..2] i E a e[0..2].
export function baseLocal(lat, lon, n, e) {
  const la = lat * DEG, lo = lon * DEG;
  const sl = Math.sin(la), cl = Math.cos(la), so = Math.sin(lo), co = Math.cos(lo);
  n[0] = -sl * co; n[1] = cl; n[2] = sl * so;
  e[0] = -so; e[1] = 0; e[2] = -co;
}

// Distància angular (radians) entre dos punts lat/lon en graus (haversine).
export function distAngular(lat1, lon1, lat2, lon2) {
  const a1 = lat1 * DEG, a2 = lat2 * DEG, dl = (lon2 - lon1) * DEG;
  const h = Math.sin((a2 - a1) / 2) ** 2 + Math.cos(a1) * Math.cos(a2) * Math.sin(dl / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Rumb inicial (graus, 0 = nord, horari) de (lat1,lon1) cap a (lat2,lon2).
export function rumbInicial(lat1, lon1, lat2, lon2) {
  const a1 = lat1 * DEG, a2 = lat2 * DEG, dl = (lon2 - lon1) * DEG;
  const y = Math.sin(dl) * Math.cos(a2);
  const x = Math.cos(a1) * Math.sin(a2) - Math.sin(a1) * Math.cos(a2) * Math.cos(dl);
  return (Math.atan2(y, x) / DEG + 360) % 360;
}

// Altitud en peus -> radi de dibuix (amb exageració vertical).
export function radiAlt(altFt) {
  return 1 + VIS.base + Math.max(0, altFt) * VIS.kAlt;
}

// Avança des de (lat, lon) una distància angular d (radians) amb rumb r (graus). Escriu [lat, lon] a out.
export function desti(lat, lon, rumb, d, out) {
  const a = lat * DEG, l = lon * DEG, b = rumb * DEG;
  const sa = Math.sin(a), ca = Math.cos(a), sd = Math.sin(d), cd = Math.cos(d);
  const a2 = Math.asin(Math.min(1, Math.max(-1, sa * cd + ca * sd * Math.cos(b))));
  const l2 = l + Math.atan2(Math.sin(b) * sd * ca, cd - sa * Math.sin(a2));
  out[0] = a2 / DEG;
  out[1] = ((l2 / DEG + 540) % 360) - 180;
  return out;
}

// Base local (est, nord, amunt) en (lat, lon) com a THREE.Vector3 (escriu a e, n, u).
export function baseENU(lat, lon, e, n, u) {
  const la = lat * DEG, lo = lon * DEG;
  const sl = Math.sin(la), cl = Math.cos(la), so = Math.sin(lo), co = Math.cos(lo);
  n.set(-sl * co, cl, sl * so);
  e.set(-so, 0, -co);
  u.set(cl * co, sl, -cl * so);
}

// Formata una hora (ms UTC) com "HH:MM:SS".
export function fmtHMS(ms) {
  const d = new Date(ms);
  return d.toISOString().substr(11, 8);
}
export function fmtHM(iso) {
  return iso ? new Date(iso).toISOString().substr(11, 5) : '--:--';
}
