// ── About Panel — Flow Field (white lines, black bg) ──
(function () {
  'use strict';

  var panel = document.getElementById('about-panel');
  if (!panel) return;

  var canvas = document.createElement('canvas');
  canvas.id  = 'about-particles-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  panel.insertBefore(canvas, panel.firstChild);

  var ctx = canvas.getContext('2d');
  var mouseX = -99999, mouseY = -99999;

  panel.addEventListener('mousemove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
  }, { passive: true });
  panel.addEventListener('mouseleave', function () {
    mouseX = -99999; mouseY = -99999;
  });

  var field = window._createFlowField({
    canvas: canvas,
    ctx: ctx,
    lineColor: 'rgba(255,255,255,',
    clearColor: 'rgba(0,0,0,',
    initFill: '#000',
    getSize: function () { return { w: panel.offsetWidth, h: panel.offsetHeight }; },
    getMouse: function () { return { x: mouseX, y: mouseY }; }
  });

  var observer = new MutationObserver(function () {
    if (panel.style.display !== 'none' && panel.style.opacity !== '0') {
      field.start();
    } else {
      field.stop();
    }
  });
  observer.observe(panel, { attributes: true, attributeFilter: ['style'] });

  window.addEventListener('resize', function () {
    if (field.isRunning()) field.resize();
  }, { passive: true });
})();
