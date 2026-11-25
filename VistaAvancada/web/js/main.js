// Arrencada de l'aplicació: escena three.js, bucle de render i unió entre mòduls.
import * as THREE from 'three';
import { E, on, horaSim } from './estat.js';
import { crearGlobo } from './globo.js';
import { crearCamara } from './camara.js';
import { crearAviones } from './aviones.js';
import { crearCapas } from './capas.js';
import { crearInterfaz } from './interfaz.js';
import { crearMonuments } from './monuments.js';
import { crearPilotatge } from './pilotatge.js';
import { precarregarModels } from './modelos.js';
import { actualitzaEscalaVisual } from './geo.js';
import { iniciar, enviar, enDemo } from './puente.js';

const q = new URLSearchParams(location.search);

// Depuració: en servidor local, els errors de JS s'envien a /__log per poder-los llegir.
if (location.hostname === 'localhost') {
  const log = t => { try { fetch('/__log', { method: 'POST', body: t + '\n' }); } catch { /* res */ } };
  addEventListener('error', e => log('ERROR ' + e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  addEventListener('unhandledrejection', e => log('REJECT ' + (e.reason && (e.reason.stack || e.reason.message || e.reason))));
  const ce = console.error, cw = console.warn;
  console.error = (...a) => { log('console.error ' + a.join(' ')); ce(...a); };
  console.warn = (...a) => { log('console.warn ' + a.join(' ')); cw(...a); };
}

// Profunditat logarítmica a escala de planeta: l'escena fa servir radis terrestres (1 = 6371 km), però la fórmula
// de three.js (log2(1 + w)) només és logarítmica per a distàncies > 1. Es passa w a metres perquè tingui precisió
// tant a 30 metres (un avió pilotat) com a 40.000 km (el planeta sencer).
THREE.ShaderChunk.logdepthbuf_vertex = THREE.ShaderChunk.logdepthbuf_vertex.replace('1.0 + gl_Position.w', '1.0 + gl_Position.w * 6371000.0');

async function arrenca() {
  const lienzo = document.getElementById('lienzo');
  const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;      // els shaders propis escriuen directament en espai de pantalla
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x02040a);
  const escena = new THREE.Scene();
  // near/far: el far es multiplica per 6.371.000 perquè la profunditat logarítmica de three.js el fa servir en metres
  const camera = new THREE.PerspectiveCamera(45, 1, 1e-8, 300 * 6371000);
  camera.position.set(0, 0, 12);

  const globo = await crearGlobo(renderer, escena, camera);
  const camara = crearCamara(camera, lienzo);
  const av = crearAviones(escena, renderer);
  const capas = crearCapas(escena, av, camera);
  const monuments = crearMonuments(escena, document.getElementById('etiquetas'));
  const pilot = crearPilotatge({ av, camara, camera, escena, lienzo, enviar });
  const ui = crearInterfaz({ av, capas, camara, globo, enviar, enDemo, monuments, pilot });
  // En deixar els comandaments, la càmera continua seguint l'avió
  pilot.alSortir(id => { if (av.mapa.has(id)) { ui.selVuelo(id, false); ui.ponSeguir(true); } });
  precarregarModels();
  window.__app = { camara, av, pilot, monuments, globo, capas, ui, camera };     // per a les proves

  let W = 1, H = 1;
  function redim() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  addEventListener('resize', redim); redim();

  // ---------- Missatges del C# ----------
  let selPendent = q.has('sel') ? +q.get('sel') : null;
  on('inicio', m => {
    E.inicio = m; E.modo = m.modo; E.aeropuertos = m.aeropuertos; E.aerolineas = m.aerolineas; E.fases = m.fases || [];
    E.tipos = m.tipos || [];
    E.escala = m.escala; E.horaMs = Date.parse(m.hora); E.tHora = performance.now();
    av.limpiar(); av.fijarAerolineas(m.aerolineas, E.tipos); capas.fijarAeropuertos(m.aeropuertos);
    if (q.get('panel') === 'aeroport') ui.selAero(q.get('apt') || 'BCN', !q.has('nofly'));
  });
  on('estado', m => {
    const ara = performance.now();
    E.horaMs = Date.parse(m.hora); E.tHora = ara; E.escala = m.escala; E.pausado = !!m.pausado; E.modo = m.modo || E.modo;
    E.conflictos = m.conflictos; E.nVuelos = m.vuelos.length;
    av.aplicarEstado(m.vuelos, ara / 1000);
    ui.alEstado(m);
    if (q.has('buscar') && !window.__buscat) { window.__buscat = 1; window.__depuraBuscar = true; ui.buscar(q.get('buscar')); }
    if (selPendent !== null) {
      // sel=-1 tria el primer avió en creuer (per a proves)
      if (selPendent === -1) for (let i = 0; i < av.n; i++) if (av.fase[i] === 3) { selPendent = av.ids[i]; break; }
      if (av.mapa.has(selPendent)) {
        ui.selVuelo(selPendent, !q.has('nofly'));
        if (q.has('seguir')) ui.ponSeguir(true);
        if (q.has('pilot')) setTimeout(() => pilot.iniciar(E.selVuelo), 600);
        selPendent = null;
      }
    }
  });
  on('volarA', m => camara.volarA(m.lat, m.lon, m.distancia ?? 0.3));

  // ---------- Ratolí: hover i clic (no durant el pilotatge) ----------
  let mx = -1, my = -1, moviment = false, baixa = null;
  lienzo.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY; moviment = true;
    if (baixa && E.seguir && Math.hypot(mx - baixa.x, my - baixa.y) > 8) ui.ponSeguir(false);
  });
  lienzo.addEventListener('pointerleave', () => { mx = -1; ui.ocultaTip(); av.ponHover(-1); });
  lienzo.addEventListener('pointerdown', e => { baixa = { x: e.clientX, y: e.clientY, t: performance.now(), b: e.button }; });
  lienzo.addEventListener('pointerup', e => {
    if (!baixa) return;
    const clic = baixa.b === 0 && Math.hypot(e.clientX - baixa.x, e.clientY - baixa.y) < 5 && performance.now() - baixa.t < 600;
    baixa = null;
    if (!clic || E.pilotant) return;
    const i = av.pick(e.clientX, e.clientY, 14);
    if (i >= 0) { ui.selVuelo(av.ids[i]); return; }
    const mo = monuments.pick(e.clientX, e.clientY, 22);
    if (mo) { ui.selMonument(mo); return; }
    const a = capas.pickAeropuerto(e.clientX, e.clientY, 10);
    if (a) { ui.selAero(a); return; }
    ui.deselect();
    monuments.seleccionar(null);
  });

  // ---------- Introducció i càmera inicial ----------
  const cm = (q.get('cam') || '').split(',').map(Number);
  if (cm.length === 3 && cm.every(isFinite)) camara.posar(cm[0], cm[1], cm[2]);
  else if (q.get('intro') === '0') camara.posar(41, 8, 1.5);
  else { camara.posar(15, -40, 13); camara.volarA(41, 7, 1.5, 5.5); }
  if (q.has('capes')) ui.mostrarCapes();
  if (q.get('ajuda') === '1') ui.mostrarAyuda(true);
  if (innerHeight < 700 && !q.has('stats')) ui.plegarEstadistiques();
  if (q.get('capa')) for (const c of q.get('capa').split(',')) { document.querySelector(`[data-capa="${c}"]`)?.click(); }
  if (q.has('mon')) monuments.llesta.then(() => { const r = monuments.cercar(q.get('mon'), 1); if (r[0]) ui.selMonument(r[0]); });

  // ---------- Bucle ----------
  let prev = performance.now(), frame = 0, fpsT = prev, fpsN = 0, degradat = false;
  const ESTAT_FIXE = q.has('fixa');
  function bucle() {
    requestAnimationFrame(bucle);
    const t = performance.now(), dt = Math.min(0.1, (t - prev) / 1000); prev = t;
    const s = t / 1000;
    frame++;
    if (E.pilotant) pilot.actualizar(dt); else camara.actualizar(dt);
    camera.updateMatrixWorld();
    actualitzaEscalaVisual(camera.position.length() - 1);
    const ms = horaSim(t);
    globo.actualizar(ms, camera, H, frame);
    av.actualizar(s, s, camera, W, H);
    capas.actualizar(s, s, W, H, E.pilotant ? -1 : E.selVuelo, E.selAero, E.conflictos, camara.altura(), frame);
    monuments.actualizar(camera, W, H, av.pvm, globo.dirSol, frame);
    ui.actualizarReloj(ms);
    ui.pintaConflictes(t);

    // Hover: cerca per pantalla només si el ratolí s'ha mogut
    if (moviment && mx >= 0 && !baixa && !E.pilotant) {
      moviment = false;
      const i = av.pick(mx, my, 14);
      av.ponHover(i);
      if (i >= 0) { ui.tooltipVol(i, mx, my); lienzo.style.cursor = 'pointer'; }
      else {
        const mo = monuments.pick(mx, my, 22);
        const a = mo ? null : capas.pickAeropuerto(mx, my, 10);
        if (mo) { ui.tooltipMon(mo, mx, my); lienzo.style.cursor = 'pointer'; }
        else if (a) { ui.tooltipAero(a, mx, my); lienzo.style.cursor = 'pointer'; }
        else { ui.ocultaTip(); lienzo.style.cursor = ''; }
      }
    } else if (E.pilotant && moviment) { moviment = false; ui.ocultaTip(); av.ponHover(-1); lienzo.style.cursor = 'grab'; }
    renderer.render(escena, camera);

    // Qualitat adaptativa: si va lent, desactiva el desenfocament del vidre i baixa la resolució
    fpsN++;
    if (t - fpsT > 3000) {
      const fps = fpsN * 1000 / (t - fpsT); fpsT = t; fpsN = 0;
      if (!ESTAT_FIXE && !degradat && t > 8000 && fps < 38) {
        degradat = true; document.body.classList.add('lleuger');
        renderer.setPixelRatio(1); redim();
      }
      window.__fps = fps;
    }
  }
  bucle();
  await iniciar();
  setTimeout(() => document.getElementById('carga').classList.add('fora'), 400);
}

arrenca().catch(e => { console.error('Error d\'arrencada: ' + (e.stack || e)); });
