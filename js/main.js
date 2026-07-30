document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header scroll state ---------- */
const header = document.getElementById('site-header');
const hero = document.getElementById('hero');
const onScroll = () => {
  const threshold = hero ? hero.offsetHeight - 96 : 24;
  if (window.scrollY > threshold) header.classList.add('is-scrolled');
  else header.classList.remove('is-scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------- Barra di progresso scroll ---------- */
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

/* Il catalogo usa <details>/<summary> nativi: l'apertura/chiusura la gestisce
   il browser da solo, nessun listener JS necessario. */

/* ---------- GSAP: reveals + parallax (skipped gracefully if reduced motion or GSAP missing) ---------- */
function revealEverythingInstantly() {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('reveal-visible'));
  document.querySelectorAll('.eyebrow-rule').forEach((r) => { r.style.transform = 'scaleX(1)'; });
  document.querySelectorAll('.cat-row').forEach((r) => r.classList.add('is-revealed'));
}

function initMotion() {
  if (typeof gsap === 'undefined') {
    // Fallback: reveal everything immediately if GSAP failed to load
    revealEverythingInstantly();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    revealEverythingInstantly();
    return;
  }

  // Scroll reveals — staggered by common parent group (fade + risalita)
  document.querySelectorAll('[data-reveal-group]:not([data-reveal-group="rows"])').forEach((group) => {
    const items = group.querySelectorAll('.reveal');
    ScrollTrigger.batch(items, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
        }),
    });
    items.forEach((el) => el.classList.add('reveal-visible-target'));
  });

  // Righe del catalogo — reveal differenziato: scorrimento laterale + barra d'accento disegnata
  document.querySelectorAll('[data-reveal-group="rows"] .cat-row.reveal').forEach((row, i) => {
    ScrollTrigger.create({
      trigger: row,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(row, { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out', delay: (i % 6) * 0.05 });
        window.setTimeout(() => row.classList.add('is-revealed'), (i % 6) * 50);
      },
    });
  });

  // Sottolineatura degli eyebrow di sezione — si disegna poco dopo la rivelazione del testo
  document.querySelectorAll('.section-eyebrow').forEach((el) => {
    const rule = el.querySelector('.eyebrow-rule');
    if (!rule) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(rule, { scaleX: 1, duration: 0.7, ease: 'power2.out', delay: 0.35 }),
    });
  });

  // Any standalone .reveal not inside a group
  document.querySelectorAll('.reveal:not([data-reveal-group] .reveal)').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
    });
  });

  // Hero entrance
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero-icon', {
      opacity: 1,
      scale: 1,
      rotate: 0,
      y: 0,
      duration: 1.15,
      ease: 'elastic.out(1, 0.65)',
      onComplete: () => {
        const ring = document.querySelector('.hero-icon-arrival-ring');
        if (ring) ring.classList.add('pulse-once');
      },
    }, 0)
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.5)
    .to('.hero-title', { opacity: 1, y: 0, duration: 0.8 }, 0.62)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.7 }, 0.78)
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.7 }, 0.9);

  // Hero parallax layers (subtle, background-only — never on text/controls)
  gsap.utils.toArray('.hero-layer').forEach((layer) => {
    const speed = parseFloat(layer.dataset.speed || '0');
    gsap.to(layer, {
      yPercent: speed,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion);
} else {
  initMotion();
}

/* ---------- Footer year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Widget WhatsApp flottante: popup con messaggio personalizzabile ---------- */
(function whatsappWidget() {
  const widget = document.getElementById('wa-widget');
  const floatBtn = document.getElementById('wa-float-btn');
  const popup = document.getElementById('wa-popup');
  const closeBtn = document.getElementById('wa-popup-close');
  const textarea = document.getElementById('wa-popup-text');
  const sendBtn = document.getElementById('wa-popup-send');
  if (!widget || !floatBtn || !popup || !textarea || !sendBtn) return;

  const PHONE = '393475388984';
  const DEFAULT_MESSAGE = 'Ciao, vorrei avere informazioni sui vostri prodotti.';
  let closeTimer = null;

  function cancelScheduledClose() {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  }
  function openPopup() {
    cancelScheduledClose();
    widget.classList.add('is-open');
    floatBtn.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => textarea.focus(), 50);
  }
  function closePopup() {
    cancelScheduledClose();
    widget.classList.remove('is-open');
    floatBtn.setAttribute('aria-expanded', 'false');
  }
  function scheduleClose() {
    cancelScheduledClose();
    closeTimer = window.setTimeout(closePopup, 220);
  }

  /* Hover del mouse: apre/chiude con un piccolo ritardo, per non chiudersi mentre
     il cursore attraversa lo spazio vuoto tra bottone e popup (il popup è staccato
     visivamente dal bottone tramite position:absolute). */
  widget.addEventListener('mouseenter', openPopup);
  widget.addEventListener('mouseleave', scheduleClose);

  floatBtn.addEventListener('click', () => {
    if (widget.classList.contains('is-open')) closePopup();
    else openPopup();
  });
  closeBtn.addEventListener('click', closePopup);

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) closePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widget.classList.contains('is-open')) closePopup();
  });

  function sendMessage() {
    const message = textarea.value.trim() || DEFAULT_MESSAGE;
    const url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');
    closePopup();
  }
  sendBtn.addEventListener('click', sendMessage);
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();

