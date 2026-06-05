// ─── Forgelux Storage Layer ─────────────────────────────────────
// Persists apps, automations and user preferences to localStorage.
// In production this would be replaced with API calls.

const FLXStorage = (() => {

  const PREFIX = 'flx_';

  function save(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ data, savedAt: new Date().toISOString() }));
      return true;
    } catch(e) {
      console.warn('FLXStorage: save failed', e);
      return false;
    }
  }

  function load(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data;
    } catch(e) {
      console.warn('FLXStorage: load failed', e);
      return null;
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function listKeys(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + (prefix || ''))) {
        keys.push(k.replace(PREFIX, ''));
      }
    }
    return keys;
  }

  // ── App-specific helpers ──

  function saveApp(appId, appData) {
    return save('app_' + appId, appData);
  }

  function loadApp(appId) {
    return load('app_' + appId);
  }

  function listApps() {
    return listKeys('app_').map(k => {
      const app = load(k);
      return app ? { id: k.replace('app_', ''), ...app } : null;
    }).filter(Boolean);
  }

  function savePreferences(prefs) {
    return save('preferences', prefs);
  }

  function loadPreferences() {
    return load('preferences') || { zoom: 1, theme: 'dark', accentColor: '#7B2FFF' };
  }

  function saveBuilderState(appId, nodes, connNodes, wires) {
    return save('builder_' + appId, { nodes, connNodes, wires, savedAt: new Date().toISOString() });
  }

  function loadBuilderState(appId) {
    return load('builder_' + appId);
  }

  function clearAll() {
    const keys = listKeys();
    keys.forEach(k => localStorage.removeItem(PREFIX + k));
  }

  return { save, load, remove, listKeys, saveApp, loadApp, listApps, savePreferences, loadPreferences, saveBuilderState, loadBuilderState, clearAll };
})();

window.FLXStorage = FLXStorage;
