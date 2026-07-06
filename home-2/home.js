/**
 * ============================================================
 * ROSE & STEM — Home Page 2 JavaScript
 * Page: Subscription / Reminder-Based Landing
 * Version: 1.0.0
 * Depends on: ../global-js/global.js (loaded first)
 * ============================================================
 *
 * TABLE OF CONTENTS
 * 1.  Countdown Timer (Hero reminder card)
 * 2.  Billing Toggle (Monthly / Annually pricing switch)
 * 3.  Occasion Builder — Add button interaction
 * 4.  Plan card CTA hover enhancement
 * 5.  Testimonials grid slider override
 * 6.  Stats section entrance animation trigger
 * 7.  Lucide Icons Init
 * 8.  Init bootstrap
 * ============================================================
 */

'use strict';

/* ============================================================
   1. COUNTDOWN TIMER
   Animates the hero reminder card countdown
   ============================================================ */

/**
 * Calculates and updates countdown to a target date.
 * For demo purposes, we count down to a fixed date 12 days away.
 */
function initCountdownTimer() {
  const daysEl  = document.getElementById('h2-days');
  const hoursEl = document.getElementById('h2-hours');
  const minsEl  = document.getElementById('h2-mins');

  if (!daysEl || !hoursEl || !minsEl) return;

  // Set target: 12 days from now (for demo)
  const target = new Date();
  target.setDate(target.getDate() + 12);
  target.setHours(8, 34, 0, 0);

  function update() {
    const now   = new Date();
    const diff  = Math.max(0, target - now);

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Animate on change
    animateCountdownDigit(daysEl,  String(days).padStart(2, '0'));
    animateCountdownDigit(hoursEl, String(hours).padStart(2, '0'));
    animateCountdownDigit(minsEl,  String(mins).padStart(2, '0'));
  }

  update();
  setInterval(update, 60000); // Update every minute
}

/**
 * Animates a countdown digit change with a brief flip effect.
 * @param {HTMLElement} el
 * @param {string}      newVal
 */
function animateCountdownDigit(el, newVal) {
  if (el.textContent === newVal) return;

  el.style.transform   = 'translateY(-6px)';
  el.style.opacity     = '0';
  el.style.transition  = 'all 0.18s ease';

  setTimeout(() => {
    el.textContent       = newVal;
    el.style.transform   = 'translateY(0)';
    el.style.opacity     = '1';
  }, 180);
}


/* ============================================================
   2. BILLING TOGGLE
   Switches plan prices between monthly and annually
   ============================================================ */

/**
 * Handles the monthly / annually billing toggle on the plans section.
 */
function initBillingToggle() {
  const toggleBtns   = document.querySelectorAll('.billing-btn');
  const priceEls     = document.querySelectorAll('.plan-card__price[data-monthly]');

  if (!toggleBtns.length) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const billing = btn.dataset.billing; // 'monthly' | 'annually'

      // Update active state
      toggleBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });

      // Update prices with animation
      priceEls.forEach(priceEl => {
        const newPrice = billing === 'annually'
          ? priceEl.dataset.annually
          : priceEl.dataset.monthly;

        // Animate price change
        priceEl.style.transform  = 'scale(0.85)';
        priceEl.style.opacity    = '0';
        priceEl.style.transition = 'all 0.2s ease';

        setTimeout(() => {
          priceEl.textContent      = newPrice;
          priceEl.style.transform  = 'scale(1)';
          priceEl.style.opacity    = '1';
        }, 200);
      });

      // Toast feedback
      if (window.RoseAndStem && window.RoseAndStem.showToast) {
        const msg = billing === 'annually'
          ? '🎉 Annual pricing applied — save up to 20%!'
          : 'Monthly pricing selected.';
        window.RoseAndStem.showToast(msg, billing === 'annually' ? 'success' : 'info', 3000);
      }
    });
  });
}


/* ============================================================
   3. OCCASION BUILDER — Add occasion interaction
   ============================================================ */

