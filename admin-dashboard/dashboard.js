/**
 * Rose & Stem — Admin Dashboard JS
 * File: admin-dashboard/dashboard.js
 *
 * Features:
 *  - Sidebar: collapse, mobile toggle
 *  - Panel switching (14 panels)
 *  - Notification system: tabs, mark read, real-time dot
 *  - Profile dropdown
 *  - Charts (vanilla canvas — no library dependency)
 *  - KPI counters
 *  - Orders table generation
 *  - Theme toggle (extends global.js ThemeManager)
 *  - Topbar date display
 *  - Logout modal
 *  - Chart period filter
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. NOTIFICATION DATA
═══════════════════════════════════════════════════════════ */

/** All notification items — rich mock data */
const NOTIFICATIONS = [
  {
    id: 1, type: 'orders', icon: 'shopping-bag', iconClass: 'notif-icon-order',
    title: 'New Order Received',
    desc: 'Order #RS-4822 from Deepika Nair — Luxury Rose Box (₹2,499)',
    time: '2m ago', unread: true
  },
  {
    id: 2, type: 'orders', icon: 'truck', iconClass: 'notif-icon-order',
    title: 'Delivery Completed',
    desc: 'Order #RS-4821 successfully delivered to Priya Mehta, Mumbai.',
    time: '15m ago', unread: true
  },
  {
    id: 3, type: 'system', icon: 'alert-triangle', iconClass: 'notif-icon-stock',
    title: 'Low Stock Alert',
    desc: 'Red Roses stock is critically low — only 12 stems remaining.',
    time: '42m ago', unread: true
  },
  {
    id: 4, type: 'system', icon: 'star', iconClass: 'notif-icon-review',
    title: 'New 5-Star Review',
    desc: 'Arjun Kapoor left a 5-star review on "Anniversary Luxury Bundle".',
    time: '1h ago', unread: false
  },
  {
    id: 5, type: 'orders', icon: 'refresh-ccw', iconClass: 'notif-icon-order',
    title: 'Subscription Renewed',
    desc: 'Vikram T. automatically renewed his Bloom Plan (₹1,799).',
    time: '2h ago', unread: false
  },
  {
    id: 6, type: 'system', icon: 'gift', iconClass: 'notif-icon-system',
    title: 'Coupon LOVE20 Nearly Full',
    desc: 'LOVE20 coupon has been used 412/500 times. Consider extending.',
    time: '3h ago', unread: false
  },
  {
    id: 7, type: 'orders', icon: 'x-circle', iconClass: 'notif-icon-stock',
    title: 'Delivery Attempt Failed',
    desc: 'Order #RS-4810 — failed delivery attempt in Connaught Place, Delhi.',
    time: '4h ago', unread: false
  },
  {
    id: 8, type: 'system', icon: 'users', iconClass: 'notif-icon-system',
    title: 'New Subscriber Milestone',
    desc: 'Rose & Stem now has 1,842 active subscription members! 🎉',
    time: '6h ago', unread: false
  },
];

/* ═══════════════════════════════════════════════════════════
   2. PANEL SWITCHING
═══════════════════════════════════════════════════════════ */

/**
 * Switches the active dashboard panel.
 * @param {string} panelId - The data-panel value of the nav item
 */
function switchPanel(panelId) {
  /* Hide all panels */
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  /* Show target panel */
  const target = document.getElementById(`panel-${panelId}`);
  if (target) {
    target.classList.add('active');
    /* Scroll panels to top */
    const container = document.getElementById('panelsContainer');
    if (container) container.scrollTop = 0;
  }

  /* Update nav item active state */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    item.removeAttribute('aria-current');
  });

  const activeNav = document.querySelector(`.nav-item[data-panel="${panelId}"]`);
  if (activeNav) {
    activeNav.classList.add('active');
    activeNav.setAttribute('aria-current', 'page');
  }

  /* Update topbar title */
  const titleMap = {
    overview: 'Overview',
    analytics: 'Analytics',
    orders: 'Orders',
    delivery: 'Delivery Tracking',
    subscriptions: 'Subscriptions',
    products: 'Products',
    inventory: 'Inventory',
    occasions: 'Occasions & Reminders',
    customers: 'Customers',
    reviews: 'Reviews & Ratings',
    messages: 'Messages',
    blog: 'Blog CMS',
    promotions: 'Promotions',
    reports: 'Reports',
    settings: 'Settings',
  };

  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = titleMap[panelId] || panelId;

  /* Close mobile sidebar on panel change */
  closeMobileSidebar();

  /* Re-run counters if switching to analytics */
  if (panelId === 'analytics') {
    requestAnimationFrame(initCounters);
  }
}

