(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.({ roles: ['instructor', 'coordinator', 'admin'] });
  if (!session) return;

  const user = session.user || {};
  const displayName = user.display_name || user.username || 'Cristian';
  const firstName = displayName.trim().split(/\s+/)[0] || 'Cristian';
  const roleLabels = { instructor:'Cybersecurity Instructor', coordinator:'Academy Coordinator', admin:'Academy Administrator' };
  document.getElementById('teacherName').textContent = displayName;
  document.getElementById('teacherFirstName').textContent = firstName;
  document.getElementById('teacherRole').textContent = roleLabels[user.role] || 'Instructor';
  if (!['coordinator','admin'].includes(user.role)) document.getElementById('usersLink')?.remove();

  const toast = document.getElementById('teacherToast');
  let toastTimer;
  const showToast = message => {
    toast.textContent = String(message).slice(0, 140);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  document.getElementById('quickSearch')?.addEventListener('click', () => {
    const target = prompt('Buscar en Teacher Intranet: estudiantes, cohortes o contenido');
    if (!target) return;
    const q = target.toLowerCase();
    const id = q.includes('cohort') ? 'cohorts' : q.includes('conten') ? 'content' : q.includes('insight') || q.includes('brecha') ? 'insights' : 'students';
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('.student-card button').forEach(button => button.addEventListener('click', () => {
    showToast(`${button.dataset.student}: abriendo Student 360`);
    setTimeout(() => { location.href = './student.html'; }, 350);
  }));
  document.getElementById('assignRecommendation')?.addEventListener('click', () => showToast('API Security · Authorization asignado a AppSec Foundations'));
  document.getElementById('cohortAction')?.addEventListener('click', () => {
    if (['coordinator','admin'].includes(user.role)) location.href = './users.html';
    else showToast('La gestión de cohortes requiere rol coordinator o admin.');
  });

  const navLinks = [...document.querySelectorAll('.teacher-nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${active.target.id}`));
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0,.15,.4] });
    document.querySelectorAll('.teacher-content [id]').forEach(section => observer.observe(section));
  }
})();