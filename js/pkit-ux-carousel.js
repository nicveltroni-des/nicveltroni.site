// ── P.KIT UX screen marquee (auto-scroll + dedicated lightbox) ──
(function () {
  'use strict';

  var track    = document.querySelector('.pkit-ux-marquee-track');
  var lightbox = document.getElementById('pkit-ux-lightbox');
  var lbImg    = document.getElementById('pkit-ux-lightbox-img');
  var lbClose  = document.getElementById('pkit-ux-lightbox-close');
  var lbPrev   = document.getElementById('pkit-ux-lightbox-prev');
  var lbNext   = document.getElementById('pkit-ux-lightbox-next');

  if (!track || !lightbox) return;

  var allEls = Array.from(track.querySelectorAll('img'));
  var half = Math.floor(allEls.length / 2);
  var items = allEls.slice(0, half).map(function (el) { return el.src; });
  var idx = 0;

  function showItem(i) {
    idx = (i + items.length) % items.length;
    lbImg.style.opacity = '0';
    setTimeout(function () {
      lbImg.src = items[idx];
      lbImg.style.opacity = '1';
    }, 120);
  }

  function openLb(src) {
    var found = items.findIndex(function (s) { return s === src; });
    idx = found >= 0 ? found : 0;
    lbImg.src = items[idx];
    lbImg.style.opacity = '1';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLb() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    setTimeout(function () { lbImg.src = ''; }, 300);
  }

  lbImg.style.transition = 'opacity 0.12s ease';

  track.addEventListener('click', function (e) {
    var img = e.target.closest('img');
    if (img) openLb(img.src);
  });

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', function () { showItem(idx - 1); });
  lbNext.addEventListener('click', function () { showItem(idx + 1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  showItem(idx - 1);
    if (e.key === 'ArrowRight') showItem(idx + 1);
  });
})();
