// Monuments de Madrid, Lisboa, París, Londres, Roma, Milà, Berlín, Munic, Amsterdam, Brussel·les, Viena i Praga.
// Format: vegeu ../monuments_geo.js i dades_0.js (x = est, y = amunt, z = nord del model; rumb = gir horari en graus).
export const CIUTATS = [
  {
    ciutat: 'Madrid', pais: 'ES',
    monuments: [
      {
        // Estadi Santiago Bernabéu: planta el·líptica allargada N-S, façana metàl·lica i coberta anular.
        nom: 'Estadi Santiago Bernabéu', lat: 40.45300, lon: -3.68821, rumb: 0,
        peces: [
          ['bol', 0, 0, 0, 111, 125, 48, 60, 24, '#c9ced3'],                    // estructura exterior
          ['bol', 0, 2, 0, 100, 115, 42, 46, 24, '#e8e8ec'],                    // graderia
          ['caixa', 0, 0, 0, 68, 0.8, 105, '#3f8f3a'],                         // gespa
          ['tor', 0, 50, 0, 106, 3, '#dfe3e8', { eix: 'y', esc: [1, 1, 1.17], segs: 12 }],   // anella de coberta
          ['tor', 0, 47, 0, 84, 1.4, '#f3f3f3', { eix: 'y', esc: [1, 1, 1.3], segs: 12, llum: true }],
        ],
      },
      {
        // Palau Reial: gran bloc quadrat de pedra amb pati central; façana principal al sud.
        nom: 'Palau Reial de Madrid', lat: 40.41797, lon: -3.71422, rumb: 0,
        peces: [
          ['caixa', 0, 0, 62, 140, 28, 32, '#e1dac8'],                         // ala nord
          ['caixa', 0, 0, -62, 140, 28, 32, '#e1dac8'],                        // ala sud (façana)
          ['caixa', -54, 0, 0, 32, 28, 92, '#ddd5c1'],                         // ala oest
          ['caixa', 54, 0, 0, 32, 28, 92, '#ddd5c1'],                          // ala est
          ['caixa', 0, 28, -62, 142, 3, 34, '#f3efe4'],                        // cornisa
          ['caixa', 0, 28, 62, 142, 3, 34, '#f3efe4'],
          ['caixa', -54, 28, 0, 34, 3, 92, '#f3efe4'],
          ['caixa', 54, 28, 0, 34, 3, 92, '#f3efe4'],
          ['caixa', 0, 0, -70, 60, 34, 6, '#efe9da'],                          // cos central de la façana
          ['caixa', -64, 0, -70, 12, 32, 6, '#efe9da'],
          ['caixa', 64, 0, -70, 12, 32, 6, '#efe9da'],
          ['piramide', 0, 31, -62, 20, 6, 4, '#7c8791'],                       // coberta de pissarra
        ],
      },
    ],
  },
  {
    ciutat: 'Lisboa', pais: 'PT',
    monuments: [
      {
        // Torre de Belém: torre manuelina de 30 m sobre un baluard al riu; la torre al sud-oest del baluard.
        nom: 'Torre de Belém', lat: 38.69163, lon: -9.21589, rumb: 0,
        peces: [
          ['prisma', 0, 0, 0, [[-17, -14], [17, -14], [20, 0], [14, 14], [-14, 14], [-20, 0]], 7, '#e3d9c0'],  // baluard
          ['caixa', 0, 7, 10, 28, 4, 8, '#ddd2b6'],                            // terrassa dels canons
          ['caixa', 0, 7, -3, 14, 28, 13, '#e8dfc7'],                          // cos de la torre
          ['caixa', 0, 35, -3, 15, 1.2, 14, '#cfc4a8'],
          ['cil', -7, 35, -9.5, 1.6, 1.6, 2.5, 6, '#e8dfc7'],                  // garites de les cantonades
          ['cil', 7, 35, -9.5, 1.6, 1.6, 2.5, 6, '#e8dfc7'],
          ['cil', -7, 35, 3.5, 1.6, 1.6, 2.5, 6, '#e8dfc7'],
          ['cil', 7, 35, 3.5, 1.6, 1.6, 2.5, 6, '#e8dfc7'],
          ['cupula', -7, 37.5, -9.5, 1.8, 2.2, '#cbbf9f'],
          ['cupula', 7, 37.5, -9.5, 1.8, 2.2, '#cbbf9f'],
          ['cupula', -7, 37.5, 3.5, 1.8, 2.2, '#cbbf9f'],
          ['cupula', 7, 37.5, 3.5, 1.8, 2.2, '#cbbf9f'],
          ['caixa', 0, 35, -3, 6, 6, 6, '#e3d9c0'],                            // llanterna
          ['cupula', 0, 41, -3, 3.6, 3.6, '#c9bd9c'],
        ],
      },
      {
        // Pont 25 d'Abril: pont penjant, vol central de 1013 m amb dues torres de 190 m (eix model = z, de sud a nord).
        nom: "Pont 25 d'Abril", lat: 38.68923, lon: -9.17668, rumb: 171,
        peces: [
          ['caixa', 0, 68, 0, 26, 6, 2000, '#b8452e'],                         // tauler
          // torres principals (z = ±506)
          ['caixa', -11, 0, -506, 5, 190, 6, '#c0392b'], ['caixa', 11, 0, -506, 5, 190, 6, '#c0392b'],
          ['caixa', 0, 100, -506, 17, 4, 5, '#c0392b'], ['caixa', 0, 150, -506, 17, 4, 5, '#c0392b'], ['caixa', 0, 186, -506, 17, 4, 5, '#c0392b'],
          ['caixa', -11, 0, 506, 5, 190, 6, '#c0392b'], ['caixa', 11, 0, 506, 5, 190, 6, '#c0392b'],
          ['caixa', 0, 100, 506, 17, 4, 5, '#c0392b'], ['caixa', 0, 150, 506, 17, 4, 5, '#c0392b'], ['caixa', 0, 186, 506, 17, 4, 5, '#c0392b'],
          // cables principals (parabòlics) a x = ±12; costat -z i +z
          ['barra', -12, 75, 0, -12, 79.5, 100, 1.6, '#d4d4d4'], ['barra', -12, 79.5, 100, -12, 93, 200, 1.6, '#d4d4d4'],
          ['barra', -12, 93, 200, -12, 115, 300, 1.6, '#d4d4d4'], ['barra', -12, 115, 300, -12, 147, 400, 1.6, '#d4d4d4'],
          ['barra', -12, 147, 400, -12, 190, 506, 1.6, '#d4d4d4'],
          ['barra', -12, 75, 0, -12, 79.5, -100, 1.6, '#d4d4d4'], ['barra', -12, 79.5, -100, -12, 93, -200, 1.6, '#d4d4d4'],
          ['barra', -12, 93, -200, -12, 115, -300, 1.6, '#d4d4d4'], ['barra', -12, 115, -300, -12, 147, -400, 1.6, '#d4d4d4'],
          ['barra', -12, 147, -400, -12, 190, -506, 1.6, '#d4d4d4'],
          ['barra', 12, 75, 0, 12, 79.5, 100, 1.6, '#d4d4d4'], ['barra', 12, 79.5, 100, 12, 93, 200, 1.6, '#d4d4d4'],
          ['barra', 12, 93, 200, 12, 115, 300, 1.6, '#d4d4d4'], ['barra', 12, 115, 300, 12, 147, 400, 1.6, '#d4d4d4'],
          ['barra', 12, 147, 400, 12, 190, 506, 1.6, '#d4d4d4'],
          ['barra', 12, 75, 0, 12, 79.5, -100, 1.6, '#d4d4d4'], ['barra', 12, 79.5, -100, 12, 93, -200, 1.6, '#d4d4d4'],
          ['barra', 12, 93, -200, 12, 115, -300, 1.6, '#d4d4d4'], ['barra', 12, 115, -300, 12, 147, -400, 1.6, '#d4d4d4'],
          ['barra', 12, 147, -400, 12, 190, -506, 1.6, '#d4d4d4'],
          // tirants dels vols laterals
          ['barra', -12, 190, 506, -12, 70, 960, 1.4, '#d4d4d4'], ['barra', 12, 190, 506, 12, 70, 960, 1.4, '#d4d4d4'],
          ['barra', -12, 190, -506, -12, 70, -960, 1.4, '#d4d4d4'], ['barra', 12, 190, -506, 12, 70, -960, 1.4, '#d4d4d4'],
          // pilons de l'aproximació i pilars sota el tauler
          ['caixa', 0, 0, 0, 12, 68, 12, '#9b9b9b'],
          ['caixa', 0, 0, 750, 12, 68, 12, '#9b9b9b'], ['caixa', 0, 0, -750, 12, 68, 12, '#9b9b9b'],
        ],
      },
    ],
  },
  {
    ciutat: 'París', pais: 'FR',
    monuments: [
      {
        // Torre Eiffel: base de 125 m, plataformes a 57, 115 i 276 m, cim a 330 m.
        nom: 'Torre Eiffel', lat: 48.85826, lon: 2.29450, rumb: 308,
        peces: [
          // peus (4 cantonades), tres trams
          ['barra', 58, 0, 58, 33, 57, 33, 7, '#6d5b4b'], ['barra', 33, 57, 33, 14, 115, 14, 5, '#6d5b4b'], ['barra', 14, 115, 14, 5, 276, 5, 3, '#6d5b4b'],
          ['barra', -58, 0, 58, -33, 57, 33, 7, '#6d5b4b'], ['barra', -33, 57, 33, -14, 115, 14, 5, '#6d5b4b'], ['barra', -14, 115, 14, -5, 276, 5, 3, '#6d5b4b'],
          ['barra', 58, 0, -58, 33, 57, -33, 7, '#6d5b4b'], ['barra', 33, 57, -33, 14, 115, -14, 5, '#6d5b4b'], ['barra', 14, 115, -14, 5, 276, -5, 3, '#6d5b4b'],
          ['barra', -58, 0, -58, -33, 57, -33, 7, '#6d5b4b'], ['barra', -33, 57, -33, -14, 115, -14, 5, '#6d5b4b'], ['barra', -14, 115, -14, -5, 276, -5, 3, '#6d5b4b'],
          // arcs del primer pis (4 façanes)
          ['arc', 0, 0, 58, 100, 40, 14, 4, '#7a6757'], ['arc', 0, 0, -58, 100, 40, 14, 4, '#7a6757'],
          ['arc', 58, 0, 0, 100, 40, 14, 4, '#7a6757', { gir: 90 }], ['arc', -58, 0, 0, 100, 40, 14, 4, '#7a6757', { gir: 90 }],
          // plataformes
          ['caixa', 0, 55, 0, 72, 4, 72, '#7d6a58'],
          ['caixa', 0, 113, 0, 34, 4, 34, '#7d6a58'],
          ['caixa', 0, 275, 0, 18, 5, 18, '#7d6a58'],
          ['piramide', 0, 280, 0, 12, 14, 4, '#6d5b4b'],
          ['torn', 0, 294, 0, [[3, 0], [1.6, 22], [0.8, 38], [0, 42]], 6, '#6d5b4b'],
          ['esfera', 0, 332, 0, 1.6, '#fff3c4', { llum: true }],               // far del cim
          ['caixa', 0, 114, 0, 36, 1.2, 36, '#ffd98a', { llum: true }],        // banda il·luminada
        ],
      },
      {
        // Arc de Triomf de l'Étoile: 45 x 22 m, 50 m d'alçada; eix del passatge al llarg dels Camps Elisis (z del model).
        nom: 'Arc de Triomf', lat: 48.87377, lon: 2.29504, rumb: 115,
        peces: [
          ['arc', 0, 0, 0, 45, 48, 15, 22, '#d9cfb8'],
          ['caixa', 0, 48, 0, 46, 2.5, 23, '#cfc4aa'],                         // àtic
          ['caixa', 0, 47, 0, 20, 0.8, 23.5, '#e6dcc4'],
          ['caixa', 0, 0, 0, 24, 5, 23, '#cbc1a8'],
        ],
      },
    ],
  },
  {
    ciutat: 'Londres', pais: 'GB',
    monuments: [
      {
        // Palau de Westminster: 265 m al llarg del Tàmesi (z), Victoria Tower al sud i Elizabeth Tower (Big Ben) al nord.
        nom: 'Palau de Westminster i Big Ben', lat: 51.49930, lon: -0.12448, rumb: 9,
        peces: [
          ['caixa', 0, 0, 6, 38, 22, 250, '#c9b78d'],                          // cos principal
          ['caixa', -22, 0, 8, 30, 18, 190, '#c5b289'],                        // ala oest
          ['piramide', 0, 22, 0, 30, 10, 4, '#7d8793', { esc: [1, 1, 7.2] }],  // coberta
          ['caixa', 0, 22, -75, 12, 14, 12, '#c9b78d'],
          ['caixa', 0, 0, 40, 18, 36, 18, '#bfae85'],                          // Torre Central
          ['torn', 0, 36, 40, [[7, 0], [5, 20], [2, 36], [0, 56]], 8, '#6f7882'],
          // Victoria Tower (sud, 98 m)
          ['caixa', 0, 0, -132, 25, 74, 25, '#c7b68c'],
          ['caixa', 0, 74, -132, 26.5, 5, 26.5, '#b6a57c'],
          ['caixa', 0, 79, -132, 20, 14, 20, '#c9b88e'],
          ['caixa', -9, 79, -141, 2.4, 20, 2.4, '#c9b88e'], ['caixa', 9, 79, -141, 2.4, 20, 2.4, '#c9b88e'],
          ['caixa', -9, 79, -123, 2.4, 20, 2.4, '#c9b88e'], ['caixa', 9, 79, -123, 2.4, 20, 2.4, '#c9b88e'],
          // Elizabeth Tower (Big Ben, 96 m)
          ['caixa', 0, 0, 146, 12.5, 55, 12.5, '#c9b585'],
          ['caixa', 0, 55, 146, 15.5, 14, 15.5, '#bba878'],                    // pis del rellotge
          ['caixa', 0, 62, 146, 17, 6, 0.8, '#fff2b0', { llum: true }],        // esfera del rellotge (N)
          ['caixa', 0, 62, 146, 0.8, 6, 17, '#fff2b0', { llum: true }],        // (E-O)
          ['caixa', 0, 69, 146, 14, 8, 14, '#b09d70'],                         // campanar
          ['piramide', 0, 77, 146, 15, 17, 4, '#3f4a45'],                      // agulla verdosa
          ['esfera', 0, 95, 146, 0.9, '#d7b44a', { llum: true }],
        ],
      },
      {
        // London Eye: roda de 120 m (centre a 69 m), plànol paral·lel al riu; potes a un costat (eix model: x = pla de la roda).
        nom: 'London Eye', lat: 51.50355, lon: -0.11973, rumb: 265,
        peces: [
          ['tor', 0, 69, 0, 60, 1.3, '#f2f5f8', { segs: 16 }],
          ['tor', 0, 69, 0, 57, 0.7, '#e1e6ec', { segs: 16 }],
          ['esfera', 0, 69, 0, 3.5, '#e9edf2'],
          // radis
          ['barra', 0, 69, 0, 0, 129, 0, 0.5, '#d5dbe1'], ['barra', 0, 69, 0, 0, 9, 0, 0.5, '#d5dbe1'],
          ['barra', 0, 69, 0, 60, 69, 0, 0.5, '#d5dbe1'], ['barra', 0, 69, 0, -60, 69, 0, 0.5, '#d5dbe1'],
          ['barra', 0, 69, 0, 42.4, 111.4, 0, 0.5, '#d5dbe1'], ['barra', 0, 69, 0, -42.4, 111.4, 0, 0.5, '#d5dbe1'],
          ['barra', 0, 69, 0, 42.4, 26.6, 0, 0.5, '#d5dbe1'], ['barra', 0, 69, 0, -42.4, 26.6, 0, 0.5, '#d5dbe1'],
          // 32 càpsules (cabines) en 16 punts visibles
          ['caixa', 0, 128, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', 23, 124, 7, 3.4, 3.4, 3.4, '#cfe6f5'], ['caixa', 42, 111, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', 56, 91, 7, 3.4, 3.4, 3.4, '#cfe6f5'], ['caixa', 60, 68, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', 56, 46, 7, 3.4, 3.4, 3.4, '#cfe6f5'], ['caixa', 42, 26, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', 23, 13, 7, 3.4, 3.4, 3.4, '#cfe6f5'], ['caixa', 0, 8, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', -23, 13, 7, 3.4, 3.4, 3.4, '#cfe6f5'], ['caixa', -42, 26, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', -56, 46, 7, 3.4, 3.4, 3.4, '#cfe6f5'], ['caixa', -60, 68, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', -56, 91, 7, 3.4, 3.4, 3.4, '#cfe6f5'], ['caixa', -42, 111, 7, 3.4, 3.4, 3.4, '#cfe6f5', { llum: true }],
          ['caixa', -23, 124, 7, 3.4, 3.4, 3.4, '#cfe6f5'],
          // potes en A (a l'altre costat del pla)
          ['barra', 0, 69, 0, -9, 0, -42, 1.6, '#e7ebef'], ['barra', 0, 69, 0, 9, 0, -42, 1.6, '#e7ebef'],
          ['barra', 0, 69, 0, 0, 0, -48, 1.2, '#cfd5db'],
        ],
      },
    ],
  },
  {
    ciutat: 'Roma', pais: 'IT',
    monuments: [
      {
        // Coliseu: el·lipse de 188 x 156 m i 48 m d'alçada; eix llarg al llarg de x (rotat amb rumb).
        nom: 'Coliseu', lat: 41.89021, lon: 12.49223, rumb: 25,
        peces: [
          ['bol', 0, 0, 0, 94, 78, 48, 30, 20, '#d1bc93'],                     // anell exterior
          ['bol', 0, 0, 0, 92, 76, 36, 24, 20, '#c4ad82'],
          ['torn', 0, 0, 0, [[0, 0], [48, 0], [48, 1]], 16, '#c9ad7a', { esc: [1.94, 1, 1.6] }],  // arena
          ['bol', 0, 0, 0, 62, 50, 14, 16, 20, '#b99f72'],                     // cavea interior
          ['tor', 0, 36, 0, 92, 1.2, '#e0cfa9', { eix: 'y', esc: [1, 1, 0.83], segs: 12 }],
        ],
      },
      {
        // Basílica de Sant Pere: nau a -z (façana), absis a +z; la cúpula (136 m) a l'origen.
        nom: 'Basílica de Sant Pere', lat: 41.90217, lon: 12.45394, rumb: 270,
        peces: [
          ['caixa', 0, 0, -60, 58, 44, 130, '#d7cdb4'],                        // nau
          ['piramide', 0, 44, -60, 58, 10, 4, '#aeb2b5', { esc: [1, 1, 2.2] }],
          ['caixa', 0, 0, 0, 137, 36, 56, '#d3c8ae'],                          // creuer
          ['caixa', 0, 0, 45, 56, 38, 44, '#d3c8ae'],                          // presbiteri
          ['cil', 0, 0, 67, 28, 28, 36, 12, '#cfc4aa'],                        // absis
          ['caixa', 0, 0, -128, 115, 46, 12, '#ddd3ba'],                       // façana
          ['caixa', 0, 46, -128, 117, 4, 13, '#cfc4aa'],
          ['caixa', 0, 50, -128, 18, 7, 3, '#e5dcc5'],
          // cúpula de Miquel Àngel
          ['cil', 0, 36, 0, 25, 24, 22, 16, '#d8cdb3'],                        // tambor
          ['torn', 0, 58, 0, [[0, 0], [24, 0], [23, 14], [19, 32], [12, 55], [6, 66], [0, 70]], 16, '#a6adb3'],
          ['cil', 0, 124, 0, 4.5, 3.8, 8, 8, '#e4dbc4'],                       // llanterna
          ['caixa', 0, 132, 0, 0.6, 7, 0.6, '#e8c85a', { llum: true }],        // creu
          ['caixa', 0, 136, 0, 3, 0.6, 0.6, '#e8c85a', { llum: true }],
          // cúpules menors
          ['cupula', -26, 36, -22, 9, 12, '#a6adb3'], ['cupula', 26, 36, -22, 9, 12, '#a6adb3'],
          ['cupula', -26, 36, 22, 9, 12, '#a6adb3'], ['cupula', 26, 36, 22, 9, 12, '#a6adb3'],
        ],
      },
    ],
  },
  {
    ciutat: 'Milà', pais: 'IT',
    monuments: [
      {
        // Duomo de Milà: 158 x 93 m, façana a -z (oest); tiburi central amb la Madonnina (108 m).
        nom: 'Duomo de Milà', lat: 45.46427, lon: 9.19192, rumb: 90,
        peces: [
          ['caixa', 0, 0, 0, 59, 40, 158, '#efeadf'],                          // nau
          ['caixa', 0, 0, 5, 93, 34, 40, '#ebe6da'],                           // creuer
          ['piramide', 0, 40, 0, 59, 14, 4, '#d9d3c4', { esc: [1, 1, 2.2] }],  // coberta de la nau
          ['piramide', 0, 34, 5, 93, 9, 4, '#d9d3c4', { esc: [1, 1, 0.5] }],
          ['cil', 0, 0, 68, 18, 18, 30, 10, '#e8e3d6'],                        // absis
          ['caixa', 0, 0, -78, 62, 56, 6, '#f2eee5'],                          // façana
          ['piramide', 0, 56, -78, 62, 10, 4, '#e3ded2', { esc: [1, 1, 0.12] }],
          ['torn', 0, 40, 5, [[8, 0], [7, 22], [3, 40], [1, 55], [0.4, 66]], 8, '#f1ede2'],   // tiburi
          ['esfera', 0, 108, 5, 1.2, '#e6c14e', { llum: true }],                // Madonnina
          // agulles laterals
          ['con', -26, 40, -50, 1.6, 14, 6, '#f1ede2'], ['con', 26, 40, -50, 1.6, 14, 6, '#f1ede2'],
          ['con', -26, 40, -20, 1.6, 14, 6, '#f1ede2'], ['con', 26, 40, -20, 1.6, 14, 6, '#f1ede2'],
          ['con', -26, 40, 20, 1.6, 14, 6, '#f1ede2'], ['con', 26, 40, 20, 1.6, 14, 6, '#f1ede2'],
          ['con', -26, 40, 50, 1.6, 14, 6, '#f1ede2'], ['con', 26, 40, 50, 1.6, 14, 6, '#f1ede2'],
          ['con', -44, 34, 5, 1.6, 12, 6, '#f1ede2'], ['con', 44, 34, 5, 1.6, 12, 6, '#f1ede2'],
          ['con', -29, 56, -78, 1.8, 14, 6, '#f1ede2'], ['con', 29, 56, -78, 1.8, 14, 6, '#f1ede2'],
          ['con', 0, 66, -78, 1.8, 14, 6, '#f1ede2'],
        ],
      },
      {
        // Estadi San Siro (Giuseppe Meazza): planta el·líptica, 11 torres cilíndriques i coberta de bigues vermelles.
        nom: 'Estadi San Siro', lat: 45.47806, lon: 9.12395, rumb: 0,
        peces: [
          ['bol', 0, 0, 0, 100, 118, 45, 52, 24, '#b9bcc0'],
          ['bol', 0, 2, 0, 90, 108, 40, 38, 24, '#8a8f95'],
          ['caixa', 0, 0, 0, 68, 0.8, 105, '#3f8f3a'],
          ['tor', 0, 47, 0, 98, 3, '#c43a2e', { eix: 'y', esc: [1, 1, 1.18], segs: 12 }],   // anella vermella
          ['tor', 0, 47, 0, 78, 1.6, '#cf4a3d', { eix: 'y', esc: [1, 1, 1.2], segs: 12 }],
          ['cil', -105, 0, 0, 7, 7, 52, 8, '#c9ccd0'], ['cil', 105, 0, 0, 7, 7, 52, 8, '#c9ccd0'],
          ['cil', -92, 0, 60, 7, 7, 52, 8, '#c9ccd0'], ['cil', 92, 0, 60, 7, 7, 52, 8, '#c9ccd0'],
          ['cil', -92, 0, -60, 7, 7, 52, 8, '#c9ccd0'], ['cil', 92, 0, -60, 7, 7, 52, 8, '#c9ccd0'],
          ['cil', -55, 0, 105, 7, 7, 52, 8, '#c9ccd0'], ['cil', 55, 0, 105, 7, 7, 52, 8, '#c9ccd0'],
          ['cil', -55, 0, -105, 7, 7, 52, 8, '#c9ccd0'], ['cil', 55, 0, -105, 7, 7, 52, 8, '#c9ccd0'],
          ['cil', 0, 0, 122, 7, 7, 52, 8, '#c9ccd0'],
        ],
      },
    ],
  },
  {
    ciutat: 'Berlín', pais: 'DE',
    monuments: [
      {
        // Porta de Brandenburg: 65,5 x 11 m, 26 m amb la quadriga; passatges al llarg de z (rumb 90: E-O).
        nom: 'Porta de Brandenburg', lat: 52.51628, lon: 13.37770, rumb: 90,
        peces: [
          ['caixa', 0, 0, 0, 65.5, 1.5, 11, '#cfc9b6'],                        // estilòbat
          ['caixa', -22, 1.5, 0, 22, 13, 3.2, '#d8d3c0'],                      // parets transversals
          ['caixa', 22, 1.5, 0, 22, 13, 3.2, '#d8d3c0'],
          ['caixa', 0, 1.5, 0, 6, 13, 3.2, '#d8d3c0'],
          ['caixa', -11, 1.5, 0, 3, 13, 3.2, '#d8d3c0'], ['caixa', 11, 1.5, 0, 3, 13, 3.2, '#d8d3c0'],
          ['cil', -27.5, 1.5, 4.2, 1.7, 1.5, 13, 8, '#ddd8c5'], ['cil', -16.5, 1.5, 4.2, 1.7, 1.5, 13, 8, '#ddd8c5'],
          ['cil', -5.5, 1.5, 4.2, 1.7, 1.5, 13, 8, '#ddd8c5'], ['cil', 5.5, 1.5, 4.2, 1.7, 1.5, 13, 8, '#ddd8c5'],
          ['cil', 16.5, 1.5, 4.2, 1.7, 1.5, 13, 8, '#ddd8c5'], ['cil', 27.5, 1.5, 4.2, 1.7, 1.5, 13, 8, '#ddd8c5'],
          ['cil', -27.5, 1.5, -4.2, 1.7, 1.5, 13, 8, '#ddd8c5'], ['cil', -16.5, 1.5, -4.2, 1.7, 1.5, 13, 8, '#ddd8c5'],
          ['cil', -5.5, 1.5, -4.2, 1.7, 1.5, 13, 8, '#ddd8c5'], ['cil', 5.5, 1.5, -4.2, 1.7, 1.5, 13, 8, '#ddd8c5'],
          ['cil', 16.5, 1.5, -4.2, 1.7, 1.5, 13, 8, '#ddd8c5'], ['cil', 27.5, 1.5, -4.2, 1.7, 1.5, 13, 8, '#ddd8c5'],
          ['caixa', 0, 14.5, 0, 65.5, 4, 11, '#d3ceba'],                       // entaulament
          ['caixa', 0, 18.5, 0, 56, 3.5, 7, '#cfc9b4'],                        // àtic
          // quadriga (carro i quatre cavalls) en bronze verd
          ['caixa', 0, 22, 0, 11, 1.2, 6, '#6f8f7c'],
          ['caixa', 0, 23.2, -0.5, 8, 2.8, 2.5, '#5f8571'],
          ['caixa', -3.6, 22, 3.6, 1.6, 3.4, 2.2, '#5f8571'], ['caixa', -1.2, 22, 3.6, 1.6, 3.4, 2.2, '#5f8571'],
          ['caixa', 1.2, 22, 3.6, 1.6, 3.4, 2.2, '#5f8571'], ['caixa', 3.6, 22, 3.6, 1.6, 3.4, 2.2, '#5f8571'],
          ['caixa', 0, 25, -0.5, 1.4, 3.2, 1.4, '#6f9a85'],                    // la Victòria
        ],
      },
      {
        // Fernsehturm: 368 m, esfera de 32 m a 203 m.
        nom: 'Torre de televisió (Fernsehturm)', lat: 52.52083, lon: 13.40940, rumb: 0,
        peces: [
          ['cil', 0, 0, 0, 22, 18, 10, 12, '#a7a8a6'],                          // base
          ['torn', 0, 0, 0, [[0, 0], [14, 0], [9, 25], [6, 70], [4.2, 150], [3.6, 203]], 10, '#c9cacb'],  // fust de formigó
          ['torn', 0, 203, 0, [[0, -16], [8, -14], [14, -8], [16, 0], [14, 8], [8, 14], [0, 16]], 12, '#bcc2c8'],  // esfera
          ['torn', 0, 203, 0, [[0, -2], [16.4, -2], [16.4, 3], [0, 3]], 12, '#e8c870', { llum: true }],  // cinturó de finestres
          ['cil', 0, 217, 0, 4, 2.4, 33, 8, '#d8dadc'],                         // cos superior
          ['con', 0, 250, 0, 2.2, 118, 6, '#d44a3a'],                           // mast (vermell i blanc)
          ['esfera', 0, 367, 0, 0.8, '#fff0c0', { llum: true }],
        ],
      },
    ],
  },
  {
    ciutat: 'Munic', pais: 'DE',
    monuments: [
      {
        // Allianz Arena: rombe arrodonit de 258 x 227 m i 50 m d'alçada, façana de coixins ETFE.
        nom: 'Allianz Arena', lat: 48.21882, lon: 11.62470, rumb: 340,
        peces: [
          ['bol', 0, 0, 0, 113, 129, 50, 38, 16, '#eceff1'],
          ['bol', 0, 0, 0, 103, 118, 50, 22, 16, '#dfe3e6'],
          ['caixa', 0, 0, 0, 70, 0.8, 108, '#3f8f3a'],
          ['tor', 0, 49, 0, 104, 2.2, '#d94a3f', { eix: 'y', esc: [1, 1, 1.14], segs: 12, llum: true }],   // anell il·luminat
          ['tor', 0, 30, 0, 107, 1.2, '#f2f3f5', { eix: 'y', esc: [1, 1, 1.14], segs: 12 }],
        ],
      },
      {
        // Frauenkirche: 109 x 40 m, dues torres de 99 m amb cúpules de ceba, a l'oest (-z amb rumb 90).
        nom: 'Frauenkirche', lat: 48.13867, lon: 11.57364, rumb: 90,
        peces: [
          ['caixa', 0, 0, 0, 40, 37, 100, '#b27c58'],                           // nau
          ['piramide', 0, 37, 0, 38, 25, 4, '#7d4a3b', { esc: [1, 1, 2.4] }],   // teulada alta
          ['caixa', 0, 0, 52, 30, 28, 14, '#ad7855'],                           // cor
          ['piramide', 0, 28, 52, 30, 14, 4, '#7d4a3b'],
          // torres (nord i sud) amb cúpula
          ['caixa', -9.5, 0, -48, 14, 66, 14, '#b57f5b'], ['caixa', 9.5, 0, -48, 14, 66, 14, '#b57f5b'],
          ['caixa', -9.5, 66, -48, 12, 6, 12, '#a87450'], ['caixa', 9.5, 66, -48, 12, 6, 12, '#a87450'],
          ['torn', -9.5, 72, -48, [[0, 0], [5.6, 0], [7, 5], [6, 11], [3, 16], [1, 20], [0, 27]], 8, '#6b8f7a'],
          ['torn', 9.5, 72, -48, [[0, 0], [5.6, 0], [7, 5], [6, 11], [3, 16], [1, 20], [0, 27]], 8, '#6b8f7a'],
          ['esfera', -9.5, 99.5, -48, 0.8, '#d8b44c', { llum: true }], ['esfera', 9.5, 99.5, -48, 0.8, '#d8b44c', { llum: true }],
        ],
      },
    ],
  },
  {
    ciutat: 'Amsterdam', pais: 'NL',
    monuments: [
      {
        // Rijksmuseum: dos blocs de maó amb un passatge central i quatre torretes; façana principal al sud.
        nom: 'Rijksmuseum', lat: 52.35999, lon: 4.88527, rumb: 0,
        peces: [
          ['caixa', -42, 0, 0, 70, 22, 105, '#a85b43'],                         // bloc oest
          ['caixa', 42, 0, 0, 70, 22, 105, '#a85b43'],                          // bloc est
          ['caixa', 0, 11, 0, 14, 12, 105, '#9c5039'],                          // pont sobre el passatge
          ['piramide', -42, 22, 0, 70, 10, 4, '#4d535c', { esc: [1, 1, 1.5] }],
          ['piramide', 42, 22, 0, 70, 10, 4, '#4d535c', { esc: [1, 1, 1.5] }],
          // torres frontals i cos central
          ['caixa', -72, 0, -50, 14, 38, 12, '#b0634a'], ['caixa', 72, 0, -50, 14, 38, 12, '#b0634a'],
          ['piramide', -72, 38, -50, 14, 12, 4, '#4d535c'], ['piramide', 72, 38, -50, 14, 12, 4, '#4d535c'],
          ['caixa', -72, 0, 50, 14, 38, 12, '#b0634a'], ['caixa', 72, 0, 50, 14, 38, 12, '#b0634a'],
          ['piramide', -72, 38, 50, 14, 12, 4, '#4d535c'], ['piramide', 72, 38, 50, 14, 12, 4, '#4d535c'],
          ['caixa', -14, 0, -52, 18, 30, 6, '#b9694e'], ['caixa', 14, 0, -52, 18, 30, 6, '#b9694e'],
          ['piramide', -14, 30, -52, 18, 8, 4, '#4d535c'], ['piramide', 14, 30, -52, 18, 8, 4, '#4d535c'],
        ],
      },
      {
        // Estació Central: façana de 300 m de maó amb torre del rellotge, andanes cobertes a la banda del riu IJ.
        nom: 'Estació Central', lat: 52.37877, lon: 4.90022, rumb: 20,
        peces: [
          ['caixa', 0, 0, -14, 300, 16, 20, '#9a5a42'],                         // edifici principal
          ['piramide', 0, 16, -14, 300, 6, 4, '#4b5057', { esc: [1, 1, 0.07] }],
          ['caixa', -72, 0, -14, 40, 28, 24, '#a05f47'], ['caixa', 72, 0, -14, 40, 28, 24, '#a05f47'],   // pavellons
          ['piramide', -72, 28, -14, 40, 16, 4, '#4b5057'], ['piramide', 72, 28, -14, 40, 16, 4, '#4b5057'],
          ['caixa', 0, 16, -14, 12, 14, 12, '#a5634a'],                         // torre del rellotge
          ['caixa', 0, 30, -14, 8, 6, 8, '#e8dcc2', { llum: true }],
          ['piramide', 0, 36, -14, 9, 10, 4, '#4b5057'],
          ['caixa', -110, 0, -14, 22, 24, 22, '#a05f47'], ['caixa', 110, 0, -14, 22, 24, 22, '#a05f47'],
          // cobertes de les andanes (3 naus)
          ['caixa', -60, 0, 85, 50, 14, 150, '#7f858b'], ['caixa', 0, 0, 85, 50, 14, 150, '#7f858b'], ['caixa', 60, 0, 85, 50, 14, 150, '#7f858b'],
          ['piramide', -60, 14, 85, 50, 6, 4, '#a9afb5', { esc: [1, 1, 3] }], ['piramide', 0, 14, 85, 50, 6, 4, '#a9afb5', { esc: [1, 1, 3] }],
          ['piramide', 60, 14, 85, 50, 6, 4, '#a9afb5', { esc: [1, 1, 3] }],
        ],
      },
    ],
  },
  {
    ciutat: 'Brussel·les', pais: 'BE',
    monuments: [
      {
        // Atomium: 9 esferes de 18 m, cub sobre un vèrtex, 102 m d'alçada.
        nom: 'Atomium', lat: 50.89494, lon: 4.34134, rumb: 30,
        peces: [
          ['esfera', 0, 9, 0, 9, '#c9ced3', { segs: 12 }],                      // vèrtex inferior
          ['esfera', 0, 93, 0, 9, '#c9ced3', { segs: 12 }],                     // vèrtex superior
          ['esfera', 0, 51, 0, 9, '#c9ced3', { segs: 12, llum: true }],         // centre
          ['esfera', 0, 37, 39.6, 9, '#c9ced3', { segs: 12 }], ['esfera', 34.3, 37, -19.8, 9, '#c9ced3', { segs: 12 }], ['esfera', -34.3, 37, -19.8, 9, '#c9ced3', { segs: 12 }],
          ['esfera', 34.3, 65, 19.8, 9, '#c9ced3', { segs: 12 }], ['esfera', 0, 65, -39.6, 9, '#c9ced3', { segs: 12 }], ['esfera', -34.3, 65, 19.8, 9, '#c9ced3', { segs: 12 }],
          // arestes: baix -> inferiors
          ['barra', 0, 9, 0, 0, 37, 39.6, 3.2, '#b7bdc3'], ['barra', 0, 9, 0, 34.3, 37, -19.8, 3.2, '#b7bdc3'], ['barra', 0, 9, 0, -34.3, 37, -19.8, 3.2, '#b7bdc3'],
          // inferiors -> superiors
          ['barra', 0, 37, 39.6, 34.3, 65, 19.8, 3.2, '#b7bdc3'], ['barra', 0, 37, 39.6, -34.3, 65, 19.8, 3.2, '#b7bdc3'],
          ['barra', 34.3, 37, -19.8, 34.3, 65, 19.8, 3.2, '#b7bdc3'], ['barra', 34.3, 37, -19.8, 0, 65, -39.6, 3.2, '#b7bdc3'],
          ['barra', -34.3, 37, -19.8, -34.3, 65, 19.8, 3.2, '#b7bdc3'], ['barra', -34.3, 37, -19.8, 0, 65, -39.6, 3.2, '#b7bdc3'],
          // superiors -> dalt
          ['barra', 34.3, 65, 19.8, 0, 93, 0, 3.2, '#b7bdc3'], ['barra', 0, 65, -39.6, 0, 93, 0, 3.2, '#b7bdc3'], ['barra', -34.3, 65, 19.8, 0, 93, 0, 3.2, '#b7bdc3'],
          // eix vertical (tub central)
          ['barra', 0, 9, 0, 0, 93, 0, 3.6, '#aeb4ba'],
        ],
      },
      {
        // Ajuntament de Brussel·les (Hôtel de Ville): façana gòtica de 66 m i torre de 96 m.
        nom: 'Ajuntament de la Grand-Place', lat: 50.84650, lon: 4.35185, rumb: 225,
        peces: [
          ['caixa', 0, 0, 0, 66, 24, 34, '#c8bb9d'],
          ['piramide', 0, 24, 0, 66, 14, 4, '#5b6670', { esc: [1, 1, 0.5] }],
          ['caixa', -18, 0, 12, 24, 26, 30, '#c2b595'],                          // ala posterior
          ['caixa', 14, 0, 14, 28, 26, 28, '#c2b595'],
          // torre (esquerra del centre)
          ['caixa', -4, 24, -8, 11, 40, 11, '#cdc0a2'],
          ['caixa', -4, 64, -8, 12.5, 3, 12.5, '#b9ac8e'],
          ['torn', -4, 67, -8, [[0, 0], [5.2, 0], [5, 12], [3.4, 20], [2.2, 24], [0.8, 27], [0, 29]], 8, '#bfb293'],
          ['esfera', -4, 96, -8, 1.0, '#e0b840', { llum: true }],                // sant Miquel
          ['caixa', -4, 70, -8, 0.8, 18, 0.8, '#c9a935'],
        ],
      },
    ],
  },
  {
    ciutat: 'Viena', pais: 'AT',
    monuments: [
      {
        // Catedral de Sant Esteve: 107 x 34 m, teulada de 60 m, torre sud de 136 m; façana a l'oest (-z amb rumb 90).
        nom: 'Catedral de Sant Esteve', lat: 48.20849, lon: 16.37315, rumb: 112,
        peces: [
          ['caixa', 0, 0, 0, 34, 28, 107, '#a29c8e'],                            // nau
          ['piramide', 0, 28, 0, 34, 34, 4, '#9a6a3a', { esc: [1, 1, 3.15] }],   // teulada multicolor
          ['piramide', 0, 28, 0, 18, 34, 4, '#d6a847', { esc: [1, 1, 5.9] }],
          ['caixa', 0, 0, 32, 36, 26, 28, '#a29c8e'],                            // transsepte
          // torre sud (136 m) i torre nord truncada
          ['caixa', 14, 0, -26, 21, 70, 21, '#aaa497'],
          ['torn', 14, 70, -26, [[8, 0], [6.5, 20], [5, 40], [3.5, 52], [1.2, 62], [0, 66]], 4, '#a39d8f'],
          ['esfera', 14, 135, -26, 0.8, '#d6b24e', { llum: true }],
          ['caixa', -14, 0, -26, 20, 52, 20, '#aaa497'],
          ['cupula', -14, 52, -26, 8, 10, '#6e8d7a'],
          // Heidentürme (torres romàniques de la façana)
          ['caixa', -8, 0, -52, 9, 40, 9, '#b0aa9c'], ['caixa', 8, 0, -52, 9, 40, 9, '#b0aa9c'],
          ['piramide', -8, 40, -52, 9, 26, 4, '#8b8579'], ['piramide', 8, 40, -52, 9, 26, 4, '#8b8579'],
          ['cil', 0, 0, 58, 12, 12, 24, 8, '#9d978a'],                            // absis
        ],
      },
      {
        // Riesenrad del Prater: roda de 61 m (hub a 33 m), 15 cabines.
        nom: 'Riesenrad del Prater', lat: 48.21662, lon: 16.39580, rumb: 50,
        peces: [
          ['tor', 0, 33, 1.8, 30.5, 0.6, '#b04a3a', { segs: 14 }],
          ['tor', 0, 33, -1.8, 30.5, 0.6, '#b04a3a', { segs: 14 }],
          ['tor', 0, 33, 1.8, 21, 0.4, '#b04a3a', { segs: 12 }],
          ['tor', 0, 33, -1.8, 21, 0.4, '#b04a3a', { segs: 12 }],
          ['cil', 0, 33, -3, 2, 2, 6, 8, '#6b4a3a', { rotX: 90 }],               // eix
          ['barra', 0, 33, 0, 0, 63.5, 0, 0.5, '#a64638'], ['barra', 0, 33, 0, 0, 2.5, 0, 0.5, '#a64638'],
          ['barra', 0, 33, 0, 30.5, 33, 0, 0.5, '#a64638'], ['barra', 0, 33, 0, -30.5, 33, 0, 0.5, '#a64638'],
          ['barra', 0, 33, 0, 21.6, 54.6, 0, 0.5, '#a64638'], ['barra', 0, 33, 0, -21.6, 54.6, 0, 0.5, '#a64638'],
          ['barra', 0, 33, 0, 21.6, 11.4, 0, 0.5, '#a64638'], ['barra', 0, 33, 0, -21.6, 11.4, 0, 0.5, '#a64638'],
          // 15 cabines (angle = 24 graus)
          ['caixa', 0, 62, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }], ['caixa', 12.4, 59, 0, 4.4, 3.2, 3.4, '#7a2f26'],
          ['caixa', 22.7, 51, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }], ['caixa', 29.6, 40, 0, 4.4, 3.2, 3.4, '#7a2f26'],
          ['caixa', 31.3, 27, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }], ['caixa', 26.7, 15, 0, 4.4, 3.2, 3.4, '#7a2f26'],
          ['caixa', 17.2, 6, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }], ['caixa', 4.8, 2, 0, 4.4, 3.2, 3.4, '#7a2f26'],
          ['caixa', -8, 3.5, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }], ['caixa', -20, 10, 0, 4.4, 3.2, 3.4, '#7a2f26'],
          ['caixa', -28, 20, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }], ['caixa', -31, 33, 0, 4.4, 3.2, 3.4, '#7a2f26'],
          ['caixa', -28, 46, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }], ['caixa', -20, 56, 0, 4.4, 3.2, 3.4, '#7a2f26'],
          ['caixa', -8, 61, 0, 4.4, 3.2, 3.4, '#7a2f26', { llum: true }],
          // suports
          ['barra', 0, 33, -3.5, -9, 0, -3.5, 1.2, '#6b4a3a'], ['barra', 0, 33, -3.5, 9, 0, -3.5, 1.2, '#6b4a3a'],
          ['barra', 0, 33, 3.5, -9, 0, 3.5, 1.2, '#6b4a3a'], ['barra', 0, 33, 3.5, 9, 0, 3.5, 1.2, '#6b4a3a'],
        ],
      },
    ],
  },
  {
    ciutat: 'Praga', pais: 'CZ',
    monuments: [
      {
        // Catedral de Sant Vit: 124 m, naus a l'est, façana oest amb dues torres; torre sud de 99 m (rumb 90: -z = oest).
        nom: 'Catedral de Sant Vit', lat: 50.09092, lon: 14.40026, rumb: 80,
        peces: [
          ['caixa', 0, 0, -20, 34, 32, 70, '#9d9a8e'],                            // nau
          ['piramide', 0, 32, -20, 34, 24, 4, '#5e6f66', { esc: [1, 1, 2.05] }],
          ['caixa', 0, 0, 5, 60, 32, 24, '#9d9a8e'],                              // transsepte
          ['caixa', 0, 0, 36, 28, 30, 36, '#9a978b'],                             // cor
          ['cil', 0, 0, 54, 14, 14, 28, 10, '#97948a'],                           // absis
          ['piramide', 0, 30, 36, 28, 20, 4, '#5e6f66', { esc: [1, 1, 1.3] }],
          // façana occidental (neogòtica) amb dues torres de 82 m
          ['caixa', -9, 0, -59, 12, 62, 12, '#a5a296'], ['caixa', 9, 0, -59, 12, 62, 12, '#a5a296'],
          ['piramide', -9, 62, -59, 12, 24, 4, '#6e7a73'], ['piramide', 9, 62, -59, 12, 24, 4, '#6e7a73'],
          ['caixa', 0, 0, -58, 14, 40, 8, '#a8a599'],
          // torre sud (99 m) amb coberta barroca
          ['caixa', 22, 0, -8, 16, 62, 16, '#a09d91'],
          ['caixa', 22, 62, -8, 14, 8, 14, '#9a978b', { llum: true }],
          ['torn', 22, 70, -8, [[0, 0], [8, 0], [8, 6], [5, 12], [3.5, 20], [2, 26], [0, 30]], 8, '#6f7e75'],
          ['esfera', 22, 99, -8, 0.8, '#d6b24e', { llum: true }],
        ],
      },
      {
        // Pont de Carles: 516 m, 16 arcs; torres d'accés a Staré Město (+z, est) i a Malá Strana (-z, oest).
        nom: 'Pont de Carles', lat: 50.08661, lon: 14.41109, rumb: 101,
        peces: [
          ['caixa', 0, 10.5, 0, 9.5, 2.5, 516, '#a89f8a'],                         // tauler
          ['caixa', -4.5, 13, 0, 0.7, 1.2, 516, '#9a917c'], ['caixa', 4.5, 13, 0, 0.7, 1.2, 516, '#9a917c'],  // baranes
          ['arc', 0, 0, -236, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, -204, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          ['arc', 0, 0, -172, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, -140, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          ['arc', 0, 0, -108, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, -76, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          ['arc', 0, 0, -44, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, -12, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          ['arc', 0, 0, 20, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, 52, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          ['arc', 0, 0, 84, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, 116, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          ['arc', 0, 0, 148, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, 180, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          ['arc', 0, 0, 212, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }], ['arc', 0, 0, 244, 32, 10.5, 3, 9.5, '#b0a790', { gir: 90 }],
          // torre de la Vella Ciutat (47 m)
          ['caixa', 0, 0, 268, 14, 36, 11, '#a69d88'],
          ['caixa', 0, 36, 268, 11, 8, 9, '#9c9380'],
          ['piramide', 0, 44, 268, 12, 12, 4, '#4f5a5e'],
          // torres de Malá Strana
          ['caixa', 0, 0, -266, 13, 22, 10, '#a69d88'], ['piramide', 0, 22, -266, 13, 8, 4, '#4f5a5e'],
          ['caixa', 0, 0, -280, 11, 40, 9, '#a09782'], ['piramide', 0, 40, -280, 11, 12, 4, '#4f5a5e'],
        ],
      },
    ],
  },
];
