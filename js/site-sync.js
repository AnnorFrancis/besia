/* ============================================================
   BĒSIA — site-sync.js
   Makes the public website obey the Studio Manager.

   The pages ship as finished HTML, which is what search engines
   read and what paints first. This script then applies whatever
   the owner has changed since:

     · takes down anything unpublished
     · shows changed prices
     · shows a discount, with the old price struck through
     · marks new arrivals
     · marks a finished product sold out and stops it being ordered
     · adds items created in the manager
     · keeps the "from" figure on every service tile honest

   It reacts live: change something in the manager with the
   website open in another tab and the page updates itself.
   ============================================================ */
(function () {
  'use strict';

  var B = window.BESIA;
  if (!B || !B.live) return;

  var money = B.money;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- badges ---------- */
  function badge(cls, text) {
    var b = document.createElement('span');
    b.className = 'live-flag live-flag--' + cls;
    b.textContent = text;
    return b;
  }
  function clearFlags(scope) {
    scope.querySelectorAll('.live-flag, .live-was').forEach(function (n) { n.remove(); });
  }

  /* ---------- price rendering ---------- */
  function priceHTML(item) {
    if (item.was && item.was !== item.price) {
      return '<span class="live-was">' + money(item.was) + '</span> ' + money(item.price);
    }
    return money(item.price);
  }

  /* =========================================================
     SHOP
     ========================================================= */
  function syncShop() {
    var grid = document.getElementById('shop-grid');
    if (!grid) return;

    var live = {};
    B.live.products().forEach(function (p) { live[p.name] = p; });

    /* existing cards */
    grid.querySelectorAll('.product-card[data-item]').forEach(function (card) {
      var item = live[card.getAttribute('data-item')];
      if (!item) { card.remove(); return; }
      applyProductCard(card, item);
      delete live[item.name];
    });

    /* anything the owner added in the manager */
    Object.keys(live).forEach(function (name) {
      var item = live[name];
      if (!item.added) return;
      grid.appendChild(buildProductCard(item));
    });

    /* if a filter is active, re-apply it so new cards obey it */
    var active = document.querySelector('[data-shop-filter].is-active');
    if (active) active.click();
  }

  function applyProductCard(card, item) {
    card.hidden = !item.published;
    if (!item.published) return;

    clearFlags(card);

    var priceSlot = card.querySelector('[data-price-slot]');
    if (priceSlot) priceSlot.innerHTML = priceHTML(item);

    var imgWrap = card.querySelector('.product-img');
    if (imgWrap) {
      if (item.isNew) imgWrap.appendChild(badge('new', 'New in'));
      if (item.discount) {
        imgWrap.appendChild(badge('deal', item.discount.kind === 'percent'
          ? item.discount.value + '% off' : money(item.discount.value) + ' off'));
      }
      if (item.soldOut) imgWrap.appendChild(badge('out', 'Sold out'));
    }

    var btn = card.querySelector('[data-add]');
    if (btn) {
      btn.setAttribute('data-add', item.name + '|' + item.price);
      if (item.soldOut) {
        btn.disabled = true;
        btn.textContent = 'Sold out';
        btn.classList.add('is-out');
      } else {
        btn.disabled = false;
        btn.classList.remove('is-out');
        var raw = item.raw || {};
        btn.textContent = raw.preorder ? 'Pre-order' : 'Add to Cart';
      }
    }
  }

  function buildProductCard(item) {
    var raw = item.raw || {};
    var catLabel = (B.productCategories.filter(function (c) { return c.key === item.cat; })[0] || {}).label || '';
    var art = document.createElement('article');
    art.className = 'product-card';
    art.setAttribute('data-cat', item.cat);
    art.setAttribute('data-kind', 'product');
    art.setAttribute('data-item', item.name);
    art.innerHTML =
      '<div class="product-img">' +
        '<img src="./' + esc(raw.img || 'images/accessories/acc-1.jpg') + '" alt="' + esc(item.name) +
        '" width="700" height="875" loading="lazy" decoding="async">' +
        '<span class="product-tag">' + esc(catLabel) + '</span>' +
      '</div>' +
      '<div class="product-body">' +
        '<h3 class="product-name">' + esc(item.name) + '</h3>' +
        '<p class="product-blurb">' + esc(raw.blurb || '') + '</p>' +
        '<div class="product-price" data-price-slot></div>' +
        '<div class="product-cta" data-cta-slot>' +
          '<button class="btn btn--ghost-dark" type="button" data-add="' + esc(item.name) + '|' + item.price + '">Add to Cart</button>' +
        '</div>' +
      '</div>';
    applyProductCard(art, item);
    return art;
  }

  /* =========================================================
     SERVICES — price list and tiles
     ========================================================= */
  function syncServices() {
    var rows = document.querySelectorAll('.price-row[data-item]');
    if (!rows.length && !document.querySelector('[data-svc-cat]')) return;

    var live = {};
    B.live.services().forEach(function (s) { live[s.name] = s; });

    rows.forEach(function (row) {
      var item = live[row.getAttribute('data-item')];
      if (!item) { row.remove(); return; }
      row.hidden = !item.published;
      if (!item.published) return;
      clearFlags(row);
      var slot = row.querySelector('[data-price-slot]');
      if (slot) {
        /* keep ranges and "from" wording from the published menu intact
           unless the owner has actually set a flat price or a discount */
        var raw = item.raw || {};
        var changed = item.price !== item.basePrice;
        slot.innerHTML = changed ? priceHTML(item)
          : (raw && raw.name ? esc(B.priceLabel(raw)) : money(item.price));
      }
      if (item.isNew) row.querySelector('.name').appendChild(badge('new', 'New'));
    });

    /* group counts follow whatever is still showing */
    document.querySelectorAll('.price-group').forEach(function (g) {
      var shown = g.querySelectorAll('.price-row:not([hidden])').length;
      var slot = g.querySelector('[data-count-slot]');
      if (slot) slot.textContent = shown;
      g.hidden = shown === 0;
    });

    /* every tile's "from" figure, recomputed from what is published */
    document.querySelectorAll('[data-svc-cat]').forEach(function (tile) {
      var key = tile.getAttribute('data-svc-cat');
      var inCat = B.live.published(B.live.services()).filter(function (s) { return s.cat === key; });
      var slot = tile.querySelector('[data-from-slot]');
      if (!inCat.length) { tile.hidden = true; return; }
      tile.hidden = false;
      if (slot) {
        var low = Math.min.apply(null, inCat.map(function (s) { return s.price; }).filter(function (n) { return n > 0; }));
        if (isFinite(low)) slot.innerHTML = '<em>From</em> ' + money(low);
      }
    });
  }

  /* =========================================================
     HOME — teaser "from" figures follow the same rule
     ========================================================= */
  function syncTeasers() {
    document.querySelectorAll('.svc-card .text-link[href*="services.html#"]').forEach(function (a) {
      var slug = (a.getAttribute('href').split('#')[1] || '');
      var cat = (B.serviceCategories.filter(function (c) { return c.slug === slug; })[0] || {}).key;
      if (!cat) return;
      var inCat = B.live.published(B.live.services()).filter(function (s) { return s.cat === cat; });
      if (!inCat.length) return;
      var low = Math.min.apply(null, inCat.map(function (s) { return s.price; }).filter(function (n) { return n > 0; }));
      if (isFinite(low)) a.textContent = 'From ' + money(low);
    });
  }

  /* =========================================================
     PACKAGES — the builder options carry their own price in the
     markup, so they have to follow the manager too. An option for
     something taken off the website is removed rather than left
     sitting there quotable.
     ========================================================= */
  function syncBuilder() {
    var opts = document.querySelectorAll('.builder-opt[data-name]');
    if (!opts.length) return;

    opts.forEach(function (opt) {
      var item = B.live.find('service', opt.getAttribute('data-name'));
      if (!item || !item.published) {
        var box = opt.querySelector('input');
        if (box) { box.checked = false; box.disabled = true; }
        opt.hidden = true;
        return;
      }
      opt.hidden = false;
      var box2 = opt.querySelector('input');
      if (box2) box2.disabled = false;
      opt.setAttribute('data-price', item.price);
      var slot = opt.querySelector('.builder-opt-price');
      if (slot) {
        slot.innerHTML = item.was && item.was !== item.price
          ? '<span class="live-was">' + money(item.was) + '</span> ' + money(item.price)
          : money(item.price);
      }
    });

    /* the three package cards quote a single service each */
    document.querySelectorAll('.pkg-card').forEach(function (card) {
      var nameEl = card.querySelector('.pkg-name');
      var amt = card.querySelector('.pkg-price .amount');
      if (!nameEl || !amt) return;
      var item = B.live.find('service', nameEl.textContent.trim());
      if (!item) return;
      if (!item.published) { card.hidden = true; return; }
      card.hidden = false;
      if (item.price !== item.basePrice) {
        amt.setAttribute('data-count', item.price);
        amt.textContent = item.price.toLocaleString('en-GB');
      }
    });
  }

  /* =========================================================
     BOOKING FORM — do not offer a discipline that has nothing
     published left in it.
     ========================================================= */
  function syncBookingPills() {
    var pills = document.querySelectorAll('.check-pill input[value]');
    if (!pills.length) return;
    pills.forEach(function (box) {
      var cat = (B.serviceCategories.filter(function (c) { return c.slug === box.value; })[0] || {}).key;
      if (!cat) return;
      var left = B.live.published(B.live.services())
        .filter(function (s) { return s.cat === cat; }).length;
      var pill = box.closest('.check-pill');
      if (!pill) return;
      if (!left) { box.checked = false; box.disabled = true; pill.hidden = true; }
      else { box.disabled = false; pill.hidden = false; }
    });
    /* if everything the customer had ticked went away, tick the first one left */
    var form = document.getElementById('booking-form') || document.querySelector('form');
    if (form && !form.querySelector('.check-pill input:checked')) {
      var first = form.querySelector('.check-pill:not([hidden]) input');
      if (first) { first.checked = true; first.closest('.check-pill').classList.add('is-checked'); }
    }
  }

  /* =========================================================
     A running offer, announced once at the top of the page
     ========================================================= */
  function syncBanner() {
    var text = B.live.bannerText();
    var bar = document.getElementById('live-offer');
    if (!text) { if (bar) bar.remove(); measureOffer(); return; }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'live-offer';
      bar.className = 'offer-bar';
      bar.setAttribute('role', 'status');
      var nav = document.querySelector('.site-nav');
      if (nav && nav.parentNode) nav.parentNode.insertBefore(bar, nav);
      else document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.innerHTML = '<span class="offer-dot" aria-hidden="true"></span>' + esc(text);
    document.body.classList.add('has-offer');
    measureOffer();
  }

  /* The bar is fixed, so the nav and the page have to be pushed down by
     exactly its height — which changes when the text wraps on a phone. */
  function measureOffer() {
    var bar = document.getElementById('live-offer');
    if (!bar) {
      document.body.classList.remove('has-offer');
      document.documentElement.style.removeProperty('--offer-h');
      return;
    }
    document.documentElement.style.setProperty('--offer-h', bar.offsetHeight + 'px');

    /* The bar shrinks once the webfont swaps in, and grows when the text
       wraps on a narrow phone. Watch it rather than measuring once. */
    if (window.ResizeObserver && !bar.__watched) {
      bar.__watched = true;
      new ResizeObserver(function () {
        document.documentElement.style.setProperty('--offer-h', bar.offsetHeight + 'px');
      }).observe(bar);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var b = document.getElementById('live-offer');
        if (b) document.documentElement.style.setProperty('--offer-h', b.offsetHeight + 'px');
      });
    }
  }

  /* ---------- run, and keep running ---------- */
  function syncAll() {
    try { syncBanner(); } catch (e) {}
    try { syncShop(); } catch (e) {}
    try { syncServices(); } catch (e) {}
    try { syncTeasers(); } catch (e) {}
    try { syncBuilder(); } catch (e) {}
    try { syncBookingPills(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAll);
  } else {
    syncAll();
  }
  B.live.onChange(syncAll);
  window.addEventListener('resize', measureOffer);

})();
