/* ============================================================
   build-classes.js — builds classes.html (the training school)
   from js/besia-data.js, reusing the site chrome from services.html
   so the header, footer and scripts can never drift.

   Also adds the "Classes" link to the nav on every public page.

   Run:  node tools/build-classes.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'js', 'besia-data.js'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const src = fs.readFileSync(path.join(ROOT, 'services.html'), 'utf8');

/* ---------- chrome ---------- */
const headEnd = src.indexOf('</head>');
let head = src.slice(0, headEnd);
head = head
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Classes — Learn With Bēsia Beauty Studio, Accra</title>')
  .replace(/<meta name="description" content="[\s\S]*?">/,
    '<meta name="description" content="Train at Bēsia Beauty Studio in Cantonments, Accra. Fusion extensions, braiding, silk press, natural hair, colour, lashes and brows. Pay in full or pay half to reserve your seat.">')
  .replace(/\n?  <!-- BUILD:seo -->[\s\S]*?<!-- \/BUILD:seo -->\n?/, '\n');

const bodyStart = src.indexOf('<body');
const mainStart = src.indexOf('<main id="main">');
const chromeTop = src.slice(bodyStart, mainStart);       // body tag, skip link, preloader, nav
const mainEnd = src.indexOf('</main>');
let chromeBottom = src.slice(mainEnd + '</main>'.length); // footer, bars, scripts
/* Drop any INLINE <script> from the borrowed chrome. Those belong to the
   page we copied from (services.html has a recommender that binds to
   elements which do not exist here) and would throw on load. */
chromeBottom = chromeBottom.replace(/\n?\s*<script(?![^>]*\ssrc=)[\s\S]*?<\/script>/g, '');

/* ...and add the one script this page does need. */
chromeBottom = chromeBottom.replace(
  '<script src="./js/ai-chat.js" defer></script>',
  '<script src="./js/ai-chat.js" defer></script>\n  <script src="./js/classes.js" defer></script>');

/* ---------- course cards ---------- */
const cards = B.courses.map((c, i) => {
  const half = Math.round(c.fee * B.coursePayment.depositPercent / 100);
  return `          <article class="course-card" data-reveal>
            <div class="course-head">
              <span class="course-level">${esc(c.level)}</span>
              <span class="course-days">${c.days} day${c.days === 1 ? '' : 's'}</span>
            </div>
            <h3 class="course-name">${esc(c.name)}</h3>
            <p class="course-blurb">${esc(c.blurb)}</p>
            <ul class="course-learn">
${c.learn.map(l => '              <li>' + esc(l) + '</li>').join('\n')}
            </ul>
            <div class="course-foot">
              <div class="course-price">
                <span class="course-fee">${B.money(c.fee)}</span>
                <span class="course-half">or ${B.money(half)} to reserve your seat</span>
              </div>
              <a class="btn btn--gold btn--sm" href="#enrol" data-course="${esc(c.id)}">Reserve a seat</a>
            </div>
          </article>`;
}).join('\n\n');

const options = B.courses.map(c =>
  `                      <option value="${esc(c.id)}">${esc(c.name)} — ${B.money(c.fee)}</option>`
).join('\n');

