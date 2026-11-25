// Posició del Sol: punt subsolar (latitud = declinació, longitud segons hora UTC i equació del temps).
import { DEG, llAVec } from './geo.js';

// Retorna {lat, lon} en graus del punt subsolar per a un instant (ms UTC). Reutilitza out.
export function puntSubsolar(ms, out) {
  const d = new Date(ms);
  const inici = Date.UTC(d.getUTCFullYear(), 0, 0);
  const N = (ms - inici) / 86400000;               // dia de l'any amb fracció
  const hUTC = (ms % 86400000) / 3600000;          // hora UTC decimal
  // Declinació solar (aproximació de Spencer/Meeus, error < 0.3°)
  const g = 0.98565 * DEG * (N - 2);
  const decl = -Math.asin(0.39779 * Math.cos(0.98565 * DEG * (N + 10) + 1.914 * DEG * Math.sin(g)));
  // Equació del temps en minuts (Whitaker): diferència entre temps solar aparent i mitjà
  const B = 2 * Math.PI * (N - 81) / 364;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  // Hora solar aparent = UTC + lon/15 + eot/60 = 12  =>  lon = -15·(UTC-12) - eot/4
  let lon = -15 * (hUTC - 12) - eot / 4;
  lon = ((lon + 540) % 360) - 180;
  out.lat = decl / DEG;
  out.lon = lon;
  return out;
}

// Direcció unitària cap al Sol (món) escrita a un THREE.Vector3.
const tmp = { lat: 0, lon: 0 };
const buf = [0, 0, 0];
export function dirSol(ms, v) {
  puntSubsolar(ms, tmp);
  llAVec(tmp.lat, tmp.lon, buf, 0);
  v.set(buf[0], buf[1], buf[2]);
  return v;
}
