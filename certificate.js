(() => {
  const KEY = 'cristian-cyber-academy:v2';
  const auth = window.CCAAuth;
  const session = auth?.current?.();
  if (!session?.authenticated) return;

  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { state = {}; }

  const skills = state.skills || { phishing:91, web:78, osint:67, api:48 };
  const values = Object.values(skills).map(Number).filter(Number.isFinite);
  const readiness = values.length ? Math.round(values.reduce((a,b) => a + b, 0) / values.length) : 0;
  const phishing = Number(state.stats?.phishingCorrect || 0);
  const range = Number(state.stats?.rangeCorrect || 0);
  const unlocked = readiness >= 75 && phishing >= 2 && range >= 1;

  document.getElementById('readiness').textContent = String(readiness);
  document.getElementById('phishing').textContent = String(phishing);
  document.getElementById('range').textContent = String(range);
  document.getElementById('status').textContent = unlocked ? 'CERTIFICATE UNLOCKED' : 'CERTIFICATE LOCKED';
  document.getElementById('title').textContent = unlocked ? 'Cyber Foundations · Demo Achievement' : 'Completa tu ruta práctica';
  document.getElementById('description').textContent = unlocked
    ? 'Cristian Cyber Academy reconoce que el alumno completó el umbral práctico definido para esta demostración. No corresponde a una certificación profesional acreditada.'
    : 'Aún faltan requisitos prácticos. Continúa tu ruta para completar el recorrido.';

  const criteria = document.getElementById('criteria');
  const rows = [
    ['Readiness ≥ 75', readiness >= 75],
    ['2 clasificaciones correctas de phishing', phishing >= 2],
    ['1 laboratorio práctico completado', range >= 1]
  ];
  criteria.replaceChildren();
  rows.forEach(([label, ok]) => {
    const row = document.createElement('div');
    row.className = 'criterion';
    const name = document.createElement('span');
    name.textContent = label;
    const status = document.createElement('span');
    status.textContent = ok ? '✓ COMPLETO' : '○ PENDIENTE';
    row.append(name, status);
    criteria.appendChild(row);
  });

  const learnerName = session.user?.display_name || session.user?.username || state.learner?.name || 'Alumno Demo';
  const raw = `${learnerName}|${readiness}|${phishing}|${range}|CCA-DEMO`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = (((hash << 5) - hash) + raw.charCodeAt(i)) | 0;
  document.getElementById('verification').textContent = `Verification ID: CCA-DEMO-${Math.abs(hash).toString(16).toUpperCase().padStart(8,'0')} · Demo only`;

  const printButton = document.getElementById('print');
  printButton.disabled = !unlocked;
  printButton.addEventListener('click', () => window.print());

  document.getElementById('reset').addEventListener('click', () => {
    if (!confirm('¿Reiniciar progreso local de la demo?')) return;
    localStorage.removeItem(KEY);
    localStorage.removeItem('cca:onboarding:v1');
    location.href = './dashboard.html';
  });
})();