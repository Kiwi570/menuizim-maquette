/* La MenuiZim — comportements communs à toutes les pages
   (mode calme, défilement fluide, en-tête, réticule, cotes, copeaux, transitions). */
(function () {
  'use strict';
  const d = document;
  const html = d.documentElement;
  const MZ = window.MZ;
  const BASE = html.getAttribute('data-base') || '';
  window.MZ_BASE = BASE;
  const hasGsap = typeof window.gsap !== 'undefined';
  const calme = html.classList.contains('calme') || !hasGsap;
  MZ.calme = calme;
  MZ.fin = matchMedia('(pointer: fine)').matches;

  /* ---------- Mode calme : bascule mémorisée ---------- */
  d.querySelectorAll('[data-bascule-calme]').forEach((b) => {
    b.setAttribute('aria-pressed', String(html.classList.contains('calme')));
    b.addEventListener('click', () => {
      const v = !html.classList.contains('calme');
      try { localStorage.setItem('mz-calme', v ? '1' : '0'); } catch (e) { /* stockage indisponible */ }
      html.classList.toggle('calme', v);
      b.setAttribute('aria-pressed', String(v));
      location.reload();
    });
  });

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.Flip) gsap.registerPlugin(Flip);
    gsap.defaults({ ease: 'expo.out', duration: 1.1 });
  }

  /* ---------- Défilement fluide (Lenis) ---------- */
  let lenis = null;
  if (!calme && window.Lenis) {
    lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  MZ.lenis = lenis;
  MZ.scrollTo = (cible) => {
    const el = typeof cible === 'string' ? d.querySelector(cible) : cible;
    if (!el) return;
    const barre = d.querySelector('[data-filtres]');
    const off = -(parseInt(getComputedStyle(html).getPropertyValue('--head-h'), 10) || 76) - 10 - (barre && el.closest('main') && barre.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING ? barre.offsetHeight : 0);
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: calme ? 'auto' : 'smooth' });
  };
  /* Chemins comparés sans « .html » ni « index » : / = /index.html, /projet = /projet.html */
  const norm = (p) => (p.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/');
  const memePage = (url) => norm(url.pathname) === norm(location.pathname);
  MZ.memePage = memePage;

  /* En ligne (Vercel, cleanUrls) : liens directs vers les adresses propres, sans redirection */
  if (/(\.vercel\.app|menuizim\.fr)$/.test(location.hostname)) {
    d.querySelectorAll('a[href]').forEach((a) => {
      const h = a.getAttribute('href');
      if (!h || /^(https?:|tel:|mailto:|sms:|#)/.test(h)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
      a.href = norm(url.pathname) + url.hash;
    });
  }

  /* Préchargement de la page visée au survol ou au toucher */
  const prechargees = new Set();
  const precharger = (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || memePage(url)) return;
    const cleP = url.pathname;
    if (prechargees.has(cleP)) return;
    prechargees.add(cleP);
    const l = d.createElement('link');
    l.rel = 'prefetch'; l.href = cleP; l.as = 'document';
    d.head.appendChild(l);
  };
  d.addEventListener('pointerover', precharger, { passive: true });
  d.addEventListener('touchstart', precharger, { passive: true });
  d.addEventListener('focusin', precharger);

  // Ancres internes
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (!memePage(url) || !url.hash || url.hash.length < 2) return;
    const cible = d.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!cible) return;
    e.preventDefault();
    fermerMenu();
    MZ.scrollTo(cible);
  });
  // Arrivée sur une page avec une ancre
  window.addEventListener('load', () => {
    if (location.hash.length > 1) {
      let c = null; try { c = d.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { /* ancre invalide */ }
      if (c) setTimeout(() => MZ.scrollTo(c), 300);
    }
  });

  /* ---------- En-tête ---------- */
  const head = d.querySelector('[data-head]');
  const logo = d.querySelector('.marque img');
  let dernier = 0;
  let enAttente = false;
  function surDefilement() {
    enAttente = false;
    const y = window.scrollY;
    if (head) {
      head.classList.toggle('is-plein', y > 60);
      const descend = y > dernier && y > 420;
      head.classList.toggle('is-cache', descend && !d.querySelector('.menu-mobile.is-ouvert'));
    }
    if (logo && !calme) logo.style.transform = `rotate(${(y * 0.09) % 360}deg)`;
    dernier = y;
  }
  window.addEventListener('scroll', () => { if (!enAttente) { enAttente = true; requestAnimationFrame(surDefilement); } }, { passive: true });
  surDefilement();

  /* ---------- Contenu inerte (menu ouvert, visionneuse) ---------- */
  MZ.inerte = (v, tout = false) => { d.querySelectorAll('main, .pied, .skip' + (tout ? ', .site-head, .menu-mobile' : '')).forEach((n) => { n.inert = v; }); };

  /* ---------- Menu mobile ---------- */
  const burger = d.querySelector('.burger');
  const menu = d.getElementById('menu-mobile');
  function fermerMenu() {
    if (!menu || !menu.classList.contains('is-ouvert')) return;
    menu.classList.remove('is-ouvert');
    html.classList.remove('verrou');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    MZ.inerte(false);
    if (lenis) lenis.start();
  }
  if (burger && menu) {
    menu.setAttribute('data-lenis-prevent', '');
    matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) fermerMenu(); });
    burger.addEventListener('click', () => {
      const ouvrir = !menu.classList.contains('is-ouvert');
      if (!ouvrir) return fermerMenu();
      menu.classList.add('is-ouvert');
      html.classList.add('verrou');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
      MZ.inerte(true);
      if (lenis) lenis.stop();
      setTimeout(() => { const l = menu.querySelector('nav a'); if (l) l.focus({ preventScroll: true }); }, 120);
      if (!calme) gsap.fromTo(menu.querySelectorAll('nav a'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, delay: 0.15, overwrite: true });
    });
    d.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('is-ouvert')) return;
      if (e.key === 'Escape') { fermerMenu(); burger.focus(); return; }
      if (e.key !== 'Tab') return;
      const f = [burger, ...menu.querySelectorAll('a[href], button:not([disabled])')];
      const i = f.indexOf(d.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* ---------- Copier ---------- */
  d.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copier]');
    if (!b) return;
    const txt = b.getAttribute('data-copier');
    const libelle = b.textContent;
    const ok = () => { b.textContent = 'Copié'; setTimeout(() => { b.textContent = libelle; }, 1600); };
    const repli = () => {
      const r = d.createRange();
      const cible = b.previousElementSibling || b;
      r.selectNodeContents(cible);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      b.textContent = 'Sélectionné';
      setTimeout(() => { b.textContent = libelle; }, 1600);
    };
    try { navigator.clipboard.writeText(txt).then(ok, repli); } catch (err) { repli(); }
  });

  /* ---------- Réticule de géomètre ---------- */
  if (!calme && MZ.fin && hasGsap) {
    const r = d.createElement('div');
    r.className = 'reticule';
    r.setAttribute('aria-hidden', 'true');
    r.innerHTML = '<div class="reticule__c"></div><div class="reticule__xy"></div>';
    d.body.appendChild(r);
    html.classList.add('has-reticule');
    const xy = r.querySelector('.reticule__xy');
    const qx = gsap.quickTo(r, 'x', { duration: 0.35, ease: 'power3' });
    const qy = gsap.quickTo(r, 'y', { duration: 0.35, ease: 'power3' });
    const pad = (n) => String(Math.max(0, Math.round(n))).padStart(4, '0');
    let vu = false;
    d.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!vu) { gsap.set(r, { x: e.clientX, y: e.clientY }); vu = true; r.style.opacity = 1; }
      qx(e.clientX); qy(e.clientY);
      xy.textContent = `E ${pad(e.clientX)} · N ${pad(e.pageY)}`;
      const t = e.target;
      r.classList.toggle('is-lien', !!(t.closest && t.closest('a, button, label, select, [data-lien]')));
      r.classList.toggle('is-nuit', !!(t.closest && t.closest('.on-nuit, .visionneuse')));
    }, { passive: true });
    d.addEventListener('pointerleave', () => { r.style.opacity = 0; vu = false; });
  }

  /* ---------- Boutons magnétiques ---------- */
  if (!calme && MZ.fin && hasGsap) {
    d.querySelectorAll('.magnetic').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const qy = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const b = el.getBoundingClientRect();
        qx((e.clientX - b.left - b.width / 2) * 0.28);
        qy((e.clientY - b.top - b.height / 2) * 0.38);
      });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ---------- Coup de rabot : copeaux au clic ---------- */
  let cv = null;
  let cx = null;
  let copeaux = [];
  let boucle = false;
  function burst(x, y) {
    if (!cv) {
      cv = d.createElement('canvas');
      cv.className = 'copeaux-canvas';
      cv.setAttribute('aria-hidden', 'true');
      d.body.appendChild(cv);
      cx = cv.getContext('2d');
    }
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const teintes = ['#c79a5f', '#b4864e', '#d8b88a', '#a8763f', '#e3c99f'];
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const v = 3 + Math.random() * 6;
      copeaux.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5,
        r: 3 + Math.random() * 6, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.35,
        arc: 2.6 + Math.random() * 2.4, w: 1.6 + Math.random() * 2.2,
        c: teintes[(Math.random() * teintes.length) | 0], vie: 1
      });
    }
    if (!boucle) { boucle = true; requestAnimationFrame(anim); }
  }
  function anim() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    copeaux = copeaux.filter((p) => p.vie > 0);
    copeaux.forEach((p) => {
      p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vie -= 0.016;
      cx.save();
      cx.globalAlpha = Math.max(0, Math.min(1, p.vie * 1.6));
      cx.translate(p.x, p.y); cx.rotate(p.rot);
      cx.strokeStyle = p.c; cx.lineWidth = p.w; cx.lineCap = 'round';
      cx.beginPath();
      // copeau enroulé : spirale courte
      for (let t = 0; t <= p.arc; t += 0.25) {
        const rr = p.r * (1 - t / (p.arc * 1.6));
        const px = Math.cos(t) * rr; const py = Math.sin(t) * rr;
        if (t === 0) cx.moveTo(px, py); else cx.lineTo(px, py);
      }
      cx.stroke();
      cx.restore();
    });
    if (copeaux.length) requestAnimationFrame(anim);
    else { boucle = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  if (!calme) {
    d.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.btn');
      if (b) burst(e.clientX, e.clientY);
    });
  }
  MZ.copeaux = burst;

  /* ---------- Lignes de cote ---------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    const n = d.createElementNS(SVGNS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  }
  MZ.cotes = function (frame) {
    if (frame.__cotes) return frame.__cotes;
    const lh = frame.getAttribute('data-cote-h') || '';
    const lv = frame.getAttribute('data-cote-v') || '';
    const svg = el('svg', { class: 'cotes', 'aria-hidden': 'true' });
    frame.appendChild(svg);
    const M = 34; // marge du cadre
    const g = { h: [], v: [] };
    function construire() {
      svg.innerHTML = '';
      const w = frame.clientWidth; const h = frame.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w + 2 * M} ${h + 2 * M}`);
      const y = M - 16; const x = M + w + 16;
      // horizontale (haut)
      const hl = el('line', { x1: M + w / 2, y1: y, x2: M + w / 2, y2: y });
      const ht1 = el('line', { class: 'tick', x1: M, y1: y - 6, x2: M, y2: y + 6 });
      const ht2 = el('line', { class: 'tick', x1: M + w, y1: y - 6, x2: M + w, y2: y + 6 });
      svg.append(hl, ht1, ht2);
      g.h = [hl, ht1, ht2];
      let ht = null; let hr = null;
      if (lh) {
        ht = el('text', { x: M + w / 2, y: y + 3.5, 'text-anchor': 'middle' }); ht.textContent = lh;
        hr = el('rect', { x: M + w / 2, y: y - 9, width: 0, height: 18 });
        svg.append(hr, ht);
      }
      // verticale (droite)
      const vl = el('line', { x1: x, y1: M + h / 2, x2: x, y2: M + h / 2 });
      const vt1 = el('line', { class: 'tick', x1: x - 6, y1: M, x2: x + 6, y2: M });
      const vt2 = el('line', { class: 'tick', x1: x - 6, y1: M + h, x2: x + 6, y2: M + h });
      svg.append(vl, vt1, vt2);
      g.v = [vl, vt1, vt2];
      let vt = null; let vr = null;
      if (lv) {
        vt = el('text', { x, y: M + h / 2, 'text-anchor': 'middle', transform: `rotate(90 ${x} ${M + h / 2})`, dy: 3.5 }); vt.textContent = lv;
        vr = el('rect', { x: x - 9, y: M + h / 2, width: 18, height: 0 });
        svg.append(vr, vt);
      }
      // largeur des étiquettes
      requestAnimationFrame(() => {
        if (ht) { const bw = ht.getComputedTextLength() + 16; hr.setAttribute('x', M + w / 2 - bw / 2); hr.setAttribute('width', bw); }
        if (vt) { const bh = vt.getComputedTextLength() + 16; vr.setAttribute('y', M + h / 2 - bh / 2); vr.setAttribute('height', bh); }
      });
      return { w, h, hl, vl, ht, vt, hr, vr, ticks: [ht1, ht2, vt1, vt2] };
    }
    let parts = construire();
    const etat = { p: 0 };
    function rendre() {
      const { w, h, hl, vl, ht, vt, hr, vr, ticks } = parts;
      const p = etat.p;
      hl.setAttribute('x1', M + w / 2 - (w / 2) * p); hl.setAttribute('x2', M + w / 2 + (w / 2) * p);
      vl.setAttribute('y1', M + h / 2 - (h / 2) * p); vl.setAttribute('y2', M + h / 2 + (h / 2) * p);
      const o = Math.max(0, (p - 0.55) / 0.45);
      [ht, vt, hr, vr].forEach((n) => n && n.setAttribute('opacity', o));
      ticks.forEach((t) => t.setAttribute('opacity', p > 0.02 ? Math.min(1, p * 3) : 0));
    }
    rendre();
    const api = {
      montrer(duree = 1.1) { if (!hasGsap || calme) { etat.p = 1; rendre(); return; } gsap.to(etat, { p: 1, duration: duree, ease: 'expo.out', onUpdate: rendre, overwrite: true }); },
      cacher() { if (!hasGsap || calme) { etat.p = 0; rendre(); return; } gsap.to(etat, { p: 0, duration: 0.6, ease: 'power3.inOut', onUpdate: rendre, overwrite: true }); },
      reconstruire() { parts = construire(); rendre(); }
    };
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => api.reconstruire()).observe(frame);
    frame.__cotes = api;
    return api;
  };
  // Cartes : cotes au survol (pointeur fin) ; sinon à l'entrée dans l'écran
  d.querySelectorAll('[data-cote-survol]').forEach((frame) => {
    const carte = frame.closest('.carte') || frame;
    if (MZ.fin && !calme) {
      carte.addEventListener('pointerenter', () => MZ.cotes(frame).montrer(0.9));
      carte.addEventListener('pointerleave', () => MZ.cotes(frame).cacher());
      carte.addEventListener('focus', () => MZ.cotes(frame).montrer(0.9));
      carte.addEventListener('blur', () => MZ.cotes(frame).cacher());
    }
  });

  /* ---------- Inclinaison 3D des cartes ---------- */
  if (!calme && MZ.fin && hasGsap) {
    d.querySelectorAll('.carte').forEach((c) => {
      const cible = c.querySelector('.carte__img');
      if (!cible) return;
      const rx = gsap.quickTo(cible, 'rotationX', { duration: 0.8, ease: 'power3' });
      const ry = gsap.quickTo(cible, 'rotationY', { duration: 0.8, ease: 'power3' });
      c.addEventListener('pointermove', (e) => {
        const b = cible.getBoundingClientRect();
        ry(((e.clientX - b.left) / b.width - 0.5) * 7);
        rx(-((e.clientY - b.top) / b.height - 0.5) * 7);
      });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- Compteurs à rouleaux (odomètre) ---------- */
  MZ.odo = function (n, retard = 0) {
    const val = n.getAttribute('data-odo');
    if (!val || n.__odo || calme || !hasGsap) return;
    n.__odo = true;
    n.innerHTML = `<span class="visually-hidden">${val}</span>` + val.split('').map((ch) => /\d/.test(ch)
      ? `<span class="odo__col" aria-hidden="true" data-v="${ch}">${'0123456789'.split('').map((k) => `<span>${k}</span>`).join('')}</span>`
      : `<span aria-hidden="true">${ch}</span>`).join('');
    const cols = n.querySelectorAll('.odo__col');
    const finir = () => { n.textContent = val; };
    cols.forEach((c, i) => {
      gsap.fromTo(c, { y: '0em' }, {
        y: `-${c.dataset.v}em`, duration: 1.8 + i * 0.25, delay: retard + i * 0.08, ease: 'expo.inOut',
        onComplete: i === cols.length - 1 ? finir : undefined,
        scrollTrigger: { trigger: n, start: 'top 92%', once: true }
      });
    });
  };
  d.querySelectorAll('[data-odo]').forEach((n) => MZ.odo(n));

  /* ---------- Révélations ---------- */
  if (!calme) {
    d.querySelectorAll('[data-revele]').forEach((m) => {
      const im = m.querySelector('img');
      const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 88%', once: true } });
      tl.fromTo(m, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
      if (im) tl.fromTo(im, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.1);
    });
    d.querySelectorAll('[data-rang]').forEach((li, i) => {
      gsap.from(li, { y: 30, opacity: 0, duration: 1, delay: (i % 7) * 0.05, scrollTrigger: { trigger: li, start: 'top 94%', once: true } });
    });
  }

  /* ---------- Courbes de niveau en SVG (sans WebGL) ---------- */
  // bruit de valeur 2D léger, déterministe
  function hash(x, y, s) { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); }
  function bruit(x, y, s) {
    const xi = Math.floor(x); const yi = Math.floor(y); const xf = x - xi; const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf); const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s); const b = hash(xi + 1, yi, s); const c = hash(xi, yi + 1, s); const e = hash(xi + 1, yi + 1, s);
    return (a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v) * 2 - 1;
  }
  function chemin(pts) {
    const n = pts.length;
    let s = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n]; const p1 = pts[i]; const p2 = pts[(i + 1) % n]; const p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      s += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return s + 'Z';
  }
  /* collines : [{x, y, niveaux, pas, etir, seed}] → <path> dans un <g class="topo"> */
  MZ.topo = function (collines, { idx = 5 } = {}) {
    let out = '<g class="topo">';
    collines.forEach((c) => {
      const N = 72;
      for (let k = 1; k <= c.niveaux; k++) {
        const base = k * c.pas;
        const pts = [];
        for (let i = 0; i < N; i++) {
          const t = (i / N) * Math.PI * 2;
          const n1 = bruit(Math.cos(t) * 1.4 + 10, Math.sin(t) * 1.4 + k * 0.06, c.seed || 1);
          const n2 = bruit(Math.cos(t) * 3 + 4, Math.sin(t) * 3 + k * 0.04, (c.seed || 1) + 3) * 0.35;
          const r = base * (1 + 0.22 * (n1 + n2));
          pts.push([c.x + Math.cos(t) * r * (c.etir || 1), c.y + Math.sin(t) * r]);
        }
        out += `<path d="${chemin(pts)}"${k % idx === 0 ? ' class="idx"' : ''}/>`;
      }
    });
    return out + '</g>';
  };

  /* ---------- Transition de page : bande de crayon ----------
     Animations CSS de transform seulement : elles tournent sur le compositeur du navigateur
     et restent fluides même pendant que la nouvelle page charge ses scripts et son WebGL. */
  const rideau = d.querySelector('.rideau');
  const bande = rideau && rideau.querySelector('.rideau__bande');
  const arrivee = html.classList.contains('arrivee');
  MZ.arrivee = arrivee;
  if (bande) {
    bande.addEventListener('animationend', (e) => {
      if (e.animationName === 'rideau-sortie') html.classList.remove('arrivee');
    });
    // sécurité : jamais de rideau bloqué
    if (arrivee) setTimeout(() => html.classList.remove('arrivee'), 1400);
  }
  // Les animations d'ouverture de la page démarrent quand la bande commence à se retirer
  if (arrivee && hasGsap) {
    gsap.globalTimeline.pause();
    setTimeout(() => gsap.globalTimeline.resume(), 260);
  }
  let enDepart = false;
  MZ.partir = function (href) {
    if (enDepart) return;
    if (calme || !bande) { location.href = href; return; }
    enDepart = true;
    try { sessionStorage.setItem('mz-rideau', '1'); } catch (e) { /* stockage indisponible */ }
    const aller = () => { location.href = href; };
    bande.addEventListener('animationend', (e) => { if (e.animationName === 'rideau-entree') aller(); }, { once: true });
    html.classList.remove('arrivee');
    html.classList.add('depart');
    setTimeout(aller, 850); // sécurité si l'animation n'a pas lieu
  };
  d.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.suivant !== undefined) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(tel|mailto|sms):/.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (memePage(url)) { if (!url.hash && url.search === location.search) { e.preventDefault(); fermerMenu(); MZ.scrollTo(d.body); } return; } // même page : ancres et filtres gérés ailleurs
    e.preventDefault();
    fermerMenu();
    MZ.partir(a.href);
  });
  // Retour arrière depuis le cache du navigateur : retirer la bande
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    enDepart = false;
    html.classList.remove('depart', 'arrivee');
    try { sessionStorage.removeItem('mz-rideau'); } catch (err) { /* rien */ }
  });

  /* ---------- Toile « convergence » (appel final) ---------- */
  d.querySelectorAll('[data-convergence]').forEach((c) => {
    const ctx = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let w = 0; let h = 0; let vis = false; let t0 = performance.now();
    function taille() { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function dessiner(now) {
      ctx.clearRect(0, 0, w, h);
      const cxp = w * (w > 860 ? 0.78 : 0.7); const cyp = h * 0.42;
      const pas = 34; const t = calme ? 0 : ((now - t0) / 1000) * 9;
      const max = Math.hypot(w, h);
      for (let k = 0; k < max / pas + 2; k++) {
        const r = ((k * pas - (t % pas)) + pas);
        if (r <= 2) continue;
        const ix = (Math.floor((k * pas - t) / pas) + 1000) % 5 === 0;
        ctx.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const rr = r * (1 + 0.07 * bruit(Math.cos(a) * 1.6, Math.sin(a) * 1.6 + r * 0.004, 7));
          const x = cxp + Math.cos(a) * rr * 1.12; const y = cyp + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ix ? 'rgba(240,140,54,0.42)' : 'rgba(233,226,212,0.14)';
        ctx.lineWidth = ix ? 1.3 : 1;
        ctx.stroke();
      }
      ctx.fillStyle = '#f08c36';
      ctx.beginPath(); ctx.arc(cxp, cyp, 5, 0, Math.PI * 2); ctx.fill();
      if (vis && !calme) requestAnimationFrame(dessiner);
    }
    taille();
    window.addEventListener('resize', () => { taille(); if (!vis || calme) dessiner(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { const avant = vis; vis = en.isIntersecting; if (vis && !avant) requestAnimationFrame(dessiner); }, { rootMargin: '100px' }).observe(c);
    }
    dessiner(performance.now());
  });

  /* ---------- Rafraîchir ScrollTrigger après chargement des polices et images ---------- */
  if (hasGsap) {
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
