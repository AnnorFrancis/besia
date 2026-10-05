/* ============================================================
   media-manifest.js, every film on the site and where it comes from.

   One row per clip. build-video.js reads this and rebuilds every
   web file from the client's originals, so the whole video set can
   be regenerated after a new edit, a better source file, or a change
   of grade, with one command:   node tools/build-video.js

   src   file name inside "NEW VIDEOS AND IMAGES" (not committed)
   in/out  seconds to keep. Ranges were chosen frame by frame to
         avoid the captions burned into her campaign films.
   crop  w:h:x:y applied before scaling (removes caption bands)
   loop  crossfade the tail into the head so it repeats seamlessly
   poster  second to grab the still frame from (after trimming)
   ============================================================ */
module.exports = [
  /* The studio */
  { name: 'entry-film',        src: 'ff.mp4',                                          in: 0,   out: 9.9,  loop: 0.8, poster: 1.3, note: 'PUSH door, the owner welcomes you in, oak logo wall, arches' },
  { name: 'hairclub-mirror',   src: 'WhatsApp Video 2026-10-05 at 1.01.04 PM.mp4',     in: 4.0, out: 10.9, crop: '576:768:0:0', loop: 0.8, poster: 0.6, note: 'The Hair Club film, linen dress at the arched backlit mirror' },
  { name: 'founder-arrives',   src: 'WhatsApp Video 2026-10-05 at 1.01.36 PM.mp4',     in: 0,   out: 3.9,  loop: 0.6, poster: 1.0, note: 'The founder walking the arched corridor' },
  { name: 'wash-ritual',       src: 'WhatsApp Video 2026-10-05 at 1.01.16 PM.mp4',     in: 0,   out: 6.6,  loop: 0.8, poster: 2.0, note: 'Scalp cleanse at the basin' },
  { name: 'wash-ritual-curls', src: 'WhatsApp Video 2026-10-05 at 1.01.21 PM.mp4',     in: 0,   out: 7.1,  loop: 0.8, poster: 2.6, note: 'Curls lathered at the basin' },
  { name: 'braid-finish',      src: 'WhatsApp Video 2026-10-05 at 1.01.06 PMo.mp4',    in: 0,   out: 4.0,  loop: 0.6, poster: 1.5, note: 'Finishing braid ends' },

  /* Follicle Fuel, her product line */
  { name: 'follicle-campaign', src: 'WhatsApp Video 2026-10-05 at 12.45.10 PM.mp4',    in: 9.0, out: 14.9, crop: '576:816:0:0', loop: 0.8, poster: 3.4, note: 'The bottle rises through flying hair' },
  { name: 'beard-oil',         src: 'WhatsApp Video 2026-10-05 at 12.45.14 PM.mp4',    in: 0.5, out: 10.5, loop: 0.8, poster: 4.0, note: 'Follicle Fuel Beard Oil on terracotta sand' },
  { name: 'velvet',            src: 'WhatsApp Video 2026-10-05 at 12.45.42 PM.mp4',    in: 4.0, out: 10.0, loop: 0.8, poster: 1.5, note: 'Bottle on black velvet with rose-gold combs' },
  { name: 'dandelion-field',   src: 'WhatsApp Video 2026-10-05 at 12.45.49 PM.mp4',    in: 5.0, out: 14.8, loop: 0.8, poster: 6.0, note: 'Good things grow here, the bottle rises from the field' },
  { name: 'growth-era',        src: 'WhatsApp Video 2026-10-05 at 12.46.02 PM.mp4',    in: 0,   out: 10.0, loop: 0.8, poster: 7.4, note: 'Black Star Gate, Accra: welcome to your new growth era' },
  { name: 'growth-era-b',      src: 'WhatsApp Video 2026-10-05 at 12.45.59 PM.mp4',    in: 0,   out: 10.0, loop: 0.8, poster: 7.4, note: 'Black Star Gate, alternate take' },
  { name: 'dropper',           src: 'WhatsApp Video 2026-10-05 at 12.46.05 PM.mp4',    in: 0,   out: 6.0,  loop: 0.6, poster: 3.2, note: 'Dropper macro, oil falling' },
  { name: 'bottle-hand',       src: 'WhatsApp Video 2026-10-05 at 12.46.07 PM.mp4',    in: 0,   out: 6.0,  loop: 0.6, poster: 1.0, note: 'Hand with sage nails, bottle' },
  { name: 'bottle-specimen',   src: 'WhatsApp Video 2026-10-05 at 12.46.09 PM.mp4',    in: 0,   out: 6.0,  loop: 0.6, poster: 2.0, note: 'Slow push-in on the bottle' },
  { name: 'splash',            src: 'WhatsApp Video 2026-10-05 at 12.46.11 PM.mp4',    in: 0,   out: 6.0,  loop: 0.6, poster: 1.2, note: 'Bottle in pink water, ripples' },
  { name: 'splash-b',          src: 'WhatsApp Video 2026-10-05 at 12.46.13 PM.mp4',    in: 0,   out: 6.0,  loop: 0.6, poster: 4.5, note: 'Bottle in pink water, splash' },
  { name: 'bottle-teal',       src: 'WhatsApp Video 2026-10-05 at 12.46.16 PM.mp4',    in: 0,   out: 6.0,  loop: 0.6, poster: 2.0, note: 'Bottle on teal with soft flowers' }
];