/**
 * Handles the "Add New Occasion" button in the builder card.
 * Shows a simple inline toast for demo purposes.
 */
function initOccasionBuilder() {
  const addBtn = document.querySelector('.ob-add-btn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    // Animate button
    addBtn.style.transform  = 'scale(0.96)';
    addBtn.style.transition = 'transform 0.15s ease';

    setTimeout(() => {
      addBtn.style.transform = 'scale(1)';
    }, 150);

    // Show toast — in real app this would open a modal/form
    if (window.RoseAndStem && window.RoseAndStem.showToast) {
      window.RoseAndStem.showToast(
        '🌹 Create a free account to save unlimited occasions!',
        'info',
        4000
      );
    }
  });

  // Occasion row click — highlight effect
  document.querySelectorAll('.ob-occasion').forEach(row => {
    row.addEventListener('click', () => {
      // Remove active from all
      document.querySelectorAll('.ob-occasion').forEach(r => r.classList.remove('ob-occasion--active'));
      // Add to clicked
      row.classList.add('ob-occasion--active');
    });
  });
}


/* ============================================================
   4. PLAN CARD CTA HOVER ENHANCEMENT
   ============================================================ */

/**
 * Adds a subtle shimmer / highlight to plan card CTAs on hover.
 */
function initPlanCardEffects() {
  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.willChange = 'transform, box-shadow';
    });

    card.addEventListener('mouseleave', () => {
      card.style.willChange = 'auto';
    });
  });
}


/* ============================================================
   5. TESTIMONIALS GRID SLIDER OVERRIDE
   ============================================================ */

/**
 * The testimonial slider in home-2 uses a 3-column grid layout per slide.
 * The global.js handles the base slider logic, but we override the
 * track width behaviour here for the multi-column layout.
 */
function initTestimonialsHome2() {
  // The global testimonial slider handles init automatically via
  // window.RoseAndStem.initTestimonialSliders() or initGlobal().
  // This function adds page-specific touch improvements.

  const slider = document.querySelector('.testimonials-section .testimonial-slider');
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  if (!track) return;

  // Ensure the track behaves correctly for the 3-col layout
  track.style.width = '100%';

  // Add keyboard navigation hint for accessibility
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      const prevBtn = slider.querySelector('.slider-prev');
      if (prevBtn) prevBtn.click();
    } else if (e.key === 'ArrowRight') {
      const nextBtn = slider.querySelector('.slider-next');
      if (nextBtn) nextBtn.click();
    }
  });
}


/* ============================================================
   6. HERO CTA — Smooth scroll enhancement
   ============================================================ */

/**
 * "See How It Works" button smooth scrolls to #how-it-works
 * with additional navbar offset (handled globally, but we
 * also add a pulsing highlight to the target section).
 */
function initHeroScrollCTA() {
  const howItWorksLink = document.querySelector('a[href="#how-it-works"]');
  const howItWorksSection = document.getElementById('how-it-works');

  if (!howItWorksLink || !howItWorksSection) return;

  howItWorksLink.addEventListener('click', () => {
    // Brief pulse highlight
    setTimeout(() => {
      howItWorksSection.style.transition  = 'box-shadow 0.4s ease';
      howItWorksSection.style.boxShadow   = '0 0 0 4px rgba(200, 76, 106, 0.15)';

      setTimeout(() => {
        howItWorksSection.style.boxShadow = 'none';
      }, 1000);
    }, 600);
  });
}


/* ============================================================
   7. LUCIDE ICONS INIT
   Called after DOM is ready to render all icon placeholders
   ============================================================ */

/**
 * Initialise Lucide icons. Called after component HTML is injected.
 */
function initLucideIcons() {
  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}


/* ============================================================
   8. ADDON CARDS — Quick add to plan interaction
   ============================================================ */

/**
 * Handles clicks on add-on cards — shows a toast confirming
 * the add-on was noted. In a real app this would update cart/plan.
 */
