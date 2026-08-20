import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [index, app, instructor, instructorJs, certificate, certificateJs, vercel, security] = await Promise.all([
  read('index.html'), read('app.js'), read('instructor.html'), read('instructor.js'),
  read('certificate.html'), read('certificate.js'), read('vercel.json'), read('SECURITY.md')
]);

assert.match(index, /Cristian Cyber Academy/i, 'student experience should be branded');
assert.match(index, /Phishing Lab/i, 'student experience should expose phishing lab');
assert.match(index, /Cyber Range/i, 'student experience should expose cyber range');
assert.match(index, /AI Mentor/i, 'student experience should expose AI mentor');
assert.match(instructor, /Instructor Console/i, 'instructor route should exist');
assert.match(instructor, /instructor\.js/, 'instructor telemetry script should be loaded');
assert.match(certificate, /certificate\.js/, 'certificate logic must be external for strict CSP');
assert.doesNotMatch(certificate, /<script>[^<]/i, 'certificate must not contain inline script');

assert.match(app, /localStorage/, 'learner progression should persist locally in demo mode');
assert.match(app, /phishingCorrect/, 'phishing outcomes should be tracked');
assert.match(app, /rangeCorrect/, 'range outcomes should be tracked');
assert.match(app, /certificateUnlocked/, 'certificate gate should exist');
assert.match(instructorJs, /events/, 'instructor console should expose learning telemetry');
assert.doesNotMatch(instructorJs, /\.innerHTML\s*=/, 'instructor telemetry must not render localStorage data via innerHTML');
assert.match(instructorJs, /textContent/, 'instructor telemetry should use textContent for untrusted local state');
assert.match(certificateJs, /readiness >= 75/, 'certificate should require readiness threshold');

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

console.log('✓ Cristian Cyber Academy smoke tests passed');
console.log(`✓ ${externalTrainingDomains.length} reserved training-domain references validated`);
console.log('✓ Instructor telemetry avoids data-driven innerHTML');
