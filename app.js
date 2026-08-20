const STORAGE_KEY = 'cristian-cyber-academy:v2';

const defaultState = {
  learner: { name: 'Alumno Demo', level: 8, xp: 3420, streak: 7 },
  stats: { completedLabs: 18, phishingAttempts: 0, phishingCorrect: 0, rangeAttempts: 0, rangeCorrect: 0 },
  skills: { phishing: 91, web: 78, osint: 67, api: 48 },
  completed: { phishing: {}, range: {} },
  events: [],
  assignments: [],
  certificateUnlocked: false
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      learner: { ...defaultState.learner, ...(parsed.learner || {}) },
      stats: { ...defaultState.stats, ...(parsed.stats || {}) },
      skills: { ...defaultState.skills, ...(parsed.skills || {}) },
      completed: {
        phishing: { ...(parsed.completed?.phishing || {}) },
        range: { ...(parsed.completed?.range || {}) }
      }
    };
  } catch {
    return structuredClone(defaultState);
  }
}

let state = loadState();

function saveState(type, detail = {}) {
  state.events.unshift({ type, detail, at: new Date().toISOString() });
  state.events = state.events.slice(0, 40);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderState();
}

function awardXp(amount) {
  state.learner.xp += amount;
  state.learner.level = Math.max(1, Math.floor(state.learner.xp / 500) + 2);
  state.certificateUnlocked = readinessScore() >= 75 && state.stats.phishingCorrect >= 2 && state.stats.rangeCorrect >= 1;
}

function readinessScore() {
  const values = Object.values(state.skills);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

const views = [...document.querySelectorAll('.view')];
const navItems = [...document.querySelectorAll('.nav-item')];
const pageTitle = document.getElementById('pageTitle');

const titles = {
  dashboard: 'Bienvenido al Cyber Range',
  academy: 'Tu ruta de aprendizaje',
  phishing: 'Phishing Lab',
  range: 'Cyber Range',
  mentor: 'AI Cyber Mentor'
};

function showView(id) {
  views.forEach(v => v.classList.toggle('active', v.id === id));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.view === id));
  pageTitle.textContent = titles[id] || 'Cristian Cyber Academy';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.jump)));

const messages = [
  {
    id: 1,
    from: 'Microsoft Security',
    address: 'security@micros0ft-alert.example',
    subject: 'Acción requerida: sesión expira hoy',
    preview: 'Detectamos actividad y debes validar tu cuenta...',
    body: 'Hola, detectamos una sesión inusual. Para evitar el bloqueo de tu cuenta, revisa tu acceso inmediatamente desde el botón de validación.',
    phishing: true,
    signals: ['Dominio look-alike con un cero en “micros0ft”', 'Urgencia para inducir una acción rápida', 'Remitente fuera de un dominio corporativo real']
  },
  {
    id: 2,
    from: 'Equipo de Formación',
    address: 'formacion@academy.internal.example',
    subject: 'Tu laboratorio OWASP ya está disponible',
    preview: 'El laboratorio asignado puede abrirse desde el portal...',
    body: 'Tu laboratorio OWASP está disponible dentro del portal de entrenamiento. Ingresa directamente desde tu dashboard habitual; este mensaje no contiene enlaces ni solicita credenciales.',
    phishing: false,
    signals: ['No solicita credenciales', 'Indica utilizar un canal conocido', 'No crea urgencia artificial']
  },
  {
    id: 3,
    from: 'Recursos Humanos',
    address: 'rrhh-beneficios@external-gift.example',
    subject: 'Beneficio exclusivo: tarjeta regalo',
    preview: 'Solo quedan 30 minutos para reclamar...',
    body: 'Has sido seleccionado para recibir una tarjeta regalo. Confirma tu identidad antes de 30 minutos para no perder el beneficio.',
    phishing: true,
    signals: ['Premio inesperado', 'Presión temporal', 'Dominio externo sin relación con la organización']
  },
  {
    id: 4,
    from: 'Git Platform',
    address: 'no-reply@code-training.internal.example',
    subject: 'Resumen semanal de actividad',
    preview: '3 laboratorios completados · 1 pendiente...',
    body: 'Esta semana completaste tres laboratorios y tienes uno pendiente. Puedes revisar tu progreso directamente desde el dashboard del entorno de entrenamiento.',
    phishing: false,
    signals: ['Mensaje informativo', 'No solicita información sensible', 'No contiene enlaces inesperados']
  },
  {
    id: 5,
    from: 'Mesa de Ayuda',
    address: 'support-password@reset-now.example',
    subject: 'Restablecimiento obligatorio de contraseña',
    preview: 'Tu contraseña será deshabilitada en una hora...',
    body: 'Por actualización de seguridad debes confirmar tu identidad y restablecer tu contraseña dentro de una hora.',
    phishing: true,
    signals: ['Dominio externo genérico', 'Solicitud sensible no esperada', 'Ventana de tiempo artificialmente corta']
  },
  {
    id: 6,
    from: 'Seguridad Interna',
    address: 'security-awareness@academy.internal.example',
    subject: 'Recordatorio: reporte de mensajes sospechosos',
    preview: 'Usa el botón de reporte cuando detectes señales...',
    body: 'Recuerda reportar mensajes sospechosos mediante el canal oficial. Seguridad nunca solicitará tu contraseña por correo.',
    phishing: false,
    signals: ['Refuerza el canal oficial', 'No solicita acciones sensibles', 'Contenido consistente con awareness']
  }
];

