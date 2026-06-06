// ─── Forgelux Auth ───────────────────────────────────────────────
// Demo auth layer with hardcoded test accounts.
// Replace with real API calls when Supabase is connected.

const TEST_ACCOUNTS = [
  {
    email: 'luke@forgelux.co.uk',
    password: 'Forgelux123!',
    name: 'Luke Ryan',
    initials: 'LR',
    plan: 'Pro',
    role: 'Owner',
    workspace: "Luke's Workspace",
    runsUsed: 34012,
    runsTotal: 50000,
    seatsUsed: 7,
    seatsTotal: 25,
    appsCount: 12,
    planRenews: '4 Jul 2026',
  },
  {
    email: 'admin@forgelux.co.uk',
    password: 'Forgelux123!',
    name: 'Admin User',
    initials: 'AU',
    plan: 'Pro',
    role: 'Admin',
    workspace: "Luke's Workspace",
    runsUsed: 34012,
    runsTotal: 50000,
    seatsUsed: 7,
    seatsTotal: 25,
    appsCount: 12,
    planRenews: '4 Jul 2026',
  },
  {
    email: 'test@forgelux.co.uk',
    password: 'Forgelux123!',
    name: 'Test User',
    initials: 'TU',
    plan: 'Starter',
    role: 'Editor',
    workspace: 'Test Workspace',
    runsUsed: 1200,
    runsTotal: 5000,
    seatsUsed: 2,
    seatsTotal: 5,
    appsCount: 3,
    planRenews: '4 Jul 2026',
  },
  {
    email: 'viewer@forgelux.co.uk',
    password: 'Forgelux123!',
    name: 'Viewer User',
    initials: 'VU',
    plan: 'Starter',
    role: 'Viewer',
    workspace: 'Test Workspace',
    runsUsed: 1200,
    runsTotal: 5000,
    seatsUsed: 2,
    seatsTotal: 5,
    appsCount: 3,
    planRenews: '4 Jul 2026',
  },
];

// ── Session helpers ──
function saveSession(user) {
  const session = { ...user, loggedInAt: new Date().toISOString() };
  sessionStorage.setItem('flx_user', JSON.stringify(session));
}

function getUser() {
  try {
    const raw = sessionStorage.getItem('flx_user');
    return raw ? JSON.parse(raw) : null;
  } catch(e) {
    return null;
  }
}

function logout() {
  sessionStorage.removeItem('flx_user');
  window.location.href = '/login';
}

// ── Auth check — call on every protected page ──
const PUBLIC_PAGES = ['index.html', 'login.html', ''];

function requireAuth() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (PUBLIC_PAGES.includes(page)) return null;
  const user = getUser();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}

// ── Login function — called by login.html ──
function attemptLogin(email, password) {
  const match = TEST_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
  );
  if (match) {
    saveSession(match);
    return { success: true, user: match };
  }
  return { success: false, error: 'Incorrect email or password.' };
}

// ── Active nav highlighting ──
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

window.FLX = { getUser, requireAuth, logout, setActiveNav, attemptLogin, TEST_ACCOUNTS };
