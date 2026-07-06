/**
 * ============================================================
 * ROSE & STEM — Home Page 1 JavaScript
 * Includes: Hero Rose Canvas Animation (the star of the show),
 *           wishlist toggling, product interactions, page init.
 * ============================================================
 *
 * TABLE OF CONTENTS
 * 1.  Rose Canvas Animation Engine
 *     1a. RoseRenderer — main orchestrator
 *     1b. Rose bloom drawing (recursive Bézier petals)
 *     1c. Stem + leaf drawing
 *     1d. Falling petal particles
 *     1e. Floating sparkles
 *     1f. Ambient pulse rings
 *     1g. Dew-drop shimmer
 *     1h. Background gradient + bokeh
 *     1i. Animation loop
 * 2.  Wishlist Button Toggle
 * 3.  Page-specific initialisation
 * ============================================================
 */

'use strict';

/* ============================================================
   1. ROSE CANVAS ANIMATION ENGINE
   ============================================================ */

/**
 * RoseRenderer — draws a living rose scene on a <canvas> element.
 *
 * What it renders:
 *  • A lush, layered rose bloom built from recursive Bézier curves
 *  • A realistic stem with two leaves
 *  • Continuously regenerating falling rose-petal particles
 *  • Floating light sparkles (lens-flare style)
 *  • Soft ambient pulse rings emanating from the bloom
 *  • Dew-drop shimmer on petals
 *  • A warm radial gradient sky background
 *  • Soft bokeh circles for atmosphere
 */
