// ── About panel typewriter ──
// Types out #about-screen-1 text content when the panel opens.
(function () {
  'use strict';

  var SPEED_NAME  = 42;
  var SPEED_ROLE  = 28;
  var SPEED_QUOTE = 16;
  var SPEED_LABEL = 32;
  var SPEED_BODY  = 16;

  var runId = 0;

  // ── Originals saved ONCE at load time (never from partial state) ──
  var originals = null;
  function saveOriginals() {
    if (originals) return; // già salvati
    var quoteEl   = document.getElementById('about-quote');
    var secLabels = Array.from(document.querySelectorAll('#about-content-body .about-section-label'));
    var secBodies = Array.from(document.querySelectorAll('#about-content-body .about-section-body'));
    if (!quoteEl) return;
    originals = {
      quote:  quoteEl.innerHTML,
      labels: secLabels.map(function (el) { return el.textContent.trim(); }),
      bodies: secBodies.map(function (el) { return el.innerHTML; })
    };
  }

  function typeText(el, text, speed, done) {
    var id = runId;
    el.textContent = '';
    var i = 0;
    (function tick() {
      if (runId !== id) return;
      if (i < text.length) { el.textContent += text[i++]; setTimeout(tick, speed); }
      else if (done) done();
    })();
  }

  // Build a flat char list from HTML, each entry: { c, tag } where tag is 'strong'/'em'/null
  function parseChars(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var chars = [];
    tmp.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        Array.from(node.textContent).forEach(function (c) { chars.push({ c: c, tag: null }); });
      } else if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        Array.from(node.textContent).forEach(function (c) { chars.push({ c: c, tag: tag }); });
      }
    });
    return chars;
  }

  // Rebuild innerHTML from chars[0..n-1], grouping consecutive same-tag chars
  function charsToHTML(chars, n) {
    var html = '', j = 0;
    while (j < n) {
      var tag = chars[j].tag;
      var run = '';
      while (j < n && chars[j].tag === tag) { run += chars[j].c; j++; }
      html += tag ? '<' + tag + '>' + run + '</' + tag + '>' : run;
    }
    return html;
  }

  // Types char by char with live inline tags (bold/em appear as typed)
  function typeHTML(el, origHTML, speed, done) {
    var id = runId;
    var chars = parseChars(origHTML);
    el.innerHTML = '';
    var i = 0;
    (function tick() {
      if (runId !== id) return;
      if (i < chars.length) { i++; el.innerHTML = charsToHTML(chars, i); setTimeout(tick, speed); }
      else { el.innerHTML = origHTML; if (done) done(); }
    })();
  }

  window._aboutTypewrite = function () {
    ++runId;

    var roleEl     = document.getElementById('about-role');
    var quoteEl    = document.getElementById('about-quote');
    var contactBtn = document.getElementById('about-contact-btn');
    if (!roleEl) return;

    // Salva gli originali la prima volta (sempre dal DOM intatto)
    saveOriginals();
    if (!originals) return;

    var secLabels = Array.from(document.querySelectorAll('#about-content-body .about-section-label'));
    var secBodies = Array.from(document.querySelectorAll('#about-content-body .about-section-body'));
    var tags      = Array.from(document.querySelectorAll('#about-content-body .about-tag'));

    // Pixel reveal per NIC VELTRONI
    window._aboutPixelReveal && window._aboutPixelReveal();

    // Mostra tutto immediatamente senza typewriter
    roleEl.textContent = 'Product Designer · 22 yrs. Based in Berlin';
    quoteEl.innerHTML  = originals.quote;
    secLabels.forEach(function (el, i) { el.textContent = originals.labels[i] || ''; });
    secBodies.forEach(function (el, i) { el.innerHTML   = originals.bodies[i] || ''; });
    tags.forEach(function (el) { el.style.opacity = '1'; });

    // Mostra subito i bottoni
    var continua = document.getElementById('about-continua');
    if (continua) {
      continua.style.pointerEvents = 'auto';
      continua.style.opacity = '1';
      continua.onclick = function () { _swapToSection2(); };
    }
    if (contactBtn) {
      contactBtn.style.opacity = '1';
      contactBtn.style.pointerEvents = 'auto';
    }
    var backBtn = document.getElementById('about-back-s1');
    if (backBtn) backBtn.onclick = function () { _swapToSection1(); };
  };

  function _swapToSection2() {
    var body     = document.getElementById('about-content-body');
    var section2 = document.getElementById('about-section-2');
    var continua = document.getElementById('about-continua');
    var backBtn  = document.getElementById('about-back-s1');
    if (!body || !section2) return;

    body.style.opacity     = '0';
    continua.style.opacity = '0';

    setTimeout(function () {
      body.style.display     = 'none';
      continua.style.display = 'none';

      section2.style.display = 'block';

      if (backBtn) {
        backBtn.style.display       = 'block';
        backBtn.style.pointerEvents = 'auto';
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          section2.style.opacity = '1';
          if (backBtn) backBtn.style.opacity = '1';
        });
      });
    }, 420);
  }

  function _swapToSection1() {
    var body     = document.getElementById('about-content-body');
    var section2 = document.getElementById('about-section-2');
    var continua = document.getElementById('about-continua');
    var backBtn  = document.getElementById('about-back-s1');
    if (!body || !section2) return;

    section2.style.opacity = '0';
    if (backBtn) backBtn.style.opacity = '0';

    setTimeout(function () {
      section2.style.display = 'none';
      if (backBtn) { backBtn.style.display = 'none'; backBtn.style.pointerEvents = 'none'; }

      body.style.display     = '';
      continua.style.display = '';

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          body.style.opacity     = '1';
          continua.style.opacity = '1';
        });
      });
    }, 420);
  }

  // ── Dots animation on Continue button ──
  (function () {
    var states = ['.', '..', '...', ''];
    [
      document.getElementById('about-continua-dots'),
      document.getElementById('about-back-dots')
    ].forEach(function (dotsEl) {
      if (!dotsEl) return;
      var i = 0;
      setInterval(function () {
        i = (i + 1) % states.length;
        dotsEl.textContent = states[i];
      }, 400);
    });
  })();

  window._aboutTypewriteStop = function () {
    ++runId;
    var section2   = document.getElementById('about-section-2');
    var continua   = document.getElementById('about-continua');
    var contactBtn = document.getElementById('about-contact-btn');
    var body       = document.getElementById('about-content-body');
    var backBtn    = document.getElementById('about-back-s1');

    // Ripristina contenuto originale se disponibile
    window._aboutPixelHide && window._aboutPixelHide();
    if (originals) {
      var quoteEl   = document.getElementById('about-quote');
      var secLabels = Array.from(document.querySelectorAll('#about-content-body .about-section-label'));
      var secBodies = Array.from(document.querySelectorAll('#about-content-body .about-section-body'));
      var tags      = Array.from(document.querySelectorAll('#about-content-body .about-tag'));
      var roleEl    = document.getElementById('about-role');
      if (roleEl)  roleEl.textContent  = 'Product Designer · 22 yrs. Based in Berlin';
      if (quoteEl) quoteEl.innerHTML   = originals.quote;
      secLabels.forEach(function (el, i) { el.textContent = originals.labels[i] || ''; });
      secBodies.forEach(function (el, i) { el.innerHTML   = originals.bodies[i] || ''; });
      tags.forEach(function (el) { el.style.opacity = ''; el.style.transition = ''; });
    }

    if (body)       { body.style.display = ''; body.style.opacity = ''; }
    if (section2)   { section2.style.display = 'none'; section2.style.opacity = '0'; }
    if (continua)   { continua.style.display = ''; continua.style.opacity = '0'; continua.style.pointerEvents = 'none'; continua.onclick = null; }
    if (backBtn)    { backBtn.style.display = 'none'; backBtn.style.opacity = '0'; backBtn.style.pointerEvents = 'none'; backBtn.onclick = null; }
    if (contactBtn) { contactBtn.style.display = ''; contactBtn.style.opacity = ''; }
  };
})();
