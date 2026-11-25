// MODE DEMO: emula el motor C# (inicio, estado, infoVuelo, infoAeropuerto, estadisticas, aviso...)
// per poder provar tota la interfície en un navegador normal. Dades inventades però versemblants.
import { llAVec, vecALl, baseLocal, DEG, NM_PER_RAD, desti, rumbInicial, distAngular } from './geo.js';

const AEROS = [
  ['BCN', 'Barcelona-El Prat', 'Barcelona', 'ES', 41.2971, 2.0785, 4], ['MAD', 'Adolfo Suárez Madrid-Barajas', 'Madrid', 'ES', 40.4936, -3.5668, 5],
  ['LHR', 'London Heathrow', 'London', 'GB', 51.4700, -0.4543, 5], ['CDG', 'Paris Charles de Gaulle', 'Paris', 'FR', 49.0097, 2.5479, 5],
  ['FRA', 'Frankfurt am Main', 'Frankfurt', 'DE', 50.0379, 8.5622, 5], ['AMS', 'Amsterdam Schiphol', 'Amsterdam', 'NL', 52.3105, 4.7683, 5],
  ['JFK', 'John F. Kennedy', 'New York', 'US', 40.6413, -73.7781, 5], ['LAX', 'Los Angeles Intl', 'Los Angeles', 'US', 33.9416, -118.4085, 5],
  ['DXB', 'Dubai Intl', 'Dubai', 'AE', 25.2532, 55.3657, 5], ['HND', 'Tokyo Haneda', 'Tokyo', 'JP', 35.5494, 139.7798, 5],
  ['SIN', 'Singapore Changi', 'Singapore', 'SG', 1.3644, 103.9915, 5], ['SYD', 'Sydney Kingsford Smith', 'Sydney', 'AU', -33.9399, 151.1753, 4],
  ['GRU', 'São Paulo-Guarulhos', 'São Paulo', 'BR', -23.4356, -46.4731, 4], ['JNB', 'O. R. Tambo', 'Johannesburg', 'ZA', -26.1392, 28.2460, 4],
  ['FCO', 'Roma Fiumicino', 'Roma', 'IT', 41.8003, 12.2389, 4], ['MUC', 'Munich', 'Munic', 'DE', 48.3538, 11.7861, 4],
  ['ZRH', 'Zürich', 'Zuric', 'CH', 47.4647, 8.5492, 3], ['LIS', 'Humberto Delgado', 'Lisboa', 'PT', 38.7742, -9.1342, 3],
  ['IST', 'Istanbul', 'Istanbul', 'TR', 41.2753, 28.7519, 5], ['DUB', 'Dublin', 'Dublín', 'IE', 53.4264, -6.2499, 3],
  ['CPH', 'Copenhagen Kastrup', 'Copenhaguen', 'DK', 55.6180, 12.6508, 3], ['ARN', 'Stockholm Arlanda', 'Estocolm', 'SE', 59.6498, 17.9238, 3],
  ['HEL', 'Helsinki-Vantaa', 'Hèlsinki', 'FI', 60.3172, 24.9633, 3], ['ATH', 'Athens Eleftherios Venizelos', 'Atenes', 'GR', 37.9364, 23.9445, 3],
  ['VIE', 'Vienna Intl', 'Viena', 'AT', 48.1103, 16.5697, 3], ['BRU', 'Brussels', 'Brussel·les', 'BE', 50.9010, 4.4856, 3],
  ['PMI', 'Palma de Mallorca', 'Palma', 'ES', 39.5517, 2.7388, 3], ['AGP', 'Costa del Sol', 'Màlaga', 'ES', 36.6749, -4.4991, 2],
  ['VLC', 'València', 'València', 'ES', 39.4893, -0.4816, 2], ['LPA', 'Gran Canaria', 'Las Palmas', 'ES', 27.9319, -15.3866, 2],
  ['ORD', "Chicago O'Hare", 'Chicago', 'US', 41.9742, -87.9073, 5], ['ATL', 'Hartsfield-Jackson', 'Atlanta', 'US', 33.6407, -84.4277, 5],
  ['DFW', 'Dallas/Fort Worth', 'Dallas', 'US', 32.8998, -97.0403, 4], ['SFO', 'San Francisco Intl', 'San Francisco', 'US', 37.6213, -122.3790, 4],
  ['MIA', 'Miami Intl', 'Miami', 'US', 25.7959, -80.2870, 4], ['YYZ', 'Toronto Pearson', 'Toronto', 'CA', 43.6777, -79.6248, 4],
  ['MEX', 'Benito Juárez', 'Ciutat de Mèxic', 'MX', 19.4363, -99.0721, 4], ['BOG', 'El Dorado', 'Bogotà', 'CO', 4.7016, -74.1469, 3],
  ['EZE', 'Ministro Pistarini', 'Buenos Aires', 'AR', -34.8222, -58.5358, 3], ['SCL', 'Arturo Merino Benítez', 'Santiago', 'CL', -33.3930, -70.7858, 3],
  ['DEL', 'Indira Gandhi', 'Delhi', 'IN', 28.5562, 77.1000, 4], ['BOM', 'Chhatrapati Shivaji', 'Bombai', 'IN', 19.0896, 72.8656, 3],
  ['PEK', 'Beijing Capital', 'Pequín', 'CN', 40.0799, 116.5975, 5], ['PVG', 'Shanghai Pudong', 'Xangai', 'CN', 31.1443, 121.8083, 5],
  ['HKG', 'Hong Kong Intl', 'Hong Kong', 'HK', 22.3080, 113.9185, 5], ['ICN', 'Incheon', 'Seül', 'KR', 37.4602, 126.4407, 4],
  ['BKK', 'Suvarnabhumi', 'Bangkok', 'TH', 13.6900, 100.7501, 4], ['DOH', 'Hamad Intl', 'Doha', 'QA', 25.2731, 51.6081, 4],
  ['CAI', 'Cairo Intl', 'El Caire', 'EG', 30.1219, 31.4056, 3], ['CMN', 'Mohammed V', 'Casablanca', 'MA', 33.3675, -7.5899, 3],
  ['ADD', 'Bole Intl', 'Addis Abeba', 'ET', 8.9779, 38.7993, 3], ['NBO', 'Jomo Kenyatta', 'Nairobi', 'KE', -1.3192, 36.9278, 3],
  ['LOS', 'Murtala Muhammed', 'Lagos', 'NG', 6.5774, 3.3212, 3], ['MEL', 'Melbourne Tullamarine', 'Melbourne', 'AU', -37.6690, 144.8410, 3],
  ['AKL', 'Auckland', 'Auckland', 'NZ', -37.0082, 174.7850, 3],
];
const AEROL = [
  ['IBE', 'Iberia', '#E4002B', '910000101', 'iberia@example.com'], ['VLG', 'Vueling', '#FFD400', '910000102', 'vueling@example.com'],
  ['RYR', 'Ryanair', '#2F6BFF', '910000103', 'ryanair@example.com'], ['BAW', 'British Airways', '#B07CFF', '910000104', 'ba@example.com'],
  ['AFR', 'Air France', '#FF7A00', '910000105', null], ['DLH', 'Lufthansa', '#9BE15D', '910000106', 'lufthansa@example.com'],
  ['UAE', 'Emirates', '#FF4FA3', null, null], ['KLM', 'KLM', '#4AA3FF', '910000108', 'klm@example.com'],
  ['AAL', 'American Airlines', '#C0C8D4', '910000109', 'aa@example.com'], ['QTR', 'Qatar Airways', '#C2569B', '910000110', 'qatar@example.com'],
  ['SIA', 'Singapore Airlines', '#F2A900', '910000111', 'sia@example.com'], ['JAL', 'Japan Airlines', '#FF5A5F', '910000112', 'jal@example.com'],
];
const FASES = ['Rodatge', 'Enlairament', 'Pujada', 'Creuer', 'Descens', 'Aproximació', 'Aterrat'];
const TIPUS = [['A320', 'Airbus A320neo'], ['B738', 'Boeing 737-800'], ['A359', 'Airbus A350-900'], ['B77W', 'Boeing 777-300ER'],
  ['A388', 'Airbus A380-800'], ['E190', 'Embraer 190'], ['A21N', 'Airbus A321neo'], ['B789', 'Boeing 787-9'], ['A333', 'Airbus A330-300'],
  ['B38M', 'Boeing 737 MAX 8'], ['AT76', 'ATR 72-600']];
