/* La MenuiZim — fiche d'une réalisation : cotes, loupe, bande de photos, visionneuse, suivant */
(function () {
  'use strict';
  const d = document;
  const MZ = window.MZ;
  const calme = MZ.calme;

  /* Ouverture */
  const titre = d.querySelector('.fiche-titre');
  const frame = d.querySelector('.fiche-media .cote-frame');
  const cotes = frame ? MZ.cotes(frame) : null;
  if (!calme) {
    const tl = gsap.timeline({ delay: 0.15 });
    if (titre && window.SplitText) {
      const sp = new SplitText(titre, { type: 'lines,words', linesClass: 'ligne', aria: 'none' });
      sp.lines.forEach((l) => { l.style.overflow = 'clip'; });
      tl.from(sp.words, { yPercent: 110, stagger: 0.03, duration: 1.2 }, 0);
    }
    tl.from('.fil', { opacity: 0, y: 10, duration: 0.8 }, 0);
    if (frame) {
      const c = frame.querySelector('.cadre');
      tl.fromTo(c, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.2)
        .fromTo(c.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 2 }, 0.3)
        .add(() => cotes && cotes.montrer(1.2), 1.3);
    }
    tl.from('.fiche-tech > *', { y: 24, opacity: 0, stagger: 0.07, duration: 1 }, 0.6);
  } else if (cotes) cotes.montrer();

  /* Loupe sur la photo principale */
  const media = d.querySelector('[data-loupe-photo]');
  if (media && MZ.fin) {
    const loupe = media.querySelector('.loupe-photo');
    const cadre = media.querySelector('.cadre');
    loupe.style.backgroundImage = `url("${media.getAttribute('data-hd')}")`;
    const z = 2.4;
    cadre.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const im = cadre.querySelector('img').getBoundingClientRect();
      const mb = media.getBoundingClientRect();
      const x = e.clientX - im.left; const y = e.clientY - im.top;
      loupe.style.left = `${e.clientX - mb.left}px`;
      loupe.style.top = `${e.clientY - mb.top}px`;
      loupe.style.backgroundSize = `${im.width * z}px ${im.height * z}px`;
      loupe.style.backgroundPosition = `${-(x * z - 110)}px ${-(y * z - 110)}px`;
      media.classList.add('is-loupe');
    });
    cadre.addEventListener('pointerleave', () => media.classList.remove('is-loupe'));
  } else if (media) {
    const aide = media.querySelector('.fiche-aide');
    if (aide) aide.textContent = 'Touchez une photo pour l’agrandir';
  }
  if (media) {
    const cadre = media.querySelector('.cadre');
    cadre.setAttribute('role', 'button');
    cadre.setAttribute('tabindex', '0');
    cadre.setAttribute('aria-label', 'Agrandir la photo principale');
    cadre.style.cursor = 'zoom-in';
    cadre.addEventListener('click', () => ouvrir(0));
    cadre.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(0); } });
  }

  /* Bande de photos : glisse à l'horizontale au défilement */
  const bande = d.querySelector('[data-bande]');
  if (bande) {
    const piste = bande.querySelector('.bande__piste');
    if (!calme && innerWidth > 860) {
      gsap.to(piste, {
        x: () => Math.min(0, -(piste.scrollWidth - innerWidth)), ease: 'none',
        scrollTrigger: { trigger: bande, start: 'top 85%', end: 'bottom 15%', scrub: 0.8, invalidateOnRefresh: true }
      });
    } else {
      bande.style.overflowX = 'auto';
      bande.setAttribute('data-lenis-prevent', '');
    }
    piste.querySelectorAll('[data-voir]').forEach((b, k) => b.addEventListener('click', () => ouvrir(k + 1)));
  }

  /* Visionneuse */
  const vis = d.querySelector('[data-visionneuse]');
  if (vis) d.body.appendChild(vis); // hors de <main>, qui devient inerte pendant l'affichage
  let retour = null;
  /* Liste des photos du projet : principale puis bande */
  const photos = [];
  if (media) photos.push({ src: media.getAttribute('data-hd'), alt: media.getAttribute('data-alt') || '' });
  d.querySelectorAll('[data-voir]').forEach((b) => photos.push({ src: b.getAttribute('data-voir'), alt: b.querySelector('img').alt }));
  let courant = 0;
  function afficher(k, sens = 0) {
    if (!vis || !photos.length) return;
    courant = (k + photos.length) % photos.length;
    const im = vis.querySelector('img');
    im.src = photos[courant].src; im.alt = photos[courant].alt;
    const c = vis.querySelector('[data-compte-photo]');
    if (c) c.textContent = `${courant + 1} / ${photos.length}`;
    vis.querySelectorAll('.visionneuse__nav').forEach((n) => { n.hidden = photos.length < 2; });
    if (!calme && sens) gsap.fromTo(im, { x: 40 * sens, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 });
  }
  function ouvrir(k) {
    if (!vis) return;
    retour = d.activeElement;
    afficher(k);
    const im = vis.querySelector('img');
    vis.hidden = false;
    MZ.inerte(true, true);
    if (MZ.lenis) MZ.lenis.stop();
    vis.querySelector('[data-fermer]').focus();
    if (!calme) gsap.fromTo(im, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 });
  }
  function fermer() {
    if (!vis || vis.hidden) return;
    vis.hidden = true;
    MZ.inerte(false, true);
    if (MZ.lenis) MZ.lenis.start();
    if (retour) retour.focus();
  }
  if (vis) {
    vis.addEventListener('click', (e) => {
      if (e.target === vis || e.target.closest('[data-fermer]')) fermer();
      else if (e.target.closest('[data-prec-photo]')) afficher(courant - 1, -1);
      else if (e.target.closest('[data-suiv-photo]')) afficher(courant + 1, 1);
    });
    d.addEventListener('keydown', (e) => {
      if (vis.hidden) return;
      if (e.key === 'Escape') fermer();
      else if (e.key === 'ArrowLeft') afficher(courant - 1, -1);
      else if (e.key === 'ArrowRight') afficher(courant + 1, 1);
    });
    // balayage au doigt
    let x0 = null;
    vis.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    vis.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) afficher(courant + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* Réalisation suivante : la photo ondule le long du fil du bois */
  const suivant = d.querySelector('[data-suivant]');
  if (suivant) {
    const vague = suivant.querySelector('.suivant__vague');
    window.addEventListener('pageshow', (e) => { if (e.persisted) suivant.classList.remove('is-part'); });
    suivant.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const href = suivant.href;
      if (calme) { location.href = href; return; }
      suivant.classList.add('is-part');
      setTimeout(() => MZ.partir(href), 280);
    });
    if (!calme) {
      gsap.from(suivant.querySelector('.suivant__in strong'), { yPercent: 40, opacity: 0, duration: 1.2, scrollTrigger: { trigger: suivant, start: 'top 80%', once: true } });
    }
  }
})();
