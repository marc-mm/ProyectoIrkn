// Monuments d'Àsia-Pacífic (grup 4): Tòquio, Osaka, Pequín, Xangai, Hong Kong, Seül, Singapur, Kuala Lumpur,
// Bangkok, Delhi, Bombai, Taipei, Sydney i Melbourne. Format de peces a ../monuments_geo.js (vegeu dades_0.js).
// Les funcions auxiliars només generen llistes de peces repetitives (barres, pisos, cabines...).

const B = (x1, y1, z1, x2, y2, z2, g, c, o) => (o ? ['barra', x1, y1, z1, x2, y2, z2, g, c, o] : ['barra', x1, y1, z1, x2, y2, z2, g, c]);

// Capes apilades d'una torre: [[yBase, alt, rBaix, rDalt, costats, gir], ...]
const capes = (llista, color, o) => llista.map(([y, h, r0, r1, n, g]) => ['cil', 0, y, 0, r0, r1, h, n, color, Object.assign({ gir: g || 0 }, o || {})]);

// Torre de Tòquio: potes de gelosia de dues seccions, travessers, cobertes i antena.
function torreTokyo() {
  const p = [], ro = '#e4541a', bl = '#f3efe8';
  const ample = y => 40 - 27 * y / 120;   // semi-costat de les potes a l'alçada y (secció baixa)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.push(B(sx * 40, 0, sz * 40, sx * 13, 120, sz * 13, 3.6, ro));
    p.push(B(sx * 13, 132, sz * 13, sx * 4, 224, sz * 4, 2.6, bl));
  }
  // travessers: costats de cada anell (sobre els quatre costats del quadrat)
  for (const y of [30, 60, 90]) {
    const a = ample(y);
    p.push(B(-a, y, -a, a, y, -a, 1.6, bl)); p.push(B(-a, y, a, a, y, a, 1.6, bl));
    p.push(B(-a, y, -a, -a, y, a, 1.6, bl)); p.push(B(a, y, -a, a, y, a, 1.6, bl));
  }
  p.push(['caixa', 0, 0, 0, 62, 16, 40, '#d8d8d4']);                     // Foot Town
  p.push(['caixa', 0, 120, 0, 36, 10, 36, bl]);                         // mirador principal
  p.push(['caixa', 0, 130, 0, 30, 8, 30, ro]);
  p.push(['caixa', 0, 224, 0, 14, 7, 14, bl]);                          // mirador especial
  p.push(['caixa', 0, 231, 0, 11, 5, 11, ro]);
  p.push(['cil', 0, 236, 0, 5, 2.5, 60, 8, ro, { llum: true }]);
  p.push(['cil', 0, 296, 0, 2.5, 0.6, 37, 6, bl, { llum: true }]);
  return p;
}

// Umeda Sky Building: dues torres de vidre unides a dalt per un pont i un jardí flotant.
const umeda = [
  ['caixa', -38, 0, 0, 36, 173, 50, '#6e8aa3'],
  ['caixa', 38, 0, 0, 36, 173, 50, '#6e8aa3'],
  ['caixa', -38, 0, 0, 38, 12, 52, '#b9c4cc'],                           // podi
  ['caixa', 38, 0, 0, 38, 12, 52, '#b9c4cc'],
  ['caixa', 0, 138, 0, 44, 6, 36, '#aab6bf'],                           // pont de baix
  ['caixa', 0, 150, 0, 44, 14, 36, '#8fa5b6', { llum: true }],          // pis intermedi
  ['caixa', 0, 168, 0, 44, 5, 36, '#aab6bf'],
  ['tor', 0, 172, 0, 11, 1.8, '#e8f2ff', { eix: 'y', segs: 8, llum: true }],  // jardí flotant
  ['caixa', -38, 173, 0, 36, 3, 50, '#4f6475'],
  ['caixa', 38, 173, 0, 36, 3, 50, '#4f6475'],
];

// Porta de Tian'anmen: base de maó vermell amb cinc arcs i pavelló amb doble ràfec de teules grogues.
const tiananmen = [
  ['caixa', 0, 0, 0, 66, 13, 37, '#a8342b'],
  ['caixa', -22, 0, 0, 5, 9, 38, '#6b1f1a'], ['caixa', -11, 0, 0, 5, 9, 38, '#6b1f1a'], ['caixa', 0, 0, 0, 7, 10, 38, '#6b1f1a'],
  ['caixa', 11, 0, 0, 5, 9, 38, '#6b1f1a'], ['caixa', 22, 0, 0, 5, 9, 38, '#6b1f1a'],
  ['caixa', -62, 0, 0, 60, 9, 12, '#a8342b'], ['caixa', 62, 0, 0, 60, 9, 12, '#a8342b'],   // murs laterals
  ['caixa', 0, 13, 0, 58, 8, 25, '#b33a2e'],
  ['caixa', 0, 21, 0, 70, 1.4, 35, '#d9a521'],                            // primer ràfec
  ['caixa', 0, 22.4, 0, 56, 9, 22, '#b33a2e'],
  ['caixa', 0, 31, 0, 68, 1.6, 33, '#d9a521'],
  ['piramide', 0, 32.6, 0, 66, 6, 4, '#d9a521', { esc: [1, 1, 0.48] }],
  ['caixa', 0, 38, 0, 40, 1.5, 3, '#d9a521'],                             // carener
];

