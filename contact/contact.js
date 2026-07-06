/**
 * ============================================================
 * ROSE & STEM — Contact Page JavaScript
 * contact/contact.js
 *
 * TABLE OF CONTENTS
 * 1.  Subject Tab Switcher
 * 2.  Dynamic Field Visibility (tab-aware form fields)
 * 3.  Form Validation & Submission
 * 4.  Delivery Date — set minimum to today
 * 5.  Accordion (FAQ) — overrides global with icon swap
 * 6.  Map iframe — lazy load after scroll
 * 7.  Character counter on textarea
 * 8.  Reset form after success
 * 9.  Page Init
 * ============================================================
 */

'use strict';


/* ============================================================
   1. SUBJECT TAB SWITCHER
   Switches active tab and updates the hidden subject field.
   Also shows/hides context-sensitive form fields.
   ============================================================ */

function initSubjectTabs() {
  const tabs       = document.querySelectorAll('.subject-tab');
  const subjectInput = document.getElementById('subject-input');

  if (!tabs.length || !subjectInput) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      // Activate clicked
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update hidden field
      const subject = tab.dataset.subject;
      subjectInput.value = subject;

      // Update visible fields based on subject
      updateFieldVisibility(subject);
    });
  });
}


/* ============================================================
   2. DYNAMIC FIELD VISIBILITY
   Show/hide occasion, date, budget fields based on active tab
   ============================================================ */

function updateFieldVisibility(subject) {
  const occasionGroup = document.getElementById('occasion-group');
  const dateGroup     = document.getElementById('date-group');
  const budgetGroup   = document.getElementById('budget-group');

  // Default — show all
  const showOccasion = ['order', 'advice', 'other'].includes(subject);
  const showDate     = ['order', 'delivery'].includes(subject);
  const showBudget   = ['order', 'advice'].includes(subject);

  toggleField(occasionGroup, showOccasion);
  toggleField(dateGroup,     showDate);
  toggleField(budgetGroup,   showBudget);
}

/**
 * Smoothly show or hide a form field group.
 * @param {HTMLElement|null} el
 * @param {boolean} show
 */
