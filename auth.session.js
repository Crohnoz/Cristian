(() => {
  const SESSION_KEY = 'cca:auth-session:v1';
  const PREVIEW_ACCOUNTS_KEY = 'cca:preview-accounts:v1';
  const DEMO_ACCOUNTS = Object.freeze({
    'alumno.demo': {
      password: 'CyberDemo2026!',
      user: { id: 'demo-learner', username: 'alumno.demo', email: 'alumno@demo.example', display_name: 'Alumno Demo', role: 'learner', locale: 'es', tenant: 'cristian-demo' }
    },
    'cristian.demo': {
      password: 'InstructorDemo2026!',
      user: { id: 'demo-coordinator', username: 'cristian.demo', email: 'cristian@demo.example', display_name: 'Cristian', role: 'coordinator', locale: 'es', tenant: 'cristian-demo' }
    }
  });

  const PERMISSIONS = Object.freeze({
    learner: Object.freeze(['learn', 'account']),
    instructor: Object.freeze(['learn', 'teach', 'account']),
    author: Object.freeze(['learn', 'content', 'account']),
    reviewer: Object.freeze(['learn', 'content-review', 'account']),
    coordinator: Object.freeze(['learn', 'teach', 'manage_users', 'manage_cohorts', 'content', 'reports', 'account']),
    admin: Object.freeze(['learn', 'teach', 'manage_users', 'manage_cohorts', 'content', 'reports', 'admin', 'account'])
  });

  const core = () => window.CrohnozAcademyCore;
  const encoder = new TextEncoder();

  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }

  function writeSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('cca:session-changed', { detail: session }));
    return session;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('cca:session-changed', { detail: null }));
  }

  function readPreviewAccounts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PREVIEW_ACCOUNTS_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  }

  function writePreviewAccounts(accounts) {
    localStorage.setItem(PREVIEW_ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach(value => { binary += String.fromCharCode(value); });
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  }

  async function derivePassword(password, saltBytes) {
    if (!globalThis.crypto?.subtle) throw new Error('WEB_CRYPTO_UNAVAILABLE');
    const material = await crypto.subtle.importKey('raw', encoder.encode(String(password)), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt:saltBytes, iterations:120000, hash:'SHA-256' }, material, 256);
    return bytesToBase64(new Uint8Array(bits));
  }

  async function createPasswordRecord(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return { salt:bytesToBase64(salt), hash:await derivePassword(password, salt), algorithm:'PBKDF2-SHA256', iterations:120000 };
  }

  async function verifyPassword(password, record) {
    if (!record?.salt || !record?.hash) return false;
    const candidate = await derivePassword(password, base64ToBytes(record.salt));
    return candidate === record.hash;
  }

  function permissionsFor(role) {
    return PERMISSIONS[String(role || '').toLowerCase()] || Object.freeze([]);
  }

  function can(permission, session = readSession()) {
    return Boolean(session?.authenticated && permissionsFor(session.user?.role).includes(permission));
  }

  async function login(username, password) {
    const normalized = String(username || '').trim();
    if (core()?.enabled) {
      await core().login(normalized, String(password || ''));
      const profile = await core().me();
      return writeSession({ provider: 'crohnoz-academy', authenticated: true, user: profile, issuedAt: new Date().toISOString() });
    }

    const fixed = DEMO_ACCOUNTS[normalized];
    if (fixed && fixed.password === String(password || '')) {
      return writeSession({ provider: 'demo', authenticated: true, user: fixed.user, issuedAt: new Date().toISOString() });
    }

    const preview = readPreviewAccounts()[normalized];
    if (preview && await verifyPassword(String(password || ''), preview.password_record)) {
      return writeSession({ provider:'demo', authenticated:true, user:preview.user, issuedAt:new Date().toISOString() });
    }

    const error = new Error('INVALID_CREDENTIALS');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  async function registerPreviewAccount({ username, password, email, display_name, role = 'learner', locale = 'es' }) {
    if (core()?.enabled) throw new Error('PREVIEW_REGISTRATION_DISABLED');
    const normalized = String(username || '').trim();
    if (!/^[a-zA-Z0-9._-]{3,64}$/.test(normalized)) {
      const error = new Error('INVALID_USERNAME'); error.code = 'INVALID_USERNAME'; throw error;
    }
    if (String(password || '').length < 12) {
      const error = new Error('WEAK_PASSWORD'); error.code = 'WEAK_PASSWORD'; throw error;
    }
    const accounts = readPreviewAccounts();
    if (DEMO_ACCOUNTS[normalized] || accounts[normalized]) {
      const error = new Error('USERNAME_TAKEN'); error.code = 'USERNAME_TAKEN'; throw error;
    }
    const identity = {
      id:`preview-${crypto.randomUUID?.() || Date.now()}`,
      username:normalized,
      email:String(email || '').trim().toLowerCase(),
      display_name:String(display_name || normalized).trim().slice(0,120),
      role:String(role || 'learner'),
      locale:locale === 'en' ? 'en' : 'es',
      tenant:'cristian-demo'
    };
    accounts[normalized] = { user:identity, password_record:await createPasswordRecord(password), created_at:new Date().toISOString() };
    writePreviewAccounts(accounts);
    return identity;
  }

  async function logout() {
    try { if (core()?.enabled && core().isAuthenticated()) await core().logout(); }
    finally { clearSession(); }
  }

  async function refresh() {
    const session = readSession();
    if (!session?.authenticated) return null;
    if (session.provider === 'crohnoz-academy' && core()?.enabled) {
      try {
        const profile = await core().me();
        return writeSession({ ...session, user: profile, refreshedAt: new Date().toISOString() });
      } catch {
        clearSession();
        return null;
      }
    }
    return session;
  }

  function requireAuth({ roles = [], permission = '', unauthorized = './index.html' } = {}) {
    const session = readSession();
    if (!session?.authenticated) {
      const next = encodeURIComponent(location.pathname + location.search + location.hash);
      location.replace(`./auth.html?next=${next}`);
      return null;
    }

    const roleAllowed = !roles.length || roles.includes(session.user?.role);
    const permissionAllowed = !permission || can(permission, session);
    if (!roleAllowed || !permissionAllowed) {
      location.replace(unauthorized);
      return null;
    }
    return session;
  }

  async function updateProfile(data) {
    const session = readSession();
    if (!session?.authenticated) throw new Error('NOT_AUTHENTICATED');
    if (session.provider === 'crohnoz-academy' && core()?.enabled) {
      const profile = await core().updateMe(data);
      return writeSession({ ...session, user: profile });
    }
    const allowed = ['display_name', 'locale'];
    const user = { ...session.user };
    allowed.forEach(key => { if (data[key] !== undefined) user[key] = String(data[key]).slice(0, 120); });
    const accounts = readPreviewAccounts();
    if (accounts[user.username]) {
      accounts[user.username].user = user;
      writePreviewAccounts(accounts);
    }
    return writeSession({ ...session, user });
  }

  async function changePassword({ current_password, new_password }) {
    const session = readSession();
    if (!session?.authenticated) throw new Error('NOT_AUTHENTICATED');
    if (String(new_password || '').length < 12) {
      const error = new Error('WEAK_PASSWORD'); error.code = 'WEAK_PASSWORD'; throw error;
    }
    if (session.provider === 'crohnoz-academy' && core()?.enabled) {
      return core().changePassword({ old_password: current_password, new_password });
    }
    const accounts = readPreviewAccounts();
    const preview = accounts[session.user?.username];
    if (!preview) {
      const error = new Error('DEMO_PASSWORD_CHANGE_DISABLED'); error.code = 'DEMO_PASSWORD_CHANGE_DISABLED'; throw error;
    }
    if (!await verifyPassword(String(current_password || ''), preview.password_record)) {
      const error = new Error('INVALID_CURRENT_PASSWORD'); error.code = 'INVALID_CURRENT_PASSWORD'; throw error;
    }
    preview.password_record = await createPasswordRecord(new_password);
    preview.password_changed_at = new Date().toISOString();
    writePreviewAccounts(accounts);
    clearSession();
    return { changed:true, requires_reauthentication:true };
  }

  async function requestPasswordReset(email) {
    const value = String(email || '').trim();
    if (core()?.enabled) return core().requestPasswordReset(value);
    return { accepted: true, demo: true };
  }

  window.CCAAuth = Object.freeze({
    login, logout, refresh, requireAuth, updateProfile, changePassword, requestPasswordReset, registerPreviewAccount,
    current: readSession,
    can,
    permissionsFor,
    roles: PERMISSIONS,
    demoAccounts: Object.freeze({ learner: 'alumno.demo', coordinator: 'cristian.demo', instructor: 'cristian.demo' })
  });
})();