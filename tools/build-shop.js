/* ============================================================
   build-shop.js, regenerates the shop grid on shop.html from
   js/besia-data.js. Same contract as build-services.js: one
   source of truth, static HTML out.

   Run:  node tools/build-shop.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));

const esc = s => String(s)
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
  'images/hair-care-cosmetics/care-1.jpg': 'Bottle of Moringa Ginseng follicle oil',
  'images/hair-care-cosmetics/care-2.jpg': 'Moringa scalp oil jar with serum bottle',
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
  const out = ['          <button class="filter-btn is-active" data-shop-filter="all">Everything</button>'];
  B.productCategories.forEach(c => {
    out.push('          <button class="filter-btn" data-shop-filter="' + c.key + '">' + esc(c.label) + '</button>');
  });
  return out.join('\n');
}

function cards() {
  return B.productCategories.flatMap(cat =>
    B.products.filter(p => p.cat === cat.key).map(p => {
      const alt = ALT[p.img] || p.name;
      const pre = p.preorder;
      return `          <article class="product-card" data-cat="${p.cat}" data-kind="product" data-item="${esc(p.name)}" data-reveal>
            <div class="product-img"><img src="./${p.img}" alt="${esc(alt)}" width="700" height="875" loading="lazy" decoding="async"><span class="product-tag">${esc(cat.label)}</span>${pre ? '<span class="product-flag">Launching soon</span>' : ''}</div>
            <div class="product-body">
              <h3 class="product-name">${esc(p.name)}</h3>
              <p class="product-blurb">${esc(p.blurb)}</p>
              <div class="product-price" data-price-slot>${B.money(p.price)}</div>
              <div class="product-cta" data-cta-slot><button class="btn btn--ghost-dark" type="button" data-add="${esc(p.name)}|${p.price}">${pre ? 'Pre-order' : 'Add to Cart'}</button></div>
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
