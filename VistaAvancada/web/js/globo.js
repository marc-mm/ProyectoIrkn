// Globus terraqüi: esfera base (textures NASA) amb shader dia/nit, tessel·les de satèl·lit d'alta resolució a sobre
// (teselas.js), halo atmosfèric, fons d'estrelles i resplendor solar. Tots els shaders porten profunditat logarítmica
// (cal per poder tenir alhora el planeta sencer i un avió a 50 m de la càmera).
import * as THREE from 'three';
import { dirSol } from './sol.js';
import { crearTeselas } from './teselas.js';
import { GLSL_LLUM } from './shaders.js';

const VERT_TERRA = /* glsl */`
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vUv = uv; vN = normal; vP = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #include <logdepthbuf_vertex>
}`;

const FRAG_TERRA = /* glsl */`
precision highp float;
uniform sampler2D tDia, tNit, tBump, tAigua;
uniform vec3 uSol, uCam;
uniform float uDN, uAtm, uBump;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
#include <logdepthbuf_pars_fragment>
${GLSL_LLUM}
void main(){
  #include <logdepthbuf_fragment>
  vec3 Ng = normalize(vN);
  vec3 V = normalize(uCam - vP);
  vec3 dia = texture2D(tDia, vUv).rgb;
  float aigua = texture2D(tAigua, vUv).r;
  // Relleu subtil: perturbació de la normal a partir de derivades de pantalla del mapa d'alçades
  float h = texture2D(tBump, vUv).r;
  vec3 sx = dFdx(vP), sy = dFdy(vP);
  vec3 r1 = cross(sy, Ng), r2 = cross(Ng, sx);
  float det = dot(sx, r1);
  vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  vec3 N = normalize(abs(det) * Ng - uBump * grad * (1.0 - aigua));
  float lluny = mix(0.5, 1.0, smoothstep(1.03, 1.7, length(uCam)));
  gl_FragColor = vec4(ilumina(dia, aigua, Ng, N, V, texture2D(tNit, vUv).rgb, lluny, 1.0), 1.0);
}`;

const VERT_ATM = /* glsl */`
varying vec3 vW;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vW = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #include <logdepthbuf_vertex>
}`;

const FRAG_ATM = /* glsl */`
precision highp float;
uniform vec3 uCam, uSol; uniform float uRs, uOn;
varying vec3 vW;
#include <logdepthbuf_pars_fragment>
void main(){
  #include <logdepthbuf_fragment>
  vec3 d = normalize(vW - uCam);
  float t = -dot(uCam, d);
  vec3 q = uCam + d * t;                 // punt del raig més proper al centre de la Terra
  float h = length(q);
  // Si la càmera és dins l'atmosfera i mira cap amunt, el raig no passa per sota: cel blau suau
  float dins = 1.0 - smoothstep(1.0, 1.02, length(uCam));
  float k = clamp((h - 1.0) / (uRs - 1.0), 0.0, 1.0);
  float glow = pow(1.0 - k, 3.6);
  float s = dot(normalize(q), uSol);
  vec3 col = mix(vec3(0.10, 0.34, 1.0), vec3(0.42, 0.74, 1.0), smoothstep(-0.2, 0.8, s));
  col = mix(col, vec3(1.0, 0.48, 0.22), exp(-pow(s / 0.20, 2.0)) * 0.55);
  float lit = 0.10 + 0.90 * smoothstep(-0.40, 0.45, s);
  col = mix(col, vec3(0.30, 0.52, 0.92), dins * 0.7);        // cel blau natural quan la càmera és dins l'atmosfera
  float a = max(glow, dins * 0.75) * lit * uOn;
  gl_FragColor = vec4(col * a * 1.35, a);
}`;