/* Make switchPanel globally accessible (used by onclick attrs in HTML) */
window.switchPanel = switchPanel;

/* ═══════════════════════════════════════════════════════════
   3. SIDEBAR
═══════════════════════════════════════════════════════════ */

function initSidebar() {
  const sidebar     = document.getElementById('sidebar');
  const dashMain    = document.getElementById('dashMain');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  const mobileBtn   = document.getElementById('mobileMenuBtn');
  const overlay     = document.getElementById('sidebarOverlay');

  if (!sidebar) return;

  /* ── Desktop Collapse ── */
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      if (dashMain) dashMain.classList.toggle('sidebar-collapsed');
      /* Persist state */
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('rs_sidebar_collapsed', isCollapsed ? '1' : '0');
      /* Re-trigger charts to resize */
      setTimeout(redrawCharts, 320);
    });

    /* Restore collapsed state */
    if (localStorage.getItem('rs_sidebar_collapsed') === '1') {
      sidebar.classList.add('collapsed');
      if (dashMain) dashMain.classList.add('sidebar-collapsed');
    }
  }

  /* ── Mobile Toggle ── */
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('mobile-open');
      if (isOpen) {
        closeMobileSidebar();
      } else {
        sidebar.classList.add('mobile-open');
        if (overlay) overlay.classList.add('active');
        mobileBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  /* Overlay click closes mobile sidebar */
  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  /* Nav item clicks */
  document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
    item.addEventListener('click', () => {
      switchPanel(item.dataset.panel);
    });
  });
}

function closeMobileSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const mobileBtn = document.getElementById('mobileMenuBtn');

  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
  if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════
   4. NOTIFICATIONS
═══════════════════════════════════════════════════════════ */

let currentNotifTab  = 'all';
let notifItems       = [...NOTIFICATIONS];

function initNotifications() {
  const btn         = document.getElementById('notifBtn');
  const panel       = document.getElementById('notifPanel');
  const closeBtn    = document.getElementById('notifClose');
  const markAllBtn  = document.getElementById('markAllRead');
  const dot         = document.getElementById('notifDot');
  const wrapper     = document.getElementById('notifWrapper');

  if (!btn || !panel) return;

  /* Render notifications */
  renderNotifications('all');

  /* Update dot */
  updateNotifDot();

  /* Toggle panel */
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      panel.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  /* Close button */
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* Mark all read */
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      notifItems.forEach(n => (n.unread = false));
      renderNotifications(currentNotifTab);
      updateNotifDot();
    });
  }

  /* Notif tabs */
  document.querySelectorAll('.notif-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentNotifTab = tab.dataset.notifTab;
      renderNotifications(currentNotifTab);
    });
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (wrapper && !wrapper.contains(e.target)) {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Renders the notification list filtered by tab.
 * @param {string} tab - 'all' | 'orders' | 'system'
 */
function renderNotifications(tab) {
  const list = document.getElementById('notifList');
  if (!list) return;

  const filtered = tab === 'all'
    ? notifItems
    : notifItems.filter(n => n.type === tab);

  if (!filtered.length) {
    list.innerHTML = `<li class="notif-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 10px;color:var(--text-muted)"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      No notifications
    </li>`;
    return;
  }

  list.innerHTML = filtered.map(n => `
    <li class="notif-item ${n.unread ? 'unread' : ''}" data-notif-id="${n.id}" role="listitem">
      <div class="notif-icon ${n.iconClass}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${getLucideIconPath(n.icon)}
        </svg>
      </div>
      <div class="notif-content">
        <p class="notif-title">${n.title}</p>
        <p class="notif-desc">${n.desc}</p>
      </div>
      <span class="notif-time">${n.time}</span>
    </li>
  `).join('');

  /* Click on notification item — mark as read */
  list.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.notifId, 10);
      const notif = notifItems.find(n => n.id === id);
      if (notif) notif.unread = false;
      item.classList.remove('unread');
      updateNotifDot();
    });
  });
}

