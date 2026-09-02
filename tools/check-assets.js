/* ============================================================
   check-assets.js — every local asset referenced by the site must
   exist on disk with EXACTLY matching case.

   Windows is case-insensitive; GitHub Pages, Netlify and nginx are
   not. A path that works on the dev machine can 404 in production.
   This catches that before the client ever sees it.

   Run:  node tools/check-assets.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules', '.claude', 'tools']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

/* Real files on disk, keyed by their exact relative POSIX path. */
const onDisk = new Set(
  walk(ROOT).map(p => path.relative(ROOT, p).split(path.sep).join('/'))
);
const lowerMap = new Map();
onDisk.forEach(f => lowerMap.set(f.toLowerCase(), f));

const pages = walk(ROOT).filter(f => /\.(html|css|js)$/i.test(f));
const REF = /(?:src|href)\s*=\s*["']([^"'#?]+)["']|url\(\s*["']?([^"')?#]+)["']?\s*\)/gi;

let checked = 0, missing = [], caseWrong = [];

for (const file of pages) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const dir = path.posix.dirname(rel);
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = REF.exec(text)) !== null) {
    const raw = (m[1] || m[2] || '').trim();
    if (!raw) continue;
    if (/^(https?:|data:|mailto:|tel:|#|\/\/)/i.test(raw)) continue;
    // CSS url() is relative to the stylesheet; a URL written inside a JS
    // string is relative to the PAGE that loads it, so resolve those from root.
    const base = /.js$/i.test(rel) ? '' : (dir === '.' ? '' : dir);
    const resolved = path.posix.normalize(
      raw.startsWith('/') ? raw.slice(1) : path.posix.join(base, raw)
    );
    checked++;
    if (onDisk.has(resolved)) continue;
    const alt = lowerMap.get(resolved.toLowerCase());
    if (alt) caseWrong.push({ file: rel, ref: raw, resolved, actual: alt });
    else missing.push({ file: rel, ref: raw, resolved });
  }
}

console.log('local references checked: ' + checked);

if (caseWrong.length) {
  console.log('\nCASE MISMATCH (works on Windows, 404s on Linux hosting):');
  caseWrong.forEach(c => console.log('  ' + c.file + '\n    refers to : ' + c.resolved + '\n    on disk   : ' + c.actual));
}
if (missing.length) {
  console.log('\nMISSING (no such file):');
  missing.forEach(c => console.log('  ' + c.file + ' -> ' + c.ref));
}
if (!caseWrong.length && !missing.length) console.log('all local assets resolve, with exact case.');

process.exit(caseWrong.length || missing.length ? 1 : 0);
