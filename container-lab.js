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
  let previewReady = false;

  button.addEventListener('click', () => {
    if (previewReady) {
      cover.classList.toggle('hidden');
      button.textContent = cover.classList.contains('hidden') ? '◼ Ocultar entorno' : '▶ Mostrar entorno';
      return;
    }
    button.disabled = true;
    button.textContent = 'Provisionando preview…';
    state.textContent = 'Provisioning';
    status.textContent = 'PREPARING SESSION';
    setTimeout(() => {
      previewReady = true;
      button.disabled = false;
      button.textContent = '◼ Ocultar entorno';
      state.textContent = 'Ready · preview';
      status.textContent = 'ISOLATED PREVIEW READY';
      cover.classList.add('hidden');
      feedback.textContent = 'Preview preparado. El runtime real se conectará aquí cuando el launcher aislado esté habilitado.';
    }, 900);
  });

  const objectives = [...document.querySelectorAll('[data-objective]')];
  const count = document.getElementById('missionCount');
  const bar = document.getElementById('missionBar');
  const renderProgress = () => {
    const completed = objectives.filter(input => input.checked).length;
    count.textContent = `${completed} / ${objectives.length}`;
    bar.style.width = `${Math.round(completed / objectives.length * 100)}%`;
  };
  objectives.forEach(input => input.addEventListener('change', renderProgress));

  document.getElementById('finishPreview').addEventListener('click', () => {
    const completed = objectives.filter(input => input.checked).length;
    feedback.textContent = completed === objectives.length
      ? 'Evidencia demo registrada: misión completada. En producción este evento alimentará Mi Progreso y Teacher Intranet.'
      : `Completa los ${objectives.length - completed} objetivo(s) pendiente(s) antes de cerrar la misión.`;
  });

  renderProgress();
})();