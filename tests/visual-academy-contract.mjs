import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [catalog, catalogCss, course, courseJs, sw, tenant, authPage] = await Promise.all([
  read('catalog.html'), read('catalog.css'), read('course.html'), read('course.js'), read('sw.js'), read('tenant.config.js'), read('auth.page.js')
]);

for (const asset of ['course-phishing.svg','course-web-security.svg','course-soc.svg','course-cloud-identity.svg']) {
  assert.match(catalog, new RegExp(asset.replace('.', '\\.')), `catalog should render ${asset}`);
  assert.match(sw, new RegExp(asset.replace('.', '\\.')), `offline shell should cache ${asset}`);
}

assert.match(catalog, /DEMO POBLADA/, 'visual catalog should clearly identify populated demo content');
assert.match(catalog, /Cyber Defender/, 'catalog should expose a visual learning path');
assert.match(catalog, /Phishing Defense/, 'catalog should include phishing course');
assert.match(catalog, /Web Application Security/, 'catalog should include AppSec course');
assert.match(catalog, /SOC &amp; Incident Response/, 'catalog should include SOC course');
assert.match(catalog, /Cloud &amp; Identity Security/, 'catalog should include cloud identity course');
assert.match(catalogCss, /course-grid/, 'catalog should use a visual course grid');
assert.match(catalogCss, /hero-stack/, 'catalog should use visual stacked artwork in the hero');
assert.match(course, /4 etapas\. Cero relleno\./, 'course detail should emphasize a short visual journey');
assert.match(course, /PRACTICE LANE/, 'course detail should expose visual practice cards');
assert.match(courseJs, /const courses =/, 'course detail should be populated from a reusable course model');
assert.match(courseJs, /textContent/, 'course rendering should prefer safe DOM text rendering');
assert.doesNotMatch(courseJs, /\.innerHTML\s*=/, 'course population should not render dynamic content with innerHTML');
assert.match(tenant, /catalog\.html/, 'Mission Control should route Academy to the visual catalog');
assert.match(authPage, /\/catalog\.html/, 'login safe-next allowlist should include visual catalog');
assert.match(authPage, /\/course\.html/, 'login safe-next allowlist should include course detail');
assert.match(sw, /cca-shell-v9-visual-academy/, 'offline shell should advance for visual academy assets');

console.log('✓ Visual Academy catalog contracts passed');
console.log('✓ Four populated courses, artwork, navigation, journey and safe rendering validated');