const mailList = document.getElementById('mailList');
const mailReader = document.getElementById('mailReader');

function renderMailList() {
  mailList.innerHTML = messages.map(m => {
    const done = state.completed.phishing[m.id] ? ' · ✓ evaluado' : '';
    return `<div class="mail-item" data-mail="${m.id}"><strong>${m.from}</strong><span>${m.subject}</span><small>${m.preview}${done}</small></div>`;
  }).join('');
  mailList.querySelectorAll('.mail-item').forEach(item => item.addEventListener('click', () => openMail(Number(item.dataset.mail))));
}

function openMail(id) {
  const mail = messages.find(m => m.id === id);
  document.querySelectorAll('.mail-item').forEach(i => i.classList.toggle('active', Number(i.dataset.mail) === id));
  mailReader.innerHTML = `
    <div class="mail-meta"><span class="eyebrow">MESSAGE ANALYSIS</span><h3>${mail.subject}</h3><p><strong>${mail.from}</strong><br><code>${mail.address}</code></p></div>
    <div class="mail-body"><p>${mail.body}</p></div>
    <div class="analysis-box"><span class="eyebrow">YOUR DECISION</span><h3>¿Cómo clasificarías este mensaje?</h3><div class="analysis-actions"><button class="classify" data-choice="safe">Legítimo</button><button class="classify" data-choice="phish">Phishing</button></div><div class="result" id="mailResult">Inspecciona el remitente y el contexto antes de responder.</div></div>`;

  mailReader.querySelectorAll('.classify').forEach(btn => btn.addEventListener('click', () => {
    const guessedPhish = btn.dataset.choice === 'phish';
    const ok = guessedPhish === mail.phishing;
    const result = document.getElementById('mailResult');
    state.stats.phishingAttempts += 1;
    if (ok) {
      state.stats.phishingCorrect += 1;
      if (!state.completed.phishing[id]) {
        state.completed.phishing[id] = true;
        state.skills.phishing = Math.min(100, state.skills.phishing + 1);
        awardXp(80);
      }
    }
    result.className = `result ${ok ? 'good' : 'bad'}`;
    result.innerHTML = `<strong>${ok ? 'Correcto. +80 XP si era tu primera resolución.' : 'Revisa nuevamente.'}</strong><br>${mail.signals.map(s => `• ${s}`).join('<br>')}`;
    saveState(ok ? 'phishing_correct' : 'phishing_retry', { messageId: id });
    renderMailList();
  }));
}

renderMailList();

const answers = document.querySelectorAll('.answer');
const answerFeedback = document.getElementById('answerFeedback');
answers.forEach(answer => answer.addEventListener('click', () => {
  const isCorrect = answer.classList.contains('correct');
  state.stats.rangeAttempts += 1;
  if (isCorrect) {
    state.stats.rangeCorrect += 1;
    if (!state.completed.range['lab-04-xss']) {
      state.completed.range['lab-04-xss'] = true;
      state.stats.completedLabs += 1;
      state.skills.web = Math.min(100, state.skills.web + 3);
      awardXp(180);
    }
  }
  answerFeedback.textContent = isCorrect
    ? 'Correcto. El encoding contextual evita que datos controlados por el usuario sean interpretados como markup o script. Complementa con plantillas seguras y CSP defensiva. +180 XP en la primera resolución.'
    : 'Esa medida no corrige la causa raíz. Busca una mitigación que trate de forma segura los datos justo antes de incorporarlos al contexto HTML.';
  answerFeedback.style.color = isCorrect ? 'var(--green)' : 'var(--amber)';
  saveState(isCorrect ? 'range_completed' : 'range_retry', { lab: 'lab-04-xss' });
}));

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chat = document.getElementById('chat');

