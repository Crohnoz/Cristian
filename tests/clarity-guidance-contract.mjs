import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const css = read('clarity-ui.css');
const js = read('clarity-ui.js');
const config = read('tenant.config.js');
const sw = read('sw.js');

assert.match(css,/\.clarity-focus/,'dashboard focus strip is styled');
assert.match(css,/\.clarity-contextbar/,'context breadcrumbs are styled');
assert.match(css,/lesson-focus/,'lesson focus mode is styled');
assert.match(js,/CONTINUAR DONDE QUEDASTE/,'dashboard exposes a clear next action');
assert.match(js,/PRÓXIMO EN TU AGENDA/,'dashboard exposes upcoming agenda');
assert.match(js,/clarity-breadcrumbs/,'product pages receive breadcrumbs');
assert.match(js,/Modo foco/,'lesson exposes focus mode');
assert.match(js,/createElement/,'clarity layer uses DOM APIs');
assert.doesNotMatch(js,/innerHTML\s*=/,'clarity layer does not render with innerHTML');
assert.match(config,/clarity-ui\.css/,'clarity stylesheet is loaded by tenant bootstrap');
assert.match(config,/clarity-ui\.js/,'clarity behavior is loaded by tenant bootstrap');
assert.match(sw,/clarity-ui\.css/,'clarity stylesheet is cached by PWA');
assert.match(sw,/clarity-ui\.js/,'clarity behavior is cached by PWA');
console.log('clarity-guidance-contract: ok');
