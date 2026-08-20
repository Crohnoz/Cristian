import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const excludedDirs = new Set(['.git','.github','.vercel','node_modules','dist','tests','docs','schemas','supabase','openapi','scripts']);
const excludedFiles = new Set(['package.json','package-lock.json','README.md','CHANGELOG.md','BITACORA.md','SECURITY.md','Dockerfile','docker-compose.yml','.dockerignore','.gitignore','vercel.json']);
const allowedExtensions = new Set(['.html','.css','.js','.svg','.webmanifest','.xml','.json']);

fs.rmSync(out, { recursive:true, force:true });
fs.mkdirSync(out, { recursive:true });

let copied = 0;
function copyTree(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes:true })) {
    if (excludedDirs.has(entry.name)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive:true });
      copyTree(from, to);
      if (fs.existsSync(to) && fs.readdirSync(to).length === 0) fs.rmdirSync(to);
      continue;
    }
    if (excludedFiles.has(entry.name)) continue;
    if (!allowedExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    fs.mkdirSync(path.dirname(to), { recursive:true });
    fs.copyFileSync(from, to);
    copied += 1;
  }
}

copyTree(root, out);

const sourceLegacy = path.join(out, 'index.html');
const publicShowcase = path.join(out, 'showcase.html');
if (!fs.existsSync(sourceLegacy)) throw new Error('build missing legacy training shell');
if (!fs.existsSync(publicShowcase)) throw new Error('build missing showcase.html');
fs.copyFileSync(sourceLegacy, path.join(out, 'lab.html'));
fs.copyFileSync(publicShowcase, path.join(out, 'index.html'));

for (const file of ['index.html','showcase.html','auth.html','dashboard.html','teacher.html','tenant.config.js','sw.js']) {
  if (!fs.existsSync(path.join(out, file))) throw new Error(`build missing ${file}`);
}

const rootHtml = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
if (!/DEMO PÚBLICA|demo pública/i.test(rootHtml)) throw new Error('production root is not the public showcase');
if (/auth\.session\.js|users\.js|student\.js|teacher\.js/.test(rootHtml)) throw new Error('production root includes private operations code');

console.log(`static production artifact: ${copied} source files copied; public showcase promoted to /; legacy lab isolated at /lab.html`);