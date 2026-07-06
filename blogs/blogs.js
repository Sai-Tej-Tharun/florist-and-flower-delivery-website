/**
 * Rose & Stem — blogs.js
 * Blog Listing Page: Filter, Search, Sort, Pagination
 */

'use strict';

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */

/** All 6 blog-details targets (cycled via data-cat / index) */
const BLOG_DETAIL_PAGES = [
  '../blog-details/blog-details-1.html',
  '../blog-details/blog-details-2.html',
  '../blog-details/blog-details-3.html',
  '../blog-details/blog-details-4.html',
  '../blog-details/blog-details-5.html',
  '../blog-details/blog-details-6.html',
];

const CARDS_PER_PAGE = 6;

const state = {
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  currentPage: 1,
};

/* ============================================================
   DOM REFS (populated after DOM ready)
   ============================================================ */
let blogCards = [];
let blogGrid;
let noResults;
let blogCount;
let paginationEl;

/* ============================================================
   FILTER & SEARCH LOGIC
   ============================================================ */

/**
 * Returns array of visible blog cards based on current state.
 */
function getFilteredCards() {
  return blogCards.filter(card => {
    const cat = card.dataset.cat || 'all';
    const title = card.querySelector('.blog-title')?.textContent.toLowerCase() || '';
    const excerpt = card.querySelector('.blog-excerpt')?.textContent.toLowerCase() || '';
    const author = card.querySelector('.blog-meta span')?.textContent.toLowerCase() || '';

    const matchesCat = state.activeCategory === 'all' || cat === state.activeCategory;
    const q = state.searchQuery.toLowerCase().trim();
    const matchesSearch = !q || title.includes(q) || excerpt.includes(q) || author.includes(q);

    return matchesCat && matchesSearch;
  });
}

/**
 * Sort array of card elements based on state.sortBy
 */
function sortCards(cards) {
  return [...cards].sort((a, b) => {
    if (state.sortBy === 'newest') {
      return new Date(b.dataset.date || 0) - new Date(a.dataset.date || 0);
    }
    if (state.sortBy === 'oldest') {
      return new Date(a.dataset.date || 0) - new Date(b.dataset.date || 0);
    }
    if (state.sortBy === 'popular') {
      return parseInt(b.dataset.pop || 0, 10) - parseInt(a.dataset.pop || 0, 10);
    }
    return 0;
  });
}

/**
 * Main render: filter → sort → paginate → display
 */
function renderCards() {
  const filtered = getFilteredCards();
  const sorted = sortCards(filtered);

  const totalFiltered = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / CARDS_PER_PAGE));

  // Clamp page
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const startIdx = (state.currentPage - 1) * CARDS_PER_PAGE;
  const pageCards = sorted.slice(startIdx, startIdx + CARDS_PER_PAGE);

  // Hide all cards
  blogCards.forEach(card => {
    card.classList.add('filtered-out');
    card.classList.remove('filter-enter');
  });

  // Show page cards with stagger animation
  pageCards.forEach((card, i) => {
    card.classList.remove('filtered-out');
    // Stagger via timeout
    setTimeout(() => {
      card.classList.add('filter-enter');
    }, i * 50);
  });

  // Update count text
  if (blogCount) {
    const from = totalFiltered === 0 ? 0 : startIdx + 1;
    const to = Math.min(startIdx + CARDS_PER_PAGE, totalFiltered);
    blogCount.innerHTML = totalFiltered === 0
      ? 'No articles found'
      : `Showing <strong>${from}–${to}</strong> of <strong>${totalFiltered}</strong> articles`;
  }

  // Toggle no-results
  if (noResults) {
    noResults.hidden = totalFiltered > 0;
    if (blogGrid) blogGrid.style.display = totalFiltered === 0 ? 'none' : '';
  }

  // Render pagination
  renderPagination(totalPages);

  // Re-init Lucide icons for newly shown content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ============================================================
   PAGINATION
   ============================================================ */

function renderPagination(totalPages) {
  if (!paginationEl) return;

  const prevBtn = paginationEl.querySelector('.pagination__prev');
  const nextBtn = paginationEl.querySelector('.pagination__next');
  const pagesContainer = paginationEl.querySelector('.pagination__pages');

  if (!prevBtn || !nextBtn || !pagesContainer) return;

  // Prev / Next state
  prevBtn.disabled = state.currentPage <= 1;
  nextBtn.disabled = state.currentPage >= totalPages;

  // Build page buttons
  pagesContainer.innerHTML = '';

  const pages = buildPageRange(state.currentPage, totalPages);

  pages.forEach(p => {
    if (p === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination__ellipsis';
      ellipsis.textContent = '…';
      ellipsis.setAttribute('aria-hidden', 'true');
      pagesContainer.appendChild(ellipsis);
    } else {
      const btn = document.createElement('button');
      btn.className = 'pagination__page' + (p === state.currentPage ? ' active' : '');
      btn.textContent = p;
      btn.setAttribute('aria-label', `Page ${p}`);
      if (p === state.currentPage) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => {
        state.currentPage = p;
        renderCards();
        // Smooth scroll to grid top
        blogGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagesContainer.appendChild(btn);
    }
  });
}

/**
 * Build a smart array of page numbers with ellipsis.
 * e.g. [1, 2, 3, '...', 8] or [1, '...', 4, 5, 6, '...', 8]
 */
function buildPageRange(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

/* ============================================================
   CATEGORY FILTER
   ============================================================ */

function initCategoryFilter() {
  // Desktop tab bar
  const tabButtons = document.querySelectorAll('.cat-tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      setCategory(cat);
    });
  });

  // Sidebar category buttons
  const sidebarBtns = document.querySelectorAll('.sidebar-cat-btn');
  sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      setCategory(cat);
    });
  });
}

