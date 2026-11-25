// Monuments d'Atenes, Istanbul, Moscou, Sant Petersburg, El Caire, Dubai, Abu Dhabi, Doha, Riad, Jerusalem, Casablanca i Ciutat del Cap.
// Format de les peces a ../monuments_geo.js (exemple de referència: dades_0.js).
const D2R = Math.PI / 180;

// Cúpula de ceba (torn de 8 costats) de radi r i alçada h.
const ceba = (x, y, z, r, h, c) => ['torn', x, y, z, [[r * 0.55, 0], [r, h * 0.28], [r * 0.9, h * 0.5], [r * 0.45, h * 0.78], [0, h]], 8, c];

// Minaret: fust amb balcó i caputxa; h = alçada total.
const minaret = (x, z, h, r, c, cc, y0 = 0) => ['torn', x, y0, z, [[r, 0], [r * 0.85, h * 0.62], [r * 1.25, h * 0.64], [r * 1.25, h * 0.67], [r * 0.9, h * 0.69], [r * 0.7, h * 0.8], [r * 0.9, h * 0.82], [0, h]], 8, c];

// Anell en U (obert cap a +z, extrem arrodonit a -z): semieix interior ai, exterior bo, tram recte L.
function anellU(ai, bo, L, n) {
  const pts = [[bo, L], [bo, 0]];
  for (let k = 1; k < n; k++) { const t = -Math.PI * k / n; pts.push([bo * Math.cos(t), bo * Math.sin(t)]); }
  pts.push([-bo, 0], [-bo, L], [-ai, L], [-ai, 0]);
  for (let k = n - 1; k >= 1; k--) { const t = -Math.PI * k / n; pts.push([ai * Math.cos(t), ai * Math.sin(t)]); }
  pts.push([ai, 0], [ai, L]);
  return pts;
}

// Polígon regular de n vèrtexs (radi r, primer vèrtex al nord).
const poligon = (n, r) => Array.from({ length: n }, (_, i) => [r * Math.sin(2 * Math.PI * i / n), r * Math.cos(2 * Math.PI * i / n)]);

// ---------- Atenes ----------
function partheno() {
  const H = 66, y1 = H + 1.5, p = [];
  // Roca de l'Acròpoli (dues graderies)
  p.push(['prisma', 0, 0, 0, [[-165, 0], [-135, 50], [-80, 68], [0, 64], [80, 60], [140, 35], [160, 0], [135, -40], [70, -58], [0, -62], [-90, -64], [-145, -45]], 36, '#8d8672']);
  p.push(['prisma', 0, 36, 0, [[-145, 0], [-120, 42], [-70, 58], [0, 54], [75, 50], [125, 30], [142, 0], [120, -34], [65, -50], [0, -54], [-85, -56], [-128, -40]], 30, '#a39b84']);
  p.push(['caixa', 0, H, 0, 73, 1.5, 34, '#d9d0bc']);
  p.push(['caixa', 0, y1, 0, 69.5, 0.6, 30.9, '#e0d8c6']);
  p.push(['caixa', 0, y1, 0, 60, 11, 21, '#cdbfa6']);                         // cella
  for (let i = 0; i < 17; i++) for (const s of [-1, 1]) p.push(['cil', -33.3 + i * 4.16, y1, s * 14.5, 0.95, 0.85, 10.4, 6, '#e6dfcf']);
  for (let j = 1; j <= 6; j++) for (const s of [-1, 1]) p.push(['cil', s * 33.3, y1, -14.5 + j * 4.14, 0.95, 0.85, 10.4, 6, '#e6dfcf']);
  p.push(['caixa', 0, y1 + 10.4, 0, 69, 3.4, 30, '#ddd4c0']);                  // entaulament
  p.push(['piramide', 0, y1 + 13.8, 0, 1, 4.5, 4, '#c9a98a', { esc: [67, 1, 28] }]);
  return p;
}
function panathinaiko() {
  const p = [], L = 198;
  // origen al centre de l'estadi (206 m de llarg): l'arc és a -z i l'extrem obert a +z
  p.push(['prisma', 0, 0, -73, anellU(17, 52, L, 8), 7, '#ece8df']);
  p.push(['prisma', 0, 7, -73, anellU(28, 52, L, 8), 7, '#e6e1d6']);
  p.push(['prisma', 0, 14, -73, anellU(40, 52, L, 8), 7, '#ece8df']);
  p.push(['caixa', 0, 0, 25, 34, 0.5, 180, '#c9b48a']);                          // pista
  return p;
}

