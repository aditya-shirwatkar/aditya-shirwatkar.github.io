/* ============================================================
   MAIN.JS
   - Loads HTML sections dynamically (works on any web server / GitHub Pages)
   - Dark/light mode toggle (persists in localStorage)
   - Mobile nav toggle
   - Project tag filter
   - Chronological sorting
   ============================================================ */

// ---------- THEME ----------
const html = document.documentElement;

function applyTheme(t) {
  html.setAttribute('data-theme', t);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = t === 'dark'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

function toggleTheme() {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

// Apply saved (or system) theme immediately to avoid flash
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
})();

// ---------- MOBILE NAV ----------
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ---------- SECTION LOADER ----------
const SECTIONS = [
  'sections/about.html',
  'sections/publications.html',
  'sections/experience.html',
  'sections/talks.html',
  'sections/projects.html',
  'sections/contact.html',
];

async function loadSections() {
  const main    = document.getElementById('main-content');
  if (!main) return;
  const loading = document.getElementById('loading');

  // Fetch all in parallel, insert in order
  const results = await Promise.all(
    SECTIONS.map(url =>
      fetch(url + '?t=' + Date.now())
        .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
        .catch(err => { console.warn('Could not load', url, err); return ''; })
    )
  );

  if (loading) loading.remove();
  results.forEach(html => { if (html) main.insertAdjacentHTML('beforeend', html); });

  // Cache-bust all images so Live Preview doesn't serve stale ones
  document.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      img.src = src.split('?')[0] + '?t=' + Date.now();
    }
  });

  // Post-load inits (sections now exist in DOM)
  initProjectFilter();
  initPubFilter();
  initSorting();
}

// ---------- PROJECT FILTER ----------
function initProjectFilter() {
  const filterBar = document.querySelector('#projects .filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('#projects .project-card').forEach(card => {
      card.style.display =
        (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
  });
}

// ---------- PUBLICATION FILTER ----------
function initPubFilter() {
  const filterBar = document.querySelector('#publications .filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('#publications .project-card').forEach(card => {
      card.style.display =
        (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
  });
}

// ---------- CHRONOLOGICAL SORTING ----------
function initSorting() {
  sortTimeline();
  sortTalks();
  sortPublications();
}

function byDateDesc(a, b) {
  return (b.dataset.date || '').localeCompare(a.dataset.date || '');
}

function sortTimeline() {
  const wrapper = document.querySelector('.timeline-wrapper');
  if (!wrapper) return;
  const items = [...wrapper.children].filter(el => el.classList.contains('timeline-item'));
  items.sort(byDateDesc);
  items.forEach(el => wrapper.appendChild(el));
}

function sortTalks() {
  const list = document.querySelector('.talk-list');
  if (!list) return;
  const cards = [...list.children].filter(el => el.classList.contains('talk-card'));
  cards.sort(byDateDesc);
  cards.forEach(el => list.appendChild(el));
}

function sortPublications() {
  const list = document.querySelector('#publications .projects-grid');
  if (!list) return;

  const children = [...list.childNodes];
  const regular = [];
  const workshop = [];
  const other = [];

  for (const node of children) {
    if (node.nodeType === 1 && node.classList.contains('project-card')) {
      (node.dataset.category === 'workshop' ? workshop : regular).push(node);
    } else {
      other.push(node);
    }
  }

  regular.sort(byDateDesc);
  workshop.sort(byDateDesc);

  list.innerHTML = '';
  other.forEach(n => list.appendChild(n));
  regular.forEach(el => list.appendChild(el));
  workshop.forEach(el => list.appendChild(el));
}

// ---------- BOOT ----------
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('theme-toggle')
    ?.addEventListener('click', toggleTheme);
  initNav();
  loadSections();
});
