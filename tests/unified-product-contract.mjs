import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [shellCss, shellJs, tenant, sw, instructorTheme] = await Promise.all([
  read('product-shell.css'), read('product-shell.js'), read('tenant.config.js'), read('sw.js'), read('instructor-unified.css')
]);

for (const label of ['Mission Control','Academy','Rutas de aprendizaje','Laboratorios','Eventos en vivo','Skill Graph','Certificaciones']) {
  assert.match(shellJs, new RegExp(label), `shared shell should expose ${label}`);
}
assert.match(shellJs, /cristian-avatar\.svg/, 'shared shell should reuse Cristian generic avatar');
assert.match(shellCss, /--shell-bg:#0b111a/, 'shared shell should keep the eye-friendly navy base');
assert.match(shellCss, /--shell-purple:#8b5cf6/, 'shared shell should keep restrained purple emphasis');
assert.match(tenant, /catalog\.html','course\.html','lesson\.html/, 'Academy learner surfaces should load the shared shell');
assert.match(tenant, /instructor-unified\.css/, 'Instructor Console should load the unified visual theme');
assert.match(tenant, /0\.7\.0-unified-product-preview/, 'tenant version should identify unified product release');
assert.match(sw, /cca-shell-v13-unified-product/, 'offline cache should advance for unified product');
assert.match(sw, /product-shell\.css/, 'offline cache should include shared shell CSS');
assert.match(sw, /product-shell\.js/, 'offline cache should include shared shell JS');
assert.match(sw, /instructor-unified\.css/, 'offline cache should include instructor harmonization');
assert.match(instructorTheme, /cristian-avatar\.svg/, 'Instructor Console should use the generic Cristian avatar');

console.log('✓ Unified product shell contracts passed');
console.log('✓ Mission Control, Academy, Course, Lesson and Instructor visual language aligned');