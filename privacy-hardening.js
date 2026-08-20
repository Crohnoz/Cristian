(() => {
  const STORAGE_KEY = 'cristian-cyber-academy:v2';

  function category(value) {
    const q = String(value || '').toLowerCase();
    if (q.includes('xss') || q.includes('web')) return 'web_security';
    if (q.includes('phish') || q.includes('correo')) return 'phishing';
    if (q.includes('api') || q.includes('autoriz')) return 'api_security';
    if (q.includes('osint')) return 'osint';
    return 'general_security';
  }

  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (Array.isArray(state.events)) {
      let changed = false;
      state.events = state.events.map(event => {
        if (event?.type !== 'mentor_question' || !event.detail || typeof event.detail !== 'object') return event;
        const raw = event.detail.topic || event.detail.prompt || '';
        if (!raw && event.detail.topic_category) return event;
        changed = true;
        return { ...event, detail:{ topic_category:category(raw) } };
      });
      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {}

  if (typeof window.saveState === 'function' && !window.__CCA_PRIVATE_SAVE_STATE__) {
    const original = window.saveState;
    window.saveState = function secureSaveState(type, detail = {}) {
      if (type === 'mentor_question') {
        const raw = detail?.topic || detail?.prompt || '';
        return original(type, { topic_category:category(raw) });
      }
      return original(type, detail);
    };
    window.__CCA_PRIVATE_SAVE_STATE__ = true;
  }
})();