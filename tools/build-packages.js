/* ============================================================
   build-packages.js, rebuilds the three packages and the service
   builder on packages.html from js/besia-data.js.

   The packages are Bēsia's OWN published multi-service bundles
   (Fresha lists them with their saving), not invented offers,
   so the figures here match what a client is quoted in the studio.

   Run:  node tools/build-packages.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const find = name => {
  const s = B.services.find(x => x.name === name);
  if (!s) throw new Error('service not found: ' + name);
  return s;
};

/* Her real bundles, plus the flagship texture service. */
const PACKS = [
  {
    tier: 'Reset', name: 'Curl Revive + Flax', featured: false,
    source: 'Curl Revive + Flax',
    features: [
      'Curl Revive wash-and-go, 1 hr 30 min',
      'Flax Seed + Aloe treatment mask',
      'In-house flaxseed, rosemary and olive blends',
      'Gentle steam to lock in moisture',
      'Finish and style'
    ],
    note: 'Our most-booked pairing, hydration and definition in one sitting. Listed on our booking system with a 15% saving against booking the two separately.',
    cta: 'Book the Reset'
  },
  {
    /* Dana, 6 Oct: "Hair CPR can be included here as a detox + nourish".
       The steps are hers, from the Hair Club plan. */
    tier: 'Detox + Nourish', name: 'Bēsia Hair CPR', featured: false,
    source: 'Bēsia Hair CPR Treatment',
    features: [
      'Chelating clay mask, a clarifying detox',
      'Root Revival scalp polish, clears dead skin and build-up',
      'Flax Seed + Aloe treatment, follicle prep and restoration',
      'GRO hot oil treatment, for growth',
      'Made in-house in the Bēsia Lab'
    ],
    note: 'Our signature ritual, layered to revive the scalp and nourish the hair. Every two weeks, or as your plan sets it, to calm shedding and bring growth back.',
    cta: 'Book Hair CPR'
  },
  {
    tier: 'Restore', name: 'Curl Revive with FlaxGRO', featured: true, badge: 'Most Loved',
    source: 'Curl Revive with FlaxGRO',
    features: [
      'Everything in the Reset',
      'GRO hot oil treatment through the scalp',
      'Extended 3 hr 30 min appointment',
      'Scalp assessment before we begin',
      'Take-home routine written for your hair'
    ],
    note: 'The full treatment afternoon. For hair that is dry, shedding, or recovering from tension or colour.',
    cta: 'Book the Restore'
  },
  {
    tier: 'Signature', name: 'Vegan Keratin Nanoplasty', featured: false,
    source: 'Vegan Keratin Treatment - Nanoplasty',
    features: [
      'Vegan, formaldehyde-free formula',
      'The first system of its kind in Ghana',
      'Smooths texture without stripping the hair',
      '4 hr 30 min, start to finish',
      'Aftercare products and instructions included'
    ],
    note: 'Our signature texture service. Frizz control and manageability that lasts months, with none of the chemistry that damages hair.',
    cta: 'Book Nanoplasty'
  }
];

function packages() {
  return PACKS.map(pk => {
    const s = find(pk.source);
    const amount = s.price != null ? s.price : s.from;
    const showFrom = s.price == null;
    return `          <article class="pkg-card${pk.featured ? ' pkg-card--featured' : ''}">
${pk.badge ? '            <div class="pkg-badge">' + esc(pk.badge) + '</div>\n' : ''}            <div class="pkg-tier">${esc(pk.tier)}</div>
            <h3 class="pkg-name">${esc(pk.name)}</h3>
            <div class="pkg-price">${showFrom ? '<span class="from">From</span>' : ''}<span class="cur">GHS</span><span class="amount">${Number(amount).toLocaleString('en-GB')}</span></div>
            <ul class="pkg-features">
${pk.features.map(f => '              <li>' + f + '</li>').join('\n')}
            </ul>
            <p class="pkg-desc">${pk.note}</p>
            <div class="pkg-cta"><a href="./contact.html" class="btn btn--ghost-dark" data-add-service="${esc(pk.source)}">Add to my booking</a></div>
          </article>`;
  }).join('\n\n');
}

