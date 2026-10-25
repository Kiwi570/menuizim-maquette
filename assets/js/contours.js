/* La MenuiZim — « Cernes → courbes de niveau » (WebGL 2, OGL).
   La coupe d'un chêne se redessine en courbes de niveau ; la souris déforme le
   champ comme un nœud du bois et la courbe survolée s'allume à l'orange du logo.
   Sans WebGL 2 : photo des cernes + courbes dessinées en SVG. */
import { Renderer, Program, Mesh, Texture, Triangle } from './vendor/ogl.bundle.js?v=4';

const MZ = window.MZ || {};
const calme = document.documentElement.classList.contains('calme');
const BASE = document.documentElement.getAttribute('data-base') || '';

const BRUIT = /* glsl */ `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
// champ d'altitude : distance au cœur, ondulée comme un cerne
float champ(vec2 p) {
  float n = fbm(p * 2.2 + vec2(0.0, uTemps * 0.015));
  float a = atan(p.y, p.x);
  float ride = 0.018 * sin(a * 3.0 + n * 4.0);
  return length(p * vec2(1.0, 1.08)) + (n - 0.5) * 0.16 + ride;
}
`;

// L'altitude sous la souris est calculée une seule fois par sommet (et non par pixel)
const vertex = /* glsl */ `#version 300 es
precision highp float;
in vec2 uv;
in vec2 position;
uniform vec2 uRes;
uniform vec2 uCentre;
uniform vec2 uSouris;
uniform float uTemps;
uniform float uDensite;
out vec2 vUv;
flat out float vHm;
${BRUIT}
void main() {
  vUv = uv;
  vec2 m = (uSouris - uCentre) * vec2(uRes.x / uRes.y, 1.0);
  vHm = champ(m) * uDensite;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D tCernes;
uniform vec2 uRes;
uniform vec2 uTex;
uniform vec2 uCoeur;      // cœur des cernes, en coordonnées de texture
uniform vec2 uCentre;     // position voulue du cœur à l'écran (0..1)
uniform float uTemps;
uniform float uRevele;    // 0 = photo des cernes, 1 = courbes de niveau
uniform vec2 uSouris;     // en uv écran
uniform float uForce;
uniform float uDensite;
uniform float uFond;      // part de photo conservée sous les courbes
uniform float uMasque;    // atténuation à gauche (texte)
uniform vec3 cPapier;
uniform vec3 cEncre;
uniform vec3 cTraceur;
in vec2 vUv;
flat in float vHm;
out vec4 fragColor;

${BRUIT}
void main() {
  float aspect = uRes.x / uRes.y;
  // repère écran centré sur uCentre, corrigé du rapport
  vec2 p = (vUv - uCentre) * vec2(aspect, 1.0);
  vec2 m = (uSouris - uCentre) * vec2(aspect, 1.0);
  float dm = length(p - m);
  float noeud = uForce * 0.09 * exp(-dm * dm * 26.0);

  float h = (champ(p) + noeud) * uDensite;
  float hm = vHm;
  float fw = fwidth(h);
  float f = abs(fract(h - 0.5) - 0.5);
  float ligne = 1.0 - smoothstep(0.0, fw * 1.15, f - fw * 0.15);
  float hi = h / 5.0;
  float fi = abs(fract(hi - 0.5) - 0.5);
  float fwi = fwidth(hi);
  float maitre = 1.0 - smoothstep(0.0, fwi * 1.8, fi - fwi * 0.3);
  float niveau = floor(h + 0.5);
  float survol = (1.0 - step(0.5, abs(niveau - floor(hm + 0.5)))) * uForce;

  // photo des cernes, recadrée pour que son cœur tombe sur uCentre
  vec2 s = vec2(1.0);
  float ta = uTex.x / uTex.y;
  if (aspect > ta) s = vec2(1.0, ta / aspect); else s = vec2(aspect / ta, 1.0);
  s *= 0.75;
  vec2 dd = (vUv - uCentre) * s;
  vec2 tuv = clamp(uCoeur + vec2(dd.x, -dd.y), 0.0, 1.0);
  vec3 photo = texture(tCernes, vec2(tuv.x, 1.0 - tuv.y)).rgb;

  float att = mix(1.0 - uMasque, 1.0, smoothstep(0.18, 0.62, vUv.x));
  vec3 fond = mix(cPapier, photo, uFond);
  vec3 col = mix(fond, cEncre, ligne * 0.38 * att);
  col = mix(col, cEncre, maitre * 0.62 * att);
  col = mix(col, cTraceur, survol * max(ligne, maitre) * 0.95);

  // ouverture : la photo se dissout en courbes depuis le cœur
  float rr = length(p);
  float front = uRevele * 1.9 - 0.12;
  float k = smoothstep(front - 0.12, front, rr);
  // liseré orange sur le front de révélation
  float lise = (1.0 - smoothstep(0.0, 0.012, abs(rr - front + 0.06))) * (1.0 - step(0.999, uRevele));
  col = mix(col, photo, k);
  col = mix(col, cTraceur, lise * 0.9);
  fragColor = vec4(col, 1.0);
}`;

