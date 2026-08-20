(() => {
  const auth = window.CCAAuth;
  const session = auth?.current?.();
  if (!session?.authenticated || document.querySelector('.product-shell-sidebar')) return;

  if (!document.querySelector('link[data-product-shell]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = './product-shell.css';
    style.dataset.productShell = 'true';
    document.head.appendChild(style);
  }

  const route = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const normalized = route.replace('.html','');
  const user = session.user || {};
  const displayName = user.display_name || user.username || 'Usuario Academy';
  const roleLabels = { learner:'Alumno', instructor:'Instructor', coordinator:'Coordinador', admin:'Administrador', author:'Autor', reviewer:'Revisor' };
  const isManager = ['coordinator','admin'].includes(user.role);
  const canTeach = ['instructor','coordinator','admin'].includes(user.role);

  const sidebar = document.createElement('aside');
  sidebar.className = 'product-shell-sidebar';
  sidebar.innerHTML = `
    <a class="product-shell-brand" href="./dashboard.html" aria-label="Mission Control"><img src="./brand.svg" alt=""><div><strong>CRISTIAN</strong><span>CYBER ACADEMY</span></div></a>
    <nav class="product-shell-nav" aria-label="Navegación principal">
      <a data-route="dashboard" href="./dashboard.html"><b>◎</b>Mission Control</a>
      <a data-route="catalog" href="./catalog.html"><b>⌂</b>Academy</a>
      <a data-route="course" href="./catalog.html"><b>◇</b>Rutas de aprendizaje</a>
      <a data-route="lesson" href="./course.html?course=phishing#modules"><b>⌘</b>Laboratorios</a>
      <a href="./lesson.html?mode=live"><b>◉</b>Eventos en vivo</a>
      <a data-route="progress" href="./progress.html"><b>◔</b>Mi progreso</a>
      <a href="./progress.html"><b>⌁</b>Skill Graph</a>
      <a href="./certificate.html"><b>◈</b>Certificaciones</a>
      <span class="product-shell-divider"></span>
      ${canTeach ? '<a data-route="instructor" href="./instructor.html"><b>⚙</b>Instructor Console</a>' : ''}
      ${isManager ? '<a href="./users.html"><b>◎</b>Usuarios & Cohortes</a><a href="./student.html"><b>↗</b>Student 360</a>' : ''}
    </nav>
    <div class="product-shell-bottom"><a href="./account.html">⚙ Ajustes / cuenta</a><a href="./privacy.html">? Ayuda & privacidad</a></div>`;

  const topbar = document.createElement('header');
  topbar.className = 'product-shell-topbar';
  topbar.innerHTML = `
    <div class="product-shell-search">⌕ <span>Buscar cursos, laboratorios, habilidades...</span></div>
    <div class="product-shell-topmeta"><span class="product-shell-alert">🔥 12</span><span class="product-shell-alert">♢ 3</span><a class="product-shell-profile" href="./account.html"><img src="./art/cristian-avatar.svg" alt=""><div><strong></strong><span></span></div></a></div>`;

  document.body.classList.add('with-product-shell');
  document.body.prepend(topbar);
  document.body.prepend(sidebar);
  const active = sidebar.querySelector(`[data-route="${normalized}"]`);
  if (active) active.classList.add('active');
  const profile = topbar.querySelector('.product-shell-profile');
  profile.querySelector('strong').textContent = displayName;
  profile.querySelector('span').textContent = roleLabels[user.role] || 'Academy User';
})();