const CAIXA = [[41.96, 1.19], [41.96, 2.97], [40.63, 2.97], [40.63, 1.19]];

function mulberry32(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Continent aproximat per coordenades (només per a l'estadística de la demo).
function continent(lat, lon) {
  if (lon < -30 && lat > 12) return 'NA';
  if (lon < -30) return 'SA';
  if (lat < -10 && lon > 110) return 'OC';
  if (lon > 45) return 'AS';
  if (lat > 36) return 'EU';
  return 'AF';
}

export function crearDemo(emitir) {
  const q = new URLSearchParams(location.search);
  const rnd = mulberry32(+q.get('seed') || 7);
  let modo = q.get('mode') === 'proyecto' ? 'proyecto' : q.get('mode') === 'directo' ? 'directo' : 'simulado';
  let pilotat = -1, escalaAbans = -1;          // vol que pilota l'usuari i escala guardada
  let escala = +q.get('escala') || 60, pausado = q.get('pausa') === '1';
  let objetivo = +q.get('n') || 400;
  let tSim = q.get('hora') ? Date.parse(q.get('hora')) : Date.now();
  let tReal = performance.now();
  let vuelos = [], sigId = 1;
  let selId = -1, selIata = null;
  let pares = [];           // conflictes {a,b,resuelto,t}
  let resueltos = 0, avisoPares = 0;
  const instr = new Map();  // instruccions per id

  const A = [0, 0, 0], B = [0, 0, 0], P = [0, 0, 0], T = [0, 0, 0], NV = [0, 0, 0], EV = [0, 0, 0], LL = [0, 0];
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const aeroPond = () => { // tria aeroport amb probabilitat proporcional a pes²
    let tot = 0; for (const a of AEROS) tot += a[6] * a[6];
    let r = rnd() * tot; for (let i = 0; i < AEROS.length; i++) { r -= AEROS[i][6] ** 2; if (r <= 0) return i; }
    return 0;
  };
  const distNM = (i, j) => {
    llAVec(AEROS[i][4], AEROS[i][5], A, 0); llAVec(AEROS[j][4], AEROS[j][5], B, 0);
    return Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])) * NM_PER_RAD;
  };
  const iso = ms => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');

  // ---------- Vols de la xarxa simulada ----------
  function nouVol(o, ini = true) {
    let d = aeroPond(), n = 0;
    if (o === undefined) o = aeroPond();
    while ((d === o || distNM(o, d) < 450 || distNM(o, d) > 7500) && n++ < 60) d = aeroPond();
    if (d === o) d = (o + 7) % AEROS.length;
    const ai = Math.floor(rnd() * AEROL.length), tp = pick(TIPUS);
    const vel = 430 + Math.floor(rnd() * 60);
    const D = distNM(o, d);
    const dur = D / vel * 3600000;
    const f0 = ini ? 0.02 + rnd() * 0.96 : 0;
    llAVec(AEROS[o][4], AEROS[o][5], A, 0); llAVec(AEROS[d][4], AEROS[d][5], B, 0);
    return {
      id: sigId++, ai, cs: AEROL[ai][0] + (100 + Math.floor(rnd() * 8900)), tipo: tp,
      mat: ['EC', 'G-', 'F-', 'D-', 'N', 'PH-'][Math.floor(rnd() * 6)] + (rnd() * 9000 + 1000 | 0),
      o, d, A: A.slice(), B: B.slice(), om: Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])),
      vel, D, dur, dep: tSim - f0 * dur, fl: 330 + 10 * Math.floor(rnd() * 8), dfl: 0, proj: false,
    };
  }
  // Posició (vector unitari) del vol al fracció f
  function posF(v, f, out) {
    const so = Math.sin(v.om) || 1e-6, a = Math.sin((1 - f) * v.om) / so, b = Math.sin(f * v.om) / so;
    out[0] = v.A[0] * a + v.B[0] * b; out[1] = v.A[1] * a + v.B[1] * b; out[2] = v.A[2] * a + v.B[2] * b;
  }
  // Estat complet d'un vol de la xarxa a l'instant t
  const S = { lat: 0, lon: 0, alt: 0, hdg: 0, vel: 0, fase: 0, f: 0, dOri: 0, dDest: 0 };
  function estatVol(v, t) {
    if (v.proj) return estatProj(v);
    if (v.man) {
      // Pilotat per l'usuari o en vol lliure després de deixar-lo
      S.lat = v.man.lat; S.lon = v.man.lon; S.alt = v.man.alt; S.hdg = v.man.hdg; S.f = 0.5;
      S.dDest = distAngular(v.man.lat, v.man.lon, AEROS[v.d][4], AEROS[v.d][5]) * NM_PER_RAD; S.dOri = Math.max(0, v.D - S.dDest);
      S.f = Math.min(1, S.dOri / Math.max(1, v.D));
      S.fase = v.man.alt < 50 ? 1 : 3;
      return S;
    }
    const f = Math.min(1, Math.max(0, (t - v.dep) / v.dur));
    posF(v, f, P);
    vecALl(P[0], P[1], P[2], LL);
    // Rumb cap al destí: component tangent del vector destí
    const dp = v.B[0] * P[0] + v.B[1] * P[1] + v.B[2] * P[2];
    T[0] = v.B[0] - dp * P[0]; T[1] = v.B[1] - dp * P[1]; T[2] = v.B[2] - dp * P[2];
    baseLocal(LL[0], LL[1], NV, EV);
    S.hdg = (Math.atan2(T[0] * EV[0] + T[1] * EV[1] + T[2] * EV[2], T[0] * NV[0] + T[1] * NV[1] + T[2] * NV[2]) / DEG + 360) % 360;
    S.lat = LL[0]; S.lon = LL[1]; S.f = f;
    S.dOri = f * v.D; S.dDest = (1 - f) * v.D;
    const cr = (v.fl + v.dfl) * 100;
    const k = Math.min(1, S.dOri / 170, S.dDest / 210);
    S.alt = f < 0.002 || f > 0.998 ? 0 : cr * Math.pow(Math.max(0, k), 0.85);
    S.vel = v.vel;
    S.fase = f < 0.002 ? 0 : f > 0.998 ? 6 : S.dOri < 18 ? 1 : S.dDest < 22 ? 5 : S.dOri < 170 && k < 1 ? 2 : S.dDest < 210 && k < 1 ? 4 : 3;
    return S;
  }

  // ---------- Vols del projecte (espai aeri de Barcelona) ----------
  function nouProj(lat, lon, hdg, vel, alt) {
    return {
      id: sigId++, ai: -2, cs: 'PRJ' + (100 + sigId), tipo: pick(TIPUS), mat: 'EC-' + 'ABCDEFGHJKLMN'[Math.floor(rnd() * 13)] + 'XY',
      o: 0, d: Math.floor(rnd() * AEROS.length), lat, lon, hdg, vel, alt, proj: true, dep: tSim, dur: 3600000, D: 120, fl: Math.round(alt / 100), dfl: 0,
    };
  }
  function estatProj(v) {
    S.lat = v.lat; S.lon = v.lon; S.alt = v.alt; S.hdg = v.hdg; S.vel = v.vel; S.fase = v.alt < 3500 ? 5 : 3; S.f = 0.5; S.dOri = 40; S.dDest = 80;
    return S;
  }
  // Avança un vol de projecte dt segons simulats; rebota a la caixa
  function mouProj(v, dtS) {
    const d = v.vel * dtS / 3600 / NM_PER_RAD;
    llAVec(v.lat, v.lon, P, 0); baseLocal(v.lat, v.lon, NV, EV);
    const h = v.hdg * DEG, s = Math.sin(h), c = Math.cos(h);
    const fx = c * NV[0] + s * EV[0], fy = c * NV[1] + s * EV[1], fz = c * NV[2] + s * EV[2];
    const x = P[0] * Math.cos(d) + fx * Math.sin(d), y = P[1] * Math.cos(d) + fy * Math.sin(d), z = P[2] * Math.cos(d) + fz * Math.sin(d);
    vecALl(x, y, z, LL); v.lat = LL[0]; v.lon = LL[1];
    if (v.lat > 41.96 || v.lat < 40.63 || v.lon > 2.97 || v.lon < 1.19) {
      // Rebot especular a la vora de la caixa (evita que s'amuntegulin al centre)
      const sH = Math.sin(h), cH = Math.cos(h);
      if ((v.lat > 41.96 && cH > 0) || (v.lat < 40.63 && cH < 0)) v.hdg = (180 - v.hdg + 360) % 360;
      if ((v.lon > 2.97 && sH > 0) || (v.lon < 1.19 && sH < 0)) v.hdg = (360 - v.hdg) % 360;
    }
  }
  function crearProyecto(n) {
    for (let i = 0; i < n; i++) {
      vuelos.push(nouProj(40.7 + rnd() * 1.2, 1.3 + rnd() * 1.5, rnd() * 360, 190 + rnd() * 140, 2500 + rnd() * 9000));
    }
  }
  // Parell en rumb de col·lisió cap a (41.3, 2.1), amb 400 peus de diferència
  function parColisio() {
    const alt = 6000 + rnd() * 4000;
    const a = nouProj(41.3 + 0.35, 2.1 - 0.2, 0, 250, alt); a.hdg = 0;
    const b = nouProj(41.3 + 0.35, 2.1 + 0.2, 0, 250, alt + 400);
    vuelos.push(a, b);
    // apunta cap a un mateix punt futur
    const aim = (v) => { v.hdg = (Math.atan2((2.1 - v.lon) * Math.cos(41.3 * DEG), 41.3 - v.lat) / DEG + 360) % 360; };
    a.lat = 41.3 + 0.15 * (rnd() * 2 - 1) + 0.25; a.lon = 2.1 - 0.3; aim(a);
    b.lat = a.lat; b.lon = 2.1 + 0.3; aim(b);
  }

  // ---------- Conflictes ----------
  function engendraPar() {
    if (modo === 'proyecto') { parColisio(); return; }
    // Dos vols sobre la mateixa ruta, el segon ~3.5 NM per davant i 500 ft més alt
    const cand = vuelos.filter(v => !v.proj && v.dep + v.dur * 0.3 < tSim && tSim < v.dep + v.dur * 0.7 && !pares.some(p => p.a === v.id || p.b === v.id));
    if (!cand.length) return;
    const a = pick(cand);
    let b = pick(vuelos.filter(v => v !== a && !v.proj && !pares.some(p => p.a === v.id || p.b === v.id)));
    if (!b) return;
    b.o = a.o; b.d = a.d; b.A = a.A.slice(); b.B = a.B.slice(); b.om = a.om; b.D = a.D; b.vel = a.vel; b.dur = a.dur;
    b.dep = a.dep - 3.5 / a.vel * 3600000; b.fl = a.fl + 5; b.dfl = 0; a.dfl = 0;
    pares.push({ a: a.id, b: b.id, resuelto: false, t: performance.now() });
  }
  // Conflictes actuals reals (a partir de les posicions)
  const POS = new Map();
  function detecta(t) {
    POS.clear();
    const out = [];
    if (modo === 'proyecto') {
      const L = vuelos;
      const e = L.map(v => { llAVec(v.lat, v.lon, [0, 0, 0], 0); const w = [0, 0, 0]; llAVec(v.lat, v.lon, w, 0); return w; });
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
        const dot = e[i][0] * e[j][0] + e[i][1] * e[j][1] + e[i][2] * e[j][2];
        const nm = Math.acos(Math.min(1, dot)) * NM_PER_RAD, da = Math.abs(L[i].alt - L[j].alt);
        if (nm < 5 && da < 1000) out.push([L[i].id, L[j].id, +nm.toFixed(1), Math.round(da)]);
      }
      return out;
    }
    for (const p of pares) {
      if (p.resuelto) continue;
      const va = vuelos.find(v => v.id === p.a), vb = vuelos.find(v => v.id === p.b);
      if (!va || !vb) { p.resuelto = true; continue; }
      const fa = Math.min(1, Math.max(0, (t - va.dep) / va.dur)), fb = Math.min(1, Math.max(0, (t - vb.dep) / vb.dur));
      const nm = Math.abs(fb - fa) * va.D + 0.3 * Math.sin(t / 60000);
      out.push([p.a, p.b, +Math.max(0.8, nm).toFixed(1), Math.abs((va.fl + va.dfl) - (vb.fl + vb.dfl)) * 100]);
    }
    return out;
  }
  function resolver(idA, idB) {
    const p = pares.find(x => !x.resuelto && ((x.a === idA && x.b === idB) || (x.a === idB && x.b === idA)));
    const vb = vuelos.find(v => v.id === idB), va = vuelos.find(v => v.id === idA);
    if (modo === 'proyecto') {
      if (vb) { vb.alt += 2000; instr.set(vb.id, [`${vb.cs}: pugi a ${Math.round(vb.alt / 100)} i mantingui`]); }
      resueltos++; emitir({ tipo: 'aviso', nivel: 'ok', texto: `Conflicte resolt: ${vb ? vb.cs : idB} puja 2000 ft` });
      return;
    }
    if (p && vb) {
      p.resuelto = true; vb.dfl = 20; resueltos++;
      instr.set(vb.id, [`${vb.cs}: pugi a FL${vb.fl + 20}`, `${vb.cs}: mantingui FL${vb.fl + 20}`]);
      emitir({ tipo: 'aviso', nivel: 'ok', texto: `Conflicte resolt: ${vb.cs} puja a FL${vb.fl + 20} (separació vertical 2000 ft)` });
    }
  }

  // ---------- Poblacions ----------
  function poblar() {
    vuelos = []; pares = []; instr.clear();
    if (modo === 'proyecto') { crearProyecto(16); parColisio(); parColisio(); }
    else {
      for (let i = 0; i < objetivo; i++) vuelos.push(nouVol());
      engendraPar(); engendraPar(); engendraPar();
    }
  }

  function enviarInicio() {
    emitir({
      tipo: 'inicio', modo, hora: iso(tSim), escala,
      aeropuertos: AEROS, aerolineas: AEROL.map(a => [a[0], a[1], a[2]]), fases: FASES, tipos: TIPUS,
    });
    if (modo === 'proyecto') {
      emitir({ tipo: 'planesProyecto', centro: [41.2971, 2.0785], caja: CAIXA, distanciaSeguridadNM: 2.5 });
      emitir({ tipo: 'volarA', lat: 41.3, lon: 2.1, distancia: 0.09 });
    }
  }

  // ---------- Bucle de simulació ----------
  function pas() {
    const ara = performance.now(), dtR = Math.min(0.2, (ara - tReal) / 1000); tReal = ara;
    const dtS = pausado ? 0 : dtR * escala;
    tSim += dtS * 1000;
    if (modo === 'proyecto') for (const v of vuelos) { if (v.id !== pilotat) mouProj(v, dtS); }
    else {
      for (let i = 0; i < vuelos.length; i++) {
        const v = vuelos[i];
        if (v.man && v.id !== pilotat) {
          // Vol lliure: rumb cap al destí (màx. 3 graus/s) i baixada final
          const m = v.man, dst = AEROS[v.d];
          const obj = rumbInicial(m.lat, m.lon, dst[4], dst[5]);
          let gir = ((obj - m.hdg + 540) % 360) - 180;
          m.hdg = (m.hdg + Math.max(-3 * dtS, Math.min(3 * dtS, gir)) + 360) % 360;
          desti(m.lat, m.lon, m.hdg, v.vel * dtS / 3600 / NM_PER_RAD, LL); m.lat = LL[0]; m.lon = LL[1];
          const dd = distAngular(m.lat, m.lon, dst[4], dst[5]) * NM_PER_RAD;
          m.alt = Math.max(0, Math.min(m.alt + 30 * dtS, dd * 333, (v.fl + v.dfl) * 100));
          if (dd > 2) continue;
        } else if (v.man) continue;
        if (tSim > v.dep + v.dur || v.man) {
          const n = nouVol(v.d, false); n.id = v.id; n.dep = tSim; vuelos[i] = n;
          if (instr.has(v.id)) instr.delete(v.id);
        }
      }
      // Ajusta la quantitat de vols a la densitat demanada
      while (vuelos.length < objetivo) vuelos.push(nouVol());
      while (vuelos.length > objetivo) { const k = Math.floor(rnd() * vuelos.length); if (!pares.some(p => p.a === vuelos[k].id || p.b === vuelos[k].id) && vuelos[k].id !== selId) vuelos.splice(k, 1); else break; }
    }
    // Reposa parells de conflicte resolts amb nous
    if (pares.filter(p => !p.resuelto).length < 2 && ara - avisoPares > 25000) { avisoPares = ara; pares = pares.filter(p => !p.resuelto); engendraPar(); }

    const ar = [];
    for (const v of vuelos) {
      const s = estatVol(v, tSim);
      ar.push([v.id, +s.lat.toFixed(5), +s.lon.toFixed(5), Math.round(s.alt), +s.hdg.toFixed(1), v.man ? Math.round(v.man.vel ?? v.vel) : v.vel, s.fase, v.ai, v.cs, TIPUS.indexOf(v.tipo)]);
    }
    const conf = detecta(tSim);
    emitir({ tipo: 'estado', hora: iso(tSim), escala, pausado, modo, pilotado: pilotat, vuelos: ar, conflictos: conf });
  }

  // ---------- Informació de vol / aeroport / estadístiques ----------
  function infoVuelo() {
    const v = vuelos.find(x => x.id === selId);
    if (!v) return;
    const s = estatVol(v, tSim);
    const ori = AEROS[v.o], des = AEROS[v.d];
    const pt = (f, o) => { posF(v, f, P); vecALl(P[0], P[1], P[2], LL); return [+LL[0].toFixed(4), +LL[1].toFixed(4)]; };
    let ruta = [], rec = [];
    if (v.proj) {
      ruta = [[s.lat, s.lon]]; rec = [[s.lat, s.lon]];
    } else {
      for (let k = 0; k <= 63; k++) ruta.push(pt(k / 63));
      const nF = Math.max(2, Math.round(s.f * 63));
      for (let k = 0; k <= nF; k++) rec.push(pt(s.f * k / nF));
    }
    const c = v.ai >= 0 ? AEROL[v.ai] : null;
    const alt = s.alt, vv = s.fase === 2 ? 2200 : s.fase === 4 || s.fase === 5 ? -1800 : 0;
    const conf = detecta(tSim).some(x => x[0] === v.id || x[1] === v.id);
    emitir({
      tipo: 'infoVuelo', id: v.id, callsign: v.cs, aerolinea: c ? c[1] : 'Pla de vol del projecte', color: c ? c[2] : '#5ef2ff',
      tipoAvion: v.tipo[0], nombreAvion: v.tipo[1], matricula: v.mat,
      origen: { iata: ori[0], nombre: ori[1], ciudad: ori[2], lat: ori[4], lon: ori[5] },
      destino: { iata: des[0], nombre: des[1], ciudad: des[2], lat: des[4], lon: des[5] },
      salida: iso(v.dep), llegada: iso(v.dep + v.dur), fase: FASES[s.fase], altitudFt: Math.round(alt), velocidadKt: v.vel,
      rumbo: +s.hdg.toFixed(1), velVerticalFpm: vv, progreso: +s.f.toFixed(4), distanciaTotalNM: Math.round(v.D),
      distanciaRestanteNM: Math.round(v.D * (1 - s.f)), nivelCrucero: v.fl + v.dfl, ruta, recorrido: rec,
      contacto: c && c[3] ? { nombre: c[1], telefono: c[3], email: c[4] } : (v.proj ? { nombre: 'Projecte', telefono: '934000000', email: 'plans@projecte.example' } : null),
      enConflicto: conf, instrucciones: instr.get(v.id) || [`${v.cs}: mantingui FL${v.fl + v.dfl}`, `${v.cs}: contacti amb ${des[0]} Aproximació`],
    });
  }
  function infoAeropuerto() {
    const i = AEROS.findIndex(a => a[0] === selIata);
    if (i < 0) return;
    const a = AEROS[i];
    const off = Math.round(a[5] / 15) * 3600000, loc = tSim + off;
    const slot = Math.floor(loc / 300000);                 // canvia cada 5 minuts
    const r = mulberry32(slot * 31 + i * 977);
    const hm = ms => new Date(ms).toISOString().substr(11, 5);
    const salidas = [], llegadas = [];
    const ST_S = ['Embarcant', 'A l\'hora', 'A l\'hora', 'Retardat', 'Enlairat', 'Cancel·lat'];
    const ST_L = ['En vol', 'En vol', 'Aterrant', 'Retardat', 'Aterrat', 'A l\'hora'];
    for (let k = 0; k < 9; k++) {
      const oa = AEROS[(i + 1 + Math.floor(r() * (AEROS.length - 1))) % AEROS.length], al = AEROL[Math.floor(r() * AEROL.length)];
      const t = loc + (k * 9 - 12) * 60000 + Math.floor(r() * 6) * 60000;
      const cs = al[0] + (100 + Math.floor(r() * 8900));
      const sSt = k < 1 ? 'Enlairat' : k < 3 ? 'Embarcant' : ST_S[Math.floor(r() * ST_S.length)];
      salidas.push([hm(t), cs, oa[0], oa[2], sSt]);
      const o2 = AEROS[(i + 3 + Math.floor(r() * (AEROS.length - 1))) % AEROS.length], al2 = AEROL[Math.floor(r() * AEROL.length)];
      const t2 = loc + (k * 8 - 20) * 60000 + Math.floor(r() * 6) * 60000;
      const lSt = k < 2 ? 'Aterrat' : k < 4 ? 'Aterrant' : ST_L[Math.floor(r() * ST_L.length)];
      llegadas.push([hm(t2), al2[0] + (100 + Math.floor(r() * 8900)), o2[0], o2[2], lSt]);
    }
    emitir({
      tipo: 'infoAeropuerto', iata: a[0], icao: 'L' + a[0], nombre: a[1], ciudad: a[2], pais: a[3], lat: a[4], lon: a[5],
      elevacionFt: Math.round(r() * 600), horaLocal: hm(loc), salidas, llegadas,
    });
  }
  function estadisticas() {
    const por = [0, 0, 0, 0, 0, 0, 0], aer = new Map(), apt = new Map(), cont = new Map();
    let aire = 0;
    for (const v of vuelos) {
      const s = estatVol(v, tSim); por[s.fase]++; if (s.fase > 0 && s.fase < 6) aire++;
      const nom = v.ai >= 0 ? AEROL[v.ai][1] : 'Projecte';
      aer.set(nom, (aer.get(nom) || 0) + 1);
      for (const k of [AEROS[v.o][0], AEROS[v.d][0]]) apt.set(k, (apt.get(k) || 0) + 1);
      const ct = continent(s.lat, s.lon); cont.set(ct, (cont.get(ct) || 0) + 1);
    }
    const top = (m, n) => [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, n);
    emitir({
      tipo: 'estadisticas', enVuelo: aire, enTierra: Math.round(vuelos.length * 0.12), porFase: por,
      topAerolineas: top(aer, 6), topAeropuertos: top(apt, 6), porContinente: top(cont, 6),
      conflictosActivos: detecta(tSim).length, conflictosResueltos: resueltos,
    });
  }

  // ---------- Ordres rebudes de la pàgina ----------
  function recibir(m) {
    switch (m.tipo) {
      case 'listo': enviarInicio(); poblar(); setTimeout(() => { estadisticas(); }, 300); break;
      case 'seleccionarVuelo': selId = m.id; selIata = null; infoVuelo(); break;
      case 'seleccionarAeropuerto': selIata = m.iata; selId = -1; infoAeropuerto(); break;
      case 'deseleccionar': selId = -1; selIata = null; break;
      case 'escala': if (modo !== 'directo' && pilotat < 0) escala = m.valor; break;
      case 'pausa': if (modo !== 'directo' && pilotat < 0) pausado = !!m.valor; break;
      case 'pilotar': {
        const v = vuelos.find(x => x.id === m.id);
        if (!v) { emitir({ tipo: 'finPilotaje', motivo: 'L\'avió ja no és a la simulació.' }); break; }
        if (pilotat !== m.id) { pilotat = m.id; if (escalaAbans < 0) { escalaAbans = escala; escala = 1; pausado = false; } }
        if (v.proj) { v.lat = m.lat; v.lon = m.lon; v.alt = m.alt; v.hdg = m.rumbo; v.vel = m.vel; }
        else v.man = { lat: m.lat, lon: m.lon, alt: m.alt, hdg: m.rumbo, vel: m.vel };
        break;
      }
      case 'dejarPilotar':
        pilotat = -1;
        if (escalaAbans >= 0) { escala = modo === 'directo' ? 1 : escalaAbans; escalaAbans = -1; }
        break;
      case 'horaReal': if (modo === 'directo' || pilotat >= 0) break; tSim = Date.now(); emitir({ tipo: 'aviso', nivel: 'info', texto: 'Rellotge sincronitzat amb l\'hora UTC real' }); break;
      case 'densidad': objetivo = m.valor; break;
      case 'modo':
        pilotat = -1; escalaAbans = -1;
        if (m.valor === 'directo') {
          emitir({ tipo: 'aviso', nivel: 'info', texto: 'Demostració: trànsit simulat com si fos en directe (temps real)' });
          modo = 'directo'; escala = 1; pausado = false; tSim = Date.now();
        } else { modo = m.valor; if (escala === 1) escala = 60; }
        selId = -1; selIata = null; poblar(); enviarInicio(); break;
      case 'cargarPlanes': crearProyecto(5); emitir({ tipo: 'aviso', nivel: 'ok', texto: 'S\'han carregat 5 plans de vol (demostració)' }); break;
      case 'resolverConflicto': resolver(m.idA, m.idB); break;
      case 'resolverTodos': for (const c of detecta(tSim)) resolver(c[0], c[1]); break;
      case 'exportarInforme': emitir({ tipo: 'aviso', nivel: 'ok', texto: 'Informe exportat (demostració): conflictes.txt' }); break;
    }
  }

  setInterval(pas, 50);
  setInterval(() => { if (selId >= 0) infoVuelo(); }, 1000);
  setInterval(() => { if (selIata) infoAeropuerto(); }, 2000);
  setInterval(estadisticas, 2000);
  return { recibir };
}
