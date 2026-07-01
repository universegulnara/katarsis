document.addEventListener('DOMContentLoaded', () => {

  const AGE_VERIFIED_KEY = 'katarsis_age_verified';

  window.verifyAge = function(isAdult) {
    if (isAdult) {
      localStorage.setItem(AGE_VERIFIED_KEY, 'true');
      document.getElementById('age-verify').classList.add('hidden');
      initAOS();
    } else {
      window.location.href = 'https://yandex.ru';
    }
  };

  if (localStorage.getItem(AGE_VERIFIED_KEY) === 'true') {
    document.getElementById('age-verify').classList.add('hidden');
    setTimeout(initAOS, 100);
  }

  const navbar = document.getElementById('navbar');
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');

  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  window.openModal = function(name) {
    const modal = document.getElementById(`modal-${name}`);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function(name) {
    const modal = document.getElementById(`modal-${name}`);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  document.querySelectorAll('.modal__overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => {
        m.classList.remove('active');
      });
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(m => {
        m.classList.remove('active');
      });
      document.body.style.overflow = '';
    }
  });

  document.querySelectorAll('.event-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      alert('Подробности мероприятия скоро появятся. Следите за обновлениями!');
    });
  });

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 2000;
          const startTime = performance.now();

          function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current;
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = target;
            }
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  function initAOS() {
    const els = document.querySelectorAll('[data-aos]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      els.forEach(el => observer.observe(el));
    } else {
      els.forEach(el => el.classList.add('aos-animate'));
    }

    initCounters();
  }

  const ratingStars = document.querySelectorAll('.rating__star');
  let currentRating = 0;

  ratingStars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value, 10);
      currentRating = value;
      ratingStars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value, 10) <= value);
      });
    });

    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value, 10);
      ratingStars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value, 10) <= value);
      });
    });

    star.addEventListener('mouseleave', () => {
      ratingStars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value, 10) <= currentRating);
      });
    });
  });

  const parallaxElements = document.querySelectorAll('.event-card__bg');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.1;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const windowCenter = window.innerHeight / 2;
      const offset = (center - windowCenter) * speed * 0.1;
      el.style.transform = `translateY(${offset * -1}px)`;
    });

    const heroContent = document.querySelector('.hero__content');
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = Math.max(1 - scrollY / 600, 0);
    }
  });

});
