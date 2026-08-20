const STORAGE_KEY = 'cristian-cyber-academy:v2';
const config = window.CCA_CONFIG || {};
const telemetry = window.CrohnozTelemetry || { track: () => {}, exportEvents: () => [] };

const defaultState = {
  learner: { name: 'Alumno Demo', level: 8, xp: 3420, streak: 7 },
  stats: { completedLabs: 18, phishingAttempts: 0, phishingCorrect: 0, rangeAttempts: 0, rangeCorrect: 0 },
  skills: { phishing: 91, web: 78, osint: 67, api: 48 },
  completed: { phishing: {}, range: {} },
  events: [],
  assignments: [],
  certificateUnlocked: false
};

function cloneDefault() { return JSON.parse(JSON.stringify(defaultState)); }
function safeText(value, maxLength = 500) { return String(value ?? '').slice(0, maxLength); }
function escapeHtml(value) { return safeText(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const base = cloneDefault();
    return {
      ...base,
      ...parsed,
      learner: { ...base.learner, ...(parsed.learner || {}) },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      skills: { ...base.skills, ...(parsed.skills || {}) },
      completed: {
        phishing: { ...(parsed.completed?.phishing || {}) },
        range: { ...(parsed.completed?.range || {}) }
      },
      events: Array.isArray(parsed.events) ? parsed.events.slice(0, 40) : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : []
    };
  } catch { return cloneDefault(); }
}

let state = loadState();

function readinessScore() {
  const values = Object.values(state.skills).map(Number).filter(Number.isFinite);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

function syncCertificate() {
  state.certificateUnlocked = readinessScore() >= 75 && state.stats.phishingCorrect >= 2 && state.stats.rangeCorrect >= 1;
}

function saveState(type, detail = {}) {
  syncCertificate();
  if (type) {
    state.events.unshift({ type: safeText(type, 80), detail, at: new Date().toISOString() });
    state.events = state.events.slice(0, 40);
    telemetry.track(type, detail);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderState();
}

function awardXp(amount) {
  state.learner.xp += amount;
  state.learner.level = Math.max(1, Math.floor(state.learner.xp / 500) + 2);
}

const titles = {
  dashboard: 'Mission Control', academy: 'Academy', phishing: 'Phishing Lab', range: 'Cyber Range', mentor: 'AI Cyber Mentor', achievements: 'Achievements'
};
const views = [...document.querySelectorAll('.view')];
const navItems = [...document.querySelectorAll('.nav-item[data-view]')];
const pageTitle = document.getElementById('pageTitle');

function showView(id, { updateHash = true } = {}) {
  if (!titles[id]) id = 'dashboard';
  views.forEach(view => view.classList.toggle('active', view.id === id));
  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === id));
  pageTitle.textContent = titles[id];
  if (updateHash && location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  telemetry.track('view_opened', { view: id });
  if (id === 'achievements') renderAchievements();
}

navItems.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.jump)));
window.addEventListener('hashchange', () => showView(location.hash.slice(1), { updateHash: false }));

const messages = [
  { id:1, from:'Microsoft Security', address:'security@micros0ft-alert.example', subject:'Acción requerida: sesión expira hoy', preview:'Detectamos actividad y debes validar tu cuenta...', body:'Hola, detectamos una sesión inusual. Para evitar el bloqueo de tu cuenta, revisa tu acceso inmediatamente desde el botón de validación.', phishing:true, signals:['Dominio look-alike con un cero en “micros0ft”','Urgencia para inducir una acción rápida','Remitente fuera de un dominio corporativo real'] },
  { id:2, from:'Equipo de Formación', address:'formacion@academy.internal.example', subject:'Tu laboratorio OWASP ya está disponible', preview:'El laboratorio asignado puede abrirse desde el portal...', body:'Tu laboratorio OWASP está disponible dentro del portal de entrenamiento. Ingresa directamente desde tu dashboard habitual; este mensaje no contiene enlaces ni solicita credenciales.', phishing:false, signals:['No solicita credenciales','Indica utilizar un canal conocido','No crea urgencia artificial'] },
  { id:3, from:'Recursos Humanos', address:'rrhh-beneficios@external-gift.example', subject:'Beneficio exclusivo: tarjeta regalo', preview:'Solo quedan 30 minutos para reclamar...', body:'Has sido seleccionado para recibir una tarjeta regalo. Confirma tu identidad antes de 30 minutos para no perder el beneficio.', phishing:true, signals:['Premio inesperado','Presión temporal','Dominio externo sin relación con la organización'] },
  { id:4, from:'Git Platform', address:'no-reply@code-training.internal.example', subject:'Resumen semanal de actividad', preview:'3 laboratorios completados · 1 pendiente...', body:'Esta semana completaste tres laboratorios y tienes uno pendiente. Puedes revisar tu progreso directamente desde el dashboard del entorno de entrenamiento.', phishing:false, signals:['Mensaje informativo','No solicita información sensible','No contiene enlaces inesperados'] },
  { id:5, from:'Mesa de Ayuda', address:'support-password@reset-now.example', subject:'Restablecimiento obligatorio de contraseña', preview:'Tu contraseña será deshabilitada en una hora...', body:'Por actualización de seguridad debes confirmar tu identidad y restablecer tu contraseña dentro de una hora.', phishing:true, signals:['Dominio externo genérico','Solicitud sensible no esperada','Ventana de tiempo artificialmente corta'] },
  { id:6, from:'Seguridad Interna', address:'security-awareness@academy.internal.example', subject:'Recordatorio: reporte de mensajes sospechosos', preview:'Usa el botón de reporte cuando detectes señales...', body:'Recuerda reportar mensajes sospechosos mediante el canal oficial. Seguridad nunca solicitará tu contraseña por correo.', phishing:false, signals:['Refuerza el canal oficial','No solicita acciones sensibles','Contenido consistente con awareness'] }
];

