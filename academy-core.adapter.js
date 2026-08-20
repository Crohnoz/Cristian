(() => {
  const config = window.CCA_CONFIG?.academyCore || {};
  const enabled = Boolean(config.enabled && config.apiBaseUrl);
  const baseUrl = String(config.apiBaseUrl || '').replace(/\/$/, '');

  async function request(path, options = {}) {
    if (!enabled) throw new Error('ACADEMY_CORE_DISABLED');
    const response = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const error = new Error(`ACADEMY_CORE_HTTP_${response.status}`);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    return response.json();
  }

  const api = {
    enabled,
    mode: enabled ? 'remote' : 'local-fallback',
    health: () => request('/api/v1/health/'),
    me: () => request('/api/v1/me/'),
    courses: () => request('/api/v1/courses/'),
    learningPaths: () => request('/api/v1/learning-paths/'),
    enrollments: () => request('/api/v1/enrollments/'),
    lessonProgress: () => request('/api/v1/lesson-progress/'),
    assessmentAttempts: () => request('/api/v1/assessment-attempts/'),
    certificates: () => request('/api/v1/certificates/'),
    verifyCertificate: code => request(`/api/v1/certificates/verify/${encodeURIComponent(code)}/`),
    login: (username, password) => request('/api/v1/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
    logout: () => request('/api/v1/auth/logout/', { method: 'POST' })
  };

  window.CrohnozAcademyCore = Object.freeze(api);
})();
