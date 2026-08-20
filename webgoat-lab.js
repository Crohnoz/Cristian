(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.();
  if (!session) return;
  const user = session.user || {};
  const name = user.display_name || user.username || 'Usuario Academy';
  const initials = name.trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'CA';
  document.getElementById('labUser').textContent = name;
  document.getElementById('labInitials').textContent = initials;

  const previewCover = document.getElementById('previewCover');
  const runtimeStatus = document.getElementById('runtimeStatus');
  const start = document.getElementById('startPreview');
  start.addEventListener('click', () => {
    start.disabled = true;
    start.textContent = 'Preparando entorno…';
    runtimeStatus.textContent = 'PREPARING PREVIEW';
    setTimeout(() => {
      previewCover.classList.add('hide');
      runtimeStatus.textContent = 'PREVIEW SESSION ACTIVE';
      start.textContent = '✓ Preview preparado';
    }, 550);
  });

  const lessons = {
    intro:{kicker:'LESSON 01 · INTRODUCTION',title:'Understand the learning boundary',heading:'Why vulnerable apps belong in a sandbox',copy:'WebGoat is intentionally insecure. In Academy, every exercise is scoped to a temporary instance, uses synthetic identities and stays behind an authenticated gateway.',note:'Describe the trust boundary before interacting with the exercise.'},
    access:{kicker:'LESSON 02 · ACCESS CONTROL',title:'Reason about authorization',heading:'Who should access which object?',copy:'Model the resource, actor and server-side authorization decision. Focus on the control that should exist rather than on bypassing real systems.',note:'Write the expected authorization rule before evaluating behavior.'},
    auth:{kicker:'LESSON 03 · AUTHENTICATION',title:'Separate identity from permission',heading:'Authentication is not authorization',copy:'Use the controlled lesson to distinguish proving identity from deciding what that identity may do. Keep credentials synthetic and session-scoped.',note:'Explain which part proves identity and which part enforces access.'},
    input:{kicker:'LESSON 04 · INPUT & OUTPUT',title:'Understand unsafe data flow',heading:'Trace data from input to output',copy:'Follow user-controlled data through a synthetic application and identify where context-aware handling should prevent it from becoming executable content.',note:'Describe the source, sink and defensive control in plain language.'},
    client:{kicker:'LESSON 05 · CLIENT SIDE',title:'Question browser trust',heading:'The client is not a security boundary',copy:'Compare what the browser can validate for usability with the controls the server must still enforce for security.',note:'List one client-side check and its server-side equivalent.'}
  };
  document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-lesson]').forEach(item => item.classList.toggle('active', item === button));
    const lesson = lessons[button.dataset.lesson] || lessons.intro;
    document.getElementById('lessonKicker').textContent = lesson.kicker;
    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonHeading').textContent = lesson.heading;
    document.getElementById('lessonCopy').textContent = lesson.copy;
    document.getElementById('lessonNote').textContent = lesson.note;
  }));

  const boxes = [...document.querySelectorAll('[data-objective]')];
  const missionCount = document.getElementById('missionCount');
  const missionBar = document.getElementById('missionBar');
  const render = () => {
    const done = boxes.filter(box => box.checked).length;
    missionCount.textContent = `${done} / ${boxes.length}`;
    missionBar.style.width = `${Math.round(done / boxes.length * 100)}%`;
  };
  boxes.forEach(box => box.addEventListener('change', render));
  document.getElementById('lessonAction').addEventListener('click', () => {
    const first = boxes.find(box => !box.checked);
    if (first) first.checked = true;
    render();
  });
  document.getElementById('finishPreview').addEventListener('click', () => {
    const done = boxes.filter(box => box.checked).length;
    const feedback = document.getElementById('labFeedback');
    feedback.textContent = done === boxes.length
      ? 'Evidencia demo registrada localmente · guided lab completado.'
      : `Completa los ${boxes.length - done} objetivos pendientes antes de cerrar la misión.`;
  });
  render();
})();