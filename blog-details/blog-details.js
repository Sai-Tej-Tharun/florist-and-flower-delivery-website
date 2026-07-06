/**
 * Rose & Stem — blog-details.js
 * Shared JS for all 6 blog-details pages.
 * Features: reading progress, sticky TOC, share, comments,
 *           floating share, parallax hero, copy link, newsletter.
 */

'use strict';

/* ============================================================
   READING PROGRESS BAR
   ============================================================ */

function initReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;

  const article = document.querySelector('.article-content');
  if (!article) return;

  function updateProgress() {
    const articleRect = article.getBoundingClientRect();
    const articleTop = articleRect.top + window.scrollY;
    const articleHeight = articleRect.height;
    const windowHeight = window.innerHeight;

    const scrolled = window.scrollY - articleTop + windowHeight * 0.3;
    const progress = Math.min(Math.max((scrolled / articleHeight) * 100, 0), 100);
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* ============================================================
   PARALLAX HERO
   ============================================================ */

function initHeroParallax() {
  const heroImg = document.querySelector('.article-hero__img');
  if (!heroImg) return;

  // Only on non-touch devices for performance
  if (window.matchMedia('(hover: none)').matches) return;

  function onScroll() {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroImg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ============================================================
   TABLE OF CONTENTS — Active Link on Scroll
   ============================================================ */

function initTOC() {
  const tocLinks = document.querySelectorAll('.toc-item a');
  if (!tocLinks.length) return;

  const headings = [];
  tocLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (target) headings.push({ link, target });
  });

  if (!headings.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove all active
        tocLinks.forEach(l => l.classList.remove('active'));
        // Activate matching
        const match = headings.find(h => h.target === entry.target);
        if (match) match.link.classList.add('active');
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  });

  headings.forEach(h => observer.observe(h.target));

  // Smooth scroll on click
  tocLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navbarHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '72',
          10
        );
        const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   FLOATING SHARE PANEL (left side)
   ============================================================ */

function initFloatingShare() {
  const panel = document.getElementById('floating-share');
  if (!panel) return;

  const article = document.querySelector('.article-content');
  if (!article) return;

  function checkVisibility() {
    const rect = article.getBoundingClientRect();
    const articleBottom = rect.bottom + window.scrollY;
    const scrollBottom = window.scrollY + window.innerHeight;

    if (window.scrollY > 300 && scrollBottom < articleBottom + 100) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }

  window.addEventListener('scroll', checkVisibility, { passive: true });
  checkVisibility();
}

/* ============================================================
   SHARE BUTTONS
   ============================================================ */

function initShareButtons() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);

  // All share triggers (both top bar and floating)
  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const type = btn.dataset.share;
      let shareUrl = '';

      switch (type) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'whatsapp':
          shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case 'copy':
          copyToClipboard(window.location.href);
          return;
        default:
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      }
    });
  });
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
        window.RoseAndStem.showToast('🔗 Link copied to clipboard!', 'success');
      }
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    if (typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
      window.RoseAndStem.showToast('🔗 Link copied!', 'success');
    }
  }
}

/* ============================================================
   COMMENT FORM VALIDATION & SUBMISSION
   ============================================================ */

function initCommentForm() {
  const form = document.getElementById('comment-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    let isValid = true;

    // Validate required fields
    const required = form.querySelectorAll('[required]');
    required.forEach(field => {
      clearFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.');
        isValid = false;
      }
    });

    // Validate email specifically
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value.trim())) {
        showFieldError(emailField, 'Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!isValid) return;

    // Simulate async submission
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting…';
    }

    setTimeout(() => {
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
      }
      if (typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
        window.RoseAndStem.showToast('🌸 Your comment has been submitted for review!', 'success');
      }
    }, 1200);
  });
}

