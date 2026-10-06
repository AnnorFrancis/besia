/* ============================================================
   build-home.js, writes the generated parts of index.html from
   js/besia-data.js:

     BUILD:teaser   02 Core services: one card per core service, in
                    Dana's order (CORE_SERVICES). A card is a Book link
                    (contact.html?core=slug, data-book), so js/booking-cart.js
                    opens the booking on exactly the services beneath it.
                    Its "from" figure is computed from those services, so
                    the card can never contradict the price list.
     BUILD:ticker   the band under the cover: "Book here" and the core
                    services, twice over so the loop is seamless.
     [data-product-price]  a product's published price, wherever the
                    page names one (Follicle Fuel on the home page).

   Run:  node tools/build-home.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const IMG = JSON.parse(fs.readFileSync(path.join(ROOT, 'media', 'img', 'index.json'), 'utf8'));
const VID = JSON.parse(fs.readFileSync(path.join(ROOT, 'media', 'video', 'index.json'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = n => String(n).padStart(2, '0');

/* The picture for a core service: one of hers, a film still, or a library file. */
function picture(c, sizes) {
  const pos = c.pos ? ` style="--pos: ${esc(c.pos)}"` : '';
  if (c.img) {
    const im = IMG[c.img];
    if (!im) throw new Error('picture not built: ' + c.img);
    return `<img src="./media/img/${c.img}-sm.webp" srcset="./media/img/${c.img}-sm.webp ${im.wSm}w, ./media/img/${c.img}.webp ${im.w}w" sizes="${sizes}" width="${im.w}" height="${im.h}" alt="" loading="lazy" decoding="async"${pos}>`;
  }
  if (c.poster) {
    const v = VID[c.poster];
    if (!v) throw new Error('film not built: ' + c.poster);
    const q = '?v=' + v.v;
    return `<img src="./media/video/${c.poster}-poster-sm.webp${q}" srcset="./media/video/${c.poster}-poster-sm.webp${q} ${v.wSm}w, ./media/video/${c.poster}-poster.webp${q} ${v.w}w" sizes="${sizes}" width="${v.w}" height="${v.h}" alt="" loading="lazy" decoding="async"${pos}>`;
  }
  if (c.lib) {
    if (!fs.existsSync(path.join(ROOT, c.lib))) throw new Error('missing picture: ' + c.lib);
    return `<img src="./${c.lib}" width="700" height="933" alt="" loading="lazy" decoding="async"${pos}>`;
  }
  throw new Error('core service without a picture: ' + c.slug);
}

/* Lowest real price beneath a core service: no take-downs, nothing free,
   nothing priced at consultation. */
function fromLabel(c) {
  const lows = c.services
    .map(n => B.services.find(s => s.name === n))
    .filter(s => s && !s.aux)
    .map(B.priceOf)
    .filter(n => n > 0);
  return lows.length ? 'From ' + B.money(Math.min.apply(null, lows)) : 'Priced at consultation';
}

function cards() {
  return B.coreServices.map((c, i) => {
    c.services.forEach(n => { if (!B.services.find(s => s.name === n)) throw new Error(c.slug + ': service not on the menu: ' + n); });
    const lead = i === 0;
    const sizes = lead ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw';
    return `          <a class="core-card${lead ? ' core-card--lead' : ''}" href="./contact.html?core=${c.slug}" data-book data-core="${c.slug}">
            <span class="plate core-plate">${picture(c, sizes)}</span>
            <span class="core-body">
              <span class="core-n">${pad(i + 1)}</span>
              <span class="core-name">${esc(c.label)}</span>
              <span class="core-subs">${esc(c.subs.join(' · '))}</span>
              <span class="core-foot"><span class="core-from">${esc(fromLabel(c))}</span><span class="core-go">Book</span></span>
            </span>
          </a>`;
  }).join('\n');
}

function ticker() {
  const once = B.coreServices.map(c => `<span class="tk-item">${esc(c.label)}</span><span class="tk-book">Book here</span>`).join('');
  return '        ' + once + once;
}

const file = path.join(ROOT, 'index.html');
let html = fs.readFileSync(file, 'utf8');
for (const [open, close, fn] of [['<!--BUILD:teaser-->', '<!--/BUILD:teaser-->', cards], ['<!--BUILD:ticker-->', '<!--/BUILD:ticker-->', ticker]]) {
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1 || b < a) { console.error('MISSING MARKER ' + open); process.exit(1); }
  html = html.slice(0, a + open.length) + '\n' + fn() + '\n' + html.slice(b);
}
html = html.replace(/(<span data-product-price="([^"]+)">)[^<]*(<\/span>)/g, (m, o, name, c) => {
  const p = B.products.find(x => x.name === name);
  if (!p || typeof p.price !== 'number') throw new Error('product price not found: ' + name);
  return o + p.price.toLocaleString('en-GB') + c;
});
fs.writeFileSync(file, html);
console.log('index.html rebuilt, ' + B.coreServices.length + ' core services.');
B.coreServices.forEach(c => console.log('  ' + c.label.padEnd(18) + fromLabel(c)));