// Torre Perla Oriental: tres potes inclinades, esferes rosades i agulla.
function perla() {
  const p = [], rs = '#d8447f', gr = '#9aa7b3';
  for (let k = 0; k < 3; k++) {
    const a = k * 2 * Math.PI / 3 + 0.5, c = Math.cos(a), s = Math.sin(a);
    p.push(B(c * 38, 0, s * 38, c * 8, 70, s * 8, 6, gr));
    p.push(B(c * 12, 118, s * 12, c * 6, 262, s * 6, 3.4, gr));
  }
  p.push(['esfera', 0, 93, 0, 25, rs, { segs: 12, llum: true }]);        // esfera inferior
  p.push(['cil', 0, 0, 0, 6, 5, 80, 8, '#c9ced4']);
  p.push(['cil', 0, 118, 0, 6, 5, 190, 8, '#c9ced4']);
  p.push(['esfera', 0, 200, 0, 12, rs, { segs: 10, llum: true }]);       // esfera mitjana
  p.push(['esfera', 0, 275, 0, 21, rs, { segs: 12, llum: true }]);       // esfera superior
  p.push(['esfera', 0, 340, 0, 8, rs, { segs: 8, llum: true }]);
  p.push(['cil', 0, 296, 0, 4, 1.2, 172, 6, '#d6dbe0', { llum: true }]); // agulla
  return p;
}

// Torre de Xangai (632 m): capes cilíndriques ahusades amb gir progressiu.
function xangai() {
  const L = [], n = 9, y0 = 12;
  let y = y0, r = 42;
  for (let k = 0; k < n; k++) {
    const h = 62 + (k > 5 ? 0 : 2), r1 = r - (k < 6 ? 3.2 : 2.2);
    L.push([y, h, r, r1, 10, k * 13]); y += h; r = r1;
  }
  const p = capes(L, '#8fb0c6');
  p.push(['cil', 0, 0, 0, 52, 46, 12, 12, '#b9c3cb']);
  p.push(['cil', 0, y, 0, r, r - 2, 12, 10, '#e5f3ff', { llum: true, gir: n * 13 }]);
  p.push(['con', 0, y + 12, 0, 6, 632 - y - 12, 8, '#e5f3ff', { llum: true }]);
  return p;
}

// Torre del Banc de la Xina: quatre prismes triangulars de diferents alçades i dues antenes.
const bancXina = [
  ['prisma', 0, 0, 0, [[0, 0], [-26, 26], [26, 26]], 186, '#c4d0da'],
  ['prisma', 0, 0, 0, [[0, 0], [26, 26], [26, -26]], 252, '#aebdc9'],
  ['prisma', 0, 0, 0, [[0, 0], [26, -26], [-26, -26]], 130, '#bccad5'],
  ['prisma', 0, 0, 0, [[0, 0], [-26, -26], [-26, 26]], 315, '#d4dde5'],
  ['caixa', 0, 0, 0, 7, 315, 7, '#9fb0bf'],
  ['barra', -22, 315, -22, -22, 367, -22, 1.6, '#e8eef3', { llum: true }],
  ['barra', -18, 315, -26, -18, 345, -26, 1.2, '#e8eef3', { llum: true }],
  ['caixa', 0, 0, 0, 70, 12, 70, '#8995a0'],
];

// Seül: turó de Namsan (243 m) amb la torre N Seoul al cim.
const namsan = [
  ['torn', 0, 0, 0, [[0, 0], [760, 0], [600, 40], [430, 95], [270, 150], [150, 200], [60, 234], [28, 240], [0, 243]], 14, '#5d8a48', { esc: [1.25, 1, 0.8], gir: 10 }],
  ['torn', 0, 0, 0, [[0, 150], [150, 150], [120, 205], [60, 234], [28, 240], [0, 243]], 14, '#8a8f7c', { esc: [1.25, 1, 0.8], gir: 10 }],
  ['caixa', 20, 238, -10, 36, 9, 24, '#d4d0c6'],                          // edifici de la base
  ['cil', 0, 240, 0, 6, 4.4, 100, 10, '#c8ccd0'],                         // fust de formigó
  ['torn', 0, 328, 0, [[0, 0], [9, 0], [16, 5], [19, 12], [19, 22], [15, 29], [8, 33], [0, 34]], 12, '#e4e8ec', { llum: true }],  // cabina
  ['cil', 0, 360, 0, 3.8, 3, 40, 8, '#d8dce0'],
  ['cil', 0, 400, 0, 2.6, 0.5, 80, 6, '#e8453c', { llum: true }],         // antena
];
const lotteTower = [
  ['caixa', 0, 0, 0, 150, 18, 90, '#aeb6bd'],                             // podi
  ['torn', 0, 0, 0, [[0, 0], [40, 0], [39, 100], [34, 300], [26, 430], [19, 490], [10, 535], [0, 555]], 16, '#c5d3de'],
  ['torn', 0, 450, 0, [[0, 0], [21, 0], [22, 14], [14, 50], [6, 95], [0, 105]], 12, '#eaf3fb', { llum: true }],
];

