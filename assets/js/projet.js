/* La MenuiZim — « Votre projet » : formulaire en six étapes (démonstration, rien n'est envoyé) */
(function () {
  'use strict';
  const d = document;
  const MZ = window.MZ;
  const calme = MZ.calme;
  const form = d.querySelector('[data-form-projet]');
  if (!form) return;
  const pas = Array.from(form.querySelectorAll('[data-pas]'));
  const prec = form.querySelector('[data-prec]');
  const suiv = form.querySelector('[data-suiv]');
  const label = d.querySelector('[data-etape-label]');
  const TOTAL = 6;
  let i = 0;

  /* ---------- Ascension : 6 bornes sur un sentier ---------- */
  const svg = d.querySelector('[data-ascension] svg');
  let majAsc = () => {};
  if (svg) {
    const pts = Array.from({ length: TOTAL }, (_, k) => [40 + k * 124, 74 - k * 11]);
    const trace = 'M ' + pts.map((p) => p.join(' ')).join(' L ');
    svg.innerHTML = MZ.topo([{ x: 690, y: 10, niveaux: 9, pas: 30, seed: 6, etir: 3 }]) +
      `<path class="sentier-fond" d="${trace}"/><path class="sentier" d="${trace}"/>` +
      pts.map(([x, y], k) => `<g class="borne"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y}">${k + 1}</text></g>`).join('');
    const s = svg.querySelector('.sentier');
    const L = s.getTotalLength();
    s.style.strokeDasharray = L;
    const bornes = svg.querySelectorAll('.borne');
    majAsc = (k) => {
      const p = Math.min(k, TOTAL - 1) / (TOTAL - 1);
      if (calme) s.style.strokeDashoffset = L * (1 - p);
      else gsap.to(s, { strokeDashoffset: L * (1 - p), duration: 1, ease: 'expo.inOut' });
      bornes.forEach((b, n) => b.classList.toggle('is-atteinte', n <= k));
    };
  }

  /* ---------- Exemple de réalisation selon la pièce cochée ---------- */
  const exemple = form.querySelector('[data-exemple]');
  function majExemple() {
    const coche = Array.from(form.querySelectorAll('input[name="piece"]:checked')).map((c) => c.value);
    const dern = coche[coche.length - 1];
    const p = dern && MZ.projets.find((x) => x.piece === dern);
    if (!p) { exemple.hidden = true; return; }
    exemple.innerHTML = `${MZ.img(`r/${p.slug}-1`, { sizes: '120px', alt: p.titre, pref: 480 })}<div><span class="label" style="color:var(--graphite-3)">Par exemple</span><br><a href="realisations/${p.slug}.html">${MZ.esc(p.titre)}</a><br><span class="mono" style="color:var(--graphite-2)">${MZ.esc(p.mats.map((m) => MZ.mat(m).nom).join(', '))}</span></div>`;
    exemple.hidden = false;
    if (!calme) gsap.fromTo(exemple, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
  }
  form.querySelectorAll('input[name="piece"]').forEach((c) => c.addEventListener('change', majExemple));

  /* ---------- Aperçu des photos choisies (restent dans le navigateur) ---------- */
  const fichiers = form.querySelector('#photos');
  const apercus = form.querySelector('[data-apercus]');
  if (fichiers) {
    let urls = [];
    fichiers.addEventListener('change', () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls = [];
      apercus.innerHTML = '';
      Array.from(fichiers.files).slice(0, 8).forEach((f) => {
        if (!f.type.startsWith('image/')) return;
        const im = d.createElement('img');
        im.alt = f.name;
        im.src = URL.createObjectURL(f);
        urls.push(im.src);
        apercus.appendChild(im);
      });
    });
  }

  /* ---------- Validation par étape ---------- */
  function valider(k) {
    const f = pas[k];
    const err = f.querySelector('[data-erreur]');
    let msg = '';
    if (k === 0 && !form.querySelector('input[name="profil"]:checked')) msg = 'Choisissez une option pour continuer.';
    if (k === 1 && !form.querySelector('input[name="piece"]:checked')) msg = 'Cochez au moins une pièce ou un type d’aménagement.';
    if (k === 2 && !form.querySelector('input[name="materiau"]:checked')) msg = 'Choisissez un matériau, ou « Je ne sais pas encore ».';
    if (k === 3) { const t = form.querySelector('#idee'); if (t.value.trim().length < 10) msg = 'Décrivez votre idée en quelques mots (10 caractères au moins).'; }
    if (k === 5) {
      const nom = form.querySelector('#nom'); const mail = form.querySelector('#email'); const com = form.querySelector('#commune');
      if (!nom.value.trim()) msg = 'Indiquez votre nom.';
      else if (!com.value.trim()) msg = 'Indiquez la commune du projet.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim())) msg = 'Indiquez une adresse email valide, par exemple nom@domaine.fr.';
      else if (!form.querySelector('#consent').checked) msg = 'Cochez la case d’accord pour être recontacté.';
    }
    if (err) err.textContent = msg;
    // champs concernés signalés aux lecteurs d'écran
    f.querySelectorAll('input, textarea').forEach((c) => c.removeAttribute('aria-invalid'));
    if (msg) {
      const champ = k === 3 ? f.querySelector('#idee')
        : k === 5 ? ['#nom', '#commune', '#email', '#consent'].map((q) => f.querySelector(q)).find((c) => (c.type === 'checkbox' ? !c.checked : (c.type === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim()) : !c.value.trim())))
        : f.querySelector('input');
      if (champ) { champ.setAttribute('aria-invalid', 'true'); if (err) champ.setAttribute('aria-describedby', err.id || (err.id = `erreur-${k}`)); champ.focus({ preventScroll: false }); }
    }
    return !msg;
  }

  /* ---------- Récapitulatif ---------- */
  function recap() {
    const fd = new FormData(form);
    const val = (k) => fd.getAll(k).filter(Boolean);
    const pieces = val('piece').map((p) => MZ.piece(p));
    const dims = ['largeur', 'hauteur', 'profondeur'].map((k) => fd.get(k)).filter(Boolean);
    const nbPhotos = fichiers && fichiers.files ? fichiers.files.length : 0;
    const lignes = [
      ['Profil', val('profil').join('')],
      ['Pièces', pieces.join(', ')],
      ['Matériaux', val('materiau').join(', ')],
      ['Dimensions', dims.length ? `${['L', 'H', 'P'].slice(0, 3).map((l, n) => fd.get(['largeur', 'hauteur', 'profondeur'][n]) ? `${l} ${fd.get(['largeur', 'hauteur', 'profondeur'][n])} cm` : '').filter(Boolean).join(' · ')}` : 'Non précisées'],
      ['Photos', nbPhotos ? `${nbPhotos} photo${nbPhotos > 1 ? 's' : ''}` : 'Aucune'],
      ['Idée', fd.get('idee')],
      ['Délai', fd.get('delai')],
      ['Budget indicatif', fd.get('budget')],
      ['Contact', `${fd.get('nom')} · ${fd.get('commune')} · ${fd.get('email')}${fd.get('tel') ? ' · ' + fd.get('tel') : ''}`],
      ['Préférence', fd.get('pref') === 'Email' ? 'Réponse par email' : 'Être rappelé']
    ];
    form.querySelector('[data-recap]').innerHTML = lignes.map(([k, v]) => `<div><dt>${k}</dt><dd>${MZ.esc(v || '—')}</dd></div>`).join('');
  }

  /* ---------- Navigation ---------- */
  function aller(k, focus = true) {
    const ancien = pas[i];
    i = Math.max(0, Math.min(pas.length - 1, k));
    pas.forEach((p, n) => { p.hidden = n !== i; });
    const fin = i === pas.length - 1;
    prec.disabled = i === 0;
    prec.textContent = fin ? '← Modifier' : '← Précédent';
    suiv.innerHTML = fin ? 'Recommencer <span class="fl" aria-hidden="true">↺</span>' : i === TOTAL - 1 ? 'Valider <span class="fl" aria-hidden="true">→</span>' : 'Suivant <span class="fl" aria-hidden="true">→</span>';
    label.textContent = fin ? 'Récapitulatif' : `Étape ${i + 1} sur ${TOTAL}`;
    majAsc(fin ? TOTAL - 1 : i);
    if (!calme && ancien !== pas[i]) {
      gsap.fromTo(pas[i], { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 });
    }
    if (focus) {
      const cible = pas[i].querySelector('input, textarea, select, h2');
      if (cible) { if (cible.tagName === 'H2') cible.setAttribute('tabindex', '-1'); cible.focus({ preventScroll: true }); }
      const haut = d.querySelector('[data-ascension]');
      if (haut && haut.getBoundingClientRect().top < 0) MZ.scrollTo(haut);
    }
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (i === pas.length - 1) { form.reset(); if (apercus) apercus.innerHTML = ''; exemple.hidden = true; aller(0); return; }
    if (!valider(i)) return;
    if (i === TOTAL - 1) recap();
    aller(i + 1);
  });
  prec.addEventListener('click', () => aller(i === pas.length - 1 ? TOTAL - 1 : i - 1));

  /* Pièce présélectionnée depuis une fiche (#piece-cuisine) */
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('piece-')) {
    const c = form.querySelector(`#${CSS.escape(h)}`);
    if (c) { c.checked = true; majExemple(); }
  }
  aller(0, false);

  /* ---------- Mini-carte ---------- */
  const mini = d.querySelector('[data-mini-carte] svg');
  if (mini) {
    mini.innerHTML = MZ.topo([{ x: 40, y: 80, niveaux: 9, pas: 16, seed: 4, etir: 0.8 }, { x: 30, y: 230, niveaux: 6, pas: 18, seed: 8 }]) +
      '<path class="route" d="M 110 150 C 170 165, 210 120, 260 132 S 320 128, 330 122"/>' +
      '<g class="ville atelier"><circle cx="110" cy="150" r="6"/><text x="110" y="176" text-anchor="middle">Marlenheim</text></g>' +
      '<g class="ville"><circle cx="330" cy="122" r="6"/><text x="330" y="104" text-anchor="middle">Strasbourg</text></g>' +
      '<text class="etiq" x="220" y="110" text-anchor="middle" style="fill:var(--chene-fonce)">≈ 20 min</text>';
  }

  /* Ouverture */
  if (!calme) {
    const titre = d.querySelector('.hero__titre');
    if (titre && window.SplitText) {
      const chars = [];
      titre.querySelectorAll('.l').forEach((l) => chars.push(...new SplitText(l, { type: 'words,chars', wordsClass: 'mot' }).chars));
      gsap.from(chars, { yPercent: 115, rotate: 5, stagger: 0.025, duration: 1.3, delay: 0.2 });
    }
    gsap.from('[data-hero-el]', { y: 26, opacity: 0, stagger: 0.1, duration: 1.1, delay: 0.6 });
  }
})();