// ---------- Istanbul ----------
function santaSofia() {
  const m = '#c9926b', lead = '#7f8184', p = [];
  p.push(['caixa', 0, 0, 0, 66, 24, 72, m]);
  p.push(['caixa', 0, 0, -41, 58, 14, 12, '#d6a77f']);                          // nàrtex
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(['caixa', sx * 20, 0, sz * 20, 12, 40, 12, '#b97a56']);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(['caixa', sx * 38, 0, sz * 14, 9, 28, 20, '#b97a56']);
  p.push(['cil', 0, 24, 0, 17, 16.5, 15, 16, m]);                                 // tambor
  p.push(['cupula', 0, 39, 0, 16.5, 16, lead, { segs: 12 }]);                     // cúpula central (55 m)
  p.push(['cupula', 0, 24, 27, 15, 13, lead, { segs: 10 }]);
  p.push(['cupula', 0, 24, -27, 15, 13, lead, { segs: 10 }]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(['cupula', sx * 20, 24, sz * 38, 6, 6, lead]);
  for (const [x, z] of [[-45, -30], [-45, 30], [45, -30], [45, 30]]) p.push(minaret(x, z, 60, 3.2, '#e7d9bf'));
  return p;
}
function mesquitaBlava() {
  const wl = '#cfcdc6', lead = '#8d95a0', p = [];
  p.push(['caixa', 0, 0, 0, 64, 22, 64, wl]);
  p.push(['cil', 0, 22, 0, 12.5, 12, 8, 14, wl]);
  p.push(['cupula', 0, 30, 0, 11.7, 13, lead, { segs: 12 }]);                     // cúpula principal (43 m)
  for (const [x, z] of [[24, 0], [-24, 0], [0, 24], [0, -24]]) p.push(['cupula', x, 22, z, 11, 11, lead, { segs: 10 }]);
  for (const [x, z] of [[24, 24], [-24, 24], [24, -24], [-24, -24]]) p.push(['cupula', x, 22, z, 6.5, 6, lead, { segs: 8 }]);
  p.push(['caixa', -29, 0, -56, 7, 8, 50, '#d6cfc0']);                           // pati: arcades
  p.push(['caixa', 29, 0, -56, 7, 8, 50, '#d6cfc0']);
  p.push(['caixa', 0, 0, -78, 52, 8, 7, '#d6cfc0']);
  for (let k = 0; k < 6; k++) { p.push(['cupula', -29, 8, -36 - k * 8.4, 3.2, 3, lead, { segs: 6 }]); p.push(['cupula', 29, 8, -36 - k * 8.4, 3.2, 3, lead, { segs: 6 }]); }
  for (let k = 0; k < 5; k++) p.push(['cupula', -16 + k * 8, 8, -78, 3.2, 3, lead, { segs: 6 }]);
  for (const [x, z] of [[-35, 34], [35, 34], [-35, -34], [35, -34]]) p.push(minaret(x, z, 64, 2.8, '#ece6d8'));
  for (const x of [-32, 32]) p.push(minaret(x, -80, 43, 2.5, '#ece6d8'));
  return p;
}

// ---------- Moscou ----------
function santBasili() {
  const p = [], col = ['#2f8f5a', '#d9a62f', '#c8452e', '#3b6ea8', '#6b4aa0', '#d35a8a', '#41b0a8', '#e0b52e'];
  p.push(['cil', 0, 0, 0, 36, 34, 6, 12, '#b6523a']);
  p.push(['cil', 0, 6, 0, 11.5, 11, 28, 8, '#c8452e']);                         // església central
  p.push(['con', 0, 34, 0, 11, 14, 8, '#e8ddc0']);
  p.push(ceba(0, 46, 0, 3.2, 5, '#e0b52e'));
  p.push(['con', 0, 50.5, 0, 0.5, 4, 4, '#e0b52e']);
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * D2R, big = i % 2 === 0, d = big ? 25 : 23, r = big ? 7.5 : 6, h = big ? 18 : 16;
    const x = Math.sin(a) * d, z = Math.cos(a) * d;
    p.push(['cil', x, 6, z, r, r * 0.95, h, 8, i % 4 === 1 ? '#e8ddc0' : '#b8412c']);
    p.push(ceba(x, 6 + h, z, r * 1.05, r * 1.7, col[i]));
  }
  return p;
}
function msu() {
  const c = '#d6c8a6', p = [];
  p.push(['caixa', 0, 0, 0, 120, 90, 80, c]);
  p.push(['caixa', 0, 90, 0, 80, 50, 62, c]);
  p.push(['caixa', 0, 140, 0, 58, 30, 48, c]);
  p.push(['caixa', 0, 170, 0, 40, 24, 34, c]);
  p.push(['caixa', 0, 194, 0, 26, 16, 24, '#c2b48f']);
  p.push(['torn', 0, 210, 0, [[8, 0], [6, 8], [3.5, 16], [1.2, 24], [0.4, 30], [0, 32]], 8, '#6f9c86']);
  p.push(['esfera', 0, 242, 0, 2, '#e8c14a', { llum: true }]);
  for (const sx of [-1, 1]) {
    p.push(['caixa', sx * 88, 0, 0, 80, 64, 56, c]);
    p.push(['caixa', sx * 162, 0, 0, 68, 84, 56, c]);
    p.push(['caixa', sx * 190, 0, 0, 24, 70, 44, c]);
    p.push(['caixa', sx * 162, 84, 0, 22, 22, 22, '#c2b48f']);
    p.push(['caixa', sx * 70, 0, 70, 38, 56, 92, c]);                            // braços frontals
    p.push(['caixa', sx * 70, 0, -70, 38, 56, 92, c]);
    p.push(['caixa', sx * 170, 0, 60, 40, 50, 64, c]);
    p.push(['caixa', sx * 170, 0, -60, 40, 50, 64, c]);
    p.push(['caixa', sx * 38, 90, 0, 28, 14, 28, '#c2b48f']);
  }
  return p;
}

