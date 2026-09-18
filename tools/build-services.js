/* ============================================================
   build-services.js, regenerates the service menu on services.html
   straight from js/besia-data.js.

   Why this exists: the sample this was built from kept prices in
   four places that had to be edited in step by hand. Here there is
   ONE source (js/besia-data.js) and this script writes the page.
   Static HTML out, so there is no runtime cost and no layout shift.

   Run:  node tools/build-services.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* Photography chosen per category. Three of the ten are Bēsia's own
   studio photographs; the rest come from the licensed library. */
const ART = {
  'Extensions':                     ['./images/extensions/ext-2.jpg',        'Honey-brown fusion extensions worn long'],
  'Texture Systems + Treatments':   ['./images/studio/studio-wash.jpg',      'Steam treatment at the Bēsia wash basin'],
  'Scalp + Bond Repair Treatments': ['./images/services/svc-treat.jpg',      'A scalp treatment being worked through at the basin'],
  'Color Service':                  ['./images/wigs/wig-4.jpg',              'Honey ginger colour with a dark root melt'],
  'Naturals | Curls & Coils':       ['./images/salon-studio/about-2.jpg',    'Natural afro texture, defined and shaped'],
  'Cut Service':                    ['./images/salon-studio/studio-2.jpg',   'A cut being finished with a blow dry'],
  'Braids | Cornrows':              ['./images/image4.jpg',                  'Patterned cornrows finished with curly ends'],
  'Hair Styling':                   ['./images/salon-studio/studio-1.jpg',   'Styling stations with lit mirrors inside the studio'],
  'Wig Service':                    ['./images/wig3.jpeg',                   'A lace-front unit prepared for installation'],
  'Eyelashes & Eyebrows':           ['./images/l1.jpg',                      'Mink lash extensions being applied by our lash artist'],
  'Facials':                        ['./images/services/svc-facial.jpg',     'A brightening facial mid-treatment'],
  'Wax Service':                    ['./images/services/svc-waxing.jpg',     'Warm wax smoothed onto the skin'],
  'Makeup Service':                 ['./images/b1.jpg',                      'Soft glam make-up with lashes, finished'],
  'General':                        ['./images/studio/studio-corner.jpg',    'The consultation corner at Bēsia']
};

/* A short human line under each tile heading. */
const LEAD = {
  'Extensions': 'KTips, microlinks, tape-ins and weaves, installed to sit flat, move naturally and leave your own hair intact.',
  'Texture Systems + Treatments': 'Vegan and formaldehyde-free. Nanoplasty and Hair Botox that smooth texture without stripping the hair.',
  'Scalp + Bond Repair Treatments': 'Treatment-led care. Flaxseed, GRO hot oil, Olaplex and K18, chosen for what your scalp and bonds actually need.',
  'Color Service': 'All-over colour, balayage and highlights, blended against your natural depth rather than fighting it.',
  'Naturals | Curls & Coils': 'Curl Revive wash-and-go and cutting shaped to your curl pattern, with definition that survives the week.',
  'Cut Service': 'Precision, curly and coily cutting. Shape first, length second.',
  'Braids | Cornrows': 'Parted clean and tensioned gently, so your edges outlive the style.',
  'Hair Styling': 'Silkpress Xpress: signature wash, brush blow dry, press and style.',
  'Wig Service': 'Frontal installation, fitted flat and blended so the parting reads as scalp.',
  'Eyelashes & Eyebrows': 'Classic to hybrid sets, lifts and tints, and brows waxed, laminated and tinted.',
  'Facials': 'The Bēsia Glow, custom facials and deep cleanses, built around your skin rather than a set routine.',
  'Wax Service': 'Gentle, sensitive-skin waxing from brow to Brazilian, with the vajacial for after-care.',
  'Makeup Service': 'Soft glam to full glam by our make-up artist, plus one-to-one lessons in your own make-up bag.',
  'General': 'Not sure where to start? The first consultation is free, and there is no pressure to book on the day.'
};

/* ---------- blocks ---------- */

function chips() {
  return B.serviceCategories.map(c =>
    `          <a class="jump-chip" href="#${c.slug}">${esc(c.label)}</a>`
  ).join('\n');
}

