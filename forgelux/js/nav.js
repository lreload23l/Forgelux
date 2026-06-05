// ─── Forgelux Shared Nav ─────────────────────────────────────────
// Injects sidebar + topbar into every dashboard page.
// Each page calls: Nav.init({ title: 'Page Title' })

const Nav = (() => {

  function sidebar(user) {
    return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">⬡</div>
        <span class="logo-text" onclick="window.location='dashboard.html'" style="cursor:pointer">Forgelux</span>
      </div>
      <nav class="sidebar-nav">
        <a class="nav-item" data-page="dashboard.html" href="dashboard.html"><span class="nav-icon">⊞</span> Overview</a>

        <div class="nav-section-label">Build</div>
        <a class="nav-item" data-page="builder.html" href="builder.html"><span class="nav-icon">🏗</span> App Builder</a>
        <a class="nav-item" data-page="automations.html" href="automations.html"><span class="nav-icon">⚡</span> Automations <span class="nav-badge">3</span></a>
        <a class="nav-item" data-page="database.html" href="database.html"><span class="nav-icon">🗄</span> Database</a>
        <a class="nav-item" data-page="integrations.html" href="integrations.html"><span class="nav-icon">🔌</span> Integrations</a>

        <div class="nav-section-label">Manage</div>
        <a class="nav-item" data-page="apps.html" href="apps.html"><span class="nav-icon">📱</span> My Apps <span class="nav-badge green">12</span></a>
        <a class="nav-item" data-page="team.html" href="team.html"><span class="nav-icon">👥</span> Team</a>
        <a class="nav-item" data-page="analytics.html" href="analytics.html"><span class="nav-icon">📊</span> Analytics</a>

        <div class="nav-section-label">Account</div>
        <a class="nav-item" data-page="billing.html" href="billing.html"><span class="nav-icon">💳</span> Billing</a>
        <a class="nav-item" data-page="settings.html" href="settings.html"><span class="nav-icon">⚙</span> Settings</a>
        <a class="nav-item" href="https://docs.forgelux.io" target="_blank"><span class="nav-icon">📖</span> Docs</a>
      </nav>
      <div class="sidebar-bottom">
        <div class="user-card" onclick="window.location='settings.html'">
          <div class="user-avatar">${user.initials}</div>
          <div>
            <div class="user-name">${user.name}</div>
            <div class="user-plan">${user.plan} Plan</div>
          </div>
          <span class="user-chevron">⌄</span>
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
      <div class="topbar-notif" onclick="window.location='dashboard.html'">🔔<div class="notif-dot"></div></div>
    </header>`;
  }

  function init({ title, actions = '' } = {}) {
    const user = window.FLX.requireAuth();
    if (!user) return;

    // Inject sidebar + topbar
    const wrapper = document.getElementById('app');
    const content = wrapper.innerHTML;
    wrapper.innerHTML = sidebar(user) + `<div class="main">${topbar(title, actions)}<div class="content">${content}</div></div>`;

    window.FLX.setActiveNav();
  }

  return { init };
})();
