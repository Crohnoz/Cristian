(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.();
  if (!session) return;

  const modes = {
    video: {
      eyebrow:'ASINCRÓNICO · VIDEO', title:'How attackers exploit trust signals', visual:'./art/lesson-video-replay.svg', status:'RECORDED LESSON', pill:'VIDEO', time:'11:18 / 18:42', className:'video-mode', objective:'Reconocer señales de confianza manipuladas', text:'Identifica qué señales merecen validación adicional y cómo elegir un canal seguro antes de actuar.', evidence:'Checkpoint al finalizar', next:'Clase sincrónica', nextMeta:'Q&A con instructor', nextMode:'live'
    },
    live: {
      eyebrow:'SINCRÓNICO · LIVE', title:'Defensive review with Cristian', visual:'./art/lesson-live-class.svg', status:'LIVE CLASS · DEMO', pill:'LIVE', time:'EN VIVO', className:'live-mode', objective:'Contrastar decisiones con el instructor', text:'Discute señales, preguntas y criterios de defensa en una sesión guiada con espacio de Q&A y replay posterior.', evidence:'Participación + replay', next:'Simulación visual', nextMeta:'Awareness Inbox', nextMode:'awareness'
    },
    awareness: {
      eyebrow:'SIMULACIÓN · AWARENESS', title:'Recognize before you react', visual:'./art/lesson-phishing-inbox.svg', status:'SYNTHETIC SIMULATION', pill:'SIM', time:'15 min', className:'awareness-mode', objective:'Reconocer patrones sin usar credenciales reales', text:'Analiza un mensaje sintético y prioriza remitente, contexto, urgencia y canal esperado antes de clasificar.', evidence:'Decisión + explicación', next:'Laboratorio', nextMeta:'Practice workspace', nextMode:'lab'
    },
    lab: {
      eyebrow:'PRÁCTICA · LAB', title:'Defender workspace', visual:'./art/lesson-lab-workspace.svg', status:'ISOLATED LAB', pill:'LAB', time:'30 min', className:'lab-mode', objective:'Aplicar el concepto en un entorno aislado', text:'Completa objetivos defensivos dentro de un sandbox con datos sintéticos y sin objetivos externos.', evidence:'Objetivos + resultado', next:'Knowledge check', nextMeta:'5 preguntas visuales', nextMode:'quiz'
    },
    quiz: {
      eyebrow:'CHECKPOINT · QUIZ', title:'What evidence matters most?', visual:'./art/lesson-quiz-signals.svg', status:'KNOWLEDGE CHECK', pill:'QUIZ', time:'5 min', className:'quiz-mode', objective:'Validar comprensión antes de avanzar', text:'Responde preguntas visuales y recibe feedback inmediato sobre el criterio detrás de cada decisión.', evidence:'Score + Skill Graph', next:'Volver al curso', nextMeta:'Revisar progreso', nextMode:'video'
    }
  };

  const params = new URLSearchParams(location.search);
  const modeKey = modes[params.get('mode')] ? params.get('mode') : 'video';
  const courseKey = params.get('course') || 'phishing';
  const mode = modes[modeKey];
  const q = id => document.getElementById(id);
  const set = (id, value) => { const el=q(id); if (el) el.textContent=String(value ?? ''); };

  document.body.classList.add(mode.className);
  set('lessonEyebrow', mode.eyebrow);
  set('lessonTitle', mode.title);
  set('lessonStatus', mode.status);
  set('modePill', mode.pill);
  set('viewerTime', mode.time);
  set('objectiveTitle', mode.objective);
  set('objectiveText', mode.text);
  set('evidenceLabel', mode.evidence);
  set('nextTitle', mode.next);
  set('nextMeta', mode.nextMeta);
  q('lessonVisual').src = mode.visual;
  q('lessonVisual').alt = mode.title;
  q('backCourse').href = `./course.html?course=${encodeURIComponent(courseKey)}#experience`;
  q('nextButton').addEventListener('click', () => {
    if (modeKey === 'quiz') location.href = `./course.html?course=${encodeURIComponent(courseKey)}#experience`;
    else location.href = `./lesson.html?course=${encodeURIComponent(courseKey)}&mode=${encodeURIComponent(mode.nextMode)}`;
  });

  const courseTitles = { phishing:'Phishing Defense', web:'Web Application Security', soc:'SOC & Incident Response', cloud:'Cloud & Identity Security' };
  set('railTitle', courseTitles[courseKey] || 'Cyber Academy');
  document.title = `${mode.title} · Cristian Cyber Academy`;

  document.querySelectorAll('#formatNav a').forEach(link => {
    const target = link.dataset.mode;
    link.href = `./lesson.html?course=${encodeURIComponent(courseKey)}&mode=${encodeURIComponent(target)}`;
    link.classList.toggle('active', target === modeKey);
  });

  const tabs = {
    overview: ['OBJETIVO', mode.objective, mode.text],
    notes: ['NOTAS', 'Puntos clave', 'Las notas de demo muestran dónde quedarían capítulos, timestamps, ideas clave y anotaciones personales del alumno.'],
    resources: ['RECURSOS', 'Material complementario', 'PDF, checklist, glosario, enlaces internos y archivos del instructor pueden acompañar cada clase.'],
    discussion: ['DISCUSIÓN', 'Conversación del curso', 'Espacio para preguntas, respuestas del instructor y conversación asociada a esta sesión.']
  };

  document.querySelectorAll('.lesson-tabs button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.lesson-tabs button').forEach(item => item.classList.toggle('active', item === button));
    const [eyebrow,title,text] = tabs[button.dataset.tab] || tabs.overview;
    const panel = q('tabPanel');
    panel.textContent='';
    const wrap=document.createElement('div'); wrap.className='overview-grid';
    const main=document.createElement('div');
    const e=document.createElement('span'); e.className='eyebrow'; e.textContent=eyebrow;
    const h=document.createElement('h3'); h.textContent=title;
    const p=document.createElement('p'); p.textContent=text;
    main.append(e,h,p);
    const aside=document.createElement('aside');
    const ae=document.createElement('span'); ae.className='eyebrow'; ae.textContent='EVIDENCIA';
    const strong=document.createElement('strong'); strong.textContent=mode.evidence;
    const small=document.createElement('small'); small.textContent='La actividad alimenta tu Skill Graph.';
    aside.append(ae,strong,small); wrap.append(main,aside); panel.appendChild(wrap);
  }));
})();