/** Updates or hides the red dot on the bell icon */
function updateNotifDot() {
  const dot = document.getElementById('notifDot');
  if (!dot) return;
  const hasUnread = notifItems.some(n => n.unread);
  dot.classList.toggle('hidden', !hasUnread);
}

/* ═══════════════════════════════════════════════════════════
   5. PROFILE DROPDOWN
═══════════════════════════════════════════════════════════ */

function initProfileDropdown() {
  const wrap     = document.getElementById('topbarProfileWrap');
  const btn      = document.getElementById('topbarProfileBtn');
  const dropdown = document.getElementById('profileDropdown');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) wrap.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (wrap && !wrap.contains(e.target)) wrap.classList.remove('open');
  });
}

/** Closes all open dropdowns (notif + profile) */
function closeAllDropdowns() {
  const notifPanel = document.getElementById('notifPanel');
  const profileWrap = document.getElementById('topbarProfileWrap');
  if (notifPanel) notifPanel.classList.remove('open');
  if (profileWrap) profileWrap.classList.remove('open');
}

/* ═══════════════════════════════════════════════════════════
   6. LOGOUT
═══════════════════════════════════════════════════════════ */

function initLogout() {
  const logoutBtn     = document.getElementById('logoutBtn');
  const profileLogout = document.getElementById('profileLogout');

  function showLogout() {
    if (typeof openModal === 'function') {
      openModal('logoutModal');
    }
  }

  if (logoutBtn)     logoutBtn.addEventListener('click', showLogout);
  if (profileLogout) profileLogout.addEventListener('click', showLogout);
}

/* ═══════════════════════════════════════════════════════════
   7. TOPBAR DATE
═══════════════════════════════════════════════════════════ */

function initTopbarDate() {
  const el = document.getElementById('topbarDate');
  if (!el) return;

  const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  el.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  el.style.display = 'inline';
}

/* ═══════════════════════════════════════════════════════════
   8. KPI COUNTERS
═══════════════════════════════════════════════════════════ */

function initCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    if (el.dataset.animated) return; /* Prevent re-animation */
    el.dataset.animated = '1';

    const target   = parseInt(el.dataset.target || '0', 10);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(target * eased);
      el.textContent = `${prefix}${current.toLocaleString('en-IN')}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    }

    /* Observe — only animate when visible */
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(update);
        obs.unobserve(el);
      }
    }, { threshold: 0.4 });

    obs.observe(el);
  });
}

/* ═══════════════════════════════════════════════════════════
   9. ORDERS TABLE
═══════════════════════════════════════════════════════════ */

const ORDER_DATA = [
  { id: '#RS-4822', customer: 'Deepika Nair', product: 'Luxury Rose Box', date: 'Apr 2, 2025', amount: '₹2,499', status: 'processing' },
  { id: '#RS-4821', customer: 'Priya Mehta', product: 'Red Rose Bouquet', date: 'Apr 2, 2025', amount: '₹1,299', status: 'delivered' },
  { id: '#RS-4820', customer: 'Rahul Kumar', product: 'Luxury Rose Box', date: 'Apr 1, 2025', amount: '₹2,499', status: 'transit' },
  { id: '#RS-4819', customer: 'Sneha Rao', product: 'Blush Arrangement', date: 'Apr 1, 2025', amount: '₹899', status: 'processing' },
  { id: '#RS-4818', customer: 'Arjun Patel', product: 'Mixed Seasonal', date: 'Apr 1, 2025', amount: '₹749', status: 'delivered' },
  { id: '#RS-4817', customer: 'Meera Singh', product: 'Birthday Surprise', date: 'Mar 31, 2025', amount: '₹1,599', status: 'pending' },
  { id: '#RS-4816', customer: 'Vikram Trivedi', product: 'Anniversary Luxury', date: 'Mar 31, 2025', amount: '₹3,499', status: 'transit' },
  { id: '#RS-4815', customer: 'Kavya Nair', product: 'Blush Pink', date: 'Mar 31, 2025', amount: '₹899', status: 'delivered' },
  { id: '#RS-4814', customer: 'Rohit Sharma', product: 'Red Rose Bouquet', date: 'Mar 30, 2025', amount: '₹1,299', status: 'delivered' },
  { id: '#RS-4813', customer: 'Ananya Lal', product: 'Mixed Seasonal', date: 'Mar 30, 2025', amount: '₹749', status: 'delivered' },
];

const STATUS_LABEL = {
  delivered: 'Delivered',
  transit: 'In Transit',
  processing: 'Processing',
  pending: 'Pending',
};

function initOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  tbody.innerHTML = ORDER_DATA.map(order => `
    <tr>
      <td><input type="checkbox" aria-label="Select order ${order.id}" /></td>
      <td style="font-weight:600;color:var(--color-primary)">${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.product}</td>
      <td style="color:var(--text-muted)">${order.date}</td>
      <td style="font-weight:600">${order.amount}</td>
      <td><span class="status-badge status-${order.status}">${STATUS_LABEL[order.status]}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" style="padding:5px 12px;font-size:11px;" aria-label="View order ${order.id}">View</button>
      </td>
    </tr>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════
   10. MINI CHARTS (vanilla canvas)
═══════════════════════════════════════════════════════════ */

/**
 * Draws a bar chart on a canvas element using raw Canvas 2D API.
 * No external library required.
 */
function drawBarChart(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  /* Size canvas */
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width  = rect.width  + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;

  /* Colors from CSS vars */
  const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  const padL = 40, padR = 16, padT = 12, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...values) * 1.15 || 1;
  const barCount = values.length;
  const barGap   = chartW / barCount;
  const barW     = Math.max(barGap * 0.55, 6);

  ctx.clearRect(0, 0, W, H);

  /* Grid lines */
  const gridLines = 4;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= gridLines; i++) {
    const y = padT + (chartH / gridLines) * i;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();

    /* Y axis labels */
    const val = maxVal - (maxVal / gridLines) * i;
    ctx.fillStyle = textColor;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : Math.round(val), padL - 6, y + 4);
  }

  ctx.setLineDash([]);

  /* Bars with rounded tops */
  values.forEach((val, i) => {
    const bH = (val / maxVal) * chartH;
    const x  = padL + barGap * i + (barGap - barW) / 2;
    const y  = padT + chartH - bH;

    /* Bar gradient */
    const grad = ctx.createLinearGradient(0, y, 0, padT + chartH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '55');

    ctx.fillStyle = grad;

    /* Rounded top */
    const r = Math.min(4, barW / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, padT + chartH);
    ctx.lineTo(x, padT + chartH);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    /* X labels */
    ctx.fillStyle = textColor;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, padT + chartH + 16);
  });

  /* Store data on canvas for period switching */
  canvas._chartData = { labels, values, color };
}

/**
 * Draws a donut chart on a canvas element.
 */
