/* La MenuiZim — page Réalisations : filtres par pièce et par matériau */
(function () {
  'use strict';
  const d = document;
  const MZ = window.MZ;
  const calme = MZ.calme;
  /* Ouverture (aussi utilisée par la page 404) */
  if (!calme) {
    const titre = d.querySelector('.hero__titre');
    if (titre && window.SplitText) {
      const chars = [];
      titre.querySelectorAll('.l').forEach((l) => chars.push(...new SplitText(l, { type: 'words,chars', wordsClass: 'mot', aria: 'none' }).chars));
      gsap.from(chars, { yPercent: 115, rotate: 5, stagger: 0.03, duration: 1.3, delay: 0.2 });
    }
    gsap.from('[data-hero-el]', { y: 26, opacity: 0, stagger: 0.1, duration: 1.1, delay: 0.6 });
  }
  const galerie = d.querySelector('[data-galerie]');
  if (!galerie) return;
  const cartes = Array.from(galerie.querySelectorAll('.carte'));
  const puces = Array.from(d.querySelectorAll('[data-filtres] .puce'));
  const select = d.querySelector('[data-mat]');
  const compte = d.querySelector('[data-compte]');
  const vide = d.querySelector('[data-vide]');
  const etat = { piece: '', mat: '' };

  function appliquer(anim = true) {
    const flip = !calme && anim && window.Flip ? Flip.getState(cartes) : null;
    let n = 0;
    cartes.forEach((c) => {
      const ok = (!etat.piece || c.dataset.piece === etat.piece) && (!etat.mat || c.dataset.mats.split(' ').includes(etat.mat));
      c.hidden = !ok;
      if (ok) n++;
    });
    puces.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.piece === etat.piece && !(p.dataset.piece === '' && etat.mat))));
    if (select) select.value = etat.mat;
    compte.textContent = `${n} projet${n > 1 ? 's' : ''}`;
    vide.hidden = n !== 0;
    if (flip) {
      Flip.from(flip, {
        duration: 0.9, ease: 'expo.inOut', absolute: true, stagger: 0.02, nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.5 }),
        onComplete: () => ScrollTrigger.refresh()
      });
    } else if (window.ScrollTrigger) ScrollTrigger.refresh();
    // ancre partageable : #p-cuisine ou #m-latte-chene
    const h = etat.piece ? `#p-${etat.piece}` : etat.mat ? `#m-${etat.mat}` : '';
    try { history.replaceState(null, '', h || location.pathname); } catch (e) { /* cadre restreint */ }
  }

  /* Puces : fondu au bord quand la rangée défile */
  const groupe = d.querySelector('.filtres__groupe');
  const bord = () => {
    if (!groupe) return;
    const deb = groupe.scrollWidth > groupe.clientWidth + 2;
    groupe.classList.toggle('is-deborde', deb);
    groupe.classList.toggle('is-fin', deb && groupe.scrollLeft + groupe.clientWidth >= groupe.scrollWidth - 2);
  };
  if (groupe) { bord(); window.addEventListener('resize', bord); groupe.addEventListener('scroll', bord, { passive: true }); }

  /* Après un filtre choisi en bas de page, remonter au début de la galerie */
  function remonter() {
    const haut = galerie.getBoundingClientRect().top;
    const barre = d.querySelector('[data-filtres]');
    if (haut < 0) setTimeout(() => MZ.scrollTo(galerie), calme ? 0 : 350);
    else if (barre && haut > innerHeight) MZ.scrollTo(galerie);
  }
  puces.forEach((p) => p.addEventListener('click', () => { etat.piece = p.dataset.piece; etat.mat = ''; appliquer(); remonter(); }));
  if (select) select.addEventListener('change', () => { etat.mat = select.value; etat.piece = ''; appliquer(); remonter(); });
  const reinit = d.querySelector('[data-reinit]');
  if (reinit) reinit.addEventListener('click', () => { etat.piece = ''; etat.mat = ''; appliquer(); });

  // Filtre depuis l'ancre (#p-cuisine, #m-osb), au chargement et quand elle change
  function depuisAncre(anim) {
    let h = ''; try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { /* ancre invalide */ }
    etat.piece = h.startsWith('p-') ? h.slice(2) : '';
    etat.mat = h.startsWith('m-') ? h.slice(2) : '';
    appliquer(anim);
  }
  if (location.hash.length > 1) depuisAncre(false);
  window.addEventListener('hashchange', () => depuisAncre(true));

  /* Entrée des cartes */
  if (!calme) {
    cartes.forEach((c) => {
      if (c.hidden) return;
      const img = c.querySelector('.carte__img');
      gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 92%', once: true } })
        .fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
        .fromTo(img.querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 1.8 }, 0)
        .from(c.querySelectorAll('.carte__titre, .carte__meta'), { y: 16, opacity: 0, stagger: 0.06, duration: 0.9 }, 0.4);
    });
  }
})();
