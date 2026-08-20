(() => {
  if (window.__CCA_PREMIUM_UI__) return;
  window.__CCA_PREMIUM_UI__ = true;
  document.body.classList.add('premium-ui');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cardSelector = '.panel,.profile-card,.course-card,.lab-card,.practice-card,.module-card,.side-card,.path-strip,.content-card,.student-card,.risk-board article';
  const cards = [...document.querySelectorAll(cardSelector)];

  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        setTimeout(() => { entry.target.style.transitionDelay = ''; }, 500);
        observer.unobserve(entry.target);
      });
    }, { threshold:.08, rootMargin:'0px 0px -30px' });
    cards.forEach((card,index) => {
      card.classList.add('premium-reveal');
      card.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
      observer.observe(card);
    });
  }

  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--premium-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--premium-y', `${event.clientY - rect.top}px`);
    }, { passive:true });
  });

  if (!reduced) {
    requestAnimationFrame(() => {
      document.querySelectorAll('.progress i,.mini-progress i,.bar i,.skill i b').forEach(bar => {
        const target = bar.style.width || getComputedStyle(bar).width;
        if (!target || !target.includes('%')) return;
        bar.dataset.premiumTarget = target;
        bar.style.width = '0%';
        requestAnimationFrame(() => { bar.style.width = target; });
      });
    });
  }

  const toast = document.createElement('div');
  toast.className = 'premium-toast';
  toast.setAttribute('role','status');
  toast.setAttribute('aria-live','polite');
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  const command = document.createElement('div');
  command.className = 'premium-command';
  command.setAttribute('role','dialog');
  command.setAttribute('aria-modal','true');
  command.setAttribute('aria-label','Navegación rápida');
  const box = document.createElement('div'); box.className = 'premium-command-box';
  const head = document.createElement('div'); head.className = 'premium-command-head';
  const icon = document.createElement('span'); icon.textContent = '⌕';
  const input = document.createElement('input'); input.type = 'search'; input.placeholder = 'Buscar cursos, laboratorios o secciones…';
  const hint = document.createElement('kbd'); hint.textContent = 'ESC';
  head.append(icon,input,hint);
  const list = document.createElement('div'); list.className = 'premium-command-list';
  const session = window.CCAAuth?.current?.();
  const teaching = ['instructor','coordinator','admin'].includes(session?.user?.role);
  const destinations = [
    ['Mission Control','Resumen de tu progreso','./dashboard.html'],
    ['Academy','Cursos y rutas de aprendizaje','./catalog.html'],
    ['Clase en vivo','Próxima sesión sincrónica','./lesson.html?course=phishing&mode=live'],
    ['Laboratorios','Práctica segura y sintética','./lesson.html?course=web&mode=lab'],
    ['Skill Graph','Habilidades y progreso','./progress.html'],
    ['Certificaciones','Evidencia y logros','./certificate.html'],
    ...(teaching ? [['Teacher Intranet','Agenda, cohortes y estudiantes','./teacher.html']] : []),
    ['Cuenta','Preferencias y seguridad','./account.html']
  ];
  const render = query => {
    const q = query.trim().toLowerCase();
    list.replaceChildren();
    destinations.filter(item => !q || `${item[0]} ${item[1]}`.toLowerCase().includes(q)).forEach(([label,meta,href]) => {
      const a = document.createElement('a'); a.href = href;
      const strong = document.createElement('strong'); strong.textContent = label;
      const small = document.createElement('small'); small.textContent = meta;
      a.append(strong,small); list.appendChild(a);
    });
  };
  render('');
  input.addEventListener('input', () => render(input.value));
  box.append(head,list); command.appendChild(box); document.body.appendChild(command);

  let returnFocus = null;
  const openCommand = trigger => {
    returnFocus = trigger || document.activeElement;
    command.classList.add('open');
    input.value = '';
    render('');
    setTimeout(() => input.focus(), 0);
  };
  const closeCommand = () => {
    if (!command.classList.contains('open')) return;
    command.classList.remove('open');
    if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll:true });
  };
  command.addEventListener('click', event => { if (event.target === command) closeCommand(); });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand(); }
    if (event.key === 'Escape') closeCommand();
  });

  const shellSearch = document.querySelector('.product-shell-search');
  if (shellSearch) {
    shellSearch.setAttribute('role','button');
    shellSearch.setAttribute('tabindex','0');
    shellSearch.setAttribute('aria-label','Abrir navegación rápida');
    shellSearch.addEventListener('click', () => openCommand(shellSearch));
    shellSearch.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCommand(shellSearch); }
    });
  }

  const dock = document.createElement('nav');
  dock.className = 'premium-mobile-dock';
  dock.setAttribute('aria-label','Navegación móvil');
  const dockItems = [
    ['◉','Inicio','./dashboard.html','dashboard'],
    ['⌂','Academy','./catalog.html','catalog'],
    ['⬡','Labs','./lesson.html?course=web&mode=lab','lesson'],
    ['◔','Progreso','./progress.html','progress'],
    ['◎','Cuenta','./account.html','account']
  ];
  const current = (location.pathname.split('/').pop() || 'dashboard.html').replace('.html','');
  dockItems.forEach(([symbol,label,href,key]) => {
    const a = document.createElement('a'); a.href = href;
    if (current === key || (current === 'lesson' && key === 'lesson')) a.classList.add('active');
    const b = document.createElement('b'); b.textContent = symbol;
    const small = document.createElement('small'); small.textContent = label;
    a.append(b,small); dock.appendChild(a);
  });
  document.body.appendChild(dock);

  document.querySelectorAll('.join').forEach(link => link.addEventListener('pointerdown', () => showToast('Preparando tu sesión…')));
  document.querySelectorAll('.live-tag,.system-health').forEach(node => {
    if (!node.querySelector('.premium-status-dot')) {
      const dot = document.createElement('i'); dot.className = 'premium-status-dot'; node.prepend(dot);
    }
  });
})();