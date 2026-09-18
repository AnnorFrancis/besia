/* ============================================================
   BĒSIA BEAUTY STUDIO, booking-cart.js
   The appointment cart. One component, on every public page.

   How a customer books:
     1. Anywhere on the site, "Add" puts a service or a package in
        the booking. The page never jumps; a slim bar keeps count.
     2. "Book now" buttons anywhere open the booking as a side sheet
        (a full sheet on phones). Inside it she can see what she has
        chosen, search the whole menu, switch to packages, add and
        remove freely, or hide the sheet and keep browsing.
     3. Continue, give her details once, request the appointment.
        It lands in the Studio Manager's Appointments, named exactly.

   Everything is read through BESIA.live, so prices, new items and
   anything the owner unpublishes in the manager are obeyed here too.
   ============================================================ */
(function () {
  'use strict';
  if (!window.BESIA || !BESIA.live) return;
  var B = window.BESIA, L = B.live;

  var PICK_KEY = 'besia-picked';
  var MEM_KEY = 'besia-booking-form';
  var BOOKINGS_KEY = 'besia-web-bookings';

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
  function has(name) { return items().indexOf(name) !== -1; }
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
  function totals(people) {
    var sum = 0, open = false;
    items().forEach(function (n) {
      var it = L.find('service', n);
      if (!it) return;
      sum += it.price;
      if (it.raw && it.raw.price == null) open = true;
    });
    return { sum: sum * Math.max(1, people || 1), open: open };
  }
  function priceText(it) { return (it.raw && it.raw.price == null ? 'from ' : '') + (it.price > 0 ? money(it.price) : 'Free'); }

  /* ---------- markup, injected once ---------- */
  var root = document.createElement('div');
  root.innerHTML =
    '<div class="bk-backdrop" data-bk-close></div>' +
    '<aside class="bk" role="dialog" aria-modal="true" aria-label="Your booking" aria-hidden="true">' +
      '<header class="bk-head">' +
        '<div><span class="bk-eyebrow">Appointment</span><h2 class="bk-title">Your booking</h2></div>' +
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

  var view = 'cart';          /* cart | details | done */
  var tab = 'services';       /* services | packages */
  var openCat = null;         /* category key expanded in the picker */
  var query = '';
  var lastRef = '';

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

  function renderCart() {
    titleEl.textContent = 'Your booking';
    var list = items();
    var pub = L.published(L.services());
    var h = '';

    /* chosen */
    h += '<section class="bk-sec">';
    if (list.length) {
      h += '<ul class="bk-items">' + list.map(function (n) {
        var it = L.find('service', n);
        return '<li><span class="bk-item-name">' + esc(n) + (it.raw && it.raw.dur ? '<em>' + esc(it.raw.dur) + '</em>' : '') + '</span>' +
               '<span class="bk-item-price">' + priceText(it) + '</span>' +
               '<button type="button" class="bk-x" data-bk-remove="' + esc(n) + '" aria-label="Remove ' + esc(n) + '">×</button></li>';
      }).join('') + '</ul>';
    } else {
      h += '<p class="bk-empty">Nothing chosen yet. Add a service or a package below, or start with a free consultation.</p>' +
           (L.find('service', 'Free Hair Consultation') ? '<button type="button" class="bk-link" data-bk-add="Free Hair Consultation">Add the free consultation</button>' : '');
    }
    h += '</section>';

    /* add more */
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
      h += '<input type="search" class="bk-search" placeholder="Search the menu, for example lashes" value="' + esc(query) + '" aria-label="Search services">';
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
    body.innerHTML = h;

    var t = totals(1);
    foot.innerHTML =
      '<div class="bk-total"><span>Estimate</span><strong>' + (t.open ? 'from ' : '') + money(t.sum) + '</strong></div>' +
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
    body.innerHTML =
      '<section class="bk-sec">' +
        '<p class="bk-summary">' + list.length + (list.length === 1 ? ' service' : ' services') + ': ' + esc(list.join(', ')) + '</p>' +
      '</section>' +
      '<section class="bk-sec bk-form">' +
        '<label class="bk-field"><span>Your name</span><input type="text" name="name" autocomplete="name" value="' + esc(m.name || '') + '"></label>' +
        '<label class="bk-field"><span>Phone or WhatsApp number</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel" value="' + esc(m.phone || '') + '"></label>' +
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
    foot.innerHTML =
      '<div class="bk-total"><span>Estimate' + (people > 1 ? ' for ' + people : '') + '</span><strong>' + (t.open ? 'from ' : '') + money(t.sum) + '</strong></div>' +
      '<p class="bk-note">We confirm your slot and the final price on WhatsApp, usually within the hour. Nothing is charged now.</p>' +
      '<button type="button" class="btn btn--gold bk-primary" data-bk-submit>Request appointment</button>' +
      '<button type="button" class="bk-link" data-bk-go="cart">Back to my booking</button>';
  }

  function renderDone() {
    titleEl.textContent = 'Request sent';
    body.innerHTML =
      '<section class="bk-sec bk-done">' +
        '<div class="bk-done-mark">✓</div>' +
        '<p class="bk-done-ref">' + esc(lastRef) + '</p>' +
        '<p>Thank you. Your request is with the studio, and we will confirm your slot and the final price on WhatsApp, usually within the hour.</p>' +
        '<a class="btn btn--ghost-dark" target="_blank" rel="noopener" href="https://wa.me/' + esc((B.business && B.business.whatsapp) || '233240787993') + '?text=' +
          encodeURIComponent('Hello Bēsia Beauty Studio! I have a question about my booking ' + lastRef + '.') + '">Message us on WhatsApp</a>' +
      '</section>';
    foot.innerHTML = '<button type="button" class="btn btn--gold bk-primary" data-bk-close>Done</button>';
  }

  function render() {
    if (view === 'details' && !items().length) view = 'cart';
    if (view === 'cart') renderCart();
    else if (view === 'details') renderDetails();
    else renderDone();
  }
  function refresh() {
    if (sheet.classList.contains('is-open')) {
      var y = body.scrollTop;
      render();
      body.scrollTop = y;
    }
    renderBar();
  }

  /* ---------- open and hide ---------- */
  function open(opts) {
    opts = opts || {};
    if (view === 'done') view = 'cart';
    if (opts.tab) tab = opts.tab;
    if (opts.cat) { tab = 'services'; openCat = opts.cat; query = ''; view = 'cart'; }
    sheet.classList.add('is-open');
    backdrop.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bk-open');
    render();
    renderBar();
    if (opts.cat) {
      var d = body.querySelector('details[open]');
      if (d) d.scrollIntoView({ block: 'start' });
    }
  }
  function close() {
    sheet.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bk-open');
    if (view === 'done') view = 'cart';
    renderBar();
  }

  /* ---------- submit ---------- */
  function submit() {
    var err = body.querySelector('.bk-error');
    function fail(msg, field) {
      err.textContent = msg; err.hidden = false;
      var el = body.querySelector('[name="' + field + '"]');
      if (el) el.focus();
    }
    var m = memRead();
    var name = (m.name || '').trim(), phone = (m.phone || '').trim(), date = (m['event-date'] || '').trim();
    if (name.length < 2) return fail('Please tell us your name.', 'name');
    if (!/^[\d\s+()-]{9,}$/.test(phone)) return fail('Please give a phone or WhatsApp number we can reach you on.', 'phone');
    if (!date) return fail('Please choose a date.', 'event-date');
    if (date < new Date().toISOString().slice(0, 10)) return fail('That date has passed. Please choose another.', 'event-date');
    var day = new Date(date + 'T12:00:00').getDay();
    var openDays = (B.business && B.business.openDays) || [1, 2, 3, 4, 5, 6];
    if (openDays.indexOf(day) === -1) return fail('The studio is closed that day. We are open Monday to Saturday.', 'event-date');

    var people = Math.max(1, Math.min(parseInt(m.guests, 10) || 1, 20));
    var list = items();
    var t = totals(people);
    lastRef = 'APT-' + Date.now().toString().slice(-6);
    try {
      var all = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
      all.push({
        id: lastRef, name: name, phone: phone,
        service: list.join(', '), occasion: '',
        slot: m['time-slot'] || 'Any time', people: String(people),
        amount: Math.round(t.sum), date: date, notes: (m.notes || '').trim(),
        status: 'Pending', ts: Date.now()
      });
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    } catch (e) {}
    save([]);
    try { sessionStorage.removeItem(MEM_KEY); } catch (e) {}
    view = 'done';
    render();
    renderBar();
  }

  /* ---------- events inside the sheet ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-bk-close],[data-bk-open],[data-bk-add],[data-bk-remove],[data-bk-tab],[data-bk-go],[data-bk-submit]');
    if (!t) return;
    if (t.hasAttribute('data-bk-close')) return close();
    if (t.hasAttribute('data-bk-open')) return open();
    if (t.hasAttribute('data-bk-add')) { add(t.getAttribute('data-bk-add')); return; }
    if (t.hasAttribute('data-bk-remove')) return remove(t.getAttribute('data-bk-remove'));
    if (t.hasAttribute('data-bk-tab')) { tab = t.getAttribute('data-bk-tab'); query = ''; return render(); }
    if (t.hasAttribute('data-bk-go')) { view = t.getAttribute('data-bk-go'); render(); body.scrollTop = 0; return; }
    if (t.hasAttribute('data-bk-submit')) return submit();
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
        if (s) s.textContent = (t.open ? 'from ' : '') + money(t.sum);
      }
    }
  });
  root.addEventListener('change', function (e) { if (e.target.name) memWrite(e.target.name, e.target.value); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('is-open')) close(); });

  /* ---------- the rest of the site talks to the cart ---------- */
  function isBookingCta(a) {
    if (a.closest('.bk') || a.hasAttribute('data-no-cart')) return false;
    var href = a.getAttribute('href') || '';
    if (!/contact\.html(\?|#|$)/.test(href)) return false;
    if (a.closest('.nav-links, .nav-overlay-links, .footer-col, .breadcrumb')) return /^\s*book/i.test(a.textContent);
    return a.classList.contains('btn') || a.classList.contains('ab-book') || !!a.closest('.nav-cta') || /^\s*book/i.test(a.textContent);
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
    /* Book now, everywhere: open the booking, never jump pages */
    if (el.tagName === 'A' && isBookingCta(el)) {
      e.preventDefault();
      var m = (el.getAttribute('href').match(/[?&]service=([\w-]+)/) || [])[1];
      var cat = m ? (B.serviceCategories.filter(function (c) { return c.slug === m; })[0] || {}).key : null;
      open(cat ? { cat: cat } : {});
    }
  }, true);   /* capture: claim the click before any page-transition handler sees it */

  if (L.onChange) L.onChange(refresh);
  window.addEventListener('storage', function (e) { if (e.key === PICK_KEY) refresh(); });

  window.BesiaBooking = {
    add: add, remove: remove, open: open, close: close, items: items,
    addMany: function (names) { names.forEach(function (n) { add(n); }); }
  };

  renderBar();
})();
