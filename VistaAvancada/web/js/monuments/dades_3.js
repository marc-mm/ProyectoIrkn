// Monuments d'Amèrica (Nova York, Washington, Chicago, San Francisco, Los Angeles, Seattle, Toronto, Ciutat de Mèxic,
// Rio de Janeiro, São Paulo, Buenos Aires). Format de les peces a ../monuments_geo.js.
// Cada monument: nom, lat, lon (centre), rumb (graus, sentit horari; 0 = el +z del model apunta al nord), peces en metres.

// Estrella de n puntes (radi exterior R, interior r) com a llista de punts [x, z] per a 'prisma'.
function estrella(n, R, r) {
  const pts = [];
  for (let i = 0; i < 2 * n; i++) {
    const a = Math.PI * i / n, q = i % 2 ? r : R;
    pts.push([+(q * Math.sin(a)).toFixed(2), +(q * Math.cos(a)).toFixed(2)]);
  }
  return pts;
}

// Golden Gate: eix del pont al llarg de z. Torres a z = ±640 (227 m), calçada a 67 m, vans laterals de 343 m.
function golden() {
  const p = [];
  const R = '#c0391b', yT = 227, yD = 67, zT = 640, zE = 983, zF = 1060;
  p.push(['caixa', 0, 60, 0, 27, 7, 2 * zF, '#b5341a']);                        // calçada (reixat)
  p.push(['caixa', 0, 67, 0, 27, 0.4, 2 * zF, '#4a4a4c']);                       // asfalt
  for (const s of [-1, 1]) {
    // torres: dues potes amb travessers
    for (const x of [-13.7, 13.7]) p.push(['caixa', x * 1, 0, s * zT, 5.5, yT, 9.5, R]);
    for (const y of [75, 110, 148, 185, 217]) p.push(['caixa', 0, y, s * zT, 22, 7, 7, R]);
    p.push(['caixa', 0, yT, s * zT, 33, 2, 10, R]);
    // pilars dels accessos
    for (let z = zE; z <= zF - 10; z += 55) p.push(['caixa', 0, 0, s * z, 9, 62, 6, '#a8452c']);
  }
  const cable = (z) => {                       // alçada del cable
    const a = Math.abs(z);
    if (a <= zT) return 78 + (yT - 78) * Math.pow(a / zT, 2);
    return yT - (yT - 75) * (a - zT) / (zE - zT);
  };
  for (const x of [-13.7, 13.7]) {
    for (let z = -zE; z < zE - 1; ) {
      const dz = Math.abs(z) < zT - 1 && z + 80 > zT ? zT - z : (z < -zT - 1 && z + 80 > -zT ? -zT - z : 80);
      const zn = Math.min(z + (Math.abs(z) < zT ? 80 : 86), zE);
      let z2 = zn;
      if (z < -zT && zn > -zT) z2 = -zT;
      if (z < zT && zn > zT) z2 = zT;
      p.push(['barra', x, cable(z), z, x, cable(z2), z2, 2.4, '#a8301a']);
      z = z2;
      void dz;
    }
    // tirants
    for (let z = -zE + 48; z < zE - 20; z += 64) {
      if (Math.abs(Math.abs(z) - zT) < 30) continue;
      p.push(['barra', x, yD + 3, z, x, cable(z), z, 0.9, '#a8301a']);
    }
  }
  return p;
}

// Edifici Copan: planta en S (corba sinusoïdal) i línies horitzontals de formigó.
function copan() {
  const pts = [], inf = [];
  for (let i = 0; i <= 10; i++) {
    const x = -72 + 14.4 * i, z = -19 * Math.sin(Math.PI * x / 72);
    pts.push([+x.toFixed(1), +(z + 11).toFixed(1)]);
    inf.push([+x.toFixed(1), +(z - 11).toFixed(1)]);
  }
  const planta = pts.concat(inf.reverse());
  const ampla = planta.map(([x, z]) => [x, z + (z > 0 ? 0.0 : 0)]);
  const p = [['prisma', 0, 0, 0, planta, 115, '#cbc5b8']];
  for (let y = 8; y < 115; y += 9.5) p.push(['prisma', 0, y, 0, ampla.map(([x, z]) => [x * 1.003, z * 1.06]), 1.2, '#f2efe8']);
  p.push(['prisma', 0, 115, 0, planta, 1.5, '#9a958c']);
  return p;
}

