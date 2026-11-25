// Mode de pilotatge: l'usuari pilota qualsevol avió amb el teclat. Física "arcade" molt simplificada:
//   - Sense tecles, l'avió torna sol a vol recte i anivellat (pitch i alabeig tornen a 0, la potència es manté).
//   - W/S o ↑/↓: pitch (W = morro avall, com una palanca; es pot invertir) · A/D o ←/→: alabeig · Q/E: guinyada
//   - R/F o Re Pàg/Av Pàg: potència · V: vista (persecució / cabina) · Esc: deixar els comandaments
// L'avió comença exactament on era, amb el seu rumb, altitud i velocitat. La posició s'envia al C# ~10 cops per segon
// (que la fa servir per detectar conflictes) i aquí es comprova també el trànsit proper per avisar a l'instant.
import * as THREE from 'three';
import { E, on, emit } from './estat.js';
import { baseENU, radiAlt, DEG, NM_PER_RAD, M_A_RADIS, desti, vecALl, distAngular, rumbInicial } from './geo.js';
import { ST, DX, ALT } from './aviones.js';
import { clonarModel, modelDeTipus } from './modelos.js';

const KT_A_MS = 0.514444, FPM_PER_KT = 101.2686;
const $ = id => document.getElementById(id);

// Velocitats (kt) mínima i màxima segons el model (els turbohèlix són més lents).
const limitsVel = model => model === 'AT76' ? [95, 300] : [120, 540];

