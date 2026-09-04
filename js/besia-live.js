/* ============================================================
   BĒSIA — besia-live.js
   THE LINK BETWEEN THE STUDIO MANAGER AND THE WEBSITE.

   js/besia-data.js is the baseline — the menu and catalogue as
   first published. This file layers on top of it everything the
   owner has since changed in the Studio Manager:

     · items published or taken off the website
     · prices changed
     · new items added
     · items flagged as a new arrival
     · discounts, running or paused
     · stock, so a finished item cannot be ordered

   Every page — public and manager — reads the catalogue through
   here, so the website can never show something the manager has
   hidden, or a price the manager has changed.

   In production the override store below becomes database rows
   and this file becomes the API client. Nothing else changes.
   ============================================================ */
(function (root) {
  'use strict';

  var B = root.BESIA;
  if (!B) return;

  var K_CAT   = B.key('catalogue');
  var K_DISC  = B.key('discounts');
  var K_STOCK = B.key('stock');

  /* ---------- storage ---------- */
  function read(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return (v === null || v === undefined) ? fallback : v;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    notify();
  }

  function overrides() {
    var o = read(K_CAT, null);
    if (!o || typeof o !== 'object') o = {};
    o.services = o.services || {};
    o.products = o.products || {};
    o.addedServices = o.addedServices || [];
    o.addedProducts = o.addedProducts || [];
    return o;
  }
  function saveOverrides(o) { write(K_CAT, o); }

  /* ---------- change notification ----------
     Same tab re-renders straight away; another tab gets the
     browser's own storage event. The website picks up a change
     the owner makes in the manager without a reload. */
  var listeners = [];
  function notify() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }
  function onChange(fn) {
    listeners.push(fn);
    window.addEventListener('storage', function (e) {
      if (e.key === K_CAT || e.key === K_DISC || e.key === K_STOCK) fn();
    });
  }

  /* ---------- discounts ---------- */
  function discounts() {
    var list = read(K_DISC, null);
    if (list === null) { list = seedDiscounts(); write(K_DISC, list); }
    return Array.isArray(list) ? list : [];
  }
  function seedDiscounts() {
    return [{
      id: 'D-1001',
      label: 'Treatment week — 15% off scalp and bond repair',
      kind: 'percent', value: 15,
      scope: 'category', target: 'Scalp + Bond Repair Treatments',
      active: false
    }];
  }
  function saveDiscounts(list) { write(K_DISC, list); }

  /* The best running discount that applies to one item. */
  function discountFor(item) {
    var best = null;
    discounts().forEach(function (d) {
      if (!d.active) return;
      var hits =
        d.scope === 'all' ? true :
        d.scope === 'category' ? (item.cat === d.target) :
        d.scope === 'item' ? (item.name === d.target) : false;
      if (!hits) return;
      var off = d.kind === 'percent'
        ? Math.round(item.price * d.value / 100)
        : Math.min(d.value, item.price);
      if (off > 0 && (!best || off > best.off)) best = { off: off, rule: d };
    });
    return best;
  }

  /* ---------- stock ---------- */
  function stock() { return read(K_STOCK, {}); }
  function stockOf(name) {
    var s = stock();
    return Object.prototype.hasOwnProperty.call(s, name) ? s[name] : null;
  }

  /* ---------- the live catalogue ---------- */
  function decorate(base, over, kind) {
    var o = over[base.name] || {};
    var price = (typeof o.price === 'number') ? o.price : base.basePrice;
    var item = {
      kind: kind,
      name: base.name,
      cat: base.cat,
      price: price,
      basePrice: base.basePrice,
      published: o.published !== false,
      isNew: !!o.isNew,
      added: !!base.added,
      raw: base.raw
    };
    var d = discountFor(item);
    item.discount = d ? d.rule : null;
    item.was = d ? price : null;
    item.price = d ? price - d.off : price;
    if (kind === 'product') {
      var left = stockOf(base.name);
      item.stock = left;
      item.soldOut = (left === 0);
    }
    return item;
  }

  function services() {
    var o = overrides();
    var out = B.services.map(function (s) {
      return decorate({ name: s.name, cat: s.cat, basePrice: B.priceOf(s), raw: s }, o.services, 'service');
    });
    o.addedServices.forEach(function (s) {
      out.push(decorate({ name: s.name, cat: s.cat, basePrice: s.price, added: true, raw: s }, o.services, 'service'));
    });
    return out;
  }

  function products() {
    var o = overrides();
    var out = B.products.map(function (p) {
      return decorate({ name: p.name, cat: p.cat, basePrice: p.price, raw: p }, o.products, 'product');
    });
    o.addedProducts.forEach(function (p) {
      out.push(decorate({ name: p.name, cat: p.cat, basePrice: p.price, added: true, raw: p }, o.products, 'product'));
    });
    return out;
  }

  function published(list) { return list.filter(function (i) { return i.published; }); }

  function find(kind, name) {
    var list = kind === 'product' ? products() : services();
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return list[i];
    return null;
  }

  /* ---------- what the manager calls ---------- */
  function bucket(kind) { return kind === 'product' ? 'products' : 'services'; }

  function setFlag(kind, name, patch) {
    var o = overrides();
    var b = bucket(kind);
    o[b][name] = Object.assign({}, o[b][name] || {}, patch);
    /* keep the store tidy: drop an entry that no longer differs */
    var e = o[b][name];
    if (e.published !== false && !e.isNew && typeof e.price !== 'number') delete o[b][name];
    saveOverrides(o);
  }
  function setPublished(kind, name, on) { setFlag(kind, name, { published: !!on }); }
  function setNew(kind, name, on)       { setFlag(kind, name, { isNew: !!on }); }
  function setPrice(kind, name, price)  {
    var n = Number(price);
    if (!isFinite(n) || n < 0) return false;
    setFlag(kind, name, { price: Math.round(n) });
    return true;
  }
  function resetPrice(kind, name) {
    var o = overrides(), b = bucket(kind);
    if (o[b][name]) { delete o[b][name].price; saveOverrides(o); }
  }

  function addItem(kind, item) {
    var o = overrides();
    var key = kind === 'product' ? 'addedProducts' : 'addedServices';
    if (find(kind, item.name)) return false;      /* no duplicate names */
    o[key].push(item);
    saveOverrides(o);
    if (kind === 'product') {
      var s = stock();
      if (!(item.name in s)) { s[item.name] = Number(item.stock) || 0; write(K_STOCK, s); }
    }
    return true;
  }
  function removeAdded(kind, name) {
    var o = overrides();
    var key = kind === 'product' ? 'addedProducts' : 'addedServices';
    o[key] = o[key].filter(function (i) { return i.name !== name; });
    saveOverrides(o);
  }

  function resetAll() {
    try { localStorage.removeItem(K_CAT); localStorage.removeItem(K_DISC); } catch (e) {}
    notify();
  }

  /* ---------- counts the manager shows ---------- */
  function summary() {
    var s = services(), p = products();
    return {
      servicesTotal: s.length,
      servicesHidden: s.filter(function (i) { return !i.published; }).length,
      productsTotal: p.length,
      productsHidden: p.filter(function (i) { return !i.published; }).length,
      newArrivals: s.concat(p).filter(function (i) { return i.isNew && i.published; }).length,
      discountsRunning: discounts().filter(function (d) { return d.active; }).length,
      soldOut: p.filter(function (i) { return i.soldOut; }).length
    };
  }

  /* A single line describing a running discount, for the website. */
  function bannerText() {
    var on = discounts().filter(function (d) { return d.active; });
    if (!on.length) return null;
    return on.map(function (d) { return d.label; }).join(' · ');
  }

  B.live = {
    services: services,
    products: products,
    published: published,
    find: find,
    discounts: discounts,
    saveDiscounts: saveDiscounts,
    discountFor: discountFor,
    bannerText: bannerText,
    stockOf: stockOf,
    setPublished: setPublished,
    setNew: setNew,
    setPrice: setPrice,
    resetPrice: resetPrice,
    addItem: addItem,
    removeAdded: removeAdded,
    resetAll: resetAll,
    summary: summary,
    onChange: onChange
  };

})(typeof window !== 'undefined' ? window : globalThis);
