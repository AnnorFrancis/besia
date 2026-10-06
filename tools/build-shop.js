/* ============================================================
   build-shop.js, regenerates the shop on shop.html from
   js/besia-data.js. Same contract as build-services.js: one source
   of truth, static HTML out.

   Three kinds of card:
     a photograph   a product we have a real picture of (Follicle Fuel,
                    the Beard Oil, Hair Botox)
     a label        a product with no photograph yet is set as its own
                    label, on a ground, rather than shown with someone
                    else's picture
     hair           by texture, with the lengths as chips; each length
                    carries its own price, and until a length is priced
                    the card says "Price to follow" and cannot be ordered

   Hooks kept for the page script, js/store.js and js/site-sync.js:
     [data-shop-filter]                         the filter chips
     #shop-grid .product-card[data-cat][data-item]
     .product-img img, .product-tag, .product-flag
     .product-price[data-price-slot], .product-cta[data-cta-slot]
     button[data-add="name|price"], .len-chips [data-len]
   site-sync.js injects cards of the same shape for items the owner
   adds in the manager, so these class names are a contract.

   Run:  node tools/build-shop.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const ALT = {
  'media/video/bottle-specimen-poster.webp': 'The frosted green Follicle Fuel Hair Growth Oil bottle',
  'media/video/beard-oil-poster.webp': 'The amber Follicle Fuel Beard Oil bottle on terracotta sand',
  'media/img/product-hair-botox.webp': 'The Bēsia Hair Botox pump bottle'
};

/* The ground a label card sits on: her own line in the bottle's moss,
   the salon brands on ink, the hair in the warm grounds of the studio. */
const GROUND = { lab: 'moss', care: 'ink', bundles: 'espresso', fusion: 'clay', crochet: 'oak', tapeins: 'espresso', frontals: 'clay' };

function filters() {
  const out = ['          <button type="button" class="chip filter-btn is-active" data-shop-filter="all" aria-pressed="true">Everything <span class="n">' + B.products.length + '</span></button>'];
  B.productCategories.forEach(c => {
    const n = B.products.filter(p => p.cat === c.key).length;
    out.push('          <button type="button" class="chip filter-btn" data-shop-filter="' + c.key + '" aria-pressed="false">' + esc(c.label) + ' <span class="n">' + n + '</span></button>');
  });
  out.push('          <span class="t-credit shop-count" id="shop-count" aria-live="polite">Showing ' + B.products.length + ' of ' + B.products.length + '</span>');
  return out.join('\n');
}

function picture(p, cat, n) {
  const tag = `<span class="product-tag t-credit"><span class="n">${n}</span><i class="cat">${esc(cat.label)}</i></span>`;
  const flag = p.preorder ? '<span class="product-flag">Launching soon</span>'
             : p.soon ? '<span class="product-flag">Arriving soon</span>' : '';
  if (p.img) {
    if (!fs.existsSync(path.join(ROOT, p.img))) throw new Error('missing image: ' + p.img);
    return `<div class="product-img plate plate--3x4"><img src="./${p.img}" alt="${esc(ALT[p.img] || p.name)}" width="700" height="933" loading="lazy" decoding="async">${tag}${flag}</div>`;
  }
  const isLab = p.cat === 'lab';
  const kicker = isLab ? 'Bēsia Lab' : p.cat === 'care' ? 'Professional care' : cat.label;
  const line = isLab ? 'Made by hand in Accra' : p.lengths ? p.lengths[0] + ' to ' + p.lengths[p.lengths.length - 1] : p.custom ? 'Made to order' : '';
  return `<div class="product-img plate plate--3x4 product-label" data-ground="${GROUND[p.cat] || 'ink'}" role="img" aria-label="${esc(p.name)}">` +
    `<span class="label-mark" aria-hidden="true">Bēsia</span>` +
    `<span class="label-kicker" aria-hidden="true">${esc(kicker)}</span>` +
    `<span class="label-name" aria-hidden="true">${esc(p.title || p.name.replace(/^Bēsia /, ''))}</span>` +
    (line ? `<span class="label-line" aria-hidden="true">${esc(line)}</span>` : '') +
    `${tag}${flag}</div>`;
}