// ---------- Sant Petersburg ----------
function santIsaac() {
  const body = '#b8aea2', gr = '#a8928c', gold = '#e0b43c', p = [];
  p.push(['caixa', 0, 0, 0, 92, 40, 78, body]);
  p.push(['caixa', 0, 40, 0, 94, 3, 80, '#7fae9a']);
  // pòrtics: costats est/oest (8 columnes) i nord/sud (8 columnes)
  for (const s of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      p.push(['cil', s * 52, 0, -17.5 + i * 5, 1.9, 1.7, 17, 6, gr]);
      p.push(['cil', s * 58, 0, -17.5 + i * 5, 1.9, 1.7, 17, 6, gr]);
      p.push(['cil', -17.5 + i * 5, 0, s * 44, 1.9, 1.7, 17, 6, gr]);
    }
    p.push(['caixa', s * 55, 17, 0, 12, 3, 38, body]);
    p.push(['piramide', s * 55, 20, 0, 1, 7, 4, body, { esc: [12, 1, 40] }]);
    p.push(['caixa', 0, 17, s * 44, 38, 3, 6, body]);
    p.push(['piramide', 0, 20, s * 44, 1, 7, 4, body, { esc: [40, 1, 8] }]);
    p.push(['caixa', s * 36, 0, -36 * s + 0, 1, 0.1, 1, body]);
  }
  p.push(['cil', 0, 43, 0, 14, 13.5, 17, 12, body]);                             // tambor
  for (let i = 0; i < 16; i++) { const a = i * 22.5 * D2R; p.push(['cil', Math.sin(a) * 14.5, 43, Math.cos(a) * 14.5, 0.9, 0.8, 15, 5, gr]); }
  p.push(['cil', 0, 58, 0, 15.5, 15, 3, 12, body]);
  p.push(['cupula', 0, 61, 0, 13.5, 20, gold, { segs: 12 }]);                     // cúpula daurada
  p.push(['cil', 0, 81, 0, 3.4, 3.2, 10, 8, '#d9dde0']);                          // llanterna
  p.push(['cupula', 0, 91, 0, 3.4, 5, gold]);
  p.push(['caixa', 0, 96, 0, 0.8, 5.5, 0.8, gold, { llum: true }]);
  p.push(['caixa', 0, 98.5, 0, 3.2, 0.8, 0.8, gold, { llum: true }]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.push(['cil', sx * 38, 40, sz * 33, 4.5, 4.2, 5, 8, body]);
    p.push(['cupula', sx * 38, 45, sz * 33, 4.6, 5, gold, { segs: 8 }]);
  }
  return p;
}
function lakhta() {
  const p = [];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const y = i * 36, f = i / (N - 1);
    p.push(['cil', 0, y, 0, 34 - 26 * f, 34 - 26 * (i + 1) / (N - 1) + 0.0, 38, 5, i % 2 ? '#7aa8c0' : '#86b2c8', { gir: i * 9 }]);
  }
  p.push(['torn', 0, 396, 0, [[7, 0], [5.5, 22], [3.5, 44], [1.6, 60], [0.5, 68], [0, 70]], 5, '#cfd8e0', { llum: true }]);
  return p;
}

