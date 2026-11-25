// Pont de missatges amb C# (WebView2). Si no hi ha WebView2, s'activa el MODE DEMO que emula el motor.
import { emit } from './estat.js';

export const enDemo = !window.chrome?.webview;
let demo = null;

// Envia una ordre al C# (o a la demo).
export function enviar(obj) {
  if (!enDemo) window.chrome.webview.postMessage(obj);
  else if (demo) demo.recibir(obj);
}

// Missatge rebut del C#: es reparteix als oients segons el camp 'tipo'.
function rebre(m) {
  if (typeof m === 'string') { try { m = JSON.parse(m); } catch { return; } }
  if (m && m.tipo) emit(m.tipo, m);
}

// Inicialitza el pont i avisa que la pàgina està llesta.
export async function iniciar() {
  if (enDemo) {
    const mod = await import('./demo.js');
    demo = mod.crearDemo(rebre);
  } else {
    window.chrome.webview.addEventListener('message', e => rebre(e.data));
  }
  enviar({ tipo: 'listo' });
}
