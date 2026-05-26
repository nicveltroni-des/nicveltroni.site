// ── Shared Flow Field Engine — Perlin Noise 3D + domain warping ──
// Used by: particles.js, about-particles.js, contact-particles.js, others-particles.js
(function () {
  'use strict';

  // ── Perlin Noise 3D ──
  function createNoise() {
    var perm = new Uint8Array(512);
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++) p[i] = i;
    for (var i = 255; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (var i = 0; i < 512; i++) perm[i] = p[i & 255];

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return a + t * (b - a); }
    function grad(hash, x, y, z) {
      var h = hash & 15;
      var u = h < 8 ? x : y;
      var v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
      return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    return function noise(x, y, z) {
      var X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      var u = fade(x), v = fade(y), w = fade(z);
      var A  = perm[X]+Y,   AA = perm[A]+Z,   AB = perm[A+1]+Z;
      var B  = perm[X+1]+Y, BA = perm[B]+Z,   BB = perm[B+1]+Z;
      return lerp(
        lerp(lerp(grad(perm[AA],   x,   y,   z),  grad(perm[BA],   x-1, y,   z), u),
             lerp(grad(perm[AB],   x,   y-1, z),  grad(perm[BB],   x-1, y-1, z), u), v),
        lerp(lerp(grad(perm[AA+1], x,   y,   z-1),grad(perm[BA+1], x-1, y,   z-1), u),
             lerp(grad(perm[AB+1], x,   y-1, z-1),grad(perm[BB+1], x-1, y-1, z-1), u), v), w
      ) * 0.5 + 0.5;
    };
  }

  // ── Flow Field Factory ──
  // cfg = { canvas, ctx, lineColor, clearColor, opacitySteps?, weightSteps?, softClear?, getSize, getMouse }
  // Returns { start, stop, running }
  function createFlowField(cfg) {
    var noise = createNoise();
    var ctx = cfg.ctx;
    var W, H, cols, rows, t = 0;

    var NOISE_SCALE  = 0.016;
    var WARP_FREQ    = 0.024;
    var WARP_AMP     = 0.55;
    var ANGLE_FREQ   = 0.007;
    var TIME_SPEED   = 0.0005;
    var DRIFT_X      = 0.09;
    var DRIFT_Y      = 0.045;
    var GRID_SPACING = 6;
    var MIN_LEN      = 0.6;
    var MAX_LEN      = 4.0;

    var WEIGHT_STEPS  = cfg.weightSteps  || [0.08, 0.09, 0.10, 0.11, 0.13, 0.16, 0.20, 0.26, 0.33, 0.42];
    var OPACITY_STEPS = cfg.opacitySteps || [0.01, 0.01, 0.02, 0.03, 0.05, 0.10, 0.16, 0.22, 0.28, 0.30];
    var SOFT_CLEAR    = cfg.softClear != null ? cfg.softClear : 0.16;

    var MOUSE_RADIUS = 180, MOUSE_R2 = MOUSE_RADIUS * MOUSE_RADIUS, MOUSE_STRENGTH = 0.88;
    var MOUSE_WARP_RADIUS = 260, MOUSE_WARP_R2 = MOUSE_WARP_RADIUS * MOUSE_WARP_RADIUS, MOUSE_WARP_PUSH = 0.28;

    var TWO_PI   = Math.PI * 2;
    var nBuckets = OPACITY_STEPS.length;
    var buckets  = [];
    for (var b = 0; b < nBuckets; b++) buckets[b] = [];

    var CLEAR_STYLE = cfg.clearColor + SOFT_CLEAR + ')';

    var running = false;

    function resize() {
      var size = cfg.getSize();
      W = cfg.canvas.width  = size.w;
      H = cfg.canvas.height = size.h;
      cols = Math.floor(W / GRID_SPACING) + 2;
      rows = Math.floor(H / GRID_SPACING) + 2;
    }

    function draw() {
      if (!running) return;
      requestAnimationFrame(draw);

      if (cfg.shouldSkip && cfg.shouldSkip()) return;

      ctx.fillStyle = CLEAR_STYLE;
      ctx.fillRect(0, 0, W, H);

      for (var b = 0; b < nBuckets; b++) buckets[b].length = 0;

      var mouse = cfg.getMouse();
      var mouseX = mouse.x, mouseY = mouse.y;
      var tDX = t * DRIFT_X, tDY = t * DRIFT_Y, tZ = t, warpT = t * 0.28;

      for (var row = 0; row < rows; row++) {
        var py  = row * GRID_SPACING + GRID_SPACING * 0.5;
        var ny  = row * NOISE_SCALE;
        var rwx = row * WARP_FREQ;

        for (var col = 0; col < cols; col++) {
          var px  = col * GRID_SPACING + GRID_SPACING * 0.5;
          var nx  = col * NOISE_SCALE;
          var cwx = col * WARP_FREQ;

          var mdx = px - mouseX, mdy = py - mouseY;
          var mdist2 = mdx * mdx + mdy * mdy, mdist = 0;

          var wx = (noise(cwx,       rwx,       warpT + 4.2) - 0.5) * WARP_AMP;
          var wy = (noise(cwx + 6.8, rwx + 3.4, warpT + 1.7) - 0.5) * WARP_AMP;

          if (mdist2 < MOUSE_WARP_R2 && mdist2 > 0.001) {
            mdist = Math.sqrt(mdist2);
            var wi = (1 - mdist / MOUSE_WARP_RADIUS);
            wi = wi * wi * MOUSE_WARP_PUSH / mdist;
            wx += mdx * wi; wy += mdy * wi;
          }

          var nv = noise(nx + tDX + wx, ny + tDY + wy, tZ);
          var c  = nv < 0.5 ? 2 * nv * nv : 1 - 2 * (1 - nv) * (1 - nv);

          var nDir  = noise(col * ANGLE_FREQ, row * ANGLE_FREQ, tZ * 0.45 + 12.3);
          var angle = nDir * TWO_PI;
          var pulse = c * c;
          var len   = MIN_LEN + pulse * (MAX_LEN - MIN_LEN);
          var bIdx  = Math.min(nBuckets - 1, Math.floor(c * nBuckets));
          var cosA  = Math.cos(angle) * len;
          var sinA  = Math.sin(angle) * len;

          if (mdist2 < MOUSE_R2 && mdist2 > 0.001) {
            if (mdist === 0) mdist = Math.sqrt(mdist2);
            var influence = (1 - mdist / MOUSE_RADIUS);
            influence = influence * influence * MOUSE_STRENGTH;
            var inv = len / mdist;
            cosA += (mdx * inv - cosA) * influence;
            sinA += (mdy * inv - sinA) * influence;
          }

          buckets[bIdx].push(px - cosA, py - sinA, px + cosA, py + sinA);
        }
      }

      ctx.lineCap = 'round';
      for (var b = 0; b < nBuckets; b++) {
        var data = buckets[b];
        if (!data.length) continue;
        ctx.strokeStyle = cfg.lineColor + OPACITY_STEPS[b] + ')';
        ctx.lineWidth   = WEIGHT_STEPS[b];
        ctx.beginPath();
        for (var i = 0; i < data.length; i += 4) {
          ctx.moveTo(data[i], data[i+1]);
          ctx.lineTo(data[i+2], data[i+3]);
        }
        ctx.stroke();
      }

      t += TIME_SPEED;
    }

    return {
      resize: resize,
      start: function () {
        if (running) return;
        running = true;
        resize();
        if (cfg.initFill) {
          ctx.fillStyle = cfg.initFill;
          ctx.fillRect(0, 0, W, H);
        }
        draw();
      },
      stop: function () { running = false; },
      isRunning: function () { return running; }
    };
  }

  window._createFlowField = createFlowField;
})();