// ---------- El Caire ----------
function piramidesGizeh() {
  const p = [], sand = '#d9c28f';
  p.push(['piramide', 17, 0, 212, 230, 139, 4, sand]);                         // Keops
  p.push(['piramide', -312, 0, -135, 215, 136, 4, '#d6bd88']);                  // Kefrèn
  p.push(['piramide', -312, 96, -135, 63, 40, 4, '#e8e0cc']);                   // cap de revestiment
  p.push(['piramide', -552, 0, -510, 103, 65, 4, '#d4b985']);                   // Mikerinos
  // Esfinx (mira cap a l'est)
  p.push(['caixa', 345, 0, -235, 40, 10, 14, '#cdb487']);
  p.push(['caixa', 361, 0, -235, 12, 14, 12, '#cdb487']);
  p.push(['caixa', 367, 8, -235, 7, 12, 8, '#d2ba8e']);
  return p;
}
function torreCaire() {
  const p = [];
  p.push(['cil', 0, 0, 0, 22, 18, 3, 12, '#cbbfae']);
  p.push(['torn', 0, 3, 0, [[0, 0], [10, 0], [8.5, 30], [6.6, 70], [5.6, 110], [5.8, 128], [12, 133], [15.5, 146], [14, 154], [8, 159], [4, 160], [0, 160]], 8, '#d8cfc0']);
  p.push(['cil', 0, 146, 0, 16.2, 16.2, 4, 8, '#e8d9a8', { llum: true }]);
  p.push(['cil', 0, 163, 0, 3, 2, 18, 6, '#c9c9c9']);
  p.push(['con', 0, 181, 0, 1.5, 6, 6, '#c9c9c9', { llum: true }]);
  return p;
}

// ---------- Dubai ----------
function burjKhalifa() {
  const p = [], g = '#a7b9c8';
  p.push(['cil', 0, 0, 0, 16, 15, 560, 6, g]);
  const tiers = [[58, 130], [50, 250], [42, 350], [34, 450], [26, 540], [18, 620]];
  for (const a of [0, 120, 240]) {
    const sa = Math.sin(a * D2R), ca = Math.cos(a * D2R);
    for (const [L, h] of tiers) p.push(['caixa', sa * L / 2, 0, ca * L / 2, 20, h, L, g, { gir: a }]);
  }
  p.push(['cil', 0, 560, 0, 12, 9, 80, 6, '#b9c7d2']);
  p.push(['torn', 0, 640, 0, [[7, 0], [5, 60], [3, 130], [1.4, 170], [0.6, 188], [0, 190]], 8, '#cfd8e0', { llum: true }]);
  p.push(['caixa', 0, 0, 0, 120, 8, 120, '#c9bfae', { gir: 0 }]);
  return p;
}
function burjAlArab() {
  const p = [];
  p.push(['cil', 0, 0, 0, 40, 38, 3, 12, '#d9cfae']);                           // illa
  p.push(['caixa', 12, 0, 0, 10, 321, 40, '#dfe6ea']);                          // pal
  const t = [[-26, 70], [-20, 120], [-14, 180], [-8, 240], [-2, 290]];
  for (const [xw, h] of t) p.push(['caixa', (12 + xw) / 2 - 2 + 0, 0, 0, 12 - xw, h, 36 - Math.abs(xw) * 0.3, '#f4f4f0']);
  p.push(['caixa', 12, 120, 0, 7, 200, 36, '#e8eef2', { llum: true }]);
  p.push(['cil', -10, 210, 0, 6, 6, 2, 8, '#e8eef2']);                          // heliport
  p.push(['barra', 12, 321, 0, 12, 340, 0, 1.6, '#e8eef2', { llum: true }]);
  return p;
}

