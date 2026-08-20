import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, css, js, tenant, auth, shell, dashboard] = await Promise.all([
  read('teacher.html'), read('teacher.css'), read('teacher.js'), read('tenant.config.js'),
  read('auth.page.js'), read('product-shell.js'), read('dashboard.js')
]);

assert.match(html, /TEACHER INTRANET/i, 'Teacher Intranet identity must be explicit');
assert.match(html, /Lo importante de hoy, en orden/i, 'Teacher home must prioritize daily guidance');
assert.match(html, /Cohortes/i, 'Teacher Intranet must expose cohort workflow');
assert.match(html, /Student 360/i, 'Teacher Intranet must connect to staff learner view');
assert.match(html, /Operations Console/i, 'Advanced operations must remain reachable without replacing the friendly teacher surface');
assert.match(css, /#0b111a/i, 'Teacher surface must use unified navy product palette');
assert.match(css, /--purple:#8b5cf6/i, 'Teacher surface must use restrained purple accent');
assert.match(js, /roles:\s*\['instructor','coordinator','admin'\]/, 'Teacher Intranet must be staff-role gated');
assert.match(js, /textContent/, 'Teacher interactions must prefer safe DOM text rendering');
assert.doesNotMatch(js, /innerHTML/, 'Teacher interaction layer must not inject dynamic HTML');
assert.match(tenant, /\['teacher\.html', \['instructor', 'coordinator', 'admin'\]\]/, 'Tenant router must protect Teacher Intranet');
assert.match(tenant, /0\.12\.0-teacher-intranet-preview/, 'Tenant product version must identify Teacher Intranet milestone');
assert.match(auth, /'\/teacher\.html'/, 'Authentication allowlist must support returning to Teacher Intranet');
assert.match(shell, /Teacher Intranet/, 'Shared authenticated shell must expose Teacher Intranet to staff');
assert.match(shell, /Operations Console/, 'Shared shell must preserve advanced instructor operations');
assert.match(dashboard, /\.\/teacher\.html/, 'Mission Control must route teaching roles to Teacher Intranet');
assert.match(dashboard, /\.\/progress\.html/, 'Learner dashboard must route learner progress away from Student 360');

console.log('teacher-intranet-contract: ok');
