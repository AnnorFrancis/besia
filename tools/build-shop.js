/* ============================================================
   build-shop.js, regenerates the hair library on shop.html from
   js/besia-data.js. Same contract as build-services.js: one source
   of truth, static HTML out.

   Hooks kept for the page script, js/store.js and js/site-sync.js:
     [data-shop-filter]                         the filter chips
     #shop-grid .product-card[data-cat][data-item]
     .product-img img, .product-tag, .product-flag
     .product-price[data-price-slot], .product-cta[data-cta-slot]
     button[data-add="name|price"]
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

/* Alt text per image, so every product still reads correctly to a
   screen reader and to Google Images. */
const ALT = {
  'images/extensions/ext-1.jpg': 'Rooted blonde ombré weft extensions laid flat',
  'images/extensions/ext-2.jpg': 'Honey-brown ombré extensions worn long',
  'images/bundles/bundle-1.jpg': 'Ginger straight human-hair bundles laid flat',
  'images/bundles/bundle-2.jpg': 'Jet black body-wave bundles installed, back view',
  'images/closures-frontals/unit-1.jpg': 'Highlighted closure unit on a mannequin',
  'images/closures-frontals/unit-2.jpg': 'Caramel highlighted straight unit, back view',
  'images/closures-frontals/unit-3.jpg': 'Amber ginger ombré straight closure unit, back view',
  'images/wigs/wig-1.jpg': 'Silky straight lace closure wig on a mannequin',
  'images/wigs/wig-2.jpg': 'Extra-long jet straight wig, side view on a mannequin',
  'images/wigs/wig-3.jpg': 'Ash blonde body-wave lace frontal wig on a mannequin bust',
  'images/wigs/wig-4.jpg': 'Honey ginger straight wig with a dark root melt',
  'images/wigs/wig-5.jpg': 'Honey blonde ombré straight wig, back view',
  'images/wigs/wig-6.jpg': 'Jet black body-wave unit worn long, back view',
  'media/video/bottle-specimen-poster.webp': 'The frosted green Follicle Fuel Hair Growth Oil bottle',
  'media/video/beard-oil-poster.webp': 'The amber Follicle Fuel Beard Oil bottle on terracotta sand',
  'media/img/product-hair-botox.webp': 'The Bēsia Hair Botox pump bottle',
  'images/hair-care-cosmetics/care-3.jpg': 'Amber dropper bottle of flaxseed and aloe hair mask',
  'images/hair-care-cosmetics/care-4.jpg': 'K18 leave-in molecular repair pump bottle',
  'images/hair-care-cosmetics/care-5.jpg': 'Olaplex bond-repair bottle with botanicals',
  'images/accessories/acc-1.jpg': 'Satin-lined bonnet in Bēsia black',
  'images/accessories/acc-2.jpg': 'Wide-tooth detangling comb',
  'images/accessories/acc-3.jpg': 'Rolled microfibre curl towel',
  'images/accessories/acc-4.jpg': 'Set of three silk scrunchies',
  'images/accessories/acc-5.jpg': 'The Bēsia studio tote in black'
};

function filters() {
  const out = ['          <button class="chip filter-btn is-active" data-shop-filter="all" aria-pressed="true">Everything <span class="n">' + B.products.length + '</span></button>'];
  B.productCategories.forEach(c => {
    const n = B.products.filter(p => p.cat === c.key).length;
    out.push('          <button class="chip filter-btn" data-shop-filter="' + c.key + '" aria-pressed="false">' + esc(c.label) + ' <span class="n">' + n + '</span></button>');
  });
  out.push('          <span class="t-credit shop-count" id="shop-count" aria-live="polite">Showing ' + B.products.length + ' of ' + B.products.length + '</span>');
  return out.join('\n');
}

function cards() {
  let i = 0;
  return B.productCategories.flatMap(cat =>
    B.products.filter(p => p.cat === cat.key).map(p => {
      const alt = ALT[p.img] || p.name;
      const pre = p.preorder;
      const n = String(++i).padStart(2, '0');
      return `          <article class="product-card" data-cat="${p.cat}" data-kind="product" data-item="${esc(p.name)}" data-reveal>
            <div class="product-img plate plate--3x4"><img src="./${p.img}" alt="${esc(alt)}" width="700" height="933" loading="lazy" decoding="async"><span class="product-tag t-credit"><span class="n">${n}</span><i class="cat">${esc(cat.label)}</i></span>${pre ? '<span class="product-flag">Launching soon</span>' : ''}</div>
            <div class="product-body">
              <h3 class="product-name t-h3">${esc(p.name)}</h3>
              <p class="product-blurb t-cap">${esc(p.blurb)}</p>
              <div class="product-foot">
                <div class="product-price t-price" data-price-slot>${B.money(p.price)}</div>
                <div class="product-cta" data-cta-slot><button class="btn btn--ghost btn--sm" type="button" data-add="${esc(p.name)}|${p.price}">${pre ? 'Reserve' : 'Add to bag'}</button></div>
              </div>
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

/* Guard: every product image must exist on disk. */
let missing = 0;
B.products.forEach(p => {
  if (!fs.existsSync(path.join(ROOT, p.img))) { console.error('  MISSING IMAGE: ' + p.img); missing++; }
});
console.log(missing ? '  ' + missing + ' missing images!' : '  all product images present.');