const RoseRenderer = (() => {

  /* ── Internal state ── */
  let canvas, ctx;
  let W, H;                       // canvas dimensions
  let raf;                        // requestAnimationFrame handle
  let t = 0;                      // global time counter
  let isDark = false;             // tracks dark mode

  /* ── Animation parameters ── */
  const PETAL_COUNT   = 28;       // petals per rose layer
  const LAYER_COUNT   = 5;        // number of concentric petal layers
  const PARTICLE_MAX  = 55;       // max falling petals
  const SPARKLE_MAX   = 18;       // max sparkle points
  const BOKEH_MAX     = 14;       // background bokeh circles

  /* ── Object arrays ── */
  let particles = [];
  let sparkles  = [];
  let bokeh     = [];
  let pulseRings = [];


  /* ──────────────────────────────────────────────────────────
     1b. ROSE BLOOM DRAWING
     Draws layered petals using cubic Bézier curves.
     Each petal is a "leaf" shape rotated around the bloom centre.
  ────────────────────────────────────────────────────────── */

  /**
   * Draw a single petal.
   * @param {number} cx    - centre x of the whole bloom
   * @param {number} cy    - centre y of the whole bloom
   * @param {number} angle - rotation angle of this petal (radians)
   * @param {number} len   - petal length (radius from centre)
   * @param {number} width - petal width factor
   * @param {string} fillStyle - canvas fill colour
   * @param {number} alpha - opacity
   */
  function drawPetal(cx, cy, angle, len, width, fillStyle, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    // Petal: from origin, sweep out and back using Bézier control points
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
       width,  -len * 0.3,    // cp1
       width,  -len * 0.85,   // cp2
       0,      -len           // end (tip)
    );
    ctx.bezierCurveTo(
      -width, -len * 0.85,
      -width, -len * 0.3,
       0,      0
    );

    ctx.fillStyle   = fillStyle;
    ctx.shadowColor = 'rgba(200, 76, 106, 0.18)';
    ctx.shadowBlur  = 8;
    ctx.fill();

    // Inner petal highlight crease
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
       width * 0.18, -len * 0.25,
       width * 0.12, -len * 0.75,
       0,            -len * 0.9
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth   = 0.6;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw the full rose bloom.
   * Uses multiple concentric petal rings with different sizes,
   * colours, and rotation offsets to create depth.
   *
   * @param {number} cx - bloom centre x
   * @param {number} cy - bloom centre y
   * @param {number} r  - outer radius of bloom
   * @param {number} breathe - subtle breathing oscillation (0–1)
   */
  function drawBloom(cx, cy, r, breathe) {
    // Layer definitions: [petals, radius-factor, width-factor, colour, alpha, rotation-offset]
    const layers = [
      // Outermost guard petals — darkest, largest
      { n: 8,  rf: 1.00, wf: 0.34, col: isDark ? '#9E2B45' : '#B03050', a: 0.92, rot: 0 },
      // Second ring
      { n: 10, rf: 0.88, wf: 0.30, col: isDark ? '#C04060' : '#C84C6A', a: 0.90, rot: 0.18 },
      // Third ring — lighter
      { n: 10, rf: 0.74, wf: 0.27, col: isDark ? '#D05070' : '#D96080', a: 0.88, rot: 0.09 },
      // Fourth ring — blush
      { n: 10, rf: 0.58, wf: 0.24, col: isDark ? '#E08095' : '#EFA3B1', a: 0.86, rot: 0.22 },
      // Inner ring — very pale, almost cream
      { n: 8,  rf: 0.40, wf: 0.20, col: isDark ? '#D0A0B0' : '#F7D6DC', a: 0.88, rot: 0.14 },
      // Innermost heart — gold centre
      { n: 5,  rf: 0.22, wf: 0.12, col: isDark ? '#B8903A' : '#E6C07B', a: 0.80, rot: 0 },
    ];

    // Very slight bloom sway
    const swayX = Math.sin(t * 0.4) * 1.8;
    const swayY = Math.cos(t * 0.3) * 1.2;

    layers.forEach((layer, li) => {
      const layerR = r * layer.rf * (1 + breathe * 0.025 * (LAYER_COUNT - li));
      const petalW = layerR * layer.wf;
      const baseRot = layer.rot + t * (0.004 - li * 0.0006); // very slow rotation per layer

      for (let i = 0; i < layer.n; i++) {
        const angle = (Math.PI * 2 / layer.n) * i + baseRot;
        // Petals slightly stagger in length for organic look
        const lenVar = layerR * (0.92 + 0.16 * Math.sin(i * 1.618 + li));
        drawPetal(cx + swayX, cy + swayY, angle, lenVar, petalW, layer.col, layer.a);
      }
    });

    // Stamen / centre dot cluster
    drawStamen(cx + swayX, cy + swayY, r * 0.12, breathe);
  }

  /**
   * Draw the yellow stamen cluster at the bloom's heart.
   */
  function drawStamen(cx, cy, r, breathe) {
    const stamens = 12;
    for (let i = 0; i < stamens; i++) {
      const a  = (Math.PI * 2 / stamens) * i + t * 0.02;
      const sr = r * (0.6 + 0.4 * Math.abs(Math.sin(i * 0.9)));
      const sx = cx + Math.cos(a) * sr * 0.7;
      const sy = cy + Math.sin(a) * sr * 0.7;
      const dotR = r * 0.08 * (0.7 + 0.3 * Math.sin(i + t * 0.3));

      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#C8A040' : '#E6C07B';
      ctx.shadowColor = '#E6C07B';
      ctx.shadowBlur  = 6;
      ctx.fill();
      ctx.restore();
    }

    // Centre dome
    ctx.save();
    ctx.globalAlpha = 0.70;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.8);
    grad.addColorStop(0, isDark ? '#D4A040' : '#F0D080');
    grad.addColorStop(1, isDark ? '#9E6020' : '#C89040');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55 * (1 + breathe * 0.04), 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }


  /* ──────────────────────────────────────────────────────────
     1c. STEM & LEAVES
  ────────────────────────────────────────────────────────── */

  /**
   * Draw the stem and two leaves beneath the bloom.
   * @param {number} bx - bloom centre x
   * @param {number} by - bloom centre y
   * @param {number} stemLen - length of stem in px
   */
  function drawStem(bx, by, stemLen) {
    const stemX  = bx;
    const stemBotY = by + stemLen;

    // Stem gentle curve
    const sway = Math.sin(t * 0.35) * 4;

    ctx.save();
    ctx.lineWidth   = 5;
    ctx.strokeStyle = isDark ? '#4A7060' : '#5E8B7E';
    ctx.shadowColor = 'rgba(94, 139, 126, 0.3)';
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(stemX, by + 6);
    ctx.bezierCurveTo(
      stemX + sway * 2, by + stemLen * 0.35,
      stemX - sway,     by + stemLen * 0.65,
      stemX + sway * 0.5, stemBotY
    );
    ctx.stroke();

    // Leaf 1 — left
    drawLeaf(stemX + sway * 0.5, by + stemLen * 0.38, -Math.PI * 0.42, stemLen * 0.36);
    // Leaf 2 — right
    drawLeaf(stemX + sway * 0.3, by + stemLen * 0.60,  Math.PI * 0.38, stemLen * 0.30);

    ctx.restore();
  }

  /**
   * Draw a single leaf.
   */
  function drawLeaf(x, y, angle, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.sin(t * 0.3) * 0.04);

    // Leaf body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
       size * 0.35, -size * 0.22,
       size * 0.65, -size * 0.18,
       size,         0
    );
    ctx.bezierCurveTo(
       size * 0.65,  size * 0.18,
       size * 0.35,  size * 0.22,
       0,            0
    );

    const leafGrad = ctx.createLinearGradient(0, -size * 0.2, 0, size * 0.2);
    leafGrad.addColorStop(0, isDark ? '#4A7060' : '#5E8B7E');
    leafGrad.addColorStop(1, isDark ? '#305040' : '#3D6B5E');
    ctx.fillStyle   = leafGrad;
    ctx.shadowColor = 'rgba(94, 139, 126, 0.25)';
    ctx.shadowBlur  = 4;
    ctx.globalAlpha = 0.88;
    ctx.fill();

    // Midrib
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.85, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth   = 0.8;
    ctx.stroke();

    ctx.restore();
  }


  /* ──────────────────────────────────────────────────────────
     1d. FALLING PETAL PARTICLES
  ────────────────────────────────────────────────────────── */

  /**
   * Spawn a fresh falling petal particle.
   * @param {boolean} immediate - if true, start at random y position
   */
  function spawnParticle(immediate = false) {
    const colours = [
      'rgba(200, 76, 106, 0.75)',
      'rgba(239, 163, 177, 0.80)',
      'rgba(247, 214, 220, 0.85)',
      'rgba(217, 122, 140, 0.78)',
      'rgba(230, 192, 123, 0.70)',
    ];
    return {
      x:     Math.random() * W,
      y:     immediate ? Math.random() * H : -20,
      size:  Math.random() * 9 + 4,
      speed: Math.random() * 0.7 + 0.3,
      drift: (Math.random() - 0.5) * 0.6,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.04,
      col:   colours[Math.floor(Math.random() * colours.length)],
      alpha: Math.random() * 0.5 + 0.4,
      scale: Math.random() * 0.5 + 0.6,
    };
  }

  /**
   * Update and draw all falling petals.
   */
  function updateParticles() {
    // Spawn if needed
    while (particles.length < PARTICLE_MAX) {
      particles.push(spawnParticle(particles.length < PARTICLE_MAX / 2));
    }

    particles.forEach((p, i) => {
      p.y   += p.speed;
      p.x   += p.drift + Math.sin(t * 0.5 + i) * 0.3;
      p.rot += p.rotV;

      // Remove if off-screen
      if (p.y > H + 20 || p.x < -20 || p.x > W + 20) {
        particles[i] = spawnParticle(false);
        return;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.scale, p.scale);

      // Draw a mini petal ellipse
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.col;
      ctx.fill();

      // Tiny highlight on petal
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.15, -p.size * 0.1, p.size * 0.3, p.size * 0.2, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      ctx.restore();
    });
  }


  /* ──────────────────────────────────────────────────────────
     1e. FLOATING SPARKLES
  ────────────────────────────────────────────────────────── */

  function spawnSparkle() {
    return {
      x:      W * 0.3 + Math.random() * W * 0.55,
      y:      H * 0.05 + Math.random() * H * 0.8,
      life:   0,
      maxLife: Math.random() * 90 + 60,
      size:   Math.random() * 3.5 + 1.5,
      col:    Math.random() > 0.5
                ? 'rgba(230, 192, 123,'
                : 'rgba(255, 255, 255,',
    };
  }

  function updateSparkles() {
    while (sparkles.length < SPARKLE_MAX) sparkles.push(spawnSparkle());

    sparkles.forEach((s, i) => {
      s.life++;

      if (s.life > s.maxLife) {
        sparkles[i] = spawnSparkle();
        return;
      }

      // Fade in → peak → fade out
      const phase = s.life / s.maxLife;
      const alpha = Math.sin(phase * Math.PI) * 0.9;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(s.x, s.y + Math.sin(t * 0.4 + i) * 3);

      // 4-pointed star shape
      const arms = 4;
      const outerR = s.size;
      const innerR = s.size * 0.3;
      ctx.beginPath();
      for (let a = 0; a < arms * 2; a++) {
        const r   = a % 2 === 0 ? outerR : innerR;
        const ang = (Math.PI / arms) * a - Math.PI / 2;
        a === 0
          ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
          : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();

      ctx.fillStyle = `${s.col} ${alpha})`;
      ctx.shadowColor = '#E6C07B';
      ctx.shadowBlur  = 8;
      ctx.fill();

      ctx.restore();
    });
  }


  /* ──────────────────────────────────────────────────────────
     1f. AMBIENT PULSE RINGS
     Concentric rings that expand from the bloom centre.
  ────────────────────────────────────────────────────────── */

  function spawnRing(cx, cy) {
    return { cx, cy, r: 0, maxR: 130, life: 0, maxLife: 110 };
  }

  function updatePulseRings(cx, cy) {
    // Spawn a new ring every ~130 frames
    if (Math.floor(t) % 130 === 0) {
      pulseRings.push(spawnRing(cx, cy));
    }

    pulseRings = pulseRings.filter(ring => ring.life < ring.maxLife);

    pulseRings.forEach(ring => {
      ring.life++;
      ring.r = (ring.life / ring.maxLife) * ring.maxR;
      const alpha = (1 - ring.life / ring.maxLife) * 0.22;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? '#E06B87' : '#C84C6A';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.restore();
    });
  }


  /* ──────────────────────────────────────────────────────────
     1g. DEW-DROP SHIMMER
     Tiny drop highlights on petals.
  ────────────────────────────────────────────────────────── */

  function drawDewDrops(cx, cy, bloomR) {
    const drops = 10;
    for (let i = 0; i < drops; i++) {
      const a  = (Math.PI * 2 / drops) * i + t * 0.06;
      const dr = bloomR * (0.45 + 0.4 * ((i * 0.618) % 1));
      const dx = cx + Math.cos(a) * dr;
      const dy = cy + Math.sin(a) * dr;
      const ds = 2.5 + 1.5 * Math.abs(Math.sin(i * 1.2 + t * 0.15));
      const da = 0.35 + 0.25 * Math.sin(i + t * 0.2);

      ctx.save();
      ctx.globalAlpha = da;

      const grad = ctx.createRadialGradient(dx - ds * 0.3, dy - ds * 0.3, 0.5, dx, dy, ds);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(dx, dy, ds, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }


  /* ──────────────────────────────────────────────────────────
     1h. BACKGROUND GRADIENT + BOKEH
  ────────────────────────────────────────────────────────── */

  /**
   * Initialise bokeh circles (only once).
   */
  function initBokeh() {
    bokeh = [];
    for (let i = 0; i < BOKEH_MAX; i++) {
      bokeh.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 40 + 10,
        alpha: Math.random() * 0.07 + 0.02,
        speed: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
        col:   ['#C84C6A', '#E6C07B', '#EFA3B1', '#5E8B7E', '#F7D6DC'][Math.floor(Math.random() * 5)],
      });
    }
  }

  function drawBackground() {
    // Base gradient
    const bg = isDark
      ? ctx.createRadialGradient(W * 0.6, H * 0.4, 0, W * 0.6, H * 0.4, W * 0.9)
      : ctx.createRadialGradient(W * 0.62, H * 0.38, 0, W * 0.62, H * 0.38, W * 0.9);

    if (isDark) {
      bg.addColorStop(0,   '#2a1018');
      bg.addColorStop(0.5, '#180c12');
      bg.addColorStop(1,   '#0e0709');
    } else {
      bg.addColorStop(0,   '#FFF0F3');
      bg.addColorStop(0.45, '#FAF3EE');
      bg.addColorStop(1,   '#F5EDE8');
    }

    ctx.save();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Bokeh
    bokeh.forEach(b => {
      b.phase += 0.004;
      b.y     += b.speed;
      if (b.y > H + b.r) b.y = -b.r;

      const pulse = 1 + 0.08 * Math.sin(b.phase);
      ctx.save();
      ctx.globalAlpha = b.alpha;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
      grad.addColorStop(0, b.col);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
  }


  /* ──────────────────────────────────────────────────────────
     1i. ANIMATION LOOP
  ────────────────────────────────────────────────────────── */

function render() {
  raf = null;

  t += 1;

    // Resize check
    if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
      resize();
    }

    // Clear
    ctx.clearRect(0, 0, W, H);

    // 1. Background
    drawBackground();

    // 2. Falling petal particles (behind rose)
    // updateParticles();

    // 3. Bloom position — slightly above and right of centre
    const bloomX = W * 0.52;
    const bloomY = H * 0.42;
    const bloomR = Math.min(W, H) * 0.30;

    // Breathing oscillation (0 → 1)
    const breathe = (Math.sin(t * 0.025) + 1) / 2;

    // 4. Stem + leaves (behind bloom)
    const stemLen = H * 0.45;
    drawStem(bloomX, bloomY + bloomR * 0.9, stemLen);

    // 5. Pulse rings
    updatePulseRings(bloomX, bloomY);

    // 6. Rose bloom
    drawBloom(bloomX, bloomY, bloomR, breathe);

    // 7. Dew drops
    drawDewDrops(bloomX, bloomY, bloomR);

    // 8. Sparkles
    updateSparkles();

    raf = requestAnimationFrame(render);
  }


  /* ──────────────────────────────────────────────────────────
     Setup helpers
  ────────────────────────────────────────────────────────── */

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;

    W = rect.width;
    H = rect.height;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initBokeh(); // re-randomise bokeh on resize
  }


  /* ──────────────────────────────────────────────────────────
     Public API
  ────────────────────────────────────────────────────────── */

  /**
   * Initialise the rose renderer.
   * @param {HTMLCanvasElement} canvasEl
   */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');

    // Check initial theme
    isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Listen for theme changes from global.js
    document.addEventListener('themeChange', e => {
      isDark = e.detail.theme === 'dark';
    });

    resize();
    window.addEventListener('resize', resize);

    // Seed particles
    particles = Array.from({ length: PARTICLE_MAX }, () => spawnParticle(true));
    sparkles  = Array.from({ length: SPARKLE_MAX  }, () => {
      const s = spawnSparkle();
      s.life  = Math.floor(Math.random() * s.maxLife); // stagger
      return s;
    });

    // Start loop
    render();
  }

  /**
   * Stop the animation (e.g. when page not visible).
   */
