/* ============================================================
   BĒSIA STUDIO MANAGER, admin-catalogue.js
   The two pages that control what the website shows:

     Items     , prices, new arrivals, publish / unpublish, add
     Discounts , make an offer, switch it on and off

   Everything here writes through BESIA.live, so a change made on
   this screen reaches the website immediately.
   ============================================================ */
(function () {
  'use strict';

  var B = window.BESIA;
  if (!B || !B.live) return;

  var page = document.body.getAttribute('data-page');
  if (page !== 'prices' && page !== 'discounts') return;

  var L = B.live, money = B.money;
  var el = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  function on(node, evt, sel, fn) {
    if (!node) return;
    node.addEventListener(evt, function (e) {
      var t = e.target.closest(sel);
      if (t && node.contains(t)) fn(e, t);
    });
  }
  function toast(msg) {
    if (window.BesiaAdmin && window.BesiaAdmin.toast) return window.BesiaAdmin.toast(msg);
    var t = document.createElement('div');
    t.className = 'a-toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(function () { t.remove(); }, 2800);
  }
  function log(what, detail) {
    if (window.BesiaAdmin && window.BesiaAdmin.logActivity) window.BesiaAdmin.logActivity(what, detail);
  }
  function stat(label, value, sub) {
    return '<div class="stat-card"><div class="stat-card-label">' + esc(label) +
      '</div><div class="stat-card-value">' + esc(value) +
      '</div><div class="stat-card-delta">' + esc(sub) + '</div></div>';
  }
  function emptyRow(cols, msg) {
    return '<tr class="empty-row"><td colspan="' + cols + '">' + esc(msg) + '</td></tr>';
  }
  function catLabel(kind, key) {
    var list = kind === 'product' ? B.productCategories : B.serviceCategories;
    for (var i = 0; i < list.length; i++) {
      if ((list[i].key || '') === key) return list[i].label;
    }
    return key;
  }

  /* =========================================================
     ITEMS
     ========================================================= */
  function initItems() {
    var kind = 'service', show = 'all';

    function rows() {
      var list = kind === 'product' ? L.products() : L.services();
      var q = (el('items-search').value || '').toLowerCase();
      return list.filter(function (i) {
        if (q && i.name.toLowerCase().indexOf(q) === -1) return false;
        if (show === 'live') return i.published;
        if (show === 'hidden') return !i.published;
        if (show === 'new') return i.isNew;
        return true;
      });
    }

    function render() {
      var s = L.summary();
      el('items-stats').innerHTML =
        stat('On the website', (s.servicesTotal - s.servicesHidden) + ' services · ' +
             (s.productsTotal - s.productsHidden) + ' products',
             (s.servicesHidden + s.productsHidden) + ' hidden right now') +
        stat('New arrivals', String(s.newArrivals), 'Marked with a badge on the website') +
        stat('Offers running', String(s.discountsRunning), s.soldOut + ' products sold out');

      var list = rows();
      el('items-body').innerHTML = list.length ? list.map(function (i) {
        var changed = i.basePrice !== (i.was != null ? i.was : i.price);
        var priceCell = i.was
          ? '<span class="live-was-a">' + money(i.was) + '</span> <strong>' + money(i.price) + '</strong>'
          : '<strong>' + money(i.price) + '</strong>';
        return '<tr' + (i.published ? '' : ' class="is-hidden-row"') + '>' +
          '<td><strong>' + esc(i.name) + '</strong>' +
            (i.added ? ' <span class="badge badge--available">Added by you</span>' : '') +
            (changed ? '<br><span class="mini-info">was ' + money(i.basePrice) + '</span>' : '') +
          '</td>' +
          '<td>' + esc(catLabel(i.kind, i.cat)) + '</td>' +
          '<td class="num">' + priceCell +
            ' <button class="a-btn a-btn--ghost a-btn--sm" type="button" data-editprice="' + esc(i.name) + '">Change</button>' +
          '</td>' +
          '<td>' + toggle('new', i.name, i.isNew) + '</td>' +
          '<td>' + toggle('pub', i.name, i.published) + '</td>' +
          '<td class="num">' +
            (i.added ? '<button class="a-btn a-btn--soft-red a-btn--sm" type="button" data-remove="' + esc(i.name) + '">Remove</button>' : '') +
            (changed && !i.added ? '<button class="a-btn a-btn--ghost a-btn--sm" type="button" data-resetprice="' + esc(i.name) + '">Undo price</button>' : '') +
          '</td></tr>';
      }).join('') : emptyRow(6, 'Nothing matches that.');
    }

    function toggle(what, name, on) {
      return '<button class="switch' + (on ? ' is-on' : '') + '" type="button" role="switch" aria-checked="' +
        (on ? 'true' : 'false') + '" data-' + what + '="' + esc(name) + '">' +
        '<span class="switch-track"><span class="switch-thumb"></span></span></button>';
    }

    on(el('items-tabs'), 'click', '[data-items-tab]', function (e, t) {
      kind = t.getAttribute('data-items-tab');
      el('items-tabs').querySelectorAll('.a-chip').forEach(function (c) { c.classList.toggle('is-active', c === t); });
      render();
    });
    on(el('items-filter'), 'click', '[data-items-show]', function (e, t) {
      show = t.getAttribute('data-items-show');
      el('items-filter').querySelectorAll('.a-chip').forEach(function (c) { c.classList.toggle('is-active', c === t); });
      render();
    });
    el('items-search').addEventListener('input', render);

    on(el('items-body'), 'click', '[data-pub]', function (e, t) {
      var name = t.getAttribute('data-pub');
      var item = L.find(kind, name);
      var next = !item.published;
      L.setPublished(kind, name, next);
      log(next ? 'Item put on the website' : 'Item taken off the website', name);
      toast(next ? name + ' is back on the website.' : name + ' is now hidden from the website.');
      render();
    });

    on(el('items-body'), 'click', '[data-new]', function (e, t) {
      var name = t.getAttribute('data-new');
      var item = L.find(kind, name);
      L.setNew(kind, name, !item.isNew);
      log(!item.isNew ? 'Marked as a new arrival' : 'No longer a new arrival', name);
      render();
    });

    on(el('items-body'), 'click', '[data-editprice]', function (e, t) {
      var name = t.getAttribute('data-editprice');
      var item = L.find(kind, name);
      BesiaAsk.amount({
        title: 'New price for ' + name,
        message: 'The published price is <strong>' + money(item.basePrice) + '</strong>. ' +
                 'Changing it here changes it on the website, the booking form and the chat at the same time.',
        value: item.was != null ? item.was : item.price,
        confirmLabel: 'Change the price'
      }).then(function (v) {
        if (!v) return;
        if (!L.setPrice(kind, name, v)) { toast('That is not a valid amount.'); return; }
        log('Price changed', name + ' → ' + money(v));
        toast(name + ' is now ' + money(v) + ' everywhere.');
        render();
      });
    });

    on(el('items-body'), 'click', '[data-resetprice]', function (e, t) {
      var name = t.getAttribute('data-resetprice');
      L.resetPrice(kind, name);
      log('Price put back', name);
      toast('Price put back to the published one.');
      render();
    });

    on(el('items-body'), 'click', '[data-remove]', function (e, t) {
      var name = t.getAttribute('data-remove');
      BesiaAsk.confirm({
        title: 'Remove ' + name + '?',
        message: 'It disappears from the website. If you only want to hide it for now, use the switch instead.',
        confirmLabel: 'Yes, remove it', tone: 'danger'
      }).then(function (yes) {
        if (!yes) return;
        L.removeAdded(kind, name);
        log('Item removed', name);
        toast(name + ' removed.');
        render();
      });
    });

    /* ---- add something new ---- */
    function fillCats() {
      var k = el('new-kind').value;
      var list = k === 'product' ? B.productCategories : B.serviceCategories;
      el('new-cat').innerHTML = list.map(function (c) {
        return '<option value="' + esc(c.key) + '">' + esc(c.label) + '</option>';
      }).join('');
      el('new-extra-label').textContent = k === 'product'
        ? 'How many do you have in stock?' : 'How long does it take?';
      el('new-extra').placeholder = k === 'product' ? 'e.g. 6' : 'e.g. 1 hr 30 min';
      el('new-extra').type = k === 'product' ? 'number' : 'text';
    }
    el('new-kind').addEventListener('change', fillCats);
    fillCats();

    el('new-add').addEventListener('click', function () {
      var k = el('new-kind').value;
      var name = (el('new-name').value || '').trim();
      var price = Number(el('new-price').value);
      if (!name) { toast('Give it a name first.'); return; }
      if (!isFinite(price) || price < 0) { toast('Type a price.'); return; }
      if (L.find(k, name)) { toast('Something is already called that.'); return; }

      var extra = (el('new-extra').value || '').trim();
      var item = {
        name: name,
        cat: el('new-cat').value,
        price: Math.round(price),
        blurb: (el('new-desc').value || '').trim(),
        short: (el('new-desc').value || '').trim(),
        published: true,
        isNew: true
      };
      if (k === 'product') { item.stock = Number(extra) || 0; item.img = 'images/accessories/acc-1.jpg'; }
      else { item.dur = extra || '1 hr'; item.mins = 60; }

      if (!L.addItem(k, item)) { toast('Could not add that.'); return; }
      L.setNew(k, name, true);
      log('New item added', name + ' · ' + money(item.price));
      toast(name + ' is on the website now.');
      ['new-name', 'new-desc', 'new-price', 'new-extra'].forEach(function (id) { el(id).value = ''; });
      kind = k;
      el('items-tabs').querySelectorAll('.a-chip').forEach(function (c) {
        c.classList.toggle('is-active', c.getAttribute('data-items-tab') === k);
      });
      render();
    });

    render();
    L.onChange(render);
  }

  /* =========================================================
     DISCOUNTS
     ========================================================= */
  function initDiscounts() {

    function describe(d) {
      var off = d.kind === 'percent' ? d.value + '% off' : money(d.value) + ' off';
      var where = d.scope === 'all' ? 'Everything'
                : d.scope === 'category' ? catLabel(guessKind(d.target), d.target)
                : d.target;
      return { off: off, where: where };
    }
    function guessKind(target) {
      return B.productCategories.some(function (c) { return c.key === target; }) ? 'product' : 'service';
    }

    function render() {
      var list = L.discounts();
      var running = list.filter(function (d) { return d.active; });
      var affected = 0;
      L.services().concat(L.products()).forEach(function (i) { if (i.discount) affected++; });

      el('disc-stats').innerHTML =
        stat('Offers running', String(running.length), running.length ? 'Showing on the website now' : 'Nothing is discounted') +
        stat('Items discounted', String(affected), 'Across services and products') +
        stat('Offers saved', String(list.length), 'Switched on or off');

      el('disc-body').innerHTML = list.length ? list.map(function (d) {
        var x = describe(d);
        return '<tr' + (d.active ? '' : ' class="is-hidden-row"') + '>' +
          '<td><strong>' + esc(d.label) + '</strong><br><span class="mini-info">' + esc(d.id) + '</span></td>' +
          '<td>' + esc(x.off) + '</td>' +
          '<td>' + esc(x.where) + '</td>' +
          '<td><button class="switch' + (d.active ? ' is-on' : '') + '" type="button" role="switch" aria-checked="' +
            (d.active ? 'true' : 'false') + '" data-toggle="' + esc(d.id) + '">' +
            '<span class="switch-track"><span class="switch-thumb"></span></span></button></td>' +
          '<td class="num"><button class="a-btn a-btn--soft-red a-btn--sm" type="button" data-del="' + esc(d.id) + '">Delete</button></td>' +
          '</tr>';
      }).join('') : emptyRow(5, 'No offers yet. Make one below.');
    }

    on(el('disc-body'), 'click', '[data-toggle]', function (e, t) {
      var id = t.getAttribute('data-toggle');
      var list = L.discounts();
      var hit = null;
      list.forEach(function (d) { if (d.id === id) { d.active = !d.active; hit = d; } });
      L.saveDiscounts(list);
      log(hit.active ? 'Offer switched on' : 'Offer switched off', hit.label);
      toast(hit.active ? 'Live on the website now.' : 'Offer switched off.');
      render();
    });

    on(el('disc-body'), 'click', '[data-del]', function (e, t) {
      var id = t.getAttribute('data-del');
      var list = L.discounts();
      var hit = list.filter(function (d) { return d.id === id; })[0];
      BesiaAsk.confirm({
        title: 'Delete this offer?',
        message: '“' + esc(hit.label) + '” will be removed. If it is running, it stops immediately.',
        confirmLabel: 'Yes, delete it', tone: 'danger'
      }).then(function (yes) {
        if (!yes) return;
        L.saveDiscounts(list.filter(function (d) { return d.id !== id; }));
        log('Offer deleted', hit.label);
        render();
      });
    });

    /* ---- the form ---- */
    function targets() {
      var scope = el('d-scope').value;
      var wrap = el('d-target-wrap');
      if (scope === 'all') { wrap.hidden = true; preview(); return; }
      wrap.hidden = false;
      var opts;
      if (scope === 'category') {
        el('d-target-label').textContent = 'Which group?';
        opts = B.serviceCategories.map(function (c) { return [c.key, 'Services · ' + c.label]; })
          .concat(B.productCategories.map(function (c) { return [c.key, 'Products · ' + c.label]; }));
      } else {
        el('d-target-label').textContent = 'Which item?';
        opts = L.services().map(function (i) { return [i.name, 'Service · ' + i.name]; })
          .concat(L.products().map(function (i) { return [i.name, 'Product · ' + i.name]; }));
      }
      el('d-target').innerHTML = opts.map(function (o) {
        return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>';
      }).join('');
      preview();
    }

    function preview() {
      var kind = el('d-kind').value;
      var v = Number(el('d-value').value) || 0;
      var scope = el('d-scope').value;
      if (!v) { el('d-preview').textContent = ''; return; }
      var where = scope === 'all' ? 'everything on the website'
                : scope === 'category' ? '“' + (el('d-target').selectedOptions[0] || {}).text + '”'
                : '“' + el('d-target').value + '”';
      el('d-preview').innerHTML = 'This takes <strong>' +
        (kind === 'percent' ? v + '%' : money(v)) + '</strong> off ' + esc(where) +
        '. It is saved switched off. Switch it on above when you are ready.';
    }

    el('d-kind').addEventListener('change', function () {
      el('d-value-label').textContent = el('d-kind').value === 'percent' ? 'Percentage' : 'Amount in cedis';
      preview();
    });
    el('d-value').addEventListener('input', preview);
    el('d-scope').addEventListener('change', targets);
    el('d-target').addEventListener('change', preview);
    targets();

    el('d-add').addEventListener('click', function () {
      var label = (el('d-label').value || '').trim();
      var v = Number(el('d-value').value);
      var kind = el('d-kind').value;
      var scope = el('d-scope').value;
      if (!label) { toast('Give the offer a name customers will understand.'); return; }
      if (!isFinite(v) || v <= 0) { toast('Type how much comes off.'); return; }
      if (kind === 'percent' && v > 90) { toast('That is more than 90% off. Check the figure.'); return; }

      var list = L.discounts();
      list.unshift({
        id: 'D-' + Math.floor(1000 + Math.random() * 8999),
        label: label, kind: kind, value: Math.round(v),
        scope: scope, target: scope === 'all' ? null : el('d-target').value,
        active: false
      });
      L.saveDiscounts(list);
      log('Offer created', label);
      toast('Saved, switched off. Switch it on when you are ready.');
      el('d-label').value = ''; el('d-value').value = '';
      preview();
      render();
    });

    render();
    L.onChange(render);
  }

  if (page === 'prices') initItems();
  if (page === 'discounts') initDiscounts();

})();