/* ---------- Card recensione Google: rivela una textarea, copia il testo e apre la pagina
   della recensione (Google non supporta il pre-riempimento del testo via URL come wa.me). ---------- */
(function reviewWidget() {
  const toggleBtn = document.getElementById('review-toggle-btn');
  const form = document.getElementById('review-form');
  const textarea = document.getElementById('review-text');
  const sendBtn = document.getElementById('review-send-btn');
  const copiedMsg = document.getElementById('review-copied-msg');
  if (!toggleBtn || !form || !textarea || !sendBtn) return;

  const REVIEW_URL = 'https://g.page/r/CQOqnEyUnBXKEBM/review';

  toggleBtn.addEventListener('click', () => {
    const isOpen = !form.hidden;
    if (isOpen) {
      form.hidden = true;
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      form.hidden = false;
      toggleBtn.setAttribute('aria-expanded', 'true');
      window.setTimeout(() => textarea.focus(), 50);
    }
  });

  async function copyAndOpen() {
    const text = textarea.value.trim();
    if (copiedMsg) copiedMsg.hidden = true;
    if (text && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        if (copiedMsg) copiedMsg.hidden = false;
      } catch (e) {
        /* Clipboard non disponibile (permessi/browser): si apre comunque la pagina della recensione. */
      }
    }
    window.open(REVIEW_URL, '_blank', 'noopener');
  }
  sendBtn.addEventListener('click', copyAndOpen);
})();

