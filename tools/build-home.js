/* ============================================================
   build-home.js, regenerates the two card grids on index.html
   (service teaser + shop teaser) from js/besia-data.js.

   Run:  node tools/build-home.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const I = {
  strands:  '<path d="M8 3c-3 4-3 14 0 18M12 2c-3.5 5-3.5 15 0 20M16 3c-3 4-3 14 0 18" stroke-linecap="round"/>',
  drop:     '<path d="M12 3c4 4 6 7 6 10a6 6 0 01-12 0c0-3 2-6 6-10z" stroke-linejoin="round"/>',
  bottle:   '<rect x="8.5" y="3" width="7" height="13" rx="3.5"/><path d="M8.5 16.5c0 2.5 1.6 4.5 3.5 4.5s3.5-2 3.5-4.5" stroke-linecap="round"/>',
  brush:    '<path d="M14 3.5l6.5 6.5-9 9-6.5-6.5z" stroke-linejoin="round"/><path d="M5 12.5L3 21l8.5-2" stroke-linejoin="round"/>',
  curl:     '<path d="M2.5 14c3-5 6.5-7.5 9.5-7.5S18.5 9 21.5 14" stroke-linecap="round"/><path d="M5 15.5l-1 3M9 17l-.5 3.2M15 17l.5 3.2M19 15.5l1 3" stroke-linecap="round"/>',
  scissors: '<circle cx="6" cy="18" r="2.6"/><circle cx="18" cy="18" r="2.6"/><path d="M7.8 16.2L18 4M16.2 16.2L6 4" stroke-linecap="round"/>',
  wig:      '<path d="M12 3c-4.5 0-7 3.2-7 7.5 0 3 1 5.5 1 8.5h12c0-3 1-5.5 1-8.5C19 6.2 16.5 3 12 3z" stroke-linejoin="round"/><path d="M9 9c.4 3 .4 7-.6 10M15 9c-.4 3-.4 7 .6 10" stroke-linecap="round"/>',
  wefts:    '<path d="M7 4c-1.5 5.5-1.5 10.5 0 16M12 4c-1.5 5.5-1.5 10.5 0 16M17 4c-1.5 5.5-1.5 10.5 0 16" stroke-linecap="round"/>',
  lace:     '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 9h16M9 9v11M15 9v11" stroke-linecap="round"/>',
  jar:      '<path d="M9 3h6v4l2 3v10a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 20V10l2-3z" stroke-linejoin="round"/><path d="M7 13h10" stroke-linecap="round"/>',
  star:     '<path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 4.9L12 14.3l-4.5 2.3.9-4.9L4.8 8.2l5-.7z" stroke-linejoin="round"/>',
  lash:     '<path d="M3 12c2.8-3.6 6-5.4 9-5.4s6.2 1.8 9 5.4c-2.8 3.6-6 5.4-9 5.4S5.8 15.6 3 12z" stroke-linejoin="round"/><path d="M7 15.5l-1 2.2M12 17v2.4M17 15.5l1 2.2" stroke-linecap="round"/>',
  glow:     '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" stroke-linecap="round"/>'
};
const svg = d => '<svg class="svc-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' + d + '</svg>';

/* The six disciplines that lead the home page. */
const TEASER = [
  { key: 'Extensions',                     icon: I.strands,  img: './images/extensions/ext-2.jpg',      alt: 'Honey-brown fusion extensions worn long',
    copy: 'Seamless KTips and microlinks, UK-certified. Length and density that move like your own hair, and come out without taking it with them.' },
  { key: 'Texture Systems + Treatments',   icon: I.drop,     img: './images/studio/studio-wash.jpg',    alt: 'Steam treatment at the Bēsia wash basin',
    copy: 'Nanoplasty and Hair Botox. Vegan, formaldehyde-free smoothing, the first system of its kind in Ghana.' },
  { key: 'Scalp + Bond Repair Treatments', icon: I.bottle,   img: './images/services/svc-treat.jpg',    alt: 'A scalp treatment being worked through at the basin',
    copy: 'Flaxseed and aloe, GRO hot oil, Olaplex and K18, matched to what your scalp and your bonds actually need.' },
  { key: 'Naturals | Curls & Coils',       icon: I.curl,     img: './images/salon-studio/about-2.jpg',  alt: 'Natural afro texture, defined and shaped',
    copy: 'Curl Revive wash-and-go with our in-house flaxseed, rosemary and olive blends, plus cutting shaped to your curl pattern.' },
  { key: 'Eyelashes & Eyebrows',           icon: I.lash,     img: './images/l1.jpg',                    alt: 'Mink lash extensions being applied by our lash artist',
    copy: 'Classic to hybrid lash sets, lifts and tints, and brows waxed, laminated and tinted.' },
  { key: 'Facials',                        icon: I.glow,     img: './images/services/svc-facial.jpg',   alt: 'A brightening facial mid-treatment',
    copy: 'The Bēsia Glow, custom facials and waxing, alongside soft-to-full glam make-up.' }
];

