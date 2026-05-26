// ── SVG Inline Loader ──
// Fetches an SVG file and injects it into a container element,
// preserving DOM manipulability (classes, opacity, JS access).
(function () {
  'use strict';

  /**
   * @param {string} url  - path to the SVG file
   * @param {HTMLElement} container - element that will receive the SVG
   * @param {Function} [cb] - optional callback(svgElement) after injection
   */
  function injectSVG(url, container, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 0) {
        var tmp = document.createElement('div');
        tmp.innerHTML = xhr.responseText.trim();
        var svg = tmp.querySelector('svg');
        if (svg) {
          container.appendChild(svg);
          if (cb) cb(svg);
        }
      }
    };
    xhr.send();
  }

  window._injectSVG = injectSVG;
})();
