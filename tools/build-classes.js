/* ============================================================
   build-classes.js, builds classes.html (The School at Bēsia,
   Bēsia Beauty Academy) from js/besia-data.js.

   Dana, 6 Oct 2026: she likes the page as it was, keeps the name
   The School at Bēsia, wants Bēsia Beauty Academy slipped in, a one
   to one option for those who would rather not learn in a group,
   and her Academy brief used to fill the blanks: "Your hands can
   build your life", three hero certifications, Fusion by method
   (one, two, or the complete system), the Bēsia methodology, the
   upgrade path, how it works, her founder's note, an FAQ, a closing
   call. The opener she approved is kept as it was.

   The page is written whole: the chrome markers are included and
   build-chrome.js fills them, the film markers are filled by
   build-reels.js. The enrolment form keeps every id js/classes.js
   reads (enrol-form, en-course, en-total, en-name, en-phone,
   en-email, en-note, input[name=plan], input[name=format],
   input[name=methods]) and the Studio Manager's Classes page reads
   the same course ids.

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
const heroes = courses.filter(c => c.hero).sort((a, b) => a.hero - b.hero);
const fusion = courses.find(c => c.id === 'C-FUSION');
const growth = courses.find(c => c.id === 'C-GROWTH');
const texture = courses.find(c => c.id === 'C-TEXTURE');
const pro = courses.filter(c => c.group === 'pro' && !c.hero);
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

function heroCard(c, i) {
  return `          <article class="cert-card" id="cert-${esc(c.id)}">
            <figure class="plate plate--tall cert-plate">${pic(c.img, '(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw')}</figure>
            <div class="cert-body">
              <p class="cert-n"><span class="n">${pad(i + 1)}</span> Certification</p>
              <h3 class="cert-name">${esc(c.name)}</h3>
              <p class="cert-line">${esc(c.line)}</p>
              <p class="t-cap">${esc(c.blurb)}</p>
${c.methods ? `              <p class="cert-methods">${c.methods.map(m => '<span>' + esc(m) + '</span>').join('')}</p>\n` : ''}              <p class="cert-fee"><span class="t-price">${B.money(c.fee)}</span> <span class="t-cap">${c.unit ? esc(c.unit) + ', ' : ''}${esc(dayWord(c))}, or one to one</span></p>
              <div class="cta-row">
                <a class="btn btn--sm" href="#enrol" data-course="${esc(c.id)}">Enrol</a>
                <a class="link" href="#${c.id === 'C-FUSION' ? 'fusion' : c.id === 'C-GROWTH' ? 'growth' : 'texture'}">The curriculum</a>
              </div>
            </div>
          </article>`;
}

const METHODOLOGY = ['Consultation', 'Hair and scalp assessment', 'Extension suitability', 'Texture matching', 'Density', 'Colour matching',
  'Length selection', 'Hair quality', 'Sectioning', 'Installation principles', 'Tension', 'Blending', 'Styling', 'Maintenance',
  'Removal', 'Aftercare', 'Client experience', 'Service pricing', 'Building a profitable service'];

const FAQ = [
  ['Who are the courses for?', 'Anyone who wants a skill that belongs to them: students, women already working, stylists who want to specialise, mothers, anyone starting over or building alongside another career.'],
  ['Do I need beauty experience?', 'Not for the foundation courses. The three certifications suit working stylists best; if you are new, tell us when you enrol and we will suggest where to begin.'],
  ['Are the courses hands-on?', 'Yes. Every certification is practical, on a mannequin first and then on a live model, in the studio.'],
  ['Where does training take place?', 'At the studio, 54 Fifth Circular Road, Cantonments, Accra.'],
  ['Can I learn one to one?', 'Yes. Any course can be taught privately, around your own timetable. Choose one to one when you enrol and we plan the dates and the fee with you.'],
  ['Can international students attend?', 'Yes. Training is in person in Accra. Tell us your travel dates when you enrol and we will plan around them.'],
  ['What certification do I receive?', 'A Bēsia certificate naming your specialty, for example Bēsia Certified K-Tip Extension Specialist.'],
  ['Can I learn just one Fusion method, or all four?', 'Both. Learn one method, two to build your menu, or all four to master the complete Bēsia Fusion system.'],
  ['Can I upgrade later?', 'Yes. Start with one method and add the others when you are ready, without starting over. Ask us about crediting your first course fee when you upgrade.'],
  ['What equipment do I need?', 'Nothing to begin: your kit for the training days is included. Professional kits to keep, and your supplies afterwards, come from Bēsia.'],
  ['Can I use my certification abroad?', 'The skill travels with you. The rules for practising differ from country to country, so check the licensing requirements where you plan to work.'],
  ['How do I pay?', 'Pay in full, or half to reserve your seat with the balance before the final day. Online, by Mobile Money or card.'],
  ['Can you teach a private group?', 'Yes: six to twelve people, a team, a bridal party or a few friends, in the studio or at your home. A demonstration, products to take away, refreshments. Priced by proposal; write to hello@besia.co.']
];

const options = courses.map(c =>
  `                  <option value="${esc(c.id)}">${esc(c.name)} · ${B.money(c.fee)}${c.unit ? ' ' + esc(c.unit) : ''}</option>`
).join('\n');

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The School at Bēsia · Bēsia Beauty Academy, Cantonments Accra</title>
  <meta name="description" content="Your hands can build your life. Certified training at Bēsia Beauty Studio in Cantonments, Accra: fusion extensions, healthy hair and growth, Hair Botox and Nanoplasty, and more. Small cohorts or one to one.">
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
          <p class="academy-mark">Bēsia Beauty Academy</p>
          <h1 class="t-chap balance" data-split>Learn the work properly, in small rooms.</h1>
          <p class="t-deck">Learn a high-value skill. Get certified. Build your business. In cohorts of four to six, or one to one.</p>
          <div class="cta-row">
            <a href="#certifications" class="btn">Explore the certifications</a>
            <a href="#how" class="btn btn--ghost">How it works</a>
          </div>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          <span class="plate-tag"><span class="n">01</span> The school</span>
          ${pic('moodboard-model', '(min-width: 1024px) 576px, 100vw', 'A balayage profile')}
        </figure>
      </div>
    </section>

    <!-- ============ 02 MORE THAN A COURSE ============ -->
    <section class="section" data-ground="ivory">
      <div class="container academy-intro" data-reveal>
        <p class="eyebrow"><span class="n">02</span> More than a course</p>
        <h2 class="academy-line balance" data-split>Your hands can build your life.</h2>
        <div class="academy-copy">
          <p class="t-deck">Maybe you can see a bigger life for yourself.</p>
          <div class="prose flow">
            <p>Bēsia Beauty Academy was made for women who want more from what they know how to do. A skill can become an income. An income can become a business. A business can become independence.</p>
            <p>And a skill you can take with you gives you something even more valuable: options. Your location can change, your circumstances can change, your life can change. What you know how to do stays with you.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 03 THE THREE CERTIFICATIONS ============ -->
    <section class="section" data-ground="oatmeal" id="certifications">
      <div class="container stack--loose stack">
        <div class="section-head" data-reveal>
          <p class="eyebrow"><span class="n">03</span> The certifications</p>
          <h2 class="t-h2 balance">Three specialties, each a Bēsia certificate.</h2>
          <p class="t-deck">Taught in the studio, hands on, with a live model before you leave.</p>
        </div>
        <div class="cert-row" data-reveal-stagger>
${heroes.map(heroCard).join('\n')}
        </div>
      </div>
    </section>

    <!-- ============ 04 FUSION: CHOOSE YOUR SPECIALTY ============ -->
    <section class="section grain" data-ground="clay" id="fusion">
      <div class="container stack--loose stack">
        <div class="section-head" data-reveal>
          <p class="eyebrow"><span class="n">04</span> Fusion Extensions</p>
          <h2 class="t-h2 balance">Choose your specialty.</h2>
          <p class="t-deck">One method. Two methods. Or master the complete system. Nobody is made to buy all four.</p>
        </div>
        <div class="path-row" data-reveal-stagger>
          <div class="path-card"><p class="path-n">Learn one</p><h3 class="path-name">One method</h3><p class="t-cap">For the stylist who knows exactly what she wants to specialise in.</p><p class="path-fee">${B.money(fusion.fee)}</p><a class="btn btn--ghost btn--sm" href="#enrol" data-course="C-FUSION" data-methods="1">Choose a method</a></div>
          <div class="path-card"><p class="path-n">Build your menu</p><h3 class="path-name">Two methods</h3><p class="t-cap">For stylists who want to widen what they can offer.</p><p class="path-fee">Quoted as a bundle</p><a class="btn btn--ghost btn--sm" href="#enrol" data-course="C-FUSION" data-methods="2">Build my menu</a></div>
          <div class="path-card path-card--lead"><p class="path-n">Master the system</p><h3 class="path-name">All four methods</h3><p class="t-cap">The complete Bēsia Fusion system. The most complete, and the best value.</p><p class="path-fee">Quoted as a bundle</p><a class="btn btn--sm" href="#enrol" data-course="C-FUSION" data-methods="4">Become a Fusion Master</a></div>
        </div>
        <div class="t t-spread">
          <div class="copy stack" data-reveal>
            <h3 class="t-h3">The Bēsia extension methodology</h3>
            <p>Whichever method you choose, you learn the Bēsia way first. So you do not leave as someone who knows K-Tips; you leave as a Bēsia Certified K-Tip Extension Specialist.</p>
            <ul class="method-list">${METHODOLOGY.map(m => '<li>' + esc(m) + '</li>').join('')}</ul>
          </div>
          <div class="copy stack upgrade" data-reveal>
            <h3 class="t-h3">Already certified? Add the next method.</h3>
            <ol class="upgrade-path"><li>K-Tip</li><li>Add I-Tip</li><li>Add Beaded Weft</li><li>Add Tape-In</li><li>Fusion Master</li></ol>
            <p class="t-cap">Start with one and grow without starting over. Ask about crediting your first course fee when you upgrade.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 05 HEALTHY HAIR + GROWTH ============ -->
    <section class="section" data-ground="ivory" id="growth">
      <div class="container stack--loose stack">
        <div class="section-head" data-reveal>
          <p class="eyebrow"><span class="n">05</span> Healthy Hair + Growth</p>
          <h2 class="t-h2 balance">Become the person clients trust with their hair.</h2>
          <p class="t-deck">${esc(growth.blurb)}</p>
        </div>
        <div class="atb-row" data-reveal-stagger>
          <div class="atb"><p class="atb-n">Assess</p><p>Texture, density, porosity, elasticity, damage, breakage, shedding and the scalp.</p></div>
          <div class="atb"><p class="atb-n">Treat</p><p>Professional protocols, scalp care, conditioning, strength and moisture balance, care that keeps length.</p></div>
          <div class="atb"><p class="atb-n">Build</p><p>Client routines, follow-up, maintenance and home care: relationships that last.</p></div>
          <div class="atb atb--lead"><p class="atb-n">Bēsia Growth Therapy</p><p>The studio's own growth system and its professional products, yours to use with your clients.</p></div>
        </div>
        <div class="cta-row"><a class="btn" href="#enrol" data-course="C-GROWTH">Enrol</a><span class="t-cap">${B.money(growth.fee)} · ${esc(dayWord(growth))} · or one to one</span></div>
      </div>
    </section>

    <!-- ============ 06 HAIR BOTOX + NANOPLASTY ============ -->
    <section class="section grain" data-ground="moss" id="texture">
      <div class="container t t-spread" data-flip>
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">06</span> Hair Botox + Nanoplasty</p>
          <h2 class="t-h2 balance">Add a high-value specialty to your skill set.</h2>
          <p>${esc(texture.blurb)}</p>
          <ul class="t-index course-includes">
${texture.learn.map((l, i) => `            <li class="ix-row"><span class="ix-n">${pad(i + 1)}</span><span class="ix-title">${esc(l)}</span></li>`).join('\n')}
          </ul>
          <div class="cta-row"><a class="btn" href="#enrol" data-course="C-TEXTURE">Enrol</a><span class="t-cap">${B.money(texture.fee)} · ${esc(dayWord(texture))} · or one to one</span></div>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          ${pic('product-hair-botox', '(min-width: 1024px) 576px, 100vw', 'The Bēsia Hair Botox bottle')}
        </figure>
      </div>
    </section>

    <!-- ============ 07 ONE TO ONE ============ -->
    <section class="section" data-ground="oatmeal" id="one-to-one">
      <div class="container t t-spread">
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">07</span> One to one</p>
          <h2 class="t-h2 balance">Rather not learn in a group?</h2>
          <p>Any course here can be taught one to one: just you and your educator, at your pace, around your own clients and your own timetable. Choose one to one when you enrol, and we plan the dates and the fee with you.</p>
          <div class="cta-row"><a class="btn" href="#enrol" data-format="One to one">Learn one to one</a></div>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          ${pic('studio-mirror-chair', '(min-width: 1024px) 50vw, 100vw', 'One chair before the gold mirror in the studio')}
        </figure>
      </div>
    </section>

    <!-- ============ 08 MORE COURSES ============ -->
    <section class="section" data-ground="ivory" id="courses">
      <div class="container stack--loose stack">
        <div class="section-head" data-reveal>
          <p class="eyebrow"><span class="n">08</span> More courses</p>
          <h2 class="t-h2 balance">Certificates, small cohorts, a model day.</h2>
          <p class="t-deck">Kit, lunch and a certificate of completion included. Every one can also be taught one to one.</p>
        </div>
        <div class="t-index course-index" data-reveal-stagger>
${pro.map((c, i) => row(c, i + 1)).join('\n')}
${client.map((c, i) => row(c, pro.length + 1 + i)).join('\n')}
        </div>
      </div>
    </section>

    <!-- ============ 09 HOW IT WORKS ============ -->
    <section class="section grain" data-ground="ink" id="how">
      <div class="container stack--loose stack">
        <div class="section-head" data-reveal>
          <p class="eyebrow"><span class="n">09</span> How it works</p>
          <h2 class="t-h2 balance">Learn, certify, equip, work, grow.</h2>
        </div>
        <ol class="how-row" data-reveal-stagger>
          <li><span class="how-n">01</span><strong>Choose your certification.</strong> Find the skill that fits where you are going.</li>
          <li><span class="how-n">02</span><strong>Learn.</strong> Your professional training, in the studio with Bēsia.</li>
          <li><span class="how-n">03</span><strong>Practise.</strong> Guided, hands-on, on a mannequin and then a live model.</li>
          <li><span class="how-n">04</span><strong>Get certified.</strong> Leave a Bēsia Certified Specialist.</li>
          <li><span class="how-n">05</span><strong>Build.</strong> Offer the service, grow your clientele, grow your business.</li>
          <li><span class="how-n">06</span><strong>Keep growing.</strong> Add a method, restock your supplies from Bēsia, keep building.</li>
        </ol>
      </div>
    </section>

    <!-- ============ 10 WHY I BUILT IT ============ -->
    <section class="section" data-ground="oatmeal">
      <div class="container t t-spread" data-flip>
        <div class="copy stack founder" data-reveal>
          <p class="eyebrow"><span class="n">10</span> From the founder</p>
          <h2 class="t-h2 balance">Why I built Bēsia Beauty Academy.</h2>
          <div class="prose flow">
            <p>I believe women deserve skills that belong to them. Because life changes. Circumstances change. Locations change. Careers change. But what you know how to do stays with you.</p>
            <p>I have built businesses, worked across different industries, and I know what it means to have to create something for yourself. The Academy is my way of helping other women do the same: not just learn a technique, but build something that belongs to them.</p>
          </div>
          <p class="sig"><span class="sig-name">Dana</span><span class="t-credit">Founder, Bēsia Beauty Studio</span></p>
        </div>
        <figure class="plate plate--tall plate--cap" data-unveil>
          <span class="plate-tag"><span class="n">10</span> The founder</span>
          ${pic('founder-welcome', '(min-width: 1024px) 50vw, 100vw', 'The founder, smiling, welcoming you into the studio')}
        </figure>
      </div>
    </section>

    <!-- ============ 11 QUESTIONS ============ -->
    <section class="section" data-ground="ivory" id="faq">
      <div class="container t t-form">
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">11</span> Questions</p>
          <h2 class="t-h2 balance">Before you enrol.</h2>
          <p>Anything else, write to <a class="link" href="mailto:hello@besia.co?subject=The%20School%20at%20B%C4%93sia">hello@besia.co</a> or call 024 078 7993.</p>
        </div>
        <div class="faq" data-reveal>
${FAQ.map(([q, a]) => `          <details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- ============ 12 RESERVE A SEAT ============ -->
    <section class="section" data-ground="oatmeal" id="enrol">
      <div class="container t t-form">
        <div class="copy stack" data-reveal>
          <p class="eyebrow"><span class="n">12</span> Enrol</p>
          <h2 class="t-h2 balance">Choose your course, and reserve your seat.</h2>
          <p>Pay on this page by Mobile Money or card, in full or half to hold your seat. One to one is planned with you first, so nothing is paid until we have agreed the dates and the fee.</p>
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
                <label for="en-phone">Phone</label>
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
            <div class="field-group" id="en-methods" hidden>
              <span class="t-label field-legend">Which methods</span>
              <div class="check-grid">
${B.fusionMethods.map((m, i) => `                <label class="check-pill"><input type="checkbox" name="methods" value="${esc(m)}"${i === 0 ? ' checked' : ''}><span class="dot">✓</span>${esc(m)}</label>`).join('\n')}
              </div>
            </div>
            <div class="field-group">
              <span class="t-label field-legend">How would you like to learn</span>
              <div class="check-grid">
${B.courseFormats.map((f, i) => `                <label class="check-pill"><input type="radio" name="format" value="${esc(f)}"${i === 0 ? ' checked' : ''}><span class="dot">✓</span>${esc(f)}</label>`).join('\n')}
              </div>
            </div>
            <div class="field-group" id="en-plan">
              <span class="t-label field-legend">How would you like to pay</span>
              <div class="check-grid">
                <label class="check-pill"><input type="radio" name="plan" value="full" checked><span class="dot">✓</span>Pay in full</label>
                <label class="check-pill"><input type="radio" name="plan" value="half"><span class="dot">✓</span>Pay half to reserve</label>
              </div>
            </div>
            <div class="enrol-total" id="en-total"></div>
            <div class="field">
              <label for="en-note">Anything we should know</label>
              <textarea name="student-note" id="en-note" rows="3" placeholder="Experience so far, dates that suit you"></textarea>
            </div>
            <div id="en-pay"></div>
            <p class="hw-error" id="en-error" role="alert" hidden></p>
            <button type="submit" class="btn btn--wide" id="en-go">Reserve my seat</button>
          </form>
        </div>
      </div>
    </section>

    <!-- ============ 13 START BUILDING ============ -->
    <section class="section grain closing" data-ground="ink">
      <div class="container academy-close" data-reveal>
        <p class="academy-mark">Bēsia Beauty Academy</p>
        <h2 class="academy-line balance" data-split>You do not need to know everything. You just need to start building something.</h2>
        <p class="t-deck">Learn the skill. Get certified. Build the business. Build the life.</p>
        <div class="cta-row">
          <a href="#certifications" class="btn">Explore the certifications</a>
          <a href="#enrol" class="btn btn--ghost">Enrol</a>
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
console.log('classes.html built, ' + courses.length + ' courses (' + heroes.length + ' certifications, ' + pro.length + ' more professional, ' + client.length + ' for clients).');