// ---------- Abu Dhabi ----------
function mesquitaZayed() {
  const w = '#f5f3ee', p = [];
  // sala d'oració al nord (+z, cap a la qibla); pati amb arcades al sud
  p.push(['caixa', 0, 0, 92, 220, 28, 105, w]);
  p.push(['cil', 0, 28, 92, 17, 16.6, 10, 12, w]);
  p.push(['cupula', 0, 38, 92, 16.4, 32, w, { segs: 12 }]);                      // cúpula principal (70 m)
  for (const x of [-48, 48]) p.push(['cupula', x, 28, 92, 11, 15, w, { segs: 10 }]);
  for (const x of [-80, -65, 65, 80]) p.push(['cupula', x, 28, 92, 6, 7, w, { segs: 8 }]);
  for (const x of [-30, 30, -64, 64]) for (const z of [62, 122]) p.push(['cupula', x + (x > 0 ? 8 : -8), 28, z, 5.5, 6, w, { segs: 8 }]);
  p.push(['caixa', -100, 0, -52, 24, 12, 185, w]);                              // arcades laterals
  p.push(['caixa', 100, 0, -52, 24, 12, 185, w]);
  p.push(['caixa', 0, 0, -133, 176, 12, 24, w]);
  for (let k = 0; k < 9; k++) {
    const z = 30 - k * 20;
    p.push(['cupula', -100, 12, z, 6, 5, w, { segs: 6 }]); p.push(['cupula', 100, 12, z, 6, 5, w, { segs: 6 }]);
  }
  for (let k = 0; k < 8; k++) p.push(['cupula', -70 + k * 20, 12, -133, 6, 5, w, { segs: 6 }]);
  for (const [x, z] of [[-112, 40], [112, 40], [-112, -140], [112, -140]]) p.push(minaret(x, z, 107, 4.4, w));
  return p;
}
function louvreAbuDhabi() {
  const p = [];
  const n = [[105, 40], [120, 0], [95, -35], [140, -30], [130, -75], [165, -60], [95, -95], [60, -110], [20, -100], [-20, -85], [-60, -95], [-40, -120], [0, -130], [110, -120], [120, 70], [85, 95], [60, 115], [-95, -60], [-100, -90]];
  n.forEach(([x, z], i) => p.push(['caixa', x, 0, z, 24, 8, 22, '#f2efe8', { gir: i * 17 % 50 }]));
  for (const [x, z] of [[-60, -60], [60, -60], [-60, 60], [60, 60]]) p.push(['cil', x, 0, z, 2.5, 2, 22, 6, '#cfd3d6']);
  p.push(['cupula', 0, 22, 0, 90, 20, '#cfd3d6', { segs: 16 }]);                  // cúpula de 180 m
  p.push(['tor', 0, 22, 0, 90, 1.4, '#e8ecef', { eix: 'y', segs: 16 }]);
  return p;
}

