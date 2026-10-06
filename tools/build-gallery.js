/* ============================================================
   build-gallery.js, writes the contact sheet on gallery.html from
   tools/image-manifest.js and media/img/index.json, so every picture
   on the page is one of hers and nothing has to be pasted by hand.

   Hooks kept for js/gallery.js:
     .filter-bar .filter-btn[data-filter]
     .gallery-grid .gallery-item[data-cat][data-cat-label][data-title][data-full] > img
     .gallery-item-overlay

   Run:  node tools/build-gallery.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMG = JSON.parse(fs.readFileSync(path.join(ROOT, 'media', 'img', 'index.json'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CATS = [
  ['studio', 'The studio'],
  ['portraits', 'Portraits'],
  ['products', 'Follicle Fuel and Hair Botox'],
  ['campaign', 'Campaigns'],
  ['still', 'Still life']
];

/* name in media/img, category, the title under the picture, wide or tall */
const SHEET = [
  ['studio-push-door',           'studio',    'The PUSH door'],
  ['studio-logo-wall-1',         'studio',    'The logo wall'],
  ['studio-logo-wall-2',         'studio',    'The logo wall, again'],
  ['studio-logo-wall-3',         'studio',    'Fluted oak'],
  ['studio-mirror-chair',        'studio',    'The gold mirror'],
  ['studio-lounge',              'studio',    'The lounge'],
  ['editorial-curls-sky',        'portraits', 'Curls against the sky'],
  ['editorial-white-terracotta', 'portraits', 'White on terracotta'],
  ['editorial-hair-story',       'portraits', 'Your hair story'],
  ['editorial-curls-highlights', 'portraits', 'Curly highlights'],
  ['editorial-curls-portrait',   'portraits', 'Curls, cream vest'],
  ['model-profile-sleek',        'portraits', 'Sleek, in profile'],
  ['texture-curls',              'portraits', 'Wet, defined'],
  ['moodboard-model',            'portraits', 'Balayage, in profile'],
  ['lifestyle-sunset',           'campaign',  'At sunset'],
  ['product-model-waves',        'products',  'Follicle Fuel, in hand'],
  ['product-model-blush',        'products',  'Follicle Fuel, on blush'],
  ['product-hair-botox',         'products',  'Hair Botox'],
  ['still-travertine',           'still',     'Travertine'],
  ['still-tools',                'still',     'The tools'],
  ['still-dried-flowers',        'still',     'Dried flowers'],
  ['still-comb',                 'still',     'The comb']
];

function filters() {
  const out = ['          <button class="chip filter-btn is-active" data-filter="all" aria-pressed="true">Everything <span class="n">' + SHEET.length + '</span></button>'];
  CATS.forEach(([key, label]) => {
    const n = SHEET.filter(s => s[1] === key).length;
    if (n) out.push('          <button class="chip filter-btn" data-filter="' + key + '" aria-pressed="false">' + esc(label) + ' <span class="n">' + n + '</span></button>');
  });
  return out.join('\n');
}

function items() {
  return SHEET.map(([name, cat, title], i) => {
    const im = IMG[name];
    if (!im) throw new Error('picture not built: ' + name);
    const label = (CATS.find(c => c[0] === cat) || [])[1] || cat;
    const wide = im.w > im.h * 1.2;
    return `          <figure class="gallery-item${wide ? ' gallery-item--wide' : ''}" data-cat="${cat}" data-cat-label="${esc(label)}" data-title="${esc(title)}" data-full="./media/img/${name}.webp">
            <img src="./media/img/${name}-sm.webp" srcset="./media/img/${name}-sm.webp ${im.wSm}w, ./media/img/${name}.webp ${im.w}w" sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 48vw" width="${im.w}" height="${im.h}" alt="${esc(title)}" loading="lazy" decoding="async">
            <figcaption class="gallery-item-overlay"><span class="gallery-item-cat t-credit"><span class="n">${String(i + 1).padStart(2, '0')}</span> ${esc(label)}</span><span class="gallery-item-title">${esc(title)}</span></figcaption>
          </figure>`;
  }).join('\n');
}

const file = path.join(ROOT, 'gallery.html');
let html = fs.readFileSync(file, 'utf8');
for (const [open, close, fn] of [
  ['<!--BUILD:gallery-filters-->', '<!--/BUILD:gallery-filters-->', filters],
  ['<!--BUILD:gallery-->', '<!--/BUILD:gallery-->', items]
]) {
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1) { console.error('MISSING MARKER ' + open); process.exit(1); }
  html = html.slice(0, a + open.length) + '\n' + fn() + '\n' + html.slice(b);
}
fs.writeFileSync(file, html);
console.log('gallery.html rebuilt, ' + SHEET.length + ' pictures in ' + CATS.length + ' groups.');
