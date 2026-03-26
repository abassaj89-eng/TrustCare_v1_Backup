// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== NAVBAR DROPDOWNS (one open at a time, close on outside click) =====
const dropdownWraps = document.querySelectorAll('.navbar__dropdown-wrap');
dropdownWraps.forEach(wrap => {
  const toggle = wrap.querySelector('.navbar__dropdown-toggle');
  toggle?.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = wrap.classList.contains('open');
    // Close all first
    dropdownWraps.forEach(w => w.classList.remove('open'));
    // Toggle clicked one
    if (!isOpen) wrap.classList.add('open');
  });
});
// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar__dropdown-wrap')) {
    dropdownWraps.forEach(w => w.classList.remove('open'));
  }
});

// ===== MOBILE MENU =====
const toggle = document.querySelector('.navbar__toggle');
const mobileMenu = document.querySelector('.mobile-menu');

toggle?.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = toggle.querySelectorAll('span');
  const isOpen = mobileMenu.classList.contains('open');
  spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
  spans[1].style.opacity  = isOpen ? '0' : '1';
  spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

// ===== ACCORDION =====
document.querySelectorAll('.accordion__header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.accordion__item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion__item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Open first accordion item by default
const firstAccordion = document.querySelector('.accordion__item');
if (firstAccordion) firstAccordion.classList.add('open');

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

function attachRevealObserver() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}
attachRevealObserver();

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = eased * target;
    el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

function attachCounterObserver() {
  document.querySelectorAll('[data-target]:not([data-animated])').forEach(el => counterObserver.observe(el));
}
attachCounterObserver();

// ===== FORM SUBMIT (Formspree AJAX) =====
document.querySelectorAll('.contact-form').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        btn.textContent = 'Sent ✓';
        btn.style.background = '#014B11';
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.textContent = 'Error — please try again';
      btn.style.background = '#dc2626';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  });
});

// ========================================================
//  WIZARD + TAB NAVIGATION
// ========================================================

const PAGES = [
  { id: 'page-home',       label: 'Home' },
  { id: 'page-services',   label: 'Services' },
  { id: 'page-hi',         label: 'High Intensity' },
  { id: 'page-about',      label: 'About' },
  { id: 'page-blog',       label: 'Resources' },
  { id: 'page-work',       label: 'Work With Us' },
  { id: 'page-refer',      label: 'Refer' },
  { id: 'page-contact',    label: 'Contact' },
  { id: 'page-complaints', label: 'Complaints' },
  { id: 'page-feedback',   label: 'Feedback' },
];

let currentPage = 0;

function goToPage(index, anchorId) {
  if (index < 0 || index >= PAGES.length) return;

  // Hide current
  const prev = document.querySelector('.wizard-page.active');
  if (prev) prev.classList.remove('active');

  // Show new
  const next = document.getElementById(PAGES[index].id);
  if (!next) return;
  next.classList.add('active');

  currentPage = index;

  // Sync active tab
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.tab-item[data-page="${PAGES[index].id}"]`);
  if (activeTab) activeTab.classList.add('active');

  // Update wizard nav
  document.getElementById('wizLabel').textContent = PAGES[index].label;
  updateDots();
  updateNavButtons();

  // Close any open dropdowns
  document.querySelectorAll('.tab-item.open').forEach(t => t.classList.remove('open'));
  // Close mobile menu
  mobileMenu && mobileMenu.classList.remove('open');

  // Scroll
  if (anchorId) {
    requestAnimationFrame(() => {
      const el = document.getElementById(anchorId);
      if (el) {
        const offset = 130; // navbar + tabnav
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Re-attach observers and force-animate counters in newly visible page
  setTimeout(() => {
    attachRevealObserver();
    attachCounterObserver();
    // Force animate any counters in the active page that haven't run yet
    next.querySelectorAll('[data-target]:not([data-animated])').forEach(el => {
      animateCounter(el);
    });
  }, 100);
}

// ===== DOT GENERATION =====
function generateDots() {
  const container = document.getElementById('wizDots');
  if (!container) return;
  container.innerHTML = PAGES.map((p, i) =>
    `<button class="wiz-dot${i === 0 ? ' active' : ''}" data-index="${i}" title="${p.label}" aria-label="Go to ${p.label}"></button>`
  ).join('');
  container.querySelectorAll('.wiz-dot').forEach(dot => {
    dot.addEventListener('click', () => goToPage(parseInt(dot.dataset.index)));
  });
}

function updateDots() {
  document.querySelectorAll('.wiz-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentPage);
  });
}

function updateNavButtons() {
  const prev = document.getElementById('wizPrev');
  const next = document.getElementById('wizNext');
  if (prev) prev.disabled = currentPage === 0;
  if (next) next.disabled = currentPage === PAGES.length - 1;
}

// ===== WIZARD PREV / NEXT =====
document.getElementById('wizPrev')?.addEventListener('click', () => {
  if (currentPage > 0) goToPage(currentPage - 1);
});
document.getElementById('wizNext')?.addEventListener('click', () => {
  if (currentPage < PAGES.length - 1) goToPage(currentPage + 1);
});

// ===== TAB ITEM CLICKS =====
document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', (e) => {
    // Ignore if click came from inside a dropdown link
    if (e.target.classList.contains('dropdown-link')) return;

    const pageId = tab.dataset.page;
    const idx = PAGES.findIndex(p => p.id === pageId);

    if (tab.classList.contains('has-dropdown')) {
      // Toggle dropdown on mobile / keyboard; on desktop hover handles it
      tab.classList.toggle('open');
      if (idx >= 0) goToPage(idx);
      return;
    }

    if (idx >= 0) goToPage(idx);
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.tab-item')) {
    document.querySelectorAll('.tab-item.open').forEach(t => t.classList.remove('open'));
  }
});

// ===== DROPDOWN LINK CLICKS =====
document.querySelectorAll('.dropdown-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pageId = link.dataset.page;
    const anchor = link.dataset.anchor || null;
    if (!pageId) return;
    const idx = PAGES.findIndex(p => p.id === pageId);
    if (idx >= 0) goToPage(idx, anchor);
  });
});

// ===== data-wizard-page LINKS (navbar, footer, cards, buttons) =====
document.querySelectorAll('[data-wizard-page]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = el.dataset.wizardPage;
    const anchor = el.dataset.anchor || null;
    const idx = PAGES.findIndex(p => p.id === pageId);
    if (idx >= 0) goToPage(idx, anchor);
  });
});

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(currentPage + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToPage(currentPage - 1);
});

// ===== INIT =====
generateDots();
updateNavButtons();
// Set initial active tab
const initTab = document.querySelector(`.tab-item[data-page="${PAGES[0].id}"]`);
if (initTab) initTab.classList.add('active');
