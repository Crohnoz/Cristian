(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.();
  if (!session) return;

  const courses = {
    phishing: {
      title:'Phishing Defense', code:'COURSE 01 · FUNDAMENTOS', level:'FOUNDATION', duration:'2h 15m', labs:'3 labs', progress:68, score:79,
      art:'./art/course-phishing.svg',
      modules:[
        ['01','◎','Anatomía del engaño','8 min','done'],
        ['02','✉','Inbox Under Attack','lab · 25 min','active'],
        ['03','⌁','URLs & dominios','12 min','pending'],
        ['04','✓','Reporte seguro','challenge · 20 min','pending']
      ],
      practice:[['✉','INBOX LAB','Clasifica 6 mensajes','Synthetic mail'],['⌁','URL CHECK','Detecta dominios falsos','Visual challenge'],['✓','REPORT','Decide qué escalar','Decision drill']],
      skills:[['Phishing signals',91],['Verification',76],['Reporting',68]],
      showAwareness:true
    },
    web: {
      title:'Web Application Security', code:'COURSE 02 · APPSEC', level:'INTERMEDIATE', duration:'3h 10m', labs:'4 labs', progress:24, score:63,
      art:'./art/course-web-security.svg',
      modules:[
        ['01','◫','Attack Surface','14 min','done'],
        ['02','</>','XSS: source → sink','lab · 30 min','active'],
        ['03','⌘','Access Control','lab · 35 min','pending'],
        ['04','✓','Fix & Explain','challenge · 25 min','pending']
      ],
      practice:[['</>','XSS LAB','Encuentra el sink','Isolated range'],['⌘','AUTHZ','Rompe la suposición','Object-level'],['✓','PATCH','Elige la mitigación','Secure coding']],
      skills:[['Input handling',72],['Access control',48],['Secure coding',69]],
      showAwareness:false
    },
    soc: {
      title:'SOC & Incident Response', code:'COURSE 03 · BLUE TEAM', level:'INTERMEDIATE', duration:'3h 45m', labs:'4 labs', progress:0, score:54,
      art:'./art/course-soc.svg',
      modules:[
        ['01','◉','Signal vs Noise','16 min','active'],
        ['02','⌁','Alert Triage','lab · 30 min','pending'],
        ['03','◇','Incident Timeline','lab · 40 min','pending'],
        ['04','✓','Contain & Report','tabletop · 30 min','pending']
      ],
      practice:[['◉','SIEM VIEW','Lee la señal','Synthetic events'],['⌁','TRIAGE','Prioriza alertas','Blue-team drill'],['◇','TIMELINE','Reconstruye el incidente','Evidence board']],
      skills:[['Detection',58],['Triage',52],['Response',47]],
      showAwareness:false
    },
    cloud: {
      title:'Cloud & Identity Security', code:'COURSE 04 · ZERO TRUST', level:'ADVANCED', duration:'3h 20m', labs:'3 labs', progress:0, score:51,
      art:'./art/course-cloud-identity.svg',
      modules:[
        ['01','☁','Identity Plane','15 min','active'],
        ['02','◇','Least Privilege','lab · 30 min','pending'],
        ['03','⌁','Session & MFA','lab · 30 min','pending'],
        ['04','✓','Zero Trust Review','challenge · 25 min','pending']
      ],
      practice:[['☁','IAM MAP','Visualiza permisos','Synthetic tenant'],['◇','PRIVILEGE','Recorta acceso','Policy drill'],['⌁','SESSION','Refuerza identidad','MFA decisions']],
      skills:[['IAM',55],['Least privilege',49],['Session defense',50]],
      showAwareness:false
    }
  };

  const key = new URLSearchParams(location.search).get('course') || 'phishing';
  const course = courses[key] || courses.phishing;
  const q = id => document.getElementById(id);
  const safeText = (el, value) => { if (el) el.textContent = String(value ?? ''); };

  const user = session.user || {};
  const name = user.display_name || user.username || 'Usuario Academy';
  safeText(q('courseUser'), name);
  safeText(q('courseInitials'), name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase() || 'CA');
  q('courseArtwork').src = course.art;
  q('courseArtwork').alt = `Portada ${course.title}`;
  document.title = `${course.title} · Cristian Cyber Academy`;
  safeText(q('courseCode'), course.code);
  safeText(q('courseTitle'), course.title);
  safeText(q('courseLevel'), course.level);
  safeText(q('courseDuration'), course.duration);
  safeText(q('courseLabs'), course.labs);
  safeText(q('progressValue'), `${course.progress}%`);
  q('progressBar').style.width = `${course.progress}%`;
  safeText(q('evidenceScore'), course.score);

  document.querySelectorAll('[data-lesson-mode]').forEach(link => {
    const mode = link.dataset.lessonMode;
    link.href = `./lesson.html?course=${encodeURIComponent(key)}&mode=${encodeURIComponent(mode)}`;
  });

  const awarenessCard = q('awarenessCard');
  if (awarenessCard && !course.showAwareness) awarenessCard.hidden = true;

  const moduleTrack = q('moduleTrack');
  course.modules.forEach(([num, icon, title, meta, state]) => {
    const card = document.createElement('article');
    card.className = `module-card ${state === 'pending' ? '' : state}`.trim();
    const number = document.createElement('span'); number.className='module-number'; number.textContent=num;
    const symbol = document.createElement('div'); symbol.className='module-icon'; symbol.textContent=icon;
    const strong = document.createElement('strong'); strong.textContent=title;
    const small = document.createElement('small'); small.textContent=meta;
    const status = document.createElement('span'); status.className='module-state'; status.textContent = state==='done'?'COMPLETO':state==='active'?'EN CURSO':'BLOQUEADO';
    card.append(number,symbol,strong,small,status); moduleTrack.appendChild(card);
  });

  const practiceGrid = q('practiceGrid');
  course.practice.forEach(([icon,label,title,meta], index) => {
    const card = document.createElement('article'); card.className = `practice-card ${index===0?'primary-lab':''}`.trim();
    const visual = document.createElement('div'); visual.className='practice-visual';
    const symbol = document.createElement('div'); symbol.className='visual-symbol'; symbol.textContent=icon; visual.appendChild(symbol);
    const eyebrow = document.createElement('span'); eyebrow.textContent=label;
    const strong = document.createElement('strong'); strong.textContent=title;
    const small = document.createElement('small'); small.textContent=meta;
    card.append(visual,eyebrow,strong,small); practiceGrid.appendChild(card);
  });

  const skillBars = q('skillBars');
  course.skills.forEach(([label,value]) => {
    const row = document.createElement('div'); row.className='skill-row';
    const nameEl = document.createElement('span'); nameEl.textContent=label;
    const bar = document.createElement('i'); const fill=document.createElement('b'); fill.style.width=`${value}%`; bar.appendChild(fill);
    const valueEl = document.createElement('strong'); valueEl.textContent=String(value);
    row.append(nameEl,bar,valueEl); skillBars.appendChild(row);
  });
})();