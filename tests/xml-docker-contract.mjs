import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [tenant, xml, noAi, dockerfile, compose, nginx, example] = await Promise.all([
  read('tenant.config.js'),
  read('xml-content.js'),
  read('no-ai.js'),
  read('Dockerfile'),
  read('docker-compose.yml'),
  read('nginx.conf'),
  read('content/course-example.xml')
]);

assert.match(tenant, /aiAgentEnabled:\s*false/, 'Cristian runtime must explicitly disable AI agents');
assert.doesNotMatch(tenant, /liveAiMentor/, 'AI mentor feature flag must not remain in active tenant config');
assert.doesNotMatch(tenant, /['"]mentor['"]/, 'Mentor must not remain in active product modules');
assert.match(tenant, /exchangeFormat:\s*'xml'/, 'XML must be the configured content exchange format');
assert.match(tenant, /import\('\.\/xml-content\.js'\)/, 'Studio must load the XML content pipeline');
assert.match(tenant, /import\('\.\/no-ai\.js'\)/, 'Main product must strip the legacy AI surface');

assert.match(xml, /<!DOCTYPE\|<!ENTITY/i, 'XML importer must explicitly detect unsafe declarations');
assert.match(xml, /MAX_XML_BYTES\s*=\s*2\s*\*\s*1024\s*\*\s*1024/, 'XML import must enforce a 2 MB cap');
assert.match(xml, /DOMParser/, 'XML import must use an XML parser');
assert.match(xml, /XMLSerializer/, 'XML export must serialize a DOM rather than concatenate unescaped content');
assert.match(xml, /remoteId:\s*null/, 'Imported content must not inherit remote authority');

assert.match(noAi, /data-view="mentor"/, 'Legacy mentor navigation must be removed at runtime');
assert.match(noAi, /#mentor/, 'Legacy mentor deep links must be redirected');

assert.match(dockerfile, /nginx:1\.27-alpine/, 'Docker runtime must use the pinned Nginx Alpine image');
assert.match(dockerfile, /HEALTHCHECK/, 'Docker image must expose a healthcheck');
assert.match(compose, /read_only:\s*true/, 'Compose runtime must use a read-only root filesystem');
assert.match(compose, /no-new-privileges:true/, 'Compose runtime must prevent privilege escalation');
assert.match(compose, /cap_drop:\s*\n\s*- ALL/, 'Compose runtime must drop Linux capabilities by default');
assert.match(nginx, /Content-Security-Policy/, 'Nginx must send CSP');
assert.match(nginx, /X-Frame-Options/, 'Nginx must deny framing');
assert.match(example, /<academy[\s>]/, 'Example XML must use the Academy root');
assert.match(example, /<course[\s>]/, 'Example XML must contain a course');

console.log('✓ XML + Docker no-agent contract validated');