function toggleField(el, show) {
  if (!el) return;

  if (show) {
    el.style.maxHeight  = el.scrollHeight + 'px';
    el.style.opacity    = '1';
    el.style.overflow   = 'visible';
    el.style.marginBottom = 'var(--space-3)';
    el.setAttribute('aria-hidden', 'false');
  } else {
    el.style.maxHeight  = '0';
    el.style.opacity    = '0';
    el.style.overflow   = 'hidden';
    el.style.marginBottom = '0';
    el.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Set up CSS transitions on collapsible field groups.
 */
function initFieldTransitions() {
  const groups = [
    document.getElementById('occasion-group'),
    document.getElementById('date-group'),
    document.getElementById('budget-group'),
  ];

  groups.forEach(el => {
    if (!el) return;
    el.style.transition = 'max-height 0.35s ease, opacity 0.3s ease, margin-bottom 0.3s ease';
    el.style.overflow   = 'hidden';
    // Initial: show all (default tab is "order")
    el.style.maxHeight  = '200px';
    el.style.opacity    = '1';
  });
}


/* ============================================================
   3. FORM VALIDATION & SUBMISSION
   ============================================================ */

function initContactForm() {
  const form       = document.getElementById('contact-form');
  const successDiv = document.getElementById('form-success');
  const submitBtn  = form ? form.querySelector('.submit-btn') : null;

  if (!form) return;

  // Live validation on blur
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('blur', () => validateContactField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-error')) validateContactField(field);
    });
  });

  // Special: checkbox validation
  const privacyCheckbox = document.getElementById('privacy');
  if (privacyCheckbox) {
    privacyCheckbox.addEventListener('change', () => {
      const errEl = document.getElementById('privacy-error');
      if (privacyCheckbox.checked) {
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      }
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(field => {
      if (!validateContactField(field)) isValid = false;
    });

    // Validate checkbox separately
    const privacy = document.getElementById('privacy');
    const privacyErr = document.getElementById('privacy-error');
    if (privacy && !privacy.checked) {
      isValid = false;
      if (privacyErr) {
        privacyErr.textContent = 'Please accept the privacy policy to continue.';
        privacyErr.style.display = 'flex';
      }
    }

    if (!isValid) {
      // Focus first error
      const firstErr = form.querySelector('.is-error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Disable submit, show loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Sending…
      `;
    }

    // Simulate API call — swap with real endpoint
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Hide form fields, show success
    form.querySelectorAll('.form-group, .form-row, .subject-tabs, .form-card-header, .subject-tabs')
        .forEach(el => el.style.display = 'none');

    if (submitBtn) submitBtn.style.display = 'none';
    if (successDiv) successDiv.removeAttribute('hidden');

    // Toast notification
    if (window.RoseAndStem?.showToast) {
      window.RoseAndStem.showToast('🌹 Message received! We\'ll reply shortly.', 'success', 5000);
    }
  });
}

/**
 * Validate a single form field with custom rules.
 * @param {HTMLElement} field
 * @returns {boolean}
 */
function validateContactField(field) {
  // Skip hidden or display:none fields
  if (field.type === 'hidden') return true;
  const parent = field.closest('.form-group') || field.parentElement;
  if (parent && parent.getAttribute('aria-hidden') === 'true') return true;
  // Skip checkbox — handled separately
  if (field.type === 'checkbox') return true;

  const value   = field.value.trim();
  const type    = field.type;
  let errorEl   = field.parentElement.querySelector('.form-error');

  if (!errorEl) {
    // Try sibling .form-error
    errorEl = field.closest('.form-group')?.querySelector('.form-error') || null;
  }

  let error = '';

  if (field.hasAttribute('required') && !value) {
    const label = field.closest('.form-group')?.querySelector('.form-label')?.textContent
                  .replace(' *', '').trim() || 'This field';
    error = `${label} is required.`;
  } else if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = 'Please enter a valid email address.';
  } else if (type === 'tel' && value && !/^[6-9]\d{9}$/.test(value.replace(/[\s\-+()]/g, ''))) {
    error = 'Enter a valid 10-digit Indian mobile number.';
  } else if (field.minLength > 0 && value && value.length < field.minLength) {
    error = `Minimum ${field.minLength} characters required.`;
  } else if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
    error = field.dataset.patternError || 'Invalid format.';
  }

  if (errorEl) {
    if (error) {
      field.classList.add('is-error');
      field.classList.remove('is-success');
      errorEl.textContent = error;
      errorEl.style.display = 'flex';
    } else {
      field.classList.remove('is-error');
      if (value) field.classList.add('is-success');
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  return !error;
}


/* ============================================================
   4. DELIVERY DATE MINIMUM — set to today
   ============================================================ */

function initDeliveryDate() {
  const dateInput = document.getElementById('delivery-date');
  if (!dateInput) return;

  const today = new Date();
  // Format as YYYY-MM-DD (required by date input)
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;

  // Default to tomorrow for UX
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const td = String(tomorrow.getDate()).padStart(2, '0');
  dateInput.value = `${yyyy}-${tm}-${td}`;
}


/* ============================================================
   5. FAQ ACCORDION
   Uses global accordion logic but adds icon rotation.
   The global.js initAccordions() handles the core logic;
   here we just ensure Lucide icon swap works correctly.
   ============================================================ */

function initFAQAccordion() {
  // Re-init accordions (global may have run before FAQ was in DOM)
  document.querySelectorAll('.accordion').forEach(accordion => {
    const items = accordion.querySelectorAll('.accordion-item');

    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      const content = item.querySelector('.accordion-content');
      if (!trigger || !content) return;

      // Init collapsed
      content.style.maxHeight  = '0';
      content.style.overflow   = 'hidden';
      content.style.transition = 'max-height 0.35s ease';

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all siblings
        items.forEach(other => {
          if (other !== item && other.classList.contains('open')) {
            other.classList.remove('open');
            const otherContent = other.querySelector('.accordion-content');
            const otherTrigger = other.querySelector('.accordion-trigger');
            if (otherContent) otherContent.style.maxHeight = '0';
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle this
        if (isOpen) {
          item.classList.remove('open');
          content.style.maxHeight = '0';
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}


/* ============================================================
   6. MAP IFRAME — lazy load on scroll into view
   ============================================================ */

function initMapLazyLoad() {
  const mapWrapper = document.querySelector('.map-wrapper');
  const iframe     = mapWrapper ? mapWrapper.querySelector('iframe') : null;
  if (!iframe) return;

  // Store real src in data-src and clear src to prevent eager load
  const realSrc = iframe.getAttribute('src');
  if (!realSrc) return;

  iframe.setAttribute('data-src', realSrc);
  iframe.removeAttribute('src');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          iframe.src = iframe.dataset.src;
          observer.unobserve(mapWrapper);
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(mapWrapper);
  } else {
    // Fallback — load immediately
    iframe.src = realSrc;
  }
}


/* ============================================================
   7. CHARACTER COUNTER on Textarea
   ============================================================ */

function initCharCounter() {
  const textarea = document.getElementById('message');
  if (!textarea) return;

  // Create counter element
  const counter = document.createElement('span');
  counter.className = 'form-help char-counter';
  counter.style.display = 'block';
  counter.style.textAlign = 'right';
  counter.setAttribute('aria-live', 'polite');
  textarea.closest('.form-group')?.querySelector('.form-help')?.insertAdjacentElement('afterend', counter) ||
    textarea.insertAdjacentElement('afterend', counter);

  function update() {
    const len  = textarea.value.length;
    const min  = parseInt(textarea.minLength || '0', 10);
    const max  = 800;
    counter.textContent = `${len} / ${max} characters`;
    counter.style.color = len < min
      ? '#e63946'
      : len > max * 0.85
      ? 'var(--color-gold)'
      : 'var(--text-muted)';
  }

  textarea.addEventListener('input', update);
  update();
}


/* ============================================================
   8. RESET FORM after "Send another message" button
   ============================================================ */

function initFormReset() {
  const resetBtn = document.getElementById('reset-form-btn');
  const form     = document.getElementById('contact-form');
  const successDiv = document.getElementById('form-success');

  if (!resetBtn || !form || !successDiv) return;

  resetBtn.addEventListener('click', () => {
    // Hide success
    successDiv.setAttribute('hidden', '');

    // Show all form groups
    form.querySelectorAll('.form-group, .form-row').forEach(el => {
      el.style.display = '';
    });

    // Show form header and subject tabs
    const header     = form.closest('.form-card')?.querySelector('.form-card-header');
    const tabs       = form.closest('.form-card')?.querySelector('.subject-tabs');
    const submitBtn  = form.querySelector('.submit-btn');

    if (header) header.style.display = '';
    if (tabs)   tabs.style.display = '';

    // Reset form values
    form.reset();

    // Re-enable submit button and restore text
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Send Message
      `;
    }

    // Remove all validation state classes
    form.querySelectorAll('.is-error, .is-success').forEach(el => {
      el.classList.remove('is-error', 'is-success');
    });
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });

    // Reset subject to first tab
    const firstTab = form.closest('.form-card')?.querySelector('.subject-tab');
    if (firstTab) {
      form.closest('.form-card')?.querySelectorAll('.subject-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      firstTab.classList.add('active');
      firstTab.setAttribute('aria-selected', 'true');
      document.getElementById('subject-input').value = firstTab.dataset.subject;
      updateFieldVisibility(firstTab.dataset.subject);
    }

    // Re-init lucide icons inside the form
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Re-set delivery date min
    initDeliveryDate();
  });
}


/* ============================================================
   PAGE INIT
   ============================================================ */

function initContactPage() {
  // Run field transitions setup before tabs to avoid flash
  initFieldTransitions();
  initSubjectTabs();
  initContactForm();
  initDeliveryDate();
  initFAQAccordion();
  initMapLazyLoad();
  initCharCounter();
  initFormReset();

  // Init Lucide icons after all dynamic content is ready
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', initContactPage);

/* ============================================================
   END OF CONTACT.JS
   Rose & Stem — v1.0.0
   ============================================================ */
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const accordion = item.closest('.accordion');
    const content = item.querySelector('.accordion-content');
    const isOpen = item.classList.contains('open');

    // Close others in this accordion
    if (accordion.dataset.multiple === 'false') {
      accordion.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');

          const openTrigger = openItem.querySelector('.accordion-trigger');
          const openContent = openItem.querySelector('.accordion-content');

          openTrigger.setAttribute('aria-expanded', 'false');
          openContent.style.maxHeight = null;
        }
      });
    }

    // Toggle current item
    item.classList.toggle('open');

    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      trigger.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = null;
    }
  });
});