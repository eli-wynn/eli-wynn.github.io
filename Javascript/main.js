// Eli Wynn
// Version 2.1

// ─── Particles ───────────────────────────────────────────
particlesJS('particles-background', {
  particles: {
    number: { value: 70, density: { enable: true, value_area: 900 } },
    color: { value: '#7DF9A6' },
    shape: { type: 'circle' },
    opacity: { value: 0.35, random: true },
    size: { value: 2.5, random: true },
    line_linked: {
      enable: true,
      distance: 140,
      color: '#7DF9A6',
      opacity: 0.18,
      width: 1
    },
    move: {
      enable: true,
      speed: 1.4,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'push' },
      resize: true
    },
    modes: {
      grab: { distance: 160, line_linked: { opacity: 0.45 } },
      push: { particles_nb: 3 }
    }
  },
  retina_detect: true
});


// ─── Navbar scroll state ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── Fade-up on scroll ────────────────────────────────────
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));