// Marina Bay Sands: tres torres inclinades (dues làmines cadascuna) i el SkyPark en forma de vaixell.
function mbs() {
  const p = [['caixa', 0, 0, 0, 260, 12, 90, '#c8c3b6'], ['caixa', 0, 0, 0, 330, 5, 140, '#a9b0b3']];
  for (const x of [-110, 0, 110]) {
    p.push(['caixa', x, 0, -19, 46, 195, 24, '#cfd6da', { rotX: 6 }]);
    p.push(['caixa', x, 0, 19, 46, 195, 24, '#cfd6da', { rotX: -6 }]);
    p.push(['caixa', x, 0, 0, 40, 60, 16, '#bcc4c9']);
  }
  p.push(['prisma', 0, 195, 0, [[-155, -14], [-130, -24], [150, -24], [172, 0], [150, 24], [-130, 24]], 7, '#e4e4de']);   // SkyPark
  p.push(['caixa', 55, 202, 0, 120, 1, 28, '#3a8fb5']);                   // piscina
  p.push(['caixa', -90, 202, 0, 70, 2.5, 20, '#4f8f4a']);                 // jardins
  return p;
}

// Singapore Flyer: roda de 150 m amb càpsules i potes de suport.
function flyer() {
  const p = [], ac = '#c7ccd1', cy = 90, R = 75;
  p.push(['tor', 0, cy, 4, R, 1.3, ac, { segs: 14 }]);
  p.push(['tor', 0, cy, -4, R, 1.3, ac, { segs: 14 }]);
  p.push(['tor', 0, cy, 0, R - 5, 0.7, ac, { segs: 14 }]);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 8, c = Math.cos(a) * R, s = Math.sin(a) * R; p.push(B(-c, cy - s, 0, c, cy + s, 0, 0.9, ac)); }
  for (let k = 0; k < 14; k++) { const a = k * 2 * Math.PI / 14, c = Math.cos(a) * (R + 3), s = Math.sin(a) * (R + 3); p.push(['caixa', c, cy + s - 2.4, 0, 8, 4.8, 5, '#dfe6ea']); }
  p.push(B(0, 0, 32, 0, cy, 3, 3, '#aeb4b9')); p.push(B(0, 0, -32, 0, cy, -3, 3, '#aeb4b9'));
  p.push(['caixa', 0, 0, 38, 70, 14, 24, '#d4d6d2']);
  return p;
}

// Torres Petronas (452 m): vuit capes ahusades per torre, pont aeri i podi.
function petronas() {
  const p = [['caixa', 0, 0, 0, 230, 14, 100, '#a9b1b8'], ['caixa', 0, 0, -45, 120, 24, 60, '#b8c0c6']];
  for (const x of [-86, 86]) {
    const t = capes([[14, 150, 30, 29, 8, 22.5], [164, 90, 27, 24, 8, 22.5], [254, 55, 22, 20, 8, 22.5], [309, 45, 18, 15, 8, 22.5], [354, 30, 13, 9, 8, 22.5]], '#c6ced6');
    for (const q of t) { q[1] += x; }
    p.push(...t);
    p.push(['cil', x, 384, 0, 5, 1, 68, 6, '#e8edf2', { llum: true }]);
    p.push(['esfera', x, 412, 0, 4, '#e8edf2', { segs: 6, llum: true }]);
    p.push(['tor', x, 384, 0, 15, 1.2, '#f5f7f9', { eix: 'y', segs: 8, llum: true }]);
  }
  p.push(['caixa', 0, 160, 0, 120, 9, 14, '#b4bdc5']);                    // pont aeri
  p.push(B(-40, 112, 0, -8, 160, 0, 3.2, '#a9b3bc')); p.push(B(40, 112, 0, 8, 160, 0, 3.2, '#a9b3bc'));
  return p;
}
const torreKL = [
  ['caixa', 0, 0, 0, 40, 10, 30, '#c9c9c4'],
  ['cil', 0, 0, 0, 10, 6.5, 276, 10, '#d7d2c7'],
  ['torn', 0, 276, 0, [[0, 0], [10, 0], [22, 5], [28, 12], [28, 22], [22, 30], [10, 36], [0, 38]], 12, '#c7ccd1', { llum: true }],
  ['torn', 0, 315, 0, [[0, 0], [8, 0], [8, 22], [0, 22]], 8, '#9fb0bf'],
  ['cil', 0, 314, 0, 5.5, 2, 107, 8, '#c8c8c8', { llum: true }],
];

