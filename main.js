/* ==========================================================================
   Wasim Akram Portfolio v2 — main.js
   Handles: sticky header · mobile drawer · active nav · clipboard copy ·
            Web3Forms async contact form · AOS · GSAP hero entrance
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------------------
     A. UTILITIES
  ----------------------------------------------------------------------- */

  /** Show the global bottom toast notification */
  function showToast(msg, type = 'success') {
    const toast    = document.getElementById('global-toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = toast.querySelector('.toast-icon');
    if (!toast) return;

    toastMsg.textContent = msg;
    toastIcon.className = type === 'error'
      ? 'fa-solid fa-triangle-exclamation toast-icon'
      : 'fa-solid fa-circle-check toast-icon';
    toastIcon.style.color = type === 'error' ? 'var(--red)' : 'var(--green)';

    toast.classList.add('show');
    clearTimeout(toast._toastTimer);
    toast._toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /** Copy text to clipboard (with fallback) */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for HTTP / older browsers
    return new Promise((resolve, reject) => {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      ok ? resolve() : reject(new Error('execCommand failed'));
    });
  }

  /* -----------------------------------------------------------------------
     B. STICKY HEADER
  ----------------------------------------------------------------------- */
  const header = document.getElementById('site-header');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  /* -----------------------------------------------------------------------
     C. MOBILE DRAWER
  ----------------------------------------------------------------------- */
  const hamburger    = document.getElementById('hamburger');
  const drawer       = document.getElementById('mobile-drawer');
  const overlay      = document.getElementById('mobile-overlay');
  const drawerClose  = document.getElementById('drawer-close');
  const drawerLinks  = drawer.querySelectorAll('.drawer-link, .drawer-cta a');

  function openDrawer() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
  }

  function closeDrawer() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
  }

  hamburger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });


  /* -----------------------------------------------------------------------
     D. ACTIVE NAV LINK — Intersection Observer
  ----------------------------------------------------------------------- */
  const sections     = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileLinks  = document.querySelectorAll('.mobile-drawer .drawer-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      desktopLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('data-section') === id);
      });
      mobileLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    });
  }, {
    rootMargin: '-35% 0px -50% 0px',
    threshold: 0,
  });

  sections.forEach(s => navObserver.observe(s));


  /* -----------------------------------------------------------------------
     E. CLIPBOARD COPY — HERO EMAIL BUTTON
  ----------------------------------------------------------------------- */
  const EMAIL = 'eng.wasimakram@live.com';

  const btnHeroCopy = document.getElementById('btn-hero-copy-email');
  if (btnHeroCopy) {
    btnHeroCopy.addEventListener('click', () => {
      copyToClipboard(EMAIL)
        .then(() => showToast('Email copied to clipboard!'))
        .catch(() => showToast('Copy failed — please copy manually.', 'error'));
    });
  }


  /* -----------------------------------------------------------------------
     F. CLIPBOARD COPY — CONTACT SECTION EMAIL BUTTON
  ----------------------------------------------------------------------- */
  const btnCopyContact = document.getElementById('btn-copy-email-contact');
  const copyIconState  = document.getElementById('copy-icon-state');

  if (btnCopyContact) {
    btnCopyContact.addEventListener('click', () => {
      copyToClipboard(EMAIL)
        .then(() => {
          showToast('Email copied to clipboard!');
          // Briefly change icon to checkmark
          if (copyIconState) {
            copyIconState.className = 'fa-solid fa-check';
            setTimeout(() => {
              copyIconState.className = 'fa-regular fa-copy';
            }, 2000);
          }
        })
        .catch(() => showToast('Copy failed — please copy manually.', 'error'));
    });
  }


  /* -----------------------------------------------------------------------
     G. WEB3FORMS ASYNC CONTACT FORM
  ----------------------------------------------------------------------- */
  const contactForm   = document.getElementById('contact-form');
  const formSuccess   = document.getElementById('form-success');
  const formErrorMsg  = document.getElementById('form-error-msg');
  const btnSend       = document.getElementById('btn-send-msg');
  const btnBtnText    = btnSend ? btnSend.querySelector('.btn-text') : null;
  const btnBtnLoading = btnSend ? btnSend.querySelector('.btn-loading') : null;

  function setLoading(state) {
    if (!btnSend) return;
    btnSend.disabled = state;
    if (btnBtnText)    btnBtnText.hidden    = state;
    if (btnBtnLoading) btnBtnLoading.hidden = !state;
  }

  function clearErrors() {
    contactForm.querySelectorAll('.form-field input, .form-field textarea').forEach(el => {
      el.classList.remove('error');
    });
    contactForm.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  }

  function validateForm(data) {
    let valid = true;

    if (!data.name.trim()) {
      document.getElementById('err-name').textContent = 'Please enter your name.';
      document.getElementById('cf-name').classList.add('error');
      valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email.trim())) {
      document.getElementById('err-email').textContent = 'Please enter a valid email address.';
      document.getElementById('cf-email').classList.add('error');
      valid = false;
    }

    if (!data.subject_line.trim()) {
      document.getElementById('err-subject').textContent = 'Please enter a subject.';
      document.getElementById('cf-subject').classList.add('error');
      valid = false;
    }

    if (!data.message.trim()) {
      document.getElementById('err-message').textContent = 'Please write a message.';
      document.getElementById('cf-message').classList.add('error');
      valid = false;
    }

    return valid;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      if (!validateForm(data)) return;

      setLoading(true);
      formSuccess.hidden = true;
      formErrorMsg.hidden = true;

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          contactForm.reset();
          clearErrors();
          formSuccess.hidden = false;
          setLoading(false);
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        console.error('Form error:', err);
        formErrorMsg.hidden = false;
        setLoading(false);
      }
    });
  }

  /* -----------------------------------------------------------------------
     H. FOOTER YEAR
  ----------------------------------------------------------------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* -----------------------------------------------------------------------
     I. AOS INITIALIZATION
  ----------------------------------------------------------------------- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      offset: 80,
      duration: 750,
      easing: 'ease-out-cubic',
    });
  }


  /* -----------------------------------------------------------------------
     J. GSAP HERO ENTRANCE ANIMATION
  ----------------------------------------------------------------------- */
  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Ambient orbs fade in
    tl.fromTo('.ambient-orb',
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 'inherit', duration: 2, stagger: 0.3 },
      0
    );

    // Hero left column — staggered
    tl.fromTo('.availability-badge',
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      0.3
    );
    tl.fromTo('.hero-heading',
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      0.45
    );
    tl.fromTo('.hero-sub',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      0.6
    );
    tl.fromTo('.hero-cta-row .btn, .hero-cta-row .btn-copy-email',
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 },
      0.75
    );
    tl.fromTo('.hero-stats',
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      0.95
    );

    // Hero right panel
    tl.fromTo('.code-panel',
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9 },
      0.5
    );
    tl.fromTo('.tech-badge',
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15 },
      0.85
    );
  }

}); // end DOMContentLoaded
