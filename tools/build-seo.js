/* ============================================================
   build-seo.js — titles, meta descriptions, canonical URLs,
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

const OG_IMAGE = '/images/studio/studio-reception.jpg';

const PAGES = {
  'index.html': {
    title: 'Bēsia Beauty Studio — Fusion Extensions & Hair Care, Cantonments Accra',
    desc: "Ghana's home of fusion extensions. UK-certified KTips and microlinks, vegan formaldehyde-free Nanoplasty, and treatment-led scalp and bond care at 54 Fifth Circular Road, Cantonments, Accra.",
    prio: '1.0'
  },
  'services.html': {
    title: 'Services & Prices — Bēsia Beauty Studio, Accra',
    desc: 'All 47 services with published prices and durations: fusion extensions, Nanoplasty and Hair Botox, Olaplex and K18 bond repair, colour, cutting, Curl Revive and silk press.',
    prio: '0.9'
  },
  'shop.html': {
    title: 'Shop — Hair, Units & Home Care | Bēsia Beauty Studio',
    desc: 'The same hair we install and the products we treat with: KTip bundles, tape-in wefts, HD closures and frontals, glueless units, flaxseed masks, K18 and Olaplex. Pay by Mobile Money or card.',
    prio: '0.9'
  },
  'gallery.html': {
    title: 'Look Book — Bēsia Beauty Studio, Cantonments',
    desc: 'Client looks and the studio itself — fusion extensions, braids and cornrows, lashes and brows, photographed at 54 Fifth Circular Road, Cantonments, Accra.',
    prio: '0.7'
  },
  'about.html': {
    title: 'About — Bēsia Beauty Studio, Accra',
    desc: "Ghana's home of fusion extensions and the first studio in the country to offer a vegan, formaldehyde-free straightening system. A beauty collaborative in Cantonments, Accra.",
    prio: '0.7'
  },
  'packages.html': {
    title: 'Packages & Price Builder — Bēsia Beauty Studio',
    desc: 'Our own multi-service bundles — Curl Revive + Flax, Curl Revive with FlaxGRO and the Nanoplasty signature — or build your own combination and see the total update live.',
    prio: '0.8'
  },
  'contact.html': {
    title: 'Book an Appointment — Bēsia Beauty Studio, Cantonments Accra',
    desc: 'Book at 54 Fifth Circular Road, Cantonments. Open Mon–Sat 9am–7pm. Get an instant estimate from our published prices — the first consultation is free.',
    prio: '0.9'
  },
  'checkout.html': { title: 'Checkout — Bēsia Beauty Studio', desc: 'Review your bag, choose pickup or delivery, and pay by Mobile Money, card or on collection.', prio: '0.4', noindex: true },
  'track.html': { title: 'Track Your Order — Bēsia Beauty Studio', desc: 'Enter your order number to follow it live, from confirmed through to collected or delivered.', prio: '0.4' }
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
    priceRange: 'GHS 165–7000',
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
    (meta.noindex ? '  <meta name="robots" content="noindex,follow">\n' : '') +
    '  <meta property="og:type" content="website">\n' +
    '  <meta property="og:site_name" content="' + esc(B.business.nameFull) + '">\n' +
    '  <meta property="og:title" content="' + esc(meta.title) + '">\n' +
    '  <meta property="og:description" content="' + esc(meta.desc) + '">\n' +
    '  <meta property="og:url" content="' + url + '">\n' +
    '  <meta property="og:image" content="' + SITE_URL + OG_IMAGE + '">\n' +
    '  <meta property="og:image:width" content="1920">\n' +
    '  <meta property="og:image:height" content="1080">\n' +
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
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
`User-agent: *
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
