import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

const required = [
  'showcase.html','showcase.css','showcase-premium.css','auth.html','auth.css','auth.page.js','auth.session.js',
  'onboarding.html','onboarding.css','onboarding.js','dashboard.html','dashboard.css','dashboard.js',
  'catalog.html','catalog.css','catalog.js','course.html','course.css','course.js','lesson.html','lesson.css','lesson.js',
  'progress.html','progress.css','progress.js','certificate.html','certificate.js',
  'teacher.html','teacher.css','teacher.js','instructor.html','instructor.css','instructor.js','instructor-unified.css',
  'users.html','users.css','users.js','student.html','student.css','student.js','account.html','account.js',
  'privacy.html','privacy.js','studio.html','studio.css','studio.js','tenant.config.js','academy-core.adapter.js',
  'product-shell.js','premium-ui.js','clarity-ui.js','privacy-hardening.js','telemetry.js','sw.js','manifest.webmanifest',
  'vercel.json','brand.svg','art/cristian-avatar.svg','art/course-phishing.svg','art/course-web-security.svg',
  'art/course-soc.svg','art/course-cloud-identity.svg','art/lesson-phishing-email.svg','art/lesson-live-class.svg',
  'art/lesson-video-replay.svg','art/lesson-lab-workspace.svg','art/lesson-quiz-signals.svg'
];
required.forEach(file => assert.ok(exists(file), `missing required v1 runtime file: ${file}`));

const tenant = read('tenant.config.js');
const auth = read('auth.page.js');
const showcase = read('showcase.html');
const dashboard = read('dashboard.html');
const shell = read('product-shell.js');
const premium = read('premium-ui.js');
const certificate = read('certificate.html');
const certificateJs = read('certificate.js');
const privacyHardening = read('privacy-hardening.js');
const sw = read('sw.js');
const vercel = read('vercel.json');

assert.match(tenant, /version:\s*'1\.0\.0-rc\.1'/, 'v1 release candidate version missing');
for (const gate of [
  "['onboarding.html', ['learner']]",
  "['teacher.html', ['instructor', 'coordinator', 'admin']]",
  "['users.html', ['coordinator', 'admin']]",
  "['student.html', ['coordinator', 'admin']]",
  "['certificate.html', []]",
  "['account.html', []]",
  "['privacy.html', []]"
]) assert.ok(tenant.includes(gate), `missing RBAC gate: ${gate}`);

assert.match(auth, /cca:onboarding:v1/, 'learner onboarding routing missing');
assert.match(auth, /return '\/onboarding\.html'/, 'first learner session must enter onboarding');
assert.match(auth, /return '\/teacher\.html'/, 'teaching roles must land in Teacher Intranet');
assert.match(showcase, /DEMO PÚBLICA|demo pública/i, 'public showcase must identify public demo intent');
assert.doesNotMatch(showcase, /auth\.session\.js|users\.js|student\.js|instructor\.js|teacher\.js/, 'public showcase loads private operations code');
assert.match(dashboard, /\.\/progress\.html/, 'learner progress route missing');
assert.match(dashboard, /\.\/teacher\.html/, 'Teacher Intranet route missing from management navigation');
assert.doesNotMatch(dashboard, /\?type=(?:live|lab|simulation|checkpoint)/, 'legacy lesson routing remains in dashboard');
assert.doesNotMatch(dashboard, /nmap\s+-/, 'public learner dashboard should not display operational command snippets');
assert.match(shell, /Teacher Intranet/, 'shared shell must expose Teacher Intranet');
assert.match(shell, /Operations Console/, 'shared shell must preserve advanced Operations Console');
assert.doesNotMatch(premium, /\.\/student\.html[^\n]*Progreso|Progreso[^\n]*\.\/student\.html/, 'premium learner navigation must not use Student 360');
assert.match(certificate, /tenant\.config\.js/, 'certificate authentication bootstrap missing');
assert.doesNotMatch(certificateJs, /innerHTML/, 'certificate dynamic rendering must avoid innerHTML');
assert.match(privacyHardening, /topic_category/, 'mentor event must be reduced to a category');
assert.match(privacyHardening, /mentor_question/, 'mentor privacy migration missing');
assert.doesNotMatch(vercel, /rawgit|githack|raw\.githubusercontent|jsdelivr/i, 'production depends on external raw-code proxy');
assert.match(vercel, /Content-Security-Policy/, 'CSP header missing');
assert.match(vercel, /X-Content-Type-Options/, 'nosniff header missing');
assert.match(sw, /cca-shell-v20-v1-release-candidate/, 'v1 service worker namespace missing');
for (const file of ['onboarding.html','teacher.html','privacy-hardening.js','certificate.html']) {
  assert.ok(sw.includes(`/${file}`), `service worker missing ${file}`);
}

const htmlFiles = required.filter(file => file.endsWith('.html'));
for (const htmlFile of htmlFiles) {
  const html = read(htmlFile);
  const refs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(match => match[1]);
  for (const ref of refs) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(ref)) continue;
    const clean = ref.replace(/^\.\//,'').replace(/^\//,'').split(/[?#]/)[0];
    if (!clean || !/\.[a-z0-9]+$/i.test(clean)) continue;
    assert.ok(exists(clean), `${htmlFile} references missing local asset ${clean}`);
  }
}

const swFiles = [...sw.matchAll(/'\/(.+?)'/g)].map(match => match[1]).filter(value => /\.[a-z0-9]+$/i.test(value));
swFiles.forEach(file => assert.ok(exists(file), `service worker precache references missing file: ${file}`));

const scanFiles = required.filter(file => /\.(?:html|css|js|json|webmanifest)$/i.test(file));
for (const file of scanFiles) {
  const source = read(file);
  assert.doesNotMatch(source, /rawgit|githack|raw\.githubusercontent\.com/i, `${file} contains forbidden raw-code proxy`);
  assert.doesNotMatch(source, /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|sk-proj-[A-Za-z0-9_-]{20,}/, `${file} appears to contain a secret`);
}

console.log(`v1 E2E release gate: OK (${required.length} runtime files checked)`);