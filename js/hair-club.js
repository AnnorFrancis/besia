/* ============================================================
   BĒSIA, hair-club.js
   The Hair Wellness form on the Hair Club page (packages.html).

   Her own consultation form, online. On send:
     1. the answers ride with the booking (BesiaBooking.attach), so they
        land in the Studio Manager beside the appointment, filled once;
     2. The Hair Club Blueprint goes into the booking;
     3. the booking sheet opens on "Your details" with her name and
        number already in, then she chooses her day and pays.
   Nothing goes through WhatsApp. "Join with your Blueprint" ticks the
   membership box on the way down to the form.

   In this demo the answers stay on this device, like every booking.
   In production they are stored encrypted and seen only by the studio.
   ============================================================ */
(function () {
  'use strict';
  var form = document.getElementById('hw-form');
  if (!form) return;
  var err = form.querySelector('.hw-error');

  /* "Join with your Blueprint" ticks the membership on the way to the form */
  document.querySelectorAll('[data-join]').forEach(function (a) {
    a.addEventListener('click', function () {
      var box = form.querySelector('[name="Membership"]');
      if (box) box.checked = true;
    });
  });

  function answers() {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      var v = String(el.value || '').trim();
      if (!v) return;
      if (el.type === 'checkbox') { out[el.name] = (out[el.name] || []).concat(v); return; }
      out[el.name] = v;
    });
    return out;
  }

  function fail(msg, el) {
    err.textContent = msg;
    err.hidden = false;
    if (el) {
      var box = el.closest('details');
      if (box) box.open = true;
      el.focus();
    }
  }

  form.addEventListener('input', function () { err.hidden = true; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.querySelector('#hw-name'), phone = form.querySelector('#hw-phone');
    var consent = form.querySelector('[name="Consent"]');
    if (name.value.trim().length < 2) return fail('Please tell us your full name.', name);
    if (!/^[\d\s+()-]{9,}$/.test(phone.value.trim())) return fail('Please give a phone number we can reach you on.', phone);
    if (!consent.checked) return fail('Please read and tick the consent before we go on.', consent);
    if (!window.BesiaBooking) return fail('The booking has not loaded yet. Please try again in a moment.');

    var data = answers();
    BesiaBooking.attach('Hair Wellness consultation form', data);

    /* her name and number carry into the booking, so she types them once */
    try {
      var m = JSON.parse(sessionStorage.getItem('besia-booking-form') || '{}');
      m.name = name.value.trim();
      m.phone = phone.value.trim();
      if (data.Membership) m.notes = (m.notes ? m.notes + '\n' : '') + 'I would like to start the Hair Club membership, GHS 200 a month.';
      sessionStorage.setItem('besia-booking-form', JSON.stringify(m));
    } catch (x) {}

    BesiaBooking.add('The Hair Club Blueprint');
    BesiaBooking.open({ view: 'details' });
  });
})();
