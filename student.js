(() => {
  const auth = window.CCAAuth;
  const core = window.CrohnozAcademyCore;
  const session = auth.requireAuth({ permission: 'manage_users', unauthorized: './instructor.html' });
  if (!session) return;

  const DEMO_KEY = 'cca:user-admin-demo:v1';
  const isRemote = Boolean(core?.enabled && session.provider === 'crohnoz-academy');
  let model = { profiles: [], cohorts: [], memberships: [], enrollments: [], certificates: [], audit: [] };
  let selectedProfile = null;

  const skillLabels = {
    phishing: 'Phishing & Social Engineering',
    web: 'Web Security',
    osint: 'OSINT & Verification',
    api: 'API Security'
  };
  const nextModules = {
    phishing: 'Phishing · Social Engineering',
    web: 'Web Security · Output Encoding',
    osint: 'OSINT · Source Verification',
    api: 'API Security · Authorization'
  };

  function unpack(payload) { return Array.isArray(payload) ? payload : (payload?.results || []); }
  function text(value, max = 220) { return String(value ?? '').slice(0, max); }
  function node(tag, value = '', className = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== '') el.textContent = text(value, 420);
    return el;
  }
  function initials(value) {
    return text(value || 'CA', 120).trim().split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'CA';
  }
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = text(message, 160);
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
  }
  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-CL');
  }

  function fallbackDemo() {
    return {
      profiles: [
        { id:'p2', user_id:2, username:'camila.rojas', email:'camila@demo.example', display_name:'Camila Rojas', role:'learner', locale:'es', onboarding_completed:true, is_active:true, last_login:new Date(Date.now()-3.2e6).toISOString() },
        { id:'p3', user_id:3, username:'diego.martin', email:'diego@demo.example', display_name:'Diego Martín', role:'learner', locale:'es', onboarding_completed:true, is_active:true, last_login:new Date(Date.now()-8.5e6).toISOString() },
        { id:'p4', user_id:4, username:'valentina.soto', email:'valentina@demo.example', display_name:'Valentina Soto', role:'learner', locale:'es', onboarding_completed:false, is_active:true, last_login:null },
        { id:'p5', user_id:5, username:'matias.vega', email:'matias@demo.example', display_name:'Matías Vega', role:'learner', locale:'es', onboarding_completed:true, is_active:true, last_login:new Date(Date.now()-23e6).toISOString() },
        { id:'p6', user_id:6, username:'sofia.reyes', email:'sofia@demo.example', display_name:'Sofía Reyes', role:'learner', locale:'es', onboarding_completed:false, is_active:false, last_login:new Date(Date.now()-72e6).toISOString() }
      ],
      cohorts: [
        { id:'c1', name:'AppSec Foundations', code:'APPSEC-01', max_students:18, status:'active' },
        { id:'c2', name:'Cyber Awareness Q3', code:'AWARE-Q3', max_students:24, status:'active' },
        { id:'c3', name:'Blue Team Starter', code:'BLUE-01', max_students:12, status:'active' }
      ],
      memberships: [
        { id:'m2', cohort:'c1', user:2, status:'active' }, { id:'m3', cohort:'c1', user:3, status:'active' },
        { id:'m4', cohort:'c2', user:4, status:'active' }, { id:'m5', cohort:'c2', user:5, status:'active' },
        { id:'m6', cohort:'c3', user:6, status:'active' }
      ],
      enrollments: [
        { id:'e2a', learner:{id:2}, course:{title:'AppSec Foundations',slug:'appsec-foundations'}, status:'active', progress_percent:82 },
        { id:'e2b', learner:{id:2}, course:{title:'Phishing Defense',slug:'phishing-defense'}, status:'active', progress_percent:94 },
        { id:'e3a', learner:{id:3}, course:{title:'AppSec Foundations',slug:'appsec-foundations'}, status:'active', progress_percent:61 },
        { id:'e4a', learner:{id:4}, course:{title:'Cyber Awareness Q3',slug:'cyber-awareness-q3'}, status:'active', progress_percent:34 },
        { id:'e5a', learner:{id:5}, course:{title:'Cyber Awareness Q3',slug:'cyber-awareness-q3'}, status:'active', progress_percent:74 },
        { id:'e6a', learner:{id:6}, course:{title:'Blue Team Starter',slug:'blue-team-starter'}, status:'active', progress_percent:46 }
      ],
      certificates: [
        { id:'cert2', learner:{id:2,username:'camila.rojas',display_name:'Camila Rojas'}, course:{title:'Phishing Defense'}, certificate_code:'DEMO-CAM-001', issued_at:new Date(Date.now()-6*864e5).toISOString(), revoked_at:null, is_valid:true }
      ],
      audit: [
        { id:'u2a', created_at:new Date(Date.now()-3.2e6).toISOString(), action:'auth.login.succeeded', actor:{username:'camila.rojas'}, metadata:{} },
        { id:'u2b', created_at:new Date(Date.now()-16e6).toISOString(), action:'assessment.submitted', actor:{username:'camila.rojas'}, metadata:{score:88} },
        { id:'u3a', created_at:new Date(Date.now()-8.5e6).toISOString(), action:'lesson_progress.updated', actor:{username:'diego.martin'}, metadata:{status:'completed'} },
        { id:'u4a', created_at:new Date(Date.now()-35e6).toISOString(), action:'cohort.member.added', actor:{username:'cristian.demo'}, metadata:{user:'valentina.soto'} }
      ]
    };
  }

  function loadDemo() {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch {}
    const base = fallbackDemo();
    if (!stored?.profiles) return base;
    const learners = stored.profiles.filter(item => item.role === 'learner');
    if (learners.length) base.profiles = learners.map(profile => ({ is_active:true, last_login:null, ...profile }));
    if (stored.cohorts) base.cohorts = stored.cohorts;
    if (stored.memberships) base.memberships = stored.memberships;
    if (stored.enrollments?.length) {
      base.enrollments = stored.enrollments.map((row, index) => ({
        id: row.id || `preview-enrollment-${index}`,
        course: row.course || { title:'Cristian Cyber Academy Path', slug:'cyber-path' },
        status: row.status || 'active',
        ...row
      }));
    }
    if (stored.audit?.length) base.audit = [...stored.audit, ...base.audit];
    return base;
  }

  async function loadRemote() {
    const [profiles, cohorts, memberships, enrollments, certificates, audit] = await Promise.all([
      core.opsProfiles(), core.opsCohorts(), core.opsMemberships(), core.opsEnrollments(), core.opsCertificates(), core.opsAuditEvents()
    ]);
    return {
      profiles: unpack(profiles).filter(item => item.role === 'learner'),
      cohorts: unpack(cohorts), memberships: unpack(memberships), enrollments: unpack(enrollments),
      certificates: unpack(certificates), audit: unpack(audit)
    };
  }

  function profileId(profile) { return String(profile?.id ?? profile?.user_id ?? ''); }
  function userId(profile) { return String(profile?.user_id ?? profile?.user?.id ?? ''); }
  function learnerRows(profile) {
    const id = userId(profile);
    return model.enrollments.filter(row => String(row.learner?.id ?? row.user_id ?? row.user?.id ?? '') === id);
  }
  function learnerMemberships(profile) {
    const id = userId(profile);
    return model.memberships.filter(row => String(row.user?.id ?? row.user ?? '') === id && row.status !== 'removed');
  }
  function learnerCertificates(profile) {
    const id = userId(profile);
    return model.certificates.filter(row => String(row.learner?.id ?? row.enrollment?.user?.id ?? '') === id);
  }
  function cohortById(id) { return model.cohorts.find(row => String(row.id) === String(id)); }
  function averageProgress(profile) {
    const values = learnerRows(profile).map(row => Number(row.progress_percent || 0)).filter(Number.isFinite);
    return values.length ? Math.round(values.reduce((a,b)=>a+b,0) / values.length) : 0;
  }

  function previewSkills(profile) {
    const seed = [...String(profile.username || profile.user_id || 'learner')].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 17);
    const score = offset => 42 + ((seed + offset * 137) % 53);
    return { phishing:score(1), web:score(2), osint:score(3), api:score(4) };
  }

  function renderSelector() {
    const select = document.getElementById('learnerSelector');
    select.textContent = '';
    model.profiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profileId(profile);
      option.textContent = `${profile.display_name || profile.username} · ${profile.email || profile.username}`;
      select.appendChild(option);
    });
    const requested = new URLSearchParams(location.search).get('user');
    if (requested && [...select.options].some(option => option.value === requested)) select.value = requested;
    selectedProfile = model.profiles.find(profile => profileId(profile) === select.value) || model.profiles[0] || null;
  }

  function renderIdentity(profile) {
    const active = profile.is_active !== false;
    document.getElementById('studentAvatar').textContent = initials(profile.display_name || profile.username);
    document.getElementById('studentRole').textContent = String(profile.role || 'learner').toUpperCase();
    document.getElementById('studentName').textContent = profile.display_name || profile.username || 'Learner';
    const cohorts = learnerMemberships(profile).map(item => cohortById(item.cohort?.id ?? item.cohort)?.name).filter(Boolean);
    document.getElementById('studentMeta').textContent = `${profile.email || '—'} · ${cohorts.join(', ') || 'Sin cohorte'} · onboarding ${profile.onboarding_completed ? 'completo' : 'pendiente'}`;
    const state = document.getElementById('accountState');
    state.textContent = active ? 'ACTIVE' : 'SUSPENDED';
    state.classList.toggle('suspended', !active);
    document.getElementById('lastAccess').textContent = `Último acceso · ${formatDate(profile.last_login)}`;
  }

  function renderKpis(profile, skills) {
    const enrollments = learnerRows(profile);
    const certs = learnerCertificates(profile).filter(item => item.is_valid !== false && !item.revoked_at);
    document.getElementById('progressKpi').textContent = `${averageProgress(profile)}%`;
    document.getElementById('coursesKpi').textContent = String(enrollments.filter(item => item.status !== 'cancelled').length);
    document.getElementById('certificatesKpi').textContent = String(certs.length);
    if (skills) {
      const values = Object.values(skills);
      document.getElementById('readinessKpi').textContent = String(Math.round(values.reduce((a,b)=>a+b,0) / values.length));
      document.getElementById('readinessSource').textContent = 'señal sintética de preview';
    } else {
      document.getElementById('readinessKpi').textContent = '—';
      document.getElementById('readinessSource').textContent = 'Skill Graph backend pendiente';
    }
  }

  function renderSkills(skills) {
    const host = document.getElementById('skillStack'); host.textContent = '';
    const source = document.getElementById('skillSource');
    if (!skills) {
      source.textContent = 'PENDING CYBER DATA';
      host.appendChild(node('div','Academy Core entrega identidad y progreso, pero el Skill Graph cyber server-side aún no está conectado. No se fabrican scores en modo remoto.','empty-360'));
      return;
    }
    source.textContent = 'PREVIEW SYNTHETIC';
    Object.entries(skills).forEach(([key,value]) => {
      const row = node('div','', 'skill-row');
      const label = node('div'); label.append(node('span',skillLabels[key] || key), node('b',String(value))); row.appendChild(label);
      const meter = node('div','',`skill-meter ${value < 60 ? 'warn' : ''}`); const fill = node('i'); fill.style.width = `${Math.max(0,Math.min(100,value))}%`; meter.appendChild(fill); row.appendChild(meter); host.appendChild(row);
    });
  }

  function renderRecommendation(profile, skills) {
    const progress = averageProgress(profile);
    let module = 'Security Foundations'; let why = `Progreso académico ${progress}%`; let priority = 'MEDIUM';
    if (skills) {
      const weakest = Object.entries(skills).sort((a,b)=>a[1]-b[1])[0];
      module = nextModules[weakest[0]] || module;
      why = `${skillLabels[weakest[0]]} es la señal más baja (${weakest[1]}).`;
      priority = weakest[1] < 55 ? 'HIGH' : weakest[1] < 70 ? 'MEDIUM' : 'LOW';
      document.getElementById('recommendationText').textContent = 'La recomendación usa únicamente señal sintética de la preview para demostrar la UX adaptativa. En producción será evidencia server-side.';
    } else {
      if (progress < 45) { module='Revisión guiada · Security Foundations'; priority='HIGH'; }
      else if (progress > 80) { module='Práctica avanzada · Guided Lab'; priority='LOW'; }
      document.getElementById('recommendationText').textContent = 'Sin Skill Graph cyber remoto, la recomendación se limita al progreso académico disponible y no pretende inferir una competencia que no existe en el backend.';
    }
    document.getElementById('recommendationModule').textContent = module;
    document.getElementById('recommendationWhy').textContent = why;
    document.getElementById('priorityChip').textContent = priority;
  }

  function renderJourney(profile) {
    const host = document.getElementById('journeyList'); host.textContent = '';
    const rows = learnerRows(profile);
    if (!rows.length) { host.appendChild(node('div','No hay matrículas visibles para este alumno.','empty-360')); return; }
    rows.forEach(row => {
      const item=node('div','', 'journey-item'); const copy=node('div');
      copy.appendChild(node('strong',row.course?.title || row.course?.slug || 'Curso Academy'));
      copy.appendChild(node('small',`${row.status || 'active'} · ${row.certificate_code ? 'certificado emitido' : 'en progreso'}`));
      item.append(copy,node('span',`${Number(row.progress_percent || 0)}%`,'journey-progress')); host.appendChild(item);
    });
  }

  function renderCohorts(profile) {
    const host=document.getElementById('cohortContext'); host.textContent='';
    const rows=learnerMemberships(profile);
    if(!rows.length){host.appendChild(node('div','Alumno sin cohorte activa.','empty-360'));return;}
    rows.forEach(row=>{
      const cohort=cohortById(row.cohort?.id??row.cohort); const item=node('div','', 'cohort-item-360');
      item.appendChild(node('strong',cohort?.name || 'Cohorte')); item.appendChild(node('small',`${cohort?.code || 'COHORT'} · status ${row.status || 'active'} · capacidad ${cohort?.max_students || '—'}`)); host.appendChild(item);
    });
  }

  function renderCertificates(profile) {
    const host=document.getElementById('certificateList'); host.textContent='';
    const rows=learnerCertificates(profile);
    if(!rows.length){host.appendChild(node('div','Sin certificados emitidos visibles.','empty-360'));return;}
    rows.forEach(row=>{
      const item=node('div','', 'evidence-item'); const copy=node('div'); copy.appendChild(node('strong',row.course?.title || 'Certificado Academy'));
      copy.appendChild(node('small',`${row.certificate_code || '—'} · emitido ${formatDate(row.issued_at)}`));
      item.append(copy,node('span',row.revoked_at || row.is_valid===false ? 'REVOKED' : 'VALID','state-pill')); host.appendChild(item);
    });
  }

  function renderActivity(profile) {
    const host=document.getElementById('activityTimeline'); host.textContent='';
    const username=String(profile.username || '').toLowerCase();
    const rows=model.audit.filter(event=>{
      const actor=String(event.actor?.username || event.actor || '').toLowerCase();
      const meta=JSON.stringify(event.metadata || {}).toLowerCase();
      return actor===username || (username && meta.includes(username));
    }).slice(0,8);
    if(!rows.length){host.appendChild(node('div','Sin eventos auditables asociados a esta identidad en la ventana visible.','empty-360'));return;}
    rows.forEach(event=>{
      const item=node('div','', 'timeline-item'); item.appendChild(node('small',formatDate(event.created_at || event.at)));
      const copy=node('div'); copy.appendChild(node('strong',event.action || 'event'));
      const metadata=event.metadata&&typeof event.metadata==='object'?Object.entries(event.metadata).slice(0,3).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(','):v}`).join(' · '):'Sin metadata adicional';
      copy.appendChild(node('small',metadata)); item.appendChild(copy); host.appendChild(item);
    });
  }

  function renderSelected() {
    if (!selectedProfile) {
      document.getElementById('studentName').textContent='Sin learners disponibles';
      return;
    }
    const skills = isRemote ? null : previewSkills(selectedProfile);
    renderIdentity(selectedProfile); renderKpis(selectedProfile, skills); renderSkills(skills); renderRecommendation(selectedProfile, skills);
    renderJourney(selectedProfile); renderCohorts(selectedProfile); renderCertificates(selectedProfile); renderActivity(selectedProfile);
    const url=new URL(location.href); url.searchParams.set('user',profileId(selectedProfile)); history.replaceState(null,'',url);
  }

  document.getElementById('learnerSelector').addEventListener('change',event=>{
    selectedProfile=model.profiles.find(profile=>profileId(profile)===event.target.value)||model.profiles[0]||null;
    renderSelected();
  });

  document.getElementById('assignAction').addEventListener('click',()=>{
    const feedback=document.getElementById('actionFeedback');
    if(isRemote){
      feedback.textContent='La API de assignments server-side aún no está conectada a Student 360; no se creó una asignación ficticia.';
      return;
    }
    const recommendation=document.getElementById('recommendationModule').textContent;
    const stored=loadDemo(); stored.audit=Array.isArray(stored.audit)?stored.audit:[];
    stored.audit.unshift({id:crypto.randomUUID?.()||String(Date.now()),created_at:new Date().toISOString(),action:'student360.recommendation.recorded',actor:{username:session.user?.username||'cristian.demo'},metadata:{user:selectedProfile?.username,module:recommendation}});
    localStorage.setItem(DEMO_KEY,JSON.stringify(stored)); model.audit=stored.audit; renderActivity(selectedProfile);
    feedback.textContent='Recomendación registrada en la evidencia local de preview.'; showToast('Recomendación registrada');
  });

  async function init(){
    try{
      model=isRemote?await loadRemote():loadDemo();
      renderSelector(); renderSelected();
    }catch(error){
      showToast(error.code==='NETWORK_ERROR'?'Academy Core no está disponible':(error.message||'No pudimos cargar Student 360'));
    }
  }
  init();
})();