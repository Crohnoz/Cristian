const KEY = 'cristian-cyber-academy:v2';
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { state = {}; }

const skills = state.skills || { phishing: 91, web: 78, osint: 67, api: 48 };
const values = Object.values(skills);
const readiness = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
const phishing = state.stats?.phishingCorrect || 0;
const range = state.stats?.rangeCorrect || 0;
const unlocked = readiness >= 75 && phishing >= 2 && range >= 1;

document.getElementById('readiness').textContent = readiness;
document.getElementById('phishing').textContent = phishing;
document.getElementById('range').textContent = range;
document.getElementById('status').textContent = unlocked ? 'CERTIFICATE UNLOCKED' : 'CERTIFICATE LOCKED';
document.getElementById('title').textContent = unlocked ? 'Cyber Foundations · Demo Achievement' : 'Completa tu ruta práctica';
document.getElementById('description').textContent = unlocked
  ? 'Cristian Cyber Academy reconoce que el alumno completó el umbral práctico definido para esta demostración. No corresponde a una certificación profesional acreditada.'
  : 'Aún faltan requisitos prácticos. Regresa al Phishing Lab y Cyber Range para completar el recorrido.';

const rows = [
  ['Readiness ≥ 75', readiness >= 75],
  ['2 clasificaciones correctas de phishing', phishing >= 2],
  ['1 laboratorio de Cyber Range completado', range >= 1]
];

document.getElementById('criteria').innerHTML = rows
  .map(([label, ok]) => `<div class="criterion"><span>${label}</span><span>${ok ? '✓ COMPLETO' : '○ PENDIENTE'}</span></div>`)
  .join('');

const raw = `${state.learner?.name || 'Alumno Demo'}|${readiness}|${phishing}|${range}|CCA-DEMO`;
let hash = 0;
for (let i = 0; i < raw.length; i += 1) hash = ((hash << 5) - hash) + raw.charCodeAt(i) | 0;
document.getElementById('verification').textContent = `Verification ID: CCA-DEMO-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')} · Demo only`;

const printButton = document.getElementById('print');
printButton.disabled = !unlocked;
printButton.addEventListener('click', () => window.print());

document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('¿Reiniciar progreso local de la demo?')) return;
  localStorage.removeItem(KEY);
  location.href = './index.html';
});
