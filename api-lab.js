(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.();
  if (!session) return;

  const displayName = session.user?.display_name || session.user?.username || 'Alumno Demo';
  const initials = displayName.trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'AD';
  document.getElementById('labUser').textContent = displayName;
  document.getElementById('labInitials').textContent = initials;

  const button = document.getElementById('startPreview');
  const state = document.getElementById('runtimeState');
  const status = document.getElementById('runtimeStatus');
  const cover = document.getElementById('previewCover');
  const feedback = document.getElementById('labFeedback');
  let ready = false;

  button.addEventListener('click', () => {
    if (ready) {
      cover.classList.toggle('hidden');
      button.textContent = cover.classList.contains('hidden') ? '◼ Ocultar API lab' : '▶ Mostrar API lab';
      return;
    }
    button.disabled = true;
    button.textContent = 'Provisionando preview…';
    state.textContent = 'Provisioning';
    status.textContent = 'PREPARING API SESSION';
    setTimeout(() => {
      ready = true;
      button.disabled = false;
      button.textContent = '◼ Ocultar API lab';
      state.textContent = 'Ready · preview';
      status.textContent = 'ISOLATED API PREVIEW READY';
      cover.classList.add('hidden');
      feedback.textContent = 'Preview Swagger preparado. El runtime VAmPI real se conectará aquí mediante una sesión efímera aislada.';
    }, 900);
  });

  const objectives = [...document.querySelectorAll('[data-objective]')];
  const count = document.getElementById('missionCount');
  const bar = document.getElementById('missionBar');
  const render = () => {
    const completed = objectives.filter(input => input.checked).length;
    count.textContent = `${completed} / ${objectives.length}`;
    bar.style.width = `${Math.round(completed / objectives.length * 100)}%`;
  };
  objectives.forEach(input => input.addEventListener('change', render));
  document.getElementById('finishPreview').addEventListener('click', () => {
    const completed = objectives.filter(input => input.checked).length;
    feedback.textContent = completed === objectives.length
      ? 'Evidencia demo registrada. En producción alimentará Skill Graph, Mi Progreso y Teacher Intranet.'
      : `Quedan ${objectives.length - completed} objetivo(s) por completar.`;
  });
  render();
})();