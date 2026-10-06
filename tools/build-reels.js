/* ============================================================
   build-reels.js, places her films on the pages.

   A page asks for a film with one marker, and this writes the whole
   figure between it and its closing marker, so the markup js/reel.js
   expects can never drift, and the file names carry the version hash
   from media/video/index.json (a re-encode busts the cache):

     <!--REEL:{"name":"entry-film","class":"plate plate--portrait","hero":true,
               "credit":"01 · The door, film","alt":"…"}-->
     <!--/REEL:entry-film-->

   Fields: name (required), class, pos (object-position), hero (waits
   for load), foot (HTML for the caption, set beneath the film),
   watch (name of a film to open with sound), mode (overrides index).

   Every film is shown in its own shape (its width and height from
   index.json ride on the figure as --arw / --arh), never cropped to
   the page's 4:5, and nothing is laid over it: the caption sits under
   the frame. Dana, 6 Oct: "wherever there is a video, let's do it in a
   way where we can see more of the video", and any words inside her
   campaign films have to stay readable.

   Run:  node tools/build-reels.js   (build-all does this for you)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEX = path.join(ROOT, 'media', 'video', 'index.json');
const index = fs.existsSync(INDEX) ? JSON.parse(fs.readFileSync(INDEX, 'utf8')) : {};
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ICONS = {
  pause: '<svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>',
  play: '<svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg>',
  replay: '<svg class="i-replay" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3a5 5 0 1 1-4.6 3H2A6.5 6.5 0 1 0 8 1.5V0L4 3l4 3V3z"/></svg>'
};

function reel(o) {
  const v = index[o.name];
  if (!v) return '<!-- film "' + o.name + '" is not built; run node tools/build-video.js -->';
  const base = './media/video/' + o.name;
  const q = '?v=' + v.v;
  const mode = o.mode || v.mode || 'loop';
  const style = ' style="--arw: ' + v.w + '; --arh: ' + v.h + (o.pos ? '; --pos: ' + esc(o.pos) : '') + '"';
  const cls = 'reel ' + (o.class || 'plate plate--portrait');
  const cap = o.foot ? '\n  <div class="reel-cap">' + o.foot + '</div>' : '';
  const watch = o.watch ? '\n    <a class="btn btn--ghost btn--sm reel-watch" href="' + base + '-720.mp4' + q + '" data-watch="' + base + '-720.mp4' + q + '">Watch the film</a>' : '';
  return `<figure class="${cls}" data-reel="${esc(o.name)}" data-mode="${mode}"${o.hero ? ' data-hero' : ''} data-src-sm="${base}-480.mp4${q}" data-src-lg="${base}-720.mp4${q}" data-native${style}>
    <img class="reel-poster" src="${base}-poster-sm.webp${q}" srcset="${base}-poster-sm.webp${q} ${v.wSm}w, ${base}-poster.webp${q} ${v.w}w" sizes="${o.sizes || '(min-width: 1024px) 576px, 100vw'}" width="${v.w}" height="${v.h}" alt="${esc(o.alt || '')}"${o.hero ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'}>
    <video class="reel-video" muted playsinline preload="none" aria-hidden="true" tabindex="-1" disablepictureinpicture disableremoteplayback></video>${watch}
    <button type="button" class="reel-ctl" aria-label="Play film" aria-pressed="false">${ICONS.pause}${ICONS.play}${ICONS.replay}</button>
  </figure>${cap}`;
}

const PAGES = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let placed = 0, pages = 0;
for (const f of PAGES) {
  const file = path.join(ROOT, f);
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<!--REEL:')) continue;
  let changed = false;
  html = html.replace(/<!--REEL:(\{[\s\S]*?\})-->[\s\S]*?<!--\/REEL:([a-z0-9-]+)-->/g, (m, json, name) => {
    let o;
    try { o = JSON.parse(json); } catch (e) { console.error('  bad REEL marker in ' + f + ': ' + e.message); process.exitCode = 1; return m; }
    if (o.name !== name) { console.error('  REEL marker names differ in ' + f + ': ' + o.name + ' vs ' + name); process.exitCode = 1; return m; }
    placed++; changed = true;
    return '<!--REEL:' + json + '-->\n  ' + reel(o) + '\n  <!--/REEL:' + name + '-->';
  });
  if (changed) { fs.writeFileSync(file, html); pages++; }
}
console.log(placed + ' film(s) placed on ' + pages + ' page(s).');
