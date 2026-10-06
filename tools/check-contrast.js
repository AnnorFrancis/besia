/* ============================================================
   check-contrast.js, proves every ground in css/issue/tokens.css.

   For each [data-ground=...] block it resolves --bg, --fg, --fg-2,
   --fg-3, --accent, --on-accent and --rule-ui, then computes the
   WCAG 2 contrast ratio. Text needs 4.5:1, UI lines 3:1, accent on
   its own fill 4.5:1. Any failure prints the pair and exits 1.

   Run:  node tools/check-contrast.js   (build-all does this for you)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'issue', 'tokens.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

/* primitives */
const prim = {};
for (const m of css.matchAll(/--p-([a-z-]+):\s*(#[0-9a-f]{6})/gi)) prim['--p-' + m[1]] = m[2];

function resolve(v) {
  v = v.trim();
  const ref = v.match(/^var\((--[a-z0-9-]+)\)$/i);
  if (ref) return prim[ref[1]] || null;
  return /^#[0-9a-f]{6}$/i.test(v) ? v : null;
}

/* blocks: selector { decls } */
const blocks = [];
for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const sel = m[1].trim();
  if (!/data-ground|^body/.test(sel)) continue;
  const decl = {};
  for (const d of m[2].matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)) decl[d[1]] = d[2].trim();
  blocks.push({ sel, decl });
}

/* the default set is the block that lists body */
const base = blocks.find(b => /body/.test(b.sel)).decl;
const darkBase = blocks.find(b => /"ink"\].*"moss"/.test(b.sel)).decl;
const grounds = ['ivory', 'oatmeal', 'oak', 'sage', 'ink', 'moss', 'espresso', 'clay', 'photo'];
const DARK = ['ink', 'moss', 'espresso', 'clay', 'photo'];

function lum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

let fails = 0;
const rows = [];
for (const g of grounds) {
  const own = {};
  blocks.filter(b => b.sel.includes('"' + g + '"')).forEach(b => Object.assign(own, b.decl));
  const set = Object.assign({}, DARK.includes(g) ? darkBase : base, own);
  const bg = resolve(set['--bg']);
  if (!bg) { console.log('  ' + g + ': cannot resolve --bg'); fails++; continue; }
  const need = { '--fg': 4.5, '--fg-2': 4.5, '--fg-3': 4.5, '--accent': 4.5, '--rule-ui': 3 };
  const out = [g.padEnd(9) + bg];
  for (const k of Object.keys(need)) {
    const c = resolve(set[k]);
    if (!c) { out.push(k + ' ?'); fails++; continue; }
    const r = ratio(c, bg);
    const ok = r >= need[k];
    if (!ok) fails++;
    out.push(k.replace('--', '') + ' ' + r.toFixed(2) + (ok ? '' : ' FAIL'));
  }
  /* accent used as a fill with --on-accent text */
  const acc = resolve(set['--accent']), on = resolve(set['--on-accent']);
  if (acc && on) {
    const r = ratio(acc, on);
    const ok = r >= 4.5;
    if (!ok) fails++;
    out.push('on-accent ' + r.toFixed(2) + (ok ? '' : ' FAIL'));
  }
  rows.push(out.join('  '));
}
rows.forEach(r => console.log('  ' + r));
if (fails) { console.log(fails + ' contrast failure(s) in tokens.css'); process.exit(1); }
console.log('Every ground passes: text 4.5:1, lines 3:1.');
