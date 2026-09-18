/* ============================================================
   add-image-dims.js, stamps intrinsic width/height on every
   local <img> that lacks them.

   Without these the browser cannot reserve space before the image
   arrives, so the page reflows as it loads (Cumulative Layout Shift).
   On a Ghanaian mobile connection that is the difference between a
   page that feels solid and one that jumps under the reader's thumb.

   Requires ffprobe (ships with ffmpeg).

   Run:  node tools/add-image-dims.js
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const cache = new Map();

function dims(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const abs = path.join(ROOT, rel);
  let out = null;
  if (fs.existsSync(abs)) {
    try {
      const r = execFileSync('ffprobe',
        ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
         '-of', 'csv=p=0:s=x', abs], { encoding: 'utf8' }).trim().split('\n')[0];
      const m = /^(\d+)x(\d+)/.exec(r);
      if (m) out = { w: m[1], h: m[2] };
    } catch (e) { /* unreadable, leave it alone */ }
  }
  cache.set(rel, out);
  return out;
}

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.claude', 'tools'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.html$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

let stamped = 0, skipped = 0, unresolved = [];

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const dir = path.posix.dirname(rel);
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  s = s.replace(/<img\b[^>]*>/g, tag => {
    if (/\swidth=/.test(tag) || /\sheight=/.test(tag)) { skipped++; return tag; }
    const m = /\ssrc=["']([^"']+)["']/.exec(tag);
    if (!m) return tag;
    const src = m[1];
    if (/^(https?:|data:|\/\/)/i.test(src)) return tag;
    const resolved = path.posix.normalize(
      src.startsWith('/') ? src.slice(1) : path.posix.join(dir === '.' ? '' : dir, src)
    );
    const d = dims(resolved);
    if (!d) { unresolved.push(rel + ' -> ' + src); return tag; }
    stamped++;
    return tag.replace(/\ssrc=/, ' width="' + d.w + '" height="' + d.h + '" src=');
  });

  if (s !== before) fs.writeFileSync(file, s);
}

console.log('width/height stamped on ' + stamped + ' images (' + skipped + ' already had them).');
if (unresolved.length) {
  console.log('could not measure ' + unresolved.length + ':');
  unresolved.slice(0, 10).forEach(u => console.log('  ' + u));
}
