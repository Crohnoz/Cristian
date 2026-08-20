import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const excludedDirs = new Set(['.git','.github','node_modules','dist','tests','docs','schemas','supabase','openapi','scripts']);
const excludedFiles = new Set(['package.json','package-lock.json','README.md','CHANGELOG.md','BITACORA.md','SECURITY.md','Dockerfile','docker-compose.yml','.dockerignore','.gitignore']);
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
if (!fs.existsSync(path.join(out, 'showcase.html'))) throw new Error('build missing showcase.html');
if (!fs.existsSync(path.join(out, 'auth.html'))) throw new Error('build missing auth.html');
if (!fs.existsSync(path.join(out, 'dashboard.html'))) throw new Error('build missing dashboard.html');
if (!fs.existsSync(path.join(out, 'teacher.html'))) throw new Error('build missing teacher.html');
if (!fs.existsSync(path.join(out, 'tenant.config.js'))) throw new Error('build missing tenant.config.js');

console.log(`static production artifact: ${copied} files copied to dist/`);