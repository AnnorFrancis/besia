/* ============================================================
   BĒSIA — classes.js
   The enrolment form on classes.html.

   Shows what the student will pay now, gives them a reference,
   and drops the enrolment into the same list the Studio Manager
   reads on its Classes page — the identical handoff the shop
   uses between checkout and Shop Orders.
   ============================================================ */
(function () {
  'use strict';

  var B = window.BESIA;
  var form = document.getElementById('enrol-form');
  if (!B || !form) return;

  var courseSel = document.getElementById('en-course');
  var totalBox = document.getElementById('en-total');

  function chosen() {
    var id = courseSel.value;
    for (var i = 0; i < B.courses.length; i++) if (B.courses[i].id === id) return B.courses[i];
    return B.courses[0];
  }
  function plan() {
    var r = form.querySelector('input[name="plan"]:checked');
    return r ? r.value : 'full';
  }

  function renderTotal() {
    var c = chosen();
    var pct = B.coursePayment.depositPercent;
    var now = plan() === 'full' ? c.fee : Math.round(c.fee * pct / 100);
    var later = c.fee - now;
    totalBox.innerHTML =
      '<div><strong>' + c.name + '</strong> · ' + c.days + ' day' + (c.days === 1 ? '' : 's') + ' · ' + c.level + '</div>' +
      '<div style="margin-top:.5rem;">Course fee <strong>' + B.money(c.fee) + '</strong></div>' +
      '<div>Paying now <strong>' + B.money(now) + '</strong>' +
        (later > 0 ? ' · balance of <strong>' + B.money(later) + '</strong> before the last day' : '') +
      '</div>';
  }

  /* "Reserve a seat" on a card preselects that course */
  document.querySelectorAll('[data-course]').forEach(function (a) {
    a.addEventListener('click', function () {
      courseSel.value = a.getAttribute('data-course');
      renderTotal();
    });
  });

  courseSel.addEventListener('change', renderTotal);
  form.querySelectorAll('input[name="plan"]').forEach(function (r) {
    r.addEventListener('change', function () {
      form.querySelectorAll('.check-pill').forEach(function (p) {
        p.classList.toggle('is-checked', p.contains(r) && r.checked);
      });
      renderTotal();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (document.getElementById('en-name').value || '').trim();
    var phone = (document.getElementById('en-phone').value || '').trim();
    if (!name || !phone) {
      alert('Please add your name and a phone number so we can confirm your seat.');
      return;
    }

    var c = chosen();
    var pct = B.coursePayment.depositPercent;
    var payingNow = plan() === 'full' ? c.fee : Math.round(c.fee * pct / 100);
    var ref = 'CLS-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') +
              '-' + String(100 + Math.floor(Math.random() * 900));

    /* Straight into the list the Studio Manager reads. */
    try {
      var key = B.key('students');
      var list = JSON.parse(localStorage.getItem(key)) || [];
      list.unshift({
        id: ref,
        name: name,
        phone: phone,
        email: (document.getElementById('en-email').value || '').trim(),
        course: c.id,
        starts: Date.now() + 7 * 86400000,
        fee: c.fee,
        paid: 0,
        note: (document.getElementById('en-note').value || '').trim() ||
              (plan() === 'full' ? 'Wants to pay in full.' : 'Wants to pay half to reserve.')
      });
      localStorage.setItem(key, JSON.stringify(list));

      var act = B.key('activity');
      var log = JSON.parse(localStorage.getItem(act)) || [];
      log.unshift({ at: Date.now(), what: 'New student enquiry',
                    detail: name + ' · ' + c.name + ' · ' + ref, who: 'Website' });
      localStorage.setItem(act, JSON.stringify(log.slice(0, 200)));
    } catch (err) {}

    form.innerHTML =
      '<div class="enrol-done">' +
        '<div class="enrol-tick" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">' +
          '<path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<h3>Seat requested — thank you, ' + name.split(' ')[0].replace(/[<>]/g, '') + '</h3>' +
        '<p>Your reference is <strong>' + ref + '</strong>. Keep it for when we call.</p>' +
        '<p>You chose <strong>' + c.name + '</strong>, paying <strong>' + B.money(payingNow) + '</strong> now' +
          (c.fee - payingNow > 0 ? ' and <strong>' + B.money(c.fee - payingNow) + '</strong> before the last day' : '') +
          '. We will confirm your place on WhatsApp and send the payment details.</p>' +
        '<div class="btn-row" style="margin-top:1.4rem;">' +
          '<a class="btn btn--gold" href="' + B.business.whatsappLink +
            '?text=' + encodeURIComponent('Hello Bēsia, I have just reserved a seat. My reference is ' + ref + '.') +
            '" target="_blank" rel="noopener">Message us on WhatsApp</a>' +
          '<a class="btn btn--ghost-dark" href="./services.html">See the full menu</a>' +
        '</div>' +
      '</div>';
    form.scrollIntoView({ block: 'center' });
  });

  renderTotal();
})();
