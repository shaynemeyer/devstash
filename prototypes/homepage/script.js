// ===== Navbar opacity on scroll =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Pricing toggle =====
const billingToggle = document.getElementById('billingToggle');
const proPrice = document.getElementById('proPrice');
const proPeriod = document.getElementById('proPeriod');
const proBtn = document.getElementById('proBtn');

billingToggle.addEventListener('change', () => {
  if (billingToggle.checked) {
    proPrice.innerHTML = '$6<span>/mo</span>';
    proPeriod.textContent = 'billed $72/yr';
    proBtn.textContent = '$72/yr';
  } else {
    proPrice.innerHTML = '$8<span>/mo</span>';
    proPeriod.textContent = 'billed monthly';
    proBtn.textContent = '$8/mo';
  }
});

// ===== Chaos icon animation =====
(function initChaos() {
  const arena = document.getElementById('chaosArena');
  if (!arena) return;

  const icons = Array.from(arena.querySelectorAll('.chaos-icon'));
  const ICON_SIZE = 44;
  const REPEL_RADIUS = 100;
  const REPEL_STRENGTH = 1.5;

  let mouse = { x: -999, y: -999 };
  let arenaRect = arena.getBoundingClientRect();

  // Initialize positions and velocities
  const state = icons.map((el, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 30 + col * 90 + Math.random() * 30;
    const y = 20 + row * 110 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.35 + Math.random() * 0.3;
    return {
      el,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.4,
      scale: 1,
      scaleDir: Math.random() < 0.5 ? 1 : -1,
      scaleT: Math.random() * Math.PI * 2,
    };
  });

  // Update arena rect on resize
  const ro = new ResizeObserver(() => {
    arenaRect = arena.getBoundingClientRect();
  });
  ro.observe(arena);

  arena.addEventListener('mousemove', e => {
    const r = arena.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  arena.addEventListener('mouseleave', () => {
    mouse.x = -999;
    mouse.y = -999;
  });

  let lastTime = 0;

  function tick(ts) {
    const dt = Math.min((ts - lastTime) / 16.67, 3); // cap at 3x for tab visibility
    lastTime = ts;

    const W = arena.offsetWidth - ICON_SIZE;
    const H = arena.offsetHeight - ICON_SIZE;

    state.forEach(s => {
      // Mouse repel
      const dx = s.x + ICON_SIZE / 2 - mouse.x;
      const dy = s.y + ICON_SIZE / 2 - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
        s.vx += (dx / dist) * force * dt;
        s.vy += (dy / dist) * force * dt;
      }

      // Speed limit
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const MAX_SPEED = 1.4;
      if (speed > MAX_SPEED) {
        s.vx = (s.vx / speed) * MAX_SPEED;
        s.vy = (s.vy / speed) * MAX_SPEED;
      }

      // Move
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Bounce
      if (s.x < 0) { s.x = 0; s.vx = Math.abs(s.vx); }
      if (s.x > W) { s.x = W; s.vx = -Math.abs(s.vx); }
      if (s.y < 0) { s.y = 0; s.vy = Math.abs(s.vy); }
      if (s.y > H) { s.y = H; s.vy = -Math.abs(s.vy); }

      // Subtle rotation
      s.rotation += s.rotSpeed * dt;

      // Subtle scale pulse
      s.scaleT += 0.02 * dt;
      s.scale = 1 + Math.sin(s.scaleT) * 0.06;

      s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg) scale(${s.scale})`;
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(ts => {
    lastTime = ts;
    requestAnimationFrame(tick);
  });
})();

// ===== Scroll fade-in =====
(function initScrollFade() {
  const els = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => obs.observe(el));
})();
