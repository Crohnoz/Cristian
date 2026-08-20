(() => {
  const core = window.CrohnozAcademyCore;
  const auth = window.CCAAuth;
  const DEMO_KEY = 'cca:user-admin-demo:v1';
  const params = new URLSearchParams(location.search);
  const remoteToken = params.get('token') || '';
  const demoId = params.get('demo') || '';
  const form = document.getElementById('activationForm');
  const context = document.getElementById('activationContext');
  const feedback = document.getElementById('activationFeedback');
  const invalid = document.getElementById('invalidInvite');
  const button = document.getElementById('activateButton');
  let invitation = null;

  function loadDemoState() {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); }
    catch { return null; }
  }
  function saveDemoState(state) { localStorage.setItem(DEMO_KEY, JSON.stringify(state)); }
  function usable(invite) {
    if (!invite || invite.accepted_at || invite.revoked_at || invite.is_usable === false) return false;
    const expiry = new Date(invite.expires_at || 0).getTime();
    return !expiry || expiry > Date.now();
  }
  function routeFor(role) {
    if (['instructor','coordinator','admin'].includes(role)) return './instructor.html';
    return './index.html';
  }
  function showInvalid() {
    form.classList.add('hidden');
    invalid.classList.remove('hidden');
    context.textContent = 'No pudimos validar esta invitación.';
  }

  if (core?.enabled && remoteToken) {
    invitation = { remote:true, token:remoteToken };
    context.textContent = 'Invitación protegida por Crohnoz Academy Core. Completa tus datos para activar la cuenta.';
  } else if (!core?.enabled && demoId) {
    const state = loadDemoState();
    invitation = state?.invitations?.find(item => String(item.id) === demoId) || null;
    if (!usable(invitation)) showInvalid();
    else context.textContent = `${invitation.email} · rol ${invitation.role} · preview sintética`;
  } else showInvalid();

  document.getElementById('showActivationPassword')?.addEventListener('change', event => {
    const type = event.target.checked ? 'text' : 'password';
    document.getElementById('activationPassword').type = type;
    document.getElementById('activationConfirm').type = type;
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!invitation) return;
    const data = new FormData(form);
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');
    const confirm = document.getElementById('activationConfirm').value;
    const firstName = String(data.get('first_name') || '').trim();
    const lastName = String(data.get('last_name') || '').trim();
    feedback.className = 'feedback'; feedback.textContent = '';
    if (password !== confirm) { feedback.textContent = 'Las contraseñas no coinciden.'; return; }
    if (password.length < 12) { feedback.textContent = 'Usa una contraseña de al menos 12 caracteres.'; return; }
    button.disabled = true; button.textContent = 'Activando identidad…';

    try {
      let role = 'learner';
      if (core?.enabled && invitation.remote) {
        const result = await core.activateInvitation({ token:invitation.token, username, password, first_name:firstName, last_name:lastName });
        role = result.role || 'learner';
      } else {
        const state = loadDemoState();
        const invite = state?.invitations?.find(item => String(item.id) === String(invitation.id));
        if (!usable(invite)) throw new Error('INVITATION_NOT_USABLE');
        role = invite.role || 'learner';
        const displayName = `${firstName} ${lastName}`.trim() || username;
        const identity = await auth.registerPreviewAccount({ username, password, email:invite.email, display_name:displayName, role, locale:invite.locale || 'es' });
        const nextUserId = Math.max(0, ...(state.profiles || []).map(profile => Number(profile.user_id) || 0)) + 1;
        state.profiles.push({ id:`p-${crypto.randomUUID?.() || Date.now()}`, user_id:nextUserId, username:identity.username, email:identity.email, display_name:identity.display_name, role:identity.role, locale:identity.locale, onboarding_completed:false });
        invite.accepted_at = new Date().toISOString(); invite.is_usable = false;
        const requested = invite.metadata?.requested_cohort;
        if (requested && role === 'learner') state.memberships.push({ id:`m-${crypto.randomUUID?.() || Date.now()}`, cohort:requested, user:nextUserId, status:'active' });
        state.audit.unshift({ id:`a-${crypto.randomUUID?.() || Date.now()}`, created_at:new Date().toISOString(), action:'access.invitation.accepted', actor:{username}, metadata:{role, preview:true} });
        saveDemoState(state);
      }

      const session = await auth.login(username, password);
      feedback.className = 'feedback good'; feedback.textContent = 'Cuenta activada. Abriendo tu academia…';
      location.replace(routeFor(session.user?.role || role));
    } catch (error) {
      const messages = {
        USERNAME_TAKEN:'Ese nombre de usuario ya está en uso.', INVALID_USERNAME:'El usuario solo puede usar letras, números, punto, guion y guion bajo.', WEAK_PASSWORD:'La contraseña no cumple la política requerida.', INVITATION_NOT_USABLE:'La invitación expiró o ya fue utilizada.'
      };
      feedback.textContent = messages[error.code || error.message] || error.payload?.token?.[0] || error.payload?.password?.[0] || 'No pudimos activar la cuenta. Revisa los datos o solicita una nueva invitación.';
    } finally { button.disabled=false; button.textContent='Activar mi cuenta →'; }
  });
})();