const mailList = document.getElementById('mailList');
const mailReader = document.getElementById('mailReader');

function renderMailList() {
  mailList.textContent = '';
  messages.forEach(mail => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'mail-item';
    item.dataset.mail = String(mail.id);
    const sender = document.createElement('strong'); sender.textContent = mail.from;
    const subject = document.createElement('span'); subject.textContent = mail.subject;
    const preview = document.createElement('small'); preview.textContent = `${mail.preview}${state.completed.phishing[mail.id] ? ' · ✓ evaluado' : ''}`;
    item.append(sender, subject, preview);
    item.addEventListener('click', () => openMail(mail.id, item));
    mailList.appendChild(item);
  });
}

function openMail(id, activeItem) {
  const mail = messages.find(message => message.id === id);
  [...mailList.children].forEach(item => item.classList.toggle('active', item === activeItem));
  mailReader.innerHTML = `
    <div class="mail-meta"><span class="eyebrow">MESSAGE ANALYSIS</span><h3>${escapeHtml(mail.subject)}</h3><p><strong>${escapeHtml(mail.from)}</strong><br><code>${escapeHtml(mail.address)}</code></p></div>
    <div class="mail-body"><p>${escapeHtml(mail.body)}</p></div>
    <div class="analysis-box"><span class="eyebrow">YOUR DECISION</span><h3>¿Cómo clasificarías este mensaje?</h3><div class="analysis-actions"><button class="classify" data-choice="safe">Legítimo</button><button class="classify" data-choice="phish">Phishing</button></div><div class="result" id="mailResult">Inspecciona remitente, dominio y contexto antes de responder.</div></div>`;

  mailReader.querySelectorAll('.classify').forEach(btn => btn.addEventListener('click', () => {
    const ok = (btn.dataset.choice === 'phish') === mail.phishing;
    state.stats.phishingAttempts += 1;
    if (ok) {
      state.stats.phishingCorrect += 1;
      if (!state.completed.phishing[id]) {
        state.completed.phishing[id] = true;
        state.skills.phishing = Math.min(100, state.skills.phishing + 1);
        awardXp(80);
      }
    }
    const result = document.getElementById('mailResult');
    result.className = `result ${ok ? 'good' : 'bad'}`;
    result.innerHTML = `<strong>${ok ? 'Correcto. +80 XP en la primera resolución.' : 'Revisa nuevamente.'}</strong><br>${mail.signals.map(s => `• ${escapeHtml(s)}`).join('<br>')}`;
    saveState(ok ? 'phishing_correct' : 'phishing_retry', { messageId:id, correct:ok });
    renderMailList();
    showToast(ok ? 'Clasificación correcta registrada' : 'Intento registrado · revisa las señales');
  }));
}

const answerFeedback = document.getElementById('answerFeedback');
document.querySelectorAll('.answer').forEach(answer => answer.addEventListener('click', () => {
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
    ? 'Correcto. El encoding contextual evita que datos controlados por el usuario sean interpretados como markup o script. Complementa con plantillas seguras y una CSP defensiva.'
    : 'Esa medida no corrige la causa raíz. Busca un control aplicado cuando el dato entra al contexto HTML.';
  answerFeedback.style.color = isCorrect ? 'var(--green)' : 'var(--amber)';
  saveState(isCorrect ? 'range_completed' : 'range_retry', { lab:'lab-04-xss', correct:isCorrect });
  showToast(isCorrect ? 'Lab completado · +180 XP' : 'Intento guardado · sigue investigando');
}));