function stop() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = null;
  }
}

/**
 * Resume the animation.
 */
function resume() {
  if (!raf) {
    render();
  }
}

  return { init, stop, resume };

})();


/* ============================================================
   2. WISHLIST BUTTON TOGGLE
   ============================================================ */

/**
 * Handles heart icon toggle for wishlist buttons.
 * Uses event delegation on the entire document.
 */
function initWishlistButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.wishlist-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const isActive = btn.classList.toggle('active');
    const icon = btn.querySelector('svg'); // target actual SVG (not <i>)

    // click animation
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => { btn.style.transform = ''; }, 200);

    if (icon) {
      if (isActive) {
        // ❤️ FILLED HEART
        icon.style.fill = '#fff';              // white fill
        icon.style.stroke = '#fff';            // white border
        icon.style.strokeWidth = '2.2';        // prevent disappearing
      } else {
        // 🤍 OUTLINE HEART
        icon.style.fill = 'none';
        icon.style.stroke = 'currentColor';
        icon.style.strokeWidth = '2';
      }
    }

    if (isActive && window.RoseAndStem?.showToast) {
      window.RoseAndStem.showToast('Added to wishlist 🌹', 'success', 2500);
    }
  });
}

/* ============================================================
   3. PAGE-SPECIFIC INIT
   ============================================================ */

/**
 * Initialise page-specific features after DOM is ready.
 * Global JS (global.js) handles: theme, RTL, navbar,
 * scroll reveal, counters, toasts, modals, etc.
 */
function initHomePage() {
  // ── Rose Canvas ──
  const canvasEl = document.getElementById('roseCanvas');
  if (canvasEl) {
    RoseRenderer.init(canvasEl);

    // Pause when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
      document.hidden ? RoseRenderer.stop() : RoseRenderer.resume();
    });
  }

  // ── Lucide icons bootstrap ──
  // global.js may already call lucide.createIcons — call again after
  // our dynamic content is rendered
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── Wishlist buttons ──
  initWishlistButtons();
}

/* Boot on DOM ready */
document.addEventListener('DOMContentLoaded', initHomePage);

/* ============================================================
   END OF HOME.JS
   Rose & Stem — v1.0.0
   ============================================================ */
