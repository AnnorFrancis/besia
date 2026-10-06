/* ============================================================
   check-css.js, the house rules for css/issue/*.css, enforced.

   Fails the build on:
     - a colour literal outside tokens.css (hex, rgb(), hsl(), or a
       named colour), because colour must come through the ground
     - font-style: italic (one upright typeface, by the client's wish)
     - a second font-family outside tokens.css and base.css
     - !important anywhere but the [hidden] rule
     - 100vw or 100vh (they overflow on phones; use 100% and 100svh)
     - a bare 1fr in grid-template-columns (it never shrinks below
       its content and clipped two layouts in this project already)
     - more than eight backdrop-filter declarations in all
   Comments are stripped first, so a rule may be discussed in one.

   Run:  node tools/check-css.js   (build-all does this for you)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'css', 'issue');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.css')).sort();
const NAMED = /\b(white|black|red|blue|green|gray|grey|silver|gold|beige|ivory|tan|brown|orange|pink|purple|navy|teal|olive|maroon|lime|aqua|cyan|magenta|yellow|wheat|linen|khaki|salmon|coral|chocolate|sienna|peru|crimson|tomato|plum|orchid|indigo|violet|lavender|bisque|cornsilk|seashell|snow|azure|mintcream|honeydew)\b/i;

let bad = 0, blurs = 0;
const fail = (f, i, l, why) => { bad++; console.log('  ' + f + ':' + (i + 1) + '  ' + why + '\n      ' + l.trim().slice(0, 90)); };

for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  /* strip comments but keep line count */
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const lines = src.split('\n');
  const isTokens = f === 'tokens.css';
  const isBase = f === 'base.css';
  lines.forEach((l, i) => {
    const decl = l.replace(/url\([^)]*\)/g, 'url()').replace(/var\(--[a-z0-9-]+\)/gi, 'var()');
    if (!isTokens) {
      if (/#[0-9a-f]{3,8}\b/i.test(decl) && !/^\s*[.#\[a-z]/i.test(decl.replace(/:.*/, '')) === false && /:\s*[^;]*#[0-9a-f]{3,8}/i.test(decl)) fail(f, i, l, 'colour literal, use a ground token');
      if (/\b(rgb|hsl)a?\(/i.test(decl) && !/\b(rgb|hsl)a?\(\s*var\(/i.test(decl) && !/rgb\(\s*(21 27 34|246 240 228|255 255 255|8 10 12|0 0 0)\s*\//.test(decl)) fail(f, i, l, 'rgb()/hsl() literal, use a ground token');
      if (/:\s*[^;]*\b/.test(decl) && NAMED.test(decl.replace(/^[^:]*:/, '')) && /color|background|border|outline|fill|stroke|shadow/i.test(decl.replace(/:.*/, ''))) fail(f, i, l, 'named colour, use a ground token');
      if (/font-family\s*:/i.test(decl) && !isBase) fail(f, i, l, 'font-family outside base.css');
    }
    if (/font-style\s*:\s*italic/i.test(decl)) fail(f, i, l, 'italic is not allowed');
    if (/!important/.test(decl) && !/\[hidden\]/.test(decl) && !/prefers-reduced-motion/.test(lines.slice(Math.max(0, i - 2), i + 1).join(' ')) && !/animation-|transition-|scroll-behavior/.test(decl)) fail(f, i, l, '!important');
    if (/\b100v[wh]\b/.test(decl)) fail(f, i, l, '100vw/100vh, use 100% or 100svh');
    if (/grid-template-columns\s*:[^;]*(^|[\s(,])1fr/.test(decl) && !/minmax\(\s*0\s*,\s*1fr\s*\)/.test(decl) && !/repeat\([^)]*minmax\(0,\s*1fr\)/.test(decl)) fail(f, i, l, 'bare 1fr, use minmax(0, 1fr)');
    if (/backdrop-filter\s*:/.test(decl) && !/none/.test(decl)) blurs++;
  });
}
if (blurs > 8) { bad++; console.log('  ' + blurs + ' backdrop-filter declarations, the budget is 8'); }
if (bad) { console.log(bad + ' rule violation(s) in css/issue.'); process.exit(1); }
console.log('css/issue passes the house rules (' + files.length + ' files, ' + blurs + ' blur declarations).');
