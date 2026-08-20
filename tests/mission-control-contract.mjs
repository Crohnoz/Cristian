import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [dashboard, css, js, authPage, tenant, sw, manifest] = await Promise.all([
  read('dashboard.html'), read('dashboard.css'), read('dashboard.js'), read('auth.page.js'), read('tenant.config.js'), read('sw.js'), read('manifest.webmanifest')
]);

for (const label of ['Mission Control','Academy','Rutas de aprendizaje','Laboratorios','Eventos en vivo','Skill Graph','Certificaciones','Instructor Console','Usuarios & Cohortes']) {
  assert.match(dashboard, new RegExp(label.replace(/[&]/g,'&amp;|&')), `dashboard should expose ${label}`);
}
for (const section of ['Mis Cursos y Rutas','Laboratorios Destacados','TU PROGRESO SEMANAL','HABILIDADES EN DESARROLLO','LOGROS RECIENTES']) {
  assert.match(dashboard, new RegExp(section), `dashboard should expose ${section}`);
}
assert.match(dashboard, /cristian-avatar\.svg/, 'dashboard should use generic instructor avatar artwork');
assert.match(dashboard, /course-phishing\.svg/, 'dashboard should reuse course visual artwork');
assert.match(dashboard, /lesson-phishing-email\.svg/, 'dashboard should reuse visual phishing lesson artwork');
assert.match(css, /--bg:#0b111a/, 'dashboard should use eye-friendly navy background');
assert.match(css, /--purple:#8b5cf6/, 'dashboard should use restrained purple accent');
assert.match(js, /requireAuth/, 'dashboard should require an authenticated session');
assert.match(js, /role-management/, 'management navigation should be role-aware');
assert.match(authPage, /\/dashboard\.html/, 'login should allow and default to Mission Control');
assert.match(tenant, /\['dashboard\.html', \[\]\]/, 'Mission Control should be an authenticated protected route');
assert.match(tenant, /0\.6\.0-mission-control-preview/, 'tenant should identify Mission Control release');
assert.match(sw, /cca-shell-v12-mission-control/, 'PWA cache should include new Mission Control shell');
assert.match(sw, /dashboard\.html/, 'PWA cache should include dashboard assets');
assert.match(sw, /lesson-phishing-email\.svg/, 'PWA cache should include dashboard phishing artwork');
assert.match(manifest, /"start_url": "\/dashboard\.html"/, 'installed app should start at Mission Control');

console.log('✓ Mission Control redesign contracts passed');
console.log('✓ Navigation, visual shell, identity, routing and PWA entry validated');