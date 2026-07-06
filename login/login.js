/**
 * ============================================================
 * ROSE & STEM — Login / Register Shared JavaScript
 * login/login.js  (used by both login.html and register.html)
 *
 * TABLE OF CONTENTS
 * 1.  Theme Manager (self-contained, no global.js dependency)
 * 2.  RTL Manager
 * 3.  Password Visibility Toggle
 * 4.  Password Strength Meter (register page)
 * 5.  Form Field Validation
 * 6.  Login Form Submit Handler
 * 7.  Register Form Submit Handler
 * 8.  Social Button Handlers (Google, Apple)
 * 9.  Subtle rose hover effect on submit button
 * 10. Init
 * ============================================================
 */

'use strict';


/* ============================================================
   1. THEME MANAGER — self-contained
   ============================================================ */
const Theme = (() => {
  const KEY = 'roseAndStem_theme';

  function get() {
    return localStorage.getItem(KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);

    // Update icons
    document.querySelectorAll('.icon-moon').forEach(el => {
      el.style.display = theme === 'dark' ? 'none' : 'block';
    });
    document.querySelectorAll('.icon-sun').forEach(el => {
      el.style.display = theme === 'dark' ? 'block' : 'none';
    });
  }

  function toggle() {
    apply(get() === 'dark' ? 'light' : 'dark');
  }

  function init() {
    apply(get());
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  return { init, apply, get };
})();


/* ============================================================
   2. RTL MANAGER — self-contained
   ============================================================ */
const RTL = (() => {
  const KEY = 'roseAndStem_rtl';

  function get() { return localStorage.getItem(KEY) || 'ltr'; }

  function apply(dir) {
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem(KEY, dir);
  }

  function toggle() { apply(get() === 'rtl' ? 'ltr' : 'rtl'); }

  function init() {
    apply(get());
    const btn = document.getElementById('rtlToggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  return { init };
})();


/* ============================================================
   3. PASSWORD VISIBILITY TOGGLE
   ============================================================ */

/**
 * Bind a password toggle button.
 * @param {string} toggleId   - button element ID
 * @param {string} inputId    - password input ID
 */
function initPasswordToggle(toggleId, inputId) {
  const btn   = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';

    const eyeOpen   = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');

    if (eyeOpen)   eyeOpen.style.display   = isHidden ? 'none'  : 'block';
    if (eyeClosed) eyeClosed.style.display = isHidden ? 'block' : 'none';

    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
}


/* ============================================================
   4. PASSWORD STRENGTH METER (register page only)
   ============================================================ */

/**
 * Calculate password strength 0–4.
 * 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))   score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  // Cap at 4
  return Math.min(4, score);
}

function initPasswordStrength() {
  const input  = document.getElementById('reg-password');
  const bar    = document.getElementById('pw-strength-bar');
  const label  = document.getElementById('pw-strength-label');

  if (!input || !bar || !label) return;

  const levels = [
    { width: '0%',   cls: '',       text: '' },
    { width: '25%',  cls: 'weak',   text: 'Weak' },
    { width: '50%',  cls: 'fair',   text: 'Fair' },
    { width: '75%',  cls: 'good',   text: 'Good' },
    { width: '100%', cls: 'strong', text: 'Strong 🌹' },
  ];

  input.addEventListener('input', () => {
    const strength = getPasswordStrength(input.value);
    const lvl      = levels[strength];

    bar.style.width = lvl.width;
    bar.className   = 'pw-strength-bar ' + lvl.cls;
    label.textContent = lvl.text;
    label.style.color = strength === 4
      ? 'var(--rs-green)'
      : strength === 3
      ? '#60a5fa'
      : strength === 2
      ? 'var(--rs-gold)'
      : strength === 1
      ? '#e63946'
      : 'var(--rs-text-muted)';
  });
}


/* ============================================================
   5. FORM FIELD VALIDATION
   ============================================================ */

/**
 * Show an error on a field.
 */
function showFieldError(inputEl, errorId, message) {
  inputEl.classList.add('is-error');
  inputEl.classList.remove('is-valid');
  const errEl = document.getElementById(errorId);
  if (errEl) {
    errEl.textContent = message;
    errEl.style.display = 'flex';
  }
}

/**
 * Clear error on a field.
 */
function clearFieldError(inputEl, errorId) {
  inputEl.classList.remove('is-error');
  if (inputEl.value.trim()) inputEl.classList.add('is-valid');
  const errEl = document.getElementById(errorId);
  if (errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }
}

/**
 * Validate a single field — returns true if valid.
 */
function validateField(inputEl, errorId, rules = {}) {
  const value = inputEl.value.trim();

  if (rules.required && !value) {
    showFieldError(inputEl, errorId, rules.requiredMsg || 'This field is required.');
    return false;
  }

  if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    showFieldError(inputEl, errorId, 'Please enter a valid email address.');
    return false;
  }

  if (rules.minLength && value.length < rules.minLength) {
    showFieldError(inputEl, errorId, `Minimum ${rules.minLength} characters required.`);
    return false;
  }

  if (rules.phone && value && !/^[6-9]\d{9}$/.test(value.replace(/[\s\-+()]/g, ''))) {
    showFieldError(inputEl, errorId, 'Enter a valid 10-digit Indian mobile number.');
    return false;
  }

  clearFieldError(inputEl, errorId);
  return true;
}

/**
 * Attach live validation (blur + input) to a field.
 */
function attachLiveValidation(inputEl, errorId, rules) {
  if (!inputEl) return;
  inputEl.addEventListener('blur',  () => validateField(inputEl, errorId, rules));
  inputEl.addEventListener('input', () => {
    if (inputEl.classList.contains('is-error')) validateField(inputEl, errorId, rules);
    else clearFieldError(inputEl, errorId);
  });
}


/* ============================================================
   6. LOGIN FORM SUBMIT HANDLER
   ============================================================ */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('login-email');
  const pwInput    = document.getElementById('login-password');

  // Live validation
  attachLiveValidation(emailInput, 'email-err', { required: true, email: true, requiredMsg: 'Email is required.' });
  attachLiveValidation(pwInput,    'pw-err',    { required: true, minLength: 6, requiredMsg: 'Password is required.' });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all
    const emailOk = validateField(emailInput, 'email-err', { required: true, email: true, requiredMsg: 'Email is required.' });
    const pwOk    = validateField(pwInput,    'pw-err',    { required: true, minLength: 6, requiredMsg: 'Password is required.' });

    if (!emailOk || !pwOk) {
      const first = form.querySelector('.is-error');
      if (first) first.focus();
      return;
    }

    // Show loading state
    const btn = form.querySelector('.auth-submit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.8s linear infinite" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Signing in…
      `;
    }

    // Simulate auth — replace with real API
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Redirect to dashboard on success
    window.location.href = '../admin-dashboard/dashboard.html';
  });
}


/* ============================================================
   7. REGISTER FORM SUBMIT HANDLER
   ============================================================ */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const fnameInput = document.getElementById('reg-fname');
  const lnameInput = document.getElementById('reg-lname');
  const emailInput = document.getElementById('reg-email');
  const pwInput    = document.getElementById('reg-password');
  const termsInput = document.getElementById('reg-terms');

  // Live validation
  attachLiveValidation(fnameInput, 'fname-err',     { required: true, minLength: 2, requiredMsg: 'First name is required.' });
  attachLiveValidation(lnameInput, 'lname-err',     { required: true, minLength: 2, requiredMsg: 'Last name is required.' });
  attachLiveValidation(emailInput, 'reg-email-err', { required: true, email: true,  requiredMsg: 'Email is required.' });
  attachLiveValidation(pwInput,    'reg-pw-err',    { required: true, minLength: 8, requiredMsg: 'Password is required.' });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fnOk    = validateField(fnameInput, 'fname-err',     { required: true, minLength: 2, requiredMsg: 'First name is required.' });
    const lnOk    = validateField(lnameInput, 'lname-err',     { required: true, minLength: 2, requiredMsg: 'Last name is required.' });
    const emailOk = validateField(emailInput, 'reg-email-err', { required: true, email: true,  requiredMsg: 'Email is required.' });
    const pwOk    = validateField(pwInput,    'reg-pw-err',    { required: true, minLength: 8, requiredMsg: 'Password must be at least 8 characters.' });

    // Terms checkbox
    let termsOk = true;
    const termsErr = document.getElementById('terms-err');
    if (termsInput && !termsInput.checked) {
      termsOk = false;
      if (termsErr) {
        termsErr.textContent = 'Please accept the terms to continue.';
        termsErr.style.display = 'flex';
      }
    } else if (termsErr) {
      termsErr.textContent = '';
      termsErr.style.display = 'none';
    }

    if (!fnOk || !lnOk || !emailOk || !pwOk || !termsOk) {
      const first = form.querySelector('.is-error');
      if (first) first.focus();
      return;
    }

    // Loading
    const btn = form.querySelector('.auth-submit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.8s linear infinite" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Creating account…
      `;
    }

    // Simulate registration — replace with real API
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Redirect to dashboard on success
    window.location.href = '../admin-dashboard/dashboard.html';
  });
}


