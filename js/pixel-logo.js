// ── Pixel logo: SVG builder + LED flicker for video/header/intro/city ──
(function () {
  'use strict';

  // 5×5 bitmap font
  var FONT = {
    'N': ['10001', '11001', '10101', '10011', '10001'],
    'I': ['01110', '00100', '00100', '00100', '01110'],
    'C': ['01110', '10000', '10000', '10000', '01110'],
    'V': ['10001', '10001', '01010', '01010', '00100'],
    'E': ['11111', '10000', '11110', '10000', '11111'],
    'L': ['10000', '10000', '10000', '10000', '11111'],
    'T': ['11111', '00100', '00100', '00100', '00100'],
    'R': ['11110', '10001', '11110', '10100', '10010'],
    'O': ['01110', '10001', '10001', '10001', '01110'],
    'M': ['10001', '11011', '10101', '10001', '10001'],
    'A': ['01110', '10001', '11111', '10001', '10001'],
    'B': ['11110', '10001', '11110', '10001', '11110'],
    'P': ['11110', '10001', '11110', '10000', '10000'],
    'K': ['10010', '10100', '11000', '10100', '10010'],
    '.': ['00000', '00000', '00000', '00110', '00110'],
    'H': ['10001', '10001', '11111', '10001', '10001'],
    'D': ['11110', '10001', '10001', '10001', '11110'],
    'F': ['11111', '10000', '11110', '10000', '10000'],
    'Y': ['10001', '01010', '00100', '00100', '00100'],
    'U': ['10001', '10001', '10001', '10001', '01110'],
    'J': ['00111', '00010', '00010', '10010', '01100'],
    'G': ['01110', '10000', '10111', '10001', '01110'],
    'S': ['01111', '10000', '01110', '00001', '11110'],
    'W': ['10001', '10001', '10101', '11011', '10001'],
    'X': ['10001', '01010', '00100', '01010', '10001'],
    'Z': ['11111', '00010', '00100', '01000', '11111'],
    'Q': ['01110', '10001', '10101', '10010', '01101'],
    '?': ['01110', '10001', '00110', '00000', '00100'],
    ':': ['00000', '00011', '00000', '00011', '00000'],
    ')': ['11000', '00100', '00010', '00100', '11000']
  };

  var SQ = 2, GAP = 1, STEP = SQ + GAP;
  var CHAR_GAP = STEP;
  var H = STEP * 5 - GAP;

  // Build a pixel-text SVG. `cls` is the rect class, `fill` may be inline.
  function buildSVG(text, opts) {
    opts = opts || {};
    var wordGap = opts.wordGap != null ? opts.wordGap : STEP * 3;
    var cls = opts.cls || 'px';
    var fill = opts.fill || '#000';
    var opacity = opts.opacity != null ? ' opacity="' + opts.opacity + '"' : '';
    var rects = [], x = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === ' ') { x += wordGap; continue; }
      var bmp = FONT[ch];
      if (!bmp) continue;
      for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 5; c++) {
          if (bmp[r][c] === '1') {
            rects.push('<rect class="' + cls + '" x="' + (x + c * STEP) +
              '" y="' + (r * STEP) + '" width="' + SQ + '" height="' + SQ +
              '" fill="' + fill + '"' + opacity + '/>');
          }
        }
      }
      x += STEP * 5 + CHAR_GAP;
    }
    var W = x - CHAR_GAP;
    return '<svg viewBox="0 0 ' + W + ' ' + H +
      '" overflow="visible" xmlns="http://www.w3.org/2000/svg">' +
      rects.join('') + '</svg>';
  }

  // ── Inject NIC VELTRONI into the 3 logo slots ──
  var mainSVG  = buildSVG('NIC VELTRONI');
  var introSVG = buildSVG('NIC VELTRONI', { wordGap: STEP * 1.5 });
  document.getElementById('video-pixel-logo').innerHTML = mainSVG;
  document.getElementById('video-led-logo').innerHTML   = mainSVG;
  document.getElementById('header-pixel').innerHTML     = mainSVG;
  window._introPixelSVG = introSVG;

  // ── PRO NAP hero pixel title ──
  var pnrPixelEl = document.getElementById('pnr-pixel-title');
  if (pnrPixelEl) {
    pnrPixelEl.innerHTML = buildSVG('PRO NAP', { fill: '#fff', wordGap: STEP * 2 });
    var pnrPxs = Array.from(pnrPixelEl.querySelectorAll('.px'));
    hideAll(pnrPxs);

    // Mouse repel
    (function () {
      var svg = pnrPixelEl.querySelector('svg');
      if (!svg) return;
      var ax = pnrPxs.map(function (el) { return parseFloat(el.getAttribute('x') || 0) + 1; });
      var ay = pnrPxs.map(function (el) { return parseFloat(el.getAttribute('y') || 0) + 1; });
      var jitter = pnrPxs.map(function () { return (Math.random() - 0.5) * 16; });
      var rafId = null, lastMx, lastMy;
      function applyRepel() {
        var sr = svg.getBoundingClientRect();
        if (!sr.width) return;
        var vb = svg.viewBox.baseVal;
        var sx = sr.width / vb.width, sy = sr.height / vb.height;
        var BASE_RADIUS = 32, STRENGTH = 12;
        pnrPxs.forEach(function (el, i) {
          var dx = sr.left + ax[i] * sx - lastMx;
          var dy = sr.top  + ay[i] * sy - lastMy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var RADIUS = BASE_RADIUS + jitter[i];
          if (dist < RADIUS && dist > 0) {
            var f = (1 - dist / RADIUS) * STRENGTH;
            el.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)';
          } else {
            el.style.transform = '';
          }
        });
        rafId = null;
      }
      pnrPixelEl.addEventListener('mouseenter', function () { pnrPixelEl.classList.add('px-hovering'); });
      pnrPixelEl.addEventListener('mousemove', function (e) {
        lastMx = e.clientX; lastMy = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(applyRepel);
      });
      pnrPixelEl.addEventListener('mouseleave', function () {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        pnrPixelEl.classList.remove('px-hovering');
        pnrPxs.forEach(function (el) { el.style.transform = ''; });
      });
    })();

    // Reveal all'apertura del pannello
    window._pnrPixelReveal = function () {
      hideAll(pnrPxs);
      shuffledReveal(pnrPxs, 16);
    };
  }

  // ── TOLEAN hero pixel title ──
  var toleanPixelEl = document.getElementById('tolean-pixel-title');
  if (toleanPixelEl) {
    toleanPixelEl.innerHTML = buildSVG('TOLEAN', { fill: '#fff' });
    var toleanPxs = Array.from(toleanPixelEl.querySelectorAll('.px'));
    hideAll(toleanPxs);
    window._toleanPixelReveal = function () {
      hideAll(toleanPxs);
      shuffledReveal(toleanPxs, 8);
    };

    (function () {
      var svg = toleanPixelEl.querySelector('svg');
      if (!svg) return;
      var ax = toleanPxs.map(function (el) { return parseFloat(el.getAttribute('x') || 0) + 1; });
      var ay = toleanPxs.map(function (el) { return parseFloat(el.getAttribute('y') || 0) + 1; });
      var jitter = toleanPxs.map(function () { return (Math.random() - 0.5) * 16; });
      var rafId = null, lastMx, lastMy;
      function applyRepel() {
        var sr = svg.getBoundingClientRect();
        if (!sr.width) return;
        var vb = svg.viewBox.baseVal;
        var sx = sr.width / vb.width, sy = sr.height / vb.height;
        var BASE_RADIUS = 32, STRENGTH = 12;
        toleanPxs.forEach(function (el, i) {
          var dx = sr.left + ax[i] * sx - lastMx;
          var dy = sr.top  + ay[i] * sy - lastMy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var RADIUS = BASE_RADIUS + jitter[i];
          if (dist < RADIUS && dist > 0) {
            var f = (1 - dist / RADIUS) * STRENGTH;
            el.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)';
          } else {
            el.style.transform = '';
          }
        });
        rafId = null;
      }
      toleanPixelEl.addEventListener('mouseenter', function () { toleanPixelEl.classList.add('px-hovering'); });
      toleanPixelEl.addEventListener('mousemove', function (e) {
        lastMx = e.clientX; lastMy = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(applyRepel);
      });
      toleanPixelEl.addEventListener('mouseleave', function () {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        toleanPixelEl.classList.remove('px-hovering');
        toleanPxs.forEach(function (el) { el.style.transform = ''; });
      });
    })();
  }

  // ── INTERACT hero pixel title ──
  var iactPixelEl = document.getElementById('iact-pixel-title');
  if (iactPixelEl) {
    iactPixelEl.innerHTML = buildSVG('INTERACT', { fill: '#FFDD1A' });
    var iactPxs = Array.from(iactPixelEl.querySelectorAll('.px'));
    hideAll(iactPxs);
    window._iactPixelReveal = function () {
      hideAll(iactPxs);
      shuffledReveal(iactPxs, 8);
    };

    // Mouse repel
    (function () {
      var svg = iactPixelEl.querySelector('svg');
      if (!svg) return;
      var ax = iactPxs.map(function (el) { return parseFloat(el.getAttribute('x') || 0) + 1; });
      var ay = iactPxs.map(function (el) { return parseFloat(el.getAttribute('y') || 0) + 1; });
      var jitter = iactPxs.map(function () { return (Math.random() - 0.5) * 16; });
      var rafId = null, lastMx, lastMy;
      function applyRepel() {
        var sr = svg.getBoundingClientRect();
        if (!sr.width) return;
        var vb = svg.viewBox.baseVal;
        var sx = sr.width / vb.width, sy = sr.height / vb.height;
        var BASE_RADIUS = 32, STRENGTH = 12;
        iactPxs.forEach(function (el, i) {
          var dx = sr.left + ax[i] * sx - lastMx;
          var dy = sr.top  + ay[i] * sy - lastMy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var RADIUS = BASE_RADIUS + jitter[i];
          if (dist < RADIUS && dist > 0) {
            var f = (1 - dist / RADIUS) * STRENGTH;
            el.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)';
          } else {
            el.style.transform = '';
          }
        });
        rafId = null;
      }
      iactPixelEl.addEventListener('mouseenter', function () { iactPixelEl.classList.add('px-hovering'); });
      iactPixelEl.addEventListener('mousemove', function (e) {
        lastMx = e.clientX; lastMy = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(applyRepel);
      });
      iactPixelEl.addEventListener('mouseleave', function () {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        iactPixelEl.classList.remove('px-hovering');
        iactPxs.forEach(function (el) { el.style.transform = ''; });
      });
    })();
  }

  // ── P.KIT hero pixel title ──
  var pkitPixelEl = document.getElementById('pkit-pixel-title');
  if (pkitPixelEl) {
    pkitPixelEl.innerHTML = buildSVG('P.KIT', { fill: '#fff' });
    // Color the 4 dot pixels red (cols 2-3 of '.', x=24 and x=27)
    Array.from(pkitPixelEl.querySelectorAll('.px')).forEach(function (r) {
      var rx = parseInt(r.getAttribute('x'), 10);
      if (rx === 24 || rx === 27) r.setAttribute('fill', '#FF2200');
    });
    var pkitPxs = Array.from(pkitPixelEl.querySelectorAll('.px'));
    hideAll(pkitPxs);
    window._pkitPixelReveal = function () {
      hideAll(pkitPxs);
      shuffledReveal(pkitPxs, 10);
    };

    (function () {
      var svg = pkitPixelEl.querySelector('svg');
      if (!svg) return;
      var ax = pkitPxs.map(function (el) { return parseFloat(el.getAttribute('x') || 0) + 1; });
      var ay = pkitPxs.map(function (el) { return parseFloat(el.getAttribute('y') || 0) + 1; });
      var jitter = pkitPxs.map(function () { return (Math.random() - 0.5) * 16; });
      var rafId = null, lastMx, lastMy;
      function applyRepel() {
        var sr = svg.getBoundingClientRect();
        if (!sr.width) return;
        var vb = svg.viewBox.baseVal;
        var sx = sr.width / vb.width, sy = sr.height / vb.height;
        var BASE_RADIUS = 32, STRENGTH = 12;
        pkitPxs.forEach(function (el, i) {
          var dx = sr.left + ax[i] * sx - lastMx;
          var dy = sr.top  + ay[i] * sy - lastMy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var RADIUS = BASE_RADIUS + jitter[i];
          if (dist < RADIUS && dist > 0) {
            var f = (1 - dist / RADIUS) * STRENGTH;
            el.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)';
          } else {
            el.style.transform = '';
          }
        });
        rafId = null;
      }
      pkitPixelEl.addEventListener('mouseenter', function () { pkitPixelEl.classList.add('px-hovering'); });
      pkitPixelEl.addEventListener('mousemove', function (e) {
        lastMx = e.clientX; lastMy = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(applyRepel);
      });
      pkitPixelEl.addEventListener('mouseleave', function () {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        pkitPixelEl.classList.remove('px-hovering');
        pkitPxs.forEach(function (el) { el.style.transform = ''; });
      });
    })();
  }

  // ── ABOUT panel pixel title ──
  var aboutPixelEl = document.getElementById('about-pixel-title');
  if (aboutPixelEl) {
    aboutPixelEl.innerHTML = buildSVG('NIC VELTRONI', { fill: '#fff' });
    var aboutPxs = Array.from(aboutPixelEl.querySelectorAll('.px'));
    hideAll(aboutPxs);

    var aboutFlickerState = null;
    window._aboutPixelReveal = function () {
      hideAll(aboutPxs);
      shuffledReveal(aboutPxs, 8);
      // Avvia il flicker rosso dopo che il reveal è completato
      if (!aboutFlickerState) {
        setTimeout(function () {
          aboutFlickerState = startFlicker(aboutPxs, {
            count: [2, 4], on: [200, 400], gap: [300, 600],
            idle: [400, 600], keepOpacity: true, color: '#FF2200'
          });
        }, 1100);
      }
    };
    window._aboutPixelHide = function () {
      hideAll(aboutPxs);
    };

    // Mouse repel
    (function () {
      var svg = aboutPixelEl.querySelector('svg');
      if (!svg) return;
      var ax = aboutPxs.map(function (el) { return parseFloat(el.getAttribute('x') || 0) + 1; });
      var ay = aboutPxs.map(function (el) { return parseFloat(el.getAttribute('y') || 0) + 1; });
      var jitter = aboutPxs.map(function () { return (Math.random() - 0.5) * 16; });
      var rafId = null, lastMx, lastMy;
      function applyRepel() {
        var sr = svg.getBoundingClientRect();
        if (!sr.width) return;
        var vb = svg.viewBox.baseVal;
        var sx = sr.width / vb.width, sy = sr.height / vb.height;
        var BASE_RADIUS = 40, STRENGTH = 14;
        aboutPxs.forEach(function (el, i) {
          var dx = sr.left + ax[i] * sx - lastMx;
          var dy = sr.top  + ay[i] * sy - lastMy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var RADIUS = BASE_RADIUS + jitter[i];
          if (dist < RADIUS && dist > 0) {
            var f = (1 - dist / RADIUS) * STRENGTH;
            el.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)';
          } else {
            el.style.transform = '';
          }
        });
        rafId = null;
      }
      aboutPixelEl.addEventListener('mouseenter', function () { aboutPixelEl.classList.add('px-hovering'); });
      aboutPixelEl.addEventListener('mousemove', function (e) {
        lastMx = e.clientX; lastMy = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(applyRepel);
      });
      aboutPixelEl.addEventListener('mouseleave', function () {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        aboutPixelEl.classList.remove('px-hovering');
        aboutPxs.forEach(function (el) { el.style.transform = ''; });
      });
    })();
  }

  // ── CONTACT pixel CTA ──
  var contactPixelEl = document.getElementById('contact-pixel-cta');
  if (contactPixelEl) {
    var cLine1 = buildSVG('HAVE A PROJECT IN MIND ?', { fill: '#FF2200' });
    var cLine2 = buildSVG('ID LOVE TO HEAR FROM YOU', { fill: '#FF2200' });
    contactPixelEl.innerHTML =
      '<div class="contact-px-line">' + cLine1 + '</div>' +
      '<div class="contact-px-line">' + cLine2 + '</div>';

    var contactPxs = Array.from(contactPixelEl.querySelectorAll('.px'));
    hideAll(contactPxs);

    window._contactPixelReveal = function () {
      hideAll(contactPxs);
      shuffledReveal(contactPxs, 3);
    };

    // Mouse repel per linea
    (function () {
      var lines = Array.from(contactPixelEl.querySelectorAll('.contact-px-line'));
      lines.forEach(function (lineEl) {
        var svg = lineEl.querySelector('svg');
        if (!svg) return;
        var linePxs = Array.from(lineEl.querySelectorAll('.px'));
        var ax = linePxs.map(function (el) { return parseFloat(el.getAttribute('x') || 0) + 1; });
        var ay = linePxs.map(function (el) { return parseFloat(el.getAttribute('y') || 0) + 1; });
        var jitter = linePxs.map(function () { return (Math.random() - 0.5) * 20; });
        var rafId = null, lastMx, lastMy;
        function applyRepel() {
          var sr = svg.getBoundingClientRect();
          if (!sr.width) return;
          var vb = svg.viewBox.baseVal;
          var sx = sr.width / vb.width, sy = sr.height / vb.height;
          var BASE_RADIUS = 50, STRENGTH = 18;
          linePxs.forEach(function (el, i) {
            var dx = sr.left + ax[i] * sx - lastMx;
            var dy = sr.top  + ay[i] * sy - lastMy;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var RADIUS = BASE_RADIUS + jitter[i];
            if (dist < RADIUS && dist > 0) {
              var f = (1 - dist / RADIUS) * STRENGTH;
              el.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)';
            } else {
              el.style.transform = '';
            }
          });
          rafId = null;
        }
        lineEl.addEventListener('mouseenter', function () { contactPixelEl.classList.add('px-hovering'); });
        lineEl.addEventListener('mousemove', function (e) {
          lastMx = e.clientX; lastMy = e.clientY;
          if (!rafId) rafId = requestAnimationFrame(applyRepel);
        });
        lineEl.addEventListener('mouseleave', function () {
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          contactPixelEl.classList.remove('px-hovering');
          linePxs.forEach(function (el) { el.style.transform = ''; });
        });
      });
    })();
  }

  // ── Pixel manipulation helpers ──
  function pixelsOf(id) {
    return Array.from(document.getElementById(id).querySelectorAll('.px'));
  }
  function hideAll(pxs) {
    pxs.forEach(function (el) { el.style.opacity = '0'; });
  }
  function light(el, col, blur) {
    el.setAttribute('opacity', '1');
    el.style.fill = col;
    el.style.filter = 'drop-shadow(0 0 ' + blur + 'px ' + col + ')';
  }
  function unlight(el, keepOpacity) {
    if (!keepOpacity) el.setAttribute('opacity', '0');
    el.style.fill = '';
    el.style.filter = '';
  }

  // Reveal a list of <rect> in random order with `step` ms between each.
  function shuffledReveal(pxs, step) {
    var sh = pxs.slice().sort(function () { return Math.random() - 0.5; });
    var timeouts = [];
    sh.forEach(function (el, i) {
      timeouts.push(setTimeout(function () { el.style.opacity = '1'; }, i * step));
    });
    return timeouts;
  }

  // ── LED flicker factory (random pixels light up con colore dinamico) ──
  // opts: { count, on, gap, idle, keepOpacity, color (stringa o fn) }
  function startFlicker(pxs, opts) {
    var state = { hovered: false };
    function getColor() {
      return typeof opts.color === 'function' ? opts.color() : (opts.color || '#FF2200');
    }
    function loop() {
      if (state.hovered) {
        setTimeout(loop, opts.idle[0] + Math.random() * opts.idle[1]);
        return;
      }
      var count = opts.count[0] + Math.floor(Math.random() * opts.count[1]);
      var idx = [];
      while (idx.length < count && idx.length < pxs.length) {
        var i = Math.floor(Math.random() * pxs.length);
        if (idx.indexOf(i) === -1) idx.push(i);
      }
      var col = getColor();
      idx.forEach(function (i) { light(pxs[i], col, 4); });
      setTimeout(function () {
        if (state.hovered) return;
        idx.forEach(function (i) { unlight(pxs[i], opts.keepOpacity); });
      }, opts.on[0] + Math.random() * opts.on[1]);
      setTimeout(loop, opts.gap[0] + Math.random() * opts.gap[1]);
    }
    state.getColor = getColor;
    loop();
    return state;
  }

  // Hover sweep: cascade all pixels on in random batches
  function attachHoverSweep(wrapEl, pxs, state, keepOpacity) {
    var timeouts = [];
    wrapEl.addEventListener('mouseenter', function () {
      state.hovered = true;
      var sh = pxs.map(function (_, i) { return i; })
        .sort(function () { return Math.random() - 0.5; });
      var BATCH = 8;
      for (var b = 0; b < sh.length; b += BATCH) {
        (function (batch, delay) {
          timeouts.push(setTimeout(function () {
            if (!state.hovered) return;
            batch.forEach(function (i) { light(pxs[i], state.getColor(), 1.5); });
          }, delay));
        })(sh.slice(b, b + BATCH), Math.floor(b / BATCH) * 80);
      }
    });
    wrapEl.addEventListener('mouseleave', function () {
      state.hovered = false;
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
      pxs.forEach(function (el) { unlight(el, keepOpacity); });
    });
  }

  // Mouse-repel: pixels scatter away from cursor and spring back.
  // Positions derived from SVG attributes + one getBoundingClientRect on the SVG.
  function attachMouseRepel(wrapEl, pxs) {
    var svg = wrapEl.querySelector('#video-pixel-logo svg');
    if (!svg) return;
    // Cache SVG-unit coords (center of each 2×2 rect) + per-pixel radius jitter
    var ax = pxs.map(function (el) { return parseFloat(el.getAttribute('x') || 0) + 1; });
    var ay = pxs.map(function (el) { return parseFloat(el.getAttribute('y') || 0) + 1; });
    var jitter = pxs.map(function () { return (Math.random() - 0.5) * 16; });

    var rafId = null, lastMx, lastMy;

    function applyRepel() {
      var sr = svg.getBoundingClientRect();
      if (!sr.width) return;
      var vb = svg.viewBox.baseVal;
      var sx = sr.width / vb.width, sy = sr.height / vb.height;
      var BASE_RADIUS = 32, STRENGTH = 12;
      pxs.forEach(function (el, i) {
        var dx = sr.left + ax[i] * sx - lastMx;
        var dy = sr.top  + ay[i] * sy - lastMy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var RADIUS = BASE_RADIUS + jitter[i];
        if (dist < RADIUS && dist > 0) {
          var f = (1 - dist / RADIUS) * STRENGTH;
          el.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)';
        } else {
          el.style.transform = '';
        }
      });
      rafId = null;
    }

    wrapEl.addEventListener('mouseenter', function () {
      wrapEl.classList.add('px-hovering'); // disabilita transition durante movimento
    });

    wrapEl.addEventListener('mousemove', function (e) {
      lastMx = e.clientX; lastMy = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(applyRepel);
    });

    wrapEl.addEventListener('mouseleave', function () {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      wrapEl.classList.remove('px-hovering'); // riattiva transition → spring-back
      pxs.forEach(function (el) { el.style.transform = ''; });
    });
  }

  // ── Base video logo pixels (defined first — needed for repel + reveal) ──
  var basePxs = pixelsOf('video-pixel-logo'); hideAll(basePxs);

  // ── Set up video LED layer ──
  var ledPxs = pixelsOf('video-led-logo'); hideAll(ledPxs);
  var ledState = startFlicker(ledPxs, {
    count: [15, 15], on: [600, 800], gap: [200, 300], idle: [400, 500]
  });
  var videoWrap = document.getElementById('video-pixel-logo').parentNode;
  attachHoverSweep(videoWrap, ledPxs, ledState);
  attachMouseRepel(videoWrap, basePxs);

  // ── Set up header pixel logo ──
  var hdrPxs = pixelsOf('header-pixel'); hideAll(hdrPxs);
  var hdrState = startFlicker(hdrPxs, {
    count: [5, 5], on: [400, 600], gap: [300, 500], idle: [400, 500],
    keepOpacity: true,
    color: function () {
      return document.body.classList.contains('iact-open') ? '#FFDD1A' : '#FF2200';
    }
  });
  attachHoverSweep(document.getElementById('header-pixel'), hdrPxs, hdrState, true);

  // ── Base video logo: reveal animation (shared with header) ──
  var revealTimeouts = [];
  window._logoReveal = function () {
    revealTimeouts.forEach(clearTimeout);
    hideAll(basePxs); hideAll(hdrPxs);
    revealTimeouts = shuffledReveal(basePxs, 16).concat(shuffledReveal(hdrPxs, 6));
  };
  window._logoRevealReset = function () {
    revealTimeouts.forEach(clearTimeout);
    revealTimeouts = [];
    basePxs.forEach(function (el) { el.style.opacity = ''; });
    hdrPxs.forEach(function (el) { el.style.opacity = ''; });
  };
  setTimeout(window._logoReveal, 200);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) setTimeout(window._logoReveal, 200);
  });

  // Expose for the intro typewriter
  window._shuffledReveal = shuffledReveal;

  // ── City cycling in header: BERLIN → ROME → MILAN ──
  var cityEl = document.getElementById('header-city');
  if (cityEl) {
    var cities = ['BERLIN', 'ROME', 'MILAN'];
    var durations = [5000, 1400, 1400];
    var idx = 0;

    function show(i) {
      var fill = cities[i] === 'BERLIN' ? '#FF2200' : '#000';
      cityEl.innerHTML = buildSVG(cities[i], { cls: 'cpx', fill: fill, opacity: 0 });
      shuffledReveal(Array.from(cityEl.querySelectorAll('.cpx')), 10);
    }
    function next() {
      setTimeout(function () {
        Array.from(cityEl.querySelectorAll('.cpx'))
          .forEach(function (el) { el.setAttribute('opacity', '0'); });
        setTimeout(function () {
          idx = (idx + 1) % cities.length;
          show(idx); next();
        }, 300);
      }, durations[idx]);
    }
    show(0); next();
  }

  // ── Project card pixel names ──
  var CARD_NAMES = [
    { sel: '.js-open-pronap',   text: 'PRO NAP' },
    { sel: '.js-open-pkit',     text: 'P.KIT' },
    { sel: '.js-open-interact', text: 'INTERACT' },
    { sel: '.js-open-tolean',   text: 'TOLEAN' }
  ];
  CARD_NAMES.forEach(function (item) {
    document.querySelectorAll(item.sel).forEach(function (card) {
      var div = document.createElement('div');
      div.className = 'proj-card-pixel-name';
      div.innerHTML = buildSVG(item.text, { fill: 'currentColor' });
      var panel = card.querySelector('.proj-card-hover-panel');
      if (panel) panel.insertBefore(div, panel.firstChild); else card.appendChild(div);
    });
  });

  // ── Header hero/scroll mode toggle ──
  var header = document.getElementById('main-header');
  var pageScroll = document.getElementById('page-scroll');
  if (pageScroll && header) {
    pageScroll.addEventListener('scroll', function () {
      var threshold = window.innerHeight * 0.8;
      header.classList.toggle('hero-nav', pageScroll.scrollTop <= threshold);
    }, { passive: true });
  }
})();
