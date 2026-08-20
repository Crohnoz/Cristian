import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [index, app, instructor, instructorJs, certificate, certificateJs, privacy, privacyJs, vercel, security, tenant, telemetry, analytics, manifest, sw, observability, threatModel, pathsRaw, labsRaw, eventSchemaRaw, labSchemaRaw] = await Promise.all([
  read('index.html'), read('app.js'), read('instructor.html'), read('instructor.js'),
  read('certificate.html'), read('certificate.js'), read('privacy.html'), read('privacy.js'),
  read('vercel.json'), read('SECURITY.md'), read('tenant.config.js'), read('telemetry.js'),
  read('analytics.js'), read('manifest.webmanifest'), read('sw.js'), read('docs/OBSERVABILITY.md'),
  read('docs/THREAT_MODEL.md'), read('content/learning-paths.json'), read('content/labs.json'),
  read('schemas/learning-event.schema.json'), read('schemas/lab-manifest.schema.json')
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
assert.match(privacy, /Privacy & Data/i, 'privacy control center should exist');
assert.match(privacy, /analytics\.js/, 'privacy center should load consent-aware analytics adapter');
assert.match(privacy, /Session recording/i, 'privacy center should make recording state explicit');
assert.match(privacyJs, /consent\.set\('granted'\)/, 'privacy center should support explicit analytics opt-in');
assert.match(privacyJs, /consent\.set\('denied'\)/, 'privacy center should support explicit analytics opt-out');
assert.match(privacyJs, /telemetry\?\.clear/, 'privacy center should support local data deletion');
assert.match(privacyJs, /application\/json/, 'privacy center should support local evidence export');

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
assert.match(tenant, /remoteAnalyticsDefault:\s*false/, 'remote analytics must default off');
assert.match(tenant, /consentRequired:\s*true/, 'remote analytics must require consent');
assert.match(tenant, /sessionRecording:\s*false/, 'session recording must remain disabled');
assert.match(tenant, /cca-premium-experience/, 'premium rollout flag should be declared');
assert.match(tenant, /cca-ai-mentor-live/, 'live AI mentor gate should be declared');
assert.match(tenant, /cca-cyber-range-live/, 'live range gate should be declared');
assert.doesNotMatch(tenant, /(api[_-]?key|secret|token)\s*:/i, 'tenant config must not expose secrets');

assert.match(telemetry, /localStorage/, 'telemetry should remain local in demo mode');
assert.match(telemetry, /crohnoz:telemetry/, 'telemetry should expose a local event bus');
assert.match(telemetry, /SAFE_KEYS/, 'local telemetry must filter properties');
assert.doesNotMatch(telemetry, /['"]topic['"]\s*,/, 'raw mentor topic text must not be allowlisted in telemetry');
assert.match(analytics, /CONSENT_KEY/, 'analytics adapter should maintain explicit consent state');
assert.match(analytics, /ALLOWED_EVENTS/, 'analytics adapter should allowlist event names');
assert.match(analytics, /PROPERTY_ALLOWLIST/, 'analytics adapter should allowlist properties');
assert.match(analytics, /remoteDefault:\s*false/, 'analytics adapter must keep remote provider off by default');
assert.match(analytics, /sessionRecording:\s*false/, 'analytics adapter must reject session recording by policy');
assert.match(observability, /Nunca enviar/i, 'observability contract should enumerate prohibited data');
assert.match(observability, /Session recording debe permanecer deshabilitado/i, 'observability contract should keep recording disabled');
assert.match(threatModel, /Trust boundaries/i, 'threat model should define trust boundaries');
assert.match(threatModel, /deny-egress/i, 'threat model should require range egress denial');

const learningPaths = JSON.parse(pathsRaw);
assert.ok(Array.isArray(learningPaths.paths) && learningPaths.paths.length >= 4, 'curriculum should define at least four learning paths');
assert.ok(learningPaths.paths.every(path => path.id && path.title && path.estimated_minutes > 0), 'learning paths require identity, title and duration');
assert.ok(learningPaths.paths.every(path => Array.isArray(path.skills) && path.skills.length), 'each learning path must map to skills');

const labs = JSON.parse(labsRaw);
assert.ok(Array.isArray(labs.labs) && labs.labs.length >= 3, 'range catalog should define multiple labs');
for (const lab of labs.labs) {
  assert.equal(lab.target_type, 'synthetic', `${lab.id} must use synthetic targets`);
  assert.equal(lab.network_policy, 'isolated-no-egress', `${lab.id} must deny egress`);
  assert.equal(lab.secrets, 'none', `${lab.id} must receive no secrets`);
  assert.ok(Array.isArray(lab.prohibited_capabilities) && lab.prohibited_capabilities.length, `${lab.id} must define prohibited capabilities`);
}
const gatedLabs = labs.labs.filter(lab => lab.status === 'feature-gated');
assert.ok(gatedLabs.every(lab => lab.feature_flag === 'cca-cyber-range-live'), 'live range labs must use the range rollout gate');

const eventSchema = JSON.parse(eventSchemaRaw);
const labSchema = JSON.parse(labSchemaRaw);
assert.equal(eventSchema.additionalProperties, false, 'learning event contract must reject unknown fields');
assert.equal(labSchema.additionalProperties, false, 'lab manifest contract must reject unknown fields');
assert.equal(labSchema.properties.target_type.const, 'synthetic', 'lab schema must enforce synthetic targets');
assert.equal(labSchema.properties.network_policy.const, 'isolated-no-egress', 'lab schema must enforce no-egress isolation');
assert.equal(labSchema.properties.secrets.const, 'none', 'lab schema must enforce no secrets');

const pwa = JSON.parse(manifest);
assert.equal(pwa.display, 'standalone', 'PWA should run standalone');
assert.equal(pwa.theme_color, '#07100f', 'PWA theme should match brand shell');
assert.match(sw, /caches\.open/, 'service worker should cache the application shell');
assert.match(sw, /privacy\.html/, 'service worker should cache privacy control center');
assert.match(sw, /analytics\.js/, 'service worker should cache analytics policy adapter');

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
assert.match(headerMap['content-security-policy'] || '', /object-src 'none'/, 'CSP should block plugin content');

assert.match(security, /aislad/i, 'security policy should require isolated offensive labs');
assert.match(security, /credenciales reales/i, 'security policy should prohibit real credentials');

console.log('✓ Cristian Cyber Academy premium smoke tests passed');
console.log(`✓ ${externalTrainingDomains.length} reserved training-domain references validated`);
console.log(`✓ ${learningPaths.paths.length} learning paths and ${labs.labs.length} isolated lab manifests validated`);
console.log('✓ Privacy, white-label, PWA, analytics policy, threat model and instructor evidence invariants validated');
