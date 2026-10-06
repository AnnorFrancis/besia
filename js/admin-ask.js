/* ============================================================
   BĒSIA STUDIO MANAGER, admin-ask.js
   A small, styled dialog for the two things the manager asks
   the operator to type: an amount, and a confirmation.

   It replaces the browser's own prompt() and confirm() boxes,
   which look like an error message, cannot be styled, and are
   suppressed outright by some mobile browsers, which would
   have meant a button that silently did nothing.

   Exposes:
     BesiaAsk.amount({ title, message, value, max, unit })  -> Promise<number|null>
     BesiaAsk.confirm({ title, message, confirmLabel, tone }) -> Promise<boolean>
   ============================================================ */
(function (root) {
  'use strict';

  var open = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function build(html) {
    var wrap = document.createElement('div');
    wrap.className = 'ask-backdrop';
    wrap.innerHTML = '<div class="ask" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('is-in'); });
    return wrap;
  }

  function close(wrap, resolve, value) {
    if (!wrap || wrap.__closing) return;
    wrap.__closing = true;
    wrap.classList.remove('is-in');
    setTimeout(function () { wrap.remove(); }, 200);
    document.removeEventListener('keydown', wrap.__key);
    open = null;
    resolve(value);
  }

  function wire(wrap, resolve, cancelValue, onOk) {
    wrap.__key = function (e) {
      if (e.key === 'Escape') close(wrap, resolve, cancelValue);
      if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName !== 'BUTTON') onOk();
    };
    document.addEventListener('keydown', wrap.__key);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) close(wrap, resolve, cancelValue);
    });
    wrap.querySelector('[data-ask-cancel]').addEventListener('click', function () {
      close(wrap, resolve, cancelValue);
    });
    wrap.querySelector('[data-ask-ok]').addEventListener('click', onOk);
    open = wrap;
  }

  function amount(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (open) return resolve(null);
      var unit = opts.unit || 'GHS';
      var wrap = build(
        '<h2 class="ask-title">' + esc(opts.title || 'Enter an amount') + '</h2>' +
        (opts.message ? '<p class="ask-msg">' + opts.message + '</p>' : '') +
        '<div class="ask-field">' +
          '<span class="ask-unit">' + esc(unit) + '</span>' +
          '<input class="ask-input" type="number" inputmode="decimal" min="0" step="10" ' +
            'value="' + esc(opts.value == null ? '' : opts.value) + '" aria-label="Amount">' +
        '</div>' +
        '<p class="ask-error" hidden></p>' +
        '<div class="ask-actions">' +
          '<button class="a-btn" type="button" data-ask-cancel>Cancel</button>' +
          '<button class="a-btn a-btn--gold" type="button" data-ask-ok>' +
            esc(opts.confirmLabel || 'Save') + '</button>' +
        '</div>');

      var input = wrap.querySelector('.ask-input');
      var err = wrap.querySelector('.ask-error');

      function ok() {
        var n = Number(input.value);
        if (!isFinite(n) || n <= 0) {
          err.textContent = 'Type an amount greater than zero.';
          err.hidden = false; input.focus(); input.select();
          return;
        }
        if (opts.max != null && n > opts.max) {
          err.textContent = 'That is more than the ' + unit + ' ' +
            Number(opts.max).toLocaleString('en-GB') + ' outstanding.';
          err.hidden = false; input.focus(); input.select();
          return;
        }
        close(wrap, resolve, Math.round(n));
      }

      wire(wrap, resolve, null, ok);
      setTimeout(function () { input.focus(); input.select(); }, 60);
    });
  }

  function confirm(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (open) return resolve(false);
      var wrap = build(
        '<h2 class="ask-title">' + esc(opts.title || 'Are you sure?') + '</h2>' +
        (opts.message ? '<p class="ask-msg">' + opts.message + '</p>' : '') +
        '<div class="ask-actions">' +
          '<button class="a-btn" type="button" data-ask-cancel>' +
            esc(opts.cancelLabel || 'No, go back') + '</button>' +
          '<button class="a-btn ' + (opts.tone === 'danger' ? 'a-btn--soft-red' : 'a-btn--gold') +
            '" type="button" data-ask-ok>' + esc(opts.confirmLabel || 'Yes') + '</button>' +
        '</div>');
      wire(wrap, resolve, false, function () { close(wrap, resolve, true); });
      setTimeout(function () { wrap.querySelector('[data-ask-ok]').focus(); }, 60);
    });
  }

  /* A price for each length of a product sold by length. Blank means
     "price to follow" on the website. Resolves to { '16"': 1200, ... }
     or null if cancelled. */
  function lengths(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (open) return resolve(null);
      var vals = opts.values || {};
      var wrap = build(
        '<h2 class="ask-title">' + esc(opts.title || 'Prices by length') + '</h2>' +
        (opts.message ? '<p class="ask-msg">' + opts.message + '</p>' : '') +
        '<div class="ask-lengths">' + (opts.lengths || []).map(function (len) {
          return '<label class="ask-len"><span>' + esc(len) + '</span>' +
            '<span class="ask-field"><span class="ask-unit">GHS</span>' +
            '<input class="ask-input" type="number" inputmode="decimal" min="0" step="10" data-len="' + esc(len) + '" value="' + esc(vals[len] == null ? '' : vals[len]) + '" aria-label="Price for ' + esc(len) + '"></span></label>';
        }).join('') + '</div>' +
        '<p class="ask-error" hidden></p>' +
        '<div class="ask-actions">' +
          '<button class="a-btn" type="button" data-ask-cancel>Cancel</button>' +
          '<button class="a-btn a-btn--gold" type="button" data-ask-ok>' + esc(opts.confirmLabel || 'Save prices') + '</button>' +
        '</div>');
      var err = wrap.querySelector('.ask-error');
      function ok() {
        var out = {}, bad = null;
        wrap.querySelectorAll('[data-len]').forEach(function (inp) {
          if (inp.value === '') return;
          var n = Number(inp.value);
          if (!isFinite(n) || n <= 0) bad = bad || inp; else out[inp.getAttribute('data-len')] = Math.round(n);
        });
        if (bad) { err.textContent = 'Leave a length blank, or type a price above zero.'; err.hidden = false; bad.focus(); return; }
        close(wrap, resolve, out);
      }
      wire(wrap, resolve, null, ok);
      setTimeout(function () { var f = wrap.querySelector('[data-len]'); if (f) f.focus(); }, 60);
    });
  }

  root.BesiaAsk = { amount: amount, confirm: confirm, lengths: lengths };

})(typeof window !== 'undefined' ? window : globalThis);
