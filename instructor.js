const STORAGE_KEY = 'cristian-cyber-academy:v2';

function loadLearner() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function learnerReadiness(state) {
  const skills = state.skills || { phishing: 91, web: 78, osint: 67, api: 48 };
  const values = Object.values(skills);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function renderLearnerSignal() {
  const state = loadLearner();
  const readiness = learnerReadiness(state);
  const completedLabs = state.stats?.completedLabs ?? 18;
  const xp = state.learner?.xp ?? 3420;
  const name = state.learner?.name ?? 'Alumno Demo';
  const skills = state.skills || { phishing: 91, web: 78, osint: 67, api: 48 };

  const host = document.querySelector('#students .student-grid');
  if (host && !document.getElementById('liveDemoStudent')) {
    host.insertAdjacentHTML('afterbegin', `
      <article class="student-card" id="liveDemoStudent">
        <div class="student-avatar">AD</div>
        <div><strong>${name} · LIVE</strong><span>Readiness · ${readiness}</span><small>${completedLabs} labs · ${xp.toLocaleString('es-CL')} XP · API Security ${skills.api}</small></div>
        <button id="inspectLearner">Ver señal</button>
      </article>`);
  }

  document.getElementById('inspectLearner')?.addEventListener('click', () => {
    const events = (state.events || []).slice(0, 6);
    const summary = events.length
      ? events.map(e => `${new Date(e.at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} · ${e.type}`).join('\n')
      : 'Aún no hay actividad nueva registrada en esta sesión.';
    alert(`Actividad reciente de ${name}\n\n${summary}`);
  });

  const recommendation = document.querySelector('.recommendation strong');
  if (recommendation) {
    const weakest = Object.entries(skills).sort((a, b) => a[1] - b[1])[0];
    const names = { api: 'API Security · Authorization', osint: 'OSINT · Verification', web: 'Web Security · Output Encoding', phishing: 'Phishing · Social Engineering' };
    recommendation.textContent = names[weakest[0]];
  }
}

function bindAssignments() {
  document.querySelectorAll('button').forEach(button => {
    if (!/asignar/i.test(button.textContent)) return;
    button.addEventListener('click', () => {
      const state = loadLearner();
      state.assignments = state.assignments || [];
      const assignment = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        module: 'API Security · Authorization',
        cohort: 'AppSec Foundations',
        assignedAt: new Date().toISOString()
      };
      state.assignments.unshift(assignment);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      button.textContent = '✓ Asignado';
      button.disabled = true;
    }, { once: true });
  });
}

function renderActivity() {
  const section = document.createElement('section');
  section.className = 'instructor-section';
  section.id = 'activity';
  const state = loadLearner();
  const events = (state.events || []).slice(0, 8);
  section.innerHTML = `
    <div class="section-heading"><div><span class="eyebrow">AUDIT TRAIL</span><h2>Actividad de aprendizaje</h2><p>Eventos locales de la demo para mostrar trazabilidad pedagógica.</p></div><span class="pill">${events.length} eventos</span></div>
    <div class="table-card">
      <div class="table-row table-head"><span>Hora</span><span>Evento</span><span>Detalle</span><span>Origen</span><span>Estado</span></div>
      ${events.length ? events.map(e => `<div class="table-row"><strong>${new Date(e.at).toLocaleString('es-CL')}</strong><span>${e.type}</span><span>${Object.values(e.detail || {}).join(' · ') || '—'}</span><span>Alumno Demo</span><span class="status-good">Registrado</span></div>`).join('') : '<div class="table-row"><strong>Sin eventos</strong><span>Completa una actividad en vista alumno</span><span>—</span><span>Demo</span><span>Esperando</span></div>'}
    </div>`;
  document.querySelector('.instructor-main')?.appendChild(section);

  const nav = document.querySelector('.nav');
  const studentLink = [...nav.querySelectorAll('a')].find(a => a.getAttribute('href') === '#students');
  if (studentLink) studentLink.insertAdjacentHTML('afterend', '<a class="nav-item" href="#activity">Actividad</a>');
}

window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY) location.reload();
});

renderLearnerSignal();
bindAssignments();
renderActivity();