// Wat Arun: prang central de 70 m amb quatre prangs angulars sobre una plataforma de terrasses.
const watArun = (() => {
  const c = '#ece4d3', d = '#d4c9aa', p = [
    ['caixa', 0, 0, 0, 70, 6, 70, '#d8cfba'],
    ['caixa', 0, 6, 0, 40, 10, 40, c],
    ['torn', 0, 16, 0, [[0, 0], [19, 0], [17, 12], [14, 26], [10, 38], [6, 48], [3, 56], [1, 62], [0, 64]], 8, c, { gir: 22.5 }],
    ['caixa', 0, 0, 0, 24, 3, 24, '#c7bca3'],
  ];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.push(['torn', sx * 22, 6, sz * 22, [[0, 0], [6.5, 0], [5.6, 12], [4, 22], [2.4, 30], [1, 36], [0, 38]], 8, d, { gir: 22.5 }]);
  }
  p.push(['caixa', 0, 6, 34, 18, 9, 10, '#c9bfa6']);                       // mondop d'accés
  return p;
})();

// Gran Palau de Bangkok: sala del tron Chakri Maha Prasat, amb tres agulles i teulats ataronjats.
const chakri = (() => {
  const w = '#efe5cd', t = '#c8571f', g = '#d9a840', p = [
    ['caixa', 0, 0, 0, 66, 18, 24, w],
    ['caixa', 0, 0, 0, 20, 26, 30, w],
    ['caixa', -27, 0, 0, 14, 24, 28, w], ['caixa', 27, 0, 0, 14, 24, 28, w],
    ['piramide', 0, 18, 0, 70, 9, 4, t, { esc: [1, 1, 0.42] }],
    ['piramide', -27, 24, 0, 16, 8, 4, t], ['piramide', 27, 24, 0, 16, 8, 4, t],
    ['torn', 0, 24, 0, [[0, 0], [9, 0], [8, 10], [6, 18], [4.5, 26], [3, 32], [1.5, 38], [0, 42]], 8, g, { gir: 22.5, llum: true }],
    ['torn', -27, 32, 0, [[0, 0], [5.5, 0], [4.5, 8], [3, 16], [1.5, 22], [0, 26]], 8, g, { gir: 22.5 }],
    ['torn', 27, 32, 0, [[0, 0], [5.5, 0], [4.5, 8], [3, 16], [1.5, 22], [0, 26]], 8, g, { gir: 22.5 }],
    ['caixa', 0, 0, -20, 62, 3, 12, '#cfc6b0'],                          // terrassa davantera
  ];
  return p;
})();

// Porta de l'Índia (Delhi): arc de triomf d'arenisca amb pedestal i jardí hexagonal.
const indiaGate = [
  ['cil', 0, 0, 0, 52, 52, 0.3, 6, '#5f8f4b'],
  ['caixa', 0, 0, 0, 36, 3, 24, '#b98a62'],
  ['arc', 0, 3, 0, 22, 39, 6, 9, '#c9946a'],
  ['caixa', 0, 38, 0, 24, 4, 11, '#c9946a'],
  ['caixa', 0, 42, 0, 26, 1.2, 12, '#a87850'],
  ['caixa', 0, 3, 0, 10, 0.6, 9.5, '#2c2a28', { gir: 0 }],
];
const qutb = (() => {
  const r = '#b4502f', r2 = '#c46a3f', p = [
    ['cil', 0, 0, 0, 12, 11, 1.5, 12, '#a8a398'],
    ['cil', 0, 1.5, 0, 7.2, 5.8, 27, 12, r],
    ['cil', 0, 28, 0, 8, 8, 1.2, 12, '#9c4a2a'],
    ['cil', 0, 29, 0, 5.6, 4.5, 21, 12, r2],
    ['cil', 0, 49.5, 0, 6.4, 6.4, 1.1, 12, '#9c4a2a'],
    ['cil', 0, 50.5, 0, 4.4, 3.8, 12.5, 12, r],
    ['cil', 0, 62.5, 0, 5, 5, 1, 12, '#9c4a2a'],
    ['cil', 0, 63.5, 0, 3.6, 3.2, 6, 12, '#d8d2c0'],
    ['cil', 0, 69, 0, 4, 4, 0.8, 12, '#9c4a2a'],
    ['cil', 0, 69.8, 0, 2.7, 2.2, 2.7, 12, '#d8d2c0'],
    ['cupula', 0, 72.5, 0, 2.2, 1.6, '#d8d2c0', { segs: 8 }],
  ];
  return p;
})();