// ---------- Doha ----------
function museuArtIslamic() {
  const p = [], l = '#e6dfd0';
  p.push(['caixa', 0, 0, 25, 72, 2.5, 130, '#c8bfa8']);                          // plataforma de l'illa
  p.push(['caixa', 0, 2.5, 0, 46, 16, 46, l]);
  p.push(['caixa', 0, 18.5, 0, 34, 12, 34, l]);
  p.push(['caixa', 0, 18.5, 0, 22, 27, 22, '#efe9db']);                           // torre central (45 m)
  p.push(['caixa', 0, 45.5, 0, 16, 2, 16, '#2a2a2a']);
  p.push(['cupula', 0, 30.5, 0, 10, 5, '#3c4a52', { segs: 8 }]);
  p.push(['caixa', 0, 2.5, 52, 18, 12, 70, '#e0d9c9']);                           // galeria cap al nord
  return p;
}
function estadiLusail() {
  const p = [];
  p.push(['bol', 0, 0, 0, 153, 153, 58, 55, 24, '#c8a24a']);
  p.push(['bol', 0, 2, 0, 136, 136, 48, 40, 24, '#8a6a2a']);
  p.push(['caixa', 0, 0, 0, 72, 0.8, 110, '#3f8f3a']);
  p.push(['tor', 0, 60, 0, 120, 4, '#d8d2c3', { eix: 'y', segs: 14 }]);
  p.push(['tor', 0, 58, 0, 100, 1.4, '#f6f0e0', { eix: 'y', segs: 14, llum: true }]);
  return p;
}

// ---------- Riad ----------
function kingdomCentre() {
  const p = [];
  p.push(['caixa', 0, 0, 0, 46, 222, 34, '#a9bccb']);
  p.push(['arc', 0, 222, 0, 46, 80.3, 9, 34, '#a9bccb']);
  p.push(['caixa', 0, 296, 0, 46, 6, 34, '#c9d3da', { llum: true }]);              // passarel·la
  p.push(['caixa', -88, 0, 0, 70, 28, 190, '#cdbfb0']);                          // ales del centre comercial
  p.push(['caixa', 88, 0, 0, 70, 28, 190, '#cdbfb0']);
  return p;
}
function faisaliyah() {
  const p = [];
  p.push(['caixa', 0, 0, 0, 60, 18, 60, '#cdbfb0']);
  p.push(['cil', 0, 18, 0, 25, 14, 190, 4, '#8fa8bd', { gir: 45 }]);
  p.push(['cil', 0, 208, 0, 4, 2.2, 14, 6, '#c9d3da']);
  p.push(['esfera', 0, 192, 0, 14, '#c9a74a', { segs: 12, llum: true }]);
  p.push(['con', 0, 222, 0, 2.2, 45, 6, '#d8dde0', { llum: true }]);
  return p;
}

// ---------- Jerusalem ----------
function cupulaRoca() {
  const p = [], r8 = 26.7;
  p.push(['caixa', 0, 0, 0, 62, 4, 62, '#d8cfbd']);
  p.push(['cil', 0, 4, 0, r8, r8, 5.5, 8, '#e8e2d4', { gir: 22.5 }]);
  p.push(['cil', 0, 9.5, 0, r8, r8, 5, 8, '#3b79ad', { gir: 22.5 }]);
  p.push(['con', 0, 14.5, 0, 24, 6, 8, '#8a8f94', { gir: 22.5 }]);
  p.push(['cil', 0, 14.5, 0, 12.5, 12.5, 9.5, 12, '#3b79ad']);
  p.push(['cupula', 0, 24, 0, 12.5, 11.3, '#e1b83a', { segs: 12, llum: true }]);
  p.push(['caixa', 0, 35.3, 0, 0.4, 3, 1.6, '#e1b83a']);
  return p;
}
function torreDavid() {
  const s = '#cfb88a', p = [];
  const k = 0.78, V = [[-70, -45], [75, -47], [82, 20], [15, 55], [-68, 42]].map(([x, z]) => [x * k, z * k]);
  p.push(['prisma', 0, 0, 0, [[-95, -60], [90, -62], [100, 30], [20, 70], [-85, 55]].map(([x, z]) => [x * k, z * k]), 8, '#a89b7d']);
  for (let i = 0; i < 5; i++) { const a = V[i], b = V[(i + 1) % 5]; p.push(['barra', a[0], 14, a[1], b[0], 14, b[1], 6, s]); }
  for (const [x, z] of V) p.push(['cil', x, 8, z, 9, 8, 14, 8, s]);
  p.push(['caixa', 16, 8, -5, 24, 18, 20, '#d6c294']);                          // torre de Fasael
  p.push(['caixa', 18, 26, -5, 12, 8, 12, '#d6c294']);
  p.push(minaret(-28, 0, 34, 2.4, '#e2d2a8', '#8a8f94', 8));
  return p;
}

