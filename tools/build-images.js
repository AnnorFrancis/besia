/* ============================================================
   build-images.js, turns the client's WhatsApp photographs into the
   pictures the site ships.

   For every row in tools/image-manifest.js:
     1. cut      the crop, if any, straight out of the original.
     2. restore  the picture through Real-ESRGAN (x4plus, on the GPU),
                 the AI restorer that rebuilds the detail WhatsApp
                 compression threw away: skin, hair, fabric, stone.
                 Needs tools/_bin/realesrgan/realesrgan-ncnn-vulkan.exe
                 (portable, from github.com/xinntao/Real-ESRGAN releases,
                 realesrgan-ncnn-vulkan-20220424-windows.zip). Without
                 it the build falls back to the original pixels.
     3. web      media/img/<name>.webp      longest edge 1600 (or max)
                 media/img/<name>-sm.webp   longest edge 720
                 media/img/<name>-blur.webp 48 wide, heavily blurred,
                                            the placeholder that paints
                                            before the picture arrives
                 media/img/index.json       width and height of each,
                                            read by the page generators
   Downscaling from four times the size is what makes the result
   honest: the restorer's guesses are averaged away and only the
   cleaner edges and smoother skin remain.

   Run:  node tools/build-images.js            (only what changed)
         node tools/build-images.js --force    (everything)
         node tools/build-images.js still-tools (one picture)
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'NEW VIDEOS AND IMAGES');
const WORK = path.join(ROOT, 'media', '_masters', 'img');
const OUT = path.join(ROOT, 'media', 'img');
const MANIFEST = require('./image-manifest.js');
const SR_BIN = path.join(ROOT, 'tools', '_bin', 'realesrgan', 'realesrgan-ncnn-vulkan.exe');
const SR = fs.existsSync(SR_BIN);
if (!SR) console.warn('  Real-ESRGAN not found at tools/_bin/realesrgan, shipping the original pixels');

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter(a => !a.startsWith('--'));

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const run = (bin, a) => execFileSync(bin, a, { stdio: ['ignore', 'ignore', 'pipe'] });
const dims = f => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]).toString().trim().split(',').map(Number);
const kb = f => Math.round(fs.statSync(f).size / 1024);

function cut(row, file) {
  /* manifest says x:y:w:h, ffmpeg's crop wants w:h:x:y */
  const c = row.crop ? row.crop.split(':').map(Number) : null;
  const vf = c ? ['-vf', `crop=${c[2]}:${c[3]}:${c[0]}:${c[1]}`] : [];
  /* `at`: a still lifted from one of her films, that many seconds in */
  const seek = row.at != null ? ['-ss', String(row.at)] : [];
  run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...seek, '-i', path.join(SRC, row.src), '-frames:v', '1', ...vf, file]);
}

function restore(inFile, outFile) {
  run(SR_BIN, ['-i', inFile, '-o', outFile, '-n', 'realesrgan-x4plus', '-f', 'png', '-m', path.join(path.dirname(SR_BIN), 'models')]);
  const [w] = dims(outFile);
  const [w0] = dims(inFile);
  if (w !== w0 * 4 || fs.statSync(outFile).size < 200 * 1024) {
    throw new Error('Real-ESRGAN failed on ' + path.basename(inFile) + ': the GPU dropped out. Close other GPU work and run again.');
  }
}

function web(src, row) {
  const base = path.join(OUT, row.name);
  const scaler = 'lanczos+accurate_rnd+full_chroma_int';
  const fit = (edge) => `scale='min(${edge},iw)':'min(${edge},ih)':force_original_aspect_ratio=decrease:flags=${scaler}`;
  const out = (vf, file, q) => run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', src, '-vf', vf,
    '-c:v', 'libwebp', '-quality', String(q), '-compression_level', '6', file]);
  out(fit(row.max || 1600) + ',cas=0.12', base + '.webp', 82);
  out(fit(720) + ',cas=0.12', base + '-sm.webp', 78);
  out('scale=48:-2:flags=area,gblur=sigma=3', base + '-blur.webp', 60);
}

let built = 0, skipped = 0;
const t0 = Date.now();
for (const row of MANIFEST) {
  if (only.length && !only.includes(row.name)) continue;
  const src = path.join(SRC, row.src);
  if (!fs.existsSync(src)) { console.error('  MISSING SOURCE  ' + row.name + '  (' + row.src + ')'); process.exitCode = 1; continue; }
  const sig = crypto.createHash('sha1').update(JSON.stringify(row) + fs.statSync(src).size + (SR ? ':sr' : ':plain')).digest('hex').slice(0, 12);
  const stamp = path.join(WORK, row.name + '.sig');
  const done = fs.existsSync(path.join(OUT, row.name + '.webp')) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === sig;
  if (done && !force) { skipped++; continue; }

  const cutFile = path.join(WORK, row.name + '_cut.png');
  const bigFile = path.join(WORK, row.name + '_restored.png');
  cut(row, cutFile);
  if (SR) restore(cutFile, bigFile);
  web(SR ? bigFile : cutFile, row);
  fs.rmSync(cutFile, { force: true });
  fs.rmSync(bigFile, { force: true });
  fs.writeFileSync(stamp, sig);
  built++;
  const [w, h] = dims(path.join(OUT, row.name + '.webp'));
  console.log('  ' + row.name.padEnd(28) + String(w).padStart(5) + 'x' + String(h).padEnd(5) + ' full: ' +
    String(kb(path.join(OUT, row.name + '.webp'))).padStart(4) + ' KB   sm: ' + String(kb(path.join(OUT, row.name + '-sm.webp'))).padStart(3) + ' KB');
}

/* index.json: dimensions for width and height attributes on every <img>. */
const index = {};
for (const row of MANIFEST) {
  const f = path.join(OUT, row.name + '.webp');
  if (!fs.existsSync(f)) continue;
  const [w, h] = dims(f);
  const [ws, hs] = dims(path.join(OUT, row.name + '-sm.webp'));
  index[row.name] = { w, h, wSm: ws, hSm: hs, kb: kb(f), kbSm: kb(path.join(OUT, row.name + '-sm.webp')), note: row.note || '' };
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1) + '\n');

console.log('pictures built: ' + built + ', unchanged: ' + skipped + ', in ' + Math.round((Date.now() - t0) / 1000) + 's');