const SHOP = [
  { key: 'extensions',  icon: I.wefts, img: './images/extensions/ext-1.jpg',           alt: 'Rooted blonde ombré weft extensions laid flat' },
  { key: 'closures',    icon: I.lace,  img: './images/closures-frontals/unit-2.jpg',   alt: 'Caramel highlighted straight unit, back view' },
  { key: 'wigs',        icon: I.wig,   img: './images/wigs/wig-1.jpg',                 alt: 'Silky straight lace closure wig on a mannequin' },
  { key: 'care',        icon: I.jar,   img: './images/hair-care-cosmetics/care-3.jpg', alt: 'Amber dropper bottle of flaxseed and aloe hair mask' },
  { key: 'accessories', icon: I.star,  img: './images/accessories/acc-1.jpg',          alt: 'Satin-lined bonnet in Bēsia black' }
];

const SHOP_COPY = {
  extensions:  'Fusion KTips, tape-in wefts and raw bundles, the same hair we install in the chair.',
  closures:    'HD lace closures and frontals that melt clean at the parting.',
  wigs:        'Glueless ready-to-wear units, adjustable and cut into shape.',
  care:        'The flaxseed masks, hot oils, K18 and Olaplex we treat with, to take home.',
  accessories: 'Satin bonnets, silk scrunchies, detangling combs and the Bēsia tote.'
};

function teaserCards() {
  return TEASER.map(t => {
    const cat = B.categoryOf(t.key);
    const from = B.fromPrice(t.key);
    return `          <article class="svc-card" data-tilt>
            <div class="svc-card-img"><img src="${t.img}" alt="${esc(t.alt)}" width="800" height="1000" loading="lazy" decoding="async"></div>
            <div class="svc-card-body">
              <div class="svc-card-glass">
                ${svg(t.icon)}
                <h3>${esc(cat.label)}</h3>
                <p>${esc(t.copy)}</p>
                <a class="text-link" href="./services.html#${cat.slug}">From ${B.money(from)}</a>
              </div>
            </div>
          </article>`;
  }).join('\n');
}

function shopCards() {
  return SHOP.map(s => {
    const cat = B.productCategories.find(c => c.key === s.key);
    const prices = B.products.filter(p => p.cat === s.key).map(p => p.price);
    const from = Math.min.apply(null, prices);
    return `          <article class="svc-card" data-tilt>
            <div class="svc-card-img"><img src="${s.img}" alt="${esc(s.alt)}" width="800" height="1000" loading="lazy" decoding="async"></div>
            <div class="svc-card-body">
              <div class="svc-card-glass">
                ${svg(s.icon)}
                <h3>${esc(cat.label)}</h3>
                <p>${esc(SHOP_COPY[s.key])}</p>
                <a class="text-link" href="./shop.html#${s.key}">From ${B.money(from)}</a>
              </div>
            </div>
          </article>`;
  }).join('\n');
}

const file = path.join(ROOT, 'index.html');
let html = fs.readFileSync(file, 'utf8');
for (const [open, close, fn] of [
  ['<!--BUILD:teaser-->', '<!--/BUILD:teaser-->', teaserCards],
  ['<!--BUILD:shopteaser-->', '<!--/BUILD:shopteaser-->', shopCards]
]) {
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1) { console.error('MISSING MARKER ' + open); process.exit(1); }
  html = html.slice(0, a + open.length) + '\n' + fn() + '\n' + html.slice(b);
}
fs.writeFileSync(file, html);
console.log('index.html rebuilt, ' + TEASER.length + ' service cards, ' + SHOP.length + ' shop cards.');
