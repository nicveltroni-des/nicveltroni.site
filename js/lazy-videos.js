// ── Lazy-load project-panel videos ──
// Panels are display:none on load. Their <video src> would still download
// (autoplay forces it). We strip src→data-src on load and restore only when
// the panel becomes visible, then pause/release when it closes.
(function () {
  'use strict';

  var PANEL_IDS = ['hero-panel', 'pkit-panel', 'iact-panel', 'tolean-panel'];

  function strip(video) {
    if (video.getAttribute('src')) {
      video.setAttribute('data-src', video.getAttribute('src'));
      video.removeAttribute('src');
    }
    if (video.hasAttribute('autoplay')) {
      video.setAttribute('data-autoplay', '');
      video.removeAttribute('autoplay');
    }
    video.preload = 'none';
  }

  function load(video) {
    if (!video.getAttribute('src') && video.getAttribute('data-src')) {
      video.setAttribute('src', video.getAttribute('data-src'));
      video.load();
    }
    // All these are muted background/loop clips — safe to attempt playback.
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function unload(video) {
    try { video.pause(); } catch (e) {}
  }

  function isVisible(panel) {
    var s = panel.style;
    return s.display !== 'none' && getComputedStyle(panel).display !== 'none';
  }

  PANEL_IDS.forEach(function (id) {
    var panel = document.getElementById(id);
    if (!panel) return;

    var videos = Array.prototype.slice.call(panel.querySelectorAll('video[src], video[data-src]'));
    videos.forEach(strip);

    var observer = new MutationObserver(function () {
      if (isVisible(panel)) {
        videos.forEach(load);
      } else {
        videos.forEach(unload);
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ['style'] });
  });
})();
