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
      const sp = new SplitText(titre, { type: 'lines,words', linesClass: 'ligne' });
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
    media.querySelector('.cadre').addEventListener('click', () => ouvrir(media.getAttribute('data-hd')));
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
    piste.querySelectorAll('[data-voir]').forEach((b) => b.addEventListener('click', () => ouvrir(b.getAttribute('data-voir'), b.querySelector('img').alt)));
  }

  /* Visionneuse */
  const vis = d.querySelector('[data-visionneuse]');
  let retour = null;
  function ouvrir(src, alt = '') {
    if (!vis) return;
    retour = d.activeElement;
    const im = vis.querySelector('img');
    im.src = src; im.alt = alt;
    vis.hidden = false;
    if (MZ.lenis) MZ.lenis.stop();
    vis.querySelector('[data-fermer]').focus();
    if (!calme) gsap.fromTo(im, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 });
  }
  function fermer() {
    if (!vis || vis.hidden) return;
    vis.hidden = true;
    if (MZ.lenis) MZ.lenis.start();
    if (retour) retour.focus();
  }
  if (vis) {
    vis.addEventListener('click', (e) => { if (e.target === vis || e.target.closest('[data-fermer]')) fermer(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
  }

  /* Réalisation suivante : la photo ondule le long du fil du bois */
  const suivant = d.querySelector('[data-suivant]');
  if (suivant) {
    const vague = suivant.querySelector('.suivant__vague');
    suivant.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const href = suivant.href;
      if (calme) { location.href = href; return; }
      const o = { p: 0 };
      const poly = () => {
        const pts = [];
        const N = 24;
        for (let i = 0; i <= N; i++) {
          const y = (i / N) * 100;
          const x = o.p * 130 - 15 + Math.sin(i * 0.9 + o.p * 9) * 6 * (1 - o.p);
          pts.push(`${Math.max(0, Math.min(100, x)).toFixed(2)}% ${y.toFixed(2)}%`);
        }
        vague.style.clipPath = `polygon(0% 0%, ${pts.join(', ')}, 0% 100%)`;
      };
      gsap.to(o, { p: 1, duration: 1.1, ease: 'expo.inOut', onUpdate: poly, onComplete: () => MZ.partir(href) });
    });
    if (!calme) {
      gsap.from(suivant.querySelector('.suivant__in strong'), { yPercent: 40, opacity: 0, duration: 1.2, scrollTrigger: { trigger: suivant, start: 'top 80%', once: true } });
    }
  }
})();
