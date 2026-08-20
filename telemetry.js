(() => {
  const KEY = 'cristian-cyber-academy:telemetry:v2';
  const MAX_EVENTS = 120;
  const sessionId = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `s-${Date.now()}`;
  const SAFE_KEYS = new Set([
    'view', 'module', 'lab', 'achievement', 'topic_category', 'topic',
    'result', 'correct', 'messageId', 'readiness_band', 'source'
  ]);

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.slice(0, MAX_EVENTS) : [];
    } catch { return []; }
  }

  function sanitize(properties = {}) {
    const safe = {};
    for (const [key, value] of Object.entries(properties || {})) {
      if (!SAFE_KEYS.has(key)) continue;
      if (!['string', 'number', 'boolean'].includes(typeof value)) continue;
      safe[key] = typeof value === 'string' ? value.slice(0, 80) : value;
    }
    return safe;
  }

  function track(name, properties = {}) {
    const event = {
      name: String(name).replace(/[^a-zA-Z0-9:_-]/g, '_').slice(0, 80),
      properties: sanitize(properties),
      sessionId,
      at: new Date().toISOString(),
      path: location.pathname,
      hash: location.hash.slice(0, 80)
    };
    const events = read();
    events.unshift(event);
    localStorage.setItem(KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
    window.dispatchEvent(new CustomEvent('crohnoz:telemetry', { detail: event }));
    return event;
  }

  function exportEvents() { return read(); }
  function clear() { localStorage.removeItem(KEY); }

  window.CrohnozTelemetry = Object.freeze({ track, exportEvents, clear, sessionId });
})();
