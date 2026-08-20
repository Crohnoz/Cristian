(() => {
  const ensureStyle = (href, key) => {
    if (document.querySelector(`link[data-${key}]`)) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = href;
    style.dataset[key] = 'true';
    document.head.appendChild(style);
  };
  ensureStyle('./premium-ui.css', 'premiumUi');
  ensureStyle('./premium-layout.css', 'premiumLayout');

  const loadPremium = () => {
    if (document.querySelector('script[data-premium-ui]')) return;
    const script = document.createElement('script');
    script.src = './premium-ui.js';
    script.defer = true;
    script.dataset.premiumUi = 'true';
    document.body.appendChild(script);
  };

  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.();
  if (!session) return;

  const user = session.user || {};
  const displayName = user.display_name || user.username || 'Usuario Academy';
  const firstName = displayName.trim().split(/\s+/)[0] || 'Usuario';
  const roleLabels = {
    learner:'Security Apprentice', instructor:'Cybersecurity Instructor', coordinator:'Academy Coordinator',
    admin:'Academy Administrator', author:'Content Author', reviewer:'Content Reviewer'
  };

  const topName = document.getElementById('topName');
  const topRole = document.getElementById('topRole');
  const welcomeName = document.getElementById('welcomeName');
  if (topName) topName.textContent = displayName;
  if (topRole) topRole.textContent = roleLabels[user.role] || 'Academy User';
  if (welcomeName) welcomeName.textContent = firstName;

  if (['instructor','coordinator','admin'].includes(user.role)) document.body.classList.add('role-management');

  const todayLabel = document.getElementById('todayLabel');
  const timeLabel = document.getElementById('timeLabel');
  const renderClock = () => {
    const now = new Date();
    if (todayLabel) todayLabel.textContent = new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(now);
    if (timeLabel) timeLabel.textContent = new Intl.DateTimeFormat('es-CL',{hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  };
  renderClock();
  setInterval(renderClock, 60_000);

  document.getElementById('logoutButton')?.addEventListener('click', async () => {
    try { await auth.logout(); } finally { location.replace('./auth.html'); }
  });

  const search = document.querySelector('.search input');
  const goSearch = () => {
    const query = (search?.value || '').trim().toLowerCase();
    if (!query) return;
    if (query.includes('phish')) location.href = './course.html?course=phishing';
    else if (query.includes('web') || query.includes('owasp')) location.href = './course.html?course=web';
    else if (query.includes('soc') || query.includes('incident')) location.href = './course.html?course=soc';
    else if (query.includes('cloud') || query.includes('identity')) location.href = './course.html?course=cloud';
    else if (query.includes('lab')) location.href = './index.html#range';
    else location.href = './catalog.html';
  };
  search?.addEventListener('keydown', event => { if (event.key === 'Enter') goSearch(); });

  loadPremium();
})();