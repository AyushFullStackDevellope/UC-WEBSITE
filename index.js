// ===== UTILITIES =====
const utils = {
  throttle(func, delay) {
    let timeoutId, lastExec = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastExec > delay) {
        func.apply(this, args);
        lastExec = now;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExec = Date.now();
        }, delay - (now - lastExec));
      }
    };
  },

  animateCounter(el, target) {
    const suffix = el.dataset.suffix || "";
    const duration = 1500, start = performance.now();
    const animate = time => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
};

// ===== OBSERVER MANAGER =====
class ObserverManager {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  init() {
    this.createObserver('stats', { threshold: 0.3 }, entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateStats(entry.target);
          this.unobserve('stats', entry.target);
        }
      });
    });

    this.createObserver('reveal', { threshold: 0.1 }, entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.unobserve('reveal', entry.target);
        }
      });
    });
  }

  createObserver(name, options, callback) {
    this.observers.set(name, new IntersectionObserver(callback, options));
  }

  observe(name, el) {
    this.observers.get(name)?.observe(el);
  }

  unobserve(name, el) {
    this.observers.get(name)?.unobserve(el);
  }

  animateStats(section) {
    section.querySelectorAll('.hero-stat-number').forEach((el, i) => {
      const target = parseInt(el.dataset.target);
      if (target) setTimeout(() => utils.animateCounter(el, target), i * 150);
    });
  }
}

// ===== SYNCHRONIZED ACCORDION =====
class SynchronizedAccordion {
  constructor() {
    this.before = document.getElementById('before-accordion');
    this.after = document.getElementById('after-accordion');
    this.active = -1;
    this.init();
  }

  init() {
    [this.before, this.after].forEach(acc => {
      acc?.querySelectorAll('.accordion-item').forEach((item, idx) => {
        item.querySelector('.accordion-header')?.addEventListener('click', () => this.toggle(idx));
      });
    });
  }

  toggle(index) {
    const same = this.active === index;
    this.closeAll();
    if (!same) {
      this.active = index;
      this.open(index);
    } else {
      this.active = -1;
    }
  }

  open(index) {
    [this.before, this.after].forEach(acc => {
      acc?.querySelector(`[data-index="${index}"]`)?.classList.add('active');
    });
  }

  closeAll() {
    document.querySelectorAll('.accordion-item.active').forEach(el => el.classList.remove('active'));
  }
}

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const mobileSidebar = document.getElementById('mobileSidebar');
const overlay = document.getElementById('overlay');
const body = document.body;

function openMenu() {
  mobileToggle.classList.add('active');
  mobileSidebar.classList.add('active');
  overlay.classList.add('active');
  body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileToggle.classList.remove('active');
  mobileSidebar.classList.remove('active');
  overlay.classList.remove('active');
  body.style.overflow = '';
}

function toggleMenu() {
  mobileSidebar.classList.contains('active') ? closeMenu() : openMenu();
}

mobileToggle?.addEventListener('click', toggleMenu);
overlay?.addEventListener('click', closeMenu);
document.querySelectorAll('.mobile-nav-links a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
window.addEventListener('resize', () => window.innerWidth > 768 && closeMenu());

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');
window.addEventListener('scroll', utils.throttle(() => {
  header?.classList.toggle('scrolled', window.scrollY > 50);
}, 100));

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== SOLUTION CARD ANIMATION =====
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  const cards = document.querySelectorAll('.solution-card');
  cards.forEach(card => {
    observer.observe(card);
    card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
    card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
  });

  // Staggered animation
  const solutions = document.querySelector('.solutions-section');
  if (solutions) {
    const inView = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 80);
          });
          inView.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    inView.observe(solutions);
  }

  document.querySelectorAll('.solution-icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => icon.style.transform = 'scale(1.05)');
    icon.addEventListener('mouseleave', () => icon.style.transform = 'scale(1)');
  });

  // Append animations
  const style = document.createElement('style');
  style.textContent = `
    .animate-in { animation: slideInUp 0.5s ease forwards; }
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .solution-card, .solution-icon {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  document.head.appendChild(style);
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const observerManager = new ObserverManager();

  document.querySelectorAll('.hero-stats').forEach(section => observerManager.observe('stats', section));
  document.querySelectorAll('.comparison-section').forEach(section => observerManager.observe('reveal', section));

  new SynchronizedAccordion();
});
