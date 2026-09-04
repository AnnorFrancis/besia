/* ============================================================
   BĒSIA BEAUTY STUDIO — store.js
   The shop engine shared by shop.html, checkout.html, track.html
   and admin/orders.html: cart, orders, order numbers, status
   timeline and the demo payment flow. Everything lives in
   localStorage so the customer pages and the admin stay in sync
   on the same device — exactly how the real backend will behave.
   ============================================================ */
(function () {
  'use strict';

  /* Keys are namespaced through js/besia-data.js. localStorage is scoped
     per ORIGIN, not per path — without a namespace, two demos hosted on
     the same domain would silently share one cart and one order book. */
  var NS = window.BESIA ? BESIA.key : function (n) { return 'besia-' + n; };
  var CART_KEY = NS('cart');
  var ORDERS_KEY = NS('orders');

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function money(n) {
    return window.BESIA ? BESIA.money(n) : ('GHS ' + Math.round(n).toLocaleString());
  }
  function deliveryFee() {
    return window.BESIA ? BESIA.business.deliveryFee : 30;
  }

  /* ---------- Cart ---------- */
  function getCart() { return read(CART_KEY, []); }
  function saveCart(items) { write(CART_KEY, items); notify(); }

  function addItem(item) {
    var cart = getCart();
    var found = null;
    for (var i = 0; i < cart.length; i++) { if (cart[i].name === item.name) found = cart[i]; }
    if (found) found.qty += 1;
    else cart.push({ name: item.name, price: item.price, img: item.img || '', cat: item.cat || '', qty: 1 });
    saveCart(cart);
  }
  function setQty(name, qty) {
    var cart = getCart().map(function (it) {
      if (it.name === name) it.qty = qty;
      return it;
    }).filter(function (it) { return it.qty > 0; });
    saveCart(cart);
  }
  function removeItem(name) { setQty(name, 0); }
  function clearCart() { saveCart([]); }
  function cartCount() { return getCart().reduce(function (s, it) { return s + it.qty; }, 0); }
  function cartTotal() { return getCart().reduce(function (s, it) { return s + it.price * it.qty; }, 0); }

  /* ---------- Orders ---------- */
  var STATUS_FLOW_PICKUP = ['Order placed', 'Confirmed', 'Ready for pickup', 'Picked up'];
  var STATUS_FLOW_DELIVERY = ['Order placed', 'Confirmed', 'Out for delivery', 'Delivered'];

  function statusFlow(order) {
    return order.method === 'delivery' ? STATUS_FLOW_DELIVERY : STATUS_FLOW_PICKUP;
  }

  function newOrderId() {
    // BES-yymmdd-xxx keeps ids readable on a receipt and easy to say on the phone
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) +
      ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
    return 'BES-' + ymd + '-' + String(100 + Math.floor(Math.random() * 900));
  }

  function getOrders() { return read(ORDERS_KEY, []); }
  function saveOrders(list) { write(ORDERS_KEY, list); notify(); }

  function getOrder(id) {
    var list = getOrders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id.toUpperCase() === String(id).trim().toUpperCase()) return list[i];
    }
    return null;
  }

  function createOrder(details) {
    var items = getCart();
    if (!items.length) return null;
    var subtotal = cartTotal();
    var fee = details.method === 'delivery' ? deliveryFee() : 0;
    var order = {
      id: newOrderId(),
      placedAt: Date.now(),
      customer: details.customer,
      phone: details.phone,
      method: details.method,                    // 'pickup' | 'delivery'
      area: details.area || '',
      payment: details.payment,                  // {type, network, number, status}
      items: items,
      subtotal: subtotal,
      deliveryFee: fee,
      total: subtotal + fee,
      status: 'Order placed',
      timeline: [{ status: 'Order placed', at: Date.now() }]
    };
    var list = getOrders();
    list.unshift(order);
    saveOrders(list);
    clearCart();
    return order;
  }

  /* Confirming an online order takes the goods off the shelf, exactly as
     selling them over the counter does. Done once per order — the flag on
     the order stops a second confirmation double-counting. */
  function releaseStock(order) {
    if (!order || order.stockTaken) return;
    var key = NS('stock'), stock;
    try { stock = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return; }
    var moved = false;
    (order.items || []).forEach(function (it) {
      if (Object.prototype.hasOwnProperty.call(stock, it.name)) {
        stock[it.name] = Math.max(0, stock[it.name] - (it.qty || 1));
        moved = true;
      }
    });
    if (moved) { try { localStorage.setItem(key, JSON.stringify(stock)); } catch (e) {} }
    order.stockTaken = true;
  }

  /* A cancelled order puts everything back. */
  function returnStock(order) {
    if (!order || !order.stockTaken) return;
    var key = NS('stock'), stock;
    try { stock = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return; }
    (order.items || []).forEach(function (it) {
      if (Object.prototype.hasOwnProperty.call(stock, it.name)) {
        stock[it.name] = stock[it.name] + (it.qty || 1);
      }
    });
    try { localStorage.setItem(key, JSON.stringify(stock)); } catch (e) {}
    order.stockTaken = false;
  }

  function updateStatus(id, status) {
    var list = getOrders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list[i].status = status;
        list[i].timeline.push({ status: status, at: Date.now() });
        if (status === 'Confirmed') releaseStock(list[i]);
        if (status === 'Cancelled') returnStock(list[i]);
        if (status === 'Picked up' || status === 'Delivered') {
          if (list[i].payment && list[i].payment.status !== 'Paid') list[i].payment.status = 'Paid';
        }
      }
    }
    saveOrders(list);
  }

  function markPaid(id) {
    var list = getOrders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id && list[i].payment) list[i].payment.status = 'Paid';
    }
    saveOrders(list);
  }

  /* ---------- Seed orders (so the admin demo never looks empty) ---------- */
  function seedOrders() {
    var list = getOrders();
    if (list.some(function (o) { return o.seeded; })) return;
    var h = 3600000;
    var seeds = [
      {
        id: 'BES-DEMO-101', seeded: true, placedAt: Date.now() - 26 * h,
        customer: 'Efua Boakye', phone: '030 277 4410', method: 'delivery', area: 'East Legon',
        payment: { type: 'momo', network: 'MTN MoMo', number: '024 xxx 4410', status: 'Paid' },
        items: [{ name: 'KTip Fusion Bundle — 100g', price: 1850, qty: 1, cat: 'extensions' }],
        subtotal: 1850, deliveryFee: 30, total: 1880,
        status: 'Out for delivery',
        timeline: [
          { status: 'Order placed', at: Date.now() - 26 * h },
          { status: 'Confirmed', at: Date.now() - 24 * h },
          { status: 'Out for delivery', at: Date.now() - 3 * h }
        ]
      },
      {
        id: 'BES-DEMO-102', seeded: true, placedAt: Date.now() - 8 * h,
        customer: 'Adjoa Serwaa', phone: '024 118 7745', method: 'pickup', area: '',
        payment: { type: 'pickup', network: '', number: '', status: 'Pay on pickup' },
        items: [
          { name: 'HD Lace Frontal — 13×4', price: 1350, qty: 1, cat: 'closures' },
          { name: 'K18 Molecular Repair Leave-In', price: 650, qty: 1, cat: 'care' }
        ],
        subtotal: 2000, deliveryFee: 0, total: 2000,
        status: 'Confirmed',
        timeline: [
          { status: 'Order placed', at: Date.now() - 8 * h },
          { status: 'Confirmed', at: Date.now() - 7 * h }
        ]
      },
      {
        id: 'BES-DEMO-103', seeded: true, placedAt: Date.now() - 2 * h,
        customer: 'Yaa Pokuaa', phone: '027 233 8181', method: 'delivery', area: 'Madina',
        payment: { type: 'momo', network: 'Telecel Cash', number: '020 xxx 8181', status: 'Paid' },
        items: [
          { name: 'Satin-Lined Bonnet', price: 120, qty: 2, cat: 'accessories' },
          { name: 'Flax Seed + Aloe Hair Mask', price: 190, qty: 1, cat: 'care' }
        ],
        subtotal: 430, deliveryFee: 30, total: 460,
        status: 'Order placed',
        timeline: [{ status: 'Order placed', at: Date.now() - 2 * h }]
      },
      {
        id: 'BES-DEMO-104', seeded: true, placedAt: Date.now() - 50 * h,
        customer: 'Linda Mensah', phone: '055 302 6614', method: 'pickup', area: '',
        payment: { type: 'momo', network: 'MTN MoMo', number: '055 xxx 6614', status: 'Paid' },
        items: [{ name: 'Glueless Unit — Body Wave', price: 2400, qty: 1, cat: 'wigs' }],
        subtotal: 2400, deliveryFee: 0, total: 2400,
        status: 'Picked up',
        timeline: [
          { status: 'Order placed', at: Date.now() - 50 * h },
          { status: 'Confirmed', at: Date.now() - 49 * h },
          { status: 'Ready for pickup', at: Date.now() - 30 * h },
          { status: 'Picked up', at: Date.now() - 27 * h }
        ]
      }
    ];
    saveOrders(list.concat(seeds));
  }

  /* ---------- Change notifications ----------
     Same-tab listeners re-render immediately; other tabs get the
     browser's native `storage` event. */
  var listeners = [];
  function notify() { listeners.forEach(function (fn) { fn(); }); }
  function onChange(fn) {
    listeners.push(fn);
    window.addEventListener('storage', function (e) {
      if (e.key === CART_KEY || e.key === ORDERS_KEY) fn();
    });
  }

  /* ---------- Floating cart bar (shop pages) ---------- */
  function renderCartBar() {
    var bar = document.querySelector('.cart-bar');
    if (!bar) {
      bar = document.createElement('a');
      bar.className = 'cart-bar';
      bar.href = './checkout.html';
      bar.setAttribute('aria-label', 'View cart and checkout');
      document.body.appendChild(bar);
    }
    var n = cartCount();
    bar.classList.toggle('is-shown', n > 0);
    bar.innerHTML =
      '<span class="cart-bar-count">' + n + '</span>' +
      '<span class="cart-bar-label">' + (n === 1 ? '1 item in your bag' : n + ' items in your bag') + '</span>' +
      '<span class="cart-bar-total">' + money(cartTotal()) + '</span>' +
      '<span class="cart-bar-cta">Checkout' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  }

  function toast(msg) {
    var t = document.querySelector('.store-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'store-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('is-shown');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('is-shown'); }, 2200);
  }

  window.BesiaStore = {
    money: money,
    getCart: getCart, addItem: addItem, setQty: setQty, removeItem: removeItem,
    clearCart: clearCart, cartCount: cartCount, cartTotal: cartTotal,
    createOrder: createOrder, getOrders: getOrders, getOrder: getOrder,
    updateStatus: updateStatus, markPaid: markPaid, statusFlow: statusFlow,
    seedOrders: seedOrders, onChange: onChange,
    renderCartBar: renderCartBar, toast: toast
  };
})();
