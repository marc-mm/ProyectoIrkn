// Interfície (HUD): barra superior, cerca, panells de vol/aeroport/conflictes/estadístiques, avisos i dreceres.
import { E, on } from './estat.js';
import { fmtHM } from './geo.js';
import { dibuixaBarres, dibuixaDonut, dibuixaColumnes, COLORS_FASE } from './grafics.js';

const $ = id => document.getElementById(id);
const fmtN = n => Math.round(n).toLocaleString('ca-ES');
const ST_CLS = { 'Embarcant': 'v-emb', "A l'hora": 'v-ok', 'Retardat': 'v-ret', 'Enlairat': 'v-ok', 'Cancel·lat': 'v-can', 'En vol': 'v-vol', 'Aterrant': 'v-emb', 'Aterrat': 'v-ok' };

export function crearInterfaz({ av, capas, camara, globo, enviar, enDemo, monuments, pilot }) {
  let tabAero = 'salidas';
  let confClaus = new Set(), ultimConf = 0;
  let ctxAudio = null;
  let resAct = -1, resLlista = [];
  let ultimaHoraTxt = '', sigUI = '';
  E.so = true;

  // ---------- Avisos (toasts) ----------
  function avis(nivel, text) {
    const c = $('avisos');
    while (c.children.length >= 4) c.firstChild.remove();
    const d = document.createElement('div');
    d.className = 'avis ' + (nivel || 'info'); d.textContent = text;
    c.appendChild(d);
    setTimeout(() => { d.classList.add('surt'); setTimeout(() => d.remove(), 450); }, 4800);
  }

  // ---------- So d'alarma ----------
  function beep() {
    if (!E.so) return;
    try {
      ctxAudio ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = ctxAudio.currentTime;
      for (let k = 0; k < 2; k++) {
        const o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
        o.type = 'square'; o.frequency.value = k ? 660 : 880;
        g.gain.setValueAtTime(0.0001, t + k * 0.16); g.gain.exponentialRampToValueAtTime(0.08, t + k * 0.16 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + k * 0.16 + 0.14);
        o.connect(g); g.connect(ctxAudio.destination); o.start(t + k * 0.16); o.stop(t + k * 0.16 + 0.15);
      }
    } catch { /* l'àudio pot estar bloquejat */ }
  }

  // ---------- Selecció ----------
  function getterSel(v) { return av.dirDeId(E.selVuelo, v); }
  function mostraPanell(qui) {
    $('p-vol').hidden = qui !== 'vol';
    $('p-aero').hidden = qui !== 'aero';
  }
  function ponSeguir(b) {
    E.seguir = b && E.selVuelo >= 0;
    camara.seguir(E.seguir ? getterSel : null);
    const bt = $('b-seguir');
    if (!bt) return;
    bt.classList.toggle('on', E.seguir);
    const tx = [...bt.childNodes].find(nd => nd.nodeType === 3 && nd.textContent.trim());
    if (tx) tx.textContent = E.seguir ? 'Seguint ' : 'Seguir ';
  }
  // Selecciona un monument: vol cap a ell amb una vista inclinada (com en una postal).
  function selMonument(m) {
    if (!m) return;
    monuments.seleccionar(m);
    // Enquadrament segons la mida: es mira cap a mitja alçada i des d'una distància que hi faci cabre tot el monument
    const { alcada, planta } = monuments.mides(m);
    const dM = Math.max(alcada * 1.9, planta * 1.25, 260);
    const rMira = 1 + alcada * 0.42 / 6371000;
    const P = m.P.clone().multiplyScalar(rMira);
    camara.volarGetter(v => (v.copy(P), true), dM / 6371000, undefined, { tilt: alcada > planta ? 62 : 56, head: 25 });
    avis('info', `${m.nom} · ${m.ciutat}`);
  }
  // Comença a pilotar l'avió seleccionat.
  function pilotar() {
    if (E.selVuelo < 0 || !pilot) return;
    ponSeguir(false);
    pilot.iniciar(E.selVuelo);
  }
  function selVuelo(id, volar = true) {
    E.selVuelo = id; E.selAero = null; E.info = null; ponSeguir(false);
    const i = av.mapa.get(id);
    mostraPanell('vol');
    $('v-cs').textContent = i !== undefined ? av.cs[i] : '…';
    $('v-aer').textContent = 'Carregant dades…';
    enviar({ tipo: 'seleccionarVuelo', id });
    capas.ocultarRuta();
    if (volar) camara.volarGetter(getterSel, Math.min(0.4, Math.max(0.07, camara.altura())));
    refrescaMarques();
  }
  function selAero(iata, volar = true) {
    E.selAero = iata; E.selVuelo = -1; E.infoAero = null; ponSeguir(false);
    mostraPanell('aero');
    const a = E.aeropuertos.find(x => x[0] === iata);
    $('a-xip').textContent = iata; $('a-nom').textContent = a ? a[1] : iata; $('a-ciutat').textContent = a ? `${a[2]} · ${a[3]}` : '';
    $('a-taula').innerHTML = '';
    capas.ocultarRuta();
    enviar({ tipo: 'seleccionarAeropuerto', iata });
    if (volar) {
      camara.volarGetter(w => capas.posAeropuerto(iata, w), Math.min(0.25, Math.max(0.06, camara.altura())));
    }
    refrescaMarques();
  }
  function deselect() {
    if (E.selVuelo < 0 && !E.selAero) return;
    E.selVuelo = -1; E.selAero = null; E.info = null; ponSeguir(false);
    mostraPanell(null); capas.ocultarRuta();
    enviar({ tipo: 'deseleccionar' });
    refrescaMarques();
  }
  function refrescaMarques() {
    const s = new Set();
    for (const c of E.conflictos) { s.add(c[0]); s.add(c[1]); }
    if (E.intrusos) for (const id of E.intrusos) s.add(id);      // trànsit en conflicte amb l'avió pilotat
    av.marcar(s, E.selVuelo);
  }

  // ---------- Rellotge ----------
  function actualizarReloj(ms) {
    const d = new Date(ms), iso = d.toISOString();
    const t = iso.substr(11, 8);
    if (t === ultimaHoraTxt) return;
    ultimaHoraTxt = t;
    $('hora').textContent = t + ' UTC';
    $('data').textContent = d.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  // ---------- Estat ('estado') ----------
  const cntConf = $('cnt-conf');
  function alEstado(m) {
    // Comptadors i controls de temps
    let aire = 0;
    for (let i = 0; i < av.n; i++) if (av.fase[i] > 0 && av.fase[i] < 6) aire++;
    // Només es toca el DOM quan canvia alguna cosa (l'estat arriba a 20 Hz)
    const sig = aire + '|' + m.vuelos.length + '|' + m.conflictos.length + '|' + m.pausado + '|' + m.escala + '|' + E.modo + '|' + E.pilotant + '|' + av.nMostrats;
    if (sig !== sigUI) {
      sigUI = sig;
      $('n-vols').textContent = fmtN(aire || m.vuelos.length);
      const nm = $('n-mostrats');
      if (nm) nm.textContent = av.nMostrats < av.n ? `es mostren ${fmtN(av.nMostrats)}` : '';
      // En directe (dades reals) i mentre es pilota, el temps no es pot accelerar ni aturar
      document.body.dataset.modo = E.modo;
      const bloq = E.modo === 'directo' || !!E.pilotant;
      for (const b of [$('t-pausa'), $('t-real'), ...$('t-escales').children]) {
        if (!b) continue;
        if (b.dataset.titol === undefined) b.dataset.titol = b.title || '';
        b.disabled = bloq;
        b.title = bloq ? (E.modo === 'directo' ? 'En directe el temps és real: no es pot accelerar ni aturar' : 'Mentre pilotes, el temps va a velocitat real') : b.dataset.titol;
      }
      $('n-conf').textContent = m.conflictos.length;
      cntConf.classList.toggle('alerta', m.conflictos.length > 0);
      $('t-pausa').classList.toggle('on', !!m.pausado);
      $('t-pausa').innerHTML = m.pausado ? '&#9654;' : '&#10074;&#10074;';
      for (const b of $('t-escales').children) b.classList.toggle('on', +b.dataset.escala === m.escala);
    }
    // Conflictes: detecta nous per avisar
    const claus = new Set();
    let nou = null;
    for (const c of m.conflictos) {
      const k = c[0] < c[1] ? c[0] + '-' + c[1] : c[1] + '-' + c[0];
      claus.add(k);
      if (!confClaus.has(k) && confClaus.size + 1 > 0 && ultimConf > 0) nou = c;
    }
    if (nou) {
      const ia = av.mapa.get(nou[0]), ib = av.mapa.get(nou[1]);
      avis('error', `Nou conflicte: ${ia !== undefined ? av.cs[ia] : nou[0]} / ${ib !== undefined ? av.cs[ib] : nou[1]}`);
      beep();
    }
    confClaus = claus; ultimConf++;
    refrescaMarques();
  }

  // ---------- Llista de conflictes (actualitzada ~4 Hz) ----------
  const llistaConf = $('conf-llista');
  let filesConf = new Map(), ultimLlista = 0;
  const csDe = id => { const i = av.mapa.get(id); return i !== undefined ? av.cs[i] : '#' + id; };
  function pintaConflictes(ara) {
    if (ara - ultimLlista < 250) return;
    ultimLlista = ara;
    $('conf-n').textContent = E.conflictos.length;
    const vius = new Set();
    for (const c of E.conflictos) {
      const k = c[0] + '-' + c[1]; vius.add(k);
      let f = filesConf.get(k);
      if (!f) {
        f = document.createElement('div'); f.className = 'fila-conf';
        f.innerHTML = '<b></b><button class="btn mini perill">Resoldre</button><small></small>';
        f.onclick = () => volarAlPar(c[0], c[1]);
        f.querySelector('button').onclick = e => { e.stopPropagation(); enviar({ tipo: 'resolverConflicto', idA: c[0], idB: c[1] }); };
        llistaConf.appendChild(f); filesConf.set(k, f);
      }
      f.children[0].textContent = csDe(c[0]) + '  ↔  ' + csDe(c[1]);
      f.children[2].textContent = `${c[2].toFixed(1)} NM · Δalt ${fmtN(c[3])} ft`;
    }
    for (const [k, f] of filesConf) if (!vius.has(k)) { f.remove(); filesConf.delete(k); }
    if (!E.conflictos.length) {
      if (!llistaConf.querySelector('.buit')) llistaConf.innerHTML = '<div class="buit">Cap conflicte actiu</div>';
    } else llistaConf.querySelector('.buit')?.remove();
  }
  const _t1 = { x: 0, y: 0, z: 0 };
  function volarAlPar(a, b) {
    const getter = v => {
      const ia = av.mapa.get(a), ib = av.mapa.get(b);
      if (ia === undefined || ib === undefined) return false;
      const F = av.F, p = ia * 24 + 9, q = ib * 24 + 9;
      v.set(F[p] + F[q], F[p + 1] + F[q + 1], F[p + 2] + F[q + 2]).normalize();
      return true;
    };
    camara.volarGetter(getter, 0.1);
  }

  // ---------- Panell de vol ----------
  let instrClau = '';
  function ponVol(m) {
    if (m.id !== E.selVuelo) return;
    E.info = m;
    $('v-cs').textContent = m.callsign;
    $('v-aer').textContent = m.aerolinea || '—';
    $('v-xip').style.background = m.color || '#4cc9f0'; $('v-xip').style.color = m.color || '#4cc9f0';
    $('v-tipus').textContent = m.nombreAvion || m.tipoAvion || '—';
    $('v-mat').textContent = m.matricula || '';
    $('v-fase').textContent = m.fase || '—';
    const o = m.origen, d = m.destino;
    $('v-o').textContent = o ? o.iata : '---'; $('v-oc').textContent = o ? o.ciudad : 'Desconegut';
    $('v-d').textContent = d ? d.iata : '---'; $('v-dc').textContent = d ? d.ciudad : 'Desconegut';
    const pct = Math.max(0, Math.min(1, m.progreso || 0));
    $('v-prog').style.width = (pct * 100) + '%'; $('v-av').style.left = (pct * 100) + '%';
    $('v-pct').textContent = o ? `${Math.round(pct * 100)} %` : '—';
    $('v-alt').textContent = `${fmtN(m.altitudFt)} ft`; $('v-alt').previousElementSibling.textContent = m.altitudFt > 1000 ? `Altitud · FL${Math.round(m.altitudFt / 100)}` : 'Altitud';
    $('v-vel').textContent = `${fmtN(m.velocidadKt)} kt`;
    $('v-rumb').textContent = `${Math.round(m.rumbo)}°`;
    $('v-agulla').style.transform = `rotate(${m.rumbo}deg)`;
    const vv = m.velVerticalFpm || 0;
    $('v-vv').textContent = (vv > 0 ? '+' : '') + fmtN(vv) + ' ft/min';
    $('v-sal').textContent = m.salida ? fmtHM(m.salida) : '—'; $('v-lle').textContent = m.llegada ? fmtHM(m.llegada) : '—';
    $('v-dist').textContent = m.distanciaTotalNM ? `${fmtN(m.distanciaRestanteNM)} NM` : '—';
    $('v-fl').textContent = m.nivelCrucero ? `FL${m.nivelCrucero}` : '—';
    const c = m.contacto;
    $('v-contacte').innerHTML = c
      ? `<b>${esc(c.nombre || m.aerolinea)}</b><br>Telèfon: ${c.telefono ? `<a>${esc(c.telefono)}</a>` : '<span class="no">No consta</span>'}<br>Correu: ${c.email ? `<a>${esc(c.email)}</a>` : '<span class="no">No consta</span>'}`
      : '<span class="no">No consta a la base de dades</span>';
    const ins = (m.instrucciones && m.instrucciones.length) ? m.instrucciones : [];
    const clau = ins.join('|') + m.enConflicto;
    if (clau !== instrClau) {
      instrClau = clau;
      $('v-instr').innerHTML = ins.length ? ins.map(t => `<li class="${m.enConflicto ? 'alerta' : ''}">${esc(t)}</li>`).join('') : '<li>Sense instruccions pendents</li>';
    }
    capas.mostrarRuta(m);
  }
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  // ---------- Panell d'aeroport (taulell split-flap) ----------
  const taula = $('a-taula');
  const AMPLES = [5, 7, 3];
  function filaFlap() {
    const f = document.createElement('div'); f.className = 'fila';
    f.innerHTML = '<span class="gr"></span><span class="gr"></span><span class="gr"></span><span class="es"></span>';
    AMPLES.forEach((n, g) => { for (let k = 0; k < n; k++) { const c = document.createElement('i'); c.className = 'c'; c.textContent = ' '; f.children[g].appendChild(c); } });
    return f;
  }
  function ponTextFlap(grup, text, ampl) {
    const t = String(text).toUpperCase().padEnd(ampl, ' ').slice(0, ampl);
    for (let k = 0; k < ampl; k++) {
      const c = grup.children[k];
      if (c.textContent !== t[k]) {
        c.textContent = t[k]; c.classList.remove('f'); void c.offsetWidth;
        c.style.animationDelay = (k * 25) + 'ms'; c.classList.add('f');
      }
    }
  }
  function pintaTaula() {
    const m = E.infoAero; if (!m || m.iata !== E.selAero) return;
    const dades = m[tabAero] || [];
    if (!taula.querySelector('.cap')) {
      taula.innerHTML = '<div class="fila cap"><span style="width:60px">Hora</span><span style="width:84px">Vol</span><span style="width:38px">' + (tabAero === 'salidas' ? 'Destí' : 'Origen') + '</span><span></span></div>';
    }
    taula.querySelector('.cap span:nth-child(3)').textContent = tabAero === 'salidas' ? 'Destí' : 'Origen';
    const files = taula.querySelectorAll('.fila:not(.cap)');
    for (let r = files.length; r < dades.length; r++) taula.appendChild(filaFlap());
    const fs = taula.querySelectorAll('.fila:not(.cap)');
    for (let r = fs.length - 1; r >= dades.length; r--) fs[r].remove();
    dades.forEach((d, r) => {
      const f = fs[r] || taula.querySelectorAll('.fila:not(.cap)')[r];
      ponTextFlap(f.children[0], d[0], 5); ponTextFlap(f.children[1], d[1], 7); ponTextFlap(f.children[2], d[2], 3);
      f.title = d[3];
      const es = f.children[3];
      if (es.textContent !== d[4]) { es.textContent = d[4]; es.className = 'es ' + (ST_CLS[d[4]] || 'v-vol'); }
    });
  }
  function ponAero(m) {
    if (m.iata !== E.selAero) return;
    E.infoAero = m;
    $('a-xip').textContent = m.iata; $('a-nom').textContent = m.nombre; $('a-ciutat').textContent = `${m.ciudad} · ${m.pais}`;
    $('a-hora').textContent = m.horaLocal; $('a-elev').textContent = `${fmtN(m.elevacionFt)} ft`;
    pintaTaula();
  }

  // ---------- Estadístiques ----------
  function ponStats(m) {
    E.stats = m;
    const colorCia = n => { const a = E.aerolineas.find(x => x[1] === n); return a ? a[2] : '#6f8dff'; };
    dibuixaBarres($('g-aer'), m.topAerolineas.map(([n, v]) => ({ nom: n, v, color: colorCia(n) })));
    dibuixaBarres($('g-apt'), m.topAeropuertos.map(([n, v]) => ({ nom: n, v, color: '#ffb703' })));
    dibuixaDonut($('g-fase'), m.porFase.map((v, i) => ({ v, color: COLORS_FASE[i] })));
    $('g-fase-llegenda').innerHTML = m.porFase.map((v, i) => `<div><i style="background:${COLORS_FASE[i]}"></i>${E.fases[i] || i}<b>${v}</b></div>`).join('');
    dibuixaColumnes($('g-cont'), m.porContinente.map(([n, v]) => ({ nom: n, v })), { EU: 'Europa', NA: 'N. Amèrica', SA: 'S. Amèrica', AS: 'Àsia', AF: 'Àfrica', OC: 'Oceania' });
    $('e-act').textContent = m.conflictosActivos; $('e-res').textContent = m.conflictosResueltos;
    $('e-aire').textContent = fmtN(m.enVuelo); $('e-terra').textContent = fmtN(m.enTierra);
  }

  // ---------- Cerca ----------
  const inCerca = $('cerca'), ulRes = $('resultats');
  function cerca() {
    const q = inCerca.value.trim().toLowerCase();
    resLlista = []; resAct = -1;
    if (q.length >= 1) {
      let n = 0;
      for (let i = 0; i < av.n && n < 6; i++) if (av.cs[i].toLowerCase().includes(q)) {
        const a = av.aero[i], cia = a >= 0 ? E.aerolineas[a] : null;
        resLlista.push({ tipus: 'VOL', text: av.cs[i], info: cia ? cia[1] : (a === -2 ? 'Projecte' : ''), color: cia ? cia[2] : (a === -2 ? '#5ef2ff' : '#9aa6b5'), accio: () => selVuelo(av.ids[i]) }); n++;
      }
      E.aerolineas.forEach((a, k) => {
        if (a[1].toLowerCase().includes(q) || a[0].toLowerCase() === q) {
          const i = [...av.mapa.values()].find(j => av.aero[j] === k);
          let cnt = 0; for (let j = 0; j < av.n; j++) if (av.aero[j] === k) cnt++;
          if (i !== undefined) resLlista.push({ tipus: 'CIA', text: a[1], info: `${cnt} vols`, color: a[2], accio: () => selVuelo(av.ids[i]) });
        }
      });
      let m = 0;
      for (const a of E.aeropuertos) {
        if (m >= 6) break;
        if (a[0].toLowerCase().startsWith(q) || a[2].toLowerCase().includes(q) || a[1].toLowerCase().includes(q)) {
          resLlista.push({ tipus: 'APT', text: `${a[0]} · ${a[1]}`, info: a[2], color: '#ffb703', accio: () => selAero(a[0]) }); m++;
        }
      }
      if (monuments && q.length >= 2) for (const mo of monuments.cercar(q, 6)) {
        resLlista.push({ tipus: 'MON', text: mo.nom, info: mo.ciutat, color: '#9be15d', accio: () => selMonument(mo) });
      }
    }
    ulRes.hidden = !resLlista.length && q.length < 1;
    ulRes.innerHTML = resLlista.length ? '' : (q.length ? '<li style="color:var(--mut)">Sense resultats</li>' : '');
    ulRes.hidden = !q.length;
    resLlista.forEach((r, k) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="tipus">${r.tipus}</span><i class="xip" style="background:${r.color}"></i><span>${esc(r.text)}</span><small>${esc(r.info)}</small>`;
      li.onmousedown = e => { e.preventDefault(); trio(k); };
      ulRes.appendChild(li);
    });
    marcaRes();
  }
  function marcaRes() { [...ulRes.children].forEach((li, k) => li.classList.toggle('act', k === resAct)); }
  function trio(k) { const r = resLlista[k]; if (!r) return; r.accio(); inCerca.value = ''; ulRes.hidden = true; inCerca.blur(); }
  inCerca.addEventListener('input', cerca);
  inCerca.addEventListener('blur', () => setTimeout(() => { if (!window.__depuraBuscar) ulRes.hidden = true; }, 120));
  inCerca.addEventListener('focus', () => { if (inCerca.value) cerca(); });
  inCerca.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { resAct = Math.min(resLlista.length - 1, resAct + 1); marcaRes(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { resAct = Math.max(0, resAct - 1); marcaRes(); e.preventDefault(); }
    else if (e.key === 'Enter') trio(Math.max(0, resAct));
    else if (e.key === 'Escape') { inCerca.value = ''; ulRes.hidden = true; inCerca.blur(); }
    e.stopPropagation();
  });

  // ---------- Tooltip ----------
  const tip = $('tooltip');
  function tooltipVol(i, x, y) {
    const a = av.aero[i], cia = a >= 0 ? E.aerolineas[a] : null;
    const alt = av.F[i * 24 + 13];
    tip.innerHTML = `<i style="background:${cia ? cia[2] : a === -2 ? '#5ef2ff' : '#9aa6b5'}"></i><b>${esc(av.cs[i])}</b>${cia ? esc(cia[1]) : a === -2 ? 'Pla de vol del projecte' : 'Companyia desconeguda'}<small>${fmtN(alt)} ft · FL${Math.round(alt / 100)}</small>`;
    posaTip(x, y);
  }
  function tooltipAero(iata, x, y) {
    const a = E.aeropuertos.find(z => z[0] === iata);
    tip.innerHTML = `<b>${esc(iata)}</b>${a ? esc(a[1]) : ''}<small>${a ? esc(a[2] + ' · ' + a[3]) : ''}</small>`;
    posaTip(x, y);
  }
  function posaTip(x, y) {
    tip.hidden = false;
    const w = tip.offsetWidth;
    tip.style.left = Math.min(x, innerWidth - w - 30) + 'px'; tip.style.top = y + 'px';
  }
  function ocultaTip() { tip.hidden = true; }

  // ---------- Controls i esdeveniments ----------
  $('modes').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    for (const x of $('modes').children) x.classList.toggle('on', x === b);
    enviar({ tipo: 'modo', valor: b.dataset.modo });
  });
  $('t-pausa').onclick = () => enviar({ tipo: 'pausa', valor: !E.pausado });
  $('t-escales').addEventListener('click', e => { const b = e.target.closest('button'); if (b) enviar({ tipo: 'escala', valor: +b.dataset.escala }); });
  $('t-real').onclick = () => enviar({ tipo: 'horaReal' });
  let tDens = 0;
  $('t-dens').addEventListener('input', e => {
    $('t-dens-v').textContent = e.target.value;
    clearTimeout(tDens); tDens = setTimeout(() => enviar({ tipo: 'densidad', valor: +e.target.value }), 250);
  });
  $('b-resoldre-tots').onclick = () => enviar({ tipo: 'resolverTodos' });
  $('b-informe').onclick = () => enviar({ tipo: 'exportarInforme' });
  $('b-carregar').onclick = () => enviar({ tipo: 'cargarPlanes' });
  $('v-x').onclick = $('b-tancar').onclick = $('a-x').onclick = deselect;
  $('b-seguir').onclick = () => ponSeguir(!E.seguir);
  $('b-centrar').onclick = () => { if (E.selVuelo >= 0) camara.volarGetter(getterSel, Math.min(0.4, Math.max(0.07, camara.altura()))); };
  $('b-capes').onclick = () => { $('menu-capes').hidden = !$('menu-capes').hidden; $('b-capes').classList.toggle('on', !$('menu-capes').hidden); };
  $('b-stats').onclick = () => { $('p-stats').hidden = !$('p-stats').hidden; $('p-stats').classList.remove('plegat'); };
  $('stats-plega').onclick = () => $('p-stats').classList.toggle('plegat');
  $('b-so').onclick = () => {
    E.so = !E.so;
    const b = $('b-so');
    b.classList.toggle('silenci', !E.so);
    if (!b.querySelector('svg, img')) b.innerHTML = E.so ? '&#128266;' : '&#128263;';
    b.title = E.so ? "So d'alarma (activat)" : "So d'alarma (silenciat)";
  };
  $('b-pilotar')?.addEventListener('click', e => { e.currentTarget.blur(); pilotar(); });
  $('b-ajuda').onclick = () => { $('ajuda').hidden = !$('ajuda').hidden; };
  $('ajuda-tanca').onclick = () => { $('ajuda').hidden = true; };
  $('ajuda').addEventListener('click', e => { if (e.target === $('ajuda')) $('ajuda').hidden = true; });
  document.querySelectorAll('.pestanyes button').forEach(b => b.onclick = () => {
    tabAero = b.dataset.tab;
    document.querySelectorAll('.pestanyes button').forEach(x => x.classList.toggle('on', x === b));
    taula.innerHTML = ''; pintaTaula();
  });
  document.querySelectorAll('#menu-capes input').forEach(inp => inp.addEventListener('change', () => {
    E.capas[inp.dataset.capa] = inp.checked;
    if (inp.dataset.capa === 'diaNoche') globo.ponDiaNoche(inp.checked);
    if (inp.dataset.capa === 'atmosfera') globo.ponAtmosfera(inp.checked);
    if (inp.dataset.capa === 'satel') globo.ponSatelit(inp.checked);
  }));
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.target.type !== 'range' && e.target.type !== 'checkbox') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (E.pilotant) return;                         // les tecles les gestiona el pilotatge
    const k = e.key;
    const tempsLliure = E.modo !== 'directo';       // en directe el temps és el real
    if (k === ' ') { e.preventDefault(); if (tempsLliure) enviar({ tipo: 'pausa', valor: !E.pausado }); }
    else if (k >= '1' && k <= '5') { if (tempsLliure) enviar({ tipo: 'escala', valor: [1, 10, 60, 300, 1000][+k - 1] }); }
    else if (k === 'p' || k === 'P') pilotar();
    else if (k === 'n' || k === 'N') camara.nord();
    else if (k === 'f' || k === 'F') { if (E.selVuelo >= 0) ponSeguir(!E.seguir); }
    else if (k === 'Escape') { if (!$('ajuda').hidden) $('ajuda').hidden = true; else if (!$('menu-capes').hidden) $('b-capes').click(); else deselect(); }
    else if (k === '/') { e.preventDefault(); inCerca.focus(); inCerca.select(); }
    else if (k === '?') $('ajuda').hidden = !$('ajuda').hidden;
  });
  document.addEventListener('pointerdown', e => {
    const m = $('menu-capes');
    if (!m.hidden && !m.contains(e.target) && !$('b-capes').contains(e.target)) { m.hidden = true; $('b-capes').classList.remove('on'); }
  });

  // ---------- Missatges del C# ----------
  on('inicio', m => {
    document.body.dataset.modo = m.modo;
    $('p-proj').hidden = m.modo !== 'proyecto';
    for (const x of $('modes').children) x.classList.toggle('on', x.dataset.modo === m.modo);
    document.querySelector('.dens').hidden = m.modo !== 'simulado';
    E.conflictos = []; confClaus = new Set(); ultimConf = 0;
    if (E.selVuelo >= 0 || E.selAero) deselect();
    if (m.modo !== 'proyecto') { E.proyecto = null; capas.ponProyecto(null); }
    $('proj-info').textContent = '';
  });
  on('infoVuelo', ponVol);
  on('infoAeropuerto', ponAero);
  on('estadisticas', ponStats);
  on('aviso', m => avis(m.nivel, m.texto));
  on('planesProyecto', m => {
    E.proyecto = m; capas.ponProyecto(m);
    $('proj-info').textContent = `Centre: ${m.centro[0].toFixed(4)}, ${m.centro[1].toFixed(4)} · Distància de seguretat: ${m.distanciaSeguridadNM} NM`;
  });

  return {
    alEstado, actualizarReloj, pintaConflictes, selVuelo, selAero, deselect, tooltipVol, tooltipAero, ocultaTip, avis, ponSeguir,
    selMonument, pilotar, refrescaMarques,
    // Tooltip d'un monument.
    tooltipMon(m, x, y) { tip.innerHTML = `<b>${esc(m.nom)}</b>${esc(m.ciutat)}<small>Clic per veure'l de prop</small>`; posaTip(x, y); },
    plegarEstadistiques() { $('p-stats').classList.add('plegat'); },
    mostrarAyuda(b) { $('ajuda').hidden = !b; },
    mostrarCapes() { $('b-capes').click(); },
    buscar(t) { inCerca.value = t; inCerca.focus(); cerca(); },
  };
}