function initAddonCards() {
  document.querySelectorAll('.addon-card').forEach(card => {
    // Make card focusable and interactive
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Add ${card.querySelector('.addon-card__title')?.textContent?.trim() || 'item'} to your plan`);

    const activate = () => {
      const title = card.querySelector('.addon-card__title')?.textContent?.trim() || 'Item';
      const price = card.querySelector('.addon-card__price')?.textContent?.trim() || '';

      // Pulse animation
      card.style.transform  = 'translateY(-6px) scale(1.02)';
      card.style.transition = 'transform 0.2s ease';

      setTimeout(() => {
        card.style.transform = '';
      }, 200);

      if (window.RoseAndStem && window.RoseAndStem.showToast) {
        window.RoseAndStem.showToast(
          `🌹 ${title} (${price}) added to your plan!`,
          'success',
          3500
        );
      }
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}


/* ============================================================
   9. SCROLL-BASED NAVBAR TRANSPARENCY
   In hero section, make navbar slightly more transparent
   ============================================================ */

/**
 * Adjusts navbar opacity based on scroll position in the hero.
 */
function initHeroNavbarEffect() {
  const hero = document.querySelector('.hero-2');
  if (!hero) return;

  // This supplements the global navbar scroll behavior
  // Just ensuring smooth visual on hero scroll
  const heroBottom = hero.offsetHeight;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const navbar   = document.querySelector('.navbar');
    if (!navbar) return;

    if (scrolled < heroBottom * 0.3) {
      navbar.style.borderBottomColor = 'transparent';
    } else {
      navbar.style.borderBottomColor = '';
    }
  }, { passive: true });
}


/* ============================================================
   10. BLOG CARD — Read time progress indicator on hover
   ============================================================ */

/**
 * Shows a subtle read-progress bar on blog card hover.
 */
function initBlogCardEffects() {
  document.querySelectorAll('.blog-preview .blog-card').forEach(card => {
    // Add hover-enter class for extra animation
    card.addEventListener('mouseenter', () => {
      card.classList.add('is-hovered');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hovered');
    });
  });
}


/* ============================================================
   INIT — Bootstrap all page-specific functionality
   ============================================================ */

/**
 * Main page init — runs after DOM ready.
 * Global init (theme, navbar, etc.) is handled by global.js.
 */
function initHome2() {

  /* Icons — run immediately and also after a short delay
     to catch dynamically injected navbar/footer icons */
  initLucideIcons();
  setTimeout(initLucideIcons, 300);
  setTimeout(initLucideIcons, 800);

  /* Page-specific features */
  initCountdownTimer();
  initBillingToggle();
  initOccasionBuilder();
  initPlanCardEffects();
  initHeroScrollCTA();
  initHeroNavbarEffect();
  initAddonCards();
  initBlogCardEffects();

  /* Testimonials — after global.js has run its slider init
     we apply our page-specific overrides */
  setTimeout(initTestimonialsHome2, 500);
}


/* ============================================================
   DOM READY — Entry point
   global.js loads first and calls initGlobal() which handles
   navbar/footer loading, theme, scroll reveal, etc.
   We hook into DOMContentLoaded for page-specific init.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* Run immediately */
  initHome2();

  /* Re-run icon init after navbar/footer components finish loading
     (global.js loads them async, icons inside may need re-init) */
  document.addEventListener('themeChange', () => {
    // Re-apply any theme-sensitive page logic here if needed
  });

  /* Also trigger Lucide after the custom 'navbarLoaded' event
     which global.js dispatches after component injection */
  document.addEventListener('navbarLoaded', initLucideIcons);
  document.addEventListener('footerLoaded', initLucideIcons);

  /* Fallback: ensure icons render even if events fire before listeners attach */
  window.addEventListener('load', initLucideIcons);
});
  
/* ============================================================
   END OF HOME-2/HOME.JS
   Rose & Stem — v1.0.0
   ============================================================ */
