/* ═══════════════════════════════════════════
   WOW-JS для Катарсис
   Добавить в index.html: <script src="js/wow.js"></script>
   ═══════════════════════════════════════════ */

(function() {
  'use strict';

  // 1. CURSOR GLOW
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  let cursorX = 0, cursorY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursorGlow.classList.add('active');
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
  });

  function animateCursor() {
    glowX += (cursorX - glowX) * 0.15;
    glowY += (cursorY - glowY) * 0.15;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // 2. STAGGERED CARD REVEALS
  function initStagger() {
    const cards = document.querySelectorAll('.activity-card, .advantage-card, .event-card');
    cards.forEach((card, i) => {
      card.setAttribute('data-stagger', i);
    });

    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('stagger-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-stagger')) || 0;
          const delay = (index % 6) * 100; // 100ms between each card in row
          setTimeout(() => {
            entry.target.classList.add('stagger-visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(card => observer.observe(card));
  }

  // 3. SCROLL PROGRESS BAR
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, { passive: true });
  }

  // 4. SECTION GLOW ON SCROLL
  function initSectionGlow() {
    const sections = document.querySelectorAll('.section');
    if (!('IntersectionObserver' in window)) {
      sections.forEach(s => s.classList.add('section-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    }, { threshold: 0.2 });

    sections.forEach(s => observer.observe(s));
  }

  // 5. MAGNETIC HOVER ON BUTTONS (desktop only)
  function initMagneticHover() {
    if (window.innerWidth < 768) return;

    const buttons = document.querySelectorAll('.btn--glass, .btn--primary');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // 6. PARALLAX SMOKE ON SCROLL
  function initSmokeParallax() {
    const smokes = document.querySelectorAll('.smoke');
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      smokes.forEach((smoke, i) => {
        const speed = 0.05 + i * 0.02;
        smoke.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  // INIT
  document.addEventListener('DOMContentLoaded', () => {
    initStagger();
    initScrollProgress();
    initSectionGlow();
    initMagneticHover();
    initSmokeParallax();
  });

})();