// Textura radial per a la resplendor del Sol.
function texturaSol() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,250,235,1)'); r.addColorStop(0.08, 'rgba(255,240,200,0.95)');
  r.addColorStop(0.25, 'rgba(255,200,120,0.35)'); r.addColorStop(1, 'rgba(255,160,80,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const RADI_ATM = 1.15;
const RADI_BASE = 0.99985;            // l'esfera base queda ~1 km per sota de les tessel·les (sense parpelleig)

// Crea tots els objectes del globus i retorna controls d'actualització.
export async function crearGlobo(renderer, escena, camera) {
  const carg = new THREE.TextureLoader();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const carrega = async (url, mip = true) => {
    const t = await carg.loadAsync(url);
    t.anisotropy = aniso; t.generateMipmaps = mip;
    t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    return t;
  };
  const [tDia, tNit, tBump, tAigua, tCel] = await Promise.all([
    carrega('img/earth-blue-marble.jpg'), carrega('img/earth-night.jpg'),
    carrega('img/earth-topology.png'), carrega('img/earth-water.png'), carrega('img/night-sky.png'),
  ]);
  tCel.colorSpace = THREE.SRGBColorSpace;

  const uniformes = {
    tDia: { value: tDia }, tNit: { value: tNit }, tBump: { value: tBump }, tAigua: { value: tAigua },
    uSol: { value: new THREE.Vector3(1, 0, 0) }, uCam: { value: new THREE.Vector3() },
    uDN: { value: 1 }, uAtm: { value: 1 }, uBump: { value: 0.0045 },
  };
  const terra = new THREE.Mesh(
    new THREE.SphereGeometry(1, 384, 256),
    new THREE.ShaderMaterial({ vertexShader: VERT_TERRA, fragmentShader: FRAG_TERRA, uniforms: uniformes })
  );
  terra.scale.setScalar(RADI_BASE);
  terra.frustumCulled = false; terra.renderOrder = -2;
  escena.add(terra);

  const teselas = crearTeselas(escena, renderer, uniformes, tAigua.image);

  const uAtm2 = { uCam: uniformes.uCam, uSol: uniformes.uSol, uRs: { value: RADI_ATM }, uOn: { value: 1 } };
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(RADI_ATM, 96, 64),
    new THREE.ShaderMaterial({
      vertexShader: VERT_ATM, fragmentShader: FRAG_ATM, uniforms: uAtm2,
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  halo.renderOrder = 1; halo.frustumCulled = false;
  escena.add(halo);

  const cel = new THREE.Mesh(
    new THREE.SphereGeometry(90, 48, 32),
    new THREE.MeshBasicMaterial({ map: tCel, side: THREE.BackSide, depthWrite: false, color: 0x9aa3b4, fog: false })
  );
  cel.renderOrder = -10; cel.frustumCulled = false;
  cel.rotation.set(0.4, 1.0, 0);
  escena.add(cel);

  const sprSol = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texturaSol(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false,
  }));
  sprSol.scale.set(26, 26, 1);
  escena.add(sprSol);

  // Llums per als models d'avió detallats (materials PBR): sol direccional + cel
  const llumSol = new THREE.DirectionalLight(0xfff4e6, 2.6);
  const llumCel = new THREE.HemisphereLight(0xbfd8ff, 0x4a4036, 0.9);
  escena.add(llumSol, llumSol.target, llumCel);

  const dirV = new THREE.Vector3(), up = new THREE.Vector3();
  return {
    terra, halo, cel, sprSol, teselas,
    // Actualitza el Sol (hora simulada), la càmera, les llums i les tessel·les.
    actualizar(msSim, cam, H, frame) {
      dirSol(msSim, dirV);
      uniformes.uSol.value.copy(dirV);
      uniformes.uCam.value.copy(cam.position);
      sprSol.position.copy(dirV).multiplyScalar(70);
      const hCam = cam.position.length() - 1;
      // El relleu de la textura base només té sentit de lluny (a prop hi ha les tessel·les)
      uniformes.uBump.value = 0.0045 * Math.min(1, Math.max(0, (hCam - 0.01) / 0.05));
      // Intensitat de les llums segons si la zona que es mira és de dia o de nit
      up.copy(cam.position).normalize();
      const sDia = THREE.MathUtils.smoothstep(up.dot(dirV), -0.12, 0.18);
      llumSol.position.copy(cam.position).addScaledVector(dirV, 10);
      llumSol.target.position.copy(cam.position);
      llumSol.intensity = 0.15 + 2.6 * sDia;
      llumCel.intensity = 0.25 + 0.75 * sDia;
      // Dins l'atmosfera i de dia, les estrelles no es veuen
      const dins = 1 - THREE.MathUtils.smoothstep(hCam, 0.0, 0.02);
      const est = 1 - dins * sDia * uAtm2.uOn.value;
      cel.material.color.setRGB(0.60 * est, 0.64 * est, 0.71 * est);
      teselas.actualitzar(cam, H, frame);
    },
    dirSol: dirV,
    ponDiaNoche(b) { uniformes.uDN.value = b ? 1 : 0; },
    ponAtmosfera(b) { uniformes.uAtm.value = b ? 1 : 0; uAtm2.uOn.value = b ? 1 : 0; halo.visible = b; },
    ponSatelit(b) { teselas.ponActiu(b); },
    uniformes,
  };
}
