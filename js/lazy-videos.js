// ── Lazy-load project-panel videos (per-video, viewport-driven) ──
// Panels are display:none on load, so their <video src> would still download
// (autoplay forces it) and slow the home page. We strip src→data-src up-front,
// then load each clip ONLY when it actually scrolls into view inside its panel.
// This keeps entering a section fast: a carousel with a dozen clips loads just
// the 1–2 currently visible, not all of them at once. We KEEP the native
// `autoplay` attribute so the browser plays a clip the moment its src is set
// while on screen, and pause/unload off-screen clips to free bandwidth+memory.
(function () {
  'use strict';

  var PANEL_IDS = ['hero-panel', 'pkit-panel', 'iact-panel', 'tolean-panel'];
  // Start fetching a clip slightly before it enters view for a seamless feel.
  var ROOT_MARGIN = '300px';

  function strip(video) {
    if (video.getAttribute('src')) {
      video.setAttribute('data-src', video.getAttribute('src'));
      video.removeAttribute('src');
    }
    video.preload = 'none';
  }

  function load(video) {
    if (!video.getAttribute('src') && video.getAttribute('data-src')) {
      video.setAttribute('src', video.getAttribute('data-src'));
      video.load(); // native autoplay (if present) starts it once it has data
    }
  }

  function unload(video) {
    try { video.pause(); } catch (e) {}
    // Drop the buffer for clips scrolled far away to keep memory flat.
    if (video.getAttribute('src')) {
      video.setAttribute('data-src', video.getAttribute('src'));
      video.removeAttribute('src');
      video.removeAttribute('poster');
      try { video.load(); } catch (e) {}
    }
  }

  // One shared observer per panel: fires as marquee items move through view.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        load(entry.target);
      } else {
        unload(entry.target);
      }
    });
  }, { rootMargin: ROOT_MARGIN, threshold: 0.01 });

  PANEL_IDS.forEach(function (id) {
    var panel = document.getElementById(id);
    if (!panel) return;

    var videos = Array.prototype.slice.call(
      panel.querySelectorAll('video[src], video[data-src]'));

    videos.forEach(function (v) {
      strip(v);
      io.observe(v); // hidden panels report not-intersecting → stay unloaded
    });
  });
})();
