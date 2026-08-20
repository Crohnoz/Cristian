(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.();
  if (!session) return;
  const user = session.user || {};
  const name = user.display_name || user.username || 'Usuario Academy';
  const initials = name.trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'CA';
  const userLabel = document.getElementById('catalogUser');
  const initialsLabel = document.getElementById('catalogInitials');
  if (userLabel) userLabel.textContent = name;
  if (initialsLabel) initialsLabel.textContent = initials;
})();