// Porta de l'Índia de Bombai: arc de basalt groc amb quatre torretes; l'arc mira al port (est).
const gateway = [
  ['caixa', 0, 0, 0, 44, 1.2, 40, '#b8ab8c'],
  ['arc', 0, 1.2, 0, 28, 24, 7, 15, '#c9a35c'],
  ['cupula', 0, 25.2, 0, 7.5, 6, '#b58f4a', { segs: 10 }],
  ['caixa', 0, 25.2, 0, 28, 1.2, 15, '#b58f4a'],
  ['cil', -12, 1.2, -6, 2.4, 2, 27.5, 8, '#c9a35c'], ['cil', 12, 1.2, -6, 2.4, 2, 27.5, 8, '#c9a35c'],
  ['cil', -12, 1.2, 6, 2.4, 2, 27.5, 8, '#c9a35c'], ['cil', 12, 1.2, 6, 2.4, 2, 27.5, 8, '#c9a35c'],
  ['cupula', -12, 28.7, -6, 3, 2.5, '#b58f4a', { segs: 8 }], ['cupula', 12, 28.7, -6, 3, 2.5, '#b58f4a', { segs: 8 }],
  ['cupula', -12, 28.7, 6, 3, 2.5, '#b58f4a', { segs: 8 }], ['cupula', 12, 28.7, 6, 3, 2.5, '#b58f4a', { segs: 8 }],
];

// Estació Chhatrapati Shivaji: edifici victorià en U amb la gran cúpula octogonal central.
const cst = [
  ['caixa', 0, 0, 0, 90, 24, 36, '#cdae72'],
  ['caixa', -80, 0, 8, 70, 20, 26, '#c4a56a'], ['caixa', 80, 0, 8, 70, 20, 26, '#c4a56a'],
  ['caixa', -108, 0, -26, 30, 24, 40, '#cdae72'], ['caixa', 108, 0, -26, 30, 24, 40, '#cdae72'],
  ['cil', 0, 24, 0, 13, 12, 12, 8, '#d6b87e', { gir: 22.5 }],
  ['torn', 0, 36, 0, [[0, 0], [12, 0], [11, 6], [8.5, 18], [5, 26], [2.5, 31], [0, 35]], 8, '#d9c08c', { gir: 22.5 }],
  ['con', -108, 24, -26, 5, 11, 8, '#b59a62'], ['con', 108, 24, -26, 5, 11, 8, '#b59a62'],
  ['con', -45, 24, -14, 3.5, 9, 6, '#b59a62'], ['con', 45, 24, -14, 3.5, 9, 6, '#b59a62'],
  ['caixa', 0, 0, 40, 220, 1.2, 40, '#a8a090'],
  ['caixa', 0, 0, 80, 150, 6, 60, '#9aa2a6'],                              // andanes cobertes
];

// Taipei 101: vuit mòduls "ruyi" evasats, corona i agulla.
function taipei101() {
  const L = [[0, 45, 36, 33, 4, 45]];
  for (let k = 0; k < 8; k++) L.push([45 + 44 * k, 44, 33, 41, 4, 45]);
  const p = capes(L, '#79b7c4');
  p.push(['caixa', 0, 0, 0, 120, 14, 90, '#a5adb3']);
  for (let k = 0; k < 8; k++) p.push(['cil', 0, 45 + 44 * k - 1, 0, 33.5, 33.5, 3, 4, '#e0c36c', { gir: 45, llum: true }]);
  p.push(['cil', 0, 397, 0, 30, 22, 50, 4, '#8fc3cf', { gir: 45 }]);
  p.push(['cil', 0, 447, 0, 8, 2.5, 61, 6, '#e8e8ec', { llum: true }]);
  return p;
}

// Memorial de Chiang Kai-shek: sala blanca octogonal amb teulada blava sobre terrasses.
const chiang = [
  ['caixa', 0, 0, 0, 120, 6, 120, '#ece9e2'],
  ['caixa', 0, 6, 0, 96, 8, 96, '#f1eee8'],
  ['caixa', 0, 14, 0, 76, 10, 76, '#f6f4ee'],
  ['cil', 0, 24, 0, 33, 32, 20, 8, '#f8f6f0', { gir: 22.5 }],
  ['cil', 0, 44, 0, 38, 30, 4, 8, '#2860b0', { gir: 22.5 }],
  ['cil', 0, 48, 0, 30, 28, 12, 8, '#f4f1ea', { gir: 22.5 }],
  ['cil', 0, 60, 0, 34, 20, 5, 8, '#2860b0', { gir: 22.5 }],
  ['cil', 0, 65, 0, 20, 7, 8, 8, '#2860b0', { gir: 22.5 }],
  ['con', 0, 73, 0, 7, 8, 8, '#e0b43c', { llum: true }],
];

