/* Rose & Stem — global.js (see full version in project root) */
/* This is a stub; replace with the full global.js from Document 3 */
'use strict';
function onDOMReady(fn){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);}else{fn();}}
const ThemeManager=(()=>{const STORAGE_KEY='roseAndStem_theme';function getSavedTheme(){const saved=localStorage.getItem(STORAGE_KEY);if(saved)return saved;return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}function apply(theme){document.documentElement.setAttribute('data-theme',theme);localStorage.setItem(STORAGE_KEY,theme);updateToggleIcons(theme);document.dispatchEvent(new CustomEvent('themeChange',{detail:{theme}}));}function toggle(){const current=document.documentElement.getAttribute('data-theme')||'light';apply(current==='dark'?'light':'dark');}function updateToggleIcons(theme){const isDark=theme==='dark';document.querySelectorAll('.icon-moon').forEach(el=>{el.style.display=isDark?'none':'block';});document.querySelectorAll('.icon-sun').forEach(el=>{el.style.display=isDark?'block':'none';});}function bindToggles(){document.addEventListener('click',e=>{if(e.target.closest('.theme-toggle'))toggle();});}function init(){apply(getSavedTheme());bindToggles();}return{init,apply,toggle,getSavedTheme};})();
const RTLManager=(()=>{const STORAGE_KEY='roseAndStem_rtl';function getSavedDirection(){return localStorage.getItem(STORAGE_KEY)||'ltr';}function apply(dir){document.documentElement.setAttribute('dir',dir);localStorage.setItem(STORAGE_KEY,dir);}function toggle(){const current=document.documentElement.getAttribute('dir')||'ltr';apply(current==='rtl'?'ltr':'rtl');}function bindToggles(){document.addEventListener('click',e=>{if(e.target.closest('.rtl-toggle'))toggle();});}function init(){apply(getSavedDirection());bindToggles();}return{init,apply,toggle};})();
function getPathDepth(){const path=window.location.pathname;const parts=path.split('/').filter(Boolean);if(parts.length===0)return 0;const lastPart=parts[parts.length-1];const isFile=lastPart.includes('.');return isFile?Math.max(0,parts.length-1):parts.length;}
async function loadComponent(selector,filePath,callback){const target=document.querySelector(selector);if(!target)return;try{const response=await fetch(filePath);if(!response.ok)throw new Error('Failed');const html=await response.text();target.innerHTML=html;if(typeof callback==='function')callback();}catch(err){}}
async function loadNavbarAndFooter(){const depth=getPathDepth();const prefix='../'.repeat(depth);await loadComponent('#navbar-placeholder',`${prefix}components/navbar.html`,()=>{initNavbar();setActiveNavLink();});await loadComponent('#footer-placeholder',`${prefix}components/footer.html`,()=>{initNewsletterForm();});}
function initNavbarScroll(){const navbar=document.querySelector('.navbar');if(!navbar)return;function onScroll(){if(window.scrollY>20)navbar.classList.add('scrolled');else navbar.classList.remove('scrolled');}window.addEventListener('scroll',onScroll,{passive:true});onScroll();}
function setActiveNavLink(){const currentPath=window.location.pathname;document.querySelectorAll('.nav-link,.dropdown-item,.mobile-nav-link').forEach(link=>{const href=link.getAttribute('href');if(!href)return;const linkPath=href.split('?')[0].replace(/\/$/,'');const pagePath=currentPath.split('?')[0].replace(/\/$/,'');if(pagePath.endsWith(linkPath)&&linkPath!==''){link.classList.add('active');const parentDropdown=link.closest('.nav-item.has-dropdown');if(parentDropdown){const parentLink=parentDropdown.querySelector(':scope > .nav-link');if(parentLink)parentLink.classList.add('active');}}});}
function initScrollReveal(){if(!('IntersectionObserver' in window)){document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el=>el.classList.add('visible'));return;}const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{rootMargin:'0px 0px -60px 0px',threshold:0.12});document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el=>{if(el.dataset.delay)el.style.transitionDelay=el.dataset.delay;observer.observe(el);});}
function initCounters(){if(!('IntersectionObserver' in window))return;const counters=document.querySelectorAll('.counter');if(!counters.length)return;const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){animateCounter(entry.target);observer.unobserve(entry.target);}});},{threshold:0.5});counters.forEach(c=>observer.observe(c));}
function animateCounter(el){const target=parseInt(el.dataset.target||el.textContent,10);const suffix=el.dataset.suffix||'';const prefix=el.dataset.prefix||'';const duration=parseInt(el.dataset.duration||'2000',10);const startTime=performance.now();function update(currentTime){const elapsed=currentTime-startTime;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);const current=Math.round(target*eased);el.textContent=`${prefix}${current.toLocaleString('en-IN')}${suffix}`;if(progress<1)requestAnimationFrame(update);}requestAnimationFrame(update);}
function showToast(message,type='info',duration=4000){let container=document.getElementById('toast-container');if(!container){container=document.createElement('div');container.id='toast-container';document.body.appendChild(container);}const toast=document.createElement('div');toast.className=`toast toast-${type}`;toast.innerHTML=`<span>${message}</span><button class="toast-close" aria-label="Close" onclick="this.parentElement.remove()">✕</button>`;container.appendChild(toast);if(duration>0)setTimeout(()=>toast.remove(),duration);return toast;}
function openModal(id){const el=document.getElementById(id);if(el){el.classList.add('open');document.body.style.overflow='hidden';}}
function closeModal(id){const el=document.getElementById(id);if(el){el.classList.remove('open');document.body.style.overflow='';}}
function initModals(){document.addEventListener('click',e=>{const t=e.target.closest('[data-modal-open]');if(t){e.preventDefault();openModal(t.dataset.modalOpen);}if(e.target.closest('.modal-close')){const b=e.target.closest('.modal-backdrop');if(b)closeModal(b.id);}if(e.target.classList.contains('modal-backdrop'))closeModal(e.target.id);});document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=document.querySelector('.modal-backdrop.open');if(o)closeModal(o.id);}});}
function initBackToTop(){let btn=document.getElementById('back-to-top');if(!btn){btn=document.createElement('button');btn.id='back-to-top';btn.setAttribute('aria-label','Back to top');btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>';btn.style.cssText='position:fixed;bottom:28px;right:28px;width:44px;height:44px;border-radius:50%;background:var(--gradient-rose);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(200,76,106,0.4);opacity:0;visibility:hidden;transform:translateY(12px);transition:opacity 0.3s ease,transform 0.3s ease,visibility 0.3s ease;z-index:200;';document.body.appendChild(btn);}window.addEventListener('scroll',()=>{if(window.scrollY>400){btn.style.opacity='1';btn.style.visibility='visible';btn.style.transform='translateY(0)';}else{btn.style.opacity='0';btn.style.visibility='hidden';btn.style.transform='translateY(12px)';}},{passive:true});btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));}
function initFormValidation(){}
function initLazyImages(){if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const img=e.target;if(img.dataset.src)img.src=img.dataset.src;img.classList.remove('lazy');obs.unobserve(img);}});},{rootMargin:'50px'});document.querySelectorAll('img.lazy,img[data-src]').forEach(img=>obs.observe(img));}}
function initTabs(){}
function initAccordions(){document.querySelectorAll('.accordion').forEach(accordion=>{accordion.querySelectorAll('.accordion-item').forEach(item=>{const trigger=item.querySelector('.accordion-trigger');const content=item.querySelector('.accordion-content');if(!trigger||!content)return;content.style.maxHeight='0';content.style.overflow='hidden';content.style.transition='max-height 0.35s ease';trigger.addEventListener('click',()=>{const isOpen=item.classList.contains('open');accordion.querySelectorAll('.accordion-item').forEach(other=>{other.classList.remove('open');const oc=other.querySelector('.accordion-content');if(oc)oc.style.maxHeight='0';});if(!isOpen){item.classList.add('open');content.style.maxHeight=content.scrollHeight+'px';}});});});}
function initTestimonialSliders(){}
function initCopyButtons(){}
function initStickyElements(){}
function initPetalEffects(){}
function initSearchOverlay(){}
function initQuickOrder(){}
function initNewsletterForm(){const forms=document.querySelectorAll('.newsletter-form,#newsletter-form');forms.forEach(form=>{form.addEventListener('submit',async e=>{e.preventDefault();const emailInput=form.querySelector('input[type="email"]');if(!emailInput)return;const email=emailInput.value.trim();if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showToast('Please enter a valid email.','error');return;}emailInput.value='';showToast('🌹 Subscribed! Welcome to Rose & Stem.','success');});});}
function throttle(fn,wait){let lastTime=0;return function(...args){const now=Date.now();if(now-lastTime>=wait){lastTime=now;fn.apply(this,args);}};}
function debounce(fn,wait){let timer;return function(...args){clearTimeout(timer);timer=setTimeout(()=>fn.apply(this,args),wait);};}
function formatRupee(amount){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0}).format(amount);}
function sanitizeHTML(str){const div=document.createElement('div');div.textContent=str;return div.innerHTML;}
function initNavbar(){initNavbarScroll();initMobileMenu();initDropdowns();setActiveNavLink();}
async function initGlobal(){ThemeManager.init();RTLManager.init();loadNavbarAndFooter();initModals();initScrollReveal();initCounters();initLazyImages();initFormValidation();initTabs();initAccordions();initTestimonialSliders();initBackToTop();initCopyButtons();initStickyElements();initPetalEffects();initSearchOverlay();initQuickOrder();if(typeof lucide!=='undefined')lucide.createIcons();}
window.RoseAndStem={ThemeManager,RTLManager,showToast,openModal,closeModal,animateCounter,debounce,throttle,formatRupee,sanitizeHTML};
onDOMReady(initGlobal);

