(() => {
  const config = window.CCA_CONFIG || {};
  const localReplies = {
    web: 'Identifica primero la entrada controlada por usuario, el contexto de salida y la defensa apropiada para ese contexto.',
    phishing: 'Evalúa identidad, dominio, urgencia, solicitud de secretos y coherencia con el canal habitual. Busca el patrón completo.',
    api: 'Separa autenticación de autorización y verifica el permiso server-side para cada objeto solicitado.',
    osint: 'Registra fuente, fecha y nivel de confianza; corrobora antes de convertir una coincidencia en conclusión.',
    general: 'Identifica el activo, el límite de confianza y la evidencia que demostraría que el control funciona.'
  };

  function category(question) {
    const q = String(question || '').toLowerCase();
    if (/xss|csrf|html|web|cookie|session/.test(q)) return 'web';
    if (/phish|correo|email|social/.test(q)) return 'phishing';
    if (/api|auth|bola|object|token/.test(q)) return 'api';
    if (/osint|fuente|source|expos/.test(q)) return 'osint';
    return 'general';
  }

  function remoteEnabled() {
    const runtimeFlags = window.CCA_RUNTIME_FLAGS || {};
    return runtimeFlags[config.featureFlags?.liveAiMentor] === true;
  }

  async function ask({ question, module = null, lab = null, mode = 'guided' }) {
    const prompt = String(question || '').trim();
    if (!prompt) throw new Error('Question required');
    if (prompt.length > 2000) throw new Error('Question too long');

    const topicCategory = category(prompt);
    window.CrohnozAnalytics?.capture('mentor_topic', {
      topic_category: topicCategory,
      module: module || undefined,
      lab: lab || undefined,
      result: remoteEnabled() ? 'remote_requested' : 'local_fallback'
    });

    if (remoteEnabled()) {
      const provider = window.CROHNOZ_MENTOR_PROVIDER;
      if (!provider?.ask || typeof provider.ask !== 'function') {
        return { mode: 'local', topicCategory, answer: localReplies[topicCategory], reason: 'provider_unavailable' };
      }
      return provider.ask({ question: prompt, module, lab, mode, topicCategory });
    }

    return { mode: 'local', topicCategory, answer: localReplies[topicCategory], reason: 'feature_gate_off' };
  }

  window.CrohnozMentor = Object.freeze({ ask, category, remoteEnabled });
})();
