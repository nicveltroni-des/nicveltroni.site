// ── Others Sections — Flow Field (black lines, white bg, lower opacity) ──
(function () {
  'use strict';

  var SECTION_IDS = [
    'pnr-screen-others',
    'pkit-screen-others',
    'iact-screen-others',
    'tolean-screen-others'
  ];

  function initSection(section) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
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
      lineColor: 'rgba(0,0,0,',
      clearColor: 'rgba(255,255,255,',
      initFill: '#fff',
      opacitySteps: [0.003, 0.004, 0.006, 0.008, 0.012, 0.025, 0.04, 0.055, 0.07, 0.08],
      softClear: 0.28,
      getSize: function () { return { w: section.offsetWidth, h: section.offsetHeight }; },
      getMouse: function () { return { x: mouseX, y: mouseY }; }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) field.start(); else field.stop();
      });
    }, { threshold: 0.05 });
    io.observe(section);

    window.addEventListener('resize', function () {
      if (field.isRunning()) field.resize();
    }, { passive: true });
  }

  SECTION_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) initSection(el);
  });
})();
