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
            .filter(function (s) { return s.cat === c.key; })
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

      var checked = Array.prototype.slice.call(form.querySelectorAll('.check-pill input:checked'));
      if (!checked.length) checked = [{ value: 'braids' }];

      lines.innerHTML = '';
      var total = 0;
      checked.forEach(function (cb) {
        var svc = PRICES[cb.value];
        if (!svc) return;
        var price = svc.price * mult * people;
        total += price;
        var li = document.createElement('li');
        li.innerHTML = '<span>' + svc.label + (people > 1 ? ' \u00D7 ' + people : '') +
                       '</span><span>' + fmtGHS(price) + '</span>';
        lines.appendChild(li);
      });
      // Booking two or more services in one visit earns a bundle discount.
      if (checked.length >= 2) {
        var bundle = total * (checked.length >= 4 ? 0.12 : 0.07);
        total -= bundle;
        var liB = document.createElement('li');
        liB.innerHTML = '<span>Bundle saving (' + checked.length + ' services)</span><span>\u2212 ' + fmtGHS(bundle) + '</span>';
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
        var picked = Array.prototype.slice
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
          service: picked.length ? picked.join(', ') : (evType || 'Appointment'),
          occasion: evType || '',
          slot: slotVal, people: people,
          amount: quoted,
          date: date, notes: notes, status: 'Pending', ts: Date.now()
        });
        localStorage.setItem(KEY, JSON.stringify(list));
      } catch (err) {}

      // The booking is already saved above, WhatsApp is only for a follow-up
      // question, so the message quotes the reference rather than re-booking.
      var wa = document.getElementById('success-wa');
      if (wa) {
        wa.href = 'https://wa.me/233240787993?text=' + encodeURIComponent(
          'Hello Bēsia Beauty Studio! I have a question about my booking ' + bookingId + '.');
      }
    });

    // Selection carried over from the packages page builder
    try {
      var carried = JSON.parse(localStorage.getItem('besia-builder') || '[]');
      if (carried.length) {
        var MAP = { 'Knotless braids': 'braids', 'Frontal install': 'frontal', 'Hair coloring': 'colour', 'Nail extensions, full set': 'nails', 'Manicure & pedicure': 'manipedi', 'Mink lash set': 'lashes', 'Ombré brows': 'brows', 'Make-up': 'makeup', 'Deep-cleansing facial': 'facial', 'Piercing': 'piercing', 'Wig revamp': 'revamp', 'Ready-made wig unit': 'frontal', 'Spa pedicure': 'pedicure', 'Full body massage': 'massage', 'Hair treatment': 'treatment', 'Retwist & maintenance': 'locs', 'Waxing session': 'waxing' };
        form.querySelectorAll('.check-pill input').forEach(function (cb) { cb.checked = false; cb.closest('.check-pill').classList.remove('is-checked'); });
        carried.forEach(function (name) {
          var key = MAP[name];
          var cb = key && form.querySelector('.check-pill input[value="' + key + '"]');
          if (cb) { cb.checked = true; cb.closest('.check-pill').classList.add('is-checked'); }
        });
        localStorage.removeItem('besia-builder');
      }
    } catch (e) {}

    showStep(0);
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

      try { localStorage.setItem('besia-builder', JSON.stringify(chosen.map(function (c) { return c.name; }))); } catch (e) {}
      if (goBtn) goBtn.textContent = chosen.length ? 'Request This Appointment · ' + fmtGHS(to) : 'Request This Appointment';
    }

    // The options are <label> elements, so the browser toggles the
    // checkbox natively, we only need to react to the change.
    opts.forEach(function (opt) {
      opt.querySelector('input').addEventListener('change', refresh);
    });
    refresh();
  }

})();
