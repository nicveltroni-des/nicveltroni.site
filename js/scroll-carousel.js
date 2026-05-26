// ── Scroll-driven marquee carousels (desktop only) ──
// Replaces CSS animation with a JS RAF loop.
// Auto-scrolls at base speed; wheel events on the last section add velocity.
(function () {
  'use strict';

  if (window.innerWidth <= 768) return; // desktop only

  var FRICTION    = 0.90;  // velocity decay per frame
  var SCROLL_MULT = 0.25;  // wheel deltaY → carousel speed multiplier

  function setup(scrollerId, carouselScreenId, trackSelector, baseSpeed) {
    var scroller = document.getElementById(scrollerId);
    var screen   = document.getElementById(carouselScreenId);
    var track    = document.querySelector(trackSelector);
    if (!scroller || !screen || !track) return;

    var offset   = 0;
    var velocity = 0;

    // Stop CSS animation — we take full control
    track.style.animation = 'none';
    track.style.willChange = 'transform';

    // ── RAF auto-scroll loop ──
    function tick() {
      requestAnimationFrame(tick);

      // Only scroll when a panel is actually open and visible
      if (!document.body.classList.contains('panel-open')) return;

      // Wait until images are loaded (lazy-load: scrollWidth is 0 until visible)
      var halfW = track.scrollWidth * 0.5;
      if (halfW <= 0) return;

      velocity *= FRICTION;
      offset   -= baseSpeed + velocity;

      // Seamless wrap: content is duplicated → loop at -50% of total width
      if (-offset >= halfW) offset += halfW;
      if (offset  > 0)      offset  = 0;

      track.style.transform = 'translate3d(' + offset + 'px,0,0)';
    }
    tick();

    // ── Detect when carousel section is snapped/visible ──
    var carouselVisible = false;
    var io = new IntersectionObserver(function (entries) {
      carouselVisible = entries[0].isIntersecting;
    }, { root: scroller, threshold: 0.5 });
    io.observe(screen);

    // ── Wheel: accelerate when on carousel section at bottom ──
    scroller.addEventListener('wheel', function (e) {
      if (!carouselVisible) return;
      var maxScroll = scroller.scrollHeight - scroller.clientHeight;
      if (scroller.scrollTop < maxScroll - 8) return; // not at bottom yet

      // Only intercept downward scroll — upward scroll lets user navigate back
      if (e.deltaY <= 0) return;
      e.preventDefault();
      velocity += e.deltaY * SCROLL_MULT;
    }, { passive: false });
  }

  // Wait for DOM to be ready then initialise all three marquees
  function init() {
    setup('hero-scroller',  'pnr-screen-carousel',   '.pnr-marquee-track',       0.5);
    setup('iact-scroller',  'iact-screen-carousel',  '.iact-marquee-track',      0.5);
    setup('tolean-scroller','tolean-screen-carousel','.tolean-marquee-track',    0.5);
    setup('pkit-scroller',  'pkit-screen-carousel',  '.pkit-marquee-track',      0.5);
    setup('pkit-scroller',  'pkit-screen-ux',        '.pkit-ux-marquee-track',   0.5);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