function mentorReply(value) {
  const q = value.toLowerCase();
  if (q.includes('xss')) return 'Para XSS piensa en dos preguntas: ¿qué dato controla el usuario? y ¿en qué contexto se renderiza? Después elige la defensa adecuada al contexto; no dependas solo de filtros de entrada.';
  if (q.includes('phish') || q.includes('correo')) return 'En phishing prioriza identidad del remitente, dominio real, urgencia, solicitud de secretos y coherencia con el canal habitual. Una sola señal rara vez basta: busca el patrón completo.';
  if (q.includes('api') || q.includes('bola') || q.includes('autoriz')) return 'En API Security separa autenticación de autorización. El servidor debe validar que el actor puede operar sobre cada objeto solicitado; cambiar un identificador nunca debería ampliar permisos.';
  if (q.includes('osint')) return 'En OSINT la calidad depende de trazabilidad y corroboración. Etiqueta cada hallazgo por fuente, fecha y confianza, y evita convertir una coincidencia en una conclusión.';
  return 'Te doy una pista, no la respuesta completa: identifica primero el límite de confianza, el activo que quieres proteger y el control que debería existir. Luego intenta explicar cómo verificarías ese control.';
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  chat.insertAdjacentHTML('beforeend', `<div class="message user-msg"><b>Tú</b><p>${escapeHtml(value)}</p></div>`);
  chatInput.value = '';
  chat.insertAdjacentHTML('beforeend', `<div class="message mentor-msg"><b>Cristian AI · Demo</b><p>${mentorReply(value)}</p></div>`);
  chat.scrollTop = chat.scrollHeight;
  saveState('mentor_question', { topic: value.slice(0, 60) });
});

function renderState() {
  const statCards = document.querySelectorAll('.stats article');
  if (statCards[0]) statCards[0].querySelector('strong').textContent = state.stats.completedLabs;
  const accuracy = state.stats.phishingAttempts ? Math.round(state.stats.phishingCorrect / state.stats.phishingAttempts * 100) : state.skills.phishing;
  if (statCards[1]) statCards[1].querySelector('strong').textContent = `${accuracy}%`;
  if (statCards[2]) statCards[2].querySelector('strong').textContent = `${state.learner.streak} días`;
  if (statCards[3]) statCards[3].querySelector('strong').textContent = readinessScore() >= 85 ? 'A' : readinessScore() >= 75 ? 'B+' : 'B';

  const sideStrong = document.querySelector('.sidebar-card strong');
  const sideSmall = document.querySelector('.sidebar-card small');
  const progress = document.querySelector('.sidebar-card .progress i');
  const nextLevelXp = 500;
  const intoLevel = state.learner.xp % nextLevelXp;
  if (sideStrong) sideStrong.textContent = `Level ${String(state.learner.level).padStart(2, '0')}`;
  if (sideSmall) sideSmall.textContent = `${state.learner.xp.toLocaleString('es-CL')} XP · ${nextLevelXp - intoLevel} para el siguiente nivel`;
  if (progress) progress.style.width = `${Math.round(intoLevel / nextLevelXp * 100)}%`;

  const skillValues = [state.skills.phishing, state.skills.web, state.skills.osint, state.skills.api];
  document.querySelectorAll('#dashboard .skill').forEach((el, index) => {
    const value = skillValues[index];
    if (value == null) return;
    const label = el.querySelector('b');
    const bar = el.querySelector('.bar i');
    if (label) label.textContent = value;
    if (bar) bar.style.width = `${value}%`;
  });

  renderProgressPanel();
}

function renderProgressPanel() {
  let panel = document.getElementById('journeyPanel');
  if (!panel) {
    panel = document.createElement('article');
    panel.id = 'journeyPanel';
    panel.className = 'panel';
    document.querySelector('#dashboard .grid-2')?.insertAdjacentElement('afterend', panel);
  }
  const phishDone = Object.keys(state.completed.phishing).length;
  const rangeDone = Object.keys(state.completed.range).length;
  panel.style.marginTop = '12px';
  panel.innerHTML = `
    <div class="panel-head"><div><span class="eyebrow">LEARNING JOURNEY</span><h3>Progreso persistente</h3></div><span class="pill ${state.certificateUnlocked ? 'pill-green' : ''}">${state.certificateUnlocked ? 'CERTIFICATE READY' : 'IN PROGRESS'}</span></div>
    <div class="skills">
      <div class="skill"><div><span>Inbox challenge</span><b>${phishDone}/6</b></div><div class="bar"><i style="width:${Math.round(phishDone / 6 * 100)}%"></i></div></div>
      <div class="skill"><div><span>Range labs</span><b>${rangeDone}/1</b></div><div class="bar"><i style="width:${rangeDone ? 100 : 0}%"></i></div></div>
      <div class="skill"><div><span>Cyber readiness</span><b>${readinessScore()}</b></div><div class="bar"><i style="width:${readinessScore()}%"></i></div></div>
    </div>
    <div class="hero-actions"><a class="primary" style="text-decoration:none" href="./certificate.html">${state.certificateUnlocked ? 'Ver certificado' : 'Ver estado de certificación'}</a><button id="resetDemo" class="secondary">Reiniciar progreso demo</button></div>`;
  document.getElementById('resetDemo')?.addEventListener('click', () => {
    if (!confirm('¿Reiniciar únicamente el progreso local de esta demo?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(defaultState);
    renderMailList();
    renderState();
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY) {
    state = loadState();
    renderMailList();
    renderState();
  }
});

renderState();
