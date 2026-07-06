/**
 * ============================================================
 * ROSE & STEM — About Page JavaScript
 * File: about/about.js
 * Description: Page-specific interactions for the About Us page.
 *              Relies on global.js being loaded first.
 *
 * TABLE OF CONTENTS
 * 1.  Page Init
 * 2.  Parallax Hero Images (subtle)
 * 3.  Team Card Tilt Effect
 * 4.  Timeline Animation Enhancement
 * 5.  Craft Step Sequential Animation
 * 6.  Value Card Hover Ripple
 * 7.  Sourcing Feature Stagger
 * 8.  Stats Counter Trigger (backup)
 * 9.  Testimonials Auto-scroll (mobile)
 * 10. CTA Section Petal Animation
 * ============================================================
 */

'use strict';

/* ============================================================
   1. PAGE INIT
   ============================================================ */

/**
 * Bootstraps all About page–specific features
 * after the DOM is ready and global.js has run.
 */
function initAboutPage() {
  initParallaxHero();
  initTeamCardTilt();
  initTimelineEnhancement();
  initCraftStepAnimation();
  initSourcingFeatureStagger();
  initTestimonialsAutoScroll();
  initCTAPetalAnimation();
  initMissionCardHover();
  initValueCardStagger();
}

/* ============================================================
   2. PARALLAX HERO IMAGES (subtle depth effect)
   ============================================================ */

/**
 * Adds a subtle parallax scroll effect to the hero image collage.
 * Disabled on mobile for performance.
 */
function initParallaxHero() {
  // Skip on mobile / tablet (touch devices)
  if (window.innerWidth < 1024) return;

  const heroImages = document.querySelector('.about-hero-images');
  const mainImg    = document.querySelector('.hero-img-main');
  const secImgs    = document.querySelector('.hero-img-secondary');

  if (!heroImages || !mainImg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroRect = heroImages.getBoundingClientRect();

      // Only animate while hero is in view
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        const progress = scrollY * 0.04; // Subtle factor
        mainImg.style.transform = `translateY(${progress}px)`;

        if (secImgs) {
          secImgs.style.transform = `translateY(${progress * -0.5}px)`;
        }
      }

      ticking = false;
    });

    ticking = true;
  }, { passive: true });
}


/* ============================================================
   3. TEAM CARD TILT EFFECT
   ============================================================ */

/**
 * Adds a subtle 3D tilt effect on mouse movement over team cards.
 * Pure CSS fallback ensures cards still look good without JS.
 */
function initTeamCardTilt() {
  // Skip on touch devices
  if ('ontouchstart' in window) return;

  const cards = document.querySelectorAll('.team-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;  // max ±5deg
      const rotateY = ((x - centerX) / centerX) *  5;

      card.style.transform = `
        translateY(-6px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.02)
      `;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.4s ease';
    });
  });
}


/* ============================================================
   4. TIMELINE ANIMATION ENHANCEMENT
   ============================================================ */

/**
 * Staggers timeline item reveals and adds a progress fill
 * animation to the timeline line as user scrolls through.
 */
function initTimelineEnhancement() {
  const timelineLine = document.querySelector('.timeline-line');
  const timeline     = document.querySelector('.timeline');

  if (!timelineLine || !timeline) return;

  // Start the line at 0 height, grow as user scrolls
  timelineLine.style.transformOrigin = 'top';
  timelineLine.style.transform = 'scaleY(0)';
  timelineLine.style.transition = 'transform 0.6s ease';

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger line growth
        setTimeout(() => {
          timelineLine.style.transform = 'scaleY(1)';
        }, 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(timeline);
}


/* ============================================================
   5. CRAFT STEP SEQUENTIAL ANIMATION
   ============================================================ */

/**
 * Animates craft steps sequentially — each step reveals
 * after the previous one, creating a guided flow effect.
 */
function initCraftStepAnimation() {
  const steps = document.querySelectorAll('.craft-step');

  if (!steps.length || !('IntersectionObserver' in window)) return;

  // Reset initial state (already handled by .reveal class in HTML,
  // but we add step number pulse here)
  const numbers = document.querySelectorAll('.craft-step-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step   = entry.target;
        const number = step.querySelector('.craft-step-number');

        if (number) {
          // Pulse the step number once visible
          setTimeout(() => {
            number.style.animation = 'bounceIn 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) both';
          }, 100);
        }

        observer.unobserve(step);
      }
    });
  }, { threshold: 0.5 });

  steps.forEach(step => observer.observe(step));
}


/* ============================================================
   6. MISSION CARD HOVER ENHANCEMENT
   ============================================================ */

