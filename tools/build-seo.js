/* ============================================================
   build-seo.js, titles, meta descriptions, canonical URLs,
   Open Graph / Twitter cards, JSON-LD, robots.txt and sitemap.xml.

   Change SITE_URL below to the live domain before deploying.

   Run:  node tools/build-seo.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));

/* >>> The one line to change when the domain is decided. <<< */
const SITE_URL = 'https://annorfrancis.github.io/besia';

/* >>> Set to false the day this becomes Bēsia's live site. <<<
   While it is a proposal it is hosted under Perkins Creative's account, so it
   must not be indexed: a demo carrying her name and placeholder retail prices
   could outrank her real Fresha booking page and take bookings away from her.
   Flipping this to false and re-running removes every noindex and opens
   robots.txt back up. Nothing else changes. */
const IS_PROPOSAL = true;

const OG_IMAGE = '/media/img/abeauty-ritual.webp';   /* her own A-Beauty campaign, landscape, 1600 by 900 */

const PAGES = {
  'index.html': {
    title: 'Bēsia Beauty Studio · Fusion Extensions & Hair Care, Cantonments Accra',
    desc: "Ghana's home of fusion extensions. KTips, ITips and tape-ins, vegan formaldehyde-free Nanoplasty, treatment-led scalp care, and a beauty supply with our own Follicle Fuel. 54 Fifth Circular Road, Cantonments, Accra.",
    prio: '1.0'
  },
  'services.html': {
    title: 'Services & Prices · Bēsia Beauty Studio, Cantonments Accra',
    desc: 'The complete menu, every price published: fusion extensions, Nanoplasty and Hair Botox, scalp and bond repair, natural styling, silk press, braids, crochet, wigs, colour, cutting and lashes. Book and pay online.',
    prio: '0.9'
  },
  'shop.html': {
    title: 'Shop · Follicle Fuel, Bēsia Lab and our hair · Bēsia Beauty Studio',
    desc: 'Welcome to your new growth era. Follicle Fuel Hair Growth Oil and the Bēsia Lab line, the professional care we prescribe, and our hair: bundles, fusion bundles, crochet, tape-ins and 5x5 HD frontals, 16 to 30 inches.',
    prio: '0.9'
  },
  'gallery.html': {
    title: 'Gallery · The A-Beauty covers and the work · Bēsia Beauty Studio',
    desc: 'The A-Beauty magazine covers, the studio on Fifth Circular Road, her campaigns and her films. Every picture is her own.',
    prio: '0.7'
  },
  'about.html': {
    title: 'About · The studio, Dana, the standard · Bēsia Beauty Studio',
    desc: "Ghana's home of fusion extensions and the first studio in the country with a vegan, formaldehyde-free texture system. A studio in Cantonments built on one rule: hair health before the look.",
    prio: '0.7'
  },
  'packages.html': {
    title: 'The Hair Club at Bēsia · Hair wellness plans and membership, Cantonments Accra',
    desc: 'Start with the Blueprint, your own hair wellness plan, then the membership: a treatment every month, member savings, rewards and first access. Plus the Hair CPR detox and our treatment pairings.',
    prio: '0.8'
  },
  'classes.html': {
    title: 'The School at Bēsia · Bēsia Beauty Academy, Cantonments Accra',
    desc: 'Your hands can build your life. Certified training in fusion extensions (K-Tip, I-Tip, beaded weft, tape-in), healthy hair and growth, and Hair Botox and Nanoplasty. Small cohorts or one to one, in Cantonments, Accra.',
    prio: '0.8'
  },
  'contact.html': {
    title: 'Book & Contact · Bēsia Beauty Studio, Cantonments Accra',
    desc: 'Book an appointment at 54 Fifth Circular Road, Cantonments, Accra. Choose your services at published prices and pay online by Mobile Money or card. Open Monday to Saturday, 9am to 7pm.',
    prio: '0.9'
  },
  'checkout.html': { title: 'Checkout · Bēsia Beauty Studio', desc: 'Confirm your order from the Bēsia shop. Pay by Mobile Money or card, collect in Cantonments or have it delivered in Accra.', prio: '0.4', noindex: true },
  'track.html': { title: 'Track an order · Bēsia Beauty Studio', desc: 'Enter the order number from your checkout screen and follow your Bēsia shop order live.', prio: '0.4' }
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- JSON-LD for the home page ---------- */
function jsonLd() {
  const b = B.business;
  const data = {
    '@context': 'https://schema.org',
    '@type': ['HealthAndBeautyBusiness', 'HairSalon'],
    name: b.nameFull,
    description: "Ghana's home of fusion extensions, specialising in seamless KTips and microlinks. The first studio in Ghana to offer a safe, vegan, formaldehyde-free straightening and texturising system.",
    url: SITE_URL + '/',
    telephone: '+233' + b.phone.replace(/\D/g, '').replace(/^0/, ''),
    email: b.email,
    image: SITE_URL + OG_IMAGE,
    priceRange: 'GHS 165 to 7000',
    currenciesAccepted: b.currency,
    paymentAccepted: 'Cash, Mobile Money, Credit Card, Debit Card',
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.street,
      addressLocality: b.area + ', ' + b.city,
      addressRegion: b.region + ' Region',
      addressCountry: 'GH'
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00', closes: '19:00'
    }],
    sameAs: [b.instagram, b.tiktok],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: b.rating, reviewCount: b.reviewCount },
    hasOfferCatalog: B.serviceCategories.map(c => ({
      '@type': 'OfferCatalog',
      name: c.label,
      itemListElement: B.byCategory(c.key).map(s => ({
        '@type': 'Offer',
        priceCurrency: b.currency,
        price: B.priceOf(s),
        itemOffered: { '@type': 'Service', name: s.name, category: c.label }
      }))
    }))
  };
  return '  <script type="application/ld+json">\n' + JSON.stringify(data, null, 2)
    .split('\n').map(l => '  ' + l).join('\n') + '\n  </script>\n';
}

