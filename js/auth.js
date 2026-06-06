// ─── Forgelux Auth ───────────────────────────────────────────────
// Uses Supabase auth in production.
// Falls back to test accounts for local development.

const TEST_ACCOUNTS = [
  { email:'luke@forgelux.co.uk',   password:'Forgelux123!', name:'Luke Ryan',   initials:'LR', plan:'Pro',     role:'Owner',  workspace:"Luke's Workspace", runsUsed:34012, runsTotal:50000, seatsUsed:7, seatsTotal:25 },
  { email:'admin@forgelux.co.uk',  password:'Forgelux123!', name:'Admin User',  initials:'AU', plan:'Pro',     role:'Admin',  workspace:"Luke's Workspace", runsUsed:34012, runsTotal:50000, seatsUsed:7, seatsTotal:25 },
  { email:'test@forgelux.co.uk',   password:'Forgelux123!', name:'Test User',   initials:'TU', plan:'Starter', role:'Editor', workspace:'Test Workspace',   runsUsed:1200,  runsTotal:5000,  seatsUsed:2, seatsTotal:5  },
  { email:'viewer@forgelux.co.uk', password:'Forgelux123!', name:'Viewer User', initials:'VU', plan:'Starter', role:'Viewer', workspace:'Test Workspace',   runsUsed:1200,  runsTotal:5000,  seatsUsed:2, seatsTotal:5  },
];

function saveSession(user) {
  sessionStorage.setItem('flx_user', JSON.stringify(user));
}

function getUser() {
  try {
    const raw = sessionStorage.getItem('flx_user');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function logout() {
  sessionStorage.removeItem('flx_user');
  // If Supabase is loaded, sign out from there too
  if (window.FLXdb) window.FLXdb.signOut();
  else window.location.href = '/login';
}

const PUBLIC_PAGES = ['index', 'login', ''];

function requireAuth() {
  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  if (PUBLIC_PAGES.includes(page)) return null;
  const user = getUser();
  if (!user) { window.location.href = '/login'; return null; }
  return user;
}

function attemptLogin(email, password) {
  const match = TEST_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
  );
  if (match) { saveSession(match); return { success: true, user: match }; }
  return { success: false, error: 'Incorrect email or password.' };
}

function setActiveNav() {
  const page = '/'+window.location.pathname.split('/').pop().replace('.html','');
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

window.FLX = { getUser, requireAuth, logout, setActiveNav, attemptLogin, saveSession, TEST_ACCOUNTS };