/**
 * Adds a subtle shimmer/glow border effect on value card hover.
 */
function initMissionCardHover() {
  const missionFeatured = document.querySelector('.mission-card-featured');

  if (!missionFeatured || 'ontouchstart' in window) return;

  missionFeatured.addEventListener('mousemove', (e) => {
    const rect = missionFeatured.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;

    missionFeatured.style.background =
      `radial-gradient(circle at ${x}% ${y}%, #E06B87 0%, #C84C6A 40%, #EFA3B1 100%)`;
  });

  missionFeatured.addEventListener('mouseleave', () => {
    missionFeatured.style.background = 'var(--gradient-rose)';
  });
}


/* ============================================================
   7. VALUE CARD STAGGER ON SCROLL
   ============================================================ */

/**
 * Staggers value cards with a slight delay between each.
 */
function initValueCardStagger() {
  const valueCards = document.querySelectorAll('.value-card');

  valueCards.forEach((card, index) => {
    // Add stagger data-delay based on position
    if (!card.dataset.delay) {
      card.dataset.delay = `${(index % 3) * 100}ms`;
    }
    card.style.transitionDelay = card.dataset.delay;
  });
}


/* ============================================================
   8. SOURCING FEATURE STAGGER
   ============================================================ */

/**
 * Staggers sourcing feature items for a clean reading flow.
 */
function initSourcingFeatureStagger() {
  const features = document.querySelectorAll('.sourcing-feature');

  if (!features.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...features].indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateX(0)';
        }, idx * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  features.forEach(feature => {
    // Set initial state
    feature.style.opacity   = '0';
    feature.style.transform = 'translateX(-20px)';
    feature.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(feature);
  });
}


/* ============================================================
   9. TESTIMONIALS AUTO-SCROLL (Mobile)
   ============================================================ */

/**
 * On small screens, enables horizontal swipe / auto-scroll
 * through testimonial cards.
 */
function initTestimonialsAutoScroll() {
  if (window.innerWidth > 768) return;

  const grid = document.querySelector('.testimonials-grid');
  if (!grid) return;

  // Convert to horizontal scroll on mobile
  grid.style.cssText = `
    display: flex;
    overflow-x: auto;
    gap: 16px;
    padding-bottom: 16px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  `;

  grid.querySelectorAll('.testimonial-card').forEach(card => {
    card.style.cssText += `
      min-width: 85vw;
      scroll-snap-align: start;
      flex-shrink: 0;
    `;
  });

  // Hide scrollbar (WebKit)
  const style = document.createElement('style');
  style.textContent = '.testimonials-grid::-webkit-scrollbar { display: none; }';
  document.head.appendChild(style);
}


/* ============================================================
   10. CTA SECTION PETAL ANIMATION
   ============================================================ */

/**
 * Adds gentle floating animation to the decorative petal
 * elements in the CTA section on scroll entry.
 */
function initCTAPetalAnimation() {
  const ctaSection = document.querySelector('.about-cta-section');
  const petalLeft  = document.querySelector('.cta-petal-left');
  const petalRight = document.querySelector('.cta-petal-right');

  if (!ctaSection || !petalLeft || !petalRight) return;

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate petals on section enter
        petalLeft.style.animation  = 'float 4s ease-in-out infinite';
        petalRight.style.animation = 'float 4s ease-in-out 1s infinite';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(ctaSection);
}


/* ============================================================
   UTILITY: Animate the story section number accent on first view
   ============================================================ */

/**
 * Triggers a brief color pulse on the story stats numbers
 * when they first appear in the viewport.
 */
function initStoryStatsPulse() {
  const stats = document.querySelectorAll('.story-stat .stat-number');

  if (!stats.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'color 0.3s ease';

        // Brief pulse to gold then back to primary
        setTimeout(() => {
          entry.target.style.color = 'var(--color-gold)';
          setTimeout(() => {
            entry.target.style.color = 'var(--color-primary)';
          }, 600);
        }, 500);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 1.0 });

  stats.forEach(stat => observer.observe(stat));
}


/* ============================================================
   BOOT — Run after DOM is ready and global.js has initialised
   ============================================================ */

/**
 * We wait a tick to ensure global.js has fully run
 * (including loadNavbarAndFooter which is async).
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Small delay to let global.js init settle
    setTimeout(() => {
      initAboutPage();
      initStoryStatsPulse();
    }, 150);
  });
} else {
  setTimeout(() => {
    initAboutPage();
    initStoryStatsPulse();
  }, 150);
}


/* ============================================================
   END OF ABOUT.JS — Rose & Stem v1.0.0
   ============================================================ */