function hex(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function paire(s, def) {
  if (!s) return def;
  const [a, b] = s.split(',').map(Number);
  return [a, b];
}

function repli(box) {
  // Version sans WebGL : photo des cernes en fond pâle + courbes SVG
  const portrait = innerHeight > innerWidth;
  const src = box.getAttribute(portrait ? 'data-tex-v' : 'data-tex-h');
  const f = document.createElement('div');
  f.className = 'hero__fallback';
  f.style.backgroundImage = `linear-gradient(color-mix(in srgb, var(--lin) 88%, transparent), color-mix(in srgb, var(--lin) 88%, transparent)), url("${BASE}${src}")`;
  const [cx, cy] = paire(box.getAttribute('data-centre'), [0.62, 0.45]);
  const w = 1000; const h = 640;
  f.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${MZ.topo ? MZ.topo([{ x: cx * w, y: cy * h, niveaux: 26, pas: 22, seed: 3, etir: 1.1 }]) : ''}</svg>`;
  box.appendChild(f);
}

function lancer(box) {
  let renderer;
  try {
    renderer = new Renderer({ dpr: Math.min(devicePixelRatio || 1, 1.5), webgl: 2, alpha: false, antialias: false, powerPreference: 'low-power' });
  } catch (e) { return repli(box); }
  const gl = renderer.gl;
  if (!gl || !renderer.isWebgl2) return repli(box);
  box.appendChild(gl.canvas);
  gl.clearColor(0.933, 0.91, 0.867, 1);

  const portrait = () => box.clientHeight > box.clientWidth * 1.1;
  let modePortrait = portrait();
  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, flipY: true });
  const charger = () => {
    const im = new Image();
    im.decoding = 'async';
    im.onerror = () => { if (!pret) { gl.canvas.remove(); repli(box); } };
    im.onload = () => { texture.image = im; uniforms.uTex.value = [im.naturalWidth, im.naturalHeight]; pret = true; if (enCours) renderer.render({ scene: mesh }); else demarrer(); };
    const src = box.getAttribute(modePortrait ? 'data-tex-v' : 'data-tex-h');
    im.src = BASE + (box.clientWidth * Math.min(devicePixelRatio || 1, 1.5) < 1100 ? src.replace('-1200.webp', '-640.webp') : src);
  };

  const css = getComputedStyle(document.documentElement);
  const couleur = (v, d) => hex((css.getPropertyValue(v) || d).trim() || d);
  const centre = paire(box.getAttribute('data-centre'), null);
  const uniforms = {
    tCernes: { value: texture },
    uRes: { value: [1, 1] },
    uTex: { value: [1168, 784] },
    uCoeur: { value: paire(box.getAttribute(modePortrait ? 'data-coeur-v' : 'data-coeur-h'), [0.5, 0.5]) },
    uCentre: { value: centre || [0.64, 0.46] },
    uTemps: { value: 0 },
    uRevele: { value: calme ? 1 : 0 },
    uSouris: { value: [0.64, 0.46] },
    uForce: { value: 0 },
    uDensite: { value: parseFloat(box.getAttribute('data-densite')) || 14 },
    uFond: { value: box.hasAttribute('data-calme-fond') ? 0.05 : 0.09 },
    uMasque: { value: 0.72 },
    cPapier: { value: couleur('--lin', '#eee8dd') },
    cEncre: { value: couleur('--graphite', '#1e1d1a') },
    cTraceur: { value: couleur('--traceur', '#f08c36') }
  };
  const program = new Program(gl, { vertex, fragment, uniforms });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  // Repère « atelier » placé sur le cœur
  const repere = box.getAttribute('data-repere') ? document.querySelector(box.getAttribute('data-repere')) : null;

  function taille() {
    const w = box.clientWidth; const h = box.clientHeight;
    renderer.setSize(w, h);
    uniforms.uRes.value = [w, h];
    if (!centre) {
      // cœur à droite sur grand écran, en haut sur mobile
      uniforms.uCentre.value = w > 900 ? [0.56, 0.37] : [0.66, 1 - Math.min(0.32, (box.getBoundingClientRect().top + window.scrollY + 165) / h)];
    }
    uniforms.uMasque.value = w > 900 ? 0.72 : 0.35;
    if (repere) {
      const [ux, uy] = uniforms.uCentre.value;
      repere.style.left = `${ux * w}px`;
      repere.style.top = `${(1 - uy) * h}px`;
    }
    const p = portrait();
    if (p !== modePortrait) { modePortrait = p; uniforms.uCoeur.value = paire(box.getAttribute(p ? 'data-coeur-v' : 'data-coeur-h'), [0.5, 0.5]); charger(); }
  }

  let pret = false;
  let enCours = false;
  let visible = true;
  const souris = { x: 0.64, y: 0.46, f: 0 };
  const cible = { x: 0.64, y: 0.46, f: 0 };
  const zone = box.parentElement || box;
  zone.addEventListener('pointermove', (e) => {
    const b = box.getBoundingClientRect();
    cible.x = (e.clientX - b.left) / b.width;
    cible.y = 1 - (e.clientY - b.top) / b.height;
    cible.f = e.pointerType === 'mouse' ? 1 : 0.6;
    demarrer();
  }, { passive: true });
  zone.addEventListener('pointerleave', () => { cible.f = 0; demarrer(); });

  /* Rendu à la demande : la boucle ne tourne que pendant l'ouverture et quand la souris
     bouge, puis s'arrête (aucun calcul quand rien ne change, ni hors de l'écran). */
  let animOuverture = !calme;
  let temps = 0;
  let dernier = 0;
  function frame(now) {
    if (!visible || document.hidden) { enCours = false; return; }
    const dt = dernier ? Math.min(0.05, (now - dernier) / 1000) : 0.016;
    dernier = now;
    souris.x += (cible.x - souris.x) * 0.08;
    souris.y += (cible.y - souris.y) * 0.08;
    souris.f += (cible.f - souris.f) * 0.05;
    temps += dt;
    uniforms.uSouris.value = [souris.x, souris.y];
    uniforms.uForce.value = souris.f;
    uniforms.uTemps.value = temps;
    renderer.render({ scene: mesh });
    const bouge = Math.abs(cible.x - souris.x) + Math.abs(cible.y - souris.y) > 0.0004 || Math.abs(cible.f - souris.f) > 0.003;
    if (animOuverture || bouge) requestAnimationFrame(frame);
    else { enCours = false; dernier = 0; }
  }
  function demarrer() {
    if (!pret || enCours || !visible) return;
    if (calme) { renderer.render({ scene: mesh }); return; }
    enCours = true;
    requestAnimationFrame(frame);
  }

  taille();
  window.addEventListener('resize', () => { taille(); if (pret) { if (calme || !enCours) renderer.render({ scene: mesh }); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) demarrer(); });
  charger();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) demarrer();
    }).observe(box);
  }

  // Ouverture orchestrée : la photo se change en courbes (≈ 2,4 s)
  if (!calme && window.gsap) {
    gsap.to(uniforms.uRevele, { value: 1, duration: 2.4, ease: 'power2.inOut', delay: 0.15, onComplete: () => { animOuverture = false; } });
    if (repere) gsap.fromTo(repere, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.9, onStart: () => { repere.hidden = false; } });
  } else if (repere) { repere.hidden = false; }

  return { uniforms };
}

const demarrage = () => document.querySelectorAll('[data-contours]').forEach((box) => {
  try { lancer(box); } catch (e) { repli(box); }
});
if (document.documentElement.classList.contains('arrivee')) setTimeout(demarrage, 650);
else demarrage();
