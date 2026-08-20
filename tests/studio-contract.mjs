import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('studio.html', 'utf8');
const css = fs.readFileSync('studio.css', 'utf8');
const js = fs.readFileSync('studio.js', 'utf8');
const instructor = fs.readFileSync('instructor.js', 'utf8');
const tenant = fs.readFileSync('tenant.config.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

assert.match(html, /Course Studio/);
assert.match(html, /id="courseList"/);
assert.match(html, /id="moduleList"/);
assert.match(html, /id="lessonList"/);
assert.match(html, /id="previewOutline"/);
assert.match(html, /id="loadCore"/);
assert.match(html, /id="syncCourse"/);
assert.match(html, /id="submitReview"/);
assert.match(html, /telemetry\.js/);
assert.match(html, /tenant\.config\.js/);
assert.doesNotMatch(html, /<script[^>]+academy-core\.adapter\.js/);
assert.doesNotMatch(html, /<script[^>]+auth\.session\.js/);
assert.doesNotMatch(html, /<script[^>]+studio\.js/);

assert.match(tenant, /\['studio\.html',\s*\['author',\s*'coordinator',\s*'admin'\]\]/);
assert.match(tenant, /if \(file === 'studio\.html'\) \{\s*await import\('\.\/studio\.js'\);/s, 'Studio must execute only after central auth bootstrap');
assert.match(tenant, /contentTenantScoped:\s*false/, 'Remote content synchronization must remain release-gated by tenant scoping');

assert.match(js, /requireAuth\(\{ roles: \['author', 'coordinator', 'admin'\]/);
assert.match(js, /contentTenantScoped\s*=\s*window\.CCA_CONFIG\?\.academyCore\?\.contentTenantScoped\s*===\s*true/);
assert.match(js, /remoteEnabled\s*=\s*Boolean\(contentTenantScoped\s*&&\s*core\?\.enabled/, 'Remote writes must require the server tenant-scope gate');
assert.match(js, /cca:content-studio:v1:/);
assert.match(js, /function createCourse\(/);
assert.match(js, /function addModule\(/);
assert.match(js, /function addLesson\(/);
assert.match(js, /function renderPreview\(/);
assert.match(js, /function syncSelectedCourse\(/);
assert.match(js, /function loadFromCore\(/);
assert.match(js, /function submitForReview\(/);
assert.match(js, /createStudioCourse/);
assert.match(js, /createStudioModule/);
assert.match(js, /createStudioLesson/);
assert.match(js, /transitionStudioCourse\(course\.remoteId, 'review'\)/);
assert.match(js, /localStorage\.setItem\(STORAGE_KEY/);
assert.doesNotMatch(js, /transitionStudioCourse\([^\n]+['"]published['"]/, 'Studio must not publish directly');
assert.doesNotMatch(js, /transitionStudioCourse\([^\n]+['"]approved['"]/, 'Studio must not self-approve content');
assert.doesNotMatch(js, /\.insertAdjacentHTML\(/);
assert.doesNotMatch(js, /document\.write\(/);

assert.match(instructor, /contentStudioLink/);
assert.match(instructor, /\.\/studio\.html/);
assert.match(sw, /\/studio\.html/);
assert.match(sw, /\/studio\.css/);
assert.match(sw, /\/studio\.js/);

assert.match(css, /\.studio-shell/);
assert.match(css, /@media\(max-width:640px\)/);

console.log('Content Studio contract: OK');
