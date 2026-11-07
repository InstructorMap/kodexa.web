/* ============================================================
   KODEXA V2 — Script
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Header scroll ---------- */
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
    updateActiveNav();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 2. Nav activa ---------- */
  const sectionIds = ['inicio', 'servicios', 'planes', 'proceso', 'contacto'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  function updateActiveNav() {
    const y = window.scrollY + 140;
    let current = sections[0]?.id;
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ---------- 3. Menú móvil ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('mobile-open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 4. Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- 5. Counter animado en stats ---------- */
  const counters = document.querySelectorAll('.hero-stats .num[data-count]');
  if (counters.length && !reduceMotion) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1400;
        const start = performance.now();

        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(target * eased);
          el.textContent = prefix + val + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIO.observe(c));
  }

  /* ---------- 6. Timeline line progress ---------- */
  const timeline = document.querySelector('.timeline');
  const timelineLine = document.querySelector('.timeline-line');
  if (timeline && timelineLine && !reduceMotion) {
    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = timeline.offsetHeight - 40;
      const scrolled = Math.max(0, Math.min(total, vh - rect.top - 100));
      timelineLine.style.height = scrolled + 'px';
    };
    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  /* ---------- 7. Showcase tabs ---------- */
  const tabs = document.querySelectorAll('.showcase-tab');
  const panels = document.querySelectorAll('.showcase-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      panels.forEach(p => {
        const match = p.dataset.panel === target;
        p.hidden = !match;
        if (match && !reduceMotion) {
          p.animate(
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
          );
        }
      });
    });
  });

  /* ---------- 8. Smooth anchors (fallback) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- 9. Parallax moderado en bento ---------- */
  const bento = document.querySelector('.bento');
  if (bento && !reduceMotion && window.matchMedia('(min-width: 1024px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          bento.style.transform = `translateY(${y * 0.08}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

})();
