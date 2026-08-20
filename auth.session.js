(() => {
  const SESSION_KEY = 'cca:auth-session:v1';
  const DEMO_ACCOUNTS = Object.freeze({
    'alumno.demo': {
      password: 'CyberDemo2026!',
      user: { id: 'demo-learner', username: 'alumno.demo', email: 'alumno@demo.example', display_name: 'Alumno Demo', role: 'learner', locale: 'es', tenant: 'cristian-demo' }
    },
    'cristian.demo': {
      password: 'InstructorDemo2026!',
      user: { id: 'demo-instructor', username: 'cristian.demo', email: 'cristian@demo.example', display_name: 'Cristian', role: 'instructor', locale: 'es', tenant: 'cristian-demo' }
    }
  });

  const core = () => window.CrohnozAcademyCore;

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

  async function login(username, password) {
    const normalized = String(username || '').trim();
    if (core()?.enabled) {
      await core().login(normalized, String(password || ''));
      const profile = await core().me();
      return writeSession({ provider: 'crohnoz-academy', authenticated: true, user: profile, issuedAt: new Date().toISOString() });
    }

    const account = DEMO_ACCOUNTS[normalized];
    if (!account || account.password !== String(password || '')) {
      const error = new Error('INVALID_CREDENTIALS');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }
    return writeSession({ provider: 'demo', authenticated: true, user: account.user, issuedAt: new Date().toISOString() });
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

  function requireAuth({ roles = [] } = {}) {
    const session = readSession();
    const role = session?.user?.role;
    const allowed = session?.authenticated && (!roles.length || roles.includes(role));
    if (!allowed) {
      const next = encodeURIComponent(location.pathname + location.search + location.hash);
      location.replace(`./auth.html?next=${next}`);
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
    return writeSession({ ...session, user });
  }

  async function changePassword({ current_password, new_password }) {
    const session = readSession();
    if (!session?.authenticated) throw new Error('NOT_AUTHENTICATED');
    if (String(new_password || '').length < 12) {
      const error = new Error('WEAK_PASSWORD'); error.code = 'WEAK_PASSWORD'; throw error;
    }
    if (session.provider === 'crohnoz-academy' && core()?.enabled) {
      return core().changePassword({ current_password, new_password });
    }
    const error = new Error('DEMO_PASSWORD_CHANGE_DISABLED');
    error.code = 'DEMO_PASSWORD_CHANGE_DISABLED';
    throw error;
  }

  async function requestPasswordReset(email) {
    const value = String(email || '').trim();
    if (core()?.enabled) return core().requestPasswordReset(value);
    return { accepted: true, demo: true };
  }

  window.CCAAuth = Object.freeze({
    login, logout, refresh, requireAuth, updateProfile, changePassword, requestPasswordReset,
    current: readSession,
    demoAccounts: Object.freeze({ learner: 'alumno.demo', instructor: 'cristian.demo' })
  });
})();