function showFieldError(field, message) {
  field.classList.add('error');

  // Remove existing error
  const existingError = field.parentElement.querySelector('.form-error');
  if (existingError) existingError.remove();

  const errorEl = document.createElement('span');
  errorEl.className = 'form-error';
  errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${message}`;
  field.parentElement.appendChild(errorEl);

  // Re-init lucide for the new icon
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) errorEl.remove();
}

/* ============================================================
   NEWSLETTER FORM
   ============================================================ */

function initArticleNewsletter() {
  const forms = document.querySelectorAll('.sidebar-newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput) return;

      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
          window.RoseAndStem.showToast('Please enter a valid email.', 'error');
        }
        return;
      }

      emailInput.value = '';
      if (typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
        window.RoseAndStem.showToast('🌹 Subscribed! Welcome to Rose & Stem.', 'success');
      }
    });
  });
}

/* ============================================================
   REPLY BUTTON TOGGLE
   ============================================================ */

function initReplyButtons() {
  document.querySelectorAll('.comment__reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Show a simple "reply" mini-form after the comment
      const comment = btn.closest('.comment');
      if (!comment) return;

      // Remove any existing reply forms
      document.querySelectorAll('.inline-reply-form').forEach(f => f.remove());

      const existing = comment.querySelector('.inline-reply-form');
      if (existing) {
        existing.remove();
        return;
      }

      const replyForm = document.createElement('div');
      replyForm.className = 'inline-reply-form';
      replyForm.style.cssText = `
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: flex-start;
      `;
      replyForm.innerHTML = `
        <textarea
          placeholder="Write a reply…"
          rows="2"
          style="flex:1;padding:10px 14px;border:1.5px solid var(--border-color-input);border-radius:var(--border-radius-sm);background:var(--bg-input);color:var(--text-body);font-family:var(--font-body);font-size:var(--text-sm);resize:vertical;outline:none;"
          aria-label="Reply"
        ></textarea>
        <button class="btn btn-primary btn-sm" style="flex-shrink:0;" type="button">Reply</button>
      `;

      comment.querySelector('.comment__body').appendChild(replyForm);
      replyForm.querySelector('textarea').focus();

      replyForm.querySelector('button').addEventListener('click', () => {
        replyForm.remove();
        if (typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
          window.RoseAndStem.showToast('🌸 Reply submitted for review!', 'success');
        }
      });
    });
  });
}

/* ============================================================
   LIKE / BOOKMARK BUTTON TOGGLE
   ============================================================ */

function initReactionButtons() {
  // Like button
  document.querySelectorAll('[data-action="like"]').forEach(btn => {
    const countEl = btn.querySelector('.like-count');
    let liked = false;
    let count = parseInt(countEl?.textContent || '0', 10);

    btn.addEventListener('click', () => {
      liked = !liked;
      if (countEl) {
        count += liked ? 1 : -1;
        countEl.textContent = count;
      }
      btn.classList.toggle('active', liked);
      btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      // btn.style.color = liked ? 'var(--color-primary)' : '';
      btn.style.borderColor = liked ? 'var(--color-primary)' : '';

      if (liked && typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
        window.RoseAndStem.showToast('❤️ Added to your favourites!', 'success');
      }
    });
  });

  // Bookmark button
  document.querySelectorAll('[data-action="bookmark"]').forEach(btn => {
    let saved = false;
    btn.addEventListener('click', () => {
      saved = !saved;
      btn.classList.toggle('active', saved);
      btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      // btn.style.color = saved ? 'var(--color-gold)' : '';
      btn.style.borderColor = saved ? 'var(--color-gold)' : '';

      if (typeof window.RoseAndStem !== 'undefined' && window.RoseAndStem.showToast) {
        window.RoseAndStem.showToast(
          saved ? '🔖 Article bookmarked!' : '🔖 Bookmark removed.',
          'info'
        );
      }
    });
  });
}

/* ============================================================
   IMAGE LIGHTBOX (simple)
   ============================================================ */

function initImageLightbox() {
  const articleImages = document.querySelectorAll('.article-content figure img, .article-img-grid img');

  articleImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');

    const openLightbox = () => {
      const backdrop = document.createElement('div');
      backdrop.style.cssText = `
        position: fixed; inset: 0; z-index: 900;
        background: rgba(0,0,0,0.9); display: flex;
        align-items: center; justify-content: center;
        padding: 20px; cursor: zoom-out;
        animation: fadeIn 0.25s ease;
      `;

      const lightboxImg = document.createElement('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxImg.style.cssText = `
        max-width: 90vw; max-height: 90vh;
        border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: scaleIn 0.25s ease;
        object-fit: contain;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Close image');
      closeBtn.style.cssText = `
        position: absolute; top: 20px; right: 20px;
        width: 40px; height: 40px; border-radius: 50%;
        background: rgba(255,255,255,0.15); color: #fff;
        border: 1px solid rgba(255,255,255,0.3); font-size: 16px;
        cursor: pointer; display: flex; align-items: center;
        justify-content: center; transition: background 0.2s;
      `;

      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        backdrop.remove();
        document.body.style.overflow = '';
      });

      closeBtn.addEventListener('mouseover', () => {
        closeBtn.style.background = 'rgba(200,76,106,0.6)';
      });
      closeBtn.addEventListener('mouseout', () => {
        closeBtn.style.background = 'rgba(255,255,255,0.15)';
      });

      backdrop.appendChild(lightboxImg);
      backdrop.appendChild(closeBtn);
      document.body.appendChild(backdrop);
      document.body.style.overflow = 'hidden';

      backdrop.addEventListener('click', () => {
        backdrop.remove();
        document.body.style.overflow = '';
      });

      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') {
          backdrop.remove();
          document.body.style.overflow = '';
          document.removeEventListener('keydown', onKey);
        }
      });
    };

    img.addEventListener('click', openLightbox);
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox();
      }
    });
  });
}