/* ============================================================
   Rose & Stem — Navbar JS patches (replace the matching
   functions in your global.js with these)
   ============================================================ */

/* ── initDropdowns ──────────────────────────────────────────
   Uses a longer leave-delay (300ms) so the cursor has time
   to travel from the nav-link into the dropdown menu without
   the menu disappearing mid-travel.
   ---------------------------------------------------------- */
function initDropdowns() {
  const items = document.querySelectorAll('.nav-item.has-dropdown');
  items.forEach(item => {
    let closeTimeout;

    const openMenu = () => {
      clearTimeout(closeTimeout);
      items.forEach(o => { if (o !== item) o.classList.remove('open'); });
      item.classList.add('open');
    };

    const scheduleClose = () => {
      clearTimeout(closeTimeout);
      // 300 ms gives plenty of time to move the cursor into the dropdown
      closeTimeout = setTimeout(() => item.classList.remove('open'), 300);
    };

    item.addEventListener('mouseenter', openMenu);
    item.addEventListener('mouseleave', scheduleClose);

    const menu = item.querySelector('.dropdown-menu');
    if (menu) {
      menu.addEventListener('mouseenter', () => clearTimeout(closeTimeout));
      menu.addEventListener('mouseleave', scheduleClose);
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item.has-dropdown')) {
      items.forEach(i => i.classList.remove('open'));
    }
  });
}

