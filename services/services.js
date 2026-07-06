/**
 * Rose & Stem — Services Page JavaScript
 * /services/services.js
 *
 * Page-specific enhancements:
 * - Service card hover depth effect
 * - Smooth scroll to service categories
 * - Service filter tabs (optional future use)
 * - CTA button ripple effect
 */

'use strict';

/* ==========================================================================
   INITIALISE PAGE
   ========================================================================== */
(function initServicesPage() {

  document.addEventListener('DOMContentLoaded', () => {
    initServiceCardEffects();
    initSmoothScrollLinks();
    initCTAParallax();
    initProcessStepHover();
  });

  /* -----------------------------------------------------------------------
     SERVICE CARD — subtle depth tilt on mouse move
     ----------------------------------------------------------------------- */
  function initServiceCardEffects() {
    const cards = document.querySelectorAll('.service-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect  = card.getBoundingClientRect();
        const x     = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
        const y     = (e.clientY - rect.top)  / rect.height - 0.5;

        // Very subtle tilt — keeps it refined, not gimmicky
        card.style.transform = `
          translateY(-6px)
          rotateX(${(-y * 4).toFixed(2)}deg)
          rotateY(${(x * 4).toFixed(2)}deg)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.15s ease, box-shadow 0.25s ease';
      });
    });
  }

  /* -----------------------------------------------------------------------
     SMOOTH SCROLL — handle #services anchor in navbar
     ----------------------------------------------------------------------- */
  function initSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const targetId = anchor.getAttribute('href').slice(1);
        const target   = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();
        const navbarHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
          10
        ) || 72;

        const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* -----------------------------------------------------------------------
     CTA BANNER — subtle parallax on scroll
     ----------------------------------------------------------------------- */
  function initCTAParallax() {
    const ctaBg = document.querySelector('.cta-banner-bg img');
    if (!ctaBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function updateParallax() {
      const banner = ctaBg.closest('.cta-banner');
      if (!banner) return;

      const rect     = banner.getBoundingClientRect();
      const vHeight  = window.innerHeight;
      const progress = 1 - (rect.top + rect.height) / (vHeight + rect.height);
      const shift    = (progress - 0.5) * 40; // 40px total range

      ctaBg.style.transform = `translateY(${shift.toFixed(2)}px)`;
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
  }

  /* -----------------------------------------------------------------------
     PROCESS STEPS — stagger animation on scroll into view
     ----------------------------------------------------------------------- */
  function initProcessStepHover() {
    if (!('IntersectionObserver' in window)) return;

    const steps = document.querySelectorAll('.process-step');
    const obs   = new IntersectionObserver(entries => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Stagger each step
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 120);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    steps.forEach(step => {
      step.style.opacity   = '0';
      step.style.transform = 'translateY(20px)';
      step.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      obs.observe(step);
    });

    // Add 'visible' class via JS since we override with inline styles
    const style = document.createElement('style');
    style.textContent = `.process-step.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);
  }

})();