/* ============================================================
   ESTIMATE READING TIME (dynamic update)
   ============================================================ */

function updateReadingTime() {
  const content = document.querySelector('.article-content');
  const readTimeEl = document.querySelector('[data-reading-time]');
  if (!content || !readTimeEl) return;

  const wordCount = content.innerText.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  readTimeEl.textContent = `${minutes} min read`;
}

/* ============================================================
   HIGHLIGHT TEXT SELECTION (for sharing)
   ============================================================ */

function initTextSelection() {
  const content = document.querySelector('.article-content');
  if (!content) return;

  let selectionTooltip = null;

  content.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    // Remove existing tooltip
    if (selectionTooltip) {
      selectionTooltip.remove();
      selectionTooltip = null;
    }

    if (!text || text.length < 10) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: fixed;
      top: ${rect.top - 48}px;
      left: ${rect.left + rect.width / 2 - 60}px;
      background: var(--color-primary-dark, #5A1E2A);
      color: #fff;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      z-index: 800;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      white-space: nowrap;
      animation: fadeInDown 0.2s ease;
      user-select: none;
    `;
    tooltip.textContent = '🐦 Tweet this';

    tooltip.addEventListener('click', () => {
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('"' + text + '"')}&url=${encodeURIComponent(window.location.href)}&via=roseandstemnl`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      tooltip.remove();
      selectionTooltip = null;
    });

    document.body.appendChild(tooltip);
    selectionTooltip = tooltip;

    // Auto-remove after 4s
    setTimeout(() => {
      if (tooltip.parentNode) tooltip.remove();
      selectionTooltip = null;
    }, 4000);
  });

  // Remove on outside click
  document.addEventListener('mousedown', () => {
    if (selectionTooltip) {
      selectionTooltip.remove();
      selectionTooltip = null;
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */

function initBlogDetailsPage() {
  initReadingProgress();
  initHeroParallax();
  initTOC();
  initFloatingShare();
  initShareButtons();
  initCommentForm();
  initArticleNewsletter();
  initReplyButtons();
  initReactionButtons();
  initImageLightbox();
  updateReadingTime();
  initTextSelection();

  // ✅ THIS IS THE FIX
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ── Boot after global.js has loaded ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogDetailsPage);
} else {
  initBlogDetailsPage();
}
window.addEventListener('load', () => {
  if (window.lucide) {
    lucide.createIcons();
    console.log('Lucide icons initialized');
  } else {
    console.error('Lucide not loaded');
  }
});