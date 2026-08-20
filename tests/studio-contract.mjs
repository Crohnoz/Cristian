import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('studio.html', 'utf8');
const css = fs.readFileSync('studio.css', 'utf8');
const js = fs.readFileSync('studio.js', 'utf8');
const instructor = fs.readFileSync('instructor.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

assert.match(html, /Course Studio/);
assert.match(html, /id="courseList"/);
assert.match(html, /id="moduleList"/);
assert.match(html, /id="lessonList"/);
assert.match(html, /id="previewOutline"/);
assert.match(html, /academy-core\.adapter\.js/);
assert.match(html, /auth\.session\.js/);

assert.match(js, /requireAuth\(\{ roles: \['author', 'coordinator', 'admin'\]/);
assert.match(js, /cca:content-studio:v1:/);
assert.match(js, /function createCourse\(/);
assert.match(js, /function addModule\(/);
assert.match(js, /function addLesson\(/);
assert.match(js, /function renderPreview\(/);
assert.match(js, /localStorage\.setItem\(STORAGE_KEY/);
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
