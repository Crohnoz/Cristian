(() => {
  const KEY = 'cristian-cyber-academy:telemetry:v1';
  const MAX_EVENTS = 120;
  const sessionId = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `s-${Date.now()}`;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  function track(name, properties = {}) {
    const event = {
      name: String(name).slice(0, 80),
      properties,
      sessionId,
      at: new Date().toISOString(),
      path: location.pathname,
      hash: location.hash
    };
    const events = read();
    events.unshift(event);
    localStorage.setItem(KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
    window.dispatchEvent(new CustomEvent('crohnoz:telemetry', { detail: event }));
    return event;
  }

  function exportEvents() {
    return read();
  }

  window.CrohnozTelemetry = Object.freeze({ track, exportEvents, sessionId });
})();
