const STORAGE_KEY = 'cristian-cyber-academy:v2';

function loadLearner() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function safeText(value, maxLength = 160) {
  return String(value ?? '').slice(0, maxLength);
}

function learnerReadiness(state) {
  const skills = state.skills || { phishing: 91, web: 78, osint: 67, api: 48 };
  const values = Object.values(skills).map(Number).filter(Number.isFinite);
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function renderLearnerSignal() {
  const state = loadLearner();
  const readiness = learnerReadiness(state);
  const completedLabs = Number(state.stats?.completedLabs ?? 18);
  const xp = Number(state.learner?.xp ?? 3420);
  const name = safeText(state.learner?.name || 'Alumno Demo', 80);
  const skills = state.skills || { phishing: 91, web: 78, osint: 67, api: 48 };

  const host = document.querySelector('#students .student-grid');
  if (host && !document.getElementById('liveDemoStudent')) {
    const card = document.createElement('article');
    card.className = 'student-card';
    card.id = 'liveDemoStudent';

    const avatar = document.createElement('div');
    avatar.className = 'student-avatar';
    avatar.textContent = 'AD';

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${name} · LIVE`;
    const readinessLine = document.createElement('span');
    readinessLine.textContent = `Readiness · ${readiness}`;
    const detail = document.createElement('small');
    detail.textContent = `${completedLabs} labs · ${xp.toLocaleString('es-CL')} XP · API Security ${Number(skills.api ?? 0)}`;
    copy.append(title, readinessLine, detail);

    const inspect = document.createElement('button');
    inspect.id = 'inspectLearner';
    inspect.type = 'button';
    inspect.textContent = 'Ver señal';

    card.append(avatar, copy, inspect);
    host.prepend(card);
  }

  document.getElementById('inspectLearner')?.addEventListener('click', () => {
    const events = Array.isArray(state.events) ? state.events.slice(0, 6) : [];
    const summary = events.length
      ? events.map(event => {
          const time = new Date(event.at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
          return `${time} · ${safeText(event.type, 60)}`;
        }).join('\n')
      : 'Aún no hay actividad nueva registrada en esta sesión.';
    alert(`Actividad reciente de ${name}\n\n${summary}`);
  });

  const recommendation = document.querySelector('.recommendation strong');
  if (recommendation) {
    const entries = Object.entries(skills).filter(([, value]) => Number.isFinite(Number(value)));
    const weakest = entries.sort((a, b) => Number(a[1]) - Number(b[1]))[0];
    const names = {
      api: 'API Security · Authorization',
      osint: 'OSINT · Verification',
      web: 'Web Security · Output Encoding',
      phishing: 'Phishing · Social Engineering'
    };
    recommendation.textContent = weakest ? (names[weakest[0]] || 'Security Foundations') : 'Security Foundations';
  }
}

function bindAssignments() {
  document.querySelectorAll('button').forEach(button => {
    if (!/asignar/i.test(button.textContent)) return;
    button.addEventListener('click', () => {
      const state = loadLearner();
      state.assignments = Array.isArray(state.assignments) ? state.assignments : [];
      const assignment = {
        id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
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

function appendCell(row, tagName, value, className = '') {
  const cell = document.createElement(tagName);
  if (className) cell.className = className;
  cell.textContent = safeText(value);
  row.appendChild(cell);
}

function renderActivity() {
  const section = document.createElement('section');
  section.className = 'instructor-section';
  section.id = 'activity';

  const state = loadLearner();
  const events = Array.isArray(state.events) ? state.events.slice(0, 8) : [];

  const heading = document.createElement('div');
  heading.className = 'section-heading';
  const headingCopy = document.createElement('div');
  const eyebrow = document.createElement('span');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'AUDIT TRAIL';
  const title = document.createElement('h2');
  title.textContent = 'Actividad de aprendizaje';
  const description = document.createElement('p');
  description.textContent = 'Eventos locales de la demo para mostrar trazabilidad pedagógica.';
  headingCopy.append(eyebrow, title, description);
  const count = document.createElement('span');
  count.className = 'pill';
  count.textContent = `${events.length} eventos`;
  heading.append(headingCopy, count);

  const table = document.createElement('div');
  table.className = 'table-card';
  const tableHead = document.createElement('div');
  tableHead.className = 'table-row table-head';
  ['Hora', 'Evento', 'Detalle', 'Origen', 'Estado'].forEach(label => appendCell(tableHead, 'span', label));
  table.appendChild(tableHead);

  if (!events.length) {
    const row = document.createElement('div');
    row.className = 'table-row';
    appendCell(row, 'strong', 'Sin eventos');
    appendCell(row, 'span', 'Completa una actividad en vista alumno');
    appendCell(row, 'span', '—');
    appendCell(row, 'span', 'Demo');
    appendCell(row, 'span', 'Esperando');
    table.appendChild(row);
  } else {
    events.forEach(event => {
      const row = document.createElement('div');
      row.className = 'table-row';
      let timestamp = 'Fecha inválida';
      try { timestamp = new Date(event.at).toLocaleString('es-CL'); } catch { /* keep fallback */ }
      const details = event.detail && typeof event.detail === 'object'
        ? Object.values(event.detail).map(value => safeText(value, 80)).join(' · ')
        : '—';
      appendCell(row, 'strong', timestamp);
      appendCell(row, 'span', event.type || 'event');
      appendCell(row, 'span', details || '—');
      appendCell(row, 'span', 'Alumno Demo');
      appendCell(row, 'span', 'Registrado', 'status-good');
      table.appendChild(row);
    });
  }

  section.append(heading, table);
  document.querySelector('.instructor-main')?.appendChild(section);

  const nav = document.querySelector('.nav');
  const studentLink = nav ? [...nav.querySelectorAll('a')].find(a => a.getAttribute('href') === '#students') : null;
  if (studentLink && !nav.querySelector('a[href="#activity"]')) {
    const activityLink = document.createElement('a');
    activityLink.className = 'nav-item';
    activityLink.href = '#activity';
    activityLink.textContent = 'Actividad';
    studentLink.insertAdjacentElement('afterend', activityLink);
  }
}

window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY) location.reload();
});

renderLearnerSignal();
bindAssignments();
renderActivity();
