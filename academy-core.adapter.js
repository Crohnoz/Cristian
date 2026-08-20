(() => {
  const config = window.CCA_CONFIG?.academyCore || {};
  const enabled = Boolean(config.enabled && config.apiBaseUrl);
  const baseUrl = String(config.apiBaseUrl || '').replace(/\/$/, '');
  const organizationSlug = String(config.organizationSlug || window.CCA_CONFIG?.tenant?.id || '').trim();
  const tenantScopeReady = Boolean(config.contentTenantScoped === true && organizationSlug);
  const TOKEN_KEY = 'cca:academy-core-token:v1';

  const token = () => sessionStorage.getItem(TOKEN_KEY) || '';

  function clearToken(reason = 'logout') {
    const hadToken = Boolean(token());
    sessionStorage.removeItem(TOKEN_KEY);
    if (hadToken) window.dispatchEvent(new CustomEvent('cca:auth-cleared', { detail: { reason } }));
  }

  async function request(path, options = {}) {
    if (!enabled) throw new Error('ACADEMY_CORE_DISABLED');
    const { tenantScoped = false, ...fetchOptions } = options;
    if (tenantScoped && !tenantScopeReady) {
      const error = new Error('ACADEMY_CONTENT_SCOPE_NOT_CONFIGURED');
      error.code = 'CONTENT_SCOPE_NOT_CONFIGURED';
      throw error;
    }

    const headers = new Headers(fetchOptions.headers || {});
    headers.set('Accept', 'application/json');
    if (fetchOptions.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token()) headers.set('Authorization', `Token ${token()}`);
    if (tenantScoped) headers.set('X-Academy-Organization', organizationSlug);

    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, { credentials: 'omit', ...fetchOptions, headers });
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

  const scopedGet = path => request(path, { tenantScoped: true });
  const scopedPost = (path, data = {}) => request(path, { tenantScoped: true, method: 'POST', body: JSON.stringify(data) });
  const scopedPatch = (path, data = {}) => request(path, { tenantScoped: true, method: 'PATCH', body: JSON.stringify(data) });
  const scopedDelete = path => request(path, { tenantScoped: true, method: 'DELETE' });

  async function login(username, password) {
    const payload = await post('/api/v1/auth/token/', { username, password });
    if (!payload?.token) throw new Error('ACADEMY_CORE_TOKEN_MISSING');
    sessionStorage.setItem(TOKEN_KEY, payload.token);
    window.dispatchEvent(new CustomEvent('cca:auth-changed', { detail: { authenticated: true, provider: 'crohnoz-academy' } }));
    return payload;
  }

  async function logout() {
    try { if (token()) await post('/api/v1/auth/logout/'); }
    catch (error) { console.warn('[CCA] Academy Core logout could not be confirmed', error); }
    finally { clearToken('logout'); }
  }

  const studioResource = resource => {
    const path = `/api/v1/studio/${resource}/`;
    return Object.freeze({
      list: () => scopedGet(path),
      retrieve: id => scopedGet(`${path}${encodeURIComponent(id)}/`),
      create: data => scopedPost(path, data),
      update: (id, data) => scopedPatch(`${path}${encodeURIComponent(id)}/`, data),
      remove: id => scopedDelete(`${path}${encodeURIComponent(id)}/`)
    });
  };

  const studioCompetencies = studioResource('competencies');
  const studioCourses = studioResource('courses');
  const studioLearningPaths = studioResource('learning-paths');
  const studioModules = studioResource('modules');
  const studioLessons = studioResource('lessons');
  const studioAssessments = studioResource('assessments');

  const api = {
    enabled,
    mode: enabled ? 'remote' : 'local-fallback',
    baseUrl,
    organizationSlug,
    contentScopeReady: () => tenantScopeReady,
    isAuthenticated: () => Boolean(token()),
    health: () => get('/api/v1/health/'),
    me: () => get('/api/v1/me/'),
    updateMe: data => patch('/api/v1/me/', data),

    courses: () => scopedGet('/api/v1/courses/'),
    learningPaths: () => scopedGet('/api/v1/learning-paths/'),
    enrollments: () => scopedGet('/api/v1/enrollments/'),
    createEnrollment: data => scopedPost('/api/v1/enrollments/', data),
    lessonProgress: () => scopedGet('/api/v1/lesson-progress/'),
    createLessonProgress: data => scopedPost('/api/v1/lesson-progress/', data),
    updateLessonProgress: (id, data) => scopedPatch(`/api/v1/lesson-progress/${encodeURIComponent(id)}/`, data),
    assessmentAttempts: () => scopedGet('/api/v1/assessment-attempts/'),
    createAssessmentAttempt: data => scopedPost('/api/v1/assessment-attempts/', data),
    certificates: () => scopedGet('/api/v1/certificates/'),
    verifyCertificate: code => get(`/api/v1/certificates/verify/${encodeURIComponent(code)}/`),

    login,
    logout,
    changePassword: data => post('/api/v1/auth/change-password/', data),
    requestPasswordReset: email => post('/api/v1/auth/password-reset/request/', { email }),
    confirmPasswordReset: data => post('/api/v1/auth/password-reset/confirm/', data),
    activateInvitation: data => post('/api/v1/invitations/activate/', data),
    invitations: () => get('/api/v1/ops/invitations/'),
    createInvitation: data => post('/api/v1/ops/invitations/', data),
    revokeInvitation: id => post(`/api/v1/ops/invitations/${encodeURIComponent(id)}/revoke/`, {}),

    opsProfiles: () => get('/api/v1/ops/profiles/'),
    updateOpsProfile: (id, data) => patch(`/api/v1/ops/profiles/${encodeURIComponent(id)}/`, data),
    suspendOpsProfile: id => post(`/api/v1/ops/profiles/${encodeURIComponent(id)}/suspend/`, {}),
    reactivateOpsProfile: id => post(`/api/v1/ops/profiles/${encodeURIComponent(id)}/reactivate/`, {}),
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

    studioCompetencies: studioCompetencies.list,
    createStudioCompetency: studioCompetencies.create,
    updateStudioCompetency: studioCompetencies.update,
    deleteStudioCompetency: studioCompetencies.remove,

    studioCourses: studioCourses.list,
    studioCourse: studioCourses.retrieve,
    createStudioCourse: studioCourses.create,
    updateStudioCourse: studioCourses.update,
    deleteStudioCourse: studioCourses.remove,
    transitionStudioCourse: (id, status) => scopedPost(`/api/v1/studio/courses/${encodeURIComponent(id)}/transition/`, { status }),

    studioLearningPaths: studioLearningPaths.list,
    studioLearningPath: studioLearningPaths.retrieve,
    createStudioLearningPath: studioLearningPaths.create,
    updateStudioLearningPath: studioLearningPaths.update,
    deleteStudioLearningPath: studioLearningPaths.remove,
    transitionStudioLearningPath: (id, status) => scopedPost(`/api/v1/studio/learning-paths/${encodeURIComponent(id)}/transition/`, { status }),

    studioModules: studioModules.list,
    createStudioModule: studioModules.create,
    updateStudioModule: studioModules.update,
    deleteStudioModule: studioModules.remove,

    studioLessons: studioLessons.list,
    createStudioLesson: studioLessons.create,
    updateStudioLesson: studioLessons.update,
    deleteStudioLesson: studioLessons.remove,

    studioAssessments: studioAssessments.list,
    createStudioAssessment: studioAssessments.create,
    updateStudioAssessment: studioAssessments.update,
    deleteStudioAssessment: studioAssessments.remove
  };

  window.CrohnozAcademyCore = Object.freeze(api);
})();