/* ── setActiveNavLink ───────────────────────────────────────
   Matches the current page URL against every nav / dropdown
   / mobile link href. Handles both filename-only paths and
   full relative paths. Also highlights the parent "Home"
   nav-link when a home-1 or home-2 page is active.
   ---------------------------------------------------------- */
function setActiveNavLink() {
  const currentPath = window.location.pathname;

  // Normalise: lowercase, strip trailing slash, drop query/hash
  const normalise = str =>
    str.split('?')[0].split('#')[0].replace(/\/$/, '').toLowerCase();

  const current = normalise(currentPath);

  document.querySelectorAll('.nav-link, .dropdown-item, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const linkNorm = normalise(href);
    if (!linkNorm) return;

    // Match if current path ends with the link path
    if (current.endsWith(linkNorm)) {
      link.classList.add('active');

      // Also highlight the parent nav-link for dropdown children
      const parentItem = link.closest('.nav-item.has-dropdown');
      if (parentItem) {
        const parentLink = parentItem.querySelector(':scope > .nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    }
  });
}

/* ── initMobileMenu ─────────────────────────────────────────
   Clean open/close, ESC key, outside-click dismiss.
   No sub-dropdowns in mobile — all links are flat.
   ---------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('.navbar-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!toggle || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}
document.addEventListener("DOMContentLoaded", () => {

  const path = window.location.pathname.toLowerCase();

  // Remove existing active states
  document.querySelectorAll(
    ".nav-link, .dropdown-item, .mobile-nav-link"
  ).forEach(el => el.classList.remove("active"));

/* ==================================================
   HOME
   ================================================== */

if (
  path.includes("/home-1/") ||
  path.includes("/home-2/") ||
  path.endsWith("home.html") ||
  path.endsWith("index.html") ||
  path === "/"
) {

  document
    .querySelector('.nav-link[href*="home"]')
    ?.classList.add("active");

  if (path.includes("/home-1/")) {
    document
      .querySelector('.mobile-nav-link[href*="home-1"]')
      ?.classList.add("active");
  }
  else if (path.includes("/home-2/")) {
    document
      .querySelector('.mobile-nav-link[href*="home-2"]')
      ?.classList.add("active");
  }

  return;
}
  /* ==================================================
     SERVICES + SERVICE DETAILS
     ================================================== */

  const servicePages = [
    "services.html",
    "taproom-tours",
    "private-events",
    "beer-club",
    "custom-brewing",
    "wholesale",
    "tasting-masterclasses"
  ];

  if (servicePages.some(page => path.includes(page))) {

    document
      .querySelector('.nav-link[href*="services"]')
      ?.classList.add("active");

    document
      .querySelector('.mobile-nav-link[href*="services"]')
      ?.classList.add("active");

    return;
  }

  /* ==================================================
     BLOG + BLOG DETAILS
     ================================================== */

  if (
    path.includes("blog") ||
    path.includes("article") ||
    path.includes("post")
  ) {

    document
      .querySelector('.nav-link[href*="blog"]')
      ?.classList.add("active");

    document
      .querySelector('.mobile-nav-link[href*="blog"]')
      ?.classList.add("active");

    return;
  }

  /* ==================================================
     NORMAL PAGE MATCHING
     ================================================== */

  const currentPage = path.split("/").pop();

  document.querySelectorAll(
    ".nav-link, .dropdown-item, .mobile-nav-link"
  ).forEach(link => {

    const href = link.getAttribute("href");
    if (!href) return;

    const linkPage = href.split("/").pop().toLowerCase();

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

});

// Navbar is hardcoded in HTML, so init directly
document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  setActiveNavLink();
});