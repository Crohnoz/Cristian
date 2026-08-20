import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [catalog, catalogCss, course, courseCss, courseJs, sw, tenant, authPage] = await Promise.all([
  read('catalog.html'), read('catalog.css'), read('course.html'), read('course.css'), read('course.js'), read('sw.js'), read('tenant.config.js'), read('auth.page.js')
]);

for (const asset of ['course-phishing.svg','course-web-security.svg','course-soc.svg','course-cloud-identity.svg']) {
  assert.match(catalog, new RegExp(asset.replace('.', '\\.')), `catalog should render ${asset}`);
  assert.match(sw, new RegExp(asset.replace('.', '\\.')), `offline shell should cache ${asset}`);
}

for (const asset of ['lesson-phishing-inbox.svg','lesson-live-class.svg','lesson-video-replay.svg','lesson-lab-workspace.svg','lesson-quiz-signals.svg']) {
  assert.match(course + catalog, new RegExp(asset.replace('.', '\\.')), `immersive Academy should render ${asset}`);
  assert.match(sw, new RegExp(asset.replace('.', '\\.')), `offline shell should cache ${asset}`);
}

assert.match(catalog, /DEMO POBLADA/, 'visual catalog should clearly identify populated demo content');
assert.match(catalog, /Así se vive una semana/, 'catalog should preview mixed learning formats');
assert.match(catalog, /Clase sincrónica/, 'catalog should show synchronous teaching');
assert.match(catalog, /Clase grabada/, 'catalog should show asynchronous video');
assert.match(catalog, /Practice workspace/, 'catalog should show labs');
assert.match(course, /SEMANA 02 · EXPERIENCIA MIXTA/, 'course should show a full mixed-format week');
assert.match(course, /Knowledge check/, 'course should include a visual checkpoint');
assert.match(course, /ASINCRÓNICO \+ LIVE \+ PRÁCTICA/, 'course should explain learning format mix');
assert.match(courseJs, /showAwareness/, 'course should adapt awareness media by course type');
assert.match(courseJs, /textContent/, 'course rendering should prefer safe DOM text rendering');
assert.doesNotMatch(courseJs, /\.innerHTML\s*=/, 'course population should not render dynamic content with innerHTML');
assert.match(catalogCss, /--bg:#111715/, 'catalog should use the softer long-session palette');
assert.match(courseCss, /--bg:#111715/, 'course should use the softer long-session palette');
assert.match(tenant, /0\.5\.0-immersive-learning-preview/, 'tenant should expose immersive learning preview version');
assert.match(tenant, /catalog\.html/, 'Mission Control should route Academy to the visual catalog');
assert.match(authPage, /\/catalog\.html/, 'login safe-next allowlist should include visual catalog');
assert.match(authPage, /\/course\.html/, 'login safe-next allowlist should include course detail');
assert.match(sw, /cca-shell-v10-immersive-learning/, 'offline shell should advance for immersive media');

console.log('✓ Immersive Visual Academy contracts passed');
console.log('✓ Mixed-format week, media assets, calm palette and safe rendering validated');