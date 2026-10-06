/* ============================================================
   BĒSIA, classes.js
   The enrolment form on classes.html.

   Shows what the student will pay now, takes the payment on the page
   (Mobile Money or card, a labelled simulation like the shop and the
   booking: no money moves, no card number is asked for), gives a
   reference, and drops the enrolment into the same list the Studio
   Manager reads on its Classes page.

   Two cases are planned with the student before anything is paid:
   one to one (Dana, 6 Oct: for those who would rather not learn in a
   group), and Fusion with two or four methods, which is quoted as a
   bundle. Those enrolments land in the manager with nothing paid and
   a note to call.
   ============================================================ */
(function () {
  'use strict';

  var B = window.BESIA;
  var form = document.getElementById('enrol-form');
  if (!B || !form) return;

  var courseSel = document.getElementById('en-course');
  var totalBox = document.getElementById('en-total');
  var methodsBox = document.getElementById('en-methods');
  var planBox = document.getElementById('en-plan');
  var payBox = document.getElementById('en-pay');
  var errBox = document.getElementById('en-error');
  var goBtn = document.getElementById('en-go');
  var NETWORKS = ['MTN MoMo', 'Telecel Cash', 'AT Money'];

  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function chosen() {
    var id = courseSel.value;
    for (var i = 0; i < B.courses.length; i++) if (B.courses[i].id === id) return B.courses[i];
    return B.courses[0];
  }
  function val(name) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
  function methods() {
    return Array.prototype.map.call(form.querySelectorAll('input[name="methods"]:checked'), function (b) { return b.value; });
  }
  function oneToOne() { return val('format') === 'One to one'; }
  function bundle() { var c = chosen(); return !!c.methods && methods().length > 1; }
  function planned() { return oneToOne() || bundle(); }   /* agreed with her before anything is paid */
  function payingNow() {
    var c = chosen();
    return val('plan') === 'half' ? Math.round(c.fee * B.coursePayment.depositPercent / 100) : c.fee;
  }

  function renderPay() {
    if (planned()) { payBox.innerHTML = ''; return; }
    var method = val('paymethod') || 'momo';
    payBox.innerHTML =
      '<div class="field-group">' +
        '<span class="t-label field-legend">Pay with</span>' +
        '<div class="check-grid">' +
          '<label class="check-pill"><input type="radio" name="paymethod" value="momo"' + (method === 'momo' ? ' checked' : '') + '><span class="dot">✓</span>Mobile Money</label>' +
          '<label class="check-pill"><input type="radio" name="paymethod" value="card"' + (method === 'card' ? ' checked' : '') + '><span class="dot">✓</span>Card</label>' +
        '</div>' +
      '</div>' +
      (method === 'momo'
        ? '<div class="row-2"><div class="field"><label for="en-network" class="is-fixed">Network</label><select id="en-network">' +
            NETWORKS.map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="en-momo">MoMo number</label><input type="tel" id="en-momo" inputmode="tel" autocomplete="tel"></div></div>'
        : '<p class="t-cap">You finish on our bank partner’s secure payment page. Bēsia never sees your card number.</p>') +
      '<p class="t-cap enrol-demo">Demo payment, no real money moves. The live site takes Mobile Money and card through Paystack.</p>';
  }

  function renderTotal() {
    var c = chosen();
    methodsBox.hidden = !c.methods;
    planBox.hidden = planned();
    var head = '<div><strong>' + esc(c.name) + '</strong> · ' + esc(oneToOne() ? 'one to one' : c.days + ' day' + (c.days === 1 ? '' : 's')) + ' · ' + esc(c.level) + '</div>';
    if (c.methods) head += '<div>' + (methods().length ? esc(methods().join(', ')) : 'Choose at least one method') + '</div>';
    if (planned()) {
      totalBox.innerHTML = head +
        '<div style="margin-top:.5rem;">' + (oneToOne() ? 'One to one is planned with you: we call to agree your dates and fee.' : 'Two or more methods are quoted as a bundle: we call you with your fee.') +
        ' <strong>Nothing to pay now.</strong></div>';
      goBtn.textContent = oneToOne() ? 'Request one to one' : 'Request my bundle';
    } else {
      var now = payingNow(), later = c.fee - now;
      totalBox.innerHTML = head +
        '<div style="margin-top:.5rem;">Course fee <strong>' + B.money(c.fee) + '</strong>' + (c.unit ? ' ' + esc(c.unit) : '') + '</div>' +
        '<div>Paying now <strong>' + B.money(now) + '</strong>' +
          (later > 0 ? ' · balance of <strong>' + B.money(later) + '</strong> before the last day' : '') +
        '</div>';
      goBtn.textContent = 'Pay ' + B.money(now) + ' and reserve';
    }
    renderPay();
  }

  /* links on the page preselect a course, a number of Fusion methods, or one to one */
  document.querySelectorAll('[data-course], [data-format]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.hasAttribute('data-course')) courseSel.value = a.getAttribute('data-course');
      var n = parseInt(a.getAttribute('data-methods'), 10);
      if (n) form.querySelectorAll('input[name="methods"]').forEach(function (b, i) { b.checked = i < n; });
      var f = a.getAttribute('data-format');
      if (f) form.querySelectorAll('input[name="format"]').forEach(function (r) { r.checked = r.value === f; });
      renderTotal();
    });
  });

  courseSel.addEventListener('change', renderTotal);
  form.addEventListener('change', function (e) {
    errBox.hidden = true;
    if (['plan', 'format', 'methods', 'paymethod'].indexOf(e.target.name) !== -1) renderTotal();
  });

  function fail(msg, el) { errBox.textContent = msg; errBox.hidden = false; if (el) el.focus(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameEl = document.getElementById('en-name'), phoneEl = document.getElementById('en-phone');
    var name = (nameEl.value || '').trim();
    var phone = (phoneEl.value || '').trim();
    if (name.length < 2) return fail('Please add your name.', nameEl);
    if (!/^[\d\s+()-]{9,}$/.test(phone)) return fail('Please add a phone number we can reach you on.', phoneEl);
    var c = chosen();
    if (c.methods && !methods().length) return fail('Please choose at least one method.');

    var plannedFirst = planned();
    var amount = plannedFirst ? 0 : payingNow();
    var method = val('paymethod') || 'momo';
    var momoEl = document.getElementById('en-momo');
    if (!plannedFirst && method === 'momo' && !/^[\d\s+()-]{9,}$/.test((momoEl && momoEl.value || '').trim())) return fail('Enter the MoMo number to send the prompt to.', momoEl);
    var network = method === 'momo' ? document.getElementById('en-network').value : 'Card';

    var ref = 'CLS-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') +
              '-' + String(100 + Math.floor(Math.random() * 900));

    function record() {
      var bits = [];
      if (c.methods) bits.push('Methods: ' + methods().join(', ') + '.');
      bits.push(oneToOne() ? 'One to one: call to agree dates and fee.' : (bundle() ? 'Fusion bundle: call with the bundle fee.' : 'In a small group.'));
      if (amount) bits.push('Paid ' + B.money(amount) + ' online by ' + network + '.');
      var note = (document.getElementById('en-note').value || '').trim();
      if (note) bits.push(note);
      try {
        var key = B.key('students');
        var list = JSON.parse(localStorage.getItem(key)) || [];
        list.unshift({
          id: ref, name: name, phone: phone,
          email: (document.getElementById('en-email').value || '').trim(),
          course: c.id,
          starts: Date.now() + 7 * 86400000,
          fee: plannedFirst ? c.fee * Math.max(1, c.methods ? methods().length : 1) : c.fee,
          paid: amount,
          note: bits.join(' ')
        });
        localStorage.setItem(key, JSON.stringify(list));

        var act = B.key('activity');
        var log = JSON.parse(localStorage.getItem(act)) || [];
        log.unshift({ at: Date.now(), what: amount ? 'New student, paid online' : 'New student enquiry',
                      detail: name + ' · ' + c.name + ' · ' + ref, who: 'Website' });
        localStorage.setItem(act, JSON.stringify(log.slice(0, 200)));
      } catch (err) {}

      form.innerHTML =
        '<div class="enrol-done">' +
          '<div class="enrol-tick" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">' +
            '<path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</div>' +
          '<h3>' + (amount ? 'Your seat is reserved' : 'Request received') + '. Thank you, ' + esc(name.split(' ')[0]) + '.</h3>' +
          '<p>Your reference is <strong>' + ref + '</strong>. Keep it for when we call.</p>' +
          (amount
            ? '<p>You paid <strong>' + B.money(amount) + '</strong> for <strong>' + esc(c.name) + '</strong>' +
                (c.fee - amount > 0 ? ', with <strong>' + B.money(c.fee - amount) + '</strong> due before the last day' : '') +
                '. We call you to confirm your dates.</p>'
            : '<p>We call you to plan your <strong>' + esc(c.name) + '</strong>' + (oneToOne() ? ', one to one,' : '') + ' and agree the fee before anything is paid.</p>') +
          '<div class="btn-row" style="margin-top:1.4rem;">' +
            '<a class="btn btn--ghost-dark" href="#certifications">Back to the certifications</a>' +
          '</div>' +
        '</div>';
      form.scrollIntoView({ block: 'center' });
    }

    if (!amount) return record();
    goBtn.disabled = true;
    goBtn.textContent = method === 'momo' ? 'Sending a prompt to ' + momoEl.value.trim() + '…' : 'Opening the secure payment page…';
    setTimeout(function () { goBtn.textContent = 'Payment received'; }, method === 'momo' ? 2200 : 1500);
    setTimeout(record, method === 'momo' ? 3000 : 2200);
  });

  renderTotal();
})();
