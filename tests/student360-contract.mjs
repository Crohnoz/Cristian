import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, js, authPage, tenant, netlify, sw, users] = await Promise.all([
  read('student.html'), read('student.js'), read('auth.page.js'), read('tenant.config.js'),
  read('netlify.toml'), read('sw.js'), read('users.html')
]);

assert.match(html, /Student 360/i, 'learner intelligence workspace should exist');
assert.match(html, /CYBER SKILL GRAPH/, 'Student 360 should expose cyber competency posture');
assert.match(html, /ACADEMIC JOURNEY/, 'Student 360 should expose academic journey');
assert.match(html, /CERTIFICATION EVIDENCE/, 'Student 360 should expose certification evidence');
assert.match(html, /DATA BOUNDARY/, 'Student 360 should state its privacy boundary');
assert.doesNotMatch(html, /type="password"/i, 'Student 360 must never expose password controls');

assert.match(js, /requireAuth\(\{ permission: 'manage_users'/, 'Student 360 should require identity-management permission');
assert.match(js, /core\.opsProfiles\(\)/, 'remote mode should use Academy Core managed profiles');
assert.match(js, /core\.opsEnrollments\(\)/, 'remote mode should use Academy Core enrollments');
assert.match(js, /core\.opsCertificates\(\)/, 'remote mode should use Academy Core certificates');
assert.match(js, /core\.opsAuditEvents\(\)/, 'remote mode should use Academy Core audit evidence');
assert.match(js, /isRemote \? null : previewSkills/, 'remote mode must not fabricate cyber skill scores');
assert.match(js, /PENDING CYBER DATA/, 'missing remote cyber signal should be explicit');
assert.match(js, /PREVIEW SYNTHETIC/, 'preview skill signal must be clearly labelled synthetic');
assert.doesNotMatch(js, /\.innerHTML\s*=/, 'Student 360 must render data without innerHTML assignment');
assert.match(js, /no se creó una asignación ficticia/i, 'remote mode should not fake assignment persistence');

assert.match(authPage, /\/student\.html/, 'login allowlist should include Student 360');
assert.match(authPage, /requested\.startsWith\('\/student\.html'\)/, 'Student 360 return routing should enforce management roles');
assert.match(tenant, /0\.3\.3-learner-intelligence-preview/, 'tenant version should identify learner intelligence release');
assert.match(tenant, /\['student\.html', \['coordinator', 'admin'\]\]/, 'bootstrap should gate Student 360 to coordinator/admin');
assert.match(netlify, /from = "\/student"[\s\S]*to = "\/student\.html"/, 'Netlify should expose clean /student route');
assert.match(sw, /cca-shell-v8/, 'PWA cache version should advance');
assert.match(sw, /student\.html/, 'PWA should cache Student 360');
assert.match(users, /href="\.\/student\.html"/, 'Identity Operations should link to Student 360');

console.log('✓ Student 360 learner-intelligence contracts passed');
console.log('✓ Remote no-fabrication, role gating, privacy and routing invariants validated');