function tiles() {
  return B.serviceCategories.map((c, i) => {
    const items = B.byCategory(c.key);
    const from = B.fromPrice(c.key);
    const num = String(i + 1).padStart(2, '0');
    const [src, alt] = ART[c.key];
    /* up to six representative names, shortest first so the list stays tidy */
    const names = items.slice().sort((a, b) => a.name.length - b.name.length).slice(0, 6);
    const lis = names.map(s => `<li>${esc(s.name)}</li>`);
    const rows = [];
    for (let k = 0; k < lis.length; k += 2) rows.push('                ' + lis.slice(k, k + 2).join(''));
    return `          <article class="svc-tile" id="${c.slug}" data-svc-cat="${esc(c.key)}">
            <div class="svc-tile-img"><img src="${src}" alt="${esc(alt)}" width="800" height="1000" loading="lazy" decoding="async"><span class="svc-tile-num">${num}</span></div>
            <div class="svc-tile-body">
              <h3>${esc(c.label)}</h3>
              <p>${esc(LEAD[c.key])}</p>
              <ul class="svc-tile-list">
${rows.join('\n')}
              </ul>
              <div class="svc-tile-foot">
                <span class="svc-tile-price" data-from-slot><em>From</em> ${B.money(from)}</span>
                <a href="./contact.html?service=${encodeURIComponent(c.slug)}" class="btn btn--gold btn--sm">Book ${esc(c.label.split(',')[0].split(' ')[0])}</a>
              </div>
            </div>
          </article>`;
  }).join('\n\n');
}

function priceGroups() {
  return B.serviceCategories.map((c, i) => {
    const items = B.byCategory(c.key);
    const rows = items.map(s =>
      `            <div class="price-row" data-kind="service" data-item="${esc(s.name)}"><span class="name">${esc(s.name)}<em class="price-dur">${esc(s.dur)}</em></span><span class="dots"></span><span class="amt" data-price-slot>${esc(B.priceLabel(s))}</span></div>`
    ).join('\n');
    return `          <details class="price-group" id="prices-${c.slug}"${i === 0 ? ' open' : ''}>
            <summary><h3>${esc(c.label)}</h3><span class="price-count" data-count-slot>${items.length}</span></summary>
            <div class="price-rows">
${rows}</div></details>`;
  }).join('\n\n');
}

/* ---------- splice into the page between markers ---------- */

const MARKERS = [
  ['<!--BUILD:chips-->', '<!--/BUILD:chips-->', chips],
  ['<!--BUILD:tiles-->', '<!--/BUILD:tiles-->', tiles],
  ['<!--BUILD:prices-->', '<!--/BUILD:prices-->', priceGroups]
];

const file = path.join(ROOT, 'services.html');
let html = fs.readFileSync(file, 'utf8');
let ok = 0;

for (const [open, close, fn] of MARKERS) {
  const a = html.indexOf(open);
  const b = html.indexOf(close);
  if (a === -1 || b === -1 || b < a) {
    console.error('MISSING MARKER: ' + open + ' / ' + close);
    process.exit(1);
  }
  html = html.slice(0, a + open.length) + '\n' + fn() + '\n' + html.slice(b);
  ok++;
}

fs.writeFileSync(file, html);

const total = B.serviceCategories.reduce((n, c) => n + B.byCategory(c.key).length, 0);
console.log('services.html rebuilt, ' + ok + ' blocks, ' +
  B.serviceCategories.length + ' categories, ' + total + ' priced services.');

/* Guard: every tile's "From" must equal the cheapest line in its own
   group, or a client comparing tile and list finds a contradiction. */
let bad = 0;
B.serviceCategories.forEach(c => {
  /* aux services (take-downs, removals) are shown in the list but do not
     set the tile's From figure, so exclude them here the same way
     fromPrice() does. */
  const pool = B.byCategory(c.key).filter(s => !s.aux);
  const low = Math.min.apply(null, (pool.length ? pool : B.byCategory(c.key)).map(B.priceOf).filter(n => n > 0));
  if (low !== B.fromPrice(c.key)) { console.error('  MISMATCH in ' + c.label); bad++; }
});
console.log(bad ? '  ' + bad + ' tile/list price mismatches!' : '  tile "From" figures verified against every price list.');
