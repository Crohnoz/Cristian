import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [usersHtml, usersJs, lifecycleCss, activateHtml, activateJs, authSession, authPage, instructorJs, adapter, netlify, sw] = await Promise.all([
  read('users.html'), read('users.js'), read('users-lifecycle.css'), read('activate.html'), read('activate.js'), read('auth.session.js'),
  read('auth.page.js'), read('instructor.js'), read('academy-core.adapter.js'), read('netlify.toml'), read('sw.js')
]);

assert.match(usersHtml, /Usuarios, accesos/i, 'identity operations page should explain its purpose');
assert.match(usersHtml, /NO PASSWORD SHARING/, 'admin UI should communicate the no-password-sharing model');
assert.doesNotMatch(usersHtml, /type="password"/i, 'administrators must never receive a learner password field');
assert.match(usersHtml, /users-lifecycle\.css/, 'identity directory should load account lifecycle posture styles');
assert.match(usersJs, /requireAuth\(\{ permission: 'manage_users'/, 'identity operations must require manage_users permission');
assert.match(usersJs, /createInvitation/, 'identity operations should create Academy invitations');
assert.match(usersJs, /revokeInvitation/, 'identity operations should revoke pending invitations');
assert.match(usersJs, /updateOpsProfile/, 'identity operations should manage academic roles through Academy Core');
assert.match(usersJs, /createMembership|updateMembership/, 'identity operations should manage cohort membership through Academy Core');
assert.match(usersJs, /suspendOpsProfile/, 'identity operations should use the explicit remote suspension action');
assert.match(usersJs, /reactivateOpsProfile/, 'identity operations should use the explicit remote reactivation action');
assert.match(usersJs, /No puedes cambiar el estado de tu propia cuenta/, 'self suspension should be blocked in operator UX');
assert.match(usersJs, /Se revocará su sesión activa/, 'suspension UX should make session revocation explicit');
assert.match(lifecycleCss, /user-row\.suspended/, 'suspended accounts should have visible posture');
assert.doesNotMatch(usersJs, /\.innerHTML\s*=/, 'user-controlled directory data must not be rendered through innerHTML');

assert.match(activateHtml, /Tu contraseña la defines tú/i, 'activation should make password ownership explicit');
assert.match(activateHtml, /autocomplete="new-password"/, 'activation should use browser password-manager semantics');
assert.match(activateJs, /activateInvitation/, 'remote activation must delegate to Academy Core');
assert.match(activateJs, /registerPreviewAccount/, 'preview activation must create a hashed local preview identity');
assert.match(activateJs, /accepted_at/, 'preview invitation must be consumed after activation');
assert.doesNotMatch(activateJs, /\.innerHTML\s*=/, 'activation data must not use innerHTML');

assert.match(authSession, /PBKDF2/, 'preview-created passwords must be derived with PBKDF2');
assert.match(authSession, /iterations:120000/, 'preview password derivation should use a meaningful work factor');
assert.match(authSession, /crypto\.getRandomValues/, 'preview password derivation must use a random salt');
assert.match(authSession, /PREVIEW_ACCOUNTS_KEY/, 'preview-created accounts should be separated from built-in demo accounts');
assert.match(authSession, /role: 'coordinator'/, 'Cristian preview operator should use coordinator privileges, not a generic instructor role');
assert.match(authSession, /manage_users/, 'authorization model must explicitly expose manage_users');

assert.match(authPage, /url\.origin !== location\.origin/, 'login next routing must reject external origins');
assert.match(authPage, /\/users\.html/, 'login routing should know the user-administration surface');
assert.match(authPage, /userAdminRoles/, 'login routing should enforce management roles for user administration');
assert.match(instructorJs, /\['instructor','coordinator','admin'\]/, 'teaching console should be role gated');
assert.match(instructorJs, /Usuarios & Accesos/, 'coordinator/admin instructor console should expose identity operations');

assert.match(adapter, /\/api\/v1\/ops\/profiles\//, 'Academy adapter should expose managed profiles');
assert.match(adapter, /\/suspend\//, 'Academy adapter should expose explicit account suspension');
assert.match(adapter, /\/reactivate\//, 'Academy adapter should expose explicit account reactivation');
assert.match(adapter, /\/api\/v1\/ops\/invitations\//, 'Academy adapter should expose invitations');
assert.match(adapter, /\/api\/v1\/ops\/cohorts\//, 'Academy adapter should expose cohorts');
assert.match(adapter, /\/api\/v1\/ops\/cohort-memberships\//, 'Academy adapter should expose memberships');
assert.match(adapter, /\/api\/v1\/invitations\/activate\//, 'Academy adapter should expose invitation activation');

assert.match(netlify, /from = "\/users"[\s\S]*to = "\/users\.html"/, 'Netlify should expose clean /users route');
assert.match(netlify, /from = "\/activate"[\s\S]*to = "\/activate\.html"/, 'Netlify should expose clean /activate route');
assert.match(sw, /users\.html/, 'PWA shell should include identity operations');
assert.match(sw, /users-lifecycle\.css/, 'PWA shell should include lifecycle posture styling');
assert.match(sw, /activate\.html/, 'PWA shell should include activation experience');

console.log('✓ Identity & cohort administration contracts passed');
console.log('✓ Role separation, invitations, PBKDF2 preview accounts, suspension lifecycle and clean routes validated');