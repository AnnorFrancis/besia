/* ============================================================
   build-video.js, turns the client's WhatsApp films into web films.

   For every row in tools/media-manifest.js:
     1. master  trim, crop away caption bands, deblock, denoise,
                deband, upscale to 720 wide, luma-only sharpen and a
                gentle grade in 16-bit RGB. Kept in media/_masters
                (large, never committed, never shipped).
     2. loop    if asked, dissolve the tail into the head so the film
                repeats without a visible jump.
     3. web     media/video/<name>-720.mp4  (desktop, H.264 High)
                media/video/<name>-480.mp4  (phones, H.264 Main)
                media/video/<name>-poster.webp     720 wide still
                media/video/<name>-poster-sm.webp  480 wide still
                media/video/<name>-blur.webp       pre-blurred still
                                                   for "baked glass"
   No audio track is shipped: every film on the site plays muted.

   The enhancement chain is the one tested in the design research
   (R3): an 8-bit grade showed a dither pattern, so the grade runs in
   16-bit RGB and the masters are 10-bit.

   ffmpeg cannot invent detail WhatsApp threw away. The real upgrade
   is the client's original files; drop them in with the same names
   and run this again.

   Run:  node tools/build-video.js            (only what changed)
         node tools/build-video.js --force    (everything)
         node tools/build-video.js entry-film (one clip)
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'NEW VIDEOS AND IMAGES');
const MASTERS = path.join(ROOT, 'media', '_masters');
const OUT = path.join(ROOT, 'media', 'video');
const MANIFEST = require('./media-manifest.js');

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter(a => !a.startsWith('--'));

fs.mkdirSync(MASTERS, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const run = (bin, a) => execFileSync(bin, a, { stdio: ['ignore', 'ignore', 'pipe'] });
const probe = (file, entries) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', entries, '-of', 'csv=p=0', file]).toString().trim();

const COLOUR = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
const MASTER_ENC = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '10', '-pix_fmt', 'yuv420p10le', ...COLOUR];

function master(row, file) {
  const src = path.join(SRC, row.src);
  const rate = probe(src, 'stream=r_frame_rate').split('/');
  const fps = Math.round(Number(rate[0]) / Number(rate[1] || 1));
  const vf = [];
  if (row.crop) vf.push('crop=' + row.crop);
  if (fps > 30) vf.push('fps=30');
  vf.push(
    'deblock=filter=weak:block=4:alpha=0.10:beta=0.06:gamma=0.05:delta=0.05',
    'format=yuv420p10le',
    'hqdn3d=1.5:1.2:4:3',
    'deband=1thr=0.03:2thr=0.03:3thr=0.03:range=20:blur=1',
    'scale=720:-2:flags=lanczos+accurate_rnd+full_chroma_int',
    'format=yuv420p10le',
    'cas=0.35:planes=1',
    'format=gbrp16le',
    "curves=all='0/0 0.25/0.235 0.5/0.5 0.75/0.775 1/1'",
    'colorbalance=rs=-0.01:bs=0.015:rh=0.025:bh=-0.03',
    'vibrance=intensity=0.12',
    'format=yuv420p10le'
  );
  run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-ss', String(row.in), '-to', String(row.out),
    '-i', src, '-an', '-vf', vf.join(','), ...MASTER_ENC, file]);
}

function loop(inFile, outFile, fade) {
  const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', inFile]).toString().trim());
  const e = (d - fade).toFixed(3);
  const fc = `[0:v]split=3[a][b][c];` +
    `[a]trim=start=0:end=${fade},setpts=PTS-STARTPTS[head];` +
    `[b]trim=start=${fade}:end=${e},setpts=PTS-STARTPTS[mid];` +
    `[c]trim=start=${e}:end=${d},setpts=PTS-STARTPTS[tail];` +
    `[tail][head]xfade=transition=fade:duration=${fade}:offset=0[x];` +
    `[mid][x]concat=n=2:v=1:a=0[v]`;
  run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', inFile, '-an', '-filter_complex', fc,
    '-map', '[v]', ...MASTER_ENC, outFile]);
}

function web(m, name, posterAt) {
  const base = path.join(OUT, name);
  const dither = 'lanczos+accurate_rnd+error_diffusion';
  run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', m, '-an',
    '-vf', `scale=iw:ih:flags=${dither}`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'slow', '-crf', '26',
    '-maxrate', '900k', '-bufsize', '1800k', '-x264-params', 'aq-mode=3', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', ...COLOUR, base + '-720.mp4']);
  run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', m, '-an',
    '-vf', `scale=480:-2:flags=${dither}`,
    '-c:v', 'libx264', '-profile:v', 'main', '-level', '3.1', '-preset', 'slow', '-crf', '27',
    '-maxrate', '450k', '-bufsize', '900k', '-x264-params', 'aq-mode=3', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', ...COLOUR, base + '-480.mp4']);
  const still = (vf, out, q) => run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-ss', String(posterAt),
    '-i', m, '-frames:v', '1', '-vf', vf, '-c:v', 'libwebp', '-quality', String(q), '-compression_level', '6', out]);
  still(`scale=720:-2:flags=${dither}`, base + '-poster.webp', 80);
  still(`scale=480:-2:flags=${dither}`, base + '-poster-sm.webp', 76);
  /* Baked glass: a small, heavily blurred still. Scaled up behind a
     panel it reads as frosted glass with no live blur to pay for. */
  still('scale=240:-2:flags=area,gblur=sigma=10,eq=saturation=1.15', base + '-blur.webp', 70);
}

const kb = f => Math.round(fs.statSync(f).size / 1024);
let built = 0, skipped = 0;
const t0 = Date.now();

for (const row of MANIFEST) {
  if (only.length && !only.includes(row.name)) continue;
  const src = path.join(SRC, row.src);
  if (!fs.existsSync(src)) { console.error('  MISSING SOURCE  ' + row.name + '  (' + row.src + ')'); process.exitCode = 1; continue; }

  const sig = crypto.createHash('sha1').update(JSON.stringify(row) + fs.statSync(src).size).digest('hex').slice(0, 12);
  const stamp = path.join(MASTERS, row.name + '.sig');
  const done = fs.existsSync(path.join(OUT, row.name + '-480.mp4')) && fs.existsSync(stamp) &&
    fs.readFileSync(stamp, 'utf8') === sig;
  if (done && !force) { skipped++; continue; }

  const m1 = path.join(MASTERS, row.name + '_master.mp4');
  const m2 = path.join(MASTERS, row.name + '_loop.mp4');
  master(row, m1);
  let final = m1;
  if (row.loop) { loop(m1, m2, row.loop); final = m2; }
  web(final, row.name, row.poster || 0.8);
  fs.writeFileSync(stamp, sig);
  built++;
  const b = path.join(OUT, row.name);
  console.log('  ' + row.name.padEnd(18) + ' 720: ' + String(kb(b + '-720.mp4')).padStart(4) + ' KB   480: ' +
    String(kb(b + '-480.mp4')).padStart(4) + ' KB   poster: ' + kb(b + '-poster.webp') + ' KB   blur: ' + kb(b + '-blur.webp') + ' KB');
}

console.log('films built: ' + built + ', unchanged: ' + skipped + ', in ' + Math.round((Date.now() - t0) / 1000) + 's');
