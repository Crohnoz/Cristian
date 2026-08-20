import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, css, tenant, roles] = await Promise.all([
  read('showcase.html'),
  read('showcase.css'),
  read('tenant.config.js'),
  read('docs/PLATFORM_ROLES.md')
]);

assert.match(html, /Demo pública/, 'showcase should identify itself as a public demo');
assert.match(html, /Ingresar al campus/, 'showcase should separate public discovery from authenticated campus');
assert.match(html, /course-phishing\.svg/, 'showcase should display visual course artwork');
assert.match(html, /lesson-video-replay\.svg/, 'showcase should display mixed learning formats');
assert.match(html, /lesson-live-class\.svg/, 'showcase should display live learning format');
assert.match(html, /lesson-phishing-inbox\.svg/, 'showcase should use synthetic awareness visual');
assert.match(html, /lesson-lab-workspace\.svg/, 'showcase should display safe lab format');
assert.doesNotMatch(html, /auth\.session\.js/, 'public showcase must not require Academy authentication bootstrap');
assert.doesNotMatch(html, /student\.js|users\.js|instructor\.js/, 'public showcase must not load private staff or learner operations');
assert.match(css, /--bg:#0b111a/, 'public showcase should use the unified eye-friendly navy palette');
assert.match(tenant, /0\.7\.1-public-showcase-preview/, 'tenant metadata should identify public showcase release');
assert.match(roles, /Public Site \/ Showcase/, 'role architecture should define public surface');
assert.match(roles, /Student Campus/, 'role architecture should define student intranet');
assert.match(roles, /Teacher \/ Operations Intranet/, 'role architecture should define staff intranet');

console.log('✓ Public showcase contracts passed');
console.log('✓ Public/private boundary, visual formats and role topology validated');
