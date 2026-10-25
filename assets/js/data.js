/* La MenuiZim — contenus de la maquette.
   Toutes les descriptions de réalisations reprennent les légendes publiées par La MenuiZim
   sur Instagram (@la.menuizim) ou sur le site actuel. Ce qui manque est marqué « à compléter ». */
window.MZ = {
  contact: {
    nom: 'La MenuiZim',
    artisan: 'Simon Zettel',
    metier: 'artisan menuisier',
    adresse: '1 rue d’Oslo',
    cp: '67520',
    ville: 'Marlenheim',
    tel: '07 49 65 37 07',
    telHref: 'tel:+33749653707',
    email: 'contact@menuizim.fr',
    instagram: 'https://www.instagram.com/la.menuizim/',
    facebook: 'https://www.facebook.com/la.menuizim',
    marlebois: 'http://www.marlebois.fr'
  },

  pieces: [
    { id: 'cuisine', nom: 'Cuisine' },
    { id: 'sejour', nom: 'Séjour & entrée' },
    { id: 'bureau', nom: 'Bureau' },
    { id: 'chambre', nom: 'Chambres & dressings' },
    { id: 'salle-de-bain', nom: 'Salle de bain' },
    { id: 'mobilier', nom: 'Mobilier' },
    { id: 'exterieur', nom: 'Extérieur' },
    { id: 'pro', nom: 'Professionnel' }
  ],

  /* tex : texture d'illustration (générée) ; def : définition générale du matériau */
  materiaux: [
    { id: 'chene', nom: 'Chêne', tex: 'mat/chene-massif', def: 'Bois massif au fil marqué, ici d’origine Vosges pour plusieurs pièces.' },
    { id: 'latte-chene', nom: 'Latté chêne', tex: 'mat/latte-chene', def: 'Panneau à âme en lattes, parementé de chêne.' },
    { id: 'contreplaque-bouleau', nom: 'Contreplaqué bouleau', tex: 'mat/contreplaque-bouleau', def: 'Fines feuilles de bouleau croisées, au chant en strates.' },
    { id: 'valchromat', nom: 'Valchromat', tex: 'mat/valchromat', def: 'Panneau de fibres de bois teinté dans la masse.' },
    { id: 'epicea-3-plis', nom: '3 plis épicéa', tex: 'mat/epicea-3-plis', def: 'Panneau massif en trois couches d’épicéa.' },
    { id: 'meleze', nom: 'Mélèze', tex: 'mat/meleze', def: 'Résineux employé ici en bardage extérieur.' },
    { id: 'osb', nom: 'OSB', tex: 'mat/osb', def: 'Panneau de grandes lamelles de bois orientées et pressées.' },
    { id: 'hetre-multiplis', nom: 'Hêtre multiplis', tex: 'mat/hetre-multiplis', def: 'Placages de hêtre collés en couches.' },
    { id: 'merisier', nom: 'Merisier', tex: 'mat/merisier', def: 'Bois fruitier ; ici un plateau ancien récupéré.' },
    { id: 'laque', nom: 'Laque', def: 'Façades laquées, finition vernis.' },
    { id: 'bouleau', nom: 'Bouleau (rondins)', def: 'Troncs de bouleau employés en claustra.' },
    { id: 'bois-ossature', nom: 'Bois d’ossature', def: 'Bois de structure.' },
    { id: 'perfectsense', nom: 'PerfectSense', def: 'Panneau laqué.' }
  ],

  /* n : nombre de photos ; une : à la une sur l'accueil */
  projets: [
    { slug: 'cuisine-ilot-chene', titre: 'Cuisine, îlot et claustra en chêne', piece: 'cuisine', n: 5,
      mats: ['latte-chene', 'chene'], finition: 'Huile Rubio, mat naturel',
      collab: 'Conception Riegel Baur architectes', credit: 'Photo Adrien Michel',
      texte: 'Cuisine et îlot sur mesure avec reprise d’éléments existants. Claustra en latté chêne, table salle à manger et plans de travail en chêne massif. Finition huile Rubio mat naturel.' },
    { slug: 'bibliotheque-banc-entree', titre: 'Bibliothèque et banc d’entrée', piece: 'sejour', n: 5, une: 1,
      mats: ['latte-chene'], finition: 'Huile Rubio, mat naturel',
      collab: 'Conception Riegel Baur architectes', credit: 'Photo Adrien Michel',
      texte: 'Bibliothèque avec rangements et banc d’entrée. Claustra en latté chêne, finition huile Rubio mat naturel.' },
    { slug: 'placard-bureau-niche', titre: 'Placard arrondi, niche et bureau', piece: 'bureau', n: 4, une: 2,
      mats: ['latte-chene'], collab: 'Collaboration avec Creastra',
      texte: 'Aménagements sur mesure avec placard de rangement et bureau. Niche intégrée et intérieur en latté chêne. Collaboration avec Creastra.' },
    { slug: 'lit-cabane', titre: 'Lit cabane à tiroirs', piece: 'chambre', n: 3, une: 3,
      mats: ['epicea-3-plis'], finition: 'Huile Rubio, mat naturel',
      texte: 'Lit cabane sur mesure. 3 grands tiroirs intégrés, coffre intérieur de rangement. Ensemble réalisé en 3 plis épicéa, finition huile Rubio mat naturel.' },
    { slug: 'bureau-accueil-osb', titre: 'Bureau d’accueil en OSB', piece: 'pro', n: 3, une: 4,
      mats: ['osb'], finition: 'Huile Rubio, mat naturel', client: 'EcoGreenEnergy',
      texte: 'Bureau d’accueil pour l’entreprise EcoGreenEnergy. Réalisation en OSB, façade avant en relief avec bandeau led intégré sous le comptoir. Finition huile Rubio mat naturel.' },
    { slug: 'bureau-placard-claustra', titre: 'Bureau, placard et claustra', piece: 'bureau', n: 5, une: 5,
      mats: ['chene', 'latte-chene'], collab: 'Collaboration avec Creastra',
      texte: 'Bureau sur mesure avec placard de rangement toute hauteur. Claustra chêne origine Vosges. Façades et intérieur en latté chêne. Collaboration avec Creastra.' },
    { slug: 'table-basse-merisier', titre: 'Table basse en merisier sur fût', piece: 'mobilier', n: 4, une: 6,
      mats: ['merisier'], finition: 'Huile cire Osmo',
      texte: 'Ancien plateau en merisier, récupéré dans un bar désaffecté et transformé en table basse sur fût de bière ; finition huile cire Osmo.' },
    { slug: 'etageres-latte-chene', titre: 'Étagères en latté chêne', piece: 'sejour', n: 4,
      mats: ['latte-chene'], finition: 'Huile Rubio, mat naturel', collab: 'Collaboration avec Coralie Persuy',
      texte: 'Étagères sur mesure. Ensemble en latté chêne, finition huile Rubio mat naturel. Collaboration avec Coralie Persuy.' },
    { slug: 'ilot-cuisine-hetre', titre: 'Îlot central, hêtre et Valchromat noir', piece: 'cuisine', n: 2,
      mats: ['hetre-multiplis', 'valchromat'], finition: 'Huile Rubio, mat naturel',
      texte: 'Aménagement d’un îlot central de cuisine, plan de travail en multiligne hêtre, habillage en valchromat noir. Finition huile Rubio mat naturel.' },
    { slug: 'meuble-entree-banc', titre: 'Meuble d’entrée et banc', piece: 'sejour', n: 4,
      mats: ['valchromat', 'latte-chene'], finition: 'Huile Rubio, mat naturel',
      texte: 'Meuble d’entrée et banc sur mesure. Entièrement réalisés en valchromat noir, plateau en latté chêne, finition huile Rubio mat naturel. Pieds en épingle fabriqués par Ripaton en acier brut.' },
    { slug: 'bureau-teletravail', titre: 'Bureau de télétravail', piece: 'bureau', n: 2,
      mats: ['perfectsense'],
      texte: 'Bureau de télétravail avec rangements. Plan de travail en PerfectSense gris clair, façades vert Fjord.' },
    { slug: 'dressing-rampants', titre: 'Dressing sous rampants', piece: 'chambre', n: 5,
      mats: ['contreplaque-bouleau', 'valchromat', 'latte-chene'], finition: 'Huile Rubio, mat naturel',
      texte: 'Dressing sous rampants. Intérieur en contreplaqué bouleau, façades valchromat light grey et plateaux en latté chêne. Finition huile Rubio mat naturel.' },
    { slug: 'placard-studio', titre: 'Placard de rangement d’un studio', piece: 'chambre', n: 4,
      mats: ['latte-chene', 'contreplaque-bouleau'], finition: 'Huile Rubio white, mat naturel',
      texte: 'Placard de rangement sur mesure dans un studio. Façades en latté chêne, finition huile Rubio white mat naturel. Intérieur en contreplaqué bouleau.' },
    { slug: 'claustra-bouleau-mezzanine', titre: 'Claustra en bouleau, accès mezzanine', piece: 'chambre', n: 3,
      mats: ['bouleau'],
      texte: 'Claustra en bouleau, avec porte d’accès à un dortoir en mezzanine.' },
    { slug: 'dressing-deux-parties', titre: 'Dressing sous rampants en deux parties', piece: 'chambre', n: 1,
      mats: ['valchromat'], finition: 'Huile Rubio, mat naturel',
      texte: 'Dressing sous rampants en 2 parties. Façades valchromat light grey, finition huile Rubio mat naturel.' },
    { slug: 'dressing-mural', titre: 'Dressing intégré au mur', piece: 'chambre', n: 2,
      mats: ['laque', 'contreplaque-bouleau'], finition: 'Laque blanche, vernis mat',
      texte: 'Dressing intégré dans un mur. Finition laque blanche, vernis mat. Intérieur en contreplaqué bouleau.' },
    { slug: 'rampants-laque-taupe', titre: 'Rangements sous rampants, laque taupe', piece: 'chambre', n: 1,
      mats: ['laque'], finition: 'Laque taupe, vernis mat',
      texte: 'Aménagement sur mesure sous rampants. Finition laque taupe, vernis mat.' },
    { slug: 'meuble-salle-de-bain', titre: 'Meuble de salle de bain', piece: 'salle-de-bain', n: 4,
      mats: ['valchromat', 'laque'], finition: 'Laque blanche et vernis',
      texte: 'Meuble salle de bain sur mesure. Intérieur valchromat noir, façades laque blanche et vernis. Tiroir « bac de tri vêtements » Brabantia, sèche linge intégré dans tiroir supérieur.' },
    { slug: 'meuble-sdb-suspendu', titre: 'Meuble de salle de bain suspendu', piece: 'salle-de-bain', n: 3,
      mats: ['contreplaque-bouleau'],
      texte: 'Meuble salle de bain suspendu sur mesure en contre plaqué bouleau.' },
    { slug: 'tabourets-trois-pieds', titre: 'Tabourets à trois pieds', piece: 'mobilier', n: 4,
      mats: ['chene'], finition: 'Huile Rubio, mat naturel',
      texte: 'Création de tabourets à 3 pieds. Chêne origine Vosges, finition huile Rubio mat naturel.' },
    { slug: 'local-poubelles', titre: 'Local poubelles et boîtes aux lettres', piece: 'exterieur', n: 3,
      mats: ['meleze', 'valchromat'], finition: 'Huilée Rubio',
      texte: 'Création local poubelles sous un porche d’immeuble. 4 grands bacs de recyclage et déchets se cachent derrière les portes en valchromat gris clair. Bardage mélèze naturel, finition huilée Rubio. Intégration des boîtes aux lettres dans l’ensemble et d’un local technique.' },
    { slug: 'local-velo', titre: 'Local vélo', piece: 'exterieur', n: 3,
      mats: ['meleze', 'bois-ossature'],
      texte: 'Local vélo extérieur. Bardage mélèze naturel, ossature bois. Couverture en polycarbonate transparent.' },
    { slug: 'clapier', titre: 'Clapier sur roulettes', piece: 'exterieur', n: 4,
      mats: ['bois-ossature'],
      texte: 'Clapier pour lapin en bois d’ossature ; 4 portes coulissantes, un étage avec escalier, le tout sur roulettes.' },
    { slug: 'banc-exterieur', titre: 'Banc de rangement extérieur', piece: 'exterieur', n: 1,
      mats: [], texte: '' }
  ],

  partenaires: [
    { nom: 'Paul Navé', metier: 'Menuisier · charpentier', lien: 'https://www.creastra.fr', label: 'creastra.fr' },
    { nom: 'Hugo Montmasson', metier: 'Menuisier', lien: 'https://www.instagram.com/mhudesign/', label: '@mhudesign' },
    { nom: 'Juan Adam', metier: 'Menuisier', lien: 'https://www.instagram.com/menuiserie.pigne/', label: '@menuiserie.pigne' },
    { nom: 'Benjamin Salier', metier: 'Menuisier · charpentier' },
    { nom: 'Raphaël Stoppele', metier: 'Ébéniste', lien: 'https://www.instagram.com/sapin_noir/', label: '@sapin_noir' },
    { nom: 'Aurélien Hassler', metier: 'Menuisier', lien: 'https://www.instagram.com/aurelienhassler/', label: '@aurelienhassler' },
    { nom: 'Julien Kubler', metier: 'Ébéniste', lien: 'https://www.kubisterie.fr', label: 'kubisterie.fr' }
  ]
};

