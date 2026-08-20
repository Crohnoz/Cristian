(() => {
  const config = window.CCA_CONFIG?.academyCore || {};
  const enabled = Boolean(config.enabled && config.apiBaseUrl);
  const baseUrl = String(config.apiBaseUrl || '').replace(/\/$/, '');
  const TOKEN_KEY = 'cca:academy-core-token:v1';

  const token = () => sessionStorage.getItem(TOKEN_KEY) || '';

  function clearToken(reason = 'logout') {
    const hadToken = Boolean(token());
    sessionStorage.removeItem(TOKEN_KEY);
    if (hadToken) window.dispatchEvent(new CustomEvent('cca:auth-cleared', { detail: { reason } }));
  }

  async function request(path, options = {}) {
    if (!enabled) throw new Error('ACADEMY_CORE_DISABLED');
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token()) headers.set('Authorization', `Token ${token()}`);

    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        credentials: 'omit',
        ...options,
        headers
      });
    } catch (cause) {
      const error = new Error('ACADEMY_CORE_NETWORK_ERROR');
      error.code = 'NETWORK_ERROR';
      error.cause = cause;
      throw error;
    }

    if (response.status === 204) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && token()) clearToken('expired');
      const detail = payload.detail || payload.non_field_errors?.[0]
        || Object.values(payload || {}).flat().find(value => typeof value === 'string');
      const error = new Error(detail || `ACADEMY_CORE_HTTP_${response.status}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  const get = path => request(path);
  const post = (path, data = {}) => request(path, { method: 'POST', body: JSON.stringify(data) });
  const patch = (path, data = {}) => request(path, { method: 'PATCH', body: JSON.stringify(data) });
  const del = path => request(path, { method: 'DELETE' });

  async function login(username, password) {
    const payload = await post('/api/v1/auth/token/', { username, password });
    if (!payload?.token) throw new Error('ACADEMY_CORE_TOKEN_MISSING');
    sessionStorage.setItem(TOKEN_KEY, payload.token);
    window.dispatchEvent(new CustomEvent('cca:auth-changed', { detail: { authenticated: true, provider: 'crohnoz-academy' } }));
    return payload;
  }

  async function logout() {
    try {
      if (token()) await post('/api/v1/auth/logout/');
    } catch (error) {
      console.warn('[CCA] Academy Core logout could not be confirmed', error);
    } finally {
      clearToken('logout');
    }
  }

  const api = {
    enabled,
    mode: enabled ? 'remote' : 'local-fallback',
    baseUrl,
    isAuthenticated: () => Boolean(token()),
    health: () => get('/api/v1/health/'),
    me: () => get('/api/v1/me/'),
    updateMe: data => patch('/api/v1/me/', data),

    // Learner academic core.
    courses: () => get('/api/v1/courses/'),
    learningPaths: () => get('/api/v1/learning-paths/'),
    enrollments: () => get('/api/v1/enrollments/'),
    lessonProgress: () => get('/api/v1/lesson-progress/'),
    assessmentAttempts: () => get('/api/v1/assessment-attempts/'),
    certificates: () => get('/api/v1/certificates/'),
    verifyCertificate: code => get(`/api/v1/certificates/verify/${encodeURIComponent(code)}/`),

    // Identity and account lifecycle.
    login,
    logout,
    changePassword: data => post('/api/v1/auth/change-password/', data),
    requestPasswordReset: email => post('/api/v1/auth/password-reset/request/', { email }),
    confirmPasswordReset: data => post('/api/v1/auth/password-reset/confirm/', data),
    activateInvitation: data => post('/api/v1/invitations/activate/', data),
    invitations: () => get('/api/v1/ops/invitations/'),
    createInvitation: data => post('/api/v1/ops/invitations/', data),
    revokeInvitation: id => post(`/api/v1/ops/invitations/${encodeURIComponent(id)}/revoke/`, {}),

    // Academic operations / tenant administration.
    opsProfiles: () => get('/api/v1/ops/profiles/'),
    updateOpsProfile: (id, data) => patch(`/api/v1/ops/profiles/${encodeURIComponent(id)}/`, data),
    opsCohorts: () => get('/api/v1/ops/cohorts/'),
    createCohort: data => post('/api/v1/ops/cohorts/', data),
    updateCohort: (id, data) => patch(`/api/v1/ops/cohorts/${encodeURIComponent(id)}/`, data),
    deleteCohort: id => del(`/api/v1/ops/cohorts/${encodeURIComponent(id)}/`),
    opsMemberships: () => get('/api/v1/ops/cohort-memberships/'),
    createMembership: data => post('/api/v1/ops/cohort-memberships/', data),
    updateMembership: (id, data) => patch(`/api/v1/ops/cohort-memberships/${encodeURIComponent(id)}/`, data),
    opsEnrollments: () => get('/api/v1/ops/enrollments/'),
    opsCertificates: () => get('/api/v1/ops/certificates/'),
    opsAuditEvents: () => get('/api/v1/ops/audit-events/'),

    // Content operations useful to coordinator/admin surfaces.
    studioCourses: () => get('/api/v1/studio/courses/'),
    studioLearningPaths: () => get('/api/v1/studio/learning-paths/')
  };

  window.CrohnozAcademyCore = Object.freeze(api);
})();