/* ============================================================
   BĒSIA STUDIO MANAGER, admin-pages.js

   The sections added on top of the original manager:
   Sell Now, Sales, Balances, Cash Drawer, Expenses, Stock,
   Suppliers, Classes, Activity, Price List, Settings and Help.

   Everything is kept in the browser under the `besia-` prefix.
   In production these become tables in a database; the shapes
   below are deliberately the shapes those tables would take.
   ============================================================ */
(function () {
  'use strict';

  var B = window.BESIA;
  if (!B) return;

  var page = document.body.getAttribute('data-page');
  var money = B.money;

  /* ================= storage ================= */
  function read(name, fallback) {
    try { return JSON.parse(localStorage.getItem(B.key(name))) || fallback; }
    catch (e) { return fallback; }
  }
  function write(name, value) {
    try { localStorage.setItem(B.key(name), JSON.stringify(value)); } catch (e) {}
  }

  /* ================= small helpers ================= */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function el(id) { return document.getElementById(id); }
  function on(node, evt, sel, fn) {
    if (!node) return;
    node.addEventListener(evt, function (e) {
      var t = e.target.closest(sel);
      if (t && node.contains(t)) fn(e, t);
    });
  }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); }
  function today() { return startOfDay(new Date()); }
  function dayKey(ts) { return new Date(ts).toISOString().slice(0, 10); }
  function timeOf(ts) {
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  function dateOf(ts) {
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'a-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 400); }, 2600);
  }
  function statCard(label, value, sub, tone) {
    return '<div class="stat-card' + (tone ? ' stat-card--' + tone : '') + '">' +
      '<div class="stat-card-label">' + esc(label) + '</div>' +
      '<div class="stat-card-value">' + esc(value) + '</div>' +
      (sub ? '<div class="stat-card-delta">' + esc(sub) + '</div>' : '') +
      '</div>';
  }
  function emptyRow(cols, msg) {
    return '<tr class="empty-row"><td colspan="' + cols + '">' + esc(msg) + '</td></tr>';
  }

  /* ================= activity log ================= */
  function logActivity(what, detail) {
    var list = read('activity', []);
    list.unshift({ at: Date.now(), what: what, detail: detail || '', who: 'Front desk' });
    write('activity', list.slice(0, 200));
  }

  /* ================= seeds =================
     Demo data so no page ever looks empty in a pitch. Seeded once,
     then left alone so anything entered by hand survives a reload. */
  function seedOnce(name, builder) {
    var flag = 'seeded-' + name;
    if (read(flag, false)) return read(name, []);
    var data = builder();
    write(name, data);
    write(flag, true);
    return data;
  }

  function seedStock() {
    return seedOnce('stock', function () {
      var out = {};
      B.products.forEach(function (p, i) {
        // a believable spread, with a couple low and one finished
        var qty = [8, 5, 12, 3, 6, 9, 2, 14, 7, 4, 11, 6, 0, 10, 5, 8, 3, 9, 6, 12, 4, 7, 5][i];
        out[p.name] = qty == null ? 6 : qty;
      });
      return out;
    });
  }

  function seedStudents() {
    return seedOnce('students', function () {
      var d = function (n) { return today() + n * 86400000; };
      return [
        { id: 'S-1041', name: 'Abena Owusu',    phone: '024 551 2210', course: 'C-FUSION', starts: d(6),   fee: 4500, paid: 2250, note: 'Paid half to reserve her seat.' },
        { id: 'S-1040', name: 'Gifty Amoah',    phone: '020 774 6621', course: 'C-BRAID',  starts: d(2),   fee: 2500, paid: 2500, note: 'Paid in full on booking.' },
        { id: 'S-1039', name: 'Selina Nyarko',  phone: '055 210 9987', course: 'C-BRAID',  starts: d(2),   fee: 2500, paid: 1250, note: 'Balance due before the last day.' },
        { id: 'S-1038', name: 'Mavis Tetteh',   phone: '027 331 4470', course: 'C-SILK',   starts: d(-3),  fee: 1800, paid: 1800, note: 'Finished. Certificate issued.' },
        { id: 'S-1037', name: 'Priscilla Adjei', phone: '024 909 1123', course: 'C-COLOUR', starts: d(13), fee: 3000, paid: 1500, note: 'Half paid. Reminder sent.' },
        { id: 'S-1036', name: 'Yaa Boateng',    phone: '026 118 7734', course: 'C-CURL',   starts: d(9),   fee: 2200, paid: 0,    note: 'Seat held for 48 hours only.' }
      ];
    });
  }

  function seedSales() {
    return seedOnce('sales', function () {
      var now = Date.now(), h = 3600000;
      return [
        { id: 'SL-3012', at: now - 2 * h, customer: 'Linda Mensah',  phone: '055 302 6614', where: 'In the chair', method: 'MTN MoMo', items: [{ name: 'Silkpress Xpress', price: 550, qty: 1 }], total: 550, paid: 550 },
        { id: 'SL-3011', at: now - 4 * h, customer: 'Walk-in',       phone: '',             where: 'Counter',      method: 'Cash',     items: [{ name: 'Satin-Lined Bonnet', price: 120, qty: 1 }, { name: 'Silk Scrunchie Set', price: 95, qty: 1 }], total: 215, paid: 215 },
        { id: 'SL-3010', at: now - 6 * h, customer: 'Ama Owusu',     phone: '026 909 2288', where: 'In the chair', method: 'Cash',     items: [{ name: 'Frontal Installation', price: 500, qty: 1 }], total: 500, paid: 300 },
        { id: 'SL-3009', at: now - 27 * h, customer: 'Rita Agyeman', phone: '024 866 2299', where: 'In the chair', method: 'Card',     items: [{ name: 'Olaplex Treatment', price: 850, qty: 1 }], total: 850, paid: 850 },
        { id: 'SL-3008', at: now - 50 * h, customer: 'Walk-in',      phone: '',             where: 'Counter',      method: 'Cash',     items: [{ name: 'Flax Seed + Aloe Hair Mask', price: 190, qty: 2 }], total: 380, paid: 380 }
      ];
    });
  }

  function seedExpenses() {
    return seedOnce('expenses', function () {
      var now = Date.now(), d = 86400000;
      return [
        { at: now - 1 * d, cat: 'Stock purchase',     note: 'KTip bundles from Accra Hair Imports', amount: 4200, method: 'Bank transfer' },
        { at: now - 3 * d, cat: 'Electricity & water', note: 'ECG prepaid top-up',                  amount: 600,  method: 'MTN MoMo' },
        { at: now - 6 * d, cat: 'Transport',          note: 'Delivery run to East Legon',           amount: 80,   method: 'Cash' },
        { at: now - 9 * d, cat: 'Stock purchase',     note: 'Olaplex and K18 restock',              amount: 1850, method: 'Card' },
        { at: now - 14 * d, cat: 'Rent',              note: 'Monthly studio rent',                  amount: 3500, method: 'Bank transfer' }
      ];
    });
  }

  /* ================= SELL NOW ================= */
  function initSell() {
    var bill = [];
    var tab = 'services';
    var payMode = 'full';

    var methodSel = el('sell-method');
    B.paymentMethods.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m; o.textContent = m;
      methodSel.appendChild(o);
    });

    function catalogue() {
      var q = (el('sell-search').value || '').toLowerCase();
      var rows;
      if (tab === 'services') {
        rows = B.services.map(function (s) {
          return { name: s.name, sub: s.dur + ' · ' + B.categoryOf(s.cat).label, price: B.priceOf(s) };
        });
      } else {
        var stock = read('stock', {});
        rows = B.products.map(function (p) {
          var left = stock[p.name];
          return { name: p.name, sub: (left === 0 ? 'Finished' : left + ' on the shelf'), price: p.price, out: left === 0 };
        });
      }
      if (q) rows = rows.filter(function (r) { return r.name.toLowerCase().indexOf(q) !== -1; });

      el('sell-catalogue').innerHTML = rows.length ? rows.map(function (r) {
        return '<button type="button" class="pick-item' + (r.out ? ' is-out' : '') + '" data-pick="' + esc(r.name) + '" data-price="' + r.price + '"' + (r.out ? ' disabled' : '') + '>' +
          '<span class="pick-name">' + esc(r.name) + '</span>' +
          '<span class="pick-sub">' + esc(r.sub) + '</span>' +
          '<span class="pick-price">' + money(r.price) + '</span>' +
          '</button>';
      }).join('') : '<p class="form-help">Nothing matches that.</p>';
    }

    function total() {
      return bill.reduce(function (n, it) { return n + it.price * it.qty; }, 0);
    }

    function renderBill() {
      var t = total();
      if (!bill.length) {
        el('sell-bill').innerHTML = '<p class="form-help">Nothing added yet. Pick something on the left.</p>';
      } else {
        el('sell-bill').innerHTML = '<div class="bill-lines">' + bill.map(function (it, i) {
          return '<div class="bill-line">' +
            '<span class="bill-name">' + esc(it.name) + '</span>' +
            '<span class="bill-qty">' +
              '<button type="button" class="a-btn a-btn--ghost a-btn--sm" data-billminus="' + i + '" aria-label="One less">−</button>' +
              '<b>' + it.qty + '</b>' +
              '<button type="button" class="a-btn a-btn--ghost a-btn--sm" data-billplus="' + i + '" aria-label="One more">+</button>' +
            '</span>' +
            '<span class="bill-amt">' + money(it.price * it.qty) + '</span>' +
            '</div>';
        }).join('') + '</div>' +
        '<div class="bill-total"><span>Total</span><strong>' + money(t) + '</strong></div>';
      }
      var partWrap = el('sell-part-wrap');
      partWrap.hidden = payMode !== 'part';
      if (payMode === 'part' && !el('sell-part').value) el('sell-part').value = Math.round(t / 2);
      var paying = payMode === 'full' ? t : Math.min(Number(el('sell-part').value) || 0, t);
      var owing = t - paying;
      el('sell-owing').innerHTML = !t ? '' :
        (owing > 0
          ? 'They will still owe <strong>' + money(owing) + '</strong>. It will show up under Balances.'
          : 'Nothing left to pay.');
      el('sell-take').textContent = t ? 'Take ' + money(paying) : 'Take payment';
      el('sell-take').disabled = !t;
    }

    on(el('sell-tabs'), 'click', '[data-sell-tab]', function (e, t) {
      tab = t.getAttribute('data-sell-tab');
      el('sell-tabs').querySelectorAll('.a-chip').forEach(function (c) { c.classList.toggle('is-active', c === t); });
      catalogue();
    });
    el('sell-search').addEventListener('input', catalogue);

    on(el('sell-catalogue'), 'click', '[data-pick]', function (e, t) {
      var name = t.getAttribute('data-pick');
      var price = Number(t.getAttribute('data-price'));
      var found = bill.filter(function (b) { return b.name === name; })[0];
      if (found) found.qty += 1;
      else bill.push({ name: name, price: price, qty: 1, kind: tab });
      renderBill();
    });

    on(el('sell-bill'), 'click', '[data-billplus]', function (e, t) {
      bill[Number(t.getAttribute('data-billplus'))].qty += 1; renderBill();
    });
    on(el('sell-bill'), 'click', '[data-billminus]', function (e, t) {
      var i = Number(t.getAttribute('data-billminus'));
      bill[i].qty -= 1;
      if (bill[i].qty <= 0) bill.splice(i, 1);
      renderBill();
    });

    document.querySelectorAll('[data-sell-pay]').forEach(function (c) {
      c.addEventListener('click', function () {
        payMode = c.getAttribute('data-sell-pay');
        document.querySelectorAll('[data-sell-pay]').forEach(function (x) { x.classList.toggle('is-active', x === c); });
        renderBill();
      });
    });
    el('sell-part').addEventListener('input', renderBill);

    el('sell-take').addEventListener('click', function () {
      var t = total();
      if (!t) return;
      var paying = payMode === 'full' ? t : Math.min(Number(el('sell-part').value) || 0, t);
      var name = (el('sell-name').value || '').trim() || 'Walk-in';
      var sale = {
        id: 'SL-' + Math.floor(3000 + Math.random() * 6999),
        at: Date.now(),
        customer: name,
        phone: (el('sell-phone').value || '').trim(),
        where: 'Counter',
        method: methodSel.value,
        items: bill.map(function (b) { return { name: b.name, price: b.price, qty: b.qty }; }),
        total: t,
        paid: paying
      };
      var sales = read('sales', []);
      sales.unshift(sale);
      write('sales', sales);

      /* selling a product takes it off the shelf */
      var stock = read('stock', {});
      var moved = 0;
      bill.forEach(function (b) {
        if (b.kind === 'products' && stock[b.name] != null) {
          stock[b.name] = Math.max(0, stock[b.name] - b.qty); moved++;
        }
      });
      if (moved) write('stock', stock);

      /* cash sales land in the drawer */
      if (sale.method === 'Cash') {
        var drawer = loadDrawer();
        drawer.movements.push({ at: Date.now(), note: 'Sale ' + sale.id, amount: paying });
        saveDrawer(drawer);
      }

      logActivity('Sale recorded', sale.id + ' · ' + name + ' · ' + money(paying) +
        (t - paying > 0 ? ' (still owes ' + money(t - paying) + ')' : ''));

      toast('Saved. ' + money(paying) + ' taken' + (t - paying > 0 ? ', ' + money(t - paying) + ' still owing.' : '.'));
      bill = [];
      el('sell-name').value = ''; el('sell-phone').value = ''; el('sell-part').value = '';
      payMode = 'full';
      document.querySelectorAll('[data-sell-pay]').forEach(function (x) {
        x.classList.toggle('is-active', x.getAttribute('data-sell-pay') === 'full');
      });
      renderBill();
      catalogue();
    });

    seedStock();
    catalogue();
    renderBill();
  }

  /* ================= SALES ================= */
  function initSales() {
    seedSales();
    var period = 'today';

    function cutoff() {
      if (period === 'today') return today();
      if (period === 'week') return today() - 6 * 86400000;
      return today() - 29 * 86400000;
    }

    function render() {
      var all = read('sales', []);
      var rows = all.filter(function (s) { return s.at >= cutoff(); })
        .sort(function (a, b) { return b.at - a.at; });

      var taken = rows.reduce(function (n, s) { return n + s.paid; }, 0);
      var billed = rows.reduce(function (n, s) { return n + s.total; }, 0);
      el('sales-stats').innerHTML =
        statCard('Money taken', money(taken), rows.length + (rows.length === 1 ? ' sale' : ' sales')) +
        statCard('Value of sales', money(billed), 'Before any part-payments') +
        statCard('Still to collect', money(billed - taken), billed - taken > 0 ? 'See Balances' : 'All settled');

      el('sales-body').innerHTML = rows.length ? rows.map(function (s) {
        var what = s.items.map(function (i) { return i.name + (i.qty > 1 ? ' ×' + i.qty : ''); }).join(', ');
        return '<tr>' +
          '<td>' + dateOf(s.at) + '<br><span class="mini-info">' + timeOf(s.at) + '</span></td>' +
          '<td>' + esc(s.customer) + '</td>' +
          '<td>' + esc(what) + '</td>' +
          '<td>' + esc(s.where) + '</td>' +
          '<td>' + esc(s.method) + '</td>' +
          '<td class="num"><strong>' + money(s.paid) + '</strong>' +
            (s.paid < s.total ? '<br><span class="mini-info">of ' + money(s.total) + '</span>' : '') +
          '</td></tr>';
      }).join('') : emptyRow(6, 'No sales in this period yet.');
    }

    on(el('sales-period'), 'click', '[data-period]', function (e, t) {
      period = t.getAttribute('data-period');
      el('sales-period').querySelectorAll('.a-chip').forEach(function (c) { c.classList.toggle('is-active', c === t); });
      render();
    });
    render();
  }

  /* ================= BALANCES ================= */
  function collectBalances() {
    var out = [];
    read('sales', []).forEach(function (s) {
      if (s.paid < s.total) {
        out.push({ kind: 'sale', ref: s.id, who: s.customer, what: s.items.map(function (i) { return i.name; }).join(', '),
                   total: s.total, paid: s.paid });
      }
    });
    var courseName = {};
    B.courses.forEach(function (c) { courseName[c.id] = c.name; });
    read('students', []).forEach(function (st) {
      if (st.paid < st.fee) {
        out.push({ kind: 'student', ref: st.id, who: st.name, what: courseName[st.course] || 'Course',
                   total: st.fee, paid: st.paid });
      }
    });
    if (window.BesiaStore) {
      window.BesiaStore.getOrders().forEach(function (o) {
        if (o.payment && o.payment.status === 'Pay on pickup' && o.status !== 'Cancelled') {
          out.push({ kind: 'order', ref: o.id, who: o.customer, what: 'Shop order', total: o.total, paid: 0 });
        }
      });
    }
    return out.sort(function (a, b) { return (b.total - b.paid) - (a.total - a.paid); });
  }

  function initBalances() {
    seedSales(); seedStudents();

    function render() {
      var rows = collectBalances();
      var owed = rows.reduce(function (n, r) { return n + (r.total - r.paid); }, 0);
      el('bal-stats').innerHTML =
        statCard('Owed to you', money(owed), rows.length + (rows.length === 1 ? ' person' : ' people')) +
        statCard('From students', money(rows.filter(function (r) { return r.kind === 'student'; })
          .reduce(function (n, r) { return n + r.total - r.paid; }, 0)), 'Course fees not yet settled') +
        statCard('From customers', money(rows.filter(function (r) { return r.kind !== 'student'; })
          .reduce(function (n, r) { return n + r.total - r.paid; }, 0)), 'Services, products and orders');

      el('bal-body').innerHTML = rows.length ? rows.map(function (r) {
        return '<tr>' +
          '<td><strong>' + esc(r.who) + '</strong><br><span class="mini-info">' + esc(r.ref) + '</span></td>' +
          '<td>' + esc(r.what) + '</td>' +
          '<td class="num">' + money(r.total) + '</td>' +
          '<td class="num">' + money(r.paid) + '</td>' +
          '<td class="num"><strong class="money-owed">' + money(r.total - r.paid) + '</strong></td>' +
          '<td class="num"><button class="a-btn a-btn--gold a-btn--sm" type="button" data-settle="' + esc(r.kind + ':' + r.ref) + '">Record payment</button></td>' +
          '</tr>';
      }).join('') : emptyRow(6, 'Nobody owes you anything. ');
    }

    on(el('bal-body'), 'click', '[data-settle]', function (e, t) {
      var parts = t.getAttribute('data-settle').split(':');
      var kind = parts[0], ref = parts[1];
      var row = collectBalances().filter(function (r) { return r.kind === kind && r.ref === ref; })[0];
      if (!row) return;
      var outstanding = row.total - row.paid;
      BesiaAsk.amount({
        title: 'Payment from ' + row.who,
        message: 'They still owe <strong>' + money(outstanding) + '</strong> for ' + esc(row.what) + '.',
        value: outstanding, max: outstanding, confirmLabel: 'Record it'
      }).then(function (amt) {
      if (!amt) return;

      if (kind === 'sale') {
        var sales = read('sales', []);
        sales.forEach(function (s) { if (s.id === ref) s.paid += amt; });
        write('sales', sales);
      } else if (kind === 'student') {
        var studs = read('students', []);
        studs.forEach(function (s) { if (s.id === ref) s.paid += amt; });
        write('students', studs);
      } else if (kind === 'order' && window.BesiaStore) {
        window.BesiaStore.markPaid && window.BesiaStore.markPaid(ref);
      }
      logActivity('Payment received', row.who + ' · ' + money(amt) + ' towards ' + ref);
      toast(money(amt) + ' recorded for ' + row.who + '.');
      render();
      });
    });

    render();
  }

  /* ================= CASH DRAWER ================= */
  function loadDrawer() {
    var d = read('drawer', null);
    if (!d || d.day !== dayKey(Date.now())) {
      d = { day: dayKey(Date.now()), opened: false, float: 0, movements: [], closed: false, counted: null };
    }
    return d;
  }
  function saveDrawer(d) { write('drawer', d); }

  function initCash() {
    seedSales();

    function cashSalesToday() {
      return read('sales', [])
        .filter(function (s) { return s.at >= today() && s.method === 'Cash'; })
        .reduce(function (n, s) { return n + s.paid; }, 0);
    }
    function cashExpensesToday() {
      return read('expenses', [])
        .filter(function (e) { return e.at >= today() && e.method === 'Cash'; })
        .reduce(function (n, e) { return n + e.amount; }, 0);
    }

    function expected(d) {
      var moves = d.movements.reduce(function (n, m) { return n + m.amount; }, 0);
      return d.float + moves - cashExpensesToday();
    }

    function render() {
      var d = loadDrawer();
      var exp = expected(d);

      el('cash-stats').innerHTML =
        statCard('Cash sales today', money(cashSalesToday()), 'Card and MoMo are not counted here') +
        statCard('Cash paid out today', money(cashExpensesToday()), 'Expenses paid in cash') +
        statCard('Should be in the drawer', d.opened ? money(exp) : 'Closed', d.opened ? 'Float plus cash in, less cash out' : 'Enter your opening float first');

      el('cash-open').innerHTML = d.opened
        ? '<p class="form-help">Opened with <strong>' + money(d.float) + '</strong>. ' +
          '<button class="a-btn a-btn--ghost a-btn--sm" type="button" id="cash-reopen">Change</button></p>'
        : '<div class="a-field"><label for="cash-float">Cash you are starting with</label>' +
          '<input class="a-input" id="cash-float" type="number" inputmode="numeric" min="0" step="10" placeholder="e.g. 200"></div>' +
          '<button class="a-btn a-btn--gold" type="button" id="cash-start">Open the drawer</button>';

      el('cash-body').innerHTML = d.movements.length ? d.movements.slice().reverse().map(function (m) {
        return '<tr><td>' + timeOf(m.at) + '</td><td>' + esc(m.note) + '</td>' +
          '<td class="num"><strong class="' + (m.amount < 0 ? 'money-owed' : 'money-in') + '">' +
          (m.amount < 0 ? '− ' : '+ ') + money(Math.abs(m.amount)) + '</strong></td></tr>';
      }).join('') : emptyRow(3, 'Nothing yet today.');

      if (!d.opened) {
        el('cash-close').innerHTML = '<p class="form-help">Open the drawer first, at the top of this page.</p>';
      } else if (d.closed) {
        var diff = d.counted - exp;
        el('cash-close').innerHTML =
          '<p class="form-help">Closed. You counted <strong>' + money(d.counted) + '</strong>, and the drawer should have held <strong>' + money(exp) + '</strong>.</p>' +
          '<p class="form-help">' + (Math.abs(diff) < 1
            ? 'It matched exactly.'
            : (diff > 0 ? 'There was <strong>' + money(diff) + '</strong> more than expected.'
                        : 'There was <strong>' + money(-diff) + '</strong> less than expected.')) + '</p>' +
          '<button class="a-btn a-btn--ghost a-btn--sm" type="button" id="cash-reopen2">Count again</button>';
      } else {
        el('cash-close').innerHTML =
          '<div class="a-field"><label for="cash-count">Cash you counted</label>' +
          '<input class="a-input" id="cash-count" type="number" inputmode="numeric" min="0" step="10" placeholder="Count it twice"></div>' +
          '<button class="a-btn a-btn--gold" type="button" id="cash-end">Close the day</button>';
      }

      var start = el('cash-start');
      if (start) start.onclick = function () {
        var v = Number((el('cash-float') || {}).value) || 0;
        var dd = loadDrawer(); dd.opened = true; dd.float = v; saveDrawer(dd);
        logActivity('Drawer opened', 'Float ' + money(v));
        toast('Drawer opened with ' + money(v) + '.');
        render();
      };
      [el('cash-reopen'), el('cash-reopen2')].forEach(function (b) {
        if (b) b.onclick = function () {
          var dd = loadDrawer(); dd.opened = false; dd.closed = false; dd.counted = null; saveDrawer(dd); render();
        };
      });
      var end = el('cash-end');
      if (end) end.onclick = function () {
        var v = Number((el('cash-count') || {}).value);
        if (!v && v !== 0) { toast('Type the amount you counted.'); return; }
        var dd = loadDrawer(); dd.closed = true; dd.counted = v; saveDrawer(dd);
        logActivity('Drawer closed', 'Counted ' + money(v));
        render();
      };
    }

    el('cash-in').addEventListener('click', function () { movement(1); });
    el('cash-out').addEventListener('click', function () { movement(-1); });
    function movement(sign) {
      var d = loadDrawer();
      if (!d.opened) { toast('Open the drawer first.'); return; }
      var note = (el('cash-note').value || '').trim();
      var amt = Number(el('cash-amt').value) || 0;
      if (!note || !amt) { toast('Type what it is for and how much.'); return; }
      d.movements.push({ at: Date.now(), note: note, amount: sign * amt });
      saveDrawer(d);
      logActivity(sign > 0 ? 'Cash in' : 'Cash out', note + ' · ' + money(amt));
      el('cash-note').value = ''; el('cash-amt').value = '';
      render();
    }

    render();
  }

  /* ================= EXPENSES ================= */
  function initExpenses() {
    seedExpenses();
    var cat = el('exp-cat'), method = el('exp-method');
    B.expenseCategories.forEach(function (c) {
      var o = document.createElement('option'); o.value = c; o.textContent = c; cat.appendChild(o);
    });
    B.paymentMethods.forEach(function (m) {
      var o = document.createElement('option'); o.value = m; o.textContent = m; method.appendChild(o);
    });

    var period = "30";
    function cutoff() {
      var d = new Date();
      if (period === "month") { d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); }
      if (period === "year") { d.setMonth(0, 1); d.setHours(0, 0, 0, 0); return d.getTime(); }
      return today() - 29 * 86400000;
    }
    function periodLabel() {
      return period === "month" ? "this month" : (period === "year" ? "this year" : "in the last 30 days");
    }

    function render() {
      var all = read('expenses', []).sort(function (a, b) { return b.at - a.at; });
      var mine = all.filter(function (e) { return e.at >= cutoff(); });
      var total = mine.reduce(function (n, e) { return n + e.amount; }, 0);
      var biggest = {};
      mine.forEach(function (e) { biggest[e.cat] = (biggest[e.cat] || 0) + e.amount; });
      var topCat = Object.keys(biggest).sort(function (a, b) { return biggest[b] - biggest[a]; })[0];

      el('exp-stats').innerHTML =
        statCard('Spent this month', money(total), mine.length + (mine.length === 1 ? ' entry' : ' entries')) +
        statCard('Biggest cost', topCat || 'None yet', topCat ? money(biggest[topCat]) : 'Nothing recorded yet') +
        statCard('Spent today', money(all.filter(function (e) { return e.at >= today(); })
          .reduce(function (n, e) { return n + e.amount; }, 0)), 'Since midnight');

      el('exp-body').innerHTML = mine.length ? mine.map(function (e) {
        return '<tr><td>' + dateOf(e.at) + '</td><td>' + esc(e.cat) + '</td>' +
          '<td>' + esc(e.note) + '<br><span class="mini-info">' + esc(e.method) + '</span></td>' +
          '<td class="num"><strong>' + money(e.amount) + '</strong></td></tr>';
      }).join('') : emptyRow(4, 'Nothing recorded this month.');
    }

    el('exp-add').addEventListener('click', function () {
      var note = (el('exp-note').value || '').trim();
      var amt = Number(el('exp-amt').value) || 0;
      if (!note || !amt) { toast('Type what it was for and how much.'); return; }
      var list = read('expenses', []);
      list.unshift({ at: Date.now(), cat: cat.value, note: note, amount: amt, method: method.value });
      write('expenses', list);
      if (method.value === 'Cash') {
        var d = loadDrawer();
        if (d.opened) { saveDrawer(d); }
      }
      logActivity('Expense added', cat.value + ' · ' + note + ' · ' + money(amt));
      el('exp-note').value = ''; el('exp-amt').value = '';
      toast('Expense saved.');
      render();
    });

    render();
  }

  /* ================= STOCK ================= */
  function initStock() {
    seedStock();
    var filter = 'all';

    function render() {
      var stock = read('stock', {});
      var low = B.lowStockAt;
      var rows = B.products.map(function (p) {
        var qty = stock[p.name] == null ? 0 : stock[p.name];
        return { p: p, qty: qty, state: qty === 0 ? 'out' : (qty <= low ? 'low' : 'ok') };
      });

      el('stock-stats').innerHTML =
        statCard('Items on the shelf', String(rows.reduce(function (n, r) { return n + r.qty; }, 0)), rows.length + ' different products') +
        statCard('Running low', String(rows.filter(function (r) { return r.state === 'low'; }).length), low + ' or fewer left') +
        statCard('Finished', String(rows.filter(function (r) { return r.state === 'out'; }).length), 'Reorder these first');

      var view = rows.filter(function (r) { return filter === 'all' || r.state === filter; });
      var label = { ok: 'In stock', low: 'Running low', out: 'Finished' };
      var badge = { ok: 'available', low: 'low', out: 'out' };
      var catLabel = {};
      B.productCategories.forEach(function (c) { catLabel[c.key] = c.label; });

      el('stock-body').innerHTML = view.length ? view.map(function (r) {
        return '<tr>' +
          '<td><strong>' + esc(r.p.name) + '</strong></td>' +
          '<td>' + esc(catLabel[r.p.cat] || r.p.cat) + '</td>' +
          '<td class="num">' + money(r.p.price) + '</td>' +
          '<td class="num"><strong>' + r.qty + '</strong></td>' +
          '<td><span class="badge badge--' + badge[r.state] + '">' + label[r.state] + '</span></td>' +
          '<td class="num"><span class="row-actions">' +
            '<button class="a-btn a-btn--ghost a-btn--sm" type="button" data-stockdown="' + esc(r.p.name) + '" aria-label="One less">−</button>' +
            '<button class="a-btn a-btn--ghost a-btn--sm" type="button" data-stockup="' + esc(r.p.name) + '" aria-label="One more">+</button>' +
          '</span></td></tr>';
      }).join('') : emptyRow(6, 'Nothing in this group.');
    }

    function bump(name, by) {
      var stock = read('stock', {});
      stock[name] = Math.max(0, (stock[name] || 0) + by);
      write('stock', stock);
      logActivity('Stock changed', name + ' ' + (by > 0 ? '+' : '') + by + ' → ' + stock[name]);
      render();
    }
    on(el('stock-body'), 'click', '[data-stockup]', function (e, t) { bump(t.getAttribute('data-stockup'), 1); });
    on(el('stock-body'), 'click', '[data-stockdown]', function (e, t) { bump(t.getAttribute('data-stockdown'), -1); });
    on(el('stock-filter'), 'click', '[data-stock]', function (e, t) {
      filter = t.getAttribute('data-stock');
      el('stock-filter').querySelectorAll('.a-chip').forEach(function (c) { c.classList.toggle('is-active', c === t); });
      render();
    });
    render();
  }

  /* ================= SUPPLIERS ================= */
  function initSuppliers() {
    var wa = B.business.whatsapp;
    el('sup-grid').innerHTML = B.suppliers.map(function (s, i) {
      var initials = s.name.split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('');
      return '<div class="staff-card">' +
        '<div class="staff-top"><div class="client-avatar">' + esc(initials) + '</div>' +
        '<div><div class="staff-name">' + esc(s.name) + '</div>' +
        '<div class="staff-role">' + esc(s.supplies) + '</div></div></div>' +
        '<div class="staff-meta">' +
          '<div><span>Phone</span><strong>' + esc(s.phone) + '</strong></div>' +
          '<div><span>Payment</span><strong>' + esc(s.terms) + '</strong></div>' +
        '</div>' +
        '<div class="row-actions">' +
          '<a class="a-btn a-btn--ghost a-btn--sm" href="tel:' + esc(s.phone.replace(/\s/g, '')) + '">Call</a>' +
          '<a class="a-btn a-btn--green a-btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + wa +
            '?text=' + encodeURIComponent('Hello ' + s.name + ', this is Bēsia Beauty Studio. We would like to reorder.') + '">WhatsApp</a>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  /* ================= CLASSES ================= */
  function initClasses() {
    seedStudents();
    var filter = 'all';
    var byId = {};
    B.courses.forEach(function (c) { byId[c.id] = c; });

    function render() {
      var studs = read('students', []);
      var fees = studs.reduce(function (n, s) { return n + s.fee; }, 0);
      var paid = studs.reduce(function (n, s) { return n + s.paid; }, 0);

      el('cls-stats').innerHTML =
        statCard('Students', String(studs.length), 'Across ' + B.courses.length + ' courses') +
        statCard('Fees collected', money(paid), 'Of ' + money(fees) + ' booked') +
        statCard('Still to collect', money(fees - paid),
          studs.filter(function (s) { return s.paid < s.fee; }).length + ' still owing');

      el('cls-courses').innerHTML = B.courses.map(function (c) {
        var taken = studs.filter(function (s) { return s.course === c.id; }).length;
        var pct = Math.round(taken / c.seats * 100);
        return '<div class="staff-card">' +
          '<div class="staff-top"><div class="client-avatar">' + esc(c.name[0]) + '</div>' +
          '<div><div class="staff-name">' + esc(c.name) + '</div>' +
          '<div class="staff-role">' + c.days + ' days · ' + esc(c.level) + '</div></div></div>' +
          '<div class="staff-meta">' +
            '<div><span>Fee</span><strong>' + money(c.fee) + '</strong></div>' +
            '<div><span>Seats</span><strong>' + taken + ' of ' + c.seats + '</strong></div>' +
          '</div>' +
          '<div class="inv-bar"><span style="width:' + Math.min(100, pct) + '%"></span></div>' +
          '</div>';
      }).join('');

      var view = studs.filter(function (s) {
        if (filter === 'owing') return s.paid < s.fee;
        if (filter === 'paid') return s.paid >= s.fee;
        return true;
      }).sort(function (a, b) { return a.starts - b.starts; });

      el('cls-body').innerHTML = view.length ? view.map(function (s) {
        var c = byId[s.course] || { name: 'Course' };
        var owing = s.fee - s.paid;
        return '<tr>' +
          '<td><strong>' + esc(s.name) + '</strong><br><span class="mini-info">' + esc(s.phone) + '</span></td>' +
          '<td>' + esc(c.name) + '</td>' +
          '<td>' + dateOf(s.starts) + '</td>' +
          '<td class="num">' + money(s.fee) + '</td>' +
          '<td class="num">' + money(s.paid) + '</td>' +
          '<td class="num">' + (owing > 0
            ? '<strong class="money-owed">' + money(owing) + '</strong>'
            : '<span class="badge badge--completed">Paid</span>') + '</td>' +
          '<td class="num">' + (owing > 0
            ? '<button class="a-btn a-btn--gold a-btn--sm" type="button" data-payfee="' + esc(s.id) + '">Record payment</button>'
            : '') + '</td>' +
          '</tr>';
      }).join('') : emptyRow(7, 'No students in this group.');
    }

    on(el('cls-body'), 'click', '[data-payfee]', function (e, t) {
      var id = t.getAttribute('data-payfee');
      var studs = read('students', []);
      var s = studs.filter(function (x) { return x.id === id; })[0];
      if (!s) return;
      var owing = s.fee - s.paid;
      BesiaAsk.amount({
        title: 'Fee from ' + s.name,
        message: 'She still owes <strong>' + money(owing) + '</strong> on this course.',
        value: owing, max: owing, confirmLabel: 'Record it'
      }).then(function (amt) {
        if (!amt) return;
        s.paid += amt;
        write('students', studs);
        logActivity('Course fee received', s.name + ' · ' + money(amt));
        toast(money(amt) + ' recorded for ' + s.name + '.');
        render();
      });
    });

    on(el('cls-filter'), 'click', '[data-cls]', function (e, t) {
      filter = t.getAttribute('data-cls');
      el('cls-filter').querySelectorAll('.a-chip').forEach(function (c) { c.classList.toggle('is-active', c === t); });
      render();
    });
    render();
  }

  /* ================= ACTIVITY ================= */
  function initActivity() {
    function render() {
      var list = read('activity', []);
      el('act-body').innerHTML = list.length ? list.map(function (a) {
        return '<div class="mini-step is-done">' +
          '<div><strong>' + esc(a.what) + '</strong>' +
          (a.detail ? '<div class="mini-info">' + esc(a.detail) + '</div>' : '') +
          '<div class="mini-date">' + dateOf(a.at) + ' · ' + timeOf(a.at) + ' · ' + esc(a.who) + '</div></div>' +
          '</div>';
      }).join('') : '<p class="form-help">Nothing has happened yet today. Take a sale or record a payment and it will show up here.</p>';
    }
    el('act-clear').addEventListener('click', function () {
      BesiaAsk.confirm({
        title: 'Clear the activity list?',
        message: 'This wipes the record of what has happened. It cannot be undone.',
        confirmLabel: 'Yes, clear it', tone: 'danger'
      }).then(function (yes) { if (yes) { write('activity', []); render(); } });
    });
    render();
  }

  /* ================= SETTINGS ================= */
  function initSettings() {
    var b = B.business;
    function dl(pairs) {
      return pairs.map(function (p) {
        return '<div><dt>' + esc(p[0]) + '</dt><dd>' + p[1] + '</dd></div>';
      }).join('');
    }
    el('set-business').innerHTML = dl([
      ['Studio name', esc(b.nameFull)],
      ['Address', esc(b.addressLine)],
      ['Phone', '<a href="tel:' + esc(b.phoneIntl) + '">' + esc(b.phone) + '</a>'],
      ['WhatsApp', '<a href="' + esc(b.whatsappLink) + '" target="_blank" rel="noopener">' + esc(b.phone) + '</a>'],
      ['Email', '<a href="mailto:' + esc(b.email) + '">' + esc(b.email) + '</a>'],
      ['Instagram', '<a href="' + esc(b.instagram) + '" target="_blank" rel="noopener">' + esc(b.instagramHandle) + '</a>'],
      ['TikTok', '<a href="' + esc(b.tiktok) + '" target="_blank" rel="noopener">' + esc(b.tiktokHandle) + '</a>'],
      ['Delivery charge', money(b.deliveryFee)]
    ]);
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    el('set-hours').innerHTML = dl(days.map(function (d, i) {
      var open = b.openDays.indexOf(i) !== -1;
      return [d, open ? (b.openHour + 'am to ' + (b.closeHour - 12) + 'pm') : '<em>Closed</em>'];
    }).concat([['Open right now?', B.isOpenNow() ? 'Yes' : 'No']]));

    el('set-reset').addEventListener('click', function () {
      BesiaAsk.confirm({
        title: 'Start the demo again?',
        message: 'This clears the sales, orders, students and price changes you have entered while trying the system, and puts the sample data back.',
        confirmLabel: 'Yes, reset it', tone: 'danger'
      }).then(function (yes) {
        if (!yes) return;
        ['sales', 'expenses', 'students', 'stock', 'drawer', 'activity', 'orders', 'cart',
         'catalogue', 'discounts', 'web-bookings', 'builder', 'last-order',
         'seeded-sales', 'seeded-expenses', 'seeded-students', 'seeded-stock'].forEach(function (k) {
          try { localStorage.removeItem(B.key(k)); } catch (e) {}
        });
        toast('Demo data reset. Reloading…');
        setTimeout(function () { location.reload(); }, 900);
      });
    });
  }

  /* ================= HELP ================= */
  var HELP = [
    ['Someone walked in without booking. What do I do?',
     'Open <strong>Sell Now</strong>. Tap the service they are having, add anything they are buying, type their name and phone, then take the payment. It goes straight into Sales.'],
    ['A customer wants to pay half now and half later.',
     'In <strong>Sell Now</strong>, choose <em>Part of it</em> and type what they are paying today. The rest is saved automatically under <strong>Balances</strong> so it is not forgotten.'],
    ['How do I see who owes me money?',
     'Open <strong>Balances</strong>. It shows customers, shop orders and students in one list, biggest debt first. Press <em>Record payment</em> when money comes in.'],
    ['A student wants to join a class.',
     'Classes are booked from the website. Open <strong>Classes</strong> to see who has signed up, what they have paid and what is still owing. Students can pay in full or pay half to hold a seat.'],
    ['How do I take something off the website?',
     'Open <strong>Items</strong>, find it, and tap the switch under <em>On the website</em>. It disappears from the website straight away. Tap it again and it comes back. Nothing is deleted, it is only hidden.'],
    ['How do I put a new product or service on the website?',
     'Open <strong>Items</strong> and scroll to <em>Add something new</em>. Give it a name, a group, a price and one line about it. It goes on the website immediately, marked as a new arrival.'],
    ['How do I run a discount?',
     'Open <strong>Discounts</strong> and make the offer: how much off, and what it applies to. It saves switched <em>off</em>, so nothing changes yet. When you are ready, tap the switch. The website then shows the old price crossed out, a banner across the top, and the checkout charges the lower price. Switch it off when the offer ends.'],
    ['Something is finished. Will the website still sell it?',
     'No. When <strong>Stock</strong> reaches zero the website marks it <em>Sold out</em> and the Add to Cart button stops working, so nobody can order what you do not have. Confirming an online order takes the stock off the shelf for you.'],
    ['The lights went off, or the internet dropped. What happens?',
     'Keep working. A message appears at the bottom telling you there is no connection, and everything you enter is saved on the device. It is all still there when you are back online.'],
    ['How do I change a price?',
     'Every price lives in one file, <code>js/besia-data.js</code>. Change it there and the website, the booking form, the chat assistant and this manager all update together. <strong>Price List</strong> shows you exactly what is set right now.'],
    ['An online order came in. What now?',
     'Open <strong>Shop Orders</strong>, tap the order, then press <em>Confirm this order</em>. The customer’s tracking page updates the moment you do, with the time on it.'],
    ['How do I balance the cash at the end of the day?',
     'Open <strong>Cash Drawer</strong>. Type your opening float in the morning. At close, count the cash and type the figure. It will tell you whether it matches and by how much if it does not.'],
    ['Where do I record rent or a delivery I paid for?',
     'Open <strong>Expenses</strong>, pick the kind, type what it was for and the amount. It feeds straight into Reports.'],
    ['Something ran out on the shelf.',
     'Open <strong>Stock</strong> and use − and + as things go out and come in. Anything with three or fewer left is flagged, and finished items are marked so you know what to reorder.'],
    ['I made a mistake while testing.',
     'Open <strong>Settings</strong> and press <em>Reset demo data</em>. It clears what you entered and puts the sample data back.']
  ];

  function initHelp() {
    el('help-body').innerHTML = HELP.map(function (h, i) {
      return '<details class="help-item"' + (i === 0 ? ' open' : '') + '>' +
        '<summary>' + esc(h[0]) + '</summary>' +
        '<div class="help-answer">' + h[1] + '</div></details>';
    }).join('');
  }

  /* ================= route ================= */
  var ROUTES = {
    sell: initSell, sales: initSales, balances: initBalances, cash: initCash,
    expenses: initExpenses, stock: initStock, suppliers: initSuppliers,
    classes: initClasses, activity: initActivity,
    settings: initSettings, help: initHelp
  };

  /* seed the shared collections wherever they are read */
  if (['dashboard', 'sales', 'balances', 'cash', 'reports'].indexOf(page) !== -1) { seedSales(); seedStudents(); seedExpenses(); seedStock(); }

  if (ROUTES[page]) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ROUTES[page]);
    else ROUTES[page]();
  }

  /* the date in the top bar, on every page */
  var d = document.getElementById('today-date');
  if (d) {
    d.textContent = new Date().toLocaleDateString('en-GB',
      { weekday: 'long', day: 'numeric', month: 'long' });
  }

  window.BesiaAdmin = { read: read, write: write, logActivity: logActivity, toast: toast };
})();