/* Outils partagés */
(function () {
  const M = window.MZ;
  M.piece = (id) => (M.pieces.find((p) => p.id === id) || {}).nom || id;
  M.mat = (id) => M.materiaux.find((m) => m.id === id) || { id, nom: id };
  M.projet = (slug) => M.projets.find((p) => p.slug === slug);
  M.parMateriau = (id) => M.projets.filter((p) => p.mats.includes(id));

  /* srcset à partir des tailles générées (window.MZ_IMG) */
  M.srcset = (key) => {
    const d = (window.MZ_IMG || {})[key];
    if (!d) return '';
    const [w0, , sizes] = d;
    return sizes.map((w) => `assets/img/${key}-${w}.webp ${Math.min(w, w0)}w`).join(', ');
  };
  M.src = (key, pref = 960) => {
    const d = (window.MZ_IMG || {})[key];
    if (!d) return '';
    const s = d[2].find((w) => w >= pref) || d[2][d[2].length - 1];
    return `assets/img/${key}-${s}.webp`;
  };
  M.ratio = (key) => {
    const d = (window.MZ_IMG || {})[key];
    return d ? d[0] / d[1] : 1;
  };
  M.img = (key, { sizes = '100vw', alt = '', cls = '', lazy = true, pref } = {}) => {
    const d = (window.MZ_IMG || {})[key] || [1, 1];
    return `<img class="${cls}" src="${M.src(key, pref)}" srcset="${M.srcset(key)}" sizes="${sizes}" width="${d[0]}" height="${d[1]}" alt="${alt.replace(/"/g, '&quot;')}"${lazy ? ' loading="lazy" decoding="async"' : ''}>`;
  };
  M.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
})();
