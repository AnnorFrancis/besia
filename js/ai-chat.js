/* ============================================================
   BĒSIA BEAUTY STUDIO, ai-chat.js
   "Bēsia Beauty Assistant", frontend-simulated concierge chat.
   Injects its own markup, so a single script tag enables it
   on any page. Responses are scripted/keyword-matched (demo).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Markup ---------- */
  var root = document.createElement('div');
  root.innerHTML =
    '<button class="chat-fab" aria-label="Open Bēsia Beauty Assistant" aria-expanded="false">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
        '<path d="M12 3C7 3 3 6.6 3 11c0 2.2 1 4.1 2.6 5.5-.2 1.2-.8 2.3-1.6 3.1 1.7 0 3.2-.6 4.4-1.4 1.1.4 2.3.7 3.6.7 5 0 9-3.6 9-7.9S17 3 12 3z"/>' +
        '<path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-linecap="round" stroke-width="2.4"/>' +
      '</svg>' +
      '<span class="chat-dot"></span>' +
    '</button>' +
    '<div class="chat-window" role="dialog" aria-label="Bēsia Beauty Assistant chat">' +
      '<div class="chat-header">' +
        '<div class="chat-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2c1.8 2.5 1.8 5.5 0 8-1.8-2.5-1.8-5.5 0-8zM12 10c2.5-1.8 5.5-1.8 8 0-2.5 1.8-5.5 1.8-8 0zM12 10c-2.5-1.8-5.5-1.8-8 0 2.5 1.8 5.5 1.8 8 0zM12 10v10" stroke-linecap="round"/></svg></div>' +
        '<div class="chat-header-info">' +
          '<div class="chat-header-name">Bēsia Beauty Assistant</div>' +
          '<div class="chat-header-status">Online · replies instantly</div>' +
        '</div>' +
        '<button class="chat-close" aria-label="Close chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>' +
      '</div>' +
      '<div class="chat-body" aria-live="polite"></div>' +
      '<div class="chat-quick"></div>' +
      '<form class="chat-input">' +
        '<input type="text" placeholder="Ask about pricing, dates, services…" aria-label="Type your message">' +
        '<button type="submit" aria-label="Send message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12l16-7-6 16-2.5-6.5L4 12z" stroke-linejoin="round"/></svg></button>' +
      '</form>' +
      '<div class="chat-powered">Powered by Bēsia AI · Demo</div>' +
    '</div>';
  while (root.firstChild) document.body.appendChild(root.firstChild);

  var fab = document.querySelector('.chat-fab');
  var win = document.querySelector('.chat-window');
  var body = win.querySelector('.chat-body');
  var quick = win.querySelector('.chat-quick');
  var form = win.querySelector('.chat-input');
  var input = form.querySelector('input');
  var closeBtn = win.querySelector('.chat-close');

  var opened = false;

  /* ---------- Helpers ---------- */
  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMsg(html, who) {
    var m = document.createElement('div');
    m.className = 'chat-msg chat-msg--' + who;
    m.innerHTML = html;
    body.appendChild(m);
    scrollDown();
  }

  function typing(ms) {
    return new Promise(function (resolve) {
      var t = document.createElement('div');
      t.className = 'chat-typing';
      t.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(t);
      scrollDown();
      window.setTimeout(function () { t.remove(); resolve(); }, ms);
    });
  }

  function botSay(html, delay) {
    return typing(delay || 1100).then(function () { addMsg(html, 'bot'); });
  }

  function setQuickReplies(replies) {
    quick.innerHTML = '';
    replies.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = r.label;
      b.addEventListener('click', function () { handleUser(r.label, r.intent); });
      quick.appendChild(b);
    });
  }

  var DEFAULT_QUICK = [
    { label: 'Fusion extensions', intent: 'ext' },
    { label: 'Book a free consult', intent: 'consult' },
    { label: 'Shop the shelf', intent: 'shop' },
    { label: 'Speak to the team', intent: 'team' }
  ];

  /* ---------- Live pricing ----------
     Every figure the assistant quotes is read from js/besia-data.js at
     runtime, so the chat can never contradict the published menu. */
  /* Cheapest PUBLISHED price in a category, discount included. Reads the
     live view so the assistant can never quote a price the website no
     longer shows, or offer something the owner has taken down. */
  function P(catKey) {
    if (!window.BESIA) return '';
    if (BESIA.live) {
      var on = BESIA.live.published(BESIA.live.services())
        .filter(function (s) { return s.cat === catKey; })
        .map(function (s) { return s.price; })
        .filter(function (n) { return n > 0; });
      if (!on.length) return '';
      return BESIA.money(Math.min.apply(null, on));
    }
    return BESIA.fromPrice(catKey) != null ? BESIA.money(BESIA.fromPrice(catKey)) : '';
  }
  /* One named service. Returns nothing if it has been taken off the
     website, so the assistant simply does not mention it. */
  function S(name) {
    if (!window.BESIA) return '';
    if (BESIA.live) {
      var item = BESIA.live.find('service', name);
      if (!item || !item.published) return '';
      if (item.price !== item.basePrice) return BESIA.money(item.price);
    }
    var svc = BESIA.services.filter(function (x) { return x.name === name; })[0];
    return svc ? BESIA.priceLabel(svc) : '';
  }
  var LINK = 'style="color:var(--gold-ink);font-weight:700;text-decoration:underline;"';

  /* ---------- Scripted opening conversation ---------- */
  function playIntro() {
    botSay('Hi \u2728 Welcome to <strong>B\u0113sia Beauty Studio</strong>, Ghana\u2019s home of fusion extensions. I can help with prices, timings or what to book. What are you thinking of getting done?', 900)
      .then(function () {
        return new Promise(function (r) { window.setTimeout(r, 1400); });
      })
      .then(function () {
        addMsg('How much are the KTip extensions?', 'user');
        return botSay(
          'Great choice \uD83D\uDCAB KTips are what we are known for. Price goes by weight, and we work out what your hair can carry at the consultation.<br><br>' +
          '\u2022 100 grams \u00B7 ' + S('100 grams - KTips') + ' \u00B7 4 hr<br>' +
          '\u2022 150 grams \u00B7 ' + S('150 grams - KTips') + ' \u00B7 4 hr<br>' +
          '\u2022 200 grams \u00B7 ' + S('200 grams - KTips') + ' \u00B7 5 hr 30 min<br><br>' +
          'Have you worn fusion extensions before?', 1500);
      })
      .then(function () {
        return new Promise(function (r) { window.setTimeout(r, 1600); });
      })
      .then(function () {
        addMsg('No, first time. Is it safe for my hair?', 'user');
        return botSay(
          'That is exactly why we start with a consultation, and the first one is <strong>free</strong>. \uD83D\uDC95<br><br>' +
          'Our specialists are <strong>UK-certified</strong>, and we check your density and scalp before we fit anything. If your hair is not ready, we will say so and start you on a ' +
          '<a href="./services.html#scalp" ' + LINK + '>bond repair treatment</a> instead.<br><br>' +
          'Shall I show you this week\u2019s free slots?', 1700);
      })
      .then(function () {
        setQuickReplies(DEFAULT_QUICK);
      });
  }

  /* ---------- Keyword intelligence (demo) ---------- */
  var RESPONSES = [
    { match: /(buy|shop|sell|purchase|bundle|in stock|ready.?made|take home|hair care|accessor|bonnet|tote)/i, intent: 'shop' },
    { match: /(moringa|beard oil|product line|launch)/i, intent: 'moringa' },
    { match: /(ktip|k.tip|fusion|microlink|micro.link|tape.?in|v.?light|invisible|weave|crochet|extension)/i, intent: 'ext' },
    { match: /(nanoplasty|keratin|botox|texture|straighten|perm|formaldehyde|vegan)/i, intent: 'tex' },
    { match: /(olaplex|k18|bond|scalp|dandruff|treatment|flax|gro|hot oil|hair loss|growth|cpr|moisture)/i, intent: 'scalp' },
    { match: /(colour|color|dye|balayage|highlight|blonde|root)/i, intent: 'color' },
    { match: /(curl|coil|natural|wash.?and.?go|wash \+ go|revive|silk ?press|silkpress|blow ?dry)/i, intent: 'nat' },
    { match: /(cut|trim|layer|precision|bob)/i, intent: 'cut' },
    { match: /(braid|cornrow|updo)/i, intent: 'braid' },
    { match: /(wig|frontal|closure|install)/i, intent: 'wig' },
    { match: /(lash|brow|wax|facial|threading)/i, intent: 'beauty' },
    { match: /(price|pricing|cost|how much|charge|rate|menu)/i, intent: 'prices' },
    { match: /(package|bundle deal|combo|save|discount|offer)/i, intent: 'packages' },
    { match: /(book|appointment|slot|available|availability|free|consult)/i, intent: 'consult' },
    { match: /(long|duration|how many hours|how long|take)/i, intent: 'availability' },
    { match: /(team|human|person|call|speak|talk|dana|rabs|francis)/i, intent: 'team' },
    { match: /(where|location|accra|address|find you|open|cantonments|park)/i, intent: 'location' },
    { match: /(hello|hi|hey|good (morning|afternoon|evening)|akwaaba)/i, intent: 'greet' },
    { match: /(thank|medaase)/i, intent: 'thanks' }
  ];

  var INTENT_REPLIES = {};

  /* Built at load so every price is read from the live menu. */
  function buildReplies() {
    var b = (window.BESIA && BESIA.business) || {};
    INTENT_REPLIES = {
      prices:
        'Here is the shape of our menu. All <strong>47 prices</strong> are published in full:<br><br>' +
        '\u2022 Fusion extensions \u00B7 from ' + P('Extensions') + '<br>' +
        '\u2022 Texture systems \u00B7 from ' + P('Texture Systems + Treatments') + '<br>' +
        '\u2022 Scalp &amp; bond repair \u00B7 from ' + P('Scalp + Bond Repair Treatments') + '<br>' +
        '\u2022 Colour \u00B7 from ' + P('Color Service') + '<br>' +
        '\u2022 Naturals, curls &amp; coils \u00B7 from ' + P('Naturals | Curls & Coils') + '<br>' +
        '\u2022 Cutting \u00B7 from ' + P('Cut Service') + '<br>' +
        '\u2022 Braids &amp; cornrows \u00B7 from ' + P('Braids | Cornrows') + '<br>' +
        '\u2022 Wig service \u00B7 from ' + P('Wig Service') + '<br><br>' +
        'Full list with durations on the <a href="./services.html#prices" ' + LINK + '>Services page</a>. A consultation is free.',

      ext:
        'Fusion extensions are our signature \uD83D\uDCAB Seamless <strong>KTips</strong> and <strong>microlinks</strong>, fitted by UK-certified specialists so they move like your own hair.<br><br>' +
        '\u2022 100g KTips \u00B7 ' + S('100 grams - KTips') + '<br>' +
        '\u2022 150g KTips \u00B7 ' + S('150 grams - KTips') + '<br>' +
        '\u2022 Seamless tape-ins \u00B7 ' + S('Seamless Tape-Ins') + '<br>' +
        '\u2022 Classic weave install \u00B7 ' + S('Classic Weave Install - One Part Leave Out') + '<br>' +
        '\u2022 Closure weave install \u00B7 ' + S('Closure Weave Install') + '<br>' +
        '\u2022 360 Illusion Crochet \u00B7 ' + S('Illusion Crochet') + '<br><br>' +
        'Removal is ' + S('KTip Removal') + '. See the full list on the <a href="./services.html#ext" ' + LINK + '>Services page</a>.',

      tex:
        'This is what makes us different \u2728 We were the <strong>first studio in Ghana</strong> to offer a safe, vegan, <strong>formaldehyde-free</strong> straightening and texturising system.<br><br>' +
        '\u2022 Vegan Keratin Nanoplasty \u00B7 ' + S('Vegan Keratin Treatment - Nanoplasty') + ' \u00B7 4 hr 30 min<br>' +
        '\u2022 Texture Release (Hair Botox) \u00B7 ' + S('Texture Release - Hair Botox') + ' \u00B7 3 hr 45 min<br>' +
        '\u2022 Perm retouch and style \u00B7 ' + S('Perm Retouch and Style') + '<br><br>' +
        'Smoother, more manageable hair with none of the chemistry that damages it.',

      scalp:
        'Healthy hair first \uD83C\uDF3F We treat the scalp and the bonds before anything else:<br><br>' +
        '\u2022 Flax Seed + Aloe \u00B7 ' + S('Flax Seed + Aloe Treatment') + '<br>' +
        '\u2022 GRO hot oil \u00B7 ' + S('GRO Hot Oil Treatment') + '<br>' +
        '\u2022 K18 bond repair \u00B7 ' + S('K18 Treatment and Bond Repair') + '<br>' +
        '\u2022 Olaplex \u00B7 ' + S('Olaplex Treatment') + '<br>' +
        '\u2022 Scalp &amp; dandruff detox \u00B7 ' + S('Scalp + Dandruff Intensive Detox') + '<br>' +
        '\u2022 B\u0113sia Hair CPR \u00B7 ' + S('Bēsia Hair CPR Treatment') + '<br><br>' +
        'Not sure which? The <a href="./services.html#gen" ' + LINK + '>consultation is free</a>.',

      color:
        'Colour, blended against your natural depth rather than fighting it \uD83C\uDFA8<br><br>' +
        '\u2022 All-over colour \u00B7 short ' + S('All Over Color - Short') + ', medium ' + S('All Over Color - Medium') + ', long ' + S('All Over Color - Long') + '<br>' +
        '\u2022 Balayage \u00B7 from ' + P('Color Service') + '<br>' +
        '\u2022 Full highlights \u00B7 ' + S('Full Highlights') + '<br><br>' +
        'We pair colour with bond repair as standard, so the condition holds.',

      nat:
        'For curls and coils \uD83D\uDC9A Our <strong>Curl Revive</strong> wash-and-go uses in-house flaxseed, rosemary and olive blends with a gentle steam.<br><br>' +
        '\u2022 Curl Revive | Wash + Go \u00B7 ' + S('Curl Revive | Wash + Go') + ' \u00B7 1 hr 30 min<br>' +
        '\u2022 Curly cut \u00B7 ' + S('Curly Cut') + '<br>' +
        '\u2022 Silkpress Xpress \u00B7 ' + S('Silkpress Xpress') + '<br>' +
        '\u2022 Basic wash + blow dry \u00B7 ' + S('Basic Wash + Blowdry') + '<br><br>' +
        'Curl Revive pairs beautifully with the Flax treatment. See <a href="./packages.html" ' + LINK + '>Packages</a>.',

      cut:
        'Shape first, length second \u2702\uFE0F<br><br>' +
        '\u2022 Trim \u00B7 ' + S('Trim') + '<br>' +
        '\u2022 Precision cut \u00B7 ' + S('Precision Cut') + '<br>' +
        '\u2022 Layers \u00B7 ' + S('Layers') + '<br>' +
        '\u2022 Coily curly cut \u00B7 ' + S('Coily Curly Cut') + '<br>' +
        '\u2022 Curly cut \u00B7 ' + S('Curly Cut') + '<br><br>' +
        'Every cut is dry-checked at the end so it sits right when you leave.',

      braid:
        'Parted clean and tensioned gently, so your edges outlive the style \uD83D\uDC51<br><br>' +
        '\u2022 Large braids \u00B7 ' + S('Large Braids') + '<br>' +
        '\u2022 Cornrow updo \u00B7 ' + S('Cornrow Updo') + '<br><br>' +
        'For a protective look with length, ask about the <strong>360 Illusion Crochet</strong>, ' + S('Illusion Crochet') + '.',

      wig:
        'Frontal installation is ' + S('Frontal Installation') + ' \u00B7 1 hr 30 min, fitted flat and blended so the parting reads as scalp \u2728<br><br>' +
        'We also sell ready-to-wear glueless units on the <a href="./shop.html#wigs" ' + LINK + '>Shop page</a>, from GHS 1,650.',

      beauty:
        'Yes! Alongside hair we look after <strong>brows, lashes, waxing and facials</strong> \uD83D\uDC41\uFE0F<br><br>' +
        'These are booked directly with the artist rather than through the online menu, and priced at consultation. ' +
        'Message us on <a href="' + (b.whatsappLink || '#') + '" ' + LINK + '>WhatsApp</a> or call <strong>' + (b.phone || '') + '</strong> and we will match you with the right person.',

      packages:
        'Booking two services together is cheaper than booking them apart \uD83D\uDC9D Our own bundles:<br><br>' +
        '\u2022 Curl Revive + Flax \u00B7 ' + S('Curl Revive + Flax') + '<br>' +
        '\u2022 Curl Revive with FlaxGRO \u00B7 ' + S('Curl Revive with FlaxGRO') + '<br>' +
        '\u2022 Deep Moisture + Curl Revive \u00B7 ' + S('Deep Moisture Treatment + Curl Revive') + '<br><br>' +
        'Build your own combination on the <a href="./packages.html" ' + LINK + '>Packages page</a> and watch the total update live.',

      shop:
        'We sell the same hair we install, and the same products we treat with \uD83D\uDECD\uFE0F<br><br>' +
        '\u2022 Extensions &amp; bundles \u00B7 from GHS 1,200<br>' +
        '\u2022 Closures &amp; frontals \u00B7 from GHS 720<br>' +
        '\u2022 Wigs &amp; units \u00B7 from GHS 1,650<br>' +
        '\u2022 Home care \u00B7 from GHS 180<br>' +
        '\u2022 Studio accessories \u00B7 from GHS 85<br><br>' +
        'Browse the <a href="./shop.html" ' + LINK + '>Shop</a>, add to your bag and check out with Mobile Money or card \u00B7 then follow it on <a href="./track.html" ' + LINK + '>Track Order</a>.',

      moringa:
        'Our own <strong>Moringa line</strong> is launching soon \uD83C\uDF3F Moringa Ginseng Follicle Fuel and a Moringa Root Fuel scalp oil, formulated around the same botanicals we already use in treatment.<br><br>' +
        'You can reserve yours now on the <a href="./shop.html#care" ' + LINK + '>Shop page</a>, pre-orders ship first.',

      consult:
        'Let us get you booked \uD83D\uDCC5 We are open <strong>' + (b.hoursLabel || 'Mon-Sat \u00B7 9am-7pm') + '</strong>, closed Sundays. Saturdays fill first, so midweek is easier.<br><br>' +
        'The <strong>first consultation is free</strong>, 30 minutes to look at your hair and plan properly. ' +
        'Use the <a href="./contact.html" ' + LINK + '>booking form</a> for an instant estimate, or call <strong>' + (b.phone || '') + '</strong>.',

      availability:
        'Rough timings so you can plan your day \u23F1\uFE0F<br><br>' +
        '\u2022 KTip install \u00B7 4 to 7 hours by weight<br>' +
        '\u2022 Nanoplasty \u00B7 4 hr 30 min<br>' +
        '\u2022 Hair Botox \u00B7 3 hr 45 min<br>' +
        '\u2022 Curl Revive \u00B7 1 hr 30 min<br>' +
        '\u2022 Silkpress Xpress \u00B7 1 hr 30 min<br>' +
        '\u2022 Colour \u00B7 2 to 4 hours<br><br>' +
        'Every service on the <a href="./services.html#prices" ' + LINK + '>menu</a> carries its own published duration, and we book to it.',

      team:
        'Of course! We are a message away:<br><br>\uD83D\uDCDE <strong>' + (b.phone || '') + '</strong><br><br>' +
        'Or tap the green WhatsApp button to chat instantly. We usually reply within the hour during opening times.',

      location:
        'You will find us at <strong>54 Fifth Circular Road, Cantonments, Accra</strong> \uD83D\uDCCD<br><br>' +
        'Open <strong>' + (b.hoursLabel || '') + '</strong>, closed Sundays. Parking available on site. ' +
        'Directions are on the <a href="./contact.html" ' + LINK + '>Contact page</a>.',

      greet:
        'Hi \u2728 So glad you are here. Ask me anything: fusion extensions, Nanoplasty, scalp and bond repair, colour, cutting, curls or the shop. Where would you like to start?',

      thanks:
        'You are so welcome! \uD83D\uDC95 We cannot wait to have you in the chair. Anything else I can help with?',

      fallback:
        'Good question! Our team will answer that one best. Reach them on <strong>' + (b.phone || '') + '</strong> or tap <em>Speak to the team</em> below. ' +
        'Meanwhile, every price and duration is published on the <a href="./services.html#prices" ' + LINK + '>Services page</a>.'
    };
  }
  buildReplies();
  /* Rebuild if the owner changes a price or hides something while the
     page is open, so an answer given a minute later is still correct. */
  if (window.BESIA && BESIA.live) BESIA.live.onChange(buildReplies);

  function detectIntent(text) {
    for (var i = 0; i < RESPONSES.length; i++) {
      if (RESPONSES[i].match.test(text)) return RESPONSES[i].intent;
    }
    return 'fallback';
  }

  function handleUser(text, intent) {
    addMsg(text.replace(/</g, '&lt;'), 'user');
    quick.innerHTML = '';
    var key = intent || detectIntent(text);
    botSay(INTENT_REPLIES[key] || INTENT_REPLIES.fallback, 1200).then(function () {
      setQuickReplies(DEFAULT_QUICK);
    });
  }

  /* ---------- Events ---------- */
  function setOpen(open) {
    win.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && !opened) { opened = true; playIntro(); }
    if (open) window.setTimeout(function () { input.focus(); }, 450);
  }
  fab.addEventListener('click', function () { setOpen(!win.classList.contains('is-open')); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && win.classList.contains('is-open')) setOpen(false);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    handleUser(text);
  });
})();