function mentorReply(value) {
  const q = value.toLowerCase();
  if (q.includes('xss')) return 'Para XSS identifica primero la entrada controlada por usuario y el contexto donde termina renderizada. Después compara encoding contextual, sanitización y APIs seguras del framework.';
  if (q.includes('phish') || q.includes('correo')) return 'En phishing evalúa identidad, dominio, urgencia, solicitud de secretos y coherencia con el canal habitual. Busca un patrón, no una señal aislada.';
  if (q.includes('api') || q.includes('autoriz')) return 'Autenticación responde quién eres; autorización responde qué puedes hacer. En una API, cada objeto solicitado necesita autorización server-side independiente del identificador enviado por cliente.';
  if (q.includes('osint')) return 'En OSINT la calidad depende de trazabilidad y corroboración. Registra fuente, fecha y confianza, y evita convertir una coincidencia en una conclusión.';
  return 'Empieza por tres preguntas: ¿qué activo proteges?, ¿dónde está el límite de confianza? y ¿qué evidencia demostraría que el control funciona?';
}

function appendChat(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role === 'user' ? 'user-msg' : 'mentor-msg'}`;
  const label = document.createElement('b'); label.textContent = role === 'user' ? 'Tú' : 'Cristian AI · Demo';
  const p = document.createElement('p'); p.textContent = safeText(text, 1000);
  wrapper.append(label, p);
  document.getElementById('chat').appendChild(wrapper);
}

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
chatForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  appendChat('user', value);
  appendChat('mentor', mentorReply(value));
  chatInput.value = '';
  document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
  saveState('mentor_question', { topic:value.slice(0,60) });
});
document.querySelectorAll('[data-prompt]').forEach(btn => btn.addEventListener('click', () => { chatInput.value = btn.dataset.prompt; chatInput.focus(); }));

const skillLabels = { phishing:'Phishing & Social Engineering', web:'Web Security', osint:'OSINT & Verification', api:'API Security · Authorization' };
const skillAdvice = {
  phishing:'Refuerza análisis de dominios, urgencia, identidad y canales oficiales.',
  web:'Refuerza contextos de salida, encoding y controles de navegador como defensa en profundidad.',
  osint:'Refuerza corroboración, trazabilidad y etiquetado de confianza por fuente.',
  api:'Tu mejor siguiente inversión es reforzar autorización a nivel de objeto y controles server-side.'
};

function weakestSkill() {
  return Object.entries(state.skills).sort((a,b) => Number(a[1]) - Number(b[1]))[0];
}

function renderActivity() {
  const host = document.getElementById('activityList');
  if (!host) return;
  host.textContent = '';
  const events = state.events.slice(0, 5);
  if (!events.length) {
    const empty = document.createElement('div'); empty.className = 'activity-item';
    empty.innerHTML = '<i></i><div><strong>Sin actividad nueva</strong><small>Completa una misión para generar evidencia.</small></div><time>—</time>';
    host.appendChild(empty); return;
  }
  events.forEach(event => {
    const row = document.createElement('div'); row.className = 'activity-item';
    const dot = document.createElement('i');
    const copy = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = event.type.replaceAll('_',' ');
    const detail = document.createElement('small'); detail.textContent = Object.values(event.detail || {}).map(v => safeText(v,40)).join(' · ') || 'Learning event';
    const time = document.createElement('time');
    const date = new Date(event.at); time.textContent = Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
    copy.append(title,detail); row.append(dot,copy,time); host.appendChild(row);
  });
}

document.getElementById('clearActivity')?.addEventListener('click', () => { state.events = []; saveState(null); renderActivity(); showToast('Activity stream limpiado'); });

function renderAchievements() {
  const host = document.getElementById('achievementGrid');
  if (!host) return;
  host.textContent = '';
  const phishDone = Object.keys(state.completed.phishing).length;
  const rangeDone = Object.keys(state.completed.range).length;
  const achievements = [
    ['✉','Signal Hunter','Clasifica correctamente 2 mensajes de phishing.',state.stats.phishingCorrect >= 2],
    ['⌘','Range Operator','Completa el laboratorio XSS en modo defensor.',rangeDone >= 1],
    ['↗','Momentum','Mantén una racha de 7 días o más.',state.learner.streak >= 7],
    ['◇','Cyber Foundations','Desbloquea el umbral de certificación demo.',state.certificateUnlocked],
    ['✦','Mentor Curious','Registra una pregunta al mentor.',state.events.some(e => e.type === 'mentor_question')],
    ['◫','Inbox Analyst','Evalúa los 6 mensajes de la misión.',phishDone >= 6],
    ['◎','Readiness 75','Alcanza readiness de 75 o superior.',readinessScore() >= 75],
    ['△','Evidence Builder','Genera 5 learning events.',state.events.length >= 5]
  ];
  achievements.forEach(([icon,title,description,unlocked]) => {
    const card = document.createElement('article'); card.className = `achievement-card${unlocked ? '' : ' locked'}`;
    const emblem = document.createElement('div'); emblem.className = 'achievement-icon'; emblem.textContent = unlocked ? icon : '·';
    const strong = document.createElement('strong'); strong.textContent = title;
    const p = document.createElement('p'); p.textContent = description;
    const small = document.createElement('small'); small.textContent = unlocked ? 'UNLOCKED · VERIFIED LOCALLY' : 'LOCKED · KEEP TRAINING';
    card.append(emblem,strong,p,small); host.appendChild(card);
  });
  document.getElementById('eventCount').textContent = String(state.events.length);
}

function renderState() {
  syncCertificate();
  const readiness = readinessScore();
  const phishDone = Object.keys(state.completed.phishing).length;
  document.getElementById('learnerName').textContent = safeText(state.learner.name,80);
  document.getElementById('readinessValue').textContent = String(readiness);
  document.getElementById('labsStat').textContent = String(state.stats.completedLabs);
  const accuracy = state.stats.phishingAttempts ? Math.round(state.stats.phishingCorrect / state.stats.phishingAttempts * 100) : state.skills.phishing;
  document.getElementById('phishingStat').textContent = `${accuracy}%`;
  document.getElementById('streakStat').textContent = `${state.learner.streak} días`;
  document.getElementById('riskStat').textContent = readiness >= 85 ? 'A' : readiness >= 75 ? 'B+' : 'B';
  document.getElementById('missionProgress').textContent = `${phishDone}/6`;
  document.getElementById('phishingProgress').textContent = `${phishDone} / 6 COMPLETE`;
  document.getElementById('levelLabel').textContent = `Level ${String(state.learner.level).padStart(2,'0')}`;
  document.getElementById('xpLabel').textContent = `${state.learner.xp.toLocaleString('es-CL')} XP`;
  const intoLevel = state.learner.xp % 500;
  document.getElementById('levelProgress').style.width = `${Math.round(intoLevel / 500 * 100)}%`;
  document.getElementById('levelHint').textContent = `${500 - intoLevel} para el siguiente nivel`;
  document.querySelectorAll('[data-skill]').forEach(row => {
    const value = Number(state.skills[row.dataset.skill] || 0);
    row.querySelector('b').textContent = String(value);
    row.querySelector('.bar i').style.width = `${value}%`;
  });
  const [weak] = weakestSkill();
  document.getElementById('weakestSkill').textContent = skillLabels[weak];
  document.getElementById('weakestAdvice').textContent = skillAdvice[weak];
  document.getElementById('signalPriority').textContent = Number(state.skills[weak]) < 60 ? 'PRIORITY' : 'WATCH';
  renderActivity();
  renderAchievements();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = safeText(message,160);
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

const commandDialog = document.getElementById('commandDialog');
const commandTrigger = document.getElementById('commandTrigger');
const commandClose = document.getElementById('commandClose');
const commandSearch = document.getElementById('commandSearch');
function openCommand() { commandDialog.showModal(); commandSearch.value=''; filterCommands(''); setTimeout(() => commandSearch.focus(),0); telemetry.track('command_deck_opened'); }
function closeCommand() { if (commandDialog.open) commandDialog.close(); }
function filterCommands(value) {
  const q = value.toLowerCase();
  document.querySelectorAll('#commandList > *').forEach(item => { item.hidden = !item.textContent.toLowerCase().includes(q); });
}
commandTrigger.addEventListener('click', openCommand); commandClose.addEventListener('click', closeCommand);
commandSearch.addEventListener('input', () => filterCommands(commandSearch.value));
document.querySelectorAll('[data-command]').forEach(item => item.addEventListener('click', () => { closeCommand(); showView(item.dataset.command); }));
window.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); commandDialog.open ? closeCommand() : openCommand(); }
  if (event.key === 'Escape') closeCommand();
});

function applyTenantConfig() {
  document.querySelector('[data-brand-name]').textContent = (config.brand?.shortName || 'CCA').toUpperCase();
  document.getElementById('productVersion').textContent = config.product?.version || 'v0.2';
}

window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) { state = loadState(); renderMailList(); renderState(); } });

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});

applyTenantConfig();
renderMailList();
renderState();
showView(location.hash.slice(1) || 'dashboard', { updateHash:false });
telemetry.track('app_loaded', { version:config.product?.version || 'unknown' });
