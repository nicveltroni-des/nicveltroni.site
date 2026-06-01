// ── Lazy-load project-panel videos ──
// Panels are display:none on load, so their <video src> would still download
// (autoplay forces it) and slow the home page. We strip src→data-src up-front
// and restore it only when the panel opens. We KEEP the native `autoplay`
// attribute: Chrome plays muted autoplay clips only while they're on screen and
// pauses the rest, so the marquee never decodes dozens of videos at once.
(function () {
  'use strict';

  var PANEL_IDS = ['hero-panel', 'pkit-panel', 'iact-panel', 'tolean-panel'];

  function strip(video) {
    if (video.getAttribute('src')) {
      video.setAttribute('data-src', video.getAttribute('src'));
      video.removeAttribute('src');
    }
    video.preload = 'none';
  }

  function restore(video) {
    if (!video.getAttribute('src') && video.getAttribute('data-src')) {
      video.setAttribute('src', video.getAttribute('data-src'));
      video.load(); // native autoplay (if present) plays it once visible
    }
  }

  function isVisible(panel) {
    return panel.style.display !== 'none' &&
           getComputedStyle(panel).display !== 'none';
  }

  PANEL_IDS.forEach(function (id) {
    var panel = document.getElementById(id);
    if (!panel) return;

    var videos = Array.prototype.slice.call(
      panel.querySelectorAll('video[src], video[data-src]'));
    videos.forEach(strip);

    var observer = new MutationObserver(function () {
      if (isVisible(panel)) {
        videos.forEach(restore);
      } else {
        videos.forEach(function (v) { try { v.pause(); } catch (e) {} });
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ['style'] });
  });
})();
