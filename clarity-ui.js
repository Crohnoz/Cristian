(() => {
  if (window.__CCA_CLARITY_UI__) return;
  window.__CCA_CLARITY_UI__ = true;
  document.body.classList.add('clarity-ui');

  const route = (location.pathname.split('/').filter(Boolean).pop() || 'dashboard.html').replace('.html','');
  const params = new URLSearchParams(location.search);
  const courseKey = params.get('course') || 'phishing';
  const courseNames = { phishing:'Phishing Defense', web:'Web Application Security', soc:'SOC & Incident Response', cloud:'Cloud & Identity Security' };
  const mode = params.get('mode') || params.get('type') || 'video';
  const modeNames = { video:'Clase grabada', live:'Clase en vivo', awareness:'Simulación', simulation:'Simulación', lab:'Laboratorio', quiz:'Checkpoint', checkpoint:'Checkpoint' };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const addDashboardFocus = () => {
    const welcome = document.querySelector('.welcome-row');
    if (!welcome || document.querySelector('.clarity-focus')) return;
    const wrap = el('section','clarity-focus');
    wrap.setAttribute('aria-label','Prioridades de aprendizaje');

    const createCard = ({primary=false,icon,kicker,title,meta,href,action}) => {
      const card = el('article',`clarity-focus-card${primary ? ' primary' : ''}`);
      const badge = el('div','clarity-focus-icon',icon);
      const copy = el('div','clarity-focus-copy');
      copy.append(el('small','',kicker),el('strong','',title),el('span','',meta));
      card.append(badge,copy);
      if (href && action) {
        const link = el('a','clarity-focus-action',action); link.href = href; card.append(link);
      }
      return card;
    };

    wrap.append(
      createCard({primary:true,icon:'▶',kicker:'CONTINUAR DONDE QUEDASTE',title:'Web Application Security · Módulo 06',meta:'12 min restantes · después: práctica guiada',href:'./lesson.html?course=web&mode=video',action:'Continuar →'}),
      createCard({icon:'◉',kicker:'PRÓXIMO EN TU AGENDA',title:'Threat Hunting en la práctica',meta:'Clase live · hoy 18:00',href:'./lesson.html?course=soc&mode=live',action:'Ver clase'}),
      createCard({icon:'✓',kicker:'ESTADO DE LA SEMANA',title:'3 de 5 objetivos completos',meta:'Vas al día · 2 actividades pendientes',href:'./progress.html',action:'Ver progreso'})
    );
    welcome.insertAdjacentElement('afterend',wrap);
  };

  const addContextBar = () => {
    if (!['catalog','course','lesson'].includes(route) || document.querySelector('.clarity-contextbar')) return;
    const shell = document.querySelector('.catalog-shell,.course-shell,.lesson-shell');
    if (!shell) return;

    const bar = el('div','clarity-contextbar');
    const crumbs = el('nav','clarity-breadcrumbs'); crumbs.setAttribute('aria-label','Ubicación');
    const home = el('a','','Academy'); home.href = './catalog.html'; crumbs.append(home);

    const sep = () => el('i','', '›');
    if (route === 'catalog') {
      crumbs.append(sep(),el('strong','','Catálogo y rutas'));
    } else if (route === 'course') {
      crumbs.append(sep(),el('strong','',courseNames[courseKey] || 'Curso'));
    } else {
      const course = el('a','',courseNames[courseKey] || 'Curso'); course.href = `./course.html?course=${encodeURIComponent(courseKey)}`;
      crumbs.append(sep(),course,sep(),el('strong','',modeNames[mode] || 'Lección'));
    }

    const next = el('div','clarity-next');
    if (route === 'catalog') {
      next.append(el('span','','Recomendado para ti'),Object.assign(el('a','','Continuar ruta →'),{href:'./course.html?course=web'}));
    } else if (route === 'course') {
      next.append(el('span','','Siguiente paso'),Object.assign(el('a','','Continuar clase →'),{href:`./lesson.html?course=${encodeURIComponent(courseKey)}&mode=video`}));
    } else {
      const nextMode = mode === 'video' ? 'live' : mode === 'live' ? 'lab' : mode === 'lab' ? 'quiz' : 'video';
      next.append(el('span','','Siguiente'),Object.assign(el('a','',`${modeNames[nextMode] || 'Actividad'} →`),{href:`./lesson.html?course=${encodeURIComponent(courseKey)}&mode=${nextMode}`}));
    }
    bar.append(crumbs,next);
    shell.prepend(bar);
  };

  const addLessonFocusMode = () => {
    if (route !== 'lesson') return;
    const actions = document.querySelector('.heading-actions');
    if (!actions || actions.querySelector('.clarity-focus-toggle')) return;
    const button = el('button','clarity-focus-toggle','◱ Modo foco');
    button.type = 'button'; button.setAttribute('aria-pressed','false');
    button.addEventListener('click', () => {
      const active = document.body.classList.toggle('lesson-focus');
      button.setAttribute('aria-pressed',String(active));
      button.textContent = active ? '◲ Salir de foco' : '◱ Modo foco';
    });
    actions.prepend(button);
  };

  const improveLabels = () => {
    document.querySelectorAll('.course-card .thumb>span').forEach(label => {
      const text = label.textContent.trim().toUpperCase();
      if (text === 'OFENSIVA') label.textContent = 'AWARENESS';
      if (text === 'DEFENSIVA') label.textContent = 'PRÁCTICA';
      if (text === 'FUNDAMENTOS') label.textContent = 'FOUNDATION';
    });
  };

  addDashboardFocus();
  addContextBar();
  addLessonFocusMode();
  improveLabels();
})();