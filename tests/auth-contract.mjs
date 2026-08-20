import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [authHtml, authPage, authSession, accountHtml, accountJs, resetHtml, resetJs, adapter, tenant, sw, netlify] = await Promise.all([
  read('auth.html'), read('auth.page.js'), read('auth.session.js'), read('account.html'), read('account.js'),
  read('reset-password.html'), read('reset-password.js'), read('academy-core.adapter.js'), read('tenant.config.js'),
  read('sw.js'), read('netlify.toml')
]);

assert.match(authHtml, /Ingresar al campus/i, 'login portal should exist');
assert.match(authHtml, /Recuperar acceso/i, 'recovery request surface should exist');
assert.match(authHtml, /autocomplete="username"/, 'username autocomplete should be explicit');
assert.match(authHtml, /autocomplete="current-password"/, 'password autocomplete should be explicit');
assert.match(authPage, /auth\.login/, 'login surface should use the shared session adapter');
assert.match(authPage, /requestPasswordReset/, 'recovery surface should call the recovery adapter');

assert.match(authSession, /sessionStorage/, 'authenticated session should use browser session storage');
assert.match(authSession, /roles\.includes/, 'role-aware authorization should be enforced');
assert.match(authSession, /old_password:\s*current_password/, 'password change payload should match Academy Core contract');
assert.doesNotMatch(authSession, /localStorage\.setItem\([^\n]*password/i, 'passwords must not be persisted to localStorage');

assert.match(accountHtml, /Información de la cuenta/i, 'account profile panel should exist');
assert.match(accountHtml, /Contraseña y acceso/i, 'account security panel should exist');
assert.match(accountHtml, /Segundo factor/i, 'MFA posture should be visible');
assert.match(accountJs, /auth\.logout/, 'account panel should support explicit logout');
assert.match(accountJs, /auth\.changePassword/, 'account panel should support password changes');

assert.match(resetHtml, /ONE-TIME TOKEN/i, 'reset page should explain token semantics');
assert.match(resetJs, /confirmPasswordReset/, 'reset confirmation should call Academy Core');
assert.match(resetJs, /new_password/, 'reset confirmation should submit the new password only to the backend adapter');

assert.match(adapter, /Token \$\{token\(\)\}/, 'Academy Core requests should send token auth');
assert.match(adapter, /sessionStorage\.setItem\(TOKEN_KEY/, 'Academy Core token should be session-scoped');
assert.match(adapter, /auth\/password-reset\/request/, 'Academy Core adapter should expose recovery request');
assert.match(adapter, /auth\/password-reset\/confirm/, 'Academy Core adapter should expose recovery confirmation');
assert.match(tenant, /roleAwareRouting:\s*true/, 'tenant should enforce role-aware routing');
assert.match(tenant, /minimumPasswordLength:\s*12/, 'tenant UX should require stronger preview passwords');
assert.match(tenant, /\['instructor'\]/, 'instructor route should require instructor role');

for (const asset of ['auth.html','auth.css','auth.page.js','auth.session.js','account.html','account.js','reset-password.html','reset-password.js']) {
  assert.match(sw, new RegExp(asset.replace('.', '\\.')), `${asset} should be cached by the application shell`);
}
assert.match(netlify, /from = "\/login"/, 'Netlify should expose clean login route');
assert.match(netlify, /from = "\/account"/, 'Netlify should expose clean account route');
assert.match(netlify, /from = "\/reset-password"/, 'Netlify should expose clean reset route');

console.log('✓ Cristian Cyber Academy identity and account contract validated');
