/**
 * Rose & Stem — Pricing Page JS
 * File: pricing/pricing.js
 * Depends on: ../global-js/global.js (loaded before this file)
 *
 * Features:
 *  - Monthly / Annual billing toggle with animated price swap
 *  - FAQ accordion (extends global accordion init)
 *  - Sticky plan highlights on scroll
 */

'use strict';

/* ── Billing Toggle ──────────────────────────────────────── */

/**
 * Initialises the monthly / annual billing toggle.
 * Reads data-monthly and data-annual attributes from .plan-price elements
 * and swaps the displayed price + billed note on click.
 */
function initBillingToggle() {
  const btnMonthly = document.getElementById('btn-monthly');
  const btnAnnual  = document.getElementById('btn-annual');
  if (!btnMonthly || !btnAnnual) return;

  const priceEls = document.querySelectorAll('.plan-price');
  const noteIds  = ['note-blossom', 'note-bloom', 'note-gold'];

  /**
   * Switch prices to the chosen billing period.
   * @param {'monthly'|'annual'} period
   */
  function switchBilling(period) {
    const isAnnual = period === 'annual';

    /* Update toggle button states */
    btnMonthly.classList.toggle('active', !isAnnual);
    btnAnnual.classList.toggle('active',   isAnnual);
    btnMonthly.setAttribute('aria-pressed', String(!isAnnual));
    btnAnnual.setAttribute('aria-pressed',  String(isAnnual));

    /* Animate price elements */
    priceEls.forEach(el => {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(-6px)';

      setTimeout(() => {
        el.textContent    = isAnnual ? el.dataset.annual : el.dataset.monthly;
        el.style.opacity  = '1';
        el.style.transform = 'translateY(0)';
      }, 180);
    });

    /* Update billing notes */
    const noteText = isAnnual ? 'Billed annually (save 20%)' : 'Billed monthly';
    noteIds.forEach(id => {
      const noteEl = document.getElementById(id);
      if (noteEl) noteEl.textContent = noteText;
    });
  }

  btnMonthly.addEventListener('click', () => switchBilling('monthly'));
  btnAnnual.addEventListener('click',  () => switchBilling('annual'));
}

/* ── FAQ Accordion ───────────────────────────────────────── */

/**
 * Initialises the FAQ accordion with smooth height animation
 * and ARIA state management.
 */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-accordion .accordion-item');

  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');

    if (!trigger || !content) return;

    // Initial state
    content.style.height = '0px';
    content.style.overflow = 'hidden';

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherContent = other.querySelector('.accordion-content');
          const otherTrigger = other.querySelector('.accordion-trigger');

          if (otherContent) otherContent.style.height = '0px';
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        // CLOSE
        item.classList.remove('open');
        content.style.height = '0px';
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        // OPEN
        item.classList.add('open');
        content.style.height = content.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
});

/* ── Popular Plan Highlight ──────────────────────────────── */

/**
 * Adds a subtle pulsing glow to the popular pricing card
 * to draw the eye on load.
 */
function highlightPopularCard() {
  const popularCard = document.querySelector('.pricing-card-popular');
  if (!popularCard) return;

  /* Brief entrance animation after cards reveal */
  setTimeout(() => {
    popularCard.style.transition = 'box-shadow 0.6s ease';
    popularCard.style.boxShadow  =
      'var(--shadow-xl), 0 0 0 2px var(--color-primary), 0 0 32px rgba(200,76,106,0.3)';

    setTimeout(() => {
      popularCard.style.boxShadow =
        'var(--shadow-lg), 0 0 0 1px var(--color-primary)';
    }, 800);
  }, 900);
}

/* ── Smooth Anchor for CTA buttons ──────────────────────── */

/**
 * Allows "#plans" hash links within the page to scroll
 * smoothly to the pricing grid.
 */
function initSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const navbarH = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--navbar-height'),
          10
        ) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navbarH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ── Page-specific Lucide icon re-init ───────────────────── */

/**
 * Re-runs lucide.createIcons() after dynamic content is ready.
 * The global.js already calls this but pricing-specific icons
 * added after the fact need a second pass.
 */
function reinitIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ── Init ────────────────────────────────────────────────── */

/**
 * Main initialisation function — called once the DOM is ready
 * (global.js fires DOMContentLoaded first, which loads the
 * navbar/footer and kicks off global utilities).
 */
function initPricingPage() {
  initBillingToggle();
  initFaqAccordion();
  highlightPopularCard();
  initSmoothScrollLinks();

  /* Re-init icons after a short delay to ensure
     navbar/footer HTML has been injected by global.js */
  setTimeout(reinitIcons, 300);
}

/* Bootstrap */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPricingPage);
} else {
  initPricingPage();
}
