(() => {
  const auth = window.CCAAuth;
  const session = auth.requireAuth();
  if (!session) return;

  const user = session.user || {};
  const initials = String(user.display_name || user.username || 'CA').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase();
  document.getElementById('accountAvatar').textContent = initials || 'CA';
  document.getElementById('accountName').textContent = user.display_name || user.username || 'Cuenta Academy';
  document.getElementById('accountMeta').textContent = `${user.role || 'learner'} · ${session.provider}`;
  document.getElementById('displayName').value = user.display_name || '';
  document.getElementById('accountEmail').value = user.email || '';
  document.getElementById('locale').value = user.locale === 'en' ? 'en' : 'es';
  document.getElementById('providerValue').textContent = session.provider === 'crohnoz-academy' ? 'Academy Core' : 'Preview Demo';
  document.getElementById('roleValue').textContent = user.role || 'learner';
  document.getElementById('issuedAt').textContent = session.issuedAt ? new Date(session.issuedAt).toLocaleString('es-CL') : '—';
  document.getElementById('sessionDetail').textContent = session.provider === 'crohnoz-academy'
    ? 'Sesión autenticada por Crohnoz Academy Core. El token vive en sessionStorage y se invalida al cerrar sesión.'
    : 'Preview local con identidad sintética. No representa una credencial productiva.';

  document.getElementById('profileForm').addEventListener('submit', async event => {
    event.preventDefault();
    const feedback = document.getElementById('profileFeedback');
    const button = event.currentTarget.querySelector('button[type="submit"]');
    feedback.className = 'feedback'; feedback.textContent = '';
    button.disabled = true;
    try {
      const result = await auth.updateProfile({
        display_name: document.getElementById('displayName').value.trim(),
        locale: document.getElementById('locale').value
      });
      document.getElementById('accountName').textContent = result.user.display_name;
      feedback.className = 'feedback good'; feedback.textContent = 'Perfil actualizado.';
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
      event.currentTarget.reset();
      feedback.className = 'feedback good'; feedback.textContent = 'Contraseña actualizada. Vuelve a iniciar sesión si el backend lo requiere.';
    } catch (error) {
      feedback.textContent = error.code === 'DEMO_PASSWORD_CHANGE_DISABLED'
        ? 'Preview: el cambio real se habilita al conectar Academy Core. No almacenamos una contraseña demo nueva en el navegador.'
        : error.code === 'WEAK_PASSWORD' ? 'La contraseña no cumple el mínimo requerido.' : 'No pudimos cambiar la contraseña.';
    } finally { button.disabled = false; }
  });

  document.getElementById('logoutButton').addEventListener('click', async () => {
    await auth.logout();
    location.replace('./auth.html');
  });
})();
