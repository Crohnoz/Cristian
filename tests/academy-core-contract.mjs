import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [tenant, adapter, integration] = await Promise.all([
  read('tenant.config.js'),
  read('academy-core.adapter.js'),
  read('docs/ACADEMY_CORE_INTEGRATION.md')
]);

assert.match(tenant, /provider:\s*'crohnoz-academy'/, 'Cristian must declare Crohnoz Academy as its academic core provider');
assert.match(tenant, /enabled:\s*false/, 'Academy Core must remain disabled until an explicit API environment is configured');
assert.match(tenant, /apiBaseUrl:\s*''/, 'No production/staging Academy API URL should be hardcoded in the public tenant config');
assert.match(tenant, /localFallback:\s*true/, 'Premium demo must retain safe local fallback while Academy Core is disabled');

for (const endpoint of [
  '/api/v1/health/',
  '/api/v1/auth/token/',
  '/api/v1/auth/logout/',
  '/api/v1/me/',
  '/api/v1/courses/',
  '/api/v1/learning-paths/',
  '/api/v1/enrollments/',
  '/api/v1/lesson-progress/',
  '/api/v1/assessment-attempts/',
  '/api/v1/certificates/'
]) {
  assert.match(adapter, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Adapter should expose Academy endpoint ${endpoint}`);
}

assert.doesNotMatch(adapter, /(service[_-]?role|secret|private[_-]?key|password\s*[:=]\s*['"][^'"]+)/i, 'Academy Core adapter must not contain secrets');
assert.doesNotMatch(adapter, /score\s*:/i, 'Browser adapter must not send authoritative assessment scores');
assert.match(integration, /Generic education|Academy Core/i, 'Integration decision should define Academy as reusable academic core');
assert.match(integration, /Cyber Range/i, 'Integration decision should preserve Cyber Range as specialized cyber layer');

console.log('✓ Academy Core integration contract validated');
