/* ============================================================
   build-services.js, writes the service menu on services.html
   straight from js/besia-data.js: the chapter rail, the fourteen
   chapters and the ledger of every price.

   Why this exists: the sample this was built from kept prices in
   four places that had to be edited in step by hand. Here there is
   ONE source (js/besia-data.js) and this script writes the page.
   Static HTML out, so there is no runtime cost and no layout shift.

   Hooks kept for js/site-sync.js and js/booking-cart.js:
     [data-svc-cat] with [data-from-slot]       the chapter's From figure
     .price-group with [data-count-slot]        the ledger group count
     .price-row[data-item] with .name and [data-price-slot]
     .row-book[data-add-service]                Add, never navigates

   Run:  node tools/build-services.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const IMG = JSON.parse(fs.readFileSync(path.join(ROOT, 'media', 'img', 'index.json'), 'utf8'));

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* Her own pictures and films, one per chapter. A film is placed by
   build-reels.js from the marker this writes. Chapters marked plate
   open as a spread; the rest are ruled index rows with a small still,
   so a phone reaches the ledger in a few screens. */
const ART = {
  'Extensions':                     { img: 'product-model-waves',      plate: true,  alt: 'Long fusion extensions, worn loose' },
  'Texture Systems + Treatments':   { img: 'model-profile-sleek',      plate: true,  alt: 'A sleek profile after a texture treatment' },
  'Scalp + Bond Repair Treatments': { film: 'wash-ritual',             plate: true,  alt: 'A scalp cleanse at the basin' },
  'Naturals | Curls & Coils':       { film: 'wash-ritual-curls',       plate: true,  alt: 'Curls lathered at the basin' },
  'Color Service':                  { img: 'editorial-hair-story',     plate: true,  alt: 'A balayage blowout' },
  'Cut Service':                    { img: 'texture-curls',            plate: false, alt: 'Defined curls, close' },
  'Braids | Cornrows':              { film: 'braid-finish',            plate: true,  alt: 'Finishing the ends of a braid' },
  'Hair Styling':                   { img: 'studio-mirror-chair',      plate: false, alt: 'The salon chair before the gold mirror' },
  'Wig Service':                    { img: 'studio-logo-wall-3',       plate: false, alt: 'A woman at the Bēsia logo wall' },
  'Eyelashes & Eyebrows':           { img: 'editorial-curls-sky',      plate: false, alt: 'A woman with curls against a blue sky' },
  'Facials':                        { img: 'lifestyle-sunset',         plate: false, alt: 'A woman in a white robe at sunset' },
  'Wax Service':                    { img: 'still-travertine',         plate: false, alt: 'A travertine bowl' },
  'Makeup Service':                 { img: 'editorial-white-terracotta', plate: false, alt: 'A woman in a white ruffled shirt on terracotta' },
  'General':                        { img: 'studio-lounge',            plate: false, alt: 'The studio lounge' }
};

/* A short human line under each chapter heading. */
const LEAD = {
  'Extensions': 'KTips, microlinks, tape-ins and weaves, installed to sit flat, move naturally and leave your own hair intact. UK-certified.',
  'Texture Systems + Treatments': 'Vegan and formaldehyde free. Nanoplasty and Hair Botox smooth texture without stripping the hair.',
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

/* The grounds the chapters turn through: dark and light alternate. */
const GROUNDS = ['ivory', 'moss', 'oatmeal', 'espresso', 'sage', 'ink', 'ivory'];

const pad = n => String(n).padStart(2, '0');

/* ---------- blocks ---------- */

function chips() {
  return B.serviceCategories.map((c, i) =>
    `          <a class="chip" href="#${c.slug}"><span class="n">${pad(i + 1)}</span> ${esc(c.label)}</a>`
  ).join('\n');
}

function picture(art, sizes) {
  if (art.film) {
    const o = { name: art.film, class: 'plate plate--tall', alt: art.alt };
    return `<!--REEL:${JSON.stringify(o)}-->\n          <!--/REEL:${art.film}-->`;
  }
  const im = IMG[art.img];
  if (!im) throw new Error('picture not built: ' + art.img);
  return `<figure class="plate plate--tall" data-unveil>
            <img src="./media/img/${art.img}-sm.webp" srcset="./media/img/${art.img}-sm.webp ${im.wSm}w, ./media/img/${art.img}.webp ${im.w}w" sizes="${sizes}" width="${im.w}" height="${im.h}" alt="${esc(art.alt)}" loading="lazy" decoding="async">
          </figure>`;
}

function rows(items) {
  return items.map(s => `            <div class="price-row" data-kind="service" data-item="${esc(s.name)}">
              <span class="name">${esc(s.name)}<em class="price-dur">${esc(s.dur)}</em></span>
              <span class="amt" data-price-slot>${esc(B.priceLabel(s))}</span>
              <a class="row-book" href="./contact.html" data-add-service="${esc(s.name)}" aria-label="Add ${esc(s.name)} to your booking">Add</a>
            </div>`).join('\n');
}

/* One chapter: a plate where she has one, the chapter title and line,
   then every service in it. Chapters with no picture are rows only.
   The whole chapter is a details element, so a phone can fold the
   ones it is not reading; all are open from 768px. */
function tiles() {
  return B.serviceCategories.map((c, i) => {
    const items = B.byCategory(c.key);
    const from = B.fromPrice(c.key);
    const num = pad(i + 1);
    const art = ART[c.key];
    const ground = i % 2 ? 'oatmeal' : 'ivory';
    return `      <section class="chapter" data-ground="${ground}" id="${c.slug}" data-svc-cat="${esc(c.key)}">
        <div class="container">
          <details class="price-group chapter-group" id="prices-${c.slug}"${i === 0 ? ' open' : ''}>
            <summary class="chapter-head">
              <span class="price-num">${num}</span>
              <span class="chapter-title"><h2 class="t-h3">${esc(c.label)}</h2><span class="t-cap">${esc(LEAD[c.key])}</span></span>
              <span class="chapter-meta"><span class="t-price" data-from-slot><em>From</em> ${B.money(from)}</span><span class="price-count" data-count-slot>${items.length}</span></span>
            </summary>
            <div class="chapter-body${art.plate ? ' has-plate' : ''}">
${art.plate ? '              <div class="chapter-plate">' + picture(art, '(min-width: 1024px) 360px, 100vw') + '</div>\n' : ''}              <div class="price-rows">
${rows(items)}
              </div>
            </div>
          </details>
        </div>
      </section>`;
  }).join('\n');
}

function priceGroups() { return ''; }

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
  B.serviceCategories.length + ' chapters, ' + total + ' priced services.');

/* Guard: every chapter's "From" must equal the cheapest line in its own
   group, or a client comparing chapter and ledger finds a contradiction. */
let bad = 0;
B.serviceCategories.forEach(c => {
  const pool = B.byCategory(c.key).filter(s => !s.aux);
  const low = Math.min.apply(null, (pool.length ? pool : B.byCategory(c.key)).map(B.priceOf).filter(n => n > 0));
  if (low !== B.fromPrice(c.key)) { console.error('  MISMATCH in ' + c.label); bad++; }
});
console.log(bad ? '  ' + bad + ' chapter/ledger price mismatches!' : '  chapter "From" figures verified against every price list.');