function foot(p) {
  if (p.custom) {
    return `<div class="product-foot">
                <div class="product-price t-price">Priced on request</div>
                <div class="product-cta"><a class="btn btn--ghost btn--sm" href="./contact.html#booking-form" data-no-cart>Ask for a quote</a></div>
              </div>`;
  }
  if (p.lengths) {
    const first = p.lengths[0];
    const price = (p.lengthPrices || {})[first];
    return `<div class="len-chips" role="group" aria-label="Length">
${p.lengths.map((l, i) => `                <button type="button" class="len" data-len="${esc(l)}" aria-pressed="${i === 0 ? 'true' : 'false'}">${esc(l)}</button>`).join('\n')}
              </div>
              <div class="product-foot">
                <div class="product-price t-price" data-price-slot>${price != null ? B.money(price) : 'Price to follow'}</div>
                <div class="product-cta" data-cta-slot>${price != null
                  ? `<button class="btn btn--ghost btn--sm" type="button" data-add="${esc(p.name + ', ' + first)}|${price}">${p.soon ? 'Reserve' : 'Add to bag'}</button>`
                  : '<button class="btn btn--ghost btn--sm" type="button" disabled>Coming soon</button>'}</div>
              </div>`;
  }
  if (typeof p.price !== 'number') {
    return `<div class="product-foot">
                <div class="product-price t-price" data-price-slot>Price to follow</div>
                <div class="product-cta" data-cta-slot><button class="btn btn--ghost btn--sm" type="button" disabled>Coming soon</button></div>
              </div>`;
  }
  return `<div class="product-foot">
                <div class="product-price t-price" data-price-slot>${B.money(p.price)}</div>
                <div class="product-cta" data-cta-slot><button class="btn btn--ghost btn--sm" type="button" data-add="${esc(p.name)}|${p.price}">${p.preorder ? 'Reserve' : 'Add to bag'}</button></div>
              </div>`;
}

function cards() {
  let i = 0;
  return B.productCategories.flatMap(cat =>
    B.products.filter(p => p.cat === cat.key).map(p => {
      const n = String(++i).padStart(2, '0');
      return `          <article class="product-card${p.lengths ? ' product-card--lengths' : ''}" data-cat="${p.cat}" data-kind="product" data-item="${esc(p.name)}" data-reveal>
            ${picture(p, cat, n)}
            <div class="product-body">
              <h3 class="product-name t-h3">${esc(p.title || p.name)}</h3>
              <p class="product-blurb t-cap">${esc(p.blurb)}</p>
              ${foot(p)}
            </div>
          </article>`;
    })
  ).join('\n\n');
}

const MARKERS = [
  ['<!--BUILD:filters-->', '<!--/BUILD:filters-->', filters],
  ['<!--BUILD:products-->', '<!--/BUILD:products-->', cards]
];

const file = path.join(ROOT, 'shop.html');
let html = fs.readFileSync(file, 'utf8');

for (const [open, close, fn] of MARKERS) {
  const a = html.indexOf(open);
  const b = html.indexOf(close);
  if (a === -1 || b === -1 || b < a) { console.error('MISSING MARKER: ' + open); process.exit(1); }
  html = html.slice(0, a + open.length) + '\n' + fn() + '\n' + html.slice(b);
}

fs.writeFileSync(file, html);

const byCat = B.productCategories
  .map(c => c.label + ' ' + B.products.filter(p => p.cat === c.key).length)
  .join(', ');
console.log('shop.html rebuilt, ' + B.products.length + ' products across ' +
  B.productCategories.length + ' categories.');
console.log('  ' + byCat);
const unpriced = B.products.filter(p => p.lengths ? !Object.keys(p.lengthPrices || {}).length : typeof p.price !== 'number').length;
console.log('  ' + unpriced + ' awaiting prices from the studio.');
