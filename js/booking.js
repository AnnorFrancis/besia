/* ============================================================
   BĒSIA BEAUTY STUDIO, booking.js
   Multi-step appointment form with validation, instant price
   estimator, and the interactive service builder (packages page).
   Frontend demo, no data leaves the page.
   ============================================================ */
(function () {
  'use strict';

  function fmtGHS(n) {
    return window.BESIA ? BESIA.money(n) : ('GHS ' + Math.round(n).toLocaleString());
  }

  function escHtml(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------- Chosen exact services ----------
     A customer can book one precise service (a Book link on the price
     list, or the builder on the packages page) instead of estimating
     by discipline. The choice travels in localStorage under one key,
     and only names that are still published survive the read. */
  var PICK_KEY = 'besia-picked';
  function readPicked() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(PICK_KEY) || '[]'); } catch (e) { raw = []; }
    if (!Array.isArray(raw) || !window.BESIA || !BESIA.live) return [];
    var out = [];
    raw.forEach(function (name) {
      var it = BESIA.live.find('service', name);
      if (it && it.published && out.indexOf(name) === -1) out.push(name);
    });
    return out;
  }
  function savePicked(list) {
    try {
      if (list.length) localStorage.setItem(PICK_KEY, JSON.stringify(list));
      else localStorage.removeItem(PICK_KEY);
    } catch (e) {}
  }

  /* ============================================================
     MULTI-STEP BOOKING FORM (contact.html)
     ============================================================ */
  var form = document.getElementById('booking-form');
  if (form) {
    var steps = form.querySelectorAll('.form-step');
    var dots = document.querySelectorAll('.progress-step');
    var current = 0;

    function showStep(i) {
      current = i;
      steps.forEach(function (s, idx) { s.classList.toggle('is-active', idx === i); });
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-current', idx === i);
        d.classList.toggle('is-done', idx < i);
      });
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateStep(i) {
      var ok = true;
      steps[i].querySelectorAll('[required]').forEach(function (el) {
        var field = el.closest('.field');
        var valid = !!el.value.trim();
        if (valid && el.type === 'tel') valid = /^[\d\s+()-]{9,}$/.test(el.value.trim());
        if (valid && el.type === 'date') valid = el.value >= new Date().toISOString().slice(0, 10);
        if (field) field.classList.toggle('has-error', !valid);
        if (!valid) ok = false;
      });
      return ok;
    }

    form.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!validateStep(current)) return;
        /* The services step must carry a choice before it lets go. */
        if (steps[current] && steps[current].querySelector('.check-grid')) {
          var chosen = (mode === 'exact' && picked.length) ||
                       form.querySelector('.check-pill input:checked');
          if (!chosen) {
            var pe = document.getElementById('pick-error');
            if (pe) pe.hidden = false;
            return;
          }
        }
        if (current === steps.length - 2) buildQuote(); // entering review step
        showStep(current + 1);
      });
    });
    form.querySelectorAll('[data-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () { showStep(current - 1); });
    });

    // Checkbox pills toggle state
    form.querySelectorAll('.check-pill input').forEach(function (cb) {
      cb.addEventListener('change', function () {
        cb.closest('.check-pill').classList.toggle('is-checked', cb.checked);
      });
    });

    /* ---------- Instant Price Estimator ----------
       Every figure comes from js/besia-data.js, the same file that
       prints the price list on services.html. One source, so the
       estimator can never quote a price the menu does not publish. */
    /* Rebuilt on every quote rather than once at load, so the estimate
       always matches the price list the customer can see. Uses the live
       view, and ignores anything the owner has taken off the website. */
    function servicePrices() {
      var out = {};
      if (!window.BESIA) return out;
      BESIA.serviceCategories.forEach(function (c) {
        var price;
        if (BESIA.live) {
          var on = BESIA.live.published(BESIA.live.services())
            .filter(function (s) { return s.cat === c.key && !(s.raw && s.raw.aux); })
            .map(function (s) { return s.price; })
            .filter(function (n) { return n > 0; });
          price = on.length ? Math.min.apply(null, on) : null;
        } else {
          price = BESIA.fromPrice(c.key);
        }
        if (price != null) out[c.slug] = { label: c.label, price: price, cat: c.key };
      });
      return out;
    }
    var SERVICE_PRICES = servicePrices();

    /* Exact services live in the booking cart (booking-cart.js). This
       form estimates by discipline, for customers who are not sure yet. */
    var picked = [];

    /* What has been typed survives a trip back to the menu. Session
       only: it is forgotten when the tab closes or the booking lands. */
    var MEM_KEY = 'besia-booking-form';
    var memFields = ['name', 'phone', 'event-type', 'event-date', 'time-slot', 'guests', 'notes'];
    function memRead() {
      try { return JSON.parse(sessionStorage.getItem(MEM_KEY) || '{}'); } catch (e) { return {}; }
    }
    var mem = memRead();
    memFields.forEach(function (k) {
      var el = form.querySelector('[name="' + k + '"]');
      if (el && mem[k] != null && mem[k] !== '' && !el.value) el.value = mem[k];
    });
    function memSave(e) {
      var k = e.target && e.target.name;
      if (!k || memFields.indexOf(k) === -1) return;
      var m = memRead();
      m[k] = e.target.value;
      try { sessionStorage.setItem(MEM_KEY, JSON.stringify(m)); } catch (err) {}
    }
    form.addEventListener('input', memSave);
    form.addEventListener('change', memSave);

    var pickedPanel = document.getElementById('picked-panel');
    var pickedList = document.getElementById('picked-list');
    var pickedLinks = document.getElementById('picked-links');
    var pickedAdd = document.getElementById('picked-add');
    var modeBtn = document.getElementById('picked-clear');
    var pillGrid = form.querySelector('.check-grid');
    var pickError = document.getElementById('pick-error');

    /* Two ways to choose, one visible at a time. 'exact' lists the
       services picked on the menu or the packages builder; 'category'
       is the discipline grid. Switching views never deletes the
       selection, only the crosses on the list do. */
    var mode = picked.length ? 'exact' : 'category';

    function renderServices() {
      if (!picked.length) mode = 'category';
      var exact = mode === 'exact';
      if (pickedPanel) pickedPanel.hidden = !exact;
      if (pillGrid) pillGrid.hidden = exact;
      if (pickedLinks) pickedLinks.hidden = !picked.length;
      if (pickedAdd) pickedAdd.hidden = !exact;
      if (modeBtn) modeBtn.textContent = exact
        ? 'Choose by discipline instead'
        : 'Back to your selected service' + (picked.length > 1 ? 's (' + picked.length + ')' : '');
      if (pickError) pickError.hidden = true;
      if (!exact || !pickedList) return;
      pickedList.innerHTML = '';
      picked.forEach(function (name) {
        var it = BESIA.live.find('service', name);
        if (!it) return;
        var openPrice = it.raw && it.raw.price == null;
        var li = document.createElement('li');
        li.innerHTML =
          '<span class="pk-name">' + escHtml(name) +
            (it.raw && it.raw.dur ? '<em>' + escHtml(it.raw.dur) + '</em>' : '') + '</span>' +
          '<span class="pk-price">' + (openPrice ? 'from ' : '') + fmtGHS(it.price) + '</span>' +
          '<button type="button" class="pk-x" aria-label="Remove ' + escHtml(name) + '">\u00D7</button>';
        li.querySelector('.pk-x').addEventListener('click', function () {
          picked = picked.filter(function (n) { return n !== name; });
          savePicked(picked);
          renderServices();
          buildQuote();
        });
        pickedList.appendChild(li);
      });
    }
    if (modeBtn) modeBtn.addEventListener('click', function () {
      mode = (mode === 'exact') ? 'category' : 'exact';
      renderServices();
      buildQuote();
    });
    if (pillGrid) pillGrid.addEventListener('change', function () {
      if (pickError) pickError.hidden = true;
    });
    renderServices();

    var OCCASION_MULTIPLIER = {
      'Regular Appointment': 1, 'Bridal / Wedding Party': 1.35,
      'Birthday or Event Glam': 1.1, 'Photoshoot / Content': 1.15,
      'First Visit, Consultation': 1, 'Other': 1
    };

    function buildQuote() {
      var PRICES = servicePrices();
      var panel = document.getElementById('quote-panel');
      if (!panel) return;
      var lines = panel.querySelector('.quote-lines');
      var totalEl = panel.querySelector('.quote-total .value');

      var evType = (form.querySelector('[name="event-type"]') || {}).value || 'Other';
      var people = parseInt((form.querySelector('[name="guests"]') || {}).value, 10) || 1;
      people = Math.max(1, Math.min(people, 20));
      var mult = OCCASION_MULTIPLIER[evType] || 1;

      lines.innerHTML = '';
      var total = 0;
      var count = 0;

      if (mode === 'exact' && picked.length) {
        /* Exact services: each line is the published price itself, so
           the occasion multiplier does not apply. The price is the price. */
        picked.forEach(function (name) {
          var it = BESIA.live && BESIA.live.find('service', name);
          if (!it) return;
          var openPrice = it.raw && it.raw.price == null;
          var price = it.price * people;
          total += price;
          count++;
          var li = document.createElement('li');
          li.innerHTML = '<span>' + escHtml(name) + (people > 1 ? ' \u00D7 ' + people : '') +
                         '</span><span>' + (openPrice ? 'from ' : '') + fmtGHS(price) + '</span>';
          lines.appendChild(li);
        });
      } else {
        var checked = Array.prototype.slice.call(form.querySelectorAll('.check-pill input:checked'));
        if (!checked.length) {
          /* Nothing chosen: say so instead of guessing on her behalf. */
          var liNone = document.createElement('li');
          liNone.innerHTML = '<span>Nothing chosen yet</span><span>' + fmtGHS(0) + '</span>';
          lines.appendChild(liNone);
        }
        checked.forEach(function (cb) {
          var svc = PRICES[cb.value];
          if (!svc) return;
          var price = svc.price * mult * people;
          total += price;
          count++;
          var li = document.createElement('li');
          li.innerHTML = '<span>' + svc.label + (people > 1 ? ' \u00D7 ' + people : '') +
                         '</span><span>' + fmtGHS(price) + '</span>';
          lines.appendChild(li);
        });
      }
      // Booking two or more services in one visit earns a bundle discount.
      if (count >= 2) {
        var bundle = total * (count >= 4 ? 0.12 : 0.07);
        total -= bundle;
        var liB = document.createElement('li');
        liB.innerHTML = '<span>Bundle saving (' + count + ' services)</span><span>\u2212 ' + fmtGHS(bundle) + '</span>';
        lines.appendChild(liB);
      }

      // Animate the total counting up (with a hard fallback so the
      // exact figure always lands even if rAF is throttled)
      var start = null, from = 0, dur = 1100;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        totalEl.textContent = fmtGHS(from + (total - from) * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      window.setTimeout(function () { totalEl.textContent = fmtGHS(total); }, dur + 150);

      // Review summary
      var review = document.getElementById('review-summary');
      if (review) {
        var name = (form.querySelector('[name="name"]') || {}).value || 'Not given';
        var date = (form.querySelector('[name="event-date"]') || {}).value || 'Not given';
        var slot = (form.querySelector('[name="venue"]') || {}).value || 'Any time';
        review.innerHTML =
          (picked.length ? '<li><span>Services</span><span>' + escHtml(picked.join(', ')) + '</span></li>' : '') +
          '<li><span>Name</span><span>' + name.replace(/</g, '&lt;') + '</span></li>' +
          '<li><span>Occasion</span><span>' + evType + '</span></li>' +
          '<li><span>Date</span><span>' + date + '</span></li>' +
          '<li><span>Preferred time</span><span>' + slot.replace(/</g, '&lt;') + '</span></li>' +
          '<li><span>People</span><span>' + people + '</span></li>';
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(current)) return;
      // Demo: show success state
      form.querySelector('.form-steps-wrap').style.display = 'none';
      var progress = form.querySelector('.progress-steps');
      if (progress) progress.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var evType = (form.querySelector('[name="event-type"]') || {}).value || '';
      var date = (form.querySelector('[name="event-date"]') || {}).value || '';
      var phone = (form.querySelector('[name="phone"]') || {}).value || '';
      var notes = (form.querySelector('[name="notes"]') || {}).value || '';

      // Save the request so it shows up automatically in the salon admin.
      // Frontend-only bridge via localStorage (same origin as the admin).
      var bookingId = 'APT-' + Date.now().toString().slice(-6);
      var refEl = document.getElementById('booking-ref');
      if (refEl) refEl.textContent = bookingId;
      try {
        var KEY = 'besia-web-bookings';
        var list = JSON.parse(localStorage.getItem(KEY) || '[]');

        /* Carry the services she actually ticked, and what we quoted her,
           so the manager opens a booking that is ready to confirm rather
           than one that has to be phoned about. */
        var svcNames = (mode === 'exact' && picked.length) ? picked.slice() : Array.prototype.slice
          .call(form.querySelectorAll('.check-pill input:checked'))
          .map(function (cb) { return (servicePrices()[cb.value] || {}).label; })
          .filter(Boolean);
        var quoted = 0;
        try {
          var t = (document.querySelector('.quote-total .value') || {}).textContent || '';
          quoted = Number(String(t).replace(/[^0-9]/g, '')) || 0;
        } catch (err) {}

        var slotVal = (form.querySelector('[name="time-slot"]') || {}).value || '';
        var people = (form.querySelector('[name="guests"]') || {}).value || '1';

        list.push({
          id: bookingId,
          name: name, phone: phone,
          service: svcNames.length ? svcNames.join(', ') : (evType || 'Appointment'),
          occasion: evType || '',
          slot: slotVal, people: people,
          amount: quoted,
          date: date, notes: notes, status: 'Pending', ts: Date.now()
        });
        localStorage.setItem(KEY, JSON.stringify(list));
        try { sessionStorage.removeItem(MEM_KEY); } catch (err) {}
      } catch (err) {}

      // The booking is already saved above, WhatsApp is only for a follow-up
      // question, so the message quotes the reference rather than re-booking.
      var wa = document.getElementById('success-wa');
      if (wa) {
        wa.href = 'https://wa.me/233240787993?text=' + encodeURIComponent(
          'Hello Bēsia Beauty Studio! I have a question about my booking ' + bookingId + '.');
      }
    });


    /* Came back from the menu with services chosen and the details
       already given? Straight to the services step, not page one. */
    var landing = 0;
    if (picked.length && (mem['name'] || '').trim() && (mem['phone'] || '').trim() && (mem['event-date'] || '').trim()) {
      for (var si = 0; si < steps.length; si++) {
        if (steps[si].querySelector('.check-grid')) { landing = si; break; }
      }
    }
    showStep(landing);
  }

  /* ============================================================
     PACKAGE BUILDER (packages.html)
     ============================================================ */
  var builder = document.getElementById('package-builder');
  if (builder) {
    var opts = builder.querySelectorAll('.builder-opt');
    var linesEl = document.getElementById('builder-lines');
    var totalEl = document.getElementById('builder-total');
    var goBtn = document.getElementById('builder-go');
    if (goBtn) goBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!window.BesiaBooking) return;
      BesiaBooking.addMany(builder._chosen || []);
      BesiaBooking.open();
    });
    var displayed = 0;

    function refresh() {
      var total = 0;
      var chosen = [];
      opts.forEach(function (opt) {
        var input = opt.querySelector('input');
        opt.classList.toggle('is-checked', input.checked);
        if (input.checked) {
          var price = parseInt(opt.getAttribute('data-price'), 10);
          total += price;
          chosen.push({ name: opt.getAttribute('data-name'), price: price });
        }
      });

      if (!chosen.length) {
        linesEl.innerHTML = '<li class="empty">Select services to build your appointment…</li>';
      } else {
        linesEl.innerHTML = chosen.map(function (c) {
          return '<li><span>' + c.name + '</span><span>' + fmtGHS(c.price) + '</span></li>';
        }).join('');
      }

      // Smooth count to new total (hard fallback lands the exact figure)
      var from = displayed, to = total, start = null, dur = 600;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        displayed = from + (to - from) * eased;
        totalEl.textContent = fmtGHS(displayed);
        if (p < 1) requestAnimationFrame(tick);
        else displayed = to;
      }
      requestAnimationFrame(tick);
      window.setTimeout(function () { displayed = to; totalEl.textContent = fmtGHS(to); }, dur + 150);

      builder._chosen = chosen.map(function (c) { return c.name; });
      if (goBtn) goBtn.textContent = chosen.length ? 'Add to my booking · ' + fmtGHS(to) : 'Add to my booking';
    }

    // The options are <label> elements, so the browser toggles the
    // checkbox natively, we only need to react to the change.
    opts.forEach(function (opt) {
      opt.querySelector('input').addEventListener('change', refresh);
    });
    refresh();
  }

})();
