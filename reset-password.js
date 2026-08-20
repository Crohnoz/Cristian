(() => {
  const core = window.CrohnozAcademyCore;
  const params = new URLSearchParams(location.search);
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const form = document.getElementById('resetConfirmForm');
  const feedback = document.getElementById('resetConfirmFeedback');
  const first = document.getElementById('newPassword');
  const second = document.getElementById('confirmPassword');

  document.getElementById('showPassword').addEventListener('change', event => {
    const type = event.target.checked ? 'text' : 'password';
    first.type = type; second.type = type;
  });

  if (!uid || !token) {
    feedback.textContent = 'El enlace de recuperación está incompleto.';
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  if (!core?.enabled) {
    feedback.textContent = 'Preview: la pantalla está lista; la confirmación real se activa al conectar Academy Core.';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    feedback.className = 'feedback';
    const button = form.querySelector('button[type="submit"]');
    const new_password = first.value;
    if (new_password !== second.value) { feedback.textContent = 'Las contraseñas no coinciden.'; return; }
    if (new_password.length < 12) { feedback.textContent = 'Usa al menos 12 caracteres.'; return; }
    if (!core?.enabled) { feedback.textContent = 'Preview: Academy Core aún no está conectado a este deploy.'; return; }
    button.disabled = true;
    try {
      await core.confirmPasswordReset({ uid, token, new_password });
      feedback.className = 'feedback good';
      feedback.textContent = 'Contraseña actualizada. Ya puedes volver a ingresar.';
      form.reset();
      setTimeout(() => location.replace('./auth.html'), 900);
    } catch (error) {
      feedback.textContent = error.status === 400 ? 'El enlace expiró, ya fue usado o la contraseña no cumple la política.' : 'No pudimos completar la recuperación.';
    } finally { button.disabled = false; }
  });
})();
