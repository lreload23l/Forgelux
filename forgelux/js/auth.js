// ─── Forgelux Auth ───────────────────────────────────────────────
// Simulates session state. In production this would verify a JWT / cookie.

const DEMO_USER = {
  id: 'usr_001',
  name: 'Luke Ryan',
  initials: 'LR',
  email: 'luke@forgelux.io',
  plan: 'Pro',
  planRenews: '4 Jul 2026',
  workspace: 'Luke\'s Workspace',
  seatsUsed: 7,
  seatsTotal: 25,
  runsUsed: 34012,
  runsTotal: 50000,
  appsCount: 12,
};

// Public pages that don't need auth
const PUBLIC_PAGES = ['index.html', 'login.html', ''];

function getUser() {
  // In production: verify token, fetch from API
  // For demo: always return DEMO_USER
  return DEMO_USER;
}

function requireAuth() {
  const page = window.location.pathname.split('/').pop();
  if (PUBLIC_PAGES.includes(page)) return;
  const user = getUser();
  if (!user) window.location.href = 'login.html';
  return user;
}

function logout() {
  localStorage.removeItem('flx_session');
  window.location.href = 'login.html';
}

// Active nav item highlighting
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

window.FLX = { getUser, requireAuth, logout, setActiveNav };