function drawDonutChart(canvasId, values, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width  = rect.width  + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(W, H) / 2 - 8;
  const r  = R * 0.6;

  ctx.clearRect(0, 0, W, H);

  const total = values.reduce((s, v) => s + v, 0) || 1;
  let startAngle = -Math.PI / 2;

  values.forEach((val, i) => {
    const slice = (val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, R, startAngle, startAngle + slice);
    ctx.arc(cx, cy, r, startAngle + slice, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    startAngle += slice;
  });

  /* Center text */
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(43,43,43,0.85)';
  ctx.font = `bold ${Math.round(R * 0.28)}px Playfair Display, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Top 4', cx, cy - 8);
  ctx.font = `${Math.round(R * 0.18)}px Inter, sans-serif`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  ctx.fillText('bouquets', cx, cy + 10);
}

/* Revenue data sets by period */
const REVENUE_DATA = {
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [28000, 34000, 29000, 42000, 38000, 51000, 48000],
  },
  '30d': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    values: [142000, 178000, 162000, 201000],
  },
  '90d': {
    labels: ['Jan', 'Feb', 'Mar'],
    values: [820000, 940000, 1284000],
  },
};

function initCharts() {
  /* Overview: Revenue bar chart */
  const { labels, values } = REVENUE_DATA['7d'];
  drawBarChart('revenueChart', labels, values, '#C84C6A');

  /* Overview: Bouquet donut */
  drawDonutChart('bouquetChart', [38, 24, 21, 17], ['#C84C6A', '#EFA3B1', '#5E8B7E', '#E6C07B']);

  /* Analytics: Monthly line/bar */
  drawBarChart('monthlyChart',
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    [640000, 720000, 890000, 820000, 940000, 1100000, 980000, 1050000, 1180000, 1240000, 980000, 1284000],
    '#5E8B7E'
  );

  /* Analytics: Traffic donut */
  drawDonutChart('trafficChart', [42, 29, 18, 11], ['#C84C6A', '#5E8B7E', '#E6C07B', '#8C5C74']);

  /* Period filter buttons */
  document.querySelectorAll('.chart-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const period = btn.dataset.period;
      const data   = REVENUE_DATA[period];
      if (data) {
        drawBarChart('revenueChart', data.labels, data.values, '#C84C6A');
      }
    });
  });
}

/** Redraws all charts (called after sidebar resize) */
function redrawCharts() {
  const { labels, values } = REVENUE_DATA['7d'];
  drawBarChart('revenueChart', labels, values, '#C84C6A');
  drawDonutChart('bouquetChart', [38, 24, 21, 17], ['#C84C6A', '#EFA3B1', '#5E8B7E', '#E6C07B']);
  drawBarChart('monthlyChart',
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    [640000, 720000, 890000, 820000, 940000, 1100000, 980000, 1050000, 1180000, 1240000, 980000, 1284000],
    '#5E8B7E'
  );
  drawDonutChart('trafficChart', [42, 29, 18, 11], ['#C84C6A', '#5E8B7E', '#E6C07B', '#8C5C74']);
}

/* Redraw on theme change */
document.addEventListener('themeChange', redrawCharts);

/* Redraw on window resize */
window.addEventListener('resize', debounceResize(redrawCharts, 300));

function debounceResize(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}



/* ═══════════════════════════════════════════════════════════
   12. LUCIDE ICON HELPER
   Returns raw SVG path data for inline use in dynamically
   generated HTML (notifications list).
═══════════════════════════════════════════════════════════ */

function getLucideIconPath(name) {
  const icons = {
    'shopping-bag':   '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    'truck':          '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'star':           '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'refresh-ccw':    '<path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/>',
    'gift':           '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    'users':          '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'x-circle':       '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  };
  return icons[name] || '<circle cx="12" cy="12" r="10"/>';
}

/* ═══════════════════════════════════════════════════════════
   13. INIT
═══════════════════════════════════════════════════════════ */

function initDashboard() {
  initSidebar();
  initNotifications();
  initProfileDropdown();
  initLogout();
  initTopbarDate();
  initOrdersTable();
  initCounters();

  /* Charts need a tick for layout to settle */
  requestAnimationFrame(() => {
    setTimeout(initCharts, 100);
  });

  /* Lucide icons */
  if (typeof lucide !== 'undefined') lucide.createIcons();

  /* Global modal support (logout) — provide fallback if global.js not loaded */
  if (typeof window.openModal !== 'function') {
    window.openModal  = (id) => { const el = document.getElementById(id); if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; } };
    window.closeModal = (id) => { const el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } };

    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-backdrop')) closeModal(e.target.id);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const open = document.querySelector('.modal-backdrop.open');
        if (open) closeModal(open.id);
      }
    });
  }
}

/* Bootstrap */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