/* Builder: a representative service from each discipline plus the
   headline treatments, every price straight from the menu. */
const BUILDER = [
  'Curl Revive | Wash + Go', 'Silkpress Xpress', 'Flax Seed + Aloe Treatment',
  'GRO Hot Oil Treatment', 'K18 Treatment and Bond Repair', 'Olaplex Treatment',
  'Scalp + Dandruff Intensive Detox', 'Bēsia Hair CPR Treatment',
  'Frontal Installation', 'Classic Weave Install - One Part Leave Out',
  'Seamless Tape-Ins', '100 grams - KTips',
  'All Over Color - Medium', 'Precision Cut', 'Large Braids',
  'Texture Release - Hair Botox',
  'Classic Set', 'Brow Lamination + Wax', 'B\u0113sia Glow', 'Brazilian'
];


/* Cut a blurb to length without slicing a word in half.
   A hard .slice() was leaving lines like "a luxurious wash-and-go experie"
   on the page, which reads as a broken site rather than a shortened
   sentence. It also strips the "<service> at Bēsia Beauty Studio" opening
   that some of the Fresha blurbs carry, so the sentence starts with the
   description instead of repeating the name above it. */
function shorten(text, max) {
  let t = String(text || '').replace(/\s+/g, ' ').trim();
  t = t.replace(/^.{0,70}?(?:at|-|\u2013|\u2014)\s*B[e\u0113]sia Beauty Studio[,.]?\s*/i, '');
  t = t.replace(/\u2026+$/, '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(' ');
  const kept = space > max * 0.5 ? cut.slice(0, space) : cut;
  return kept.replace(/[\s,;:.\u2013-]+$/, '') + '\u2026';
}

function builder() {
  return BUILDER.map(name => {
    const s = find(name);
    const price = B.priceOf(s);
    const desc = shorten(s.short, 92);
    return `            <label class="builder-opt" data-name="${esc(s.name)}" data-price="${price}">
              <input type="checkbox">
              <span class="builder-check">✓</span>
              <span>
                <span class="builder-opt-name">${esc(s.name)}</span><br>
                <span class="builder-opt-desc">${esc(s.dur)} · ${esc(desc)}</span>
              </span>
              <span class="builder-opt-price">${esc(B.priceLabel(s))}</span>
            </label>`;
  }).join('\n');
}

const file = path.join(ROOT, 'packages.html');
let html = fs.readFileSync(file, 'utf8');
for (const [open, close, fn] of [
  ['<!--BUILD:packages-->', '<!--/BUILD:packages-->', packages],
  ['<!--BUILD:builder-->', '<!--/BUILD:builder-->', builder]
]) {
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1) { console.error('MISSING MARKER ' + open); process.exit(1); }
  html = html.slice(0, a + open.length) + '\n' + fn() + '\n' + html.slice(b);
}
/* The Blueprint's price, wherever the page names it, straight from the menu. */
html = html.replace(/(<span data-service-price="([^"]+)">)[^<]*(<\/span>)/g, (m, o, name, c) => {
  const s = find(name);
  return o + B.priceOf(s).toLocaleString('en-GB') + c;
});
fs.writeFileSync(file, html);
/* The home page teaser carries the same three packages, so it can never
   advertise something the packages page does not. */
{
  const homeFile = path.join(ROOT, 'index.html');
  let home = fs.readFileSync(homeFile, 'utf8');
  const o = '<!--BUILD:homepacks-->', c = '<!--/BUILD:homepacks-->';
  const a = home.indexOf(o), b = home.indexOf(c);
  /* the home page carries the teaser only if it asks for it */
  if (a !== -1 && b !== -1 && b > a) {
    home = home.slice(0, a + o.length) + '\n' + packages() + '\n' + home.slice(b);
    fs.writeFileSync(homeFile, home);
  }
}

console.log('packages.html rebuilt, ' + PACKS.length + ' packages, ' + BUILDER.length + ' builder options.');
PACKS.forEach(pk => {
  const s = find(pk.source);
  console.log('  ' + pk.name.padEnd(30) + B.priceLabel(s));
});
