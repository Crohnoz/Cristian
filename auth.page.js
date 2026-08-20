(() => {
  const auth = window.CCAAuth;
  const core = window.CrohnozAcademyCore;
  const loginForm = document.getElementById('loginForm');
  const resetForm = document.getElementById('resetForm');
  const loginTab = document.getElementById('loginTab');
  const resetTab = document.getElementById('resetTab');
  const loginFeedback = document.getElementById('loginFeedback');
  const resetFeedback = document.getElementById('resetFeedback');
  const demoBox = document.getElementById('demoBox');

  function safeNext(raw) {
    const allowed = new Set(['/', '/index.html', '/instructor.html', '/certificate.html', '/account.html']);
    try {
      const url = new URL(raw || '/index.html', location.origin);
      if (url.origin !== location.origin || !allowed.has(url.pathname)) return '/index.html';
      return `${url.pathname}${url.search}${url.hash}`;
    } catch { return '/index.html'; }
  }

  const next = safeNext(new URLSearchParams(location.search).get('next'));

  function setMode(mode) {
    const login = mode === 'login';
    loginForm.classList.toggle('hidden', !login);
    resetForm.classList.toggle('hidden', login);
    document.getElementById('authTitle').textContent = login ? 'Ingresar al campus' : 'Recuperar acceso';
    document.getElementById('authSubtitle').textContent = login
      ? 'Usa tu cuenta de Cristian Cyber Academy.'
      : 'Te enviaremos instrucciones si el correo pertenece a una cuenta activa.';
    demoBox.classList.toggle('hidden', !login || Boolean(core?.enabled));
  }

  loginTab.addEventListener('click', () => setMode('login'));
  resetTab.addEventListener('click', () => setMode('reset'));
  document.getElementById('showPassword').addEventListener('change', event => {
    document.getElementById('password').type = event.target.checked ? 'text' : 'password';
  });

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginFeedback.className = 'feedback';
    loginFeedback.textContent = '';
    const button = loginForm.querySelector('button[type="submit"]');
    const form = new FormData(loginForm);
    button.disabled = true;
    button.textContent = 'Verificando identidad…';
    try {
      const session = await auth.login(form.get('username'), form.get('password'));
      loginFeedback.className = 'feedback good';
      loginFeedback.textContent = `Acceso concedido · ${session.user.display_name || session.user.username}`;
      let destination = next;
      if (next === '/instructor.html' && session.user.role !== 'instructor') destination = '/index.html';
      if ((next === '/index.html' || next === '/') && session.user.role === 'instructor') destination = '/instructor.html';
      location.replace(destination);
    } catch (error) {
      loginFeedback.textContent = error.code === 'NETWORK_ERROR'
        ? 'El servicio académico no está disponible en este momento.'
        : 'Usuario o contraseña incorrectos.';
    } finally {
      button.disabled = false;
      button.textContent = 'Entrar a Mission Control →';
    }
  });

  resetForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = resetForm.querySelector('button[type="submit"]');
    button.disabled = true;
    resetFeedback.className = 'feedback';
    resetFeedback.textContent = '';
    try {
      await auth.requestPasswordReset(new FormData(resetForm).get('email'));
      resetFeedback.className = 'feedback good';
      resetFeedback.textContent = core?.enabled
        ? 'Si existe una cuenta asociada, recibirás instrucciones de recuperación.'
        : 'Preview: flujo de recuperación validado; el envío real se activa con Academy Core.';
    } catch {
      resetFeedback.className = 'feedback good';
      resetFeedback.textContent = 'Si existe una cuenta asociada, recibirás instrucciones de recuperación.';
    } finally {
      button.disabled = false;
    }
  });

  document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
    const instructor = button.dataset.demo === 'instructor';
    document.getElementById('username').value = instructor ? 'cristian.demo' : 'alumno.demo';
    document.getElementById('password').value = instructor ? 'InstructorDemo2026!' : 'CyberDemo2026!';
    document.getElementById('password').focus();
  }));

  const existing = auth.current();
  if (existing?.authenticated) {
    const destination = next === '/instructor.html' && existing.user?.role !== 'instructor' ? '/index.html' : next;
    location.replace(destination);
    return;
  }
  setMode('login');
})();
