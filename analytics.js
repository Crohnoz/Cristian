(() => {
  const CONSENT_KEY = 'cristian-cyber-academy:analytics-consent:v1';
  const CONFIG = window.CCA_CONFIG || {};
  const ALLOWED_EVENTS = new Set([
    'app_opened', 'view_opened', 'phishing_correct', 'phishing_retry',
    'range_completed', 'range_retry', 'certificate_unlocked',
    'achievement_unlocked', 'mentor_topic', 'assignment_created',
    'evidence_exported', 'command_opened', 'pwa_ready'
  ]);
  const PROPERTY_ALLOWLIST = new Set([
    'view', 'module', 'lab', 'achievement', 'topic_category',
    'result', 'readiness_band', 'tenant', 'version', 'source'
  ]);

  function readConsent() {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' ? 'granted' : value === 'denied' ? 'denied' : 'unset';
  }

  function setConsent(value) {
    if (!['granted', 'denied'].includes(value)) throw new Error('Invalid analytics consent value');
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent('crohnoz:analytics-consent', { detail: { value } }));
    return value;
  }

  function sanitizeProperties(properties = {}) {
    const safe = {};
    for (const [key, value] of Object.entries(properties)) {
      if (!PROPERTY_ALLOWLIST.has(key)) continue;
      if (!['string', 'number', 'boolean'].includes(typeof value)) continue;
      safe[key] = typeof value === 'string' ? value.slice(0, 80) : value;
    }
    safe.tenant = CONFIG.tenant?.id || 'unknown';
    safe.version = CONFIG.product?.version || 'unknown';
    return safe;
  }

  function capture(name, properties = {}) {
    if (!ALLOWED_EVENTS.has(name)) return { accepted: false, reason: 'event_not_allowed' };
    const safeProperties = sanitizeProperties(properties);
    window.CrohnozTelemetry?.track(name, safeProperties);

    // Remote analytics is deliberately disabled in the public repository.
    // A production adapter may forward this allowlisted event only after
    // explicit consent and tenant policy approval.
    if (readConsent() !== 'granted') return { accepted: true, remote: false };
    const provider = window.CROHNOZ_ANALYTICS_PROVIDER;
    if (provider?.capture && typeof provider.capture === 'function') {
      provider.capture(name, safeProperties);
      return { accepted: true, remote: true };
    }
    return { accepted: true, remote: false };
  }

  function readinessBand(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) return 'unknown';
    if (n >= 85) return 'advanced';
    if (n >= 75) return 'ready';
    if (n >= 60) return 'developing';
    return 'foundation';
  }

  window.CrohnozAnalytics = Object.freeze({
    capture,
    consent: Object.freeze({ get: readConsent, set: setConsent }),
    readinessBand,
    policy: Object.freeze({
      remoteDefault: false,
      sessionRecording: false,
      pii: false,
      sensitiveLearningContent: false
    })
  });
})();