/* ============================================================
   8. SOCIAL BUTTON HANDLERS
   ============================================================ */
function initSocialButtons() {
  // Google
  document.querySelectorAll('.social-btn-google').forEach(btn => {
    btn.addEventListener('click', () => {
      // In production: trigger Google OAuth flow
      showAuthFeedback(btn, 'Connecting to Google…');
    });
  });

  // Apple
  document.querySelectorAll('.social-btn-apple').forEach(btn => {
    btn.addEventListener('click', () => {
      // In production: trigger Sign in with Apple flow
      showAuthFeedback(btn, 'Connecting to Apple…');
    });
  });
}

/**
 * Show a brief loading state on social button.
 * @param {HTMLButtonElement} btn
 * @param {string} label
 */
function showAuthFeedback(btn, label) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.style.opacity = '0.7';
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.8s linear infinite;flex-shrink:0" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    <span>${label}</span>
  `;
  // Restore after 2.5s (in production, callback would handle this)
  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '';
    btn.innerHTML = original;
  }, 2500);
}


/* ============================================================
   9. SUBMIT BUTTON MICRO-INTERACTION
   Tiny petal burst on hover using a CSS class toggle.
   ============================================================ */
function initSubmitEffect() {
  document.querySelectorAll('.auth-submit').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.letterSpacing = '0.06em';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.letterSpacing = '0.03em';
    });
  });
}


/* ============================================================
   KEYFRAME for loading spinner (injected into document)
   ============================================================ */
function injectSpinKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}


/* ============================================================
   10. INIT
   ============================================================ */
function init() {
  // Theme + RTL (run immediately, before paint)
  Theme.init();
  RTL.init();

  // Inject spinner keyframe
  injectSpinKeyframe();

  // Password toggles
  initPasswordToggle('togglePw',    'login-password');   // login page
  initPasswordToggle('toggleRegPw', 'reg-password');     // register page

  // Password strength (register only — noop if element absent)
  initPasswordStrength();

  // Forms
  initLoginForm();
  initRegisterForm();

  // Social buttons
  initSocialButtons();

  // Micro-interactions
  initSubmitEffect();
}

// Boot immediately — no DOMContentLoaded delay needed since
// script is at end of <body> and all elements are present.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ============================================================
   END OF LOGIN.JS
   Rose & Stem — v1.0.0
   ============================================================ */