// ---------- Casablanca ----------
function mesquitaHassanII() {
  const p = [];
  // origen al centre de la sala d'oració; la mesquita dóna al mar pel nord, el minaret és a la façana sud
  p.push(['prisma', 0, 0, 0, [[-136, 65], [130, 65], [165, 40], [175, -10], [110, -95], [60, -150], [-10, -150], [-60, -100], [-136, -100]], 3, '#d8cfbf']);
  p.push(['caixa', 0, 3, 0, 200, 52, 100, '#ddd7c6']);
  p.push(['caixa', 0, 55, 0, 175, 4, 80, '#2f8f6a']);
  p.push(['piramide', 0, 59, 0, 1, 6, 4, '#2f8f6a', { esc: [165, 1, 72] }]);
  p.push(['caixa', 0, 3, -47, 25, 135, 25, '#d9d3c1']);                           // minaret (210 m)
  p.push(['caixa', 0, 138, -47, 20, 40, 20, '#d9d3c1']);
  p.push(['caixa', 0, 178, -47, 22, 6, 22, '#2f8f6a']);
  p.push(['piramide', 0, 184, -47, 15, 20, 4, '#2f8f6a']);
  p.push(['caixa', 0, 204, -47, 0.8, 8, 0.8, '#bfe8d0', { llum: true }]);
  return p;
}
function twinCenter() {
  const p = [];
  p.push(['caixa', 0, 0, 0, 78, 12, 40, '#d8d6d0']);
  p.push(['caixa', -22, 12, 0, 30, 103, 30, '#e8e6e0']);
  p.push(['caixa', 22, 12, 0, 30, 88, 30, '#e8e6e0']);
  p.push(['caixa', -22, 115, 0, 22, 5, 22, '#9fb4c4', { llum: true }]);
  p.push(['caixa', 22, 100, 0, 22, 5, 22, '#9fb4c4', { llum: true }]);
  return p;
}

// ---------- Ciutat del Cap ----------
function estadiGreenPoint() {
  const p = [];
  p.push(['bol', 0, 0, 0, 130, 118, 36, 50, 24, '#eee9e0']);
  p.push(['bol', 0, 2, 0, 113, 101, 30, 34, 24, '#6d8fb5']);
  p.push(['caixa', 0, 0, 0, 68, 0.8, 105, '#3f8f3a']);
  p.push(['tor', 0, 38, 0, 115, 3, '#f6f6f6', { eix: 'y', esc: [1, 1, 0.91], segs: 14 }]);
  return p;
}
function castellBonaEsperanca() {
  const p = [], s = '#d8b97a', P = poligon(5, 62);
  for (let i = 0; i < 5; i++) {
    const [x1, z1] = P[i], [x2, z2] = P[(i + 1) % 5];
    p.push(['barra', x1, 5, z1, x2, 5, z2, 8, s]);
    const a = Math.atan2(x1, z1);
    const dx = Math.sin(a), dz = Math.cos(a), px = Math.cos(a), pz = -Math.sin(a);
    const q = (u, v) => [u * dx + v * px, u * dz + v * pz];
    p.push(['prisma', x1, 0, z1, [q(-10, -16), q(14, -24), q(26, 0), q(14, 24), q(-10, 16)], 10, '#cfae6e']);
  }
  p.push(['caixa', 0, 0, 20, 60, 8, 10, '#e8dcc0']);
  p.push(['caixa', -25, 0, -10, 10, 8, 40, '#e8dcc0']);
  p.push(['caixa', 25, 0, -10, 10, 8, 40, '#e8dcc0']);
  p.push(['caixa', 0, 0, -30, 50, 7, 10, '#e8dcc0']);
  p.push(['caixa', 0, 8, 20, 58, 3, 8, '#7b4b36']);
  return p;
}

