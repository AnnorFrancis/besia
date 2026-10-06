/* ============================================================
   build-chrome.js, stamps the shared chrome onto every public page.

   Three partials in tools/chrome/ are written once and copied into
   each page between markers, so the masthead, the Menu sheet,
   the footer and the script list can never drift between pages:

     <!--CHROME:head--> ... <!--/CHROME:head-->   icon, fonts, css, boot
     <!--CHROME:top-->  ... <!--/CHROME:top-->    skip link, intro, nav, Menu
     <!--CHROME:foot--> ... <!--/CHROME:foot-->   footer, scripts

   The page tells the generator what it is through its <body>:
     data-page="shop"        marks the current page in the nav and the Menu
     data-nav="paper"        a light masthead for pages with no dark cover
     data-scripts="store"    extra scripts after the shared set
     data-core="store"       replaces the shared set (checkout, track)

   Titles, descriptions and the SEO block stay in the page and in
   build-seo.js. Pages without markers are left alone.

   Run:  node tools/build-chrome.js   (build-all does this for you)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const part = n => fs.readFileSync(path.join(__dirname, 'chrome', n + '.html'), 'utf8').replace(/\s+$/, '');

const PAGES = ['index', 'services', 'shop', 'classes', 'packages', 'gallery', 'about', 'contact', 'checkout', 'track', '404', 'offline', 'styleguide'];
const SETS = {
  core:  ['besia-data', 'besia-live', 'booking-cart', 'site', 'reel', 'slides', 'site-sync', 'offline'],   /* ai-chat loads on demand */
  store: ['besia-data', 'besia-live', 'store', 'site', 'reel', 'site-sync', 'offline'],
  none:  []
};

const counts = {
  services: B.services.length,
  products: B.products.length,
  classes: (B.classes || B.courses || []).length,
  packages: (B.packages || B.packs || []).length || 3
};

function attrs(html) {
  const m = html.match(/<body([^>]*)>/);
  const out = {};
  if (!m) return out;
  for (const a of m[1].matchAll(/([a-z-]+)="([^"]*)"/g)) out[a[1]] = a[2];
  return out;
}

function stamp(html, name, body) {
  const open = '<!--CHROME:' + name + '-->', close = '<!--/CHROME:' + name + '-->';
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1) return { html, done: false };
  return { html: html.slice(0, a + open.length) + '\n' + body + '\n' + html.slice(b), done: true };
}

let stamped = 0;
for (const name of PAGES) {
  const file = path.join(ROOT, name + '.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<!--CHROME:')) continue;
  const a = attrs(html);
  const page = a['data-page'] || (name === 'index' ? 'home' : name);
  const cur = key => key === page ? ' class="is-active" aria-current="page"' : '';

  const top = part('top')
    .replace('{{navClass}}', a['data-nav'] === 'paper' ? ' site-nav--paper' : '')
    .replace(/\{\{cur:([a-z0-9]+)\}\}/g, (_, k) => cur(k))
    .replace('{{services}}', counts.services)
    .replace('{{products}}', counts.products)
    .replace('{{classes}}', counts.classes)
    .replace('{{packages}}', counts.packages);

  const set = SETS[a['data-core'] || 'core'] || SETS.core;
  const extra = (a['data-scripts'] || '').split(/[\s,]+/).filter(Boolean);
  const scripts = set.concat(extra.filter(s => !set.includes(s)))
    .map(s => '  <script src="./js/' + s + '.js" defer></script>').join('\n');
  const foot = part('foot').replace('{{scripts}}', scripts);

  let changed = false;
  for (const [n, body] of [['head', part('head')], ['top', top], ['foot', foot]]) {
    const r = stamp(html, n, body);
    html = r.html; changed = changed || r.done;
  }
  if (changed) { fs.writeFileSync(file, html); stamped++; }
}
console.log('chrome stamped on ' + stamped + ' page(s).');
