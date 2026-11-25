// Monuments de Barcelona (exemple de referència del format). Vegeu el format de les peces a ../monuments_geo.js.
// Cada monument: nom, lat, lon (centre del monument), rumb (graus: gira tot el monument en sentit horari vist des de
// dalt; 0 = el +z del model apunta al nord), i peces en metres (x = est, y = amunt, z = nord del model).
export const CIUTATS = [
  {
    ciutat: 'Barcelona', pais: 'ES',
    monuments: [
      {
        // Model alineat: nau al llarg de z (absis a +z, façana de la Glòria a -z); creuer al llarg de x
        // (Naixement a +x, Passió a -x). El rumb 315 posa l'absis cap al NO, com a la quadrícula de l'Eixample.
        nom: 'Sagrada Família', lat: 41.40363, lon: 2.17436, rumb: 315,
        peces: [
          ['caixa', 0, 0, 0, 45, 45, 80, '#cdb99b'],                          // nau
          ['caixa', 0, 0, 0, 62, 45, 30, '#cdb99b'],                          // creuer
          ['prisma', 0, 45, 0, [[-22, -40], [22, -40], [22, 34], [-22, 34]], 6, '#b9a283'],  // coberta
          ['cil', 0, 0, 38, 23, 21, 48, 12, '#c3ae8f'],                      // absis
          ['con', 0, 48, 38, 16, 22, 10, '#a99476'],
          // Torre de Jesucrist (172,5 m) amb la creu il·luminada
          ['torn', 0, 45, 0, [[13, 0], [12, 40], [10, 78], [6.5, 108], [3, 121], [0, 124]], 12, '#e2d6c2'],
          ['caixa', 0, 162, 0, 1.6, 11, 1.6, '#f4f7fb', { llum: true }],
          ['caixa', 0, 166, 0, 8, 1.6, 1.6, '#f4f7fb', { llum: true }],
          ['caixa', 0, 166, 0, 1.6, 1.6, 8, '#f4f7fb', { llum: true }],
          // Torre de la Mare de Déu (138 m) amb l'estel
          ['torn', 0, 45, 19, [[8.5, 0], [8, 50], [5, 80], [0, 90]], 10, '#d8cab3'],
          ['esfera', 0, 137, 19, 3.2, '#fff2c4', { llum: true }],
          // Torres dels evangelistes (135 m)
          ['torn', 14, 45, 12, [[6, 0], [5.5, 55], [3, 80], [0, 90]], 8, '#d4c4aa'],
          ['torn', -14, 45, 12, [[6, 0], [5.5, 55], [3, 80], [0, 90]], 8, '#d4c4aa'],
          ['torn', 14, 45, -12, [[6, 0], [5.5, 55], [3, 80], [0, 90]], 8, '#d4c4aa'],
          ['torn', -14, 45, -12, [[6, 0], [5.5, 55], [3, 80], [0, 90]], 8, '#d4c4aa'],
          // Façana del Naixement (+x): 4 campanars de pedra més fosca
          ['torn', 33, 0, -12, [[4.6, 0], [4.3, 62], [3.4, 82], [1.6, 94], [0, 98]], 8, '#a99377'],
          ['torn', 33, 0, -4, [[4.6, 0], [4.3, 66], [3.4, 88], [1.6, 102], [0, 107]], 8, '#a99377'],
          ['torn', 33, 0, 4, [[4.6, 0], [4.3, 66], [3.4, 88], [1.6, 102], [0, 107]], 8, '#a99377'],
          ['torn', 33, 0, 12, [[4.6, 0], [4.3, 62], [3.4, 82], [1.6, 94], [0, 98]], 8, '#a99377'],
          ['caixa', 33, 0, 0, 6, 40, 30, '#b19c80'],
          // Façana de la Passió (-x): 4 campanars
          ['torn', -33, 0, -12, [[4.6, 0], [4.3, 68], [3.4, 90], [1.6, 104], [0, 110]], 8, '#c2b097'],
          ['torn', -33, 0, -4, [[4.6, 0], [4.3, 70], [3.4, 92], [1.6, 106], [0, 112]], 8, '#c2b097'],
          ['torn', -33, 0, 4, [[4.6, 0], [4.3, 70], [3.4, 92], [1.6, 106], [0, 112]], 8, '#c2b097'],
          ['torn', -33, 0, 12, [[4.6, 0], [4.3, 68], [3.4, 90], [1.6, 104], [0, 110]], 8, '#c2b097'],
          ['caixa', -33, 0, 0, 6, 38, 30, '#c7b59b'],
          // Pòrtic de la Glòria (-z), encara sense les torres
          ['caixa', 0, 0, -44, 40, 30, 8, '#bca98d'],
        ],
      },
      {
        // Camp Nou després de la remodelació: graderia el·líptica, coberta anular i camp de gespa.
        nom: 'Spotify Camp Nou', lat: 41.38088, lon: 2.12282, rumb: 0,
        peces: [
          ['bol', 0, 0, 0, 112, 132, 50, 60, 28, '#d5d8dc'],                   // estructura exterior
          ['bol', 0, 2, 0, 100, 120, 44, 46, 28, '#9b2c4f'],                   // graderia (seients blaugrana)
          ['caixa', 0, 0, 0, 74, 0.8, 112, '#3f8f3a'],                         // gespa
          ['caixa', 0, 0.8, 0, 68, 0.2, 105, '#58a84f'],                       // terreny de joc
          ['tor', 0, 52, 0, 104, 3, '#eef1f4', { eix: 'y', esc: [1, 1, 1.18], segs: 14 }],   // anella de la coberta
          ['tor', 0, 49, 0, 82, 1.5, '#f6f6f6', { eix: 'y', esc: [1, 1, 1.24], segs: 14, llum: true }],
        ],
      },
    ],
  },
];
