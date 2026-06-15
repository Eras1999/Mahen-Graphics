/* ============================================================
   Mahen Graphics — script.js
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. AOS
  AOS.init({
    duration: 750,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });

  // 2. Navbar scroll
  const nav = document.getElementById('mainNav');
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('#navMenu .nav-link');

  const handleNavScroll = () => {
    if (window.scrollY > 60) nav.classList.add('nav-scrolled');
    else nav.classList.remove('nav-scrolled');

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // 3. Mobile nav close
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const navCollapse = document.getElementById('navMenu');
      if (navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  // 4. Animated Counter
  const counters = document.querySelectorAll('.stat-number');
  let countersStarted = false;
  const animateCounters = () => {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const steps = Math.ceil(2000 / 16);
      const increment = target / steps;
      let current = 0, step = 0;
      const timer = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), target);
        counter.textContent = current.toLocaleString();
        if (step >= steps) clearInterval(timer);
      }, 16);
    });
  };
  const statsSection = document.querySelector('.stats-section');
  if (statsSection && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        animateCounters();
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(statsSection);
  }

  // 5. Scroll to Top
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) scrollTopBtn.classList.add('visible');
    else scrollTopBtn.classList.remove('visible');
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // 6. Hero carousel animation reset
  const heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel) {
    heroCarousel.addEventListener('slide.bs.carousel', event => {
      event.relatedTarget.querySelectorAll('.animate-tag, .animate-title, .animate-sub, .animate-btns')
        .forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    });
  }

  // 7. Contact form
  const submitBtn = document.querySelector('.btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const inputs = document.querySelectorAll('.form-control-custom');
      let allFilled = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          allFilled = false;
          input.style.borderColor = '#e53e3e';
          setTimeout(() => { input.style.borderColor = ''; }, 2500);
        }
      });
      if (allFilled) {
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Message Sent!';
        submitBtn.style.background = '#16a34a';
        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.innerHTML = 'Send Message <i class="bi bi-send ms-2"></i>';
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          inputs.forEach(i => { i.value = ''; });
        }, 3500);
      }
    });
  }

  // 8. Lazy load fallback
  if (!('loading' in HTMLImageElement.prototype) && 'IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const imgObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (e.target.dataset.src) e.target.src = e.target.dataset.src; imgObs.unobserve(e.target); }
      });
    });
    lazyImgs.forEach(img => imgObs.observe(img));
  }

  // -------------------------------------------------------
  // CHANGE 4: Portfolio Filter System
  // -------------------------------------------------------
  const filterBtns = document.querySelectorAll('.pf-btn');
  const pfItems = document.querySelectorAll('.pf-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items
      pfItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.classList.remove('hidden');
          item.style.display = '';
        } else {
          item.classList.add('hidden');
          // Use timeout to allow transition before display:none
          setTimeout(() => {
            if (item.classList.contains('hidden')) item.style.display = 'none';
          }, 400);
        }
      });
    });
  });

  // -------------------------------------------------------
  // CHANGE 6: Modern Testimonial Slider
  // -------------------------------------------------------
  const track = document.getElementById('testiTrack');
  const cards = track ? track.querySelectorAll('.testi-modern-card') : [];
  const dotsContainer = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');

  if (cards.length && dotsContainer) {
    let current = 0;
    let autoTimer;

    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.testi-dot');

    const goTo = (index) => {
      current = (index + cards.length) % cards.length;
      track.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      resetTimer();
    };

    const resetTimer = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 4500);
    };

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', resetTimer);

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    });

    resetTimer();
  }

  // Page fade-in
  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    setTimeout(() => { document.body.style.opacity = '1'; }, 50);
  });

});