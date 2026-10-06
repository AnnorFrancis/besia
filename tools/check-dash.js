/* ============================================================
   check-dash.js, fails the build if an em dash or an en dash is
   anywhere a visitor could read one.

   The client's standard is plain punctuation: commas, colons, full
   stops, middle dots. This scans the public pages, the public
   scripts (their strings become visible text) and the public styles
   (content: rules). The Studio Manager is out of scope.

   Run:  node tools/check-dash.js   (build-all does this for you)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules', '.claude', 'tools', 'admin', 'images', 'media', 'fonts', 'NEW VIDEOS AND IMAGES']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|js|css)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT).filter(f => {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  return !/^js\/admin/.test(rel) && rel !== 'css/admin.css' && !rel.startsWith('js/vendor/');
});

let bad = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (/[–—]/.test(l)) {
      bad++;
      console.log('  ' + path.relative(ROOT, f) + ':' + (i + 1) + '  ' + l.trim().slice(0, 100));
    }
  });
}
if (bad) { console.log(bad + ' line(s) carry an em or en dash.'); process.exit(1); }
console.log('No em or en dashes in ' + files.length + ' public files.');
