/* La MenuiZim — accueil */
(function () {
  'use strict';
  const d = document;
  const MZ = window.MZ;
  const calme = MZ.calme;
  const desktop = () => innerWidth > 900;

  /* ---------- Ouverture ---------- */
  const titre = d.querySelector('.hero__titre');
  const photo = d.querySelector('[data-hero-photo]');
  const cotesHero = photo ? MZ.cotes(photo) : null;
  if (!calme) {
    const lignes = titre ? titre.querySelectorAll('.l') : [];
    let mots = [];
    if (window.SplitText && titre) {
      lignes.forEach((l) => { mots = mots.concat(new SplitText(l, { type: 'words,chars', charsClass: 'ch', wordsClass: 'mot', aria: 'none' }).chars); });
    }
    const tl = gsap.timeline({ delay: 0.25 });
    if (mots.length) tl.from(mots, { yPercent: 115, rotate: 6, duration: 1.3, stagger: 0.028, ease: 'expo.out' }, 0);
    tl.from('[data-hero-el]', { y: 26, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.75);
    if (photo) {
      tl.fromTo(photo.querySelector('.cadre'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.35);
      tl.fromTo(photo.querySelector('img'), { scale: 1.35 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.5);
      tl.add(() => cotesHero && cotesHero.montrer(1.3), 1.5);
      // parallaxe douce de la photo
      gsap.to(photo, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    gsap.to('.hero__in > div:first-child', { yPercent: 14, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  } else if (cotesHero) { cotesHero.montrer(); }

  /* ---------- Un seul interlocuteur : les mots s'encrent au défilement ---------- */
  const phrase = d.querySelector('[data-surligne]');
  if (phrase && !calme && window.SplitText) {
    const sp = new SplitText(phrase, { type: 'words', wordsClass: 'word', aria: 'none' });
    gsap.fromTo(sp.words, { opacity: 0.16 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: phrase, start: 'top 78%', end: 'bottom 38%', scrub: true }
    });
  }
  if (!calme) {
    d.querySelectorAll('.approche__images .img-mask img').forEach((im, i) => {
      gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Trois actes : défilement horizontal épinglé ---------- */
  const cadre = d.querySelector('[data-actes]');
  const piste = cadre && cadre.querySelector('.actes__piste');
  const plan = d.querySelector('[data-plan]');
  function tracer(svg) {
    const els = svg.querySelectorAll('rect, line, path');
    els.forEach((e) => {
      const L = e.getTotalLength ? e.getTotalLength() : 200;
      e.style.strokeDasharray = `${L}`;
      e.style.strokeDashoffset = `${L}`;
    });
    return gsap.to(els, { strokeDashoffset: 0, duration: 1.4, stagger: 0.05, ease: 'power2.inOut' });
  }
  if (piste && !calme) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const sec = piste.closest('.actes'); if (sec) sec.classList.add('is-h');
      const dist = () => piste.scrollWidth - innerWidth;
      const tween = gsap.to(piste, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: cadre, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      // Effets de chaque acte, synchronisés sur le défilement horizontal
      piste.querySelectorAll('.acte').forEach((acte, i) => {
        const masques = acte.querySelectorAll('[data-trace]');
        const st = { trigger: acte, containerAnimation: tween, start: i === 0 ? 'left 85%' : 'left 70%', toggleActions: 'play none none none' };
        const tl = gsap.timeline({ scrollTrigger: st });
        masques.forEach((m, k) => {
          tl.fromTo(m, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, k * 0.18);
          const im = m.querySelector('img');
          if (im) tl.fromTo(im, { scale: 1.3, xPercent: -8 }, { scale: 1, xPercent: 0, duration: 2, ease: 'expo.out' }, k * 0.18 + 0.1);
          const r = m.querySelector('.cadre-trace rect');
          if (r) tl.fromTo(r, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.5);
        });
        tl.from(acte.querySelectorAll('.acte__txt > *'), { y: 40, opacity: 0, stagger: 0.08, duration: 1.1 }, 0.1);
        gsap.fromTo(acte.querySelector('.acte__num'), { xPercent: 30 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: acte, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        if (i === 0 && plan) {
          const tr = tracer(plan); tr.pause();
          ScrollTrigger.create({ trigger: acte, containerAnimation: tween, start: 'left 85%', onEnter: () => tr.play() });
        }
      });
      return () => { gsap.set(piste, { x: 0 }); if (sec) sec.classList.remove('is-h'); };
    });
    mm.add('(max-width: 900px)', () => {
      piste.querySelectorAll('[data-trace]').forEach((m) => {
        gsap.fromTo(m, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 85%', once: true } });
      });
      if (plan) { const tr = tracer(plan); tr.pause(); ScrollTrigger.create({ trigger: plan, start: 'top 80%', once: true, onEnter: () => tr.play() }); }
    });
  }

  /* ---------- À la une : entrée des cartes ---------- */
  if (!calme) {
    d.querySelectorAll('.une .carte').forEach((c) => {
      const img = c.querySelector('.carte__img');
      const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
      tl.fromTo(img, { clipPath: 'inset(12% 12% 12% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
        .fromTo(img.querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0)
        .from(c.querySelectorAll('.carte__titre, .carte__meta'), { y: 20, opacity: 0, stagger: 0.08, duration: 1 }, 0.5);
      gsap.to(c, { yPercent: -6 * ((c.matches(':nth-child(even)') ? 1.4 : 0.6)), ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Matériauthèque ---------- */
  const mats = d.querySelectorAll('[data-mat]');
  function retourner(m, v) {
    const btn = m.querySelector('.mat__btn');
    const dos = m.querySelector('.mat__dos');
    m.classList.toggle('is-retourne', v);
    btn.setAttribute('aria-expanded', String(v));
    dos.setAttribute('aria-hidden', String(!v));
    dos.querySelectorAll('a, button').forEach((x) => { x.tabIndex = v ? 0 : -1; });
    if (v && d.activeElement === btn) { const l = dos.querySelector('a'); if (l) l.focus({ preventScroll: true }); }
  }
  mats.forEach((m) => {
    const btn = m.querySelector('.mat__btn');
    btn.addEventListener('click', () => retourner(m, true));
    m.querySelector('.mat__fermer').addEventListener('click', () => { retourner(m, false); btn.focus({ preventScroll: true }); });
    m.addEventListener('keydown', (e) => { if (e.key === 'Escape' && m.classList.contains('is-retourne')) { retourner(m, false); btn.focus({ preventScroll: true }); } });
  });
  if (!calme && mats.length) {
    gsap.from(mats, {
      rotationY: -70, rotationZ: (i) => (i % 3 - 1) * 4, x: (i) => -(i % 3) * 60, opacity: 0, transformOrigin: '0% 50%',
      duration: 1.6, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '[data-materiautheque]', start: 'top 80%', once: true }
    });
  }

  /* ---------- Déroulé : sentier topographique ---------- */
  const svgS = d.querySelector('[data-sentier]');
  if (svgS) {
    const bornes = [[110, 510], [225, 400], [320, 300], [400, 200]];
    const trace = 'M 40 590 C 70 560, 95 530, 110 510 S 185 435, 225 400 S 290 330, 320 300 S 380 230, 400 200';
    svgS.innerHTML = MZ.topo([
      { x: 400, y: 200, niveaux: 13, pas: 16, seed: 2, etir: 1.1 },
      { x: 120, y: 470, niveaux: 6, pas: 14, seed: 5, etir: 0.9 }
    ]) + `<path class="sentier-fond" d="${trace}"/><path class="sentier" d="${trace}"/>` +
      bornes.map(([x, y], i) => `<g class="borne" data-borne="${i}"><circle cx="${x}" cy="${y}" r="15"/><text x="${x}" y="${y}">${i + 1}</text></g>`).join('') +
      '<text x="420" y="172" class="mono" style="font-family:var(--f-mono);font-size:11px;letter-spacing:.08em;fill:var(--graphite-2);text-transform:uppercase">Votre pièce, posée</text>';
    const sentier = svgS.querySelector('.sentier');
    const L = sentier.getTotalLength();
    // longueur du tracé à chaque borne
    const seuils = bornes.map(([bx, by]) => {
      let best = 0; let dmin = Infinity;
      for (let s = 0; s <= L; s += 2) { const p = sentier.getPointAtLength(s); const dd = (p.x - bx) ** 2 + (p.y - by) ** 2; if (dd < dmin) { dmin = dd; best = s; } }
      return best / L;
    });
    const gb = svgS.querySelectorAll('.borne');
    sentier.style.strokeDasharray = `${L}`;
    const maj = (p) => {
      sentier.style.strokeDashoffset = `${L * (1 - p)}`;
      gb.forEach((b, i) => b.classList.toggle('is-atteinte', p >= seuils[i] - 0.005));
    };
    if (calme) maj(1);
    else {
      maj(0);
      ScrollTrigger.create({
        trigger: '.etapes', start: 'top 70%', end: 'bottom 75%', scrub: 0.5,
        onUpdate: (self) => maj(self.progress)
      });
    }
  }

  /* ---------- Atelier : carte schématique + loupe Cassini ---------- */
  const geo = d.querySelector('[data-carte-geo]');
  if (geo) {
    const svg = geo.querySelector('svg');
    const marl = [190, 300]; const stras = [640, 255];
    const route = 'M 190 300 C 300 330, 380 250, 470 270 S 590 270, 640 255';
    svg.innerHTML = MZ.topo([
      { x: 60, y: 160, niveaux: 14, pas: 20, seed: 4, etir: 0.8 },
      { x: 40, y: 470, niveaux: 10, pas: 22, seed: 8, etir: 0.9 },
      { x: 330, y: 520, niveaux: 5, pas: 26, seed: 11, etir: 1.4 }
    ]) +
      '<path d="M 735 0 C 720 120, 760 200, 728 300 S 742 460, 720 550" style="fill:none;stroke:#5f7b74;stroke-width:3;opacity:.8"/>' +
      '<text class="etiq" x="742" y="420" transform="rotate(84 742 420)">Rhin</text>' +
      `<path class="route" d="${route}"/>` +
      `<g class="ville atelier"><circle cx="${marl[0]}" cy="${marl[1]}" r="7"/><text x="${marl[0]}" y="${marl[1] + 30}" text-anchor="middle">Marlenheim · atelier</text></g>` +
      `<g class="ville"><circle cx="${stras[0]}" cy="${stras[1]}" r="7"/><text x="${stras[0]}" y="${stras[1] - 20}" text-anchor="middle">Strasbourg</text></g>` +
      '<text class="etiq orange" x="420" y="236" text-anchor="middle">≈ 20 min</text>' +
      '<g transform="translate(70 70)"><path d="M 0 -22 L 7 6 L 0 1 L -7 6 Z" style="fill:var(--sur-nuit)"/><text class="etiq" x="0" y="26" text-anchor="middle">N</text></g>' +
      '<text class="etiq" x="190" y="210" text-anchor="middle" style="opacity:.6">Piémont des Vosges</text>';
    const r = svg.querySelector('.route');
    const Lr = r.getTotalLength();
    r.style.strokeDasharray = `${Lr}`;
    r.style.strokeDashoffset = calme ? 0 : `${Lr}`;
    if (!calme) {
      gsap.to(r, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', scrollTrigger: { trigger: geo, start: 'top 75%', once: true } });
      gsap.from(svg.querySelectorAll('.topo path'), { opacity: 0, duration: 1.4, stagger: 0.012, scrollTrigger: { trigger: geo, start: 'top 80%', once: true } });
      gsap.from(svg.querySelectorAll('.ville, .etiq'), { opacity: 0, y: 8, duration: 1, stagger: 0.12, delay: 0.6, scrollTrigger: { trigger: geo, start: 'top 75%', once: true } });
    }
    // Loupe
    const loupe = geo.querySelector('.loupe');
    const src = geo.getAttribute('data-cassini');
    if (loupe && src) {
      loupe.style.backgroundImage = `url("${(window.MZ_BASE || '') + src}")`;
      const placer = (x, y) => {
        const b = geo.getBoundingClientRect();
        const u = Math.min(1, Math.max(0, (x - b.left) / b.width)); const v = Math.min(1, Math.max(0, (y - b.top) / b.height));
        const taille = Math.max(b.width, b.height) * 1.6;
        loupe.style.left = `${u * 100}%`; loupe.style.top = `${v * 100}%`;
        loupe.style.backgroundSize = `${taille}px ${taille}px`;
        loupe.style.backgroundPosition = `${-(u * taille - 95)}px ${-(v * taille - 95)}px`;
      };
      geo.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { placer(e.clientX, e.clientY); geo.classList.add('is-loupe'); } });
      geo.addEventListener('pointerleave', () => geo.classList.remove('is-loupe'));
      geo.addEventListener('click', (e) => { placer(e.clientX, e.clientY); geo.classList.toggle('is-loupe'); });
    }
  }
  if (!calme) {
    const ph = d.querySelector('[data-parallaxe-img] img');
    if (ph) gsap.fromTo(ph, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: ph.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- Simon : frise ---------- */
  const frise = d.querySelector('[data-frise]');
  if (frise && !calme) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: frise, start: 'top 85%', once: true } });
    tl.from(frise.querySelector('.frise__ligne'), { scaleX: 0, duration: 1.6, ease: 'expo.inOut' })
      .from(frise.querySelectorAll(':scope > div'), { y: 30, opacity: 0, stagger: 0.15, duration: 1 }, 0.4);
    const cit = d.querySelector('.citation');
    if (cit && window.SplitText) {
      const sp = new SplitText(cit, { type: 'words', aria: 'none' });
      gsap.from(sp.words, { yPercent: 60, opacity: 0, stagger: 0.04, duration: 1, scrollTrigger: { trigger: cit, start: 'top 85%', once: true } });
    }
  }

  /* ---------- Collaborations : défilement continu ---------- */
  const def = d.querySelector('[data-defilant]');
  if (def && !calme) {
    const g = def.querySelector('.defilant__groupe');
    const loop = gsap.to(def, { x: () => -g.offsetWidth, duration: 26, ease: 'none', repeat: -1, paused: true });
    let survol = false;
    let retour = null;
    // accélère avec la vitesse de défilement, puis revient doucement ; en pause hors de l'écran
    ScrollTrigger.create({
      trigger: '.collab', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => loop.paused(!self.isActive),
      onUpdate: (self) => {
        if (survol) return;
        gsap.to(loop, { timeScale: 1 + Math.min(4, Math.abs(self.getVelocity()) / 300), duration: 0.4, overwrite: true });
        if (retour) retour.kill();
        retour = gsap.delayedCall(0.3, () => { if (!survol) gsap.to(loop, { timeScale: 1, duration: 1.2, overwrite: true }); });
      }
    });
    def.addEventListener('pointerenter', () => { survol = true; gsap.to(loop, { timeScale: 0, duration: 0.6, overwrite: true }); });
    def.addEventListener('focusin', () => { survol = true; gsap.to(loop, { timeScale: 0, duration: 0.3, overwrite: true }); });
    def.addEventListener('focusout', () => { survol = false; gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true }); });
    def.addEventListener('pointerleave', () => { survol = false; gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true }); });
  } else if (def) {
    def.style.flexWrap = 'wrap';
    def.querySelectorAll('.defilant__groupe[aria-hidden]').forEach((g) => { g.hidden = true; });
    def.querySelector('.defilant__groupe').style.flexWrap = 'wrap';
    def.style.width = '100%';
    def.style.paddingInline = 'max(var(--g), env(safe-area-inset-left, 0px))';
  }

  /* ---------- Appel final ---------- */
  if (!calme) {
    const fin = d.querySelector('.final h2');
    if (fin && window.SplitText) {
      const sp = new SplitText(fin, { type: 'words', aria: 'none' });
      gsap.from(sp.words, { yPercent: 80, opacity: 0, stagger: 0.07, duration: 1.3, scrollTrigger: { trigger: fin, start: 'top 85%', once: true } });
    }
    const bg = d.querySelector('.final__bg img');
    if (bg) gsap.fromTo(bg, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }
})();