// Òpera de Sydney: dos grups de petxines (sala de concerts i teatre d'òpera) sobre un podi.
const opera = [
  ['caixa', 0, 0, 0, 120, 12, 183, '#c9b99a'],
  ['caixa', 0, 12, 20, 90, 3, 130, '#d8ccb2'],
  // Sala de concerts (oest)
  ['cupula', -22, 12, -45, 20, 40, '#f6f1e4', { esc: [1.1, 1, 1.55], rotX: 14, segs: 10 }],
  ['cupula', -22, 12, -5, 22, 55, '#f6f1e4', { esc: [1.0, 1, 1.6], rotX: 14, segs: 10 }],
  ['cupula', -22, 12, 38, 20, 40, '#f6f1e4', { esc: [1.0, 1, 1.3], rotX: 14, segs: 10 }],
  ['cupula', -22, 12, 70, 14, 22, '#f6f1e4', { esc: [1.0, 1, 1.1], rotX: 12, segs: 8 }],
  // Teatre d'òpera (est)
  ['cupula', 28, 12, -35, 18, 35, '#eee8d6', { esc: [1.0, 1, 1.5], rotX: 14, segs: 10 }],
  ['cupula', 28, 12, 0, 20, 45, '#eee8d6', { esc: [1.0, 1, 1.5], rotX: 14, segs: 10 }],
  ['cupula', 28, 12, 35, 18, 30, '#eee8d6', { esc: [1.0, 1, 1.3], rotX: 12, segs: 10 }],
  ['cupula', 0, 12, -80, 12, 14, '#f4efe2', { esc: [1.5, 1, 1.4], rotX: 10, segs: 8 }],   // restaurant
];

// Pont del Port de Sydney: arc de dues cordes, tauler de 49 m a 49 m d'alçada, pilons de granit.
function pontSydney() {
  const p = [], s = '#8a959b', M = 251, N = 14, Rr = 317, cy = -183;
  const sup = z => cy + Math.sqrt(Rr * Rr - z * z);
  const inf = z => 10 + 106 * (1 - (z / M) ** 2);
  for (const x of [-15, 15]) {
    for (let k = 0; k < N; k++) {
      const z1 = -M + 2 * M * k / N, z2 = -M + 2 * M * (k + 1) / N;
      p.push(B(x, sup(z1), z1, x, sup(z2), z2, 5, s));
      p.push(B(x, inf(z1), z1, x, inf(z2), z2, 3.5, s));
    }
    for (let k = 1; k < N; k++) {
      const z = -M + 2 * M * k / N, ym = (sup(z) + inf(z)) / 2;
      if (Math.abs(ym - 50) > 2) p.push(B(x, 50, z, x, ym, z, 2.2, s));
      p.push(B(x, inf(z), z, x, sup(z), z, 1.6, s));
    }
  }
  p.push(['caixa', 0, 47, 0, 49, 4, 1000, '#5f6a70']);
  for (const x of [-22, 22]) for (const z of [-M, M]) p.push(['caixa', x, 0, z, 16, 89, 16, '#9a8b78']);
  return p;
}

// Estació de Flinders Street: façana groga de 200 m amb cúpula verda i naus ferroviàries al darrere.
const flinders = [
  ['caixa', 0, 0, 0, 200, 18, 22, '#d8b265'],
  ['caixa', 0, 18, 0, 200, 2, 24, '#b99a55'],
  ['caixa', -82, 18, 0, 36, 10, 20, '#d2ab5e'], ['caixa', 82, 18, 0, 36, 10, 20, '#d2ab5e'],
  ['cil', 95, 20, 0, 12, 10, 14, 10, '#d8b265'],
  ['torn', 95, 34, 0, [[0, 0], [11, 0], [10, 6], [7, 14], [3.5, 20], [1, 24], [0, 28]], 10, '#5e8f7a'],
  ['caixa', -30, 18, 0, 8, 24, 8, '#d8b265'],                              // torre dels rellotges
  ['piramide', -30, 42, 0, 9, 8, 4, '#5e8f7a'],
  ['caixa', 0, 0, -62, 200, 10, 100, '#8f989c'],                            // andanes
  ['caixa', 0, 10, -62, 190, 2, 96, '#a9b2b6'],
];

