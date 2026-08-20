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
  }
];

const mailList = document.getElementById('mailList');
const mailReader = document.getElementById('mailReader');

function renderMailList() {
  mailList.innerHTML = messages.map(m => `
    <div class="mail-item" data-mail="${m.id}">
      <strong>${m.from}</strong>
      <span>${m.subject}</span>
      <small>${m.preview}</small>
    </div>
  `).join('');

  mailList.querySelectorAll('.mail-item').forEach(item => {
    item.addEventListener('click', () => openMail(Number(item.dataset.mail)));
  });
}

function openMail(id) {
  const mail = messages.find(m => m.id === id);
  document.querySelectorAll('.mail-item').forEach(i => i.classList.toggle('active', Number(i.dataset.mail) === id));
  mailReader.innerHTML = `
    <div class="mail-meta">
      <span class="eyebrow">MESSAGE ANALYSIS</span>
      <h3>${mail.subject}</h3>
      <p><strong>${mail.from}</strong><br><code>${mail.address}</code></p>
    </div>
    <div class="mail-body"><p>${mail.body}</p></div>
    <div class="analysis-box">
      <span class="eyebrow">YOUR DECISION</span>
      <h3>¿Cómo clasificarías este mensaje?</h3>
      <div class="analysis-actions">
        <button class="classify" data-choice="safe">Legítimo</button>
        <button class="classify" data-choice="phish">Phishing</button>
      </div>
      <div class="result" id="mailResult">Inspecciona el remitente y el contexto antes de responder.</div>
    </div>
  `;

  mailReader.querySelectorAll('.classify').forEach(btn => btn.addEventListener('click', () => {
    const guessedPhish = btn.dataset.choice === 'phish';
    const ok = guessedPhish === mail.phishing;
    const result = document.getElementById('mailResult');
    result.className = `result ${ok ? 'good' : 'bad'}`;
    result.innerHTML = `<strong>${ok ? 'Correcto.' : 'Revisa nuevamente.'}</strong><br>${mail.signals.map(s => `• ${s}`).join('<br>')}`;
  }));
}

renderMailList();

const answers = document.querySelectorAll('.answer');
const answerFeedback = document.getElementById('answerFeedback');
answers.forEach(answer => answer.addEventListener('click', () => {
  const isCorrect = answer.classList.contains('correct');
  answerFeedback.textContent = isCorrect
    ? 'Correcto. El encoding contextual evita que datos controlados por el usuario sean interpretados como markup o script. Debe complementarse con plantillas seguras y una CSP defensiva.'
    : 'Esa medida no corrige la causa raíz. Busca una mitigación que trate de forma segura los datos justo antes de incorporarlos al contexto HTML.';
  answerFeedback.style.color = isCorrect ? 'var(--green)' : 'var(--amber)';
}));

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chat = document.getElementById('chat');

const mentorReplies = [
  'Buena pregunta. Primero identifica el límite de confianza: ¿qué dato controla el usuario y en qué contexto termina renderizado?',
  'Te doy una pista, no la respuesta completa: revisa si el valor termina en HTML, atributo, URL o JavaScript. La mitigación cambia según el contexto.',
  'En un entorno real conviene combinar controles: validación, encoding contextual, APIs seguras del framework y una CSP defensiva. Ninguno reemplaza a los demás.',
  'Para comprobar que entendiste: ¿qué diferencia existe entre sanitizar una entrada y codificar una salida?'
];
let replyIndex = 0;

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  chat.insertAdjacentHTML('beforeend', `<div class="message user-msg"><b>Tú</b><p>${escapeHtml(value)}</p></div>`);
  chatInput.value = '';
  const response = mentorReplies[replyIndex++ % mentorReplies.length];
  chat.insertAdjacentHTML('beforeend', `<div class="message mentor-msg"><b>Cristian AI · Demo</b><p>${response}</p></div>`);
  chat.scrollTop = chat.scrollHeight;
});

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}