export function crearPilotatge({ av, camara, camera, escena, lienzo, enviar }) {
  const S = {
    actiu: false, id: -1, lat: 0, lon: 0, alt: 0, rumb: 0, pitch: 0, roll: 0, vel: 0, thr: 0.5, vv: 0,
    model: 'A320', color: '#9aa6b5', cs: '', nomTipus: '', vista: 'persecucio', invertir: false,
  };
  const tecles = new Set();
  let obj = null, objFallback = null, llargada = 40;
  let rumbCam = 0, orbYaw = 0, orbPitch = 11, distCam = 110, arrossega = null, tAlliberat = 0;
  let tEnvia = 0, tTransit = 0, tHud = 0, estatAlerta = '', intrusos = new Set();
  let ctxAudio = null, onSortir = null;
  const ll = [0, 0];
  const e = new THREE.Vector3(), n = new THREE.Vector3(), u = new THREE.Vector3(), f = new THREE.Vector3(), x = new THREE.Vector3();
  const P = new THREE.Vector3(), mB = new THREE.Matrix4(), q = new THREE.Quaternion(), qa = new THREE.Quaternion();
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  // ---------- So ----------
  function so(tipus) {
    if (E.so === false) return;
    try {
      ctxAudio ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = ctxAudio.currentTime;
      const notes = tipus === 'conflicte' ? [988, 740, 988, 740] : tipus === 'terra' ? [440, 440, 440] : [660, 880];
      notes.forEach((fq, k) => {
        const o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
        o.type = tipus === 'transit' ? 'sine' : 'square'; o.frequency.value = fq;
        const t0 = t + k * 0.17;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);
        o.connect(g); g.connect(ctxAudio.destination); o.start(t0); o.stop(t0 + 0.16);
      });
    } catch { /* l'àudio pot estar bloquejat */ }
  }

  // ---------- Teclat i ratolí ----------
  const TECLES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyR', 'KeyF', 'KeyV', 'ArrowUp', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Escape', 'Space']);
  addEventListener('keydown', ev => {
    if (!S.actiu) return;
    if (ev.target && ev.target.tagName === 'INPUT' && ev.target.type === 'text') return;
    if (!TECLES.has(ev.code)) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    if (ev.code === 'Escape') { sortir(true); return; }
    if (ev.code === 'KeyV' && !ev.repeat) { canviaVista(); return; }
    tecles.add(ev.code);
  }, true);
  addEventListener('keyup', ev => { tecles.delete(ev.code); });
  addEventListener('blur', () => tecles.clear());

  lienzo.addEventListener('pointerdown', ev => {
    if (!S.actiu) return;
    arrossega = { x: ev.clientX, y: ev.clientY };
    try { lienzo.setPointerCapture(ev.pointerId); } catch { /* res */ }
  });
  lienzo.addEventListener('pointermove', ev => {
    if (!S.actiu || !arrossega) return;
    orbYaw = (orbYaw - (ev.clientX - arrossega.x) * 0.35 + 540) % 360 - 180;
    orbPitch = Math.min(80, Math.max(-25, orbPitch + (ev.clientY - arrossega.y) * 0.3));
    arrossega.x = ev.clientX; arrossega.y = ev.clientY;
  });
  const deixa = () => { if (arrossega) { arrossega = null; tAlliberat = performance.now(); } };
  lienzo.addEventListener('pointerup', deixa);
  lienzo.addEventListener('pointercancel', deixa);
  lienzo.addEventListener('wheel', ev => {
    if (!S.actiu) return;
    distCam = Math.min(4000, Math.max(llargada * 0.9, distCam * Math.exp(ev.deltaY * 0.0012)));
  }, { passive: true });

  function canviaVista() {
    S.vista = S.vista === 'persecucio' ? 'cabina' : 'persecucio';
    const t = $('hp-vista-t') || $('hp-vista');
    if (t) {
      const txt = S.vista === 'persecucio' ? 'Vista: persecució' : 'Vista: cabina';
      if (t.id === 'hp-vista-t') t.textContent = txt;
      else if (t.firstChild && t.firstChild.nodeType === 3) t.firstChild.textContent = txt + ' ';
    }
  }

  // ---------- Model 3D de l'avió pilotat ----------
  function crearObjecte() {
    if (obj) escena.remove(obj);
    obj = clonarModel(S.model, S.color);
    if (obj) { llargada = obj.userData.llargada; }
    else {
      // El model detallat encara no ha arribat: silueta low-poly provisional
      if (!objFallback) {
        objFallback = new THREE.Mesh(av.malla.geometry, new THREE.MeshStandardMaterial({ color: 0xe8edf3, roughness: 0.5, metalness: 0.2 }));
        objFallback.userData.llargada = 1;
      }
      obj = objFallback; llargada = 40;
    }
    obj.frustumCulled = false;
    escena.add(obj);
    distCam = Math.max(distCam, llargada * 2.4 + 30);
  }

  // ---------- Inici i final ----------
  // Comença a pilotar l'avió amb aquest id des de la posició on és ara.
  function iniciar(id) {
    const i = av.mapa.get(id);
    if (i === undefined || S.actiu && S.id === id) return false;
    if (S.actiu) sortir(true);
    const b = i * ST;
    vecALl(av.F[b + DX], av.F[b + DX + 1], av.F[b + DX + 2], ll);
    S.id = id; S.lat = ll[0]; S.lon = ll[1];
    S.alt = Math.max(0, av.F[b + ALT]); S.rumb = av.F[b + 16]; S.vel = Math.max(0, av.F[b + 14]);
    S.pitch = 0; S.roll = 0; S.vv = 0;
    const tip = av.tipo[i] >= 0 && E.tipos && E.tipos[av.tipo[i]] ? E.tipos[av.tipo[i]] : null;
    S.model = modelDeTipus(tip ? tip[0] : 'A320');
    S.nomTipus = tip ? tip[1] : 'Avió';
    const cia = av.aero[i] >= 0 ? E.aerolineas[av.aero[i]] : null;
    S.color = cia ? cia[2] : av.aero[i] === -2 ? '#5ef2ff' : '#9aa6b5';
    S.cs = av.cs[i];
    const [vmin, vmax] = limitsVel(S.model);
    S.thr = Math.min(1, Math.max(0.05, (S.vel - vmin) / (vmax - vmin)));
    if (S.vel < 1) S.thr = 0.35;
    rumbCam = S.rumb; orbYaw = 0; orbPitch = 11; distCam = 110;
    S.actiu = true; E.pilotant = true; E.seguir = false;
    tecles.clear(); intrusos = new Set(); E.intrusos = intrusos; estatAlerta = '';
    crearObjecte();
    av.ponPilotat(id);
    camara.ponExtern(true);
    document.body.classList.add('pilotant');
    const hud = $('hud-pilot'); if (hud) hud.hidden = false;
    const al = $('hp-alerta'); if (al) al.hidden = true;
    if ($('hp-cs')) $('hp-cs').textContent = S.cs;
    if ($('hp-tipus')) $('hp-tipus').textContent = S.nomTipus;
    if ($('hp-ruta')) $('hp-ruta').textContent = '';
    if ($('hp-invertir')) $('hp-invertir').checked = S.invertir;
    S.vista = 'cabina'; canviaVista();
    enviaPosicio();
    emit('aviso', { nivel: 'ok', texto: `Pilotes el ${S.cs}. Sense tecles, l'avió va recte i anivellat. Esc per deixar-lo.` });
    return true;
  }

  // Deixa els comandaments (avisar = enviar-ho al C#). La càmera torna a la vista orbital mirant l'avió.
  function sortir(avisar = true) {
    if (!S.actiu) return;
    if (avisar) enviar({ tipo: 'dejarPilotar' });
    S.actiu = false; E.pilotant = false; tecles.clear();
    intrusos.clear(); E.intrusos = null;
    if (obj) { escena.remove(obj); obj = null; }
    av.ponPilotat(-1);
    document.body.classList.remove('pilotant');
    const hud = $('hud-pilot'); if (hud) hud.hidden = true;
    posicioAvio(P);
    camara.ponExtern(false, P);
    const id = S.id; S.id = -1;
    if (onSortir) onSortir(id);
  }

  // ---------- Física ----------
  const k = c => tecles.has(c);
  function pas(dt) {
    const [vmin, vmax] = limitsVel(S.model);
    let pIn = ((k('KeyS') || k('ArrowDown')) ? 1 : 0) - ((k('KeyW') || k('ArrowUp')) ? 1 : 0);   // + = morro amunt
    if (S.invertir) pIn = -pIn;
    const rIn = ((k('KeyD') || k('ArrowRight')) ? 1 : 0) - ((k('KeyA') || k('ArrowLeft')) ? 1 : 0);  // + = dreta
    const yIn = (k('KeyE') ? 1 : 0) - (k('KeyQ') ? 1 : 0);
    const tIn = ((k('KeyR') || k('PageUp')) ? 1 : 0) - ((k('KeyF') || k('PageDown')) ? 1 : 0);

    S.thr = Math.min(1, Math.max(0, S.thr + tIn * 0.35 * dt));
    // Alabeig: amb tecla gira a 60°/s (es pot fer un tonell); sense, torna a 0 (anivellat)
    if (rIn) { S.roll += rIn * 60 * dt; S.roll = ((S.roll + 540) % 360) - 180; }
    else S.roll -= S.roll * (1 - Math.exp(-1.8 * dt));
    const fi = S.roll * DEG, th = S.pitch * DEG;
    // Pitch en eixos del cos: amb l'avió inclinat, estirar també fa girar
    const qb = pIn * 20;
    S.pitch += qb * Math.cos(fi) * dt;
    if (!pIn) S.pitch -= S.pitch * (1 - Math.exp(-1.2 * dt));
    S.pitch = Math.min(80, Math.max(-80, S.pitch));
    const vms = Math.max(45, S.vel * KT_A_MS);
    let dRumb = qb * Math.sin(fi) / Math.max(0.2, Math.cos(th));
    dRumb += 9.81 * Math.sin(fi) / vms / DEG * 1.8;          // gir per sustentació en alabejar (una mica exagerat)
    dRumb += yIn * 8;
    S.rumb = (S.rumb + dRumb * dt + 360) % 360;
    // Velocitat: la potència marca la velocitat objectiu; pujar la redueix i baixar l'augmenta
    const vObj = vmin + S.thr * (vmax - vmin) - 160 * Math.sin(th);
    S.vel += (vObj - S.vel) * (1 - Math.exp(-0.3 * dt));
    if (S.vel < 0) S.vel = 0;
    // Vertical i horitzontal
    S.vv = S.vel * FPM_PER_KT * Math.sin(th);
    S.alt += S.vv / 60 * dt;
    if (S.alt <= 0) { S.alt = 0; if (S.pitch < 0) S.pitch = 0; S.vv = Math.max(0, S.vv); }
    if (S.alt > 60000) { S.alt = 60000; S.vv = Math.min(0, S.vv); }
    const d = S.vel * Math.cos(th) * dt / 3600 / NM_PER_RAD;
    if (d > 0) desti(S.lat, S.lon, S.rumb, d, ll), S.lat = ll[0], S.lon = ll[1];
  }

  // Posició 3D de l'avió (el centre del fuselatge, una mica per sobre del terra quan és a terra).
  function posicioAvio(out) {
    baseENU(S.lat, S.lon, e, n, u);
    return out.copy(u).multiplyScalar(radiAlt(S.alt) + 3.2 * M_A_RADIS);
  }

  // ---------- Actualització per fotograma ----------
  function actualizar(dtReal) {
    if (!S.actiu) return;
    const dt = Math.min(0.05, dtReal);
    pas(dt);
    posicioAvio(P);
    // Orientació: base (esquerra, amunt, endavant) segons el rumb, després pitch i alabeig en eixos del cos
    f.copy(n).multiplyScalar(Math.cos(S.rumb * DEG)).addScaledVector(e, Math.sin(S.rumb * DEG));
    x.crossVectors(u, f);
    mB.makeBasis(x, u, f);
    q.setFromRotationMatrix(mB);
    q.multiply(qa.setFromAxisAngle(AX, -S.pitch * DEG));
    q.multiply(qa.setFromAxisAngle(AZ, S.roll * DEG));
    if (obj) {
      obj.position.copy(P); obj.quaternion.copy(q);
      obj.scale.setScalar(obj === objFallback ? 40 * M_A_RADIS : M_A_RADIS);
      if (obj.userData.tren) obj.userData.tren.visible = S.alt < 1500;
      obj.visible = S.vista !== 'cabina';
      if (obj === objFallback) { const o2 = clonarModel(S.model, S.color); if (o2) { escena.remove(obj); obj = o2; llargada = obj.userData.llargada; escena.add(obj); } }
    }
    // Estat per als altres mòduls (rutes, anells, conflictes)
    const pil = av.pil;
    tmp.copy(u);
    pil.x = tmp.x; pil.y = tmp.y; pil.z = tmp.z; pil.fx = f.x; pil.fy = f.y; pil.fz = f.z;
    pil.alt = S.alt; pil.vel = S.vel; pil.rumb = S.rumb;

    // Càmera
    if (S.vista === 'cabina') {
      tmp.set(0, 1.6, llargada * 0.43).applyQuaternion(q).multiplyScalar(M_A_RADIS);
      camera.position.copy(P).add(tmp);
      camera.quaternion.copy(q).multiply(qa.setFromAxisAngle(AY, Math.PI));
    } else {
      // Persecució: darrere i una mica per sobre, sense girar amb l'alabeig; el rumb de la càmera segueix amb retard
      let dR = ((S.rumb - rumbCam + 540) % 360) - 180;
      rumbCam = (rumbCam + dR * (1 - Math.exp(-3 * dt)) + 360) % 360;
      if (!arrossega && performance.now() - tAlliberat > 1800) {
        orbYaw -= orbYaw * (1 - Math.exp(-1.2 * dt));
        orbPitch += (11 - orbPitch) * (1 - Math.exp(-1.2 * dt));
      }
      const az = (rumbCam + 180 + orbYaw) * DEG, el = orbPitch * DEG;
      tmp.copy(n).multiplyScalar(Math.cos(az)).addScaledVector(e, Math.sin(az)).multiplyScalar(Math.cos(el)).addScaledVector(u, Math.sin(el));
      camera.position.copy(P).addScaledVector(tmp, distCam * M_A_RADIS);
      // Que la càmera no baixi del terra
      const rMin = 1 + 4 * M_A_RADIS;
      if (camera.position.length() < rMin) camera.position.setLength(rMin);
      camera.up.copy(u);
      tmp2.copy(P).addScaledVector(u, llargada * 0.08 * M_A_RADIS);
      camera.lookAt(tmp2);
    }

    const ara = performance.now();
    if (ara - tEnvia > 100) { tEnvia = ara; enviaPosicio(); }
    if (ara - tTransit > 250) { tTransit = ara; comprovaTransit(); }
    if (ara - tHud > 66) { tHud = ara; pintaHud(); }
  }

  function enviaPosicio() {
    enviar({ tipo: 'pilotar', id: S.id, lat: +S.lat.toFixed(6), lon: +S.lon.toFixed(6), alt: Math.round(S.alt),
      rumbo: +S.rumb.toFixed(1), vel: Math.round(S.vel), vv: Math.round(S.vv) });
  }

  // ---------- Trànsit i conflictes ----------
  // Conflicte: < 5 NM i < 1000 ft (o el C# l'ha detectat). Trànsit proper: < 10 NM i < 2500 ft.
  function comprovaTransit() {
    const F = av.F, iPil = av.mapa.get(S.id);
    let pitjor = null;
    intrusos.clear();
    const ux = u.x, uy = u.y, uz = u.z;
    for (let i = 0; i < av.n; i++) {
      if (i === iPil) continue;
      const fs = av.fase[i];
      if (fs === 0 || fs === 6) continue;                    // a terra
      const b = i * ST;
      const c = ux * F[b + DX] + uy * F[b + DX + 1] + uz * F[b + DX + 2];
      if (c < 0.99996) continue;                             // > ~31 NM: descartat ràpid
      const dNM = Math.acos(Math.min(1, c)) * NM_PER_RAD;
      const dh = Math.abs(F[b + ALT] - S.alt);
      const nivell = dNM < 5 && dh < 1000 ? 2 : dNM < 10 && dh < 2500 ? 1 : 0;
      if (!nivell) continue;
      if (nivell === 2) intrusos.add(av.ids[i]);
      if (!pitjor || nivell > pitjor.nivell || (nivell === pitjor.nivell && dNM < pitjor.d)) pitjor = { nivell, d: dNM, dh, cs: av.cs[i] };
    }
    for (const cf of E.conflictos || []) {
      if (cf[0] !== S.id && cf[1] !== S.id) continue;
      const altre = cf[0] === S.id ? cf[1] : cf[0];
      const j = av.mapa.get(altre);
      intrusos.add(altre);
      if (!pitjor || pitjor.nivell < 2) pitjor = { nivell: 2, d: cf[2], dh: cf[3], cs: j !== undefined ? av.cs[j] : '#' + altre };
    }
    let nou = '', text = '';
    if (pitjor && pitjor.nivell === 2) {
      nou = 'conflicte';
      text = `CONFLICTE — ${pitjor.cs} a ${pitjor.d.toFixed(1).replace('.', ',')} NM / ${Math.round(pitjor.dh)} ft. Canvia d'altitud o de rumb!`;
    } else if (S.alt < 800 && S.vv < -700) { nou = 'terra'; text = 'TERRA! Puja (estira: S o ↓)'; }
    else if (pitjor) { nou = 'transit'; text = `TRÀNSIT PROPER — ${pitjor.cs} a ${pitjor.d.toFixed(1).replace('.', ',')} NM / ${Math.round(pitjor.dh)} ft`; }
    const al = $('hp-alerta');
    if (al) {
      al.hidden = !nou;
      al.classList.toggle('conflicte', nou === 'conflicte');
      al.classList.toggle('transit', nou === 'transit');
      al.classList.toggle('terra', nou === 'terra');
      const t = $('hp-alerta-text') || al;
      if (t.textContent !== text) t.textContent = text;
    }
    if (nou && nou !== estatAlerta) {
      so(nou);
      if (nou === 'conflicte') emit('aviso', { nivel: 'error', texto: 'Conflicte amb ' + pitjor.cs + '! Separa\'t: 5 NM o 1000 ft.' });
    }
    estatAlerta = nou;
  }

  // ---------- HUD ----------
  const fmt = v => Math.round(v).toLocaleString('ca-ES');
  function posaText(id, t) { const el = $(id); if (el && el.textContent !== t) el.textContent = t; }
  function pintaHud() {
    posaText('hp-vel', fmt(S.vel));
    posaText('hp-alt', fmt(S.alt));
    posaText('hp-vv', (S.vv > 0 ? '+' : '') + fmt(S.vv));
    posaText('hp-rumb', String(Math.round(S.rumb) % 360).padStart(3, '0') + '°');
    posaText('hp-thr', Math.round(S.thr * 100) + ' %');
    const tb = $('hp-thr-barra'); if (tb) tb.style.height = (S.thr * 100).toFixed(1) + '%';
    const hz = $('hp-horitzo-cel'); if (hz) hz.style.transform = `rotate(${(-S.roll).toFixed(1)}deg) translateY(${(S.pitch * 2).toFixed(1)}px)`;
    const rs = $('hp-rosa'); if (rs) rs.style.transform = `rotate(${(-S.rumb).toFixed(1)}deg)`;
    // Ruta planificada (de l'infoVuelo de l'avió, que continua seleccionat)
    const info = E.info && E.info.id === S.id ? E.info : null;
    if (info) {
      if (info.origen && info.destino) posaText('hp-ruta', `${info.origen.iata} → ${info.destino.iata}`);
      if (info.destino) {
        const dNM = distAngular(S.lat, S.lon, info.destino.lat, info.destino.lon) * NM_PER_RAD;
        const rumbDest = rumbInicial(S.lat, S.lon, info.destino.lat, info.destino.lon);
        posaText('hp-dest', `${info.destino.iata} a ${fmt(dNM)} NM · rumb ${String(Math.round(rumbDest) % 360).padStart(3, '0')}°`);
      }
      if (info.ruta && info.ruta.length > 1) posaText('hp-desv', `Desviació de la ruta: ${desviacio(info.ruta).toFixed(1).replace('.', ',')} NM`);
    }
  }

  // Distància (NM) de la posició actual a la ruta planificada (mínim sobre els trams, aproximació local plana).
  function desviacio(ruta) {
    let min = Infinity;
    const cl = Math.cos(S.lat * DEG);
    for (let i = 1; i < ruta.length; i++) {
      const a = ruta[i - 1], b = ruta[i];
      let dlonA = ((a[1] - S.lon + 540) % 360) - 180, dlonB = ((b[1] - S.lon + 540) % 360) - 180;
      const ax = dlonA * 60 * cl, ay = (a[0] - S.lat) * 60, bx = dlonB * 60 * cl, by = (b[0] - S.lat) * 60;
      const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
      const t = l2 > 0 ? Math.min(1, Math.max(0, -(ax * vx + ay * vy) / l2)) : 0;
      const px = ax + vx * t, py = ay + vy * t;
      min = Math.min(min, Math.hypot(px, py));
    }
    return min;
  }

  // ---------- Missatges ----------
  on('finPilotaje', m => {
    if (!S.actiu) return;
    sortir(false);
    emit('aviso', { nivel: 'error', texto: m.motivo || 'S\'ha acabat el pilotatge.' });
  });
  on('inicio', () => sortir(false));

  // Botons del HUD (si existeixen)
  const enllaca = () => {
    $('hp-sortir')?.addEventListener('click', () => sortir(true));
    $('hp-vista')?.addEventListener('click', e2 => { canviaVista(); e2.currentTarget.blur(); });
    $('hp-invertir')?.addEventListener('change', e2 => { S.invertir = e2.target.checked; e2.target.blur(); });
  };
  enllaca();

  return {
    iniciar, sortir, actualizar,
    get actiu() { return S.actiu; },
    get id() { return S.id; },
    alSortir(fn) { onSortir = fn; },
    estat: () => ({ ...S }),
    // Per a les proves: col·loca l'avió pilotat en una posició concreta.
    posar(lat, lon, alt, rumb, vel) {
      if (!S.actiu) return;
      S.lat = lat; S.lon = lon; S.alt = alt; S.rumb = rumb; rumbCam = rumb; S.pitch = 0; S.roll = 0;
      if (vel !== undefined) { S.vel = vel; const [a, b] = limitsVel(S.model); S.thr = Math.min(1, Math.max(0, (vel - a) / (b - a))); }
    },
  };
}
