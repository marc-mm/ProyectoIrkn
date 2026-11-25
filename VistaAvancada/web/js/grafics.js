// Gràfics senzills en canvas 2D per al panell d'estadístiques (barres, donut, columnes), amb acabat de gel brillant (Aero).
export const COLORS_FASE = ['#9fb3c8', '#ffb43a', '#3fc3ff', '#5fdc4a', '#b98cff', '#ff8a3d', '#6f8297'];
const TXT = '#d9ecfc', MUT = '#a6c9e6', FONT = '"Segoe UI", Tahoma, system-ui, sans-serif';

// Prepara el canvas amb el DPR actual i retorna el context en píxels CSS.
function prepara(cv, wFix, hFix) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = wFix || cv.clientWidth || 280, h = hFix || +cv.getAttribute('height') || 100;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  cv.style.height = h + 'px';
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  return { g, w, h };
}

// Barreja un color hex amb blanc (t > 0) o negre (t < 0). Si no és hex, el retorna igual.
function to(c, t) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c).trim());
  if (!m) return c;
  let h = m[1]; if (h.length === 3) h = h.replace(/./g, x => x + x);
  const n = parseInt(h, 16), dst = t > 0 ? 255 : 0, k = Math.abs(t);
  const ch = s => Math.round(((n >> s) & 255) + (dst - ((n >> s) & 255)) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

// Rectangle arrodonit (amb alternativa si el navegador no té roundRect).
function rr(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, r);
  else { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
}

// Pinta una peça de «gel»: degradat del color, brillantor a la meitat superior (o esquerra) i vora fosca.
function gel(g, x, y, w, h, r, color, vertical) {
  rr(g, x, y, w, h, r);
  const gr = vertical ? g.createLinearGradient(x, 0, x + w, 0) : g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, to(color, .28)); gr.addColorStop(.5, color); gr.addColorStop(.51, to(color, -.18)); gr.addColorStop(1, to(color, .08));
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  const br = vertical ? g.createLinearGradient(x, 0, x + w, 0) : g.createLinearGradient(0, y, 0, y + h);
  br.addColorStop(0, 'rgba(255,255,255,.62)'); br.addColorStop(.48, 'rgba(255,255,255,.16)'); br.addColorStop(.5, 'rgba(255,255,255,0)');
  g.fillStyle = br; g.fillRect(x, y, w, h);
  g.restore();
  g.lineWidth = 1; g.strokeStyle = 'rgba(0,12,30,.7)'; rr(g, x + .5, y + .5, w - 1, h - 1, r); g.stroke();
}

// Canal fosc (encastat) per a les barres.
function canal(g, x, y, w, h, r) {
  rr(g, x, y, w, h, r);
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, 'rgba(0,10,28,.6)'); gr.addColorStop(1, 'rgba(60,110,160,.18)');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; rr(g, x + .5, y + .5, w - 1, h - 1, r); g.stroke();
}

// Barres horitzontals amb etiqueta a l'esquerra i valor a la dreta.
export function dibuixaBarres(cv, items) {
  const { g, w, h } = prepara(cv);
  const n = Math.max(1, items.length), fila = h / n, max = Math.max(1, ...items.map(i => i.v));
  g.textBaseline = 'middle';
  const x0 = 96, x1 = w - 34, alt = Math.min(12, fila - 6);
  items.forEach((it, k) => {
    const y = k * fila + fila / 2, ample = (x1 - x0) * it.v / max;
    g.font = `11.5px ${FONT}`; g.fillStyle = TXT; g.textAlign = 'right';
    g.fillText(it.nom.length > 14 ? it.nom.slice(0, 13) + '…' : it.nom, x0 - 8, y);
    canal(g, x0, y - alt / 2, x1 - x0, alt, alt / 2);
    if (it.v > 0) gel(g, x0, y - alt / 2, Math.max(alt, ample), alt, alt / 2, it.color || '#45b2ff');
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `600 11.5px ${FONT}`;
    g.fillText(String(it.v), x1 + 6, y);
  });
}