/* ---------- page ---------- */
const main = `<main id="main">

    <section class="page-hero aura">
      <div class="page-hero-bg">
        <img src="./images/studio/studio-nook.jpg" alt="The arched styling nook where classes are taught" width="1920" height="1080">
      </div>
      <div class="container page-hero-content">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="./index.html">Home</a><span class="sep">·</span><span>Classes</span>
        </nav>
        <span class="script">Learn it properly —</span>
        <h1>Train With Bēsia</h1>
        <p>Small groups, real clients and the same methods we use in the studio every day. Pay in full, or pay half to reserve your seat and settle the rest before the last day.</p>
      </div>
    </section>

    <section class="section section--cream">
      <div class="container container--wide">
        <div class="section-head section-head--center" data-reveal>
          <div class="eyebrow eyebrow--center">The School</div>
          <h2 class="section-title"><span class="script">Six courses,</span>Taught Hands-On</h2>
          <p class="section-lede">Every course is taught in the studio on real heads of hair, not mannequins alone. You leave able to charge for the work — we cover pricing too.</p>
        </div>

        <div class="course-grid" data-reveal-stagger>

${cards}

        </div>
      </div>
    </section>

    <section class="section section--champagne">
      <div class="container">
        <div class="section-head section-head--center" data-reveal>
          <div class="eyebrow eyebrow--center">Paying For Your Course</div>
          <h2 class="section-title"><span class="script">Two ways,</span>Both Simple</h2>
        </div>
        <div class="pay-ways" data-reveal-stagger>
          <div class="pay-way">
            <div class="pay-way-num">1</div>
            <h3>Pay in full</h3>
            <p>Settle the whole fee when you book. Your seat is confirmed straight away and nothing else is owed.</p>
          </div>
          <div class="pay-way">
            <div class="pay-way-num">2</div>
            <h3>Pay half to reserve</h3>
            <p>Pay ${B.coursePayment.depositPercent}% to hold your seat, then clear the balance any time before the final day. We will remind you.</p>
          </div>
          <div class="pay-way">
            <div class="pay-way-num">3</div>
            <h3>However suits you</h3>
            <p>Mobile Money, card, bank transfer or cash at the studio. Whatever you pay is receipted the same day.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--cream" id="enrol">
      <div class="container">
        <div class="section-head section-head--center" data-reveal>
          <div class="eyebrow eyebrow--center">Reserve Your Seat</div>
          <h2 class="section-title"><span class="script">Tell us which course,</span>And We Will Call You</h2>
          <p class="section-lede">Seats are limited on every course. Send this and we will confirm your place on WhatsApp, usually within the hour.</p>
        </div>

        <div class="enrol-wrap" data-reveal>
          <form class="enrol-form" id="enrol-form" novalidate>
            <div class="form-row">
              <div class="field">
                <input type="text" name="student-name" id="en-name" placeholder=" " required>
                <label for="en-name">Your full name</label>
              </div>
              <div class="field">
                <input type="tel" name="student-phone" id="en-phone" placeholder=" " required>
                <label for="en-phone">Phone / WhatsApp</label>
              </div>
            </div>

            <div class="field">
              <input type="email" name="student-email" id="en-email" placeholder=" ">
              <label for="en-email">Email (optional)</label>
            </div>

            <div class="field">
              <select name="course" id="en-course" required>
${options}
              </select>
              <label for="en-course">Which course?</label>
            </div>

            <div class="field-group">
              <span class="field-legend">How would you like to pay?</span>
              <div class="check-grid check-grid--2">
                <label class="check-pill is-checked"><input type="radio" name="plan" value="full" checked><span class="dot">✓</span>Pay in full</label>
                <label class="check-pill"><input type="radio" name="plan" value="half"><span class="dot">✓</span>Pay half to reserve</label>
              </div>
            </div>

            <div class="enrol-total" id="en-total"></div>

            <div class="field">
              <textarea name="student-note" id="en-note" placeholder=" " rows="3"></textarea>
              <label for="en-note">Anything we should know? Experience so far, dates that suit you…</label>
            </div>

            <button type="submit" class="btn btn--gold btn--lg">
              Reserve my seat
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <p class="form-note">No payment is taken on this page. We confirm your seat first, then send you the payment details.</p>
          </form>
        </div>
      </div>
    </section>

  </main>`;

fs.writeFileSync(path.join(ROOT, 'classes.html'), head + '</head>\n' + chromeTop + main + chromeBottom);
console.log('classes.html built — ' + B.courses.length + ' courses.');

/* ---------- add the nav link everywhere ---------- */
const PUBLIC = ['index.html', 'services.html', 'shop.html', 'gallery.html', 'about.html',
                'packages.html', 'contact.html', 'checkout.html', 'track.html', 'classes.html'];
let navAdded = 0;
for (const f of PUBLIC) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  let h = fs.readFileSync(p, 'utf8');
  if (h.includes('href="./classes.html"')) continue;
  const before = h;
  h = h.split('<a href="./gallery.html">Gallery</a>')
       .join('<a href="./classes.html">Classes</a>\n        <a href="./gallery.html">Gallery</a>');
  h = h.split('<a href="./gallery.html" class="is-active">Gallery</a>')
       .join('<a href="./classes.html">Classes</a>\n        <a href="./gallery.html" class="is-active">Gallery</a>');
  if (h !== before) { fs.writeFileSync(p, h); navAdded++; }
}
console.log('  Classes added to the nav on ' + navAdded + ' pages.');

/* mark the current page in the nav on classes.html */
let c = fs.readFileSync(path.join(ROOT, 'classes.html'), 'utf8');
c = c.split('<a href="./services.html" class="is-active">Services</a>').join('<a href="./services.html">Services</a>');
c = c.split('<a href="./classes.html">Classes</a>').join('<a href="./classes.html" class="is-active">Classes</a>');
fs.writeFileSync(path.join(ROOT, 'classes.html'), c);
console.log('  active nav state set on classes.html');
