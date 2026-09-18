/* ============================================================
   build-all.js, rebuilds the whole site and manager, in order,
   then runs the checks.

   Run:  node tools/build-all.js
   ============================================================ */
const { execFileSync } = require('child_process');
const path = require('path');

/* Order matters:
   - classes.html borrows its header and footer from services.html,
     so services must be built first.
   - build-seo stamps the <head> of every page, so it runs after any
     step that rewrites a head.
   - add-image-dims runs last, to catch images the builders emitted. */
const STEPS = [
  ['build-services.js', 'Services page + the 47-line price list'],
  ['build-shop.js',     'Shop grid and filters'],
  ['build-home.js',     'Home page teasers'],
  ['build-packages.js', 'Packages and the price builder'],
  ['build-classes.js',  'Classes page + nav link'],
  ['build-admin.js',    'Studio Manager, all pages'],
  ['build-seo.js',      'Titles, canonicals, OG, JSON-LD, sitemap'],
  ['add-image-dims.js', 'Image width/height'],
  ['build-sw.js',       'Offline service worker (must be last, it fingerprints the shell)'],
  ['check-assets.js',   'Every local asset resolves, exact case']
];

let failed = 0;
for (const [file, what] of STEPS) {
  process.stdout.write('\n▸ ' + what + '\n');
  try {
    const out = execFileSync(process.execPath, [path.join(__dirname, file)], { encoding: 'utf8' });
    process.stdout.write(out.split('\n').filter(Boolean).map(l => '   ' + l).join('\n') + '\n');
  } catch (e) {
    failed++;
    process.stdout.write('   FAILED\n' +
      String(e.stdout || '').split('\n').filter(Boolean).map(l => '   ' + l).join('\n') + '\n');
  }
}

console.log('\n' + (failed ? failed + ' step(s) failed.' : 'All steps passed. Site and manager are up to date.'));
process.exit(failed ? 1 : 0);
