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
const standouts = items => items.filter(s => !s.aux && !s.bundle).slice().sort((a, b) => B.priceOf(b) - B.priceOf(a)).slice(0, 3);

/* ---------- blocks ---------- */

function chips() {
  return B.serviceCategories.map((c, i) =>
    `          <a class="chip" href="#${c.slug}"><span class="n">${pad(i + 1)}</span> ${esc(c.label)}</a>`
  ).join('\n');
}

function picture(art, sizes) {
  if (art.film) {
    const o = { name: art.film, class: 'plate plate--portrait', alt: art.alt };
    return `<!--REEL:${JSON.stringify(o)}-->\n          <!--/REEL:${art.film}-->`;
  }
  const im = IMG[art.img];
  if (!im) throw new Error('picture not built: ' + art.img);
  return `<figure class="plate plate--tall" data-unveil>
            <img src="./media/img/${art.img}-sm.webp" srcset="./media/img/${art.img}-sm.webp ${im.wSm}w, ./media/img/${art.img}.webp ${im.w}w" sizes="${sizes}" width="${im.w}" height="${im.h}" alt="${esc(art.alt)}" loading="lazy" decoding="async">
          </figure>`;
}

function rowsFor(items) {
  return standouts(items).map(s => `              <li class="price-row" data-item="${esc(s.name)}">
                <span class="name">${esc(s.name)}<em class="price-dur">${esc(s.dur)}</em></span>
                <span class="amt" data-price-slot>${esc(B.priceLabel(s))}</span>
                <a class="row-book" href="./contact.html" data-add-service="${esc(s.name)}" aria-label="Add ${esc(s.name)} to your booking">Add</a>
              </li>`).join('\n');
}

function tiles() {
  let indexOpen = false;
  const out = [];
  B.serviceCategories.forEach((c, i) => {
    const items = B.byCategory(c.key);
    const from = B.fromPrice(c.key);
    const num = pad(i + 1);
    const art = ART[c.key];
    const ground = GROUNDS[i % GROUNDS.length];
    if (art.plate) {
      if (indexOpen) { out.push('      </div></div></section>'); indexOpen = false; }
      out.push(`      <section class="section chapter grain" data-ground="${ground}" id="${c.slug}" data-svc-cat="${esc(c.key)}">
        <div class="container t t-opener"${i % 2 ? ' data-flip' : ''}>
          <span class="ghost" aria-hidden="true">${num}</span>
          <div class="copy stack">
            <p class="eyebrow"><span class="n">Chapter ${num} / ${pad(B.serviceCategories.length)}</span></p>
            <h2 class="t-chap balance">${esc(c.label)}</h2>
            <p class="t-deck">${esc(LEAD[c.key])}</p>
            <ul class="t-index standouts">
${rowsFor(items)}
            </ul>
            <div class="cta-row">
              <span class="t-price" data-from-slot><em>From</em> ${B.money(from)}</span>
              <a class="link" href="#prices-${c.slug}" data-ledger="${c.slug}">All ${items.length} prices</a>
              <a href="./contact.html?service=${encodeURIComponent(c.slug)}" class="btn btn--ghost btn--sm" data-book>Book</a>
            </div>
          </div>
          <div class="plate-wrap plate--cap">
          ${picture(art, '(min-width: 1024px) 576px, 100vw')}
          </div>
        </div>
      </section>`);
    } else {
      if (!indexOpen) {
        out.push(`      <section class="section" data-ground="${ground}"><div class="container stack">
        <p class="eyebrow"><span class="n">Chapters ${num} to ${pad(B.serviceCategories.length)}</span> The rest of the menu</p>
        <div class="t-index chapter-index">`);
        indexOpen = true;
      }
      const im = IMG[art.img];
      out.push(`          <a class="ix-row chapter-row" href="#prices-${c.slug}" id="${c.slug}" data-svc-cat="${esc(c.key)}" data-ledger="${c.slug}">
            <span class="ix-n">${num}</span>
            <span class="ix-thumb"><img src="./media/img/${art.img}-sm.webp" width="${im.wSm}" height="${im.hSm}" alt="" loading="lazy" decoding="async"></span>
            <span><span class="ix-title">${esc(c.label)}</span><span class="ix-dek">${esc(LEAD[c.key])}</span></span>
            <span class="ix-end"><span data-from-slot><em>From</em> ${B.money(from)}</span><span class="ix-count">${items.length} ${items.length === 1 ? 'service' : 'services'}</span></span>
          </a>`);
    }
  });
  if (indexOpen) out.push('      </div></div></section>');
  return out.join('\n');
}

function priceGroups() {
  return B.serviceCategories.map((c, i) => {
    const items = B.byCategory(c.key);
    const rows = items.map(s =>
      `            <div class="price-row" data-kind="service" data-item="${esc(s.name)}"><span class="name">${esc(s.name)}<em class="price-dur">${esc(s.dur)}</em></span><span class="amt" data-price-slot>${esc(B.priceLabel(s))}</span><a class="row-book" href="./contact.html" data-add-service="${esc(s.name)}" aria-label="Add ${esc(s.name)} to your booking">Add</a></div>`
    ).join('\n');
    return `          <details class="price-group" id="prices-${c.slug}"${i === 0 ? ' open' : ''}>
            <summary><span class="price-num">${pad(i + 1)}</span><h3>${esc(c.label)}</h3><span class="price-count" data-count-slot>${items.length}</span></summary>
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

/* the stale "All 47 prices" bug: the generator owns every count */
const total = B.serviceCategories.reduce((n, c) => n + B.byCategory(c.key).length, 0);
const WORDS = { 80: 'Eighty', 81: 'Eighty-one', 82: 'Eighty-two', 83: 'Eighty-three', 84: 'Eighty-four', 85: 'Eighty-five', 86: 'Eighty-six', 87: 'Eighty-seven', 88: 'Eighty-eight', 89: 'Eighty-nine', 90: 'Ninety' };
html = html.replace(/(Every price <span class="n">)\d+(<\/span>)/, '$1' + total + '$2')
           .replace(/(id="ledger-count"[^>]*>)Showing \d+ of \d+/, '$1Showing ' + total + ' of ' + total)
           .replace(/<h2 class="t-h2 balance">[^<]*services, published\.<\/h2>/, '<h2 class="t-h2 balance">' + (WORDS[total] || total) + ' services, published.</h2>');

fs.writeFileSync(file, html);
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
