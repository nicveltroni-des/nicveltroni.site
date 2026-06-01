// ── Hero Panels: generic open/close factory + Pro Nap + P.kit + Interact ──
// ── Mobile: wallet card hide/show + swipe-down to close ──
(function () {
  'use strict';

  var EASE      = 'cubic-bezier(0.4, 0, 0.2, 1)';
  var EASE_OPEN = 'cubic-bezier(0.34, 1.4, 0.64, 1)';
  var DUR       = 500;
  var DUR_OPEN  = 950;
  var IS_MOBILE = window.innerWidth <= 768;

  // ── Shared helpers ──

  function revealRects(containerId) {
    var rects = Array.from(document.querySelectorAll('#' + containerId + ' rect'));
    if (!rects.length) return;
    rects.forEach(function (r) { r.setAttribute('opacity', '0'); });
    rects.slice().sort(function () { return Math.random() - 0.5; })
      .forEach(function (r, i) {
        setTimeout(function () { r.setAttribute('opacity', '1'); }, i * 8);
      });
  }

  function fadeUI(el, to, onDone) {
    var a = el.animate([{ opacity: 0 }, { opacity: to }],
      { duration: 200, easing: EASE, fill: 'forwards' });
    a.onfinish = function () { el.style.opacity = String(to); onDone && onDone(); };
  }

  // ── Generic panel factory ──
  function makePanel(cfg) {
    var isOpen = false;

    function open(sourceCard) {
      if (isOpen) return;
      isOpen = true;
      if (cfg.hash) history.replaceState(null, '', '#' + cfg.hash);
      document.body.classList.add('panel-open');

      // Nascondi i pixel del titolo prima che il pannello diventi visibile
      Array.from(cfg.panel.querySelectorAll('.px')).forEach(function (el) { el.style.opacity = '0'; });

      cfg.panel.style.display = 'block';
      if (cfg.scroller) cfg.scroller.scrollTop = 0;

      if (sourceCard) {
        // Animated open: scale up from the clicked card's position
        var rect = sourceCard.getBoundingClientRect();
        var vw = window.innerWidth, vh = window.innerHeight;
        var tx = rect.left + rect.width / 2 - vw / 2;
        var ty = rect.top  + rect.height / 2 - vh / 2;
        var sx = rect.width / vw, sy = rect.height / vh;

        cfg.backBtn.style.cssText = 'cursor:pointer;opacity:0;pointer-events:none;';
        if (cfg.labelWrap)  cfg.labelWrap.style.opacity = '0';
        if (cfg.scrollWrap) cfg.scrollWrap.style.opacity = '0';

        cfg.panel.animate([
          { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + sx + ',' + sy + ')',
            borderRadius: '30px' },
          { transform: 'translate(0,0) scale(1,1)', borderRadius: '0px' }
        ], { duration: DUR_OPEN, easing: EASE_OPEN, fill: 'forwards' });

        setTimeout(function () {
          if (!isOpen) return;
          cfg.backBtn.style.pointerEvents = 'all';
          fadeUI(cfg.backBtn, 1);
          if (cfg.labelWrap) {
            cfg.labelWrap.style.pointerEvents = 'auto';
            fadeUI(cfg.labelWrap, 1, function () {
              if (cfg.labelContainerId) revealRects(cfg.labelContainerId);
              cfg.onAfterOpen && cfg.onAfterOpen();
            });
          } else {
            cfg.onAfterOpen && cfg.onAfterOpen();
          }
          if (cfg.scrollWrap) fadeUI(cfg.scrollWrap, 1);
        }, 300);
      } else {
        // Direct open (no animation source) — used by hash-restore and cross-panel jumps
        cfg.panel.style.transform = 'translate(0,0) scale(1,1)';
        cfg.panel.style.opacity = '1';
        cfg.backBtn.style.cssText = 'cursor:pointer;opacity:1;pointer-events:all;';
        if (cfg.labelWrap) {
          cfg.labelWrap.style.opacity = '1';
          cfg.labelWrap.style.pointerEvents = 'auto';
          if (cfg.labelContainerId) revealRects(cfg.labelContainerId);
        }
        if (cfg.scrollWrap) cfg.scrollWrap.style.opacity = '1';
        cfg.onAfterOpen && cfg.onAfterOpen();
      }
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;

      // Mobile: ripristina panel transform (swipe-down potrebbe averlo spostato)
      if (IS_MOBILE) {
        cfg.panel.style.transform = '';
        cfg.panel.style.borderRadius = '';
      }

      var a = cfg.panel.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: DUR, easing: 'ease-in-out', fill: 'forwards' });
      a.onfinish = function () {
        cfg.panel.style.display = 'none';
        cfg.panel.style.opacity = '';
        document.body.classList.remove('panel-open', 'screen-white');
        cfg.panel.getAnimations().forEach(function (anim) { anim.cancel(); });
        if (cfg.scroller) cfg.scroller.scrollTop = 0;
        cfg.onClose && cfg.onClose();
        window._logoReveal && window._logoReveal();
        if (cfg.hash) history.replaceState(null, '', location.pathname);
      };
    }

    // ── Back button click ──
    cfg.backBtn.addEventListener('click', function () {
      cfg.backBtn.animate([
        { transform: 'translateX(0px)' },
        { transform: 'translateX(-8px)' },
        { transform: 'translateX(0px)' }
      ], { duration: 320, easing: EASE }).onfinish = close;
    });

    // ── Escape key ──
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });

    // ── Scroll handler (desktop + mobile) ──
    if (cfg.scroller && cfg.scrollHandler) {
      cfg.scroller.addEventListener('scroll', function () {
        cfg.scrollHandler(isOpen);
      });
    }

    // ── Mobile: swipe-down to close ──
    if (IS_MOBILE && cfg.scroller) {
      var pullY = 0, isPulling = false, pullDist = 0;

      cfg.scroller.addEventListener('touchstart', function (e) {
        if (isOpen && cfg.scroller.scrollTop <= 2) {
          pullY = e.touches[0].clientY;
          isPulling = true;
          pullDist = 0;
        }
      }, { passive: true });

      cfg.scroller.addEventListener('touchmove', function (e) {
        if (!isPulling || !isOpen) return;
        var dy = e.touches[0].clientY - pullY;
        if (dy > 0 && cfg.scroller.scrollTop <= 0) {
          pullDist = dy;
          // Effetto pull-down visivo: panel scende e si arrotonda
          var translate = pullDist * 0.45;
          var radius = Math.min(pullDist * 0.12, 24);
          var scale = Math.max(0.92, 1 - pullDist / 2000);
          var opacity = Math.max(0.6, 1 - pullDist / 500);
          cfg.panel.style.transform = 'translate3d(0,' + translate + 'px,0) scale(' + scale + ')';
          cfg.panel.style.borderRadius = radius + 'px';
          cfg.panel.style.opacity = String(opacity);
          e.preventDefault();
        } else if (dy <= 0) {
          isPulling = false;
          cfg.panel.style.transform = '';
          cfg.panel.style.borderRadius = '';
          cfg.panel.style.opacity = '';
        }
      }, { passive: false });

      cfg.scroller.addEventListener('touchend', function () {
        if (!isPulling) return;
        isPulling = false;
        if (pullDist > 100) {
          // Soglia superata → chiudi
          close();
        } else {
          // Snap back
          cfg.panel.style.transition = 'transform 0.3s ease, border-radius 0.3s ease, opacity 0.3s ease';
          cfg.panel.style.transform = '';
          cfg.panel.style.borderRadius = '';
          cfg.panel.style.opacity = '';
          setTimeout(function () { cfg.panel.style.transition = ''; }, 300);
        }
      });
    }

    function closeInstant() {
      if (!isOpen) return;
      isOpen = false;
      cfg.panel.getAnimations().forEach(function (anim) { anim.cancel(); });
      cfg.panel.style.display = 'none';
      cfg.panel.style.opacity = '';
      cfg.panel.style.transform = '';
      if (cfg.scroller) cfg.scroller.scrollTop = 0;
      cfg.onClose && cfg.onClose();
      if (cfg.hash) history.replaceState(null, '', location.pathname);
      // NON rimuove panel-open: il pannello successivo lo mantiene attivo
    }

    return { open: open, close: close, closeInstant: closeInstant, isOpen: function () { return isOpen; } };
  }

  // ══════════════════════════════════════════════
  //  Pro Nap panel
  // ══════════════════════════════════════════════
  window._heroLabelReveal = function () { revealRects('hero-pnr-container'); };

  var proNapScroller = document.getElementById('hero-scroller');
  var pnrLabelWrap   = document.getElementById('hero-label-wrap');
  var pnrScrollWrap  = document.getElementById('hero-scroll');

  var proNap = makePanel({
    panel:            document.getElementById('hero-panel'),
    backBtn:          document.getElementById('hero-back'),
    labelWrap:        pnrLabelWrap,
    labelContainerId: 'hero-pnr-container',
    scrollWrap:       pnrScrollWrap,
    scroller:         proNapScroller,
    hash:             'pronap',
    onAfterOpen: function () {
      window._logoReveal && window._logoReveal();
      setTimeout(function () { window._pnrPixelReveal && window._pnrPixelReveal(); }, 450);
    },
    scrollHandler: function (isOpen) {
      var st = proNapScroller.scrollTop, vh = window.innerHeight;
      var on2 = st > vh * 0.5;

      pnrLabelWrap.style.opacity  = on2 ? '0' : (isOpen ? '1' : '0');
      pnrScrollWrap.style.opacity = on2 ? '0' : (isOpen ? '1' : '0');
    }
  });



  // ── Scroll-driven crossfade: screens 4 → 5 → 6 ──
  (function () {
    var scroller = document.getElementById('hero-scroller');
    var stack    = document.getElementById('pnr-stack');
    var s4 = document.getElementById('pnr-screen-4');
    var s5 = document.getElementById('pnr-screen-5');
    var s6 = document.getElementById('pnr-screen-6');
    if (!scroller || !stack || !s4 || !s5 || !s6) return;

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

    var cur4 = 1, cur5 = 0, cur6 = 0;
    var tgt4 = 1, tgt5 = 0, tgt6 = 0;
    var rafId = null;
    var LERP = 0.1;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function tick() {
      cur4 = lerp(cur4, tgt4, LERP);
      cur5 = lerp(cur5, tgt5, LERP);
      cur6 = lerp(cur6, tgt6, LERP);
      s4.style.opacity = cur4;
      s5.style.opacity = cur5;
      s6.style.opacity = cur6;
      if (Math.abs(cur4 - tgt4) > 0.002 || Math.abs(cur5 - tgt5) > 0.002 || Math.abs(cur6 - tgt6) > 0.002) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    scroller.addEventListener('scroll', function () {
      var sr = scroller.getBoundingClientRect();
      var st = stack.getBoundingClientRect();
      var scrolled = sr.top - st.top;
      var vh = scroller.clientHeight;
      var FADE = vh * 0.25;

      var p1 = clamp((scrolled - vh * 0.4) / FADE, 0, 1);
      var p2 = clamp((scrolled - vh * 1.2) / FADE, 0, 1);

      tgt4 = 1 - p1;
      tgt5 = Math.min(p1, 1 - p2);
      tgt6 = p2;

      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });
  })();

  // ── Pro Nap: navbar nera sulle sezioni chiare (2,3,7,8,carousel,12) ──
  (function () {
    var lightIds = ['pnr-screen-2', 'pnr-screen-3', 'pnr-screen-7', 'pnr-screen-8', 'pnr-screen-carousel', 'pnr-screen-12', 'pnr-screen-others'];
    var active = new Set();
    var navH = 60;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) active.add(e.target.id);
        else active.delete(e.target.id);
      });
      document.body.classList.toggle('screen-white', active.size > 0);
    }, {
      rootMargin: '-' + navH + 'px 0px -' + (window.innerHeight - navH - 1) + 'px 0px'
    });
    lightIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  })();

  // ══════════════════════════════════════════════
  //  P.kit panel
  // ══════════════════════════════════════════════
  var pkitScroller = document.getElementById('pkit-scroller');

  var pkit = makePanel({
    panel:     document.getElementById('pkit-panel'),
    backBtn:   document.getElementById('pkit-back'),
    labelWrap: document.getElementById('pkit-label-wrap'),
    scroller:  pkitScroller,
    hash:      'pkit',
    onAfterOpen: function () {
      setTimeout(function () { window._pkitPixelReveal && window._pkitPixelReveal(); }, 450);
    },
    scrollHandler: function (isOpen) {
      var st  = pkitScroller.scrollTop;
      var vh  = window.innerHeight;
      var on2 = st > vh * 0.5;
      var on3 = st > vh * 1.5;
      document.body.classList.toggle('screen-white', on2);
    }
  });

  // ══════════════════════════════════════════════
  //  Interact panel
  // ══════════════════════════════════════════════
  var iactScroller = document.getElementById('iact-scroller');
  var iactVideos = Array.from(document.querySelectorAll('.iact-video-section video'));

  // ── Slideshow animation trigger: start only when section is visible ──
  var slideshowScreens = ['iact-screen-5', 'iact-screen-6', 'iact-screen-7'];
  if ('IntersectionObserver' in window) {
    var slideshowObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('is-animating');
        } else {
          el.classList.remove('is-animating');
        }
      });
    }, { threshold: 0.4, root: iactScroller });
    slideshowScreens.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) slideshowObs.observe(el);
    });
  }

  var iact = makePanel({
    panel:    document.getElementById('iact-panel'),
    backBtn:  document.getElementById('iact-back'),
    scroller:  iactScroller,
    hash:     'interact',
    onAfterOpen: function () {
      document.body.classList.add('iact-open');
      iactVideos.forEach(function (v) { v.play(); });
      setTimeout(function () { window._iactPixelReveal && window._iactPixelReveal(); }, 450);
    },
    onClose: function () {
      document.body.classList.remove('iact-open');
      iactVideos.forEach(function (v) { v.pause(); v.currentTime = 0; });
    }
  });

  // ── Interact: navbar nera+rossa sulle sezioni chiare (4,5,6,7,others) ──
  (function () {
    var lightIds = ['iact-screen-4', 'iact-screen-5', 'iact-screen-6', 'iact-screen-7', 'iact-screen-others'];
    var active = new Set();
    var navH = 60;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) active.add(e.target.id);
        else active.delete(e.target.id);
      });
      document.body.classList.toggle('screen-white', active.size > 0);
    }, {
      rootMargin: '-' + navH + 'px 0px -' + (window.innerHeight - navH - 1) + 'px 0px'
    });
    lightIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  })();

  // ══════════════════════════════════════════════
  //  Header click: close whichever panel is open
  // ══════════════════════════════════════════════
  document.getElementById('main-header').addEventListener('click', function (e) {
    if (e.target.closest('nav') || e.target.closest('a')) return;
    if (proNap.isOpen())        proNap.close();
    else if (pkit.isOpen())    pkit.close();
    else if (iact.isOpen())    iact.close();
    else if (tolean.isOpen())  tolean.close();
    else window.location.href = window.location.pathname;
  });

  // ══════════════════════════════════════════════
  //  Nav "Work" → scroll to carousel from any page
  // ══════════════════════════════════════════════
  var navWork    = document.getElementById('nav-work');
  var pageScroll = document.getElementById('page-scroll');
  var carouselEl = document.getElementById('carousel-section');
  if (navWork && pageScroll && carouselEl) {
    navWork.addEventListener('click', function (e) {
      e.preventDefault();
      function scrollToCarousel() {
        pageScroll.scrollTo({ top: carouselEl.offsetTop, behavior: 'smooth' });
      }
      if (proNap.isOpen()) {
        proNap.close(); setTimeout(scrollToCarousel, 550);
      } else if (pkit.isOpen()) {
        pkit.close(); setTimeout(scrollToCarousel, 550);
      } else if (iact.isOpen()) {
        iact.close(); setTimeout(scrollToCarousel, 550);
      } else if (tolean.isOpen()) {
        tolean.close(); setTimeout(scrollToCarousel, 550);
      } else if (isAboutOpen) {
        closeAbout(); setTimeout(scrollToCarousel, 450);
      } else if (window._isContactOpen && window._isContactOpen()) {
        window._closeContact(scrollToCarousel);
      } else {
        scrollToCarousel();
      }
    });
  }

  // Resolve a media element's source, accounting for lazy-loaded data-src.
  function resolveSrc(el) {
    if (el.getAttribute('src')) return el.src;
    var d = el.getAttribute('data-src');
    return d ? new URL(d, location.href).href : el.src;
  }

  // ══════════════════════════════════════════════
  //  Lightbox factory (shared by PNR, PKIT, Tolean, Interact)
  // ══════════════════════════════════════════════
  function makeLightbox(cfg) {
    var box   = document.getElementById(cfg.prefix + '-lightbox');
    var img   = document.getElementById(cfg.prefix + '-lightbox-img');
    var video = cfg.hasVideo ? document.getElementById(cfg.prefix + '-lightbox-video') : null;
    var close = document.getElementById(cfg.prefix + '-lightbox-close');
    var prev  = document.getElementById(cfg.prefix + '-lightbox-prev');
    var next  = document.getElementById(cfg.prefix + '-lightbox-next');
    var track = document.querySelector(cfg.trackSelector);
    if (!box || !track) return;

    var items = [], index = 0;

    if (cfg.buildItems) {
      items = cfg.buildItems(track);
    }

    function showMedia(item) {
      if (video && item.type === 'video') {
        img.style.display = 'none';
        video.style.display = 'block';
        video.src = item.src;
        video.load();
        video.play();
        if (video) video.style.opacity = '1';
      } else {
        if (video) { video.pause(); video.src = ''; video.style.display = 'none'; }
        img.style.display = 'block';
        img.src = item.src;
        img.style.opacity = '1';
      }
    }

    function showItem(idx) {
      index = (idx + items.length) % items.length;
      img.style.opacity = '0';
      if (video) video.style.opacity = '0';
      setTimeout(function () { showMedia(items[index]); }, 120);
    }

    function openBox(el) {
      var src = resolveSrc(el);
      var type = el.tagName === 'VIDEO' ? 'video' : 'img';
      var idx = items.findIndex(function (i) { return i.src === src && i.type === type; });
      index = idx >= 0 ? idx : 0;
      img.style.opacity = '1';
      if (video) video.style.opacity = '1';
      showMedia(items[index]);
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
      cfg.onOpen && cfg.onOpen(track);
    }

    function closeBox() {
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
      if (video) { video.pause(); video.src = ''; }
      setTimeout(function () { img.src = ''; }, 300);
      cfg.onClose && cfg.onClose(track);
    }

    img.style.transition = 'opacity 0.12s ease';
    if (video) { video.style.transition = 'opacity 0.12s ease'; video.style.display = 'none'; }

    track.addEventListener('click', function (e) {
      var el = e.target.closest(cfg.hasVideo ? 'img, video' : 'img');
      if (el) openBox(el);
    });
    close.addEventListener('click', closeBox);
    prev.addEventListener('click', function () { showItem(index - 1); });
    next.addEventListener('click', function () { showItem(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape')     closeBox();
      if (e.key === 'ArrowLeft')  showItem(index - 1);
      if (e.key === 'ArrowRight') showItem(index + 1);
    });
  }

  // ── Lightbox: Pro Nap carousel ──
  makeLightbox({
    prefix: 'pnr',
    trackSelector: '.pnr-marquee-track',
    hasVideo: true,
    buildItems: function (track) {
      var els = Array.from(track.children);
      return els.slice(0, Math.floor(els.length / 2)).map(function (el) {
        var media = el.querySelector('img, video') || el;
        return { type: media.tagName === 'VIDEO' ? 'video' : 'img', src: resolveSrc(media) };
      });
    }
  });

  // ── Lightbox: P.Kit carousel ──
  makeLightbox({
    prefix: 'pkit',
    trackSelector: '.pkit-marquee-track',
    hasVideo: true,
    buildItems: function (track) {
      var els = Array.from(track.children);
      return els.slice(0, Math.floor(els.length / 2)).map(function (el) {
        var media = el.querySelector('img, video') || el;
        return { type: media.tagName === 'VIDEO' ? 'video' : 'img', src: media.src };
      });
    }
  });

  // ══════════════════════════════════════════════
  //  Tolean panel
  // ══════════════════════════════════════════════
  var tolean = makePanel({
    panel:     document.getElementById('tolean-panel'),
    backBtn:   document.getElementById('tolean-back'),
    scroller:  document.getElementById('tolean-scroller'),
    hash:      'tolean',
    onAfterOpen: function () {
      setTimeout(function () { window._toleanPixelReveal && window._toleanPixelReveal(); }, 450);
    }
  });

  // ══════════════════════════════════════════════
  //  Mobile: swipe-up at bottom → next project
  // ══════════════════════════════════════════════
  if (IS_MOBILE) {
    var nextMap = [
      { panel: iact,   scroller: document.getElementById('iact-scroller'),   next: function () { pkit.open(); } },
      { panel: pkit,   scroller: document.getElementById('pkit-scroller'),   next: function () { proNap.open(); } },
      { panel: proNap, scroller: document.getElementById('hero-scroller'),   next: function () { tolean.open(); } },
      { panel: tolean, scroller: document.getElementById('tolean-scroller'), next: function () { openAbout(); } }
    ];

    nextMap.forEach(function (entry) {
      var scroller = entry.scroller;
      if (!scroller) return;

      var startY = 0, startScrollTop = 0;

      scroller.addEventListener('touchstart', function (e) {
        startY = e.touches[0].clientY;
        startScrollTop = scroller.scrollTop;
      }, { passive: true });

      scroller.addEventListener('touchend', function (e) {
        if (!entry.panel.isOpen()) return;
        var endY = e.changedTouches[0].clientY;
        var swipeUp = startY - endY;
        var maxScroll = scroller.scrollHeight - scroller.clientHeight;
        var wasAtBottom = maxScroll > 0 && startScrollTop >= maxScroll - 20;
        if (wasAtBottom && swipeUp > 50) {
          entry.panel.close();
          setTimeout(entry.next, 500);
        }
      }, { passive: true });
    });
  }

  // ══════════════════════════════════════════════
  //  About panel
  // ══════════════════════════════════════════════
  var aboutPanel  = document.getElementById('about-panel');
  var aboutBack   = document.getElementById('about-back');
  var isAboutOpen = false;

  function openAbout() {
    if (isAboutOpen) return;
    isAboutOpen = true;
    document.body.classList.add('panel-open');
    document.getElementById('main-header').classList.remove('hero-nav');
    window._aboutPixelHide && window._aboutPixelHide();
    aboutPanel.style.display = 'block';
    aboutPanel.scrollTop = 0;
    aboutBack.style.cssText = 'cursor:pointer;opacity:0;pointer-events:none;';
    aboutPanel.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
    setTimeout(function () {
      if (!isAboutOpen) return;
      aboutBack.style.pointerEvents = 'all';
      fadeUI(aboutBack, 1);
    }, 300);
    setTimeout(function () {
      if (!isAboutOpen) return;
      window._aboutTypewrite && window._aboutTypewrite();
    }, 250);
  }

  function closeAbout() {
    if (!isAboutOpen) return;
    isAboutOpen = false;
    window._aboutTypewriteStop && window._aboutTypewriteStop();
    var a = aboutPanel.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: 400, easing: 'ease-in-out', fill: 'forwards' });
    a.onfinish = function () {
      aboutPanel.style.display = 'none';
      aboutPanel.style.opacity = '';
      aboutPanel.getAnimations().forEach(function (anim) { anim.cancel(); });
      document.body.classList.remove('panel-open', 'screen-white');
      var ps = document.getElementById('page-scroll');
      if (ps) ps.dispatchEvent(new Event('scroll'));
      window._logoReveal && window._logoReveal();
    };
  }

  aboutBack.addEventListener('click', function () {
    aboutBack.animate([
      { transform: 'translateX(0px)' },
      { transform: 'translateX(-8px)' },
      { transform: 'translateX(0px)' }
    ], { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }).onfinish = closeAbout;
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isAboutOpen) closeAbout();
  });

  // Nav "About" click
  Array.from(document.querySelectorAll('a')).forEach(function (a) {
    if (a.textContent.trim() === 'About') {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (isAboutOpen) { closeAbout(); return; }
        if (proNap.isOpen()) { proNap.close(); setTimeout(openAbout, 550); return; }
        if (pkit.isOpen())  { pkit.close();  setTimeout(openAbout, 550); return; }
        if (iact.isOpen())  { iact.close();  setTimeout(openAbout, 550); return; }
        if (window._closeContact) { window._closeContact(openAbout); return; }
        openAbout();
      });
    }
  });

  // ── Lightbox: Tolean carousel ──
  makeLightbox({
    prefix: 'tolean',
    trackSelector: '.tolean-marquee-track',
    hasVideo: true,
    buildItems: function (track) {
      var els = Array.from(track.children);
      return els.slice(0, Math.floor(els.length / 2)).map(function (el) {
        return { type: el.tagName === 'VIDEO' ? 'video' : 'img', src: resolveSrc(el) };
      });
    },
    onOpen: function (track) {
      track.style.animationPlayState = 'paused';
      Array.from(track.querySelectorAll('video')).forEach(function (v) { v.muted = true; });
    },
    onClose: function (track) {
      track.style.animationPlayState = 'running';
      Array.from(track.querySelectorAll('video')).forEach(function (v) {
        v.muted = true;
        v.play().catch(function () {});
      });
    }
  });

  // ── Lightbox: Interact carousel (images only) ──
  makeLightbox({
    prefix: 'iact',
    trackSelector: '.iact-marquee-track',
    hasVideo: false,
    buildItems: function (track) {
      var imgs = Array.from(track.querySelectorAll('img'));
      return imgs.slice(0, imgs.length / 2).map(function (i) {
        return { type: 'img', src: i.src };
      });
    },
    onOpen: function (track) { track.style.animationPlayState = 'paused'; },
    onClose: function (track) { track.style.animationPlayState = 'running'; }
  });

  // ══════════════════════════════════════════════
  //  Mobile toolbar "Work" link
  // ══════════════════════════════════════════════
  var tbWork = document.getElementById('tb-work');
  if (tbWork) {
    tbWork.addEventListener('click', function (e) {
      e.preventDefault();
      if (proNap.isOpen())       proNap.close();
      else if (pkit.isOpen())    pkit.close();
      else if (iact.isOpen())    iact.close();
      else if (tolean.isOpen())  tolean.close();
    });
  }

  // ── P.KIT carousel: drag-to-scroll orizzontale ──
  (function () {
    var marquee = document.querySelector('#pkit-screen-carousel .pkit-marquee');
    if (!marquee) return;
    var isDown = false, startX = 0, scrollLeft = 0;

    // blocca wheel sul carosello — lo scroll verticale passa al pkit-scroller
    marquee.addEventListener('wheel', function (e) {
      e.preventDefault();
    }, { passive: false });

    marquee.addEventListener('mousedown', function (e) {
      isDown = true;
      marquee.classList.add('is-dragging');
      startX = e.pageX - marquee.offsetLeft;
      scrollLeft = marquee.scrollLeft;
      e.preventDefault();
    });
    document.addEventListener('mouseup', function () {
      if (!isDown) return;
      isDown = false;
      marquee.classList.remove('is-dragging');
    });
    document.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      var x = e.pageX - marquee.offsetLeft;
      marquee.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  })();

  // ── Pro Nap marquee drag ──
  (function () {
    var marquee = document.querySelector('#pnr-screen-carousel .pnr-marquee');
    if (!marquee) return;
    var isDown = false, startX = 0, scrollLeft = 0;
    marquee.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });
    marquee.addEventListener('mousedown', function (e) {
      isDown = true;
      marquee.classList.add('is-dragging');
      startX = e.pageX - marquee.offsetLeft;
      scrollLeft = marquee.scrollLeft;
      e.preventDefault();
    });
    document.addEventListener('mouseup', function () {
      if (!isDown) return;
      isDown = false;
      marquee.classList.remove('is-dragging');
    });
    document.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      var x = e.pageX - marquee.offsetLeft;
      marquee.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  })();

  // ── Ripristina il pannello dall'URL hash al refresh ──
  (function () {
    var hash = location.hash.replace('#', '');
    if      (hash === 'pronap')   proNap.open();
    else if (hash === 'pkit')     pkit.open();
    else if (hash === 'interact') iact.open();
    else if (hash === 'tolean')   tolean.open();
    document.documentElement.classList.remove('panel-preload');
  })();

  // ── Global "open project panel" handler ──
  // Catches all <a class="js-open-{slug}"> links — home cards + "See other projects" cards
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[class*="js-open-"]');
    if (!a) return;
    e.preventDefault();
    var target = null;
    if      (a.classList.contains('js-open-pronap'))    target = proNap;
    else if (a.classList.contains('js-open-pkit'))      target = pkit;
    else if (a.classList.contains('js-open-interact') || a.classList.contains('js-open-iact')) target = iact;
    else if (a.classList.contains('js-open-tolean'))    target = tolean;
    if (!target) return;

    function openTarget() { target.open(a); }

    if      (proNap.isOpen())  { proNap.closeInstant();  target.open(null); }
    else if (pkit.isOpen())    { pkit.closeInstant();    target.open(null); }
    else if (iact.isOpen())    { iact.closeInstant();    target.open(null); }
    else if (tolean.isOpen())  { tolean.closeInstant();  target.open(null); }
    else openTarget();
  });


})();