// Melbourne Cricket Ground: graderia el·líptica amb sis torres de llum.
function mcg() {
  const p = [
    ['bol', 0, 0, 0, 150, 130, 40, 55, 28, '#aab1b6'],
    ['bol', 0, 2, 0, 134, 114, 34, 40, 28, '#3b5f87'],
    ['caixa', 0, 0, 0, 160, 0.6, 140, '#4f9a45'],
    ['tor', 0, 42, 0, 142, 2.5, '#e6e9ec', { eix: 'y', esc: [1, 1, 0.87], segs: 14 }],
  ];
  for (const [a, b] of [[0.5, 1], [2.6, 1], [3.7, 1], [5.8, 1]].concat([[1.57, 1], [4.71, 1]])) {
    const x = Math.cos(a) * 135, z = Math.sin(a) * 115;
    p.push(['cil', x, 0, z, 1.4, 1.0, 75, 6, '#c8ccd0']);
    p.push(['caixa', x, 75, z, 12, 5, 3, '#f6f2dc', { llum: true, gir: a * 57 }]);
  }
  return p;
}

// Torre de Tòquio... Skytree
function skytree() {
  const a = '#dbe7ee';
  return [
    ['cil', 0, 0, 0, 40, 25, 140, 3, a],
    ['cil', 0, 140, 0, 25, 13, 170, 6, a],
    ['cil', 0, 310, 0, 13, 11, 30, 12, a],
    ['torn', 0, 340, 0, [[0, 0], [10, 0], [18, 5], [18, 25], [10, 32], [0, 32]], 12, '#c4dcec', { llum: true }],
    ['cil', 0, 372, 0, 11, 8, 68, 12, a],
    ['torn', 0, 440, 0, [[0, 0], [9, 0], [14, 4], [14, 12], [9, 16], [0, 16]], 12, '#c4dcec', { llum: true }],
    ['cil', 0, 456, 0, 6, 1, 178, 8, '#e6eef3', { llum: true }],
  ];
}

// Castell d'Osaka: torre de l'homenatge de cinc teulades verdes sobre una base de pedra.
function osaka() {
  const p = [['caixa', 0, 0, 0, 90, 3, 80, '#9c9a90'], ['caixa', 0, 3, 0, 58, 11, 52, '#8a877c']];
  const nivells = [[40, 10, 36], [34, 9, 30], [28, 8, 25], [23, 8, 20], [16, 8, 14]];
  let y = 14;
  nivells.forEach(([w, h, d], k) => {
    p.push(['caixa', 0, y, 0, w, h, d, k === 3 ? '#2d2a28' : '#f2efe6']);
    p.push(['caixa', 0, y + h - 0.2, 0, w + 6, 1.4, d + 6, '#4f8f78']);
    p.push(['piramide', 0, y + h + 1.2, 0, w + 4, 3.2, 4, '#4f8f78', { esc: [1, 1, (d + 4) / (w + 4)] }]);
    y += h + 3.5;
  });
  p.push(['caixa', 0, y - 3.5, 0, 14, 3.5, 12, '#c9a63a', { llum: true }]);
  p.push(['piramide', 0, y, 0, 18, 6, 4, '#4f8f78', { esc: [1, 1, 0.8] }]);
  return p;
}

// Niu d'ocell: estadi nacional de Pequín amb entramat d'acer.
const niuOcell = (() => {
  const p = [
    ['bol', 0, 0, 0, 148, 166, 69, 60, 28, '#a3a7ab'],
    ['bol', 0, 2, 0, 110, 128, 44, 40, 28, '#b8352e'],
    ['caixa', 0, 0, 0, 105, 0.8, 120, '#4f9a45'],
  ];
  for (const [y, k] of [[14, 0.97], [30, 1.0], [46, 1.0], [62, 0.88]]) p.push(['tor', 0, y, 0, 146 * k - (y > 40 ? (y - 40) * 0.4 : 0), 2.2, '#8d9296', { eix: 'y', esc: [1, 1, 1.12], segs: 14 }]);
  p.push(['tor', 0, 68, 0, 128, 3, '#d9dcde', { eix: 'y', esc: [1, 1, 1.12], segs: 14 }]);
  return p;
})();