// Hancock Center: tronc de piràmide rectangular per graons i ics diagonals.
function hancock() {
  const p = [], N = 14, H = 344;
  const hx = (y) => 40 - 15.5 * y / H, hz = (y) => 25 - 9.6 * y / H;
  for (let i = 0; i < N; i++) {
    const y0 = H * i / N;
    p.push(['caixa', 0, y0, 0, 2 * hx(y0), H / N + 0.2, 2 * hz(y0), '#26272b']);
  }
  const cantonada = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  void cantonada;
  for (let k = 0; k < 4; k++) {
    const y0 = 8 + k * 83, y1 = y0 + 83;
    for (const s of [-1, 1]) {
      // cares llargues (z = ±) i curtes (x = ±)
      p.push(['barra', -hx(y0), y0, s * (hz(y0) + 0.4), hx(y1), y1, s * (hz(y1) + 0.4), 1.8, '#0e0e10']);
      p.push(['barra', hx(y0), y0, s * (hz(y0) + 0.4), -hx(y1), y1, s * (hz(y1) + 0.4), 1.8, '#0e0e10']);
      p.push(['barra', s * (hx(y0) + 0.4), y0, -hz(y0), s * (hx(y1) + 0.4), y1, hz(y1), 1.8, '#0e0e10']);
      p.push(['barra', s * (hx(y0) + 0.4), y0, hz(y0), s * (hx(y1) + 0.4), y1, -hz(y1), 1.8, '#0e0e10']);
    }
  }
  p.push(['caixa', 0, H, 0, 2 * hx(H), 3, 2 * hz(H), '#d8d8d8', { llum: true }]);
  for (const s of [-1, 1]) p.push(['cil', s * 9, H + 3, 0, 1.6, 0.6, 108, 6, '#cfcfcf', { llum: s > 0 }]);
  return p;
}

