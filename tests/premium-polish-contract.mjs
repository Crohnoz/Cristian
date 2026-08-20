import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [uiCss, layoutCss, uiJs, dashboardJs, tenant, sw] = await Promise.all([
  read('premium-ui.css'),
  read('premium-layout.css'),
  read('premium-ui.js'),
  read('dashboard.js'),
  read('tenant.config.js'),
  read('sw.js')
]);

assert.match(uiCss, /focus-visible/, 'premium layer should expose keyboard focus states');
assert.match(uiCss, /prefers-reduced-motion:reduce/, 'premium layer should respect reduced-motion preferences');
assert.match(uiCss, /premium-command/, 'premium layer should style the command palette');
assert.match(uiCss, /premium-mobile-dock/, 'premium layer should include real mobile navigation');
assert.match(layoutCss, /font-size:27px/, 'Mission Control should use a more premium headline scale');
assert.match(layoutCss, /grid-template-columns:244px/, 'desktop navigation should gain breathing room');
assert.match(layoutCss, /product-shell-sidebar/, 'shared campus shell should receive premium proportions');
assert.match(uiJs, /IntersectionObserver/, 'premium layer should reveal content progressively');
assert.match(uiJs, /premium-x/, 'premium cards should support pointer-reactive surface lighting');
assert.match(uiJs, /premium-command/, 'premium layer should create a command palette');
assert.match(uiJs, /premium-mobile-dock/, 'premium layer should create mobile navigation');
assert.doesNotMatch(uiJs, /innerHTML\s*=/, 'premium interaction layer should avoid innerHTML writes');
assert.match(dashboardJs, /premium-layout\.css/, 'Mission Control should load premium layout rules');
assert.match(tenant, /0\.8\.0-premium-polish-preview/, 'tenant should identify premium polish release');
assert.match(tenant, /premium-layout\.css/, 'authenticated campus should load premium layout');
assert.match(sw, /cca-shell-v14-premium-polish/, 'PWA shell should advance for premium release');
assert.match(sw, /premium-ui\.css/, 'PWA should cache premium visual layer');
assert.match(sw, /premium-ui\.js/, 'PWA should cache premium interaction layer');

console.log('✓ Premium polish contracts passed');
console.log('✓ Responsive navigation, accessibility, motion and interaction contracts validated');