(() => {
  const session = window.CCAAuth?.current?.();
  if (!session?.authenticated) return;
  document.querySelectorAll('.progress-track i,.skills i b').forEach(bar => {
    const target = bar.style.width;
    if (!target) return;
    bar.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = target; }));
  });
})();
