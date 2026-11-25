// Càmera del globus (estil Google Earth): un punt de mira (sobre la superfície o sobre un avió), una distància,
// un rumb i una inclinació. Arrossegar = moure el globus; botó dret (o Ctrl + arrossegar) = girar i inclinar;
// roda = zoom cap al cursor. A mesura que t'acostes la vista s'inclina sola per veure monuments i avions de costat.
// Quan un altre mòdul (el pilotatge) controla la càmera, aquest queda en mode "extern" i no la toca.
import * as THREE from 'three';
import { llAVec } from './geo.js';

const D_MIN = 0.00004, D_MAX = 7;               // distància al punt de mira en radis (~250 m .. 44.600 km)
const H_CAM_MIN = 0.000005;                      // la càmera no baixa de ~30 m sobre el terra
const TILT_MAX = 80;
const DEG = Math.PI / 180;
const suau = t => t * t * t * (t * (t * 6 - 15) + 10);          // smootherstep

// Inclinació màxima segons la distància: 0 en vista global (planeta centrat) i fins a 78° a prop del terra.
function tiltMaxim(d) {
  if (d >= 0.45) return 0;
  const t = Math.log(0.45 / d) / Math.log(0.45 / 0.004);
  return 78 * Math.min(1, Math.max(0, t));
}

