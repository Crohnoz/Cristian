import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [catalog, catalogCss, course, courseCss, courseJs, lesson, lessonCss, lessonJs, sw, tenant, authPage] = await Promise.all([
  read('catalog.html'), read('catalog.css'), read('course.html'), read('course.css'), read('course.js'),
  read('lesson.html'), read('lesson.css'), read('lesson.js'), read('sw.js'), read('tenant.config.js'), read('auth.page.js')
]);

for (const asset of ['course-phishing.svg','course-web-security.svg','course-soc.svg','course-cloud-identity.svg']) {
  assert.match(catalog, new RegExp(asset.replace('.', '\\.')), `catalog should render ${asset}`);
  assert.match(sw, new RegExp(asset.replace('.', '\\.')), `offline shell should cache ${asset}`);
}

for (const asset of ['lesson-phishing-inbox.svg','lesson-live-class.svg','lesson-video-replay.svg','lesson-lab-workspace.svg','lesson-quiz-signals.svg']) {
  assert.match(course + catalog + lessonJs, new RegExp(asset.replace('.', '\\.')), `immersive Academy should render ${asset}`);
  assert.match(sw, new RegExp(asset.replace('.', '\\.')), `offline shell should cache ${asset}`);
}

assert.match(catalog, /DEMO POBLADA/, 'visual catalog should clearly identify populated demo content');
assert.match(catalog, /Así se vive una semana/, 'catalog should preview mixed learning formats');
assert.match(catalog, /Clase sincrónica/, 'catalog should show synchronous teaching');
assert.match(catalog, /Clase grabada/, 'catalog should show asynchronous video');
assert.match(catalog, /Practice workspace/, 'catalog should show labs');
assert.match(course, /SEMANA 02 · EXPERIENCIA MIXTA/, 'course should show a full mixed-format week');
assert.match(course, /Knowledge check/, 'course should include a visual checkpoint');
assert.match(course, /data-lesson-mode="video"/, 'course media should open dedicated lesson demos');
assert.match(courseJs, /showAwareness/, 'course should adapt awareness media by course type');
assert.match(courseJs, /encodeURIComponent\(key\)/, 'lesson links should preserve course context');
assert.match(lesson, /formatNav/, 'lesson workspace should expose all learning formats');
assert.match(lessonJs, /video:/, 'lesson workspace should support asynchronous video');
assert.match(lessonJs, /live:/, 'lesson workspace should support live teaching');
assert.match(lessonJs, /awareness:/, 'lesson workspace should support awareness simulation');
assert.match(lessonJs, /lab:/, 'lesson workspace should support lab mode');
assert.match(lessonJs, /quiz:/, 'lesson workspace should support checkpoint mode');
assert.match(lessonJs, /textContent/, 'lesson rendering should use safe DOM text rendering');
assert.doesNotMatch(lessonJs, /\.innerHTML\s*=/, 'lesson dynamic content should avoid innerHTML');
assert.match(catalogCss, /--bg:#111715/, 'catalog should use the softer long-session palette');
assert.match(courseCss, /--bg:#111715/, 'course should use the softer long-session palette');
assert.match(lessonCss, /--bg:#111715/, 'lesson workspace should use the softer long-session palette');
assert.match(tenant, /0\.5\.0-immersive-learning-preview/, 'tenant should expose immersive learning preview version');
assert.match(tenant, /rawFile\.includes/, 'route bootstrap should normalize Vercel clean URLs');
assert.match(authPage, /'\/lesson'/, 'login safe-next allowlist should include clean lesson route');
assert.match(sw, /\/lesson\.html/, 'offline shell should cache lesson workspace');
assert.match(sw, /cca-shell-v11-lesson-showcase/, 'offline shell should advance for lesson showcase');

console.log('✓ Immersive Visual Academy contracts passed');
console.log('✓ Mixed-format week, navigable lesson demos, calm palette and safe rendering validated');