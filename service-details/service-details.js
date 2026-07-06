/**
 * Rose & Stem — Service Details Shared JavaScript
 * /service-details/service-details.js
 * Used by: service-details-1.html through service-details-6.html
 *
 * This file contains ONLY page-specific logic.
 * All shared utilities (ThemeManager, RTLManager, showToast, openModal,
 * closeModal, initScrollReveal, initAccordions, initCounters, etc.)
 * are already initialised by ../global-js/global.js.
 *
 * We hook into window.RoseAndStem.* for any cross-module calls.
 */

'use strict';

/* ==========================================================================
   PAGE INIT — runs after global.js has booted
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initGalleryLightbox();
  initQuickOrderForm();
  initDatePickerMin();
  initStickyHeroCTA();
  initRelatedCardHover();
});


/* ==========================================================================
   1. IMAGE GALLERY LIGHTBOX
   Opens a full-screen overlay when a gallery thumbnail is clicked.
   Supports keyboard navigation (← → Esc) and prev/next buttons.
   ========================================================================== */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.sd-gallery__item');
  const lightbox     = document.getElementById('sd-lightbox');
  if (!lightbox || !galleryItems.length) return;

  const lightboxImg     = lightbox.querySelector('.sd-lightbox__img');
  const lightboxCaption = lightbox.querySelector('.sd-lightbox__caption');
  const btnClose        = lightbox.querySelector('.sd-lightbox__close');
  const btnPrev         = lightbox.querySelector('.sd-lightbox__nav--prev');
  const btnNext         = lightbox.querySelector('.sd-lightbox__nav--next');

  // Build ordered list of { src, alt } from gallery
  const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return { src: img?.src || '', alt: img?.alt || '' };
  });

  let currentIndex = 0;

  /* ── Open lightbox at index ── */
  function openAt(index) {
    currentIndex = (index + images.length) % images.length;
    const { src, alt } = images[currentIndex];
    lightboxImg.src           = src;
    lightboxImg.alt           = alt;
    if (lightboxCaption) lightboxCaption.textContent = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    btnClose?.focus();
  }

  /* ── Close lightbox ── */
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Return focus to the thumbnail that opened it
    galleryItems[currentIndex]?.focus();
  }

  /* ── Navigate ── */
  function showPrev() { openAt(currentIndex - 1); }
  function showNext() { openAt(currentIndex + 1); }

  /* ── Bind gallery item clicks ── */
  galleryItems.forEach((item, i) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View image ${i + 1} of ${images.length} in full screen`);

    item.addEventListener('click', () => openAt(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt(i);
      }
    });
  });

  /* ── Lightbox controls ── */
  btnClose?.addEventListener('click', closeLightbox);
  btnPrev?.addEventListener('click',  showPrev);
  btnNext?.addEventListener('click',  showNext);

  /* ── Click backdrop to close ── */
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ── Keyboard navigation ── */
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')    { closeLightbox(); }
    if (e.key === 'ArrowLeft') { showPrev(); }
    if (e.key === 'ArrowRight'){ showNext(); }
  });

  /* ── Touch/swipe support ── */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? showNext() : showPrev();
    }
  }, { passive: true });
}


/* ==========================================================================
   2. QUICK ORDER SIDEBAR FORM
   Client-side validation + toast feedback.
   Does NOT duplicate global initFormValidation — only adds page-level logic.
   ========================================================================== */
function initQuickOrderForm() {
  const form = document.getElementById('sd-quick-order-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    /* ── Validate required fields ── */
    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        const err = document.createElement('span');
        err.className   = 'form-error';
        err.textContent = 'This field is required.';
        field.insertAdjacentElement('afterend', err);
      }
    });

    if (!isValid) {
      form.querySelector('.error')?.focus();
      return;
    }

    /* ── Mock submission ── */
    const submitBtn = form.querySelector('[type="submit"]');
    const original  = submitBtn.textContent;

    submitBtn.disabled     = true;
    submitBtn.textContent  = 'Placing Order…';

    setTimeout(() => {
      submitBtn.disabled    = false;
      submitBtn.textContent = original;
      form.reset();

      // Use global showToast (exposed via window.RoseAndStem)
      if (window.RoseAndStem?.showToast) {
        window.RoseAndStem.showToast(
          '🌹 Order request received! We\'ll confirm within 30 minutes.',
          'success',
          5000
        );
      }
    }, 1200);
  });
}


/* ==========================================================================
   3. DATE PICKER — set minimum date to today
   ========================================================================== */
function initDatePickerMin() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  if (!dateInputs.length) return;

  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    if (!input.min) input.min = today;
  });
}


/* ==========================================================================
   4. STICKY "ORDER NOW" CTA — appears after hero scrolls out of view
   Gives a persistent call-to-action without blocking the main content.
   ========================================================================== */
function initStickyHeroCTA() {
  // Only show if page has the hero section
  const hero = document.querySelector('.sd-hero');
  if (!hero) return;

  // Create the sticky bar element
  const bar = document.createElement('div');
  bar.id            = 'sd-sticky-cta';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: var(--z-sticky);
    background: var(--bg-navbar);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--border-color);
    padding: 12px var(--container-px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    transform: translateY(100%);
    transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 -4px 24px rgba(200,76,106,0.12);
  `;

  // Read service name from hero title
  const titleEl   = document.querySelector('.sd-hero__title');
  const titleText = titleEl ? titleEl.textContent.trim().replace(/\n/g, ' ').substring(0, 40) : 'This Service';

  bar.innerHTML = `
    <span style="font-family:var(--font-heading);font-size:var(--text-base);font-weight:600;color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;">
      ${titleText}
    </span>
    <a href="#sd-quick-order-form"
       class="btn btn-primary btn-sm"
       onclick="document.getElementById('sd-quick-order-form')?.scrollIntoView({behavior:'smooth',block:'center'});return false;"
       aria-label="Jump to quick order form">
      Order Now
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </a>
  `;

  document.body.appendChild(bar);

  // Show after hero exits viewport; hide when footer comes into view
  const footer = document.querySelector('.footer');

  function updateBar() {
    const heroBottom   = hero.getBoundingClientRect().bottom;
    const footerTop    = footer ? footer.getBoundingClientRect().top : Infinity;
    const windowHeight = window.innerHeight;

    const shouldShow = heroBottom < 0 && footerTop > windowHeight;

    bar.style.transform      = shouldShow ? 'translateY(0)' : 'translateY(100%)';
    bar.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  }

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
}


/* ==========================================================================
   5. RELATED SERVICE CARDS — subtle parallax tilt on mouse move
   ========================================================================== */
function initRelatedCardHover() {
  // Skip on touch devices — hover not relevant
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.sd-related__card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
      const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      card.style.transform  = `translateY(-3px) rotateX(${-y.toFixed(1)}deg) rotateY(${x.toFixed(1)}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    });
  });
}
