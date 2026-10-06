/* ============================================================
   build-classes.js, builds classes.html (The School at Bēsia)
   from js/besia-data.js.

   The page is written whole: the chrome markers are included and
   build-chrome.js fills them, the film marker is filled by
   build-reels.js. The enrolment form keeps every id js/classes.js
   reads (enrol-form, en-course, en-total, en-name, en-phone,
   en-email, en-note, input[name=plan]) and the Studio Manager's
   Classes page reads the same course ids.

   Run:  node tools/build-classes.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const IMG = JSON.parse(fs.readFileSync(path.join(ROOT, 'media', 'img', 'index.json'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = n => String(n).padStart(2, '0');
const half = c => Math.round(c.fee * B.coursePayment.depositPercent / 100);
const dayWord = c => c.days === 1 ? (c.group === 'client' ? 'one session' : 'one day') : c.days + ' days';
const seatWord = c => c.seats + (c.unit === 'per pair' ? ' pairs' : ' seats');

function pic(name, sizes, extra) {
  const im = IMG[name];
  if (!im) throw new Error('picture not built: ' + name);
  return `<img src="./media/img/${name}-sm.webp" srcset="./media/img/${name}-sm.webp ${im.wSm}w, ./media/img/${name}.webp ${im.w}w" sizes="${sizes}" width="${im.w}" height="${im.h}" alt="${esc(extra || '')}" loading="lazy" decoding="async">`;
}

const courses = B.courses;
const flagship = courses.find(c => c.flagship) || courses[0];
const pro = courses.filter(c => c.group === 'pro' && c !== flagship);
const client = courses.filter(c => c.group === 'client');

function row(c, i) {
  return `          <div class="ix-row course-row" id="course-${esc(c.id)}">
            <span class="ix-n">${pad(i)}</span>
            <span>
              <span class="ix-title">${esc(c.name)}</span>
              <span class="ix-dek">${esc(c.who)} · ${esc(c.format)}</span>
              <span class="course-blurb t-cap">${esc(c.blurb)}</span>
              <span class="course-meta t-credit">${esc(dayWord(c))} · ${esc(seatWord(c))}${c.includes ? ' · ' + esc(c.includes.join(', ')) : ''}</span>
            </span>
            <span class="ix-end course-end">
              <span class="t-price">${B.money(c.fee)}${c.unit ? ' <small>' + esc(c.unit) + '</small>' : ''}</span>
              <span class="t-cap">or ${B.money(half(c))} to reserve</span>
              <a class="btn btn--ghost btn--sm" href="#enrol" data-course="${esc(c.id)}">Enrol</a>
            </span>
          </div>`;
}

const options = courses.map(c =>
  `                  <option value="${esc(c.id)}">${esc(c.name)} · ${B.money(c.fee)}${c.unit ? ' ' + esc(c.unit) : ''}</option>`
).join('\n');

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Classes · The School at Bēsia, Cantonments Accra</title>
  <meta name="description" content="Train at Bēsia Beauty Studio in Cantonments, Accra. The Fusion Masterclass, texture systems, colour on textured hair, silk press, braiding, natural hair, lashes and brows, and evenings for clients. Pay in full or half to reserve your seat.">
  <!--CHROME:head-->
  <!--/CHROME:head-->
</head>
<body data-skin="issue" data-page="classes" data-nav="ink" data-head="The School at Bēsia" data-scripts="classes">
  <!--CHROME:top-->
  <!--/CHROME:top-->

  <main id="main">

    <!-- ============ 01 THE SCHOOL ============ -->
    <section class="section grain opener" data-ground="ink">
      <div class="container t t-spread">
        <div class="copy stack">
          <p class="eyebrow"><span class="n">Classes</span> The School at Bēsia</p>
          <h1 class="t-chap balance" data-split>Learn the work properly, in small rooms.</h1>
          <p class="t-deck">${courses.length} courses, taught in the studio in cohorts of four to six. Pay in full, or half to hold your seat.</p>
          <div class="cta-row">
            <a href="#enrol" class="btn">Reserve a seat</a>
            <a href="#courses" class="btn btn--ghost">The courses</a>
          </div>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          <span class="plate-tag"><span class="n">01</span> The school</span>
          ${pic('moodboard-model', '(min-width: 1024px) 576px, 100vw', 'A balayage profile')}
        </figure>
      </div>
    </section>

    <!-- ============ 02 THE FLAGSHIP ============ -->
    <section class="section grain" data-ground="clay" id="courses">
      <div class="container t t-spread" data-flip>
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">02</span> The flagship</p>
          <h2 class="t-chap balance">${esc(flagship.name)}</h2>
          <p class="t-deck">${esc(flagship.blurb)}</p>
          <ul class="t-index course-includes">
${(flagship.includes || []).map((l, i) => `            <li class="ix-row"><span class="ix-n">${pad(i + 1)}</span><span class="ix-title">${esc(l)}</span></li>`).join('\n')}
          </ul>
          <div class="course-price-line">
            <span class="t-price-lg">${B.money(flagship.fee)}</span>
            <span class="t-cap">${esc(dayWord(flagship))} · ${esc(seatWord(flagship))} · or ${B.money(half(flagship))} to reserve</span>
          </div>
          <div class="cta-row">
            <a href="#enrol" class="btn" data-course="${esc(flagship.id)}">Reserve a seat</a>
            <a class="link" href="./services.html#ext">The service, from GHS 2,500</a>
          </div>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          ${pic('still-tools', '(min-width: 1024px) 576px, 100vw', 'Scissors, brushes and a jar laid out on oatmeal linen')}
        </figure>
      </div>
    </section>

    <!-- ============ 03 FOR PROFESSIONALS ============ -->
    <section class="section" data-ground="ivory">
      <div class="container stack--loose stack">
        <div class="section-head" data-reveal>
          <p class="eyebrow"><span class="n">03</span> For professionals</p>
          <h2 class="t-h2 balance">Certificates, small cohorts, a model day.</h2>
          <p class="t-deck">Kit, lunch and a certificate of completion included. Tell us which course and we will offer the next date.</p>
        </div>
        <div class="t-index course-index" data-reveal-stagger>
${pro.map((c, i) => row(c, i + 1)).join('\n')}
          <div class="ix-row course-row">
            <span class="ix-n">${pad(pro.length + 1)}</span>
            <span><span class="ix-title">Private tuition</span><span class="ix-dek">Salon owners and stylists relocating to Accra · One to one, two days</span><span class="course-blurb t-cap">Any course above, taught one to one around your own clients and your own timetable.</span></span>
            <span class="ix-end course-end"><span class="t-cap">By arrangement</span><a class="link" href="mailto:hello@besia.co?subject=Private%20tuition">Ask</a></span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 04 FOR CLIENTS ============ -->
    <section class="section" data-ground="oatmeal">
      <div class="container t t-spread">
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">04</span> For clients</p>
          <h2 class="t-h2 balance">An evening on your own hair.</h2>
          <div class="t-index course-index">
${client.map((c, i) => row(c, pro.length + 2 + i)).join('\n')}
          </div>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          ${pic('editorial-curls-highlights', '(min-width: 1024px) 576px, 100vw', 'Curly highlights, close')}
        </figure>
      </div>
    </section>

    <!-- ============ 05 PRIVATE GROUPS ============ -->
    <section class="section grain" data-ground="moss">
      <div class="container t t-spread" data-flip>
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">05</span> Private groups</p>
          <h2 class="t-h2 balance">For a team, a bridal party or a few friends.</h2>
          <div class="prose flow">
            <p>Six to twelve people, in the studio or at your home. A demonstration, products to take away, refreshments. Priced by proposal.</p>
          </div>
          <div class="cta-row">
            <a href="mailto:hello@besia.co?subject=Private%20group" class="btn">Request a proposal</a>
            <a class="link" href="https://wa.me/233240787993?text=Hello%20B%C4%93sia%2C%20I%20would%20like%20to%20ask%20about%20a%20private%20group." target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          ${pic('still-dried-flowers', '(min-width: 1024px) 576px, 100vw', 'Dried flowers on espresso')}
        </figure>
      </div>
    </section>

    <!-- ============ 06 RESERVE A SEAT ============ -->
    <section class="section" data-ground="ivory" id="enrol">
      <div class="container t t-form">
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">06</span> Reserve a seat</p>
          <h2 class="t-h2 balance">Tell us which course, and we will call you.</h2>
          <p>Send this and we confirm your place on WhatsApp, usually within the hour. No payment is taken on this page.</p>
          <p class="t-cap">${esc(B.coursePayment.note)}</p>
        </div>
        <div class="form enrol-wrap" data-reveal>
          <form class="enrol-form" id="enrol-form" novalidate>
            <div class="row-2">
              <div class="field">
                <label for="en-name">Your full name</label>
                <input type="text" name="student-name" id="en-name" required autocomplete="name">
              </div>
              <div class="field">
                <label for="en-phone">Phone or WhatsApp</label>
                <input type="tel" name="student-phone" id="en-phone" required autocomplete="tel" inputmode="tel">
              </div>
            </div>
            <div class="field">
              <label for="en-email">Email, optional</label>
              <input type="email" name="student-email" id="en-email" autocomplete="email" inputmode="email">
            </div>
            <div class="field">
              <label for="en-course">Which course</label>
              <select name="course" id="en-course" required>
${options}
              </select>
            </div>
            <div class="field-group">
              <span class="t-label field-legend">How would you like to pay</span>
              <div class="check-grid">
                <label class="check-pill is-checked"><input type="radio" name="plan" value="full" checked><span class="dot">✓</span>Pay in full</label>
                <label class="check-pill"><input type="radio" name="plan" value="half"><span class="dot">✓</span>Pay half to reserve</label>
              </div>
            </div>
            <div class="enrol-total" id="en-total"></div>
            <div class="field">
              <label for="en-note">Anything we should know</label>
              <textarea name="student-note" id="en-note" rows="3" placeholder="Experience so far, dates that suit you"></textarea>
            </div>
            <button type="submit" class="btn btn--wide">Reserve my seat</button>
          </form>
        </div>
      </div>
    </section>

  </main>

  <!--CHROME:foot-->
  <!--/CHROME:foot-->
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'classes.html'), page);
console.log('classes.html built, ' + courses.length + ' courses (' + (pro.length + 1) + ' professional, ' + client.length + ' for clients).');