/* ---------- rewrite each page head ---------- */
let done = 0;
for (const [file, meta] of Object.entries(PAGES)) {
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) { console.error('  missing page: ' + file); continue; }
  let s = fs.readFileSync(fp, 'utf8');

  // title + description
  s = s.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(meta.title) + '</title>');
  s = s.replace(/<meta name="description" content="[\s\S]*?">/,
    '<meta name="description" content="' + esc(meta.desc) + '">');

  // strip any block we previously generated, so this is idempotent
  s = s.replace(/\n?  <!-- BUILD:seo -->[\s\S]*?<!-- \/BUILD:seo -->\n?/, '\n');

  const url = SITE_URL + '/' + (file === 'index.html' ? '' : file);
  const block =
    '  <!-- BUILD:seo -->\n' +
    '  <link rel="canonical" href="' + url + '">\n' +
    (meta.noindex || IS_PROPOSAL ? '  <meta name="robots" content="noindex,follow">\n' : '') +
    '  <meta property="og:type" content="website">\n' +
    '  <meta property="og:site_name" content="' + esc(B.business.nameFull) + '">\n' +
    '  <meta property="og:title" content="' + esc(meta.title) + '">\n' +
    '  <meta property="og:description" content="' + esc(meta.desc) + '">\n' +
    '  <meta property="og:url" content="' + url + '">\n' +
    '  <meta property="og:image" content="' + SITE_URL + OG_IMAGE + '">\n' +
    '  <meta property="og:image:width" content="1600">\n' +
    '  <meta property="og:image:height" content="900">\n' +
    '  <meta property="og:locale" content="en_GH">\n' +
    '  <meta name="twitter:card" content="summary_large_image">\n' +
    '  <meta name="twitter:title" content="' + esc(meta.title) + '">\n' +
    '  <meta name="twitter:description" content="' + esc(meta.desc) + '">\n' +
    '  <meta name="twitter:image" content="' + SITE_URL + OG_IMAGE + '">\n' +
    (file === 'index.html' ? jsonLd() : '') +
    '  <!-- /BUILD:seo -->\n';

  s = s.replace('</head>', block + '</head>');
  fs.writeFileSync(fp, s);
  done++;
}
console.log('SEO head written for ' + done + ' pages.');

/* ---------- robots.txt ---------- */
fs.writeFileSync(path.join(ROOT, 'robots.txt'), IS_PROPOSAL
? `# This is a proposal build hosted under the developer's account, not the
# studio's live site. Nothing here should be indexed while that is true.
# See IS_PROPOSAL in tools/build-seo.js.
User-agent: *
Disallow: /
`
: `User-agent: *
Allow: /

# The studio manager is a private back office, not public content.
Disallow: /admin/
Disallow: /checkout.html

Sitemap: ${SITE_URL}/sitemap.xml
`);

/* ---------- sitemap.xml ---------- */
const today = new Date().toISOString().slice(0, 10);
const urls = Object.entries(PAGES)
  .filter(([, m]) => !m.noindex)
  .map(([file, m]) => {
    const loc = SITE_URL + '/' + (file === 'index.html' ? '' : file);
    return '  <url>\n    <loc>' + loc + '</loc>\n    <lastmod>' + today +
      '</lastmod>\n    <priority>' + m.prio + '</priority>\n  </url>';
  }).join('\n');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls + '\n</urlset>\n');

/* ---------- .nojekyll (GitHub Pages serves _-prefixed paths) ---------- */
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');

console.log('robots.txt, sitemap.xml (' + Object.values(PAGES).filter(m => !m.noindex).length +
  ' urls) and .nojekyll written.');
console.log('site URL: ' + SITE_URL + '  (change SITE_URL in this file before deploying)');
