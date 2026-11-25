// Fragments GLSL compartits entre el globus i les tessel·les.
// Il·luminació comuna de la superfície (esfera base i tessel·les). Necessita els uniforms uSol, uDN, uAtm.
// dia = color de dia, aigua = 0..1 (oceà), Ng = normal geomètrica, N = normal amb relleu, V = cap a la càmera,
// llums = textura nocturna, lluny = 0.5..1 (atenua les llums de ciutat de baixa resolució a prop).
export const GLSL_LLUM = /* glsl */`
vec3 ilumina(vec3 dia, float aigua, vec3 Ng, vec3 N, vec3 V, vec3 llums, float lluny, float espec){
  float ndlG = mix(1.0, dot(Ng, uSol), uDN);
  float ndl = mix(1.0, dot(N, uSol), uDN);
  float lit = smoothstep(-0.10, 0.30, ndlG);
  float dif = clamp(ndl, 0.0, 1.0);
  vec3 col = dia * lit * (0.62 + 0.55 * dif);
  col *= mix(1.0, 0.92, aigua);
  // Nit: llums de ciutats (només la part càlida de la textura) i una mica de llum freda
  float nit = 1.0 - smoothstep(-0.20, 0.06, ndlG);
  float calida = max(llums.r - 0.55 * llums.b - 0.06, 0.0);
  vec3 calid = vec3(1.0, 0.70, 0.36) * pow(calida, 0.75) * 3.2 + vec3(1.0, 0.85, 0.6) * pow(calida, 2.0) * 3.0;
  col += (calid * lluny + llums * vec3(0.30, 0.42, 0.7) * 0.7) * nit * uDN;
  col += dia * vec3(0.020, 0.032, 0.062) * (1.0 - lit) * uDN;
  // Crepuscle
  float tw = exp(-pow((ndlG - 0.02) / 0.13, 2.0));
  col *= mix(vec3(1.0), vec3(1.22, 0.82, 0.62), tw * 0.65 * uDN);
  // Reflex del Sol sobre l'aigua
  vec3 Hh = normalize(uSol + V);
  float esp = pow(max(dot(N, Hh), 0.0), 110.0) * aigua * smoothstep(0.0, 0.2, ndlG) * espec;
  col += vec3(1.0, 0.92, 0.78) * esp * 1.5;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0) * aigua * lit;
  col += vec3(0.10, 0.22, 0.45) * fres * 0.5 * espec;
  // Vora atmosfèrica sobre el disc, més brillant cap al Sol
  float vora = pow(1.0 - max(dot(Ng, V), 0.0), 2.6);
  float solV = 0.10 + 0.90 * smoothstep(-0.30, 0.45, ndlG);
  vec3 cAtm = mix(vec3(0.12, 0.38, 1.0), vec3(0.45, 0.78, 1.0), smoothstep(-0.1, 0.8, ndlG));
  col += cAtm * vora * solV * 0.95 * uAtm;
  return col;
}`;
