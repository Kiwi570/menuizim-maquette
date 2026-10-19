/* Exécuté avant l'affichage : mode calme (préférence mémorisée ou « réduire les animations »). */
(function () {
  var h = document.documentElement;
  try {
    var c = localStorage.getItem('mz-calme');
    if (c === '1' || (c === null && matchMedia('(prefers-reduced-motion: reduce)').matches)) h.classList.add('calme');
  } catch (e) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) h.classList.add('calme');
  }
  h.classList.add('js');
  try {
    if (sessionStorage.getItem('mz-rideau') === '1') {
      sessionStorage.removeItem('mz-rideau');
      if (!h.classList.contains('calme')) h.classList.add('arrivee');
    }
  } catch (e) { /* stockage indisponible */ }
})();
