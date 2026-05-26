(function () {
  'use strict';

  var panel  = document.getElementById('contact-panel');
  var back   = document.getElementById('contact-back');
  if (!panel) return;

  function openContact() {
    panel.style.display = 'block';
    panel.style.opacity = '0';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        panel.style.transition = 'opacity 0.2s ease';
        panel.style.opacity = '1';
      });
    });
    document.body.classList.add('panel-open');
    document.getElementById('main-header').classList.remove('hero-nav');
    setTimeout(function () {
      window._contactPixelReveal && window._contactPixelReveal();
    }, 100);
  }

  function closeContact(onDone) {
    panel.style.transition = 'opacity 0.35s ease';
    panel.style.opacity = '0';
    setTimeout(function () {
      panel.style.display = 'none';
      panel.style.transition = '';
      document.body.classList.remove('panel-open');
      var ps = document.getElementById('page-scroll');
      if (ps) ps.dispatchEvent(new Event('scroll'));
      if (onDone) onDone();
    }, 380);
  }

  // Expose globally so other modules (nav Work) can call it
  window._closeContact = closeContact;
  window._isContactOpen = function () { return panel.style.display === 'block'; };

  // Back button
  if (back) back.addEventListener('click', closeContact);

  // All "Contact" nav links — toggle behaviour
  document.querySelectorAll('nav a, .tb-link, .mobile-contact-btn').forEach(function (a) {
    if (a.textContent.trim() === 'Contact') {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (panel.style.display === 'block') { closeContact(); return; }
        openContact();
      });
    }
  });

  // "Get in touch" buttons throughout the site
  document.querySelectorAll('.js-open-contact').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openContact();
    });
  });

  // ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.style.display === 'block') closeContact();
  });
})();
