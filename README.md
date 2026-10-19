# La MenuiZim — maquette v2

Maquette du futur site de La MenuiZim (menuiserie et agencement sur mesure, Marlenheim).
Site statique HTML, CSS et JavaScript, sans étape de construction, prêt pour Vercel.

## Pages

- `index.html` — accueil
- `realisations.html` — galerie filtrable (pièce, matériau)
- `realisations/*.html` — une fiche par réalisation (24)
- `projet.html` — formulaire « Votre projet » en six étapes (démonstration : rien n’est envoyé)
- `404.html` — page introuvable

## Mise en ligne

- `vercel.json` : adresses propres, en-têtes de sécurité (CSP stricte), cache long des fichiers versionnés (`?v=2`).
- La maquette est volontairement exclue des moteurs de recherche (`robots.txt`, balise `noindex`, en-tête `X-Robots-Tag`).
  À retirer, avec l’adresse définitive dans `og:url`, le jour où le site remplace menuizim.fr.
- À chaque nouvelle version des CSS/JS, augmenter `VERSION` pour vider le cache des visiteurs.

## Contenus

Les textes et descriptions reprennent le site actuel et les légendes Instagram de @la.menuizim.
Les images marquées « Image d’ambiance » ou « Textures d’illustration » sont des visuels générés, jamais présentés comme des réalisations.

## À compléter par La MenuiZim

- Mentions légales : SIRET, hébergeur, assurance décennale
- Politique de confidentialité (RGPD) du formulaire
- Horaires d’accueil à l’atelier
- Portrait de Simon Zettel
- Avis clients réels (aucun n’est publié aujourd’hui)
- Dimensions, lieu et année de chaque réalisation ; description du banc de rangement extérieur
- Branchement réel du formulaire vers contact@menuizim.fr

## Bibliothèques et polices (hébergées avec le site)

- `assets/js/vendor/vendor.js` : GSAP 3 (ScrollTrigger, SplitText) et Lenis regroupés — licence standard GSAP (gratuite), Lenis MIT (`LICENSE-lenis.txt`)
- `assets/js/vendor/Flip.min.js` : GSAP Flip (page Réalisations)
- `assets/js/vendor/ogl.bundle.js` : OGL — domaine public (Unlicense)
- Fraunces et JetBrains Mono — WOFF2 allégés, SIL Open Font License (`assets/fonts`)
