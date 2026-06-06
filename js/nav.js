// ─── Forgelux Shared Nav ─────────────────────────────────────────
// Injects sidebar + topbar into every dashboard page.
// Each page calls: Nav.init({ title: 'Page Title' })

const Nav = (() => {

  function sidebar(user) {
    return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">⬡</div>
        <span class="logo-text" onclick="window.location='/dashboard'" style="cursor:pointer">Forgelux</span>
      </div>
      <nav class="sidebar-nav">
        <a class="nav-item" data-page="/dashboard" href="/dashboard"><span class="nav-icon">⊞</span> Overview</a>

        <div class="nav-section-label">Build</div>
        <a class="nav-item" data-page="/builder" href="/builder"><span class="nav-icon">🏗</span> App Builder</a>
        <a class="nav-item" data-page="/automations" href="/automations"><span class="nav-icon">⚡</span> Automations <span class="nav-badge" id="nav-auto-badge" style="display:none">0</span></a>
        <a class="nav-item" data-page="database.html" href="#"><span class="nav-icon">🗄</span> Database</a>
        <a class="nav-item" data-page="integrations.html" href="#"><span class="nav-icon">🔌</span> Integrations</a>

        <div class="nav-section-label">Manage</div>
        <a class="nav-item" data-page="/apps" href="/apps"><span class="nav-icon">📱</span> My Apps <span class="nav-badge green" id="nav-apps-badge" style="display:none">0</span></a>
        <a class="nav-item" data-page="/team" href="/team"><span class="nav-icon">👥</span> Team</a>
        <a class="nav-item" data-page="/analytics" href="/analytics"><span class="nav-icon">📊</span> Analytics</a>

        <div class="nav-section-label">Account</div>
        <a class="nav-item" data-page="/billing" href="/billing"><span class="nav-icon">💳</span> Billing</a>
        <a class="nav-item" data-page="/settings" href="/settings"><span class="nav-icon">⚙</span> Settings</a>
        <a class="nav-item" href="https://docs.forgelux.co.uk" target="_blank"><span class="nav-icon">📖</span> Docs</a>
      </nav>
      <div class="sidebar-bottom">
        <div class="user-card" onclick="window.location='/settings'" style="cursor:pointer">
          <div class="user-avatar">${user.initials}</div>
          <div>
            <div class="user-name">${user.name}</div>
            <div class="user-plan">${user.plan} · ${user.role}</div>
          </div>
          <span class="user-chevron" onclick="event.stopPropagation();FLX.logout()" title="Sign out" style="cursor:pointer;padding:4px;border-radius:4px" onmouseenter="this.style.color='white'" onmouseleave="this.style.color=''">⏻</span>
        </div>
      </div>
    </aside>`;
  }

  function topbar(title, actions = '') {
    return `
    <header class="topbar">
      <span class="topbar-title">${title}</span>
      <div class="topbar-spacer"></div>
      <div class="search-bar">🔍 &nbsp;Search…</div>
      ${actions}
      <div class="topbar-notif" title="Notifications">🔔<div class="notif-dot"></div></div>
    </header>`;
  }

  function init({ title = 'Dashboard', actions = '' } = {}) {
    const user = window.FLX.requireAuth();
    if (!user) return;

    const wrapper = document.getElementById('app');
    const content = wrapper.innerHTML;
    wrapper.innerHTML = sidebar(user) + `<div class="main">${topbar(title, actions)}<div class="content">${content}</div></div>`;

    window.FLX.setActiveNav();
  }

  return { init };
})();
