// Restart slideshow animations when section enters viewport
(function () {
  'use strict';

  var screens = ['iact-screen-5', 'iact-screen-6', 'iact-screen-7'];

  function restartAnims(screen) {
    var imgs = screen.querySelectorAll('.iact-s5-img, .iact-s6-img, .iact-s7-img');
    imgs.forEach(function (img) {
      img.style.animation = 'none';
      void img.offsetWidth; // force reflow to reset animation
      img.style.animation = '';
    });
  }

  if (!window.IntersectionObserver) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        restartAnims(entry.target);
      }
    });
  }, { threshold: 0.4 });

  screens.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

