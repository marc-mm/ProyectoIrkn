// cabines.js — finestres de la cabina de pilotatge (costat esquerre; es fa la simetria)
// Vèrtexs: [s, φ°] (φ = angle des de dalt) | {s, y} (alçada en vista lateral) | {s, x} (posició lateral en vista frontal)
// Cada estil està definit per a un avió de referència i s'escala amb la llargada del morro (s) i el radi (y, x).
const escala = (fus, T, ref, llista) => {
  const ks = T.fus.nas.Ln / ref.Ln, ky = T.fus.Rt / ref.Rt;
  const e = c => { const r = {}; if (c.s !== undefined) r.s = c.s * ks; if (c.x !== undefined) r.x = c.x * ky; if (c.y !== undefined) r.y = c.y * ky; return r; };
  return llista.map(W => W.map(c => Array.isArray(c) ? [c[0] * ks, c[1]] : e(c)));
};

export const CABINES = {
  // A320 / A321 / A330 (referència A320: Ln 6.0, Rt 2.02)
  airbus: (fus, T) => ({ finestres: escala(fus, T, { Ln: 6.0, Rt: 2.02 }, [
    [{ x: 0.06, y: 0.92 }, { x: 0.83, y: 0.84 }, { x: 0.72, y: 1.44 }, { x: 0.06, y: 1.55 }],
    [{ s: 2.6, y: 0.66 }, { s: 3.42, y: 0.62 }, { s: 3.46, y: 1.3 }, { s: 2.98, y: 1.43 }],
    [{ s: 3.56, y: 0.62 }, { s: 4.12, y: 0.6 }, { s: 4.12, y: 1.02 }, { s: 3.58, y: 1.28 }],
  ]) }),
  b737: (fus, T) => ({ finestres: escala(fus, T, { Ln: 7.0, Rt: 1.88 }, [
    [{ x: 0.05, y: 0.95 }, { x: 0.74, y: 0.88 }, { x: 0.62, y: 1.45 }, { x: 0.05, y: 1.52 }],
    [{ s: 3.75, y: 0.84 }, { s: 4.45, y: 0.82 }, { s: 4.5, y: 1.42 }, { s: 4.0, y: 1.55 }],
    [{ s: 4.6, y: 0.82 }, { s: 5.2, y: 0.82 }, { s: 5.05, y: 1.2 }, { s: 4.64, y: 1.4 }],
  ]) }),
  b777: (fus, T) => ({ finestres: escala(fus, T, { Ln: 10.0, Rt: 3.1 }, [
    [[3.7, 2.0], { s: 3.9, x: 1.05 }, { s: 4.55, x: 1.6 }, [4.7, 2.0]],
    [{ s: 4.25, y: 1.05 }, { s: 5.15, y: 0.98 }, { s: 5.2, y: 1.95 }, { s: 4.75, y: 2.12 }],
    [{ s: 5.3, y: 0.98 }, { s: 6.0, y: 0.98 }, { s: 5.85, y: 1.6 }, { s: 5.35, y: 1.9 }],
  ]) }),
  b787: (fus, T) => ({ finestres: escala(fus, T, { Ln: 9.2, Rt: 2.9 }, [
    [[3.2, 2.0], { s: 3.35, x: 1.05 }, { s: 4.2, x: 1.75 }, [4.4, 2.0]],
    [{ s: 3.75, y: 1.0 }, { s: 5.0, y: 0.95 }, { s: 4.95, y: 1.7 }, { s: 4.4, y: 2.05 }],
  ]) }),
  a350: (fus, T) => ({
    finestres: escala(fus, T, { Ln: 9.5, Rt: 2.98 }, [
      [[3.4, 2.0], { s: 3.55, x: 1.1 }, { s: 4.25, x: 1.65 }, [4.45, 2.0]],
      [{ s: 3.95, y: 0.98 }, { s: 4.85, y: 0.92 }, { s: 4.85, y: 1.85 }, { s: 4.4, y: 2.05 }],
      [{ s: 4.95, y: 0.92 }, { s: 5.55, y: 0.9 }, { s: 5.45, y: 1.5 }, { s: 5.0, y: 1.8 }],
    ]),
    mascara: escala(fus, T, { Ln: 9.5, Rt: 2.98 }, [
      [[3.2, 0], { s: 3.35, x: 1.05 }, { s: 3.8, y: 0.75 }, { s: 5.0, y: 0.7 }, { s: 6.0, y: 0.78 }, { s: 5.9, y: 1.55 }, { s: 5.0, y: 2.1 }, [4.65, 0]],
    ]),
  }),
  e190: (fus, T) => ({ finestres: escala(fus, T, { Ln: 5.6, Rt: 1.505 }, [
    [[2.15, 2.4], { s: 2.3, x: 0.55 }, { s: 2.8, x: 0.88 }, [2.85, 2.4]],
    [{ s: 2.5, y: 0.42 }, { s: 3.2, y: 0.38 }, { s: 3.2, y: 0.92 }, { s: 2.85, y: 1.05 }],
    [{ s: 3.3, y: 0.38 }, { s: 3.75, y: 0.38 }, { s: 3.7, y: 0.72 }, { s: 3.33, y: 0.9 }],
  ]) }),
  atr: (fus, T) => ({ finestres: escala(fus, T, { Ln: 4.0, Rt: 1.4 }, [
    [[1.35, 2.6], { s: 1.45, x: 0.5 }, { s: 1.95, x: 0.8 }, [2.0, 2.6]],
    [{ s: 1.65, y: 0.42 }, { s: 2.3, y: 0.38 }, { s: 2.3, y: 0.85 }, { s: 2.0, y: 0.98 }],
    [{ s: 2.4, y: 0.38 }, { s: 2.85, y: 0.38 }, { s: 2.8, y: 0.72 }, { s: 2.43, y: 0.86 }],
  ]) }),
};
