// ── Main Background Flow Field — white bg, black lines ──
(function () {
  'use strict';

  var canvas = document.createElement('canvas');
  canvas.id  = 'antigravity-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');

  var mouseX = -99999, mouseY = -99999;
  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX; mouseY = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', function () {
    mouseX = -99999; mouseY = -99999;
  });

  var _panelWasOpen = false;
  var _scrollPaused = false;
  var _scrollTimer  = null;
  var _pgScroll = document.getElementById('page-scroll');
  if (_pgScroll) {
    _pgScroll.addEventListener('scroll', function () {
      _scrollPaused = true;
      clearTimeout(_scrollTimer);
      _scrollTimer = setTimeout(function () { _scrollPaused = false; }, 250);
    }, { passive: true });
  }

  var field = window._createFlowField({
    canvas: canvas,
    ctx: ctx,
    lineColor: 'rgba(0,0,0,',
    clearColor: 'rgba(255,255,255,',
    getSize: function () {
      return { w: window.innerWidth, h: window.innerHeight };
    },
    getMouse: function () { return { x: mouseX, y: mouseY }; },
    shouldSkip: function () {
      if (document.hidden || _scrollPaused) return true;
      var panelOpen = document.body.classList.contains('panel-open');
      if (panelOpen) {
        if (!_panelWasOpen) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          _panelWasOpen = true;
        }
        return true;
      }
      if (_panelWasOpen) {
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        _panelWasOpen = false;
      }
      return false;
    }
  });

  window.addEventListener('resize', function () { field.resize(); }, { passive: true });
  field.start();
})();
