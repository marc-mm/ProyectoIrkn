// Estat compartit de l'aplicació i petit bus d'esdeveniments entre mòduls.
export const E = {
  inicio: null,
  aeropuertos: [],        // [iata, nom, ciutat, país, lat, lon, pes]
  aerolineas: [],         // [icao, nom, color]
  fases: [],
  modo: 'simulado',
  escala: 60,
  pausado: false,
  horaMs: Date.now(),     // hora simulada en l'últim 'estado'
  tHora: 0,               // performance.now() en rebre'l
  conflictos: [],
  nVuelos: 0,
  selVuelo: -1,
  selAero: null,
  seguir: false,
  info: null,             // últim infoVuelo
  infoAero: null,
  stats: null,
  proyecto: null,         // {centro, caja, distanciaSeguridadNM}
  tipos: [],              // [codi, nom] dels tipus d'avió (de 'inicio')
  pilotant: false,        // cert mentre l'usuari pilota un avió
  intrusos: null,         // ids del trànsit en conflicte amb l'avió pilotat
  so: true,
  capas: { aeropuertos: true, rutas: true, rastros: true, etiquetas: true, conflictos: true, diaNoche: true, atmosfera: true, monuments: true, satel: true },
};

// Hora simulada (ms UTC) en l'instant 'ahora' (performance.now), extrapolada amb l'escala.
export function horaSim(ahora) {
  return E.pausado ? E.horaMs : E.horaMs + (ahora - E.tHora) * E.escala;
}

const oyentes = {};
export function on(tipo, fn) { (oyentes[tipo] ||= []).push(fn); }
export function emit(tipo, dato) {
  const l = oyentes[tipo];
  if (l) for (let i = 0; i < l.length; i++) l[i](dato);
}