export const CIUTATS = [
  {
    ciutat: 'Nova York', pais: 'US',
    monuments: [
      {
        // Fort Wood (estrella d'11 puntes), pedestal i estàtua (93 m fins a la torxa). Mira al sud-est.
        nom: 'Estàtua de la Llibertat', lat: 40.68925, lon: -74.04450, rumb: 315,
        peces: [
          ['prisma', 0, 0, 0, estrella(11, 58, 42), 6, '#a99b86'],                     // Fort Wood
          ['caixa', 0, 6, 0, 40, 14, 40, '#b8ad9a'],                                   // base de formigó
          ['cil', 0, 20, 0, 14.5, 11, 27, 4, '#d6cfc0', { gir: 45 }],                    // pedestal
          ['caixa', 0, 47, 0, 14, 1, 14, '#cfc8b8'],
          ['torn', 0, 48, 0, [[0, 0], [5.5, 0], [5.2, 8], [4.2, 18], [3.4, 26], [2.4, 30], [0, 31]], 9, '#6fb59b'],  // túnica
          ['esfera', 0, 80.5, 0, 2.3, '#74bba2'],                                      // cap
          ...[0, 1, 2, 3, 4, 5, 6].map(i => {                                          // corona
            const a = (-60 + i * 20) * Math.PI / 180;
            return ['barra', 2.2 * Math.sin(a) * 0.6, 81.5, -2.2 * Math.cos(a) * 0.6, 7 * Math.sin(a), 82 + 3.5 * Math.cos(a * 0.5), -7 * Math.cos(a), 0.9, '#79c4a8'];
          }),
          ['barra', 3, 74, 0, 6, 91, 0, 1.8, '#6fb59b'],                               // braç de la torxa
          ['cil', 6, 89, 0, 1.2, 1.9, 3, 6, '#d9b24a'],
          ['con', 6, 92, 0, 1.7, 5, 6, '#ffd24a', { llum: true }],                     // flama
          ['caixa', -4.5, 70, -1.5, 3.5, 6, 1.2, '#6fb59b', { rotZ: -12 }],           // tauleta
        ],
      },
      {
        // Torre esglaonada (381 m + antena fins a 443 m). Façana llarga sobre els carrers transversals (graella a 29°).
        nom: 'Empire State Building', lat: 40.74844, lon: -73.98566, rumb: 29,
        peces: [
          ['caixa', 0, 0, 0, 129, 30, 57, '#c9c3b4'],
          ['caixa', 0, 30, 0, 100, 75, 46, '#cdc7b8'],
          ['caixa', 0, 105, 0, 68, 100, 36, '#cdc7b8'],
          ['caixa', 0, 205, 0, 50, 70, 28, '#d2ccbd'],
          ['caixa', 0, 275, 0, 34, 45, 22, '#d6d0c2', { llum: true }],
          ['cil', 0, 320, 0, 13, 11, 4, 8, '#c5bfb0'],
          ['cil', 0, 324, 0, 9, 4.5, 57, 8, '#e4e0d4', { llum: true }],                  // corona
          ['cil', 0, 381, 0, 3, 1.2, 62, 6, '#e8e8ee', { llum: true }],                   // antena
        ],
      },
    ],
  },
  {
    ciutat: 'Washington', pais: 'US',
    monuments: [
      {
        // Edifici amb ales nord (Senat) i sud (Cambra) i cúpula central (88 m). Façana est (+x).
        nom: 'Capitoli dels Estats Units', lat: 38.88997, lon: -77.00906, rumb: 0,
        peces: [
          ['caixa', 0, 0, 0, 90, 24, 55, '#e8e5de'],
          ['caixa', 0, 0, 36, 62, 22, 30, '#e3e0d8'],
          ['caixa', 0, 0, -36, 62, 22, 30, '#e3e0d8'],
          ['caixa', 0, 0, 78, 100, 22, 72, '#e8e5de'],
          ['caixa', 0, 0, -78, 100, 22, 72, '#e8e5de'],
          ['caixa', 0, 22, 78, 98, 1.5, 70, '#8f8d88'],
          ['caixa', 0, 22, -78, 98, 1.5, 70, '#8f8d88'],
          ['caixa', 53, 0, 0, 16, 18, 56, '#efece6'],                                  // pòrtic est
          ['caixa', 62, 0, 0, 8, 3, 60, '#d7d3cb'],
          ['caixa', -53, 0, 0, 14, 18, 50, '#efece6'],                                  // pòrtic oest
          ['torn', 0, 24, 0, [[0, 0], [21, 0], [21, 12], [17, 14], [16.5, 28], [12, 40], [7, 50], [4.5, 54], [3.2, 56], [3.2, 60], [0, 64]], 14, '#f3f1ec'],
          ['cil', 0, 24, 0, 22.5, 22.5, 3, 14, '#dcd8cf'],
          ['esfera', 0, 83, 0, 2.2, '#e6e2d4', { llum: true }],                         // estàtua de la Llibertat
        ],
      },
      {
        // Obelisc de marbre de 169 m amb base de 16,8 m.
        nom: 'Monument a Washington', lat: 38.88945, lon: -77.03524, rumb: 0,
        peces: [
          ['caixa', 0, 0, 0, 28, 1.5, 28, '#cfcabd'],
          ['cil', 0, 1.5, 0, 11.9, 7.35, 151, 4, '#efebe2', { gir: 45 }],
          ['piramide', 0, 152.4, 0, 10.4, 16.9, 4, '#f2eee6'],
          ['esfera', 0, 168.5, 0, 1.2, '#ff3a2e', { llum: true }],
        ],
      },
    ],
  },
  {
    ciutat: 'Chicago', pais: 'US',
    monuments: [
      {
        // Nou tubs de 22,9 m de costat amb alçades escalonades; dues antenes (527 m).
        nom: 'Willis Tower', lat: 41.87887, lon: -87.63591, rumb: 0,
        peces: [
          ['caixa', -22.9, 0, 22.9, 22.9, 442, 22.9, '#2b2b30'],
          ['caixa', 0, 0, 22.9, 22.9, 300, 22.9, '#2f2f35'],
          ['caixa', 22.9, 0, 22.9, 22.9, 370, 22.9, '#2b2b30'],
          ['caixa', -22.9, 0, 0, 22.9, 230, 22.9, '#303036'],
          ['caixa', 0, 0, 0, 22.9, 370, 22.9, '#2b2b30'],
          ['caixa', 22.9, 0, 0, 22.9, 300, 22.9, '#303036'],
          ['caixa', -22.9, 0, -22.9, 22.9, 370, 22.9, '#2b2b30'],
          ['caixa', 0, 0, -22.9, 22.9, 230, 22.9, '#303036'],
          ['caixa', 22.9, 0, -22.9, 22.9, 442, 22.9, '#2b2b30'],
          ['caixa', -22.9, 438, 22.9, 22.9, 4, 22.9, '#d9d9e0', { llum: true }],
          ['caixa', 22.9, 438, -22.9, 22.9, 4, 22.9, '#d9d9e0', { llum: true }],
          ['cil', -22.9, 442, 22.9, 1.6, 0.6, 85, 6, '#d0d0d0', { llum: true }],
          ['cil', 22.9, 442, -22.9, 1.6, 0.6, 85, 6, '#d0d0d0', { llum: true }],
        ],
      },
      {
        // 875 North Michigan Avenue: tronc de piràmide amb ics estructurals (344 m) i dues antenes.
        nom: '875 North Michigan Avenue', lat: 41.89889, lon: -87.62306, rumb: 0,
        peces: hancock(),
      },
    ],
  },
  {
    ciutat: 'San Francisco', pais: 'US',
    monuments: [
      {
        // Pont complet: eix al llarg de z (rumb cap al NNO), torres de 227 m i cables principals.
        nom: 'Pont Golden Gate', lat: 37.82000, lon: -122.47836, rumb: 356,
        peces: golden(),
      },
      {
        // Piràmide de 212 m amb agulla (260 m) i dues ales laterals (est i oest).
        nom: 'Transamerica Pyramid', lat: 37.79519, lon: -122.40279, rumb: 10,
        peces: [
          ['cil', 0, 0, 0, 37.5, 9.9, 212, 4, '#eceeee', { gir: 45 }],
          ['caixa', 18, 110, 0, 8, 80, 16, '#e4e6e6'],
          ['caixa', -18, 110, 0, 8, 80, 16, '#e4e6e6'],
          ['piramide', 0, 212, 0, 8, 48, 4, '#f4f6f6', { llum: true }],
        ],
      },
    ],
  },
  {
    ciutat: 'Los Angeles', pais: 'US',
    monuments: [
      {
        // Turó (Mount Hollywood, 346 m a l'observatori) amb l'edifici i les tres cúpules de coure.
        nom: 'Observatori Griffith', lat: 34.11860, lon: -118.30040, rumb: 0,
        peces: [
          ['cil', 0, 0, 0, 750, 330, 150, 10, '#8b8a55'],
          ['cil', 0, 150, 0, 330, 120, 196, 10, '#7b7c4c'],
          ['cil', 0, 0, 800, 600, 60, 480, 9, '#74794a'],
          ['caixa', 0, 346, -6, 150, 2, 40, '#cfc9b8'],                                 // terrassa
          ['caixa', 0, 348, 0, 40, 18, 28, '#ece8dc'],
          ['caixa', -42.5, 348, 0, 45, 12, 22, '#ece8dc'],
          ['caixa', 42.5, 348, 0, 45, 12, 22, '#ece8dc'],
          ['cupula', 0, 366, 0, 11, 11, '#6fa08a'],
          ['cupula', -62, 360, 0, 7, 8, '#6fa08a'],
          ['cupula', 62, 360, 0, 7, 8, '#6fa08a'],
          ['caixa', 0, 348, -20, 50, 4, 8, '#e0dccf'],
          ['caixa', 0, 348, -28, 12, 20, 3, '#f0ecdf'],                                 // monument als astrònoms
        ],
      },
      {
        // Veles d'acer inoxidable irregulars sobre un basament.
        nom: 'Walt Disney Concert Hall', lat: 34.05535, lon: -118.24984, rumb: 36,
        peces: [
          ['caixa', 0, 0, 0, 100, 8, 66, '#cfd0d0'],
          ['caixa', 0, 8, 0, 36, 24, 52, '#a9783f'],
          ['caixa', -28, 8, 10, 30, 18, 30, '#d5d8da', { gir: 8 }],
          ['caixa', 28, 8, -8, 30, 20, 34, '#c9ced1', { gir: -10 }],
          ['caixa', 0, 20, -34, 52, 24, 3, '#dcdfe1', { rotX: -14, gir: 6 }],
          ['caixa', -18, 10, 30, 40, 26, 3, '#e3e6e8', { rotX: 18, gir: -14 }],
          ['caixa', 22, 12, 28, 34, 24, 3, '#d7dadd', { rotX: 22, gir: 18 }],
          ['caixa', -40, 8, -20, 3, 28, 36, '#d9dcdf', { rotZ: -16, gir: 12 }],
          ['caixa', 40, 8, 14, 3, 30, 40, '#dde0e2', { rotZ: 18, gir: -10 }],
          ['cupula', -12, 24, -6, 22, 18, '#c8cdd0', { segs: 8 }],
          ['cupula', 14, 22, 6, 20, 22, '#d2d6d8', { segs: 8 }],
          ['caixa', 0, 8, 24, 30, 30, 3, '#e8ebec', { rotX: 28 }],
        ],
      },
    ],
  },
  {
    ciutat: 'Seattle', pais: 'US',
    monuments: [
      {
        // Torre de 184 m amb potes en rellotge de sorra, plat volador i halo il·luminat.
        nom: 'Space Needle', lat: 47.62051, lon: -122.34929, rumb: 0,
        peces: [
          ...[[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([sx, sz]) => [
            ['barra', sx * 11, 0, sz * 11, sx * 3, 92, sz * 3, 3, '#f0efe9'],
            ['barra', sx * 3, 92, sz * 3, sx * 11, 140, sz * 11, 3, '#f0efe9'],
          ]),
          ['cil', 0, 0, 0, 5, 4.5, 140, 8, '#e9e8e2'],
          ['torn', 0, 138, 0, [[0, 0], [5, 0], [14, 4], [21.5, 13], [21.5, 18], [18, 24], [0, 24]], 14, '#f2f0ea'],
          ['cil', 0, 162, 0, 21, 11, 4, 14, '#e9d9b0'],
          ['tor', 0, 146, 0, 21.5, 1, '#ffc27a', { eix: 'y', segs: 12, llum: true }],
          ['cil', 0, 166, 0, 10, 10, 4, 14, '#a8d4e6', { llum: true }],
          ['cil', 0, 170, 0, 5, 1.2, 14, 8, '#e0e0e0'],
          ['con', 0, 176, 0, 1, 8.4, 6, '#ff4a3a', { llum: true }],
        ],
      },
      {
        // Estadi amb graderia el·líptica i dues cobertes sobre els costats est i oest.
        nom: 'Lumen Field', lat: 47.59520, lon: -122.33160, rumb: 0,
        peces: [
          ['bol', 0, 0, 0, 105, 138, 40, 42, 28, '#243e6e'],
          ['bol', 0, 2, 0, 96, 128, 34, 30, 28, '#34548a'],
          ['caixa', 0, 0, 0, 72, 0.8, 112, '#3b8a3c'],
          ['caixa', 0, 0.8, 0, 66, 0.2, 105, '#4fa04e'],
          ['caixa', 62, 38, 0, 52, 3, 190, '#cfd3d6', { rotZ: -6 }],
          ['caixa', -62, 38, 0, 52, 3, 190, '#cfd3d6', { rotZ: 6 }],
          ['caixa', 0, 36, 128, 120, 1, 1.5, '#9aa4b2'],
        ],
      },
    ],
  },
  {
    ciutat: 'Toronto', pais: 'CA',
    monuments: [
      {
        // Torre de 553 m: fust hexagonal, pod principal, Skypod i antena.
        nom: 'CN Tower', lat: 43.64255, lon: -79.38710, rumb: 0,
        peces: [
          ...[0, 120, 240].map(g => ['caixa', 0, 0, 14, 12, 40, 26, '#cfd0d0', { gir: g }]),
          ['torn', 0, 0, 0, [[0, 0], [15, 0], [13, 30], [10, 150], [8, 335], [8, 340]], 6, '#d6d7d6'],
          ['torn', 0, 335, 0, [[0, 0], [8, 0], [14, 4], [20, 12], [20, 22], [14, 28], [9, 31], [8, 34]], 12, '#dadcdc'],
          ['tor', 0, 349, 0, 20.4, 1.2, '#b8d9e8', { eix: 'y', segs: 8, llum: true }],
          ['cil', 0, 369, 0, 7, 5, 80, 6, '#d6d7d6'],
          ['cil', 0, 442, 0, 9, 9, 7, 8, '#cdd0d0'],
          ['cil', 0, 449, 0, 5, 1.6, 104, 6, '#dedede'],
          ['con', 0, 530, 0, 1.2, 23, 6, '#ff3a3a', { llum: true }],
        ],
      },
      {
        // Estadi amb cúpula retràctil de 86 m.
        nom: 'Rogers Centre', lat: 43.64137, lon: -79.38917, rumb: 0,
        peces: [
          ['cil', 0, 0, 0, 108, 104, 26, 16, '#b9b4a8'],
          ['cupula', 0, 26, 0, 104, 60, '#d6d9da', { segs: 16 }],
          ['tor', 0, 26, 0, 104, 1.5, '#8c9296', { eix: 'y', segs: 16 }],
          ['tor', 0, 26, 0, 104, 1.5, '#8c9296', { eix: 'z', arcGraus: 180, segs: 16 }],
          ['caixa', 0, 0, 90, 70, 36, 24, '#a9a69c'],
        ],
      },
    ],
  },
  {
    ciutat: 'Ciutat de Mèxic', pais: 'MX',
    monuments: [
      {
        // Palau de marbre amb cúpules de teules de colors; façana principal a l'est.
        nom: 'Palau de Belles Arts', lat: 19.43525, lon: -99.14125, rumb: 0,
        peces: [
          ['caixa', 0, 0, 0, 70, 26, 120, '#ece5d4'],
          ['caixa', 0, 26, 0, 66, 2, 116, '#d2cab8'],
          ['cil', 0, 28, 0, 20, 20, 8, 14, '#e5dec9'],
          ['cupula', 0, 36, 0, 20, 16, '#d98a52', { segs: 14 }],
          ['cil', 0, 52, 0, 3, 3, 5, 8, '#e5dec9'],
          ['esfera', 0, 58, 0, 2, '#e6c452'],
          ['cil', 0, 28, 42, 9, 9, 5, 10, '#e5dec9'],
          ['cupula', 0, 33, 42, 9, 9, '#4f9aa6', { segs: 10 }],
          ['cil', 0, 28, -42, 9, 9, 5, 10, '#e5dec9'],
          ['cupula', 0, 33, -42, 9, 9, '#4f9aa6', { segs: 10 }],
          ['caixa', 34, 0, 0, 6, 10, 70, '#efe9d9'],
        ],
      },
      {
        // Estadi d'ovals amb tres nivells de graderia.
        nom: 'Estadi Azteca', lat: 19.30290, lon: -99.15050, rumb: 0,
        peces: [
          ['bol', 0, 0, 0, 135, 150, 50, 58, 30, '#c2c5c6'],
          ['bol', 0, 2, 0, 122, 136, 44, 42, 30, '#8f3a35'],
          ['caixa', 0, 0, 0, 74, 0.8, 112, '#3f8f3a'],
          ['tor', 0, 54, 0, 124, 3, '#e6e8e9', { eix: 'y', esc: [1, 1, 1.1], segs: 14 }],
          ['tor', 0, 51, 0, 100, 1.4, '#f1f1f1', { eix: 'y', esc: [1, 1, 1.1], segs: 14, llum: true }],
        ],
      },
    ],
  },
  {
    ciutat: 'Rio de Janeiro', pais: 'BR',
    monuments: [
      {
        // Corcovado (704 m) amb l'estàtua de 30 m sobre un pedestal de 8 m. Mira a l'est-nord-est.
        nom: 'Crist Redemptor', lat: -22.95192, lon: -43.21050, rumb: 260,
        peces: [
          ['cil', 0, 0, 0, 1700, 800, 250, 10, '#4a7a3a'],
          ['cil', 0, 250, 0, 800, 320, 300, 10, '#3f7035'],
          ['cil', 0, 550, 0, 320, 70, 154, 9, '#6f6d5e'],
          ['cil', 0, 702, 0, 26, 24, 2, 9, '#8a8878'],
          ['caixa', 0, 704, 0, 9, 8, 9, '#cfd2cc'],
          ['torn', 0, 712, 0, [[0, 0], [4.2, 0], [3.4, 9], [2.8, 18], [2.1, 24], [0, 25]], 8, '#dfe3dc'],
          ['caixa', 0, 734, 0, 28, 1.8, 2.4, '#e6eae3'],
          ['esfera', 0, 738, 0, 1.7, '#e9ede6'],
          ['cil', 0, 705, 4, 1.5, 1.5, 3, 4, '#c4c7c0'],
        ],
      },
      {
        // Estadi oval amb graderia i anella de coberta.
        nom: 'Estadi Maracanã', lat: -22.91220, lon: -43.23020, rumb: 0,
        peces: [
          ['bol', 0, 0, 0, 125, 142, 38, 52, 28, '#d0d2d0'],
          ['bol', 0, 2, 0, 112, 128, 32, 36, 28, '#3d5fa0'],
          ['caixa', 0, 0, 0, 74, 0.8, 112, '#3f8f3a'],
          ['tor', 0, 40, 0, 118, 4, '#f2f2f2', { eix: 'y', esc: [1, 1, 1.15], segs: 14 }],
        ],
      },
    ],
  },
  {
    ciutat: 'São Paulo', pais: 'BR',
    monuments: [
      {
        // Caixa de 74 m suspesa de dos pòrtics vermells; llarg al llarg de l'Avinguda Paulista.
        nom: 'MASP', lat: -23.56145, lon: -46.65590, rumb: 43,
        peces: [
          ['caixa', 0, 0, 0, 70, 7, 26, '#a8b8bf'],
          ['caixa', 0, 8, 0, 72, 6, 28, '#e6e2d8'],
          ...[-35, 35].flatMap(x => [
            ['caixa', x, 0, -14, 2.4, 14.5, 2.4, '#c4181e'],
            ['caixa', x, 0, 14, 2.4, 14.5, 2.4, '#c4181e'],
            ['caixa', x, 12, 0, 2.4, 3, 31, '#c4181e'],
          ]),
          ['caixa', 0, 14, -14, 74, 3, 2, '#c4181e'],
          ['caixa', 0, 14, 14, 74, 3, 2, '#c4181e'],
        ],
      },
      {
        // Edifici ondulat en S de 115 m.
        nom: 'Edifici Copan', lat: -23.54627, lon: -46.64427, rumb: 345,
        peces: copan(),
      },
    ],
  },
  {
    ciutat: 'Buenos Aires', pais: 'AR',
    monuments: [
      {
        // Obelisc de 67,5 m a la Plaza de la República.
        nom: 'Obelisc de Buenos Aires', lat: -34.60372, lon: -58.38156, rumb: 0,
        peces: [
          ['caixa', 0, 0, 0, 12, 2, 12, '#cfcbc0'],
          ['cil', 0, 2, 0, 4.8, 2.5, 59, 4, '#ecebe3', { gir: 45 }],
          ['piramide', 0, 61, 0, 3.5, 6.5, 4, '#f3f2ea'],
        ],
      },
      {
        // Estadi en forma de caixa amb tres graderies altes.
        nom: 'La Bombonera', lat: -34.63564, lon: -58.36474, rumb: 0,
        peces: [
          ['caixa', 0, 0, 0, 68, 0.8, 108, '#3f8f3a'],
          ['caixa', -58, 0, 0, 48, 32, 190, '#1a4aa3'],
          ['caixa', 58, 0, 0, 48, 32, 190, '#1a4aa3'],
          ['caixa', 0, 0, -80, 164, 32, 30, '#1a4aa3'],
          ['caixa', 0, 0, 79, 164, 18, 32, '#cfd2d6'],
          ['caixa', -58, 16, 0, 48.2, 3.5, 190.2, '#f3c430'],
          ['caixa', 58, 16, 0, 48.2, 3.5, 190.2, '#f3c430'],
          ['caixa', 0, 16, -80, 164.2, 3.5, 30.2, '#f3c430'],
          ['caixa', -58, 32, 0, 52, 1.5, 194, '#c9ced4'],
          ['caixa', 58, 32, 0, 52, 1.5, 194, '#c9ced4'],
        ],
      },
    ],
  },
];