// Donut amb total al centre (anell de gel i bombolla central de vidre).
export function dibuixaDonut(cv, items) {
  const { g, w, h } = prepara(cv, 110, 110);
  const tot = items.reduce((s, i) => s + i.v, 0) || 1;
  const cx = w / 2, cy = h / 2, R = 50, r = 32;
  // Anell de fons
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.arc(cx, cy, r, 0, Math.PI * 2, true);
  g.fillStyle = 'rgba(0,10,28,.45)'; g.fill();
  let a = -Math.PI / 2;
  items.forEach(it => {
    if (!it.v) return;
    const da = it.v / tot * Math.PI * 2, sep = items.filter(x => x.v).length > 1 ? 0.025 : 0;
    g.beginPath(); g.arc(cx, cy, R, a, a + da - sep); g.arc(cx, cy, r, a + da - sep, a, true); g.closePath();
    const gr = g.createRadialGradient(cx, cy, r, cx, cy, R);
    gr.addColorStop(0, to(it.color, -.2)); gr.addColorStop(.55, it.color); gr.addColorStop(1, to(it.color, .18));
    g.fillStyle = gr; g.fill(); a += da;
  });
  // Brillantor a la meitat superior de l'anell
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.arc(cx, cy, r, 0, Math.PI * 2, true); g.clip('evenodd');
  const br = g.createLinearGradient(0, cy - R, 0, cy + 4);
  br.addColorStop(0, 'rgba(255,255,255,.55)'); br.addColorStop(.85, 'rgba(255,255,255,.08)'); br.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = br; g.fillRect(cx - R, cy - R, R * 2, R + 4);
  g.restore();
  g.lineWidth = 1; g.strokeStyle = 'rgba(0,12,30,.75)';
  g.beginPath(); g.arc(cx, cy, R - .5, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(cx, cy, r + .5, 0, Math.PI * 2); g.stroke();
  // Bombolla central
  const bg = g.createRadialGradient(cx, cy - 10, 2, cx, cy, r - 2);
  bg.addColorStop(0, 'rgba(120,200,255,.28)'); bg.addColorStop(1, 'rgba(0,20,50,.55)');
  g.beginPath(); g.arc(cx, cy, r - 3, 0, Math.PI * 2); g.fillStyle = bg; g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, cy - 13, 17, 9, 0, 0, Math.PI * 2); g.clip();
  const bb = g.createLinearGradient(0, cy - 22, 0, cy - 4); bb.addColorStop(0, 'rgba(255,255,255,.4)'); bb.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = bb; g.fillRect(cx - 18, cy - 22, 36, 18); g.restore();
  g.fillStyle = '#fff'; g.font = `600 18px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(120,210,255,.8)'; g.shadowBlur = 8;
  g.fillText(String(tot), cx, cy - 3);
  g.shadowBlur = 0; g.fillStyle = MUT; g.font = `10px ${FONT}`; g.fillText('vols', cx, cy + 12);
}

// Columnes verticals de gel aqua amb etiqueta sota cada una.
export function dibuixaColumnes(cv, items, noms) {
  const { g, w, h } = prepara(cv);
  const n = Math.max(1, items.length), amp = w / n, max = Math.max(1, ...items.map(i => i.v));
  g.textAlign = 'center';
  // Línia de base
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(4, h - 18, w - 8, 1);
  items.forEach((it, k) => {
    const alt = Math.max(3, (h - 34) * it.v / max), x = k * amp + amp / 2, y = h - 18 - alt, aw = Math.min(30, amp * 0.56);
    // Retalla per sota de la línia de base: només queden arrodonides les cantonades de dalt
    g.save(); g.beginPath(); g.rect(0, 0, w, h - 18); g.clip();
    gel(g, x - aw / 2, y, aw, alt + 8, 5, '#2f9bea', true);
    g.restore();
    g.fillStyle = '#fff'; g.font = `600 11.5px ${FONT}`; g.textBaseline = 'alphabetic'; g.fillText(String(it.v), x, y - 4);
    g.fillStyle = MUT; g.font = `10.5px ${FONT}`; g.fillText((noms && noms[it.nom]) || it.nom, x, h - 4);
  });
}
