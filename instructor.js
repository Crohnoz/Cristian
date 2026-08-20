(() => {
const AUTH_SESSION_KEY = 'cca:auth-session:v1';
const STORAGE_KEY = 'cristian-cyber-academy:v2';
const telemetry = window.CrohnozTelemetry || { track: () => {}, exportEvents: () => [] };
const config = window.CCA_CONFIG || {};

function readSession(){try{return JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY)||'null');}catch{return null;}}
const session=readSession();
if(!session?.authenticated){const next=encodeURIComponent(location.pathname+location.search+location.hash);location.replace(`./auth.html?next=${next}`);return;}
if(!['instructor','coordinator','admin'].includes(session.user?.role)){location.replace('./index.html');return;}

function safeText(value, maxLength = 160) { return String(value ?? '').slice(0, maxLength); }
function loadLearner() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
function learnerSkills(state) { return state.skills || { phishing:91, web:78, osint:67, api:48 }; }
function readiness(state) { const values = Object.values(learnerSkills(state)).map(Number).filter(Number.isFinite); return values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0; }
function appendText(parent, tag, value, className='') { const node=document.createElement(tag); if(className) node.className=className; node.textContent=safeText(value); parent.appendChild(node); return node; }

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = safeText(message,160); toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200);
}

function installIdentityOperations(){
  const nav=document.querySelector('.sidebar .nav');
  if(nav && ['coordinator','admin'].includes(session.user?.role) && !document.getElementById('identityOpsLink')){
    const link=document.createElement('a'); link.id='identityOpsLink'; link.className='nav-item'; link.href='./users.html';
    const icon=document.createElement('span'); icon.textContent='♙'; link.append(icon,document.createTextNode('Usuarios & Accesos')); nav.appendChild(link);
  }
  const profile=document.querySelector('.topbar .profile');
  if(profile){profile.tabIndex=0;profile.setAttribute('role','link');profile.setAttribute('aria-label','Abrir mi cuenta');profile.style.cursor='pointer';const open=()=>location.href='./account.html';profile.addEventListener('click',open);profile.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});}
  const tenantCard=document.querySelector('.sidebar-card .level-row span');
  if(tenantCard) tenantCard.textContent=session.user?.role?.toUpperCase()||'INSTRUCTOR';
}

function renderLiveLearner() {
  const state=loadLearner(); const skills=learnerSkills(state); const host=document.getElementById('liveLearnerSummary');
  if(!host) return; host.textContent='';
  const cells=[['Readiness',readiness(state)],['Labs',Number(state.stats?.completedLabs ?? 18)],['XP',Number(state.learner?.xp ?? 3420).toLocaleString('es-CL')],['API Security',Number(skills.api ?? 0)]];
  cells.forEach(([label,value])=>{const cell=document.createElement('span'); appendText(cell,'small',label); appendText(cell,'strong',value); host.appendChild(cell);});

  const studentGrid=document.getElementById('studentGrid');
  if(studentGrid && !document.getElementById('liveDemoStudent')){
    const card=document.createElement('article'); card.className='student-card'; card.id='liveDemoStudent';
    const avatar=document.createElement('div'); avatar.className='student-avatar'; avatar.textContent='AD';
    const copy=document.createElement('div'); appendText(copy,'strong',`${safeText(state.learner?.name || 'Alumno Demo',80)} · LIVE`); appendText(copy,'span',`Readiness · ${readiness(state)}`); appendText(copy,'small',`${Number(state.stats?.completedLabs ?? 18)} labs · ${Number(state.learner?.xp ?? 3420).toLocaleString('es-CL')} XP`);
    const button=document.createElement('button'); button.type='button'; button.textContent='Ver señal'; button.addEventListener('click',()=>document.getElementById('activity')?.scrollIntoView({behavior:'smooth'}));
    card.append(avatar,copy,button); studentGrid.prepend(card);
  }

  const weakest=Object.entries(skills).sort((a,b)=>Number(a[1])-Number(b[1]))[0];
  const labels={api:'API Security · Authorization',web:'Web Security · Output Encoding',osint:'OSINT · Verification',phishing:'Phishing · Social Engineering'};
  document.getElementById('recommendedModule').textContent=labels[weakest?.[0]] || 'Security Foundations';
  document.getElementById('cohortLabs').textContent=String(312 + Math.max(0,Number(state.stats?.completedLabs ?? 18)-18));
}

function renderActivity() {
  const state=loadLearner(); const events=Array.isArray(state.events)?state.events.slice(0,12):[]; const host=document.getElementById('activityTable');
  if(!host) return; host.textContent=''; document.getElementById('activityCount').textContent=`${events.length} EVENTS`;
  const head=document.createElement('div'); head.className='table-row table-head'; ['Hora','Evento','Detalle','Origen','Estado'].forEach(label=>appendText(head,'span',label)); host.appendChild(head);
  if(!events.length){const row=document.createElement('div'); row.className='table-row'; appendText(row,'strong','Sin eventos'); appendText(row,'span','Completa una actividad en vista alumno'); appendText(row,'span','—'); appendText(row,'span','Demo'); appendText(row,'span','Esperando'); host.appendChild(row); return;}
  events.forEach(event=>{const row=document.createElement('div'); row.className='table-row'; const date=new Date(event.at); const detail=event.detail&&typeof event.detail==='object'?Object.values(event.detail).map(v=>safeText(v,60)).join(' · '):'—'; appendText(row,'strong',Number.isNaN(date.getTime())?'—':date.toLocaleString('es-CL')); appendText(row,'span',safeText(event.type,60).replaceAll('_',' ')); appendText(row,'span',detail||'—'); appendText(row,'span','Alumno Demo'); appendText(row,'span','Registrado','status-good'); host.appendChild(row);});
}

function assignRecommended() {
  const state=loadLearner(); state.assignments=Array.isArray(state.assignments)?state.assignments:[];
  const assignment={id:globalThis.crypto?.randomUUID?globalThis.crypto.randomUUID():String(Date.now()),module:document.getElementById('recommendedModule').textContent,cohort:'AppSec Foundations',assignedAt:new Date().toISOString()};
  state.assignments.unshift(assignment); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); telemetry.track('instructor_assignment_created',{module:assignment.module}); showToast(`Asignado: ${assignment.module}`);
}

document.getElementById('assignRecommended')?.addEventListener('click',assignRecommended);
document.getElementById('createModule')?.addEventListener('click',()=>showToast('Content Engine listo para conectar al backend de módulos'));

function exportEvidence() {
  const state=loadLearner(); const events=Array.isArray(state.events)?state.events:[];
  const rows=[['timestamp','event','detail'],...events.map(event=>[event.at,event.type,Object.values(event.detail||{}).join(' | ')])];
  const csv=rows.map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='cristian-academy-learning-evidence.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); telemetry.track('instructor_evidence_exported',{events:events.length}); showToast('Evidencia exportada en CSV');
}
document.getElementById('exportCsv')?.addEventListener('click',exportEvidence);

function bindNavigation() {
  const links=[...document.querySelectorAll('.nav a[href^="#"]')];
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if(!visible)return; links.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${visible.target.id}`));},{rootMargin:'-20% 0px -65% 0px',threshold:[0,.2,.5]});
  document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));
}

function applyConfig(){document.getElementById('instructorName').textContent=session.user?.display_name || config.instructor?.displayName || 'Cristian';}
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){renderLiveLearner();renderActivity();}});

installIdentityOperations(); applyConfig(); renderLiveLearner(); renderActivity(); bindNavigation(); telemetry.track('instructor_console_loaded',{source:'role-gated'});
})();