export function crearCamara(cam, dom) {
  const T = new THREE.Vector3(1, 0, 0);          // punt de mira (posició; |T| > 1 si és un avió en vol)
  let dist = 3, distObj = null, head = 0, tiltUsuari = 58, tiltEf = 0;
  let vol = null, seguint = null, extern = false;
  let velA = 0, velB = 0;                         // inèrcia de l'arrossegament (rad/s cap a la dreta / endavant)
  const E = new THREE.Vector3(0, 0, -1), N = new THREE.Vector3(0, 1, 0), U = new THREE.Vector3(1, 0, 0);
  const Hd = new THREE.Vector3(), Rd = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const Y = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), ray = new THREE.Ray();
  const buf = [0, 0, 0];

  // Base local en el punt de mira: U amunt, E est, N nord, Hd direcció horitzontal de la vista, Rd dreta de pantalla.
  function base() {
    U.copy(T).normalize();
    tmp.crossVectors(Y, U);
    if (tmp.lengthSq() > 1e-12) E.copy(tmp.normalize());       // als pols es conserva l'est anterior
    N.crossVectors(U, E).normalize();
    E.crossVectors(N, U).normalize();
    Hd.copy(N).multiplyScalar(Math.cos(head * DEG)).addScaledVector(E, Math.sin(head * DEG));
    Rd.crossVectors(Hd, U);
  }

  // Mou el punt de mira sobre l'esfera: a radis cap a la dreta de pantalla i b radis cap endavant.
  function desplaca(a, b) {
    base();
    tmp.copy(Rd).multiplyScalar(a).addScaledVector(Hd, b);
    const ang = tmp.length();
    if (ang < 1e-12) return;
    tmp2.crossVectors(U, tmp).normalize();
    q.setFromAxisAngle(tmp2, ang);
    T.applyQuaternion(q);
  }

  // Radis de terra per píxel de pantalla a la distància del punt de mira.
  const radisPerPx = () => dist * 2 * Math.tan(cam.fov * DEG / 2) / Math.max(1, dom.clientHeight);

  // Punt de l'esfera (radi r) sota el cursor; retorna false si el raig no la toca.
  function puntSotaCursor(x, y, r, out) {
    const rc = dom.getBoundingClientRect();
    tmp.set(((x - rc.left) / rc.width) * 2 - 1, -((y - rc.top) / rc.height) * 2 + 1, 0.5).unproject(cam);
    ray.origin.copy(cam.position); ray.direction.copy(tmp.sub(cam.position).normalize());
    const b = ray.origin.dot(ray.direction), c = ray.origin.lengthSq() - r * r, disc = b * b - c;
    if (disc < 0) return false;
    const t = -b - Math.sqrt(disc);
    if (t < 0) return false;
    out.copy(ray.direction).multiplyScalar(t).add(ray.origin);
    return true;
  }

  // ---------- Ratolí ----------
  let arrossega = null;           // {mode:'moure'|'girar', x, y, t}
  dom.addEventListener('contextmenu', e => e.preventDefault());
  dom.addEventListener('pointerdown', e => {
    if (extern) return;
    vol = null; velA = velB = 0;
    arrossega = { mode: (e.button === 2 || e.ctrlKey || e.button === 1) ? 'girar' : 'moure', x: e.clientX, y: e.clientY, t: performance.now() };
    try { dom.setPointerCapture(e.pointerId); } catch { /* res */ }
  });
  dom.addEventListener('pointermove', e => {
    if (!arrossega || extern) return;
    const dx = e.clientX - arrossega.x, dy = e.clientY - arrossega.y;
    const ara = performance.now(), dt = Math.max(1, ara - arrossega.t) / 1000;
    arrossega.x = e.clientX; arrossega.y = e.clientY; arrossega.t = ara;
    if (arrossega.mode === 'moure') {
      if (seguint) return;                         // mentre se segueix un avió, arrossegar no mou el punt de mira
      const k = radisPerPx() / Math.max(1, T.length());
      // Amb molta inclinació, la part de dalt de la pantalla és més lluny: es compensa una mica
      const kb = k * (1 + Math.tan(tiltEf * DEG) * 0.6);
      desplaca(-dx * k, dy * kb);
      velA = -dx * k / dt; velB = dy * kb / dt;
    } else {
      head = (head + dx * 0.3 + 360) % 360;
      tiltUsuari = Math.min(TILT_MAX, Math.max(0, tiltEf - dy * 0.3));
    }
  });
  const acaba = e => {
    if (!arrossega) return;
    if (performance.now() - arrossega.t > 90) velA = velB = 0;     // s'ha aturat abans de deixar anar
    arrossega = null;
    try { dom.releasePointerCapture(e.pointerId); } catch { /* res */ }
  };
  dom.addEventListener('pointerup', acaba);
  dom.addEventListener('pointercancel', acaba);
  dom.addEventListener('wheel', e => {
    e.preventDefault();
    if (extern) return;
    vol = null;
    const d0 = distObj ?? dist;
    const f = Math.exp(Math.max(-300, Math.min(300, e.deltaY)) * 0.0013);
    distObj = Math.min(D_MAX, Math.max(D_MIN, d0 * f));
    // Zoom cap al punt sota el cursor (només en apropar-se i sense seguir cap avió)
    if (f < 1 && !seguint && puntSotaCursor(e.clientX, e.clientY, Math.max(1, T.length()), tmp2)) {
      const r = T.length();
      tmp.copy(T).normalize();
      tmp2.normalize();
      const ang = tmp.angleTo(tmp2) * (1 - distObj / d0) * 0.95;
      if (ang > 1e-9) {
        q.setFromAxisAngle(tmp.clone().cross(tmp2).normalize(), ang);
        T.applyQuaternion(q).setLength(r);
      }
    }
  }, { passive: false });

  // ---------- Vols animats ----------
  // getter(v) escriu la posició objectiu a v (vector unitari = superfície) i retorna false si ja no existeix.
  function volar(getter, d1, durada, op = {}) {
    if (!getter(tmp)) return;
    const S = T.clone(), ang = S.clone().normalize().angleTo(tmp.clone().normalize());
    vol = {
      getter, S, r0: Math.max(1, S.length()), d0: dist, d1: Math.min(D_MAX, Math.max(D_MIN, d1)), t: 0,
      dur: durada ?? Math.min(3.6, Math.max(1.1, 0.8 + ang * 1.3)),
      arc: Math.min(2.5, ang * 0.9),
      h0: head, h1: op.head ?? null, ti0: tiltUsuari, ti1: op.tilt ?? null,
    };
    distObj = null;
  }

  // ---------- Actualització per fotograma ----------
  function actualizar(dt) {
    if (extern) return;
    if (vol) {
      vol.t += dt / vol.dur;
      const e = suau(Math.min(1, vol.t));
      if (!vol.getter(tmp)) { vol = null; }
      else {
        const r1 = Math.max(1, tmp.length());
        const a = vol.S.clone().normalize(), b = tmp.normalize();
        const om = Math.acos(Math.min(1, Math.max(-1, a.dot(b)))), sn = Math.sin(om);
        if (sn < 1e-6) T.copy(b); else T.copy(a).multiplyScalar(Math.sin((1 - e) * om) / sn).addScaledVector(b, Math.sin(e * om) / sn);
        T.setLength(vol.r0 + (r1 - vol.r0) * e);
        dist = Math.exp(Math.log(vol.d0) + (Math.log(vol.d1) - Math.log(vol.d0)) * e) + vol.arc * Math.sin(Math.PI * e);
        if (vol.h1 !== null) { let dh = ((vol.h1 - vol.h0 + 540) % 360) - 180; head = (vol.h0 + dh * e + 360) % 360; }
        if (vol.ti1 !== null) tiltUsuari = vol.ti0 + (vol.ti1 - vol.ti0) * e;
        if (vol.t >= 1) vol = null;
      }
    } else {
      if (distObj !== null) {
        dist = Math.exp(Math.log(dist) + (Math.log(distObj) - Math.log(dist)) * (1 - Math.exp(-dt * 10)));
        if (Math.abs(dist / distObj - 1) < 1e-4) { dist = distObj; distObj = null; }
      }
      if (seguint && seguint(tmp)) {
        // Segueix l'objectiu suaument (mantenint la distància, el rumb i la inclinació)
        // A prop (o quan ja l'ha atrapat) el segueix exactament, perquè amb el temps accelerat no quedi enrere
        if (T.distanceTo(tmp) < Math.max(dist * 4, 0.0005)) T.copy(tmp); else T.lerp(tmp, 1 - Math.exp(-dt * 6));
      } else if (!arrossega && (Math.abs(velA) + Math.abs(velB)) > 1e-7) {
        desplaca(velA * dt, velB * dt);
        const k = Math.exp(-dt * 4.5); velA *= k; velB *= k;
      }
    }
    colocar();
  }

  // Calcula la posició i l'orientació de la càmera a partir del punt de mira, la distància, el rumb i la inclinació.
  function colocar() {
    base();
    const hT = T.length() - 1;
    let t = Math.min(tiltUsuari, tiltMaxim(dist));
    // Que la càmera no quedi sota terra: limita la inclinació
    const cosMin = (H_CAM_MIN - hT) / dist;
    if (cosMin > 0) t = Math.min(t, Math.acos(Math.min(1, cosMin)) / DEG);
    tiltEf = t;
    const c = Math.cos(t * DEG), s = Math.sin(t * DEG);
    cam.position.copy(T).addScaledVector(U, dist * c).addScaledVector(Hd, -dist * s);
    cam.up.copy(Hd).multiplyScalar(c).addScaledVector(U, s);
    cam.lookAt(T);
  }

  return {
    // Vol cap a una lat/lon fixa (dist en radis; op = {head, tilt} opcionals).
    volarA(lat, lon, d = 0.4, durada, op) {
      llAVec(lat, lon, buf, 0);
      const x = buf[0], y = buf[1], z = buf[2];
      volar(v => (v.set(x, y, z), true), d, durada, op);
    },
    // Vol cap a un objectiu mòbil (getter escriu la seva posició a un Vector3).
    volarGetter(getter, d = 0.25, durada, op) { volar(getter, d, durada, op); },
    // Activa/desactiva el seguiment continu d'un objectiu mòbil.
    seguir(getter) { seguint = getter; },
    seguint: () => seguint !== null,
    cancelarVol() { vol = null; },
    enVol: () => vol !== null,
    altura: () => cam.position.length() - 1,
    distancia: () => dist,
    inclinacio: () => tiltEf,
    // Col·loca la càmera directament sobre (lat, lon) a una distància h, mirant cap avall.
    posar(lat, lon, h) {
      llAVec(lat, lon, buf, 0);
      T.set(buf[0], buf[1], buf[2]); dist = Math.min(D_MAX, Math.max(D_MIN, h)); distObj = null; vol = null;
      colocar();
    },
    // Mode extern: un altre mòdul mou la càmera (el pilotatge). En tornar, adopta la vista actual mirant cap a "mira".
    ponExtern(b, mira) {
      extern = b; vol = null; distObj = null; velA = velB = 0; arrossega = null;
      if (!b && mira) {
        T.copy(mira);
        const dir = cam.position.clone().sub(mira);
        dist = Math.min(D_MAX, Math.max(D_MIN, dir.length()));
        dir.normalize();
        base();
        const c = Math.min(1, Math.max(-1, dir.dot(U)));
        tiltUsuari = Math.min(TILT_MAX, Math.acos(c) / DEG);
        const hz = dir.clone().addScaledVector(U, -c).negate();       // direcció horitzontal de la vista
        if (hz.lengthSq() > 1e-10) head = (Math.atan2(hz.dot(E), hz.dot(N)) / DEG + 360) % 360;
        colocar();
      }
    },
    esExtern: () => extern,
    // Reinicia el rumb al nord i la inclinació per defecte.
    nord() { volar(v => (v.copy(T), true), dist, 0.8, { head: 0, tilt: 58 }); },
    actualizar,
  };
}
