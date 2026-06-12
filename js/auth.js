// ─── Forgelux Auth ───────────────────────────────────────────────
// Session helpers. The sessionStorage copy of the user profile is a
// UI cache only — real access control is the Supabase session + RLS.

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
  if (window.FLXdb) window.FLXdb.signOut();
  else window.location.href = '/login';
}

const PUBLIC_PAGES = ['index', 'login', ''];

function requireAuth() {
  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  if (PUBLIC_PAGES.includes(page)) return null;

  // Fast UI guard (instant redirect, no flash of protected content)
  const user = getUser();
  if (!user) { window.location.href = '/login'; return null; }

  // Real guard: verify the Supabase session in the background.
  // A forged sessionStorage entry gets bounced here, and RLS means
  // it could never read data anyway.
  verifyRealSession();
  return user;
}

async function verifyRealSession() {
  try {
    const mod = await import('/js/supabase.js');
    const { data } = await mod.supabase.auth.getSession();
    if (!data?.session) {
      sessionStorage.removeItem('flx_user');
      window.location.href = '/login';
    }
  } catch(e) {
    // Network/CDN failure — fail open for UI, RLS still protects data.
    console.warn('Session verification unavailable', e);
  }
}

function setActiveNav() {
  const page = '/'+window.location.pathname.split('/').pop().replace('.html','');
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

window.FLX = { getUser, requireAuth, logout, setActiveNav, saveSession };