export const CIUTATS = [
  { ciutat: 'Tòquio', pais: 'JP', monuments: [
    { nom: 'Tokyo Skytree', lat: 35.71006, lon: 139.81070, rumb: 0, peces: skytree() },
    { nom: 'Torre de Tòquio', lat: 35.65858, lon: 139.74544, rumb: 0, peces: torreTokyo() },
  ] },
  { ciutat: 'Osaka', pais: 'JP', monuments: [
    { nom: "Castell d'Osaka", lat: 34.68730, lon: 135.52590, rumb: 0, peces: osaka() },
    { nom: 'Umeda Sky Building', lat: 34.70525, lon: 135.49049, rumb: 0, peces: umeda },
  ] },
  { ciutat: 'Pequín', pais: 'CN', monuments: [
    // Alineat amb la imatgeria Esri (desplaçada a la Xina).
    { nom: "Porta de Tian'anmen", lat: 39.90705, lon: 116.39133, rumb: 0, peces: tiananmen },
    // Alineat amb la imatgeria Esri (desplaçada a la Xina).
    { nom: "Estadi Nacional (Niu d'ocell)", lat: 39.99128, lon: 116.39040, rumb: 0, peces: niuOcell },
  ] },
  { ciutat: 'Xangai', pais: 'CN', monuments: [
    // Alineat amb la imatgeria Esri (desplaçada a la Xina).
    { nom: 'Torre Perla Oriental', lat: 31.24170, lon: 121.49450, rumb: 0, peces: perla() },
    // Alineat amb la imatgeria Esri (desplaçada a la Xina).
    { nom: 'Torre de Xangai', lat: 31.23610, lon: 121.49780, rumb: 0, peces: xangai() },
  ] },
  { ciutat: 'Hong Kong', pais: 'HK', monuments: [
    { nom: 'Torre del Banc de la Xina', lat: 22.27930, lon: 114.16160, rumb: 0, peces: bancXina },
    { nom: 'International Commerce Centre', lat: 22.30352, lon: 114.16018, rumb: 0, peces: [
      ['caixa', 0, 0, 0, 130, 14, 90, '#8d9aa5'],
      ['cil', 0, 0, 0, 42, 33, 420, 4, '#4a6f8f', { gir: 45 }],
      ['cil', 0, 420, 0, 30, 20, 64, 4, '#7ea3c2', { gir: 45, llum: true }],
      ['cil', 0, 484, 0, 3, 1, 20, 4, '#e8eef3', { llum: true }],
    ] },
  ] },
  { ciutat: 'Seül', pais: 'KR', monuments: [
    { nom: 'N Seoul Tower (turó de Namsan)', lat: 37.55122, lon: 126.98818, rumb: 0, peces: namsan },
    { nom: 'Lotte World Tower', lat: 37.51257, lon: 127.10256, rumb: 0, peces: lotteTower },
  ] },
  { ciutat: 'Singapur', pais: 'SG', monuments: [
    { nom: 'Marina Bay Sands', lat: 1.28350, lon: 103.86080, rumb: 290, peces: mbs() },
    { nom: 'Singapore Flyer', lat: 1.28931, lon: 103.86315, rumb: 0, peces: flyer() },
  ] },
  { ciutat: 'Kuala Lumpur', pais: 'MY', monuments: [
    { nom: 'Torres Petronas', lat: 3.15800, lon: 101.71191, rumb: 0, peces: petronas() },
    { nom: 'Torre de Kuala Lumpur', lat: 3.15285, lon: 101.70372, rumb: 0, peces: torreKL },
  ] },
  { ciutat: 'Bangkok', pais: 'TH', monuments: [
    { nom: 'Wat Arun', lat: 13.74375, lon: 100.48892, rumb: 0, peces: watArun },
    { nom: 'Gran Palau (Chakri Maha Prasat)', lat: 13.75012, lon: 100.49200, rumb: 90, peces: chakri },
  ] },
  { ciutat: 'Delhi', pais: 'IN', monuments: [
    { nom: "Porta de l'Índia", lat: 28.61291, lon: 77.22951, rumb: 90, peces: indiaGate },
    { nom: 'Qutb Minar', lat: 28.52450, lon: 77.18550, rumb: 0, peces: qutb },
  ] },
  { ciutat: 'Bombai', pais: 'IN', monuments: [
    { nom: "Porta de l'Índia de Bombai", lat: 18.92200, lon: 72.83466, rumb: 90, peces: gateway },
    { nom: 'Estació Chhatrapati Shivaji', lat: 18.94018, lon: 72.83555, rumb: 0, peces: cst },
  ] },
  { ciutat: 'Taipei', pais: 'TW', monuments: [
    { nom: 'Taipei 101', lat: 25.03385, lon: 121.56495, rumb: 0, peces: taipei101() },
    { nom: 'Memorial de Chiang Kai-shek', lat: 25.03605, lon: 121.52185, rumb: 0, peces: chiang },
  ] },
  { ciutat: 'Sydney', pais: 'AU', monuments: [
    { nom: 'Òpera de Sydney', lat: -33.85706, lon: 151.21500, rumb: 0, peces: opera },
    { nom: 'Pont del Port de Sydney', lat: -33.85190, lon: 151.21070, rumb: 26, peces: pontSydney() },
  ] },
  { ciutat: 'Melbourne', pais: 'AU', monuments: [
    { nom: 'Estació de Flinders Street', lat: -37.81830, lon: 144.96621, rumb: 352, peces: flinders },
    { nom: 'Melbourne Cricket Ground', lat: -37.81996, lon: 144.98340, rumb: 0, peces: mcg() },
  ] },
];