function setCategory(cat) {
  state.activeCategory = cat;
  state.currentPage = 1;

  // Update tab bar active state
  document.querySelectorAll('.cat-tab').forEach(btn => {
    const isActive = btn.dataset.cat === cat;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update sidebar active state
  document.querySelectorAll('.sidebar-cat-btn').forEach(btn => {
    const isActive = btn.dataset.cat === cat;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  renderCards();
}

/* ============================================================
   SEARCH
   ============================================================ */

function initSearch() {
  // Hero search form
  const heroForm = document.getElementById('hero-search-form');
  const heroInput = document.getElementById('hero-search-input');

  if (heroForm) {
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      state.searchQuery = heroInput?.value || '';
      state.currentPage = 1;
      // Scroll to grid
      document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
      renderCards();
    });
  }

  // Sidebar search form
  const sidebarForm = document.getElementById('sidebar-search-form');
  const sidebarInput = document.getElementById('sidebar-search-input');

  if (sidebarForm) {
    sidebarForm.addEventListener('submit', e => {
      e.preventDefault();
      state.searchQuery = sidebarInput?.value || '';
      state.currentPage = 1;
      renderCards();
    });
  }

  // Live search with debounce
  const debounceSearch = debounce(val => {
    state.searchQuery = val;
    state.currentPage = 1;
    renderCards();
  }, 300);

  if (sidebarInput) {
    sidebarInput.addEventListener('input', e => debounceSearch(e.target.value));
  }

  if (heroInput) {
    heroInput.addEventListener('input', e => debounceSearch(e.target.value));
  }

  // Mirror search inputs
  if (heroInput && sidebarInput) {
    heroInput.addEventListener('input', () => { sidebarInput.value = heroInput.value; });
    sidebarInput.addEventListener('input', () => { heroInput.value = sidebarInput.value; });
  }

  // Clear filters button (in no-results)
  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.activeCategory = 'all';
      state.currentPage = 1;
      if (heroInput) heroInput.value = '';
      if (sidebarInput) sidebarInput.value = '';
      setCategory('all');
    });
  }
}

/* ============================================================
   SORT
   ============================================================ */

function initSort() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', () => {
    state.sortBy = sortSelect.value;
    state.currentPage = 1;
    renderCards();
  });
}

/* ============================================================
   PAGINATION BUTTONS (prev / next)
   ============================================================ */

function initPaginationButtons() {
  if (!paginationEl) return;

  paginationEl.querySelector('.pagination__prev')?.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage -= 1;
      renderCards();
      blogGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  paginationEl.querySelector('.pagination__next')?.addEventListener('click', () => {
    const filtered = getFilteredCards();
    const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
    if (state.currentPage < totalPages) {
      state.currentPage += 1;
      renderCards();
      blogGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ============================================================
   KEYBOARD NAVIGATION (Tabs)
   ============================================================ */

function initTabKeyboard() {
  const tabs = document.querySelector('.category-tabs');
  if (!tabs) return;

  const tabBtns = tabs.querySelectorAll('.cat-tab');
  tabBtns.forEach((btn, idx) => {
    btn.addEventListener('keydown', e => {
      let newIdx = idx;
      if (e.key === 'ArrowRight') newIdx = (idx + 1) % tabBtns.length;
      else if (e.key === 'ArrowLeft') newIdx = (idx - 1 + tabBtns.length) % tabBtns.length;
      else return;
      e.preventDefault();
      tabBtns[newIdx].focus();
      tabBtns[newIdx].click();
    });
  });
}

/* ============================================================
   SIDEBAR TAG FILTER
   ============================================================ */

function initTagFilter() {
  document.querySelectorAll('.sidebar-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const tagText = tag.textContent.trim().toLowerCase();
      state.searchQuery = tagText;
      state.currentPage = 1;
      // Mirror into search inputs
      const heroInput = document.getElementById('hero-search-input');
      const sidebarInput = document.getElementById('sidebar-search-input');
      if (heroInput) heroInput.value = tagText;
      if (sidebarInput) sidebarInput.value = tagText;
      renderCards();

      // Visual feedback
      tag.style.background = 'var(--gradient-rose)';
      tag.style.color = '#FFFFFF';
      tag.style.borderColor = 'transparent';
      setTimeout(() => {
        tag.style.background = '';
        tag.style.color = '';
        tag.style.borderColor = '';
      }, 800);
    });
  });
}

/* ============================================================
   UTILITY: simple debounce (fallback if global not available)
   ============================================================ */

function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ============================================================
   INIT
   ============================================================ */

function initBlogsPage() {
  // Collect DOM refs
  blogGrid = document.getElementById('blog-grid');
  noResults = document.getElementById('no-results');
  blogCount = document.getElementById('blog-count');
  paginationEl = document.getElementById('pagination');

  if (!blogGrid) return;

  // Collect all card elements
  blogCards = Array.from(blogGrid.querySelectorAll('.blog-card'));

  // Wire up interactions
  initCategoryFilter();
  initSearch();
  initSort();
  initPaginationButtons();
  initTabKeyboard();
  initTagFilter();

  // Initial render
  renderCards();
}

/* ── Boot ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogsPage);
} else {
  initBlogsPage();
}
