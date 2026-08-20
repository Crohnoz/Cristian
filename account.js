(() => {
  const auth = window.CCAAuth;
  const session = auth.requireAuth();
  if (!session) return;

  const user = session.user || {};
  const remote = session.provider === 'crohnoz-academy';
  const initials = String(user.display_name || user.username || 'CA').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase();
  const displayNameInput = document.getElementById('displayName');
  document.getElementById('accountAvatar').textContent = initials || 'CA';
  document.getElementById('accountName').textContent = user.display_name || user.username || 'Cuenta Academy';
  document.getElementById('accountMeta').textContent = `${user.role || 'learner'} · ${session.provider}`;
  displayNameInput.value = user.display_name || '';
  displayNameInput.disabled = remote;
  if (remote) displayNameInput.title = 'El nombre visible es administrado por Crohnoz Academy Core.';
  document.getElementById('accountEmail').value = user.email || '';
  document.getElementById('locale').value = user.locale === 'en' ? 'en' : 'es';
  document.getElementById('providerValue').textContent = remote ? 'Academy Core' : 'Preview Demo';
  document.getElementById('roleValue').textContent = user.role || 'learner';
  document.getElementById('issuedAt').textContent = session.issuedAt ? new Date(session.issuedAt).toLocaleString('es-CL') : '—';
  document.getElementById('sessionDetail').textContent = remote
    ? 'Sesión autenticada por Crohnoz Academy Core. El token vive en sessionStorage y se invalida al cerrar sesión.'
    : 'Preview local con identidad sintética. No representa una credencial productiva.';

  document.getElementById('profileForm').addEventListener('submit', async event => {
    event.preventDefault();
    const feedback = document.getElementById('profileFeedback');
    const button = event.currentTarget.querySelector('button[type="submit"]');
    feedback.className = 'feedback'; feedback.textContent = '';
    button.disabled = true;
    try {
      const payload = { locale: document.getElementById('locale').value };
      if (!remote) payload.display_name = displayNameInput.value.trim();
      const result = await auth.updateProfile(payload);
      document.getElementById('accountName').textContent = result.user.display_name || result.user.username;
      feedback.className = 'feedback good';
      feedback.textContent = remote ? 'Preferencias de perfil actualizadas.' : 'Perfil actualizado.';
    } catch { feedback.textContent = 'No pudimos actualizar el perfil.'; }
    finally { button.disabled = false; }
  });

  document.getElementById('passwordForm').addEventListener('submit', async event => {
    event.preventDefault();
    const feedback = document.getElementById('passwordFeedback');
    const button = event.currentTarget.querySelector('button[type="submit"]');
    const current_password = document.getElementById('currentPassword').value;
    const new_password = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    feedback.className = 'feedback'; feedback.textContent = '';
    if (new_password !== confirm) { feedback.textContent = 'Las contraseñas nuevas no coinciden.'; return; }
    if (new_password.length < 12) { feedback.textContent = 'Usa una contraseña de al menos 12 caracteres.'; return; }
    button.disabled = true;
    try {
      await auth.changePassword({ current_password, new_password });
      await auth.logout();
      location.replace('./auth.html?password=changed');
      return;
    } catch (error) {
      feedback.textContent = error.code === 'DEMO_PASSWORD_CHANGE_DISABLED'
        ? 'Las dos cuentas sintéticas base mantienen credenciales fijas. Las cuentas creadas por invitación sí permiten cambio de contraseña.'
        : error.code === 'INVALID_CURRENT_PASSWORD' ? 'La contraseña actual no es correcta.'
        : error.code === 'WEAK_PASSWORD' ? 'La contraseña no cumple el mínimo requerido.' : 'No pudimos cambiar la contraseña.';
    } finally { button.disabled = false; }
  });

  document.getElementById('logoutButton').addEventListener('click', async () => {
    await auth.logout();
    location.replace('./auth.html');
  });
})();