export const CIUTATS = [
  {
    ciutat: 'Atenes', pais: 'GR',
    monuments: [
      { nom: 'Partenó', lat: 37.97167, lon: 23.72666, rumb: 350, peces: partheno() },
      { nom: 'Estadi Panathinaikó', lat: 37.96830, lon: 23.74108, rumb: 338, peces: panathinaiko() },
    ],
  },
  {
    ciutat: 'Istanbul', pais: 'TR',
    monuments: [
      { nom: 'Santa Sofia', lat: 41.00849, lon: 28.97999, rumb: 130, peces: santaSofia() },
      { nom: 'Mesquita Blava', lat: 41.00534, lon: 28.97689, rumb: 135, peces: mesquitaBlava() },
    ],
  },
  {
    ciutat: 'Moscou', pais: 'RU',
    monuments: [
      { nom: 'Catedral de Sant Basili', lat: 55.75258, lon: 37.62312, rumb: 0, peces: santBasili() },
      { nom: 'Universitat Estatal de Moscou', lat: 55.70300, lon: 37.53057, rumb: 25, peces: msu() },
    ],
  },
  {
    ciutat: 'Sant Petersburg', pais: 'RU',
    monuments: [
      { nom: 'Catedral de Sant Isaac', lat: 59.93415, lon: 30.30631, rumb: 329, peces: santIsaac() },
      { nom: 'Lakhta Center', lat: 59.98685, lon: 30.17816, rumb: 0, peces: lakhta() },
    ],
  },
  {
    ciutat: 'El Caire', pais: 'EG',
    monuments: [
      { nom: 'Piràmides de Gizeh', lat: 29.97720, lon: 31.13400, rumb: 0, peces: piramidesGizeh() },
      { nom: 'Torre del Caire', lat: 30.04594, lon: 31.22408, rumb: 0, peces: torreCaire() },
    ],
  },
  {
    ciutat: 'Dubai', pais: 'AE',
    monuments: [
      { nom: 'Burj Khalifa', lat: 25.19720, lon: 55.27440, rumb: 30, peces: burjKhalifa() },
      { nom: 'Burj al Arab', lat: 25.14137, lon: 55.18452, rumb: 270, peces: burjAlArab() },
    ],
  },
  {
    ciutat: 'Abu Dhabi', pais: 'AE',
    monuments: [
      { nom: 'Gran Mesquita Xeic Zayed', lat: 24.41249, lon: 54.47504, rumb: 258, peces: mesquitaZayed() },
      { nom: 'Louvre Abu Dhabi', lat: 24.53371, lon: 54.39840, rumb: 0, peces: louvreAbuDhabi() },
    ],
  },
  {
    ciutat: 'Doha', pais: 'QA',
    monuments: [
      { nom: "Museu d'Art Islàmic", lat: 25.29435, lon: 51.53934, rumb: 0, peces: museuArtIslamic() },
      { nom: 'Estadi Lusail', lat: 25.42083, lon: 51.49041, rumb: 0, peces: estadiLusail() },
    ],
  },
  {
    ciutat: 'Riad', pais: 'SA',
    monuments: [
      { nom: 'Kingdom Centre', lat: 24.71140, lon: 46.67440, rumb: 335, peces: kingdomCentre() },
      { nom: 'Torre Al Faisaliyah', lat: 24.69015, lon: 46.68548, rumb: 335, peces: faisaliyah() },
    ],
  },
  {
    ciutat: 'Jerusalem', pais: 'IL',
    monuments: [
      { nom: 'Cúpula de la Roca', lat: 31.77797, lon: 35.23527, rumb: 0, peces: cupulaRoca() },
      { nom: 'Torre de David', lat: 31.77605, lon: 35.22815, rumb: 10, peces: torreDavid() },
    ],
  },
  {
    ciutat: 'Casablanca', pais: 'MA',
    monuments: [
      { nom: 'Mesquita Hassan II', lat: 33.60861, lon: -7.63278, rumb: 0, peces: mesquitaHassanII() },
      { nom: 'Twin Center', lat: 33.58669, lon: -7.63216, rumb: 0, peces: twinCenter() },
    ],
  },
  {
    ciutat: 'Ciutat del Cap', pais: 'ZA',
    monuments: [
      { nom: 'Estadi de Ciutat del Cap', lat: -33.90325, lon: 18.41105, rumb: 0, peces: estadiGreenPoint() },
      { nom: 'Castell de Bona Esperança', lat: -33.92593, lon: 18.42773, rumb: 346, peces: castellBonaEsperanca() },
    ],
  },
];
