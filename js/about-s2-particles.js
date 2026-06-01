// ── About Section 2 — Flow Field (white lines, black bg) ──
(function () {
  'use strict';

  var section = document.getElementById('about-section-2');
  if (!section) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'about-s2-particles-canvas';
  section.insertBefore(canvas, section.firstChild);

  var ctx = canvas.getContext('2d');
  var mouseX = -99999, mouseY = -99999;

  section.addEventListener('mousemove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
  }, { passive: true });
  section.addEventListener('mouseleave', function () {
    mouseX = -99999; mouseY = -99999;
  });

  var field = window._createFlowField({
    canvas: canvas,
    ctx: ctx,
    lineColor: 'rgba(255,255,255,',
    clearColor: 'rgba(0,0,0,',
    initFill: '#000',
    getSize: function () { return { w: section.offsetWidth, h: section.offsetHeight }; },
    getMouse: function () { return { x: mouseX, y: mouseY }; }
  });

  var observer = new MutationObserver(function () {
    if (section.style.display !== 'none' && section.style.opacity !== '0') {
      field.start();
    } else {
      field.stop();
    }
  });
  observer.observe(section, { attributes: true, attributeFilter: ['style'] });

  window.addEventListener('resize', function () {
    if (field.isRunning()) field.resize();
  }, { passive: true });
})();
