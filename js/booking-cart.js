/* ============================================================
   BĒSIA BEAUTY STUDIO, booking-cart.js
   The appointment cart. One component, on every public page.

   How a customer books:
     1. Anywhere on the site, "Add" puts a service or a package in
        the booking. The page never jumps; a slim bar keeps count.
     2. "Book" buttons anywhere open the booking as a side sheet
        (a full sheet on phones). A core service card opens it on
        exactly the services beneath that core service. Inside she can
        see what she has chosen, search the whole menu, switch to
        packages, add and remove freely, or hide the sheet and keep
        browsing.
     3. Continue, give her details once, then pay on the site, by
        Mobile Money or card. Dana asked for this (6 Oct): paying here
        means nothing has to go back and forth on WhatsApp. The request
        lands in the Studio Manager's Appointments, named exactly,
        with what was paid; if the time is taken the studio offers the
        nearest free slot and the payment holds it.

   Payment here is a labelled simulation, like the shop's checkout:
   no money moves and no card number is ever asked for. In production
   the pay step hands over to Paystack (MoMo and card) and nothing
   else in this file changes.

   Everything is read through BESIA.live, so prices, new items and
   anything the owner unpublishes in the manager are obeyed here too.
   ============================================================ */
(function () {
  'use strict';
  if (!window.BESIA || !BESIA.live) return;
  var B = window.BESIA, L = B.live;

  var PICK_KEY = 'besia-picked';
  var MEM_KEY = 'besia-booking-form';
  var ATTACH_KEY = 'besia-booking-attach';
  var BOOKINGS_KEY = 'besia-web-bookings';
  var NETWORKS = ['MTN MoMo', 'Telecel Cash', 'AT Money'];

  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function money(n) { return B.money(n); }

  /* ---------- the selection ---------- */
  function items() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(PICK_KEY) || '[]'); } catch (e) { raw = []; }
    if (!Array.isArray(raw)) raw = [];
    var out = [];
    raw.forEach(function (name) {
      var it = L.find('service', name);
      if (it && it.published && out.indexOf(name) === -1) out.push(name);
    });
    return out;
  }
  function save(list) {
    try {
      if (list.length) localStorage.setItem(PICK_KEY, JSON.stringify(list));
      else localStorage.removeItem(PICK_KEY);
    } catch (e) {}
  }
  function add(name) {
    var it = L.find('service', name);
    if (!it || !it.published) return false;
    var list = items();
    if (list.indexOf(name) !== -1) return false;
    list.push(name);
    save(list);
    refresh();
    return true;
  }
  function remove(name) {
    save(items().filter(function (n) { return n !== name; }));
    refresh();
  }

  /* Priced at consultation: no published price and none set by the owner. */
  function atConsult(it) { var r = it.raw || {}; return r.price == null && r.from == null && !(it.price > 0); }
  function totals(people) {
    var sum = 0, open = false, consult = false;
    items().forEach(function (n) {
      var it = L.find('service', n);
      if (!it) return;
      if (atConsult(it)) { consult = true; return; }
      sum += it.price;
      if (it.raw && it.raw.price == null) open = true;
    });
    return { sum: sum * Math.max(1, people || 1), open: open, consult: consult };
  }
  function priceText(it) {
    if (atConsult(it)) return 'At consultation';
    return (it.raw && it.raw.price == null ? 'from ' : '') + (it.price > 0 ? money(it.price) : 'Free');
  }
  function totalText(t) { return (t.open ? 'from ' : '') + money(t.sum) + (t.consult ? ' + consultation' : ''); }

  /* ---------- something a page hands over with the booking ----------
     The Hair Club form uses this: her answers travel with the request
     and land in the manager beside it. Session only. */
  function attachRead() { try { return JSON.parse(sessionStorage.getItem(ATTACH_KEY) || 'null'); } catch (e) { return null; } }
  function attach(label, data) {
    try { sessionStorage.setItem(ATTACH_KEY, JSON.stringify({ label: label, data: data })); } catch (e) {}
  }

  /* ---------- markup, injected once ---------- */
  var root = document.createElement('div');
  root.innerHTML =
    '<div class="bk-backdrop" data-bk-close></div>' +
    '<aside class="bk" role="dialog" aria-modal="true" aria-label="Your booking" aria-hidden="true">' +
      '<header class="bk-head">' +
        '<div>' +
          '<span class="bk-mark" aria-label="Bēsia Beauty Studio"><span class="bk-mark-name">Bēsia</span><span class="bk-mark-sub">Beauty Studio</span></span>' +
          '<h2 class="bk-title">Your booking</h2>' +
        '</div>' +
        '<button type="button" class="bk-close" data-bk-close aria-label="Hide booking">×</button>' +
      '</header>' +
      '<div class="bk-body"></div>' +
      '<footer class="bk-foot"></footer>' +
    '</aside>' +
    '<div class="cart-bar book-bar" role="status"></div>' +
    '<div class="bk-toast" role="status" aria-live="polite"></div>';
  document.body.appendChild(root);

  var sheet = root.querySelector('.bk');
  var backdrop = root.querySelector('.bk-backdrop');
  var body = root.querySelector('.bk-body');
  var foot = root.querySelector('.bk-foot');
  var bar = root.querySelector('.book-bar');
  var toastEl = root.querySelector('.bk-toast');
  var titleEl = root.querySelector('.bk-title');

  var view = 'cart';          /* cart | details | pay | paying | done */
  var tab = 'services';       /* services | packages */
  var openCat = null;         /* category key expanded in the picker */
  var focusCore = null;       /* a core service the sheet was opened on */
  var query = '';
  var lastRef = '';
  var lastPaid = null;        /* { amount, method } once paid */

  /* ---------- toast ---------- */
  var toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-shown'); }, 2200);
  }

  /* ---------- what she has typed survives hiding the sheet ---------- */
  function memRead() { try { return JSON.parse(sessionStorage.getItem(MEM_KEY) || '{}'); } catch (e) { return {}; } }
  function memWrite(k, v) { var m = memRead(); m[k] = v; try { sessionStorage.setItem(MEM_KEY, JSON.stringify(m)); } catch (e) {} }

  /* ---------- the bar ---------- */
  function renderBar() {
    var list = items();
    if (!list.length || sheet.classList.contains('is-open')) { bar.classList.remove('is-shown'); return; }
    var t = totals(1);
    bar.innerHTML =
      '<span class="cart-bar-count">' + list.length + '</span>' +
      '<span class="cart-bar-label">' + (list.length === 1 ? 'service in your booking' : 'services in your booking') + '</span>' +
      '<span class="cart-bar-total">' + (t.open ? 'from ' : '') + money(t.sum) + '</span>' +
      '<button type="button" class="cart-bar-cta" data-bk-open>View booking</button>';
    /* sit above the shop bag bar if that is showing too */
    bar.classList.toggle('is-raised', !!document.querySelector('.cart-bar.is-shown:not(.book-bar)'));
    bar.classList.add('is-shown');
  }

  /* ---------- views ---------- */
  function rowHtml(it, inCart) {
    return '<li class="bk-pick' + (inCart ? ' is-in' : '') + '">' +
      '<span class="bk-pick-name">' + esc(it.name) + (it.raw && it.raw.dur ? '<em>' + esc(it.raw.dur) + '</em>' : '') + '</span>' +
      '<span class="bk-pick-price">' + priceText(it) + '</span>' +
      (inCart
        ? '<span class="bk-pick-in" aria-label="Already in your booking">✓</span>'
        : '<button type="button" class="bk-pick-add" data-bk-add="' + esc(it.name) + '" aria-label="Add ' + esc(it.name) + '">+</button>') +
    '</li>';
  }
  function coreOf(slug) {
    return (B.coreServices || []).filter(function (c) { return c.slug === slug; })[0] || null;
  }

  function renderCart() {
    titleEl.textContent = 'Your booking';
    var list = items();
    var pub = L.published(L.services());
    var h = '';

    /* opened on a core service: its services first, ready to add */
    var core = focusCore ? coreOf(focusCore) : null;
    if (core) {
      var mine = core.services.map(function (n) { return L.find('service', n); })
        .filter(function (it) { return it && it.published; });
      h += '<section class="bk-sec bk-core">' +
        '<h3 class="bk-core-title">' + esc(core.label) + '</h3>' +
        '<p class="bk-hint">' + esc(core.subs.join(' · ')) + '. Add what you would like, then continue.</p>' +
        (mine.length ? '<ul class="bk-picks">' + mine.map(function (it) { return rowHtml(it, list.indexOf(it.name) !== -1); }).join('') + '</ul>'
                     : '<p class="bk-hint">These are booked with the studio directly for now. Add the free consultation and we will plan it with you.</p>') +
      '</section>';
    }

    /* chosen */
    h += '<section class="bk-sec">';
    if (core) h += '<p class="bk-label">In your booking</p>';
    if (list.length) {
      h += '<ul class="bk-items">' + list.map(function (n) {
        var it = L.find('service', n);
        return '<li><span class="bk-item-name">' + esc(n) + (it.raw && it.raw.dur ? '<em>' + esc(it.raw.dur) + '</em>' : '') + '</span>' +
               '<span class="bk-item-price">' + priceText(it) + '</span>' +
               '<button type="button" class="bk-x" data-bk-remove="' + esc(n) + '" aria-label="Remove ' + esc(n) + '">×</button></li>';
      }).join('') + '</ul>';
    } else {
      h += '<p class="bk-empty">Nothing chosen yet.</p>' +
           (L.find('service', 'Free Hair Consultation') ? '<button type="button" class="bk-link" data-bk-add="Free Hair Consultation">Add the free consultation</button>' : '');
    }
    h += '</section>';

    /* add more: the whole menu, unless the sheet is on one core service */
    if (core) {
      h += '<section class="bk-sec"><button type="button" class="bk-link" data-bk-allmenu>Browse the whole menu</button></section>';
    } else {
      h += '<section class="bk-sec bk-add">' +
        '<div class="bk-tabs" role="tablist">' +
          '<button type="button" role="tab" data-bk-tab="services" class="' + (tab === 'services' ? 'is-active' : '') + '">Services</button>' +
          '<button type="button" role="tab" data-bk-tab="packages" class="' + (tab === 'packages' ? 'is-active' : '') + '">Packages</button>' +
        '</div>';

      if (tab === 'packages') {
        var packs = pub.filter(function (s) { return s.raw && s.raw.bundle; });
        h += '<p class="bk-hint">Ready-made pairings. Add one, then add any single service on top.</p>' +
             '<ul class="bk-picks">' + packs.map(function (it) { return rowHtml(it, list.indexOf(it.name) !== -1); }).join('') + '</ul>';
      } else {
        h += '<input type="search" class="bk-search" placeholder="Search the menu" value="' + esc(query) + '" aria-label="Search services">';
        if (query.trim()) {
          var q = query.trim().toLowerCase();
          var hits = pub.filter(function (s) {
            var cat = B.categoryOf ? (B.categoryOf(s.cat) || {}).label || '' : '';
            return s.name.toLowerCase().indexOf(q) !== -1 || cat.toLowerCase().indexOf(q) !== -1;
          });
          h += hits.length
            ? '<ul class="bk-picks">' + hits.map(function (it) { return rowHtml(it, list.indexOf(it.name) !== -1); }).join('') + '</ul>'
            : '<p class="bk-hint">Nothing on the menu matches that. Try another word.</p>';
        } else {
          h += B.serviceCategories.map(function (c) {
            var inCat = pub.filter(function (s) { return s.cat === c.key; });
            if (!inCat.length) return '';
            var isOpen = openCat === c.key;
            return '<details class="bk-cat"' + (isOpen ? ' open' : '') + ' data-bk-cat="' + esc(c.key) + '">' +
              '<summary><span>' + esc(c.label) + '</span><span class="bk-cat-n">' + inCat.length + '</span></summary>' +
              (isOpen ? '<ul class="bk-picks">' + inCat.map(function (it) { return rowHtml(it, list.indexOf(it.name) !== -1); }).join('') + '</ul>' : '') +
            '</details>';
          }).join('');
        }
      }
      h += '</section>';
    }
    body.innerHTML = h;

    var t = totals(1);
    foot.innerHTML =
      '<div class="bk-total"><span>Estimate</span><strong>' + totalText(t) + '</strong></div>' +
      '<button type="button" class="btn btn--gold bk-primary" data-bk-go="details"' + (list.length ? '' : ' disabled') + '>Continue</button>' +
      '<button type="button" class="bk-link bk-hide" data-bk-close>Hide and keep browsing</button>';
  }

  function renderDetails() {
    titleEl.textContent = 'Your details';
    var m = memRead();
    var today = new Date().toISOString().slice(0, 10);
    var list = items();
    var people = parseInt(m.guests, 10) || 1;
    var t = totals(people);
    var att = attachRead();
    body.innerHTML =
      '<section class="bk-sec">' +
        '<p class="bk-summary">' + list.length + (list.length === 1 ? ' service' : ' services') + ': ' + esc(list.join(', ')) + '</p>' +
        (att ? '<p class="bk-summary bk-attached">With your ' + esc(att.label) + '.</p>' : '') +
      '</section>' +
      '<section class="bk-sec bk-form">' +
        '<label class="bk-field"><span>Your name</span><input type="text" name="name" autocomplete="name" value="' + esc(m.name || '') + '"></label>' +
        '<label class="bk-field"><span>Phone number</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel" value="' + esc(m.phone || '') + '"></label>' +
        '<div class="bk-row">' +
          '<label class="bk-field"><span>Preferred date</span><input type="date" name="event-date" min="' + today + '" value="' + esc(m['event-date'] || '') + '"></label>' +
          '<label class="bk-field"><span>Time of day</span><select name="time-slot">' +
            ['Any time', 'Morning, 9am to 12pm', 'Afternoon, 12pm to 4pm', 'Evening, 4pm to 7pm'].map(function (o) {
              return '<option' + (m['time-slot'] === o ? ' selected' : '') + '>' + o + '</option>';
            }).join('') + '</select></label>' +
        '</div>' +
        '<label class="bk-field"><span>How many people</span><input type="number" name="guests" min="1" max="20" inputmode="numeric" value="' + people + '"></label>' +
        '<label class="bk-field"><span>Anything we should know (optional)</span><textarea name="notes" rows="3">' + esc(m.notes || '') + '</textarea></label>' +
        '<p class="bk-error" hidden></p>' +
      '</section>';
    var pay = t.sum > 0;
    foot.innerHTML =
      '<div class="bk-total"><span>Estimate' + (people > 1 ? ' for ' + people : '') + '</span><strong>' + totalText(t) + '</strong></div>' +
      '<p class="bk-note">' + (pay
        ? 'Next, pay on this page to secure your appointment.' + (t.open || t.consult ? ' Anything priced from, or at consultation, is settled in the studio.' : '')
        : 'Nothing to pay now. We confirm your time, and the price after your consultation.') + '</p>' +
      '<button type="button" class="btn btn--gold bk-primary" data-bk-next>' + (pay ? 'Continue to payment' : 'Request appointment') + '</button>' +
      '<button type="button" class="bk-link" data-bk-go="cart">Back to my booking</button>';
  }

  function renderPay() {
    titleEl.textContent = 'Payment';
    var m = memRead();
    var people = parseInt(m.guests, 10) || 1;
    var t = totals(people);
    var method = m.paymethod === 'card' ? 'card' : 'momo';
    var when = (m['event-date'] ? new Date(m['event-date'] + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '') +
               (m['time-slot'] && m['time-slot'] !== 'Any time' ? ', ' + m['time-slot'].split(',')[0].toLowerCase() : '');
    body.innerHTML =
      '<section class="bk-sec">' +
        '<p class="bk-summary">' + esc(items().join(', ')) + (when ? '<br>' + esc(when) : '') + '</p>' +
      '</section>' +
      '<section class="bk-sec bk-pay">' +
        '<div class="bk-methods" role="radiogroup" aria-label="How you would like to pay">' +
          '<label class="bk-method' + (method === 'momo' ? ' is-active' : '') + '"><input type="radio" name="paymethod" value="momo"' + (method === 'momo' ? ' checked' : '') + '>' +
            '<span><strong>Mobile Money</strong><em>MTN MoMo, Telecel Cash, AT Money</em></span></label>' +
          '<label class="bk-method' + (method === 'card' ? ' is-active' : '') + '"><input type="radio" name="paymethod" value="card"' + (method === 'card' ? ' checked' : '') + '>' +
            '<span><strong>Card</strong><em>Visa or Mastercard, on the secure payment page</em></span></label>' +
        '</div>' +
        (method === 'momo'
          ? '<div class="bk-row bk-momo">' +
              '<label class="bk-field"><span>Network</span><select name="network">' +
                NETWORKS.map(function (n) { return '<option' + (m.network === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>' +
              '<label class="bk-field"><span>MoMo number</span><input type="tel" name="momo" inputmode="tel" autocomplete="tel" value="' + esc(m.momo || m.phone || '') + '"></label>' +
            '</div>'
          : '<p class="bk-hint">You will finish on the payment page of our bank partner. Bēsia never sees or keeps your card number.</p>') +
        '<p class="bk-note">If the time you asked for is taken, we call you with the nearest free slot, and your payment holds it.</p>' +
        '<p class="bk-demo">Demo payment, no real money moves. The live site takes Mobile Money and card through Paystack.</p>' +
        '<p class="bk-error" hidden></p>' +
      '</section>';
    foot.innerHTML =
      '<div class="bk-total"><span>To pay now' + (people > 1 ? ', for ' + people : '') + '</span><strong>' + money(t.sum) + '</strong></div>' +
      '<button type="button" class="btn btn--gold bk-primary" data-bk-pay>Pay ' + money(t.sum) + ' and book</button>' +
      '<button type="button" class="bk-link" data-bk-go="details">Back to my details</button>';
  }

  function renderPaying(step, detail) {
    titleEl.textContent = 'Payment';
    body.innerHTML =
      '<section class="bk-sec bk-paying" aria-live="polite">' +
        '<div class="bk-spin" aria-hidden="true"></div>' +
        '<p class="bk-pay-step">' + esc(step) + '</p>' +
        '<p class="bk-hint">' + esc(detail) + '</p>' +
        '<p class="bk-demo">Demo, no real charge</p>' +
      '</section>';
    foot.innerHTML = '';
  }

  function renderDone() {
    titleEl.textContent = lastPaid ? 'Booked and paid' : 'Request sent';
    body.innerHTML =
      '<section class="bk-sec bk-done">' +
        '<div class="bk-done-mark">✓</div>' +
        '<p class="bk-done-ref">' + esc(lastRef) + '</p>' +
        (lastPaid
          ? '<p>Thank you. ' + esc(money(lastPaid.amount)) + ' paid by ' + esc(lastPaid.method) + '. Your appointment is with the studio; we confirm the exact time by call or text. If it is taken, we offer you the nearest free slot.</p>'
          : '<p>Thank you. Your request is with the studio. We confirm your time by call or text, usually within the hour.</p>') +
        '<p class="bk-hint">Keep your reference. Questions? <a class="bk-inline" target="_blank" rel="noopener" href="https://wa.me/' + esc((B.business && B.business.whatsapp) || '233240787993') + '?text=' +
          encodeURIComponent('Hello Bēsia Beauty Studio, I have a question about my booking ' + lastRef + '.') + '">Message the studio</a>.</p>' +
      '</section>';
    foot.innerHTML = '<button type="button" class="btn btn--gold bk-primary" data-bk-close>Done</button>';
  }

  function render() {
    if ((view === 'details' || view === 'pay') && !items().length) view = 'cart';
    if (view === 'cart') renderCart();
    else if (view === 'details') renderDetails();
    else if (view === 'pay') renderPay();
    else if (view === 'paying') return;
    else renderDone();
  }
  function refresh() {
    if (sheet.classList.contains('is-open') && view !== 'paying') {
      var y = body.scrollTop;
      render();
      body.scrollTop = y;
    }
    renderBar();
  }

  /* ---------- open and hide ---------- */
  function open(opts) {
    opts = opts || {};
    if (view === 'done' || view === 'paying') view = 'cart';
    if (opts.tab) tab = opts.tab;
    focusCore = opts.core || null;
    if (opts.cat) { tab = 'services'; openCat = opts.cat; query = ''; view = 'cart'; }
    if (opts.core) { tab = 'services'; query = ''; view = 'cart'; }
    if (opts.view) view = opts.view;
    var wasOpen = sheet.classList.contains('is-open');
    sheet.classList.add('is-open');
    backdrop.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bk-open');
    render();
    body.scrollTop = 0;
    renderBar();
    if (!wasOpen) {
      openedAt = Date.now();
      /* the rest of the site listens: films pause, the nav goes solid */
      document.dispatchEvent(new CustomEvent('besia:sheet', { detail: { name: 'booking', open: true } }));
      /* a history entry, so the phone's Back button hides the sheet instead of leaving the page */
      if (!opts.fromHistory && window.history && history.pushState) {
        try { history.pushState({ besiaSheet: 'booking' }, ''); } catch (e) {}
      }
    }
    if (opts.cat) {
      var d = body.querySelector('details[open]');
      if (d) d.scrollIntoView({ block: 'start' });
    }
  }
  function close(fromHistory) {
    if (view === 'paying') return;   /* never abandon a payment half-way */
    var wasOpen = sheet.classList.contains('is-open');
    sheet.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bk-open');
    if (view === 'done') { view = 'cart'; lastPaid = null; }
    focusCore = null;
    renderBar();
    if (wasOpen) {
      document.dispatchEvent(new CustomEvent('besia:sheet', { detail: { name: 'booking', open: false } }));
      if (fromHistory !== true && history.state && history.state.besiaSheet === 'booking') {
        try { history.back(); } catch (e) {}
      }
    }
  }
  /* Back hides the sheet. A history step landing within a breath of the
     sheet opening belongs to whatever closed just before it (Contents). */
  var openedAt = 0;
  window.addEventListener('popstate', function () {
    if (Date.now() - openedAt < 400) return;
    if (sheet.classList.contains('is-open')) close(true);
  });

  /* ---------- checks before paying ---------- */
  function fail(msg, field) {
    var err = body.querySelector('.bk-error');
    if (err) { err.textContent = msg; err.hidden = false; }
    var el = body.querySelector('[name="' + field + '"]');
    if (el) el.focus();
    return false;
  }
  function detailsOk() {
    var m = memRead();
    var name = (m.name || '').trim(), phone = (m.phone || '').trim(), date = (m['event-date'] || '').trim();
    if (name.length < 2) return fail('Please tell us your name.', 'name');
    if (!/^[\d\s+()-]{9,}$/.test(phone)) return fail('Please give a phone number we can reach you on.', 'phone');
    if (!date) return fail('Please choose a date.', 'event-date');
    if (date < new Date().toISOString().slice(0, 10)) return fail('That date has passed. Please choose another.', 'event-date');
    var day = new Date(date + 'T12:00:00').getDay();
    var openDays = (B.business && B.business.openDays) || [1, 2, 3, 4, 5, 6];
    if (openDays.indexOf(day) === -1) return fail('The studio is closed that day. We are open Monday to Saturday.', 'event-date');
    return true;
  }

  /* ---------- pay, simulated ---------- */
  function pay() {
    var m = memRead();
    var method = m.paymethod === 'card' ? 'card' : 'momo';
    if (method === 'momo' && !/^[\d\s+()-]{9,}$/.test((m.momo || m.phone || '').trim())) return fail('Enter the MoMo number to send the prompt to.', 'momo');
    var people = Math.max(1, Math.min(parseInt(m.guests, 10) || 1, 20));
    var amount = totals(people).sum;
    var network = NETWORKS.indexOf(m.network) !== -1 ? m.network : NETWORKS[0];
    var number = (m.momo || m.phone || '').trim();
    var paid = method === 'momo'
      ? { amount: amount, method: network, detail: number }
      : { amount: amount, method: 'Card', detail: '' };
    view = 'paying';
    if (method === 'momo') {
      renderPaying('Contacting ' + network, 'Sending a payment prompt to ' + number);
      setTimeout(function () { renderPaying('Prompt sent to your phone', 'Approve with your PIN. In this demo it approves itself.'); }, 1400);
      setTimeout(function () { renderPaying('Payment received', 'Booking your appointment'); }, 3000);
      setTimeout(function () { submit(paid); }, 3900);
    } else {
      renderPaying('Opening the secure payment page', 'Your card is entered there, never on this site');
      setTimeout(function () { renderPaying('Payment approved', 'Booking your appointment'); }, 1800);
      setTimeout(function () { submit(paid); }, 2700);
    }
  }

  /* ---------- submit ---------- */
  function submit(paid) {
    var m = memRead();
    var people = Math.max(1, Math.min(parseInt(m.guests, 10) || 1, 20));
    var list = items();
    var t = totals(people);
    var att = attachRead();
    lastRef = 'APT-' + Date.now().toString().slice(-6);
    lastPaid = paid ? { amount: paid.amount, method: paid.method } : null;
    try {
      var all = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
      all.push({
        id: lastRef, name: (m.name || '').trim(), phone: (m.phone || '').trim(),
        service: list.join(', '), occasion: '',
        slot: m['time-slot'] || 'Any time', people: String(people),
        amount: Math.round(t.sum), date: (m['event-date'] || '').trim(), notes: (m.notes || '').trim(),
        paid: paid ? Math.round(paid.amount) : 0,
        payMethod: paid ? paid.method : '',
        payDetail: paid ? paid.detail : '',
        payRef: paid ? 'PAY-' + Date.now().toString(36).toUpperCase().slice(-6) : '',
        attach: att || null,
        status: 'Pending', ts: Date.now()
      });
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    } catch (e) {}
    save([]);
    try { sessionStorage.removeItem(MEM_KEY); sessionStorage.removeItem(ATTACH_KEY); } catch (e) {}
    view = 'done';
    render();
    renderBar();
  }

  /* ---------- events inside the sheet ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-bk-close],[data-bk-open],[data-bk-add],[data-bk-remove],[data-bk-tab],[data-bk-go],[data-bk-next],[data-bk-pay],[data-bk-allmenu]');
    if (!t) return;
    if (t.hasAttribute('data-bk-close')) return close();
    if (t.hasAttribute('data-bk-open')) return open();
    if (t.hasAttribute('data-bk-add')) { add(t.getAttribute('data-bk-add')); return; }
    if (t.hasAttribute('data-bk-remove')) return remove(t.getAttribute('data-bk-remove'));
    if (t.hasAttribute('data-bk-tab')) { tab = t.getAttribute('data-bk-tab'); query = ''; return render(); }
    if (t.hasAttribute('data-bk-allmenu')) { focusCore = null; render(); body.scrollTop = 0; return; }
    if (t.hasAttribute('data-bk-go')) { view = t.getAttribute('data-bk-go'); render(); body.scrollTop = 0; return; }
    if (t.hasAttribute('data-bk-next')) {
      if (!detailsOk()) return;
      var m = memRead();
      if (totals(parseInt(m.guests, 10) || 1).sum > 0) { view = 'pay'; render(); body.scrollTop = 0; }
      else submit(null);
      return;
    }
    if (t.hasAttribute('data-bk-pay')) return pay();
  });
  root.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d.matches || !d.matches('details.bk-cat')) return;
    var key = d.getAttribute('data-bk-cat');
    if (d.open && openCat !== key) { openCat = key; render(); var now = body.querySelector('details[open]'); if (now) now.scrollIntoView({ block: 'nearest' }); }
    else if (!d.open && openCat === key) { openCat = null; }
  }, true);
  root.addEventListener('input', function (e) {
    var el = e.target;
    if (el.classList.contains('bk-search')) {
      query = el.value;
      var pos = el.selectionStart;
      render();
      var again = body.querySelector('.bk-search');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (err) {} }
      return;
    }
    if (el.name) {
      memWrite(el.name, el.value);
      var er = body.querySelector('.bk-error'); if (er) er.hidden = true;
      if (el.name === 'guests') {
        var t = totals(parseInt(el.value, 10) || 1);
        var s = foot.querySelector('.bk-total strong');
        if (s) s.textContent = totalText(t);
      }
    }
  });
  root.addEventListener('change', function (e) {
    var el = e.target;
    if (!el.name) return;
    memWrite(el.name, el.value);
    if (el.name === 'paymethod') render();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('is-open')) close(); });

  /* ---------- the rest of the site talks to the cart ---------- */
  function isBookingCta(a) {
    if (a.closest('.bk') || a.hasAttribute('data-no-cart')) return false;
    var href = a.getAttribute('href') || '';
    if (!/contact\.html(\?|#|$)/.test(href)) return false;
    if (a.hasAttribute('data-book')) return true;
    if (a.closest('.nav-links, .nav-overlay-links, .footer-col, .breadcrumb')) return /^\s*book/i.test(a.textContent);
    return a.classList.contains('btn') || a.classList.contains('ab-book') || !!a.closest('.nav-cta') || /^\s*book/i.test(a.textContent);
  }
  function optsFromHref(href) {
    var core = (href.match(/[?&]core=([\w-]+)/) || [])[1];
    if (core && coreOf(core)) return { core: core };
    var m = (href.match(/[?&]service=([\w-]+)/) || [])[1];
    var cat = m ? (B.serviceCategories.filter(function (c) { return c.slug === m; })[0] || {}).key : null;
    return cat ? { cat: cat } : {};
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a,button');
    if (!el || el.closest('.bk')) return;

    /* Add buttons on the menu, package cards, anywhere */
    if (el.hasAttribute('data-add-service')) {
      e.preventDefault();
      var name = el.getAttribute('data-add-service');
      var fresh = add(name);
      if (el.classList.contains('row-book')) toast(fresh ? 'Added to your booking' : 'Already in your booking');
      else open({ tab: 'packages' });
      return;
    }
    /* Book, everywhere: open the booking, never jump pages */
    if (el.tagName === 'A' && isBookingCta(el)) {
      e.preventDefault();
      open(optsFromHref(el.getAttribute('href')));
    }
  }, true);   /* capture: claim the click before any page-transition handler sees it */

  /* A shared link such as contact.html?service=ext or ?core=extensions opens the booking there. */
  (function () {
    var o = optsFromHref(location.search);
    if (o.cat || o.core) setTimeout(function () { open(o); }, 50);
  })();

  if (L.onChange) L.onChange(refresh);
  window.addEventListener('storage', function (e) { if (e.key === PICK_KEY) refresh(); });

  window.BesiaBooking = {
    add: add, remove: remove, open: open, close: close, items: items, attach: attach,
    addMany: function (names) { names.forEach(function (n) { add(n); }); }
  };

  renderBar();
})();
