(() => {
  const redirectLegacyMentor = () => {
    if (location.hash === '#mentor') location.replace(`${location.pathname}${location.search}#academy`);
  };

  function stripAiSurface() {
    document.querySelectorAll('.nav-item[data-view="mentor"], [data-command="mentor"], #mentor').forEach(node => node.remove());

    document.querySelectorAll('[data-jump="mentor"]').forEach(button => {
      button.dataset.jump = 'range';
      button.textContent = 'Ver contenido práctico';
    });

    const achievements = document.getElementById('achievementGrid');
    if (achievements) {
      const prune = () => {
        [...achievements.children].forEach(card => {
          if ((card.textContent || '').includes('Mentor Curious')) card.remove();
        });
      };
      prune();
      new MutationObserver(prune).observe(achievements, { childList: true });
    }
  }

  redirectLegacyMentor();
  window.addEventListener('hashchange', redirectLegacyMentor);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stripAiSurface, { once: true });
  } else {
    stripAiSurface();
  }
})();
