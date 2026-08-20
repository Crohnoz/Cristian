import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [index, app, instructor, instructorJs, certificate, certificateJs, vercel, security, tenant, telemetry, manifest, sw] = await Promise.all([
  read('index.html'), read('app.js'), read('instructor.html'), read('instructor.js'),
  read('certificate.html'), read('certificate.js'), read('vercel.json'), read('SECURITY.md'),
  read('tenant.config.js'), read('telemetry.js'), read('manifest.webmanifest'), read('sw.js')
]);

assert.match(index, /Cristian Cyber Academy/i, 'student experience should be branded');
assert.match(index, /Phishing Lab/i, 'student experience should expose phishing lab');
assert.match(index, /Cyber Range/i, 'student experience should expose cyber range');
assert.match(index, /AI Mentor/i, 'student experience should expose AI mentor');
assert.match(index, /Command Deck/i, 'premium experience should expose command deck');
assert.match(index, /Achievements/i, 'premium experience should expose achievements');
assert.match(index, /manifest\.webmanifest/, 'PWA manifest should be linked');
assert.match(index, /tenant\.config\.js/, 'tenant configuration should be loaded');
assert.match(index, /telemetry\.js/, 'Crohnoz telemetry bus should be loaded');

assert.match(instructor, /Instructor Operations/i, 'instructor operations surface should exist');
assert.match(instructor, /Export evidence/i, 'instructor should expose evidence export');
assert.match(instructor, /instructor\.js/, 'instructor telemetry script should be loaded');
assert.match(certificate, /certificate\.js/, 'certificate logic must be external for strict CSP');
assert.doesNotMatch(certificate, /<script>[^<]/i, 'certificate must not contain inline script');

assert.match(app, /localStorage/, 'learner progression should persist locally in demo mode');
assert.match(app, /phishingCorrect/, 'phishing outcomes should be tracked');
assert.match(app, /rangeCorrect/, 'range outcomes should be tracked');
assert.match(app, /certificateUnlocked/, 'certificate gate should exist');
assert.match(app, /serviceWorker/, 'learner app should register offline shell');
assert.match(app, /commandDialog/, 'command deck behavior should exist');
assert.match(app, /renderAchievements/, 'achievement engine should exist');
assert.match(instructorJs, /events/, 'instructor console should expose learning telemetry');
assert.doesNotMatch(instructorJs, /\.innerHTML\s*=/, 'instructor telemetry must not render localStorage data via innerHTML');
assert.match(instructorJs, /textContent/, 'instructor telemetry should use textContent for untrusted local state');
assert.match(instructorJs, /text\/csv/, 'instructor should export learning evidence');
assert.match(certificateJs, /readiness >= 75/, 'certificate should require readiness threshold');

assert.match(tenant, /white-label/, 'tenant config should explicitly support white-label mode');
assert.doesNotMatch(tenant, /(api[_-]?key|secret|token)\s*:/i, 'tenant config must not expose secrets');
assert.match(telemetry, /localStorage/, 'telemetry should remain local in demo mode');
assert.match(telemetry, /crohnoz:telemetry/, 'telemetry should expose a local event bus');

const pwa = JSON.parse(manifest);
assert.equal(pwa.display, 'standalone', 'PWA should run standalone');
assert.equal(pwa.theme_color, '#07100f', 'PWA theme should match brand shell');
assert.match(sw, /caches\.open/, 'service worker should cache the application shell');

const externalTrainingDomains = [...app.matchAll(/[a-z0-9.-]+\.example/gi)].map(m => m[0]);
assert.ok(externalTrainingDomains.length >= 4, 'training inbox should use reserved .example domains');
assert.ok(externalTrainingDomains.every(domain => domain.endsWith('.example')), 'all simulated external domains must remain reserved examples');

const config = JSON.parse(vercel);
const headers = config.headers?.flatMap(rule => rule.headers || []) || [];
const headerMap = Object.fromEntries(headers.map(h => [h.key.toLowerCase(), h.value]));
assert.equal(headerMap['x-content-type-options'], 'nosniff', 'nosniff should be enabled');
assert.equal(headerMap['x-frame-options'], 'DENY', 'clickjacking protection should be enabled');
assert.match(headerMap['content-security-policy'] || '', /script-src 'self'/, 'CSP should only allow first-party scripts');
assert.match(headerMap['content-security-policy'] || '', /frame-ancestors 'none'/, 'CSP should deny framing');

assert.match(security, /aislad/i, 'security policy should require isolated offensive labs');
assert.match(security, /credenciales reales/i, 'security policy should prohibit real credentials');

console.log('✓ Cristian Cyber Academy premium smoke tests passed');
console.log(`✓ ${externalTrainingDomains.length} reserved training-domain references validated`);
console.log('✓ White-label, PWA, local telemetry and instructor evidence invariants validated');
