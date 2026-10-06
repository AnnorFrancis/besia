/* ============================================================
   image-manifest.js, every photograph on the site and where it
   comes from.

   One row per picture. build-images.js reads this and rebuilds every
   web file from the client's originals in "NEW VIDEOS AND IMAGES"
   (WhatsApp copies, not committed), so the whole set can be
   regenerated after a better source file or a change of crop with
   one command:   node tools/build-images.js

   src   file name inside "NEW VIDEOS AND IMAGES"
   crop  x:y:w:h in source pixels, taken before restoring (used to
         lift the clean photo half out of her Hair Botox slides and
         the tiles out of her mood board)
   max   longest edge of the full-size WebP (default 1600)
   note  what the picture shows, for whoever picks images later
   ============================================================ */
module.exports = [
  /* A-Beauty campaign */
  { name: 'abeauty-ritual',            src: 'WhatsApp Image 2026-10-05 at 1.00.57 PM.jpeg', note: 'Two women in kente gowns pouring water between bowls, desert, pink walls. Landscape, no text' },
  { name: 'abeauty-cover-terracotta',  src: 'WhatsApp Image 2026-10-05 at 1.00.58 PM.jpeg', note: 'A-Beauty magazine cover, cowrie braids, terracotta. Title in the picture' },
  { name: 'abeauty-cover-river',       src: 'WhatsApp Image 2026-10-05 at 1.00.59 PM.jpeg', note: 'A-Beauty magazine cover, river boat. Title in the picture' },
  { name: 'abeauty-cover-oranges',     src: 'h.jpeg',                                        note: 'A-Beauty magazine cover, oranges and ochre. Title in the picture' },

  /* Editorial portraits */
  { name: 'editorial-curls-sky',       src: 'WhatsApp Image 2026-10-05 at 1.01.01 PM.jpeg', note: 'Woman with curls against a deep blue sky' },
  { name: 'editorial-white-terracotta',src: 'WhatsApp Image 2026-10-05 at 1.01.04 PM.jpeg', note: 'Woman in a white ruffled shirt on terracotta' },
  { name: 'editorial-hair-story',      src: 'ii.jpeg',                                       note: 'Balayage blowout, "your hair story"' },
  { name: 'editorial-curls-highlights',src: 'yy.jpeg',                                       note: 'Curly highlights, close' },
  { name: 'lifestyle-sunset',          src: 'k.jpeg',                                        note: 'Woman in a white robe at sunset by a fire bowl. Campaign image, not a treatment' },
  { name: 'model-profile-sleek',       src: 'WhatsApp Image 2026-10-05 at 1.01.03 PM.jpeg', crop: '620:0:615:1156', note: 'Sleek profile, lifted from Hair Botox slide 06' },
  { name: 'texture-curls',             src: 'mm.jpeg',                                       crop: '520:0:692:1253',  note: 'Wet defined curls, lifted from Hair Botox slide 09' },
  { name: 'editorial-curls-portrait',  src: 'uu.jpeg',                                       crop: '270:0:294:688',   note: 'Curly portrait in a cream vest, lifted from slide 02. Small source, restored 4x' },
  { name: 'editorial-curls-smile',     src: 'vv.jpeg',                                       crop: '200:0:205:429',   note: 'Smiling curly portrait, lifted from slide 05. Tiny source, phone sizes only' },

  /* The studio */
  { name: 'studio-push-door',          src: 'WhatsApp Image 2026-10-05 at 1.01.23 PM.jpeg', note: 'Woman at the PUSH door' },
  { name: 'studio-logo-wall-1',        src: 'WhatsApp Image 2026-10-05 at 1.01.23 pp.jpeg', note: 'Woman at the fluted oak BESIA logo wall' },
  { name: 'studio-logo-wall-2',        src: 'WhatsApp Image 2026-10-05 at 1.01.24 PM.jpeg', note: 'Woman at the logo wall, second' },
  { name: 'studio-logo-wall-3',        src: 'yio.jpeg',                                      note: 'Woman at the logo wall, third' },
  { name: 'studio-mirror-chair',       src: 'WhatsApp Image 2026-10-05 at 1.01.07 PM.jpeg', note: 'Model in the salon chair, ornate gold mirror, black ground' },
  { name: 'studio-lounge',             src: 'rr.jpeg',                                       note: 'Woman in the studio lounge' },

  /* Products and still life */
  { name: 'product-model-waves',       src: 'pp.jpeg',                                       note: 'Model with long waves holding Follicle Fuel' },
  { name: 'product-model-blush',       src: 'y.jpeg',                                        note: 'Smiling woman holding Follicle Fuel on blush' },
  { name: 'product-hair-botox',        src: 'kk.jpeg',                                       crop: '500:0:641:1254',  note: 'Hair Botox pump bottle, lifted from slide 07' },
  { name: 'still-travertine',          src: 'oo.jpeg',                                       crop: '0:0:470:440',     note: 'Travertine bowl, mood board tile' },
  { name: 'still-tools',               src: 'oo.jpeg',                                       crop: '0:565:470:400',   note: 'Scissors and brushes on oatmeal, mood board tile' },
  { name: 'still-dried-flowers',       src: 'oo.jpeg',                                       crop: '480:565:687:599', note: 'Dried flowers on espresso, mood board tile' },
  { name: 'moodboard-model',           src: 'oo.jpeg',                                       crop: '480:0:687:455',   note: 'Blonde balayage profile, mood board tile' },
  { name: 'still-comb',                src: 'WhatsApp Image 2026-10-05 at 1.01.02 PM.jpeg', crop: '205:0:211:428',   note: 'Wide-tooth comb in hair, lifted from slide 04. Tiny source, phone sizes only' }
];
