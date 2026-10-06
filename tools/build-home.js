/* ============================================================
   build-home.js, regenerates "In this issue" on index.html, the six
   signature treatments, from js/besia-data.js.

   Each card carries the hooks js/site-sync.js and js/booking-cart.js
   already understand: a .price-row[data-item] with a [data-price-slot]
   that follows the owner's live price, and an Add button
   (data-add-service, class row-book) that puts the exact service in
   the booking without leaving the page.

   Run:  node tools/build-home.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const IMG = JSON.parse(fs.readFileSync(path.join(ROOT, 'media', 'img', 'index.json'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* The six. `label` is how the name reads on the card; `service` is the
   exact menu name the booking and the manager use. */
const SIX = [
  { service: '100 grams - KTips',                    label: 'KTips, 100 grams',   img: 'product-model-waves',      line: 'Seamless fusion extensions, UK-certified, bonded strand by strand so they move like your own hair.' },
  { service: 'Vegan Keratin Treatment - Nanoplasty', label: 'Nanoplasty',         img: 'model-profile-sleek',      line: 'Vegan, formaldehyde-free smoothing. The first system of its kind in Ghana; months of manageability.' },
  { service: 'Texture Release - Hair Botox',         label: 'Hair Botox',         img: 'texture-curls',            line: 'A deep treatment that releases texture without straightening it away. No botulinum toxin, no formaldehyde.' },
  { service: 'Bēsia Hair CPR Treatment',             label: 'Hair CPR',           img: 'studio-lounge',            line: 'Intensive repair for hair that has been through heat, colour or tension. Bond repair, moisture, protein, in order.' },
  { service: 'Silkpress Xpress',                     label: 'Silk Press',         img: 'editorial-hair-story',     line: 'A silk press that respects the curl underneath, so it comes back when you wash it.' },
  { service: 'Bēsia Glow',                           label: 'The Bēsia Glow',     img: 'editorial-curls-portrait', line: 'Her signature facial: cleanse, exfoliate, mask and massage, finished with light.' }
];

function hours(dur) {
  if (!dur) return '';
  const h = (dur.match(/(\d+)\s*hr/) || [])[1], m = (dur.match(/(\d+)\s*min/) || [])[1];
  if (h && m) return 'allow ' + h + ' to ' + (Number(h) + 1) + ' hours';
  if (h) return 'allow ' + h + (h === '1' ? ' hour' : ' hours');
  if (m) return 'allow ' + m + ' minutes';
  return '';
}

function cards() {
  return SIX.map((t, i) => {
    const s = B.services.find(x => x.name === t.service);
    if (!s) throw new Error('service not found: ' + t.service);
    const cat = B.categoryOf(s.cat);
    const im = IMG[t.img];
    if (!im) throw new Error('picture not built: ' + t.img);
    const n = String(i + 1).padStart(2, '0');
    return `          <article class="svc-card" data-svc="${esc(s.name)}">
            <a class="plate plate--tall" href="./services.html#${cat.slug}" aria-label="${esc(cat.label)}">
              <img src="./media/img/${t.img}-sm.webp" srcset="./media/img/${t.img}-sm.webp ${im.wSm}w, ./media/img/${t.img}.webp ${im.w}w" sizes="(min-width: 1024px) 30vw, 78vw" width="${im.w}" height="${im.h}" alt="" loading="lazy" decoding="async">
            </a>
            <div class="svc-card-body">
              <p class="t-credit"><span class="n">${n}</span> ${esc(cat.label)}</p>
              <h3 class="t-h3">${esc(t.label)}</h3>
              <p class="t-cap">${esc(t.line)}</p>
              <p class="price-row" data-item="${esc(s.name)}">
                <span class="name sr-only">${esc(s.name)}</span>
                <span class="amt t-price" data-price-slot>${esc(B.priceLabel(s))}</span>
                <span class="t-cap">${esc(hours(s.dur))}</span>
              </p>
              <div class="svc-card-actions">
                <button type="button" class="btn btn--ghost btn--sm row-book" data-add-service="${esc(s.name)}">Add</button>
                <a class="text-link" href="./services.html#${cat.slug}">From ${esc(B.money(B.fromPrice(s.cat)))}</a>
              </div>
            </div>
          </article>`;
  }).join('\n');
}

const file = path.join(ROOT, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const open = '<!--BUILD:teaser-->', close = '<!--/BUILD:teaser-->';
const a = html.indexOf(open), b = html.indexOf(close);
if (a === -1 || b === -1) { console.error('MISSING MARKER ' + open); process.exit(1); }
html = html.slice(0, a + open.length) + '\n' + cards() + '\n' + html.slice(b);
fs.writeFileSync(file, html);
console.log('index.html rebuilt, ' + SIX.length + ' signature treatments.');