/* ---------- Count-up statistiche (indipendente da GSAP: funziona anche se GSAP non carica) ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => io.observe(el));
}
initCounters();

/* ---------- Cookie consent: Google Maps + Google Fonts restano bloccati finché l'utente non acconsente ---------- */
(function cookieConsent() {
  const STORAGE_KEY = 'acciardi_cookie_consent';

  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(thirdParty) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ necessary: true, thirdParty, date: new Date().toISOString() })
      );
    } catch (e) {
      /* localStorage non disponibile: la scelta non verrà ricordata da una visita all'altra */
    }
  }

  function loadGoogleFonts() {
    if (document.getElementById('google-fonts-link')) return;
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    const sheet = document.createElement('link');
    sheet.id = 'google-fonts-link';
    sheet.rel = 'stylesheet';
    sheet.href =
      'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap';
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);
    document.head.appendChild(sheet);
  }

  function loadMap() {
    const iframe = document.getElementById('map-iframe');
    const placeholder = document.getElementById('map-placeholder');
    if (iframe && !iframe.getAttribute('src')) {
      iframe.src = iframe.dataset.src;
      iframe.classList.remove('hidden');
    }
    if (placeholder) placeholder.classList.add('hidden');
  }

  function enableThirdParty() {
    loadGoogleFonts();
    loadMap();
  }

  const banner = document.getElementById('cookie-banner');
  const preferences = document.getElementById('cookie-preferences');
  const toggle = document.getElementById('cookie-toggle-third-party');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');
  const customizeBtn = document.getElementById('cookie-customize');
  const saveBtn = document.getElementById('cookie-save');
  const reopenBtn = document.getElementById('cookie-reopen');
  const mapConsentBtn = document.getElementById('map-consent-btn');

  function syncToggleWithStoredState() {
    if (!toggle) return;
    const current = readConsent();
    toggle.setAttribute('aria-checked', String(current ? !!current.thirdParty : false));
  }

  function showBanner(openPreferences) {
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-shown'));
    if (openPreferences && preferences) {
      preferences.hidden = false;
      syncToggleWithStoredState();
    }
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-shown');
    window.setTimeout(
      () => {
        // Non nascondere se nel frattempo il banner è stato riaperto (evita race condition)
        if (!banner.classList.contains('is-shown')) banner.hidden = true;
      },
      prefersReducedMotion ? 0 : 500
    );
  }

  if (acceptBtn)
    acceptBtn.addEventListener('click', () => {
      writeConsent(true);
      enableThirdParty();
      hideBanner();
    });

  if (rejectBtn)
    rejectBtn.addEventListener('click', () => {
      writeConsent(false);
      hideBanner();
    });

  if (customizeBtn && preferences)
    customizeBtn.addEventListener('click', () => {
      const willShow = preferences.hidden;
      preferences.hidden = !willShow;
      if (willShow) syncToggleWithStoredState();
    });

  if (toggle)
    toggle.addEventListener('click', () => {
      const isOn = toggle.getAttribute('aria-checked') === 'true';
      toggle.setAttribute('aria-checked', String(!isOn));
    });

  if (saveBtn)
    saveBtn.addEventListener('click', () => {
      const isOn = toggle ? toggle.getAttribute('aria-checked') === 'true' : false;
      writeConsent(isOn);
      if (isOn) enableThirdParty();
      hideBanner();
    });

  if (reopenBtn)
    reopenBtn.addEventListener('click', () => {
      showBanner(true);
    });

  if (mapConsentBtn)
    mapConsentBtn.addEventListener('click', () => {
      writeConsent(true);
      enableThirdParty();
      if (toggle) toggle.setAttribute('aria-checked', 'true');
    });

  /* Modale informativa cookie */
  const policyModal = document.getElementById('cookie-policy-modal');
  const policyClose = document.getElementById('cookie-policy-close');
  const policyOpeners = [
    document.getElementById('cookie-policy-link'),
    document.getElementById('cookie-policy-link-banner'),
  ].filter(Boolean);

  function openPolicyModal() {
    if (!policyModal) return;
    policyModal.hidden = false;
    requestAnimationFrame(() => policyModal.classList.add('is-visible'));
  }
  function closePolicyModal() {
    if (!policyModal) return;
    policyModal.classList.remove('is-visible');
    window.setTimeout(
      () => {
        if (!policyModal.classList.contains('is-visible')) policyModal.hidden = true;
      },
      prefersReducedMotion ? 0 : 300
    );
  }
  policyOpeners.forEach((btn) => btn.addEventListener('click', openPolicyModal));
  if (policyClose) policyClose.addEventListener('click', closePolicyModal);
  if (policyModal)
    policyModal.addEventListener('click', (e) => {
      if (e.target === policyModal) closePolicyModal();
    });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && policyModal && !policyModal.hidden) closePolicyModal();
  });

  /* Stato iniziale: mostra il banner solo se non è ancora stata fatta una scelta */
  const consent = readConsent();
  if (consent === null) {
    showBanner(false);
  } else if (consent.thirdParty) {
    enableThirdParty();
  }
})();
