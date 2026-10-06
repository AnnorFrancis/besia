/* ============================================================
   BĒSIA, site.js
   The shared behaviour of the issue: the masthead, the Contents
   sheet, one scroll lock, reveals, counters, the Book count, the
   open-now line, small helpers. Replaces main.js.

   Rules this file keeps:
   - one owner of navigation (nothing here prevents a link's default;
     the browser navigates, View Transitions animate)
   - every document-level listener leaves when e.defaultPrevented
   - features talk through besia:* events
   - storage is always wrapped
   ============================================================ */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement, body = doc.body;
  var fxLite = html.getAttribute('data-fx') === 'lite';
  var reduce = html.hasAttribute('data-reduce');

  function store(kind, key, val) {
    try {
      var s = kind === 'local' ? localStorage : sessionStorage;
      if (val === undefined) return s.getItem(key);
      if (val === null) s.removeItem(key); else s.setItem(key, val);
    } catch (e) { return null; }
  }
  function emit(name, detail) { doc.dispatchEvent(new CustomEvent(name, { detail: detail || {} })); }

  /* ---------- one counted scroll lock ---------- */
  var locks = {};
  function lockScroll(name, on) {
    if (on) locks[name] = true; else delete locks[name];
    body.classList.toggle('is-locked', Object.keys(locks).length > 0);
  }
  window.BESIA_SITE = { lockScroll: lockScroll, emit: emit };

  /* ---------- the masthead ---------- */
  var nav = doc.querySelector('.site-nav');
  var sentinel = doc.querySelector('.nav-sentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { rootMargin: '-24px 0px 0px 0px', threshold: 0 }).observe(sentinel);
  } else if (nav) {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
    window.addEventListener('scroll', function () { nav.classList.toggle('is-stuck', window.scrollY > 24); }, { passive: true });
  }
  /* Hide on the way down, return on the way up, phones only. */
  var lastY = window.scrollY, ticking = false;
  window.addEventListener('scroll', function () {
    if (!nav || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (window.innerWidth < 1024) {
        if (y > 360 && y > lastY + 8) nav.classList.add('is-hidden');
        else if (y < lastY - 8 || y < 120) nav.classList.remove('is-hidden');
      } else nav.classList.remove('is-hidden');
      lastY = y; ticking = false;
    });
  }, { passive: true });

  /* Progress hairline from a click to the page swap. Nothing is prevented. */
  doc.addEventListener('click', function (e) {
    if (e.defaultPrevented || !nav) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^(https?:|mailto:|tel:|whatsapp:|javascript:)/i.test(href)) return;
    if (a.hasAttribute('download')) return;
    nav.classList.add('is-leaving');
  });
  window.addEventListener('pageshow', function () { if (nav) nav.classList.remove('is-leaving'); });

  /* ---------- Contents ---------- */
  var toggle = doc.querySelector('.nav-toggle');
  var overlay = doc.querySelector('.nav-overlay');
  var main = doc.getElementById('main');
  var footer = doc.querySelector('.site-footer');
  var lastFocus = null;
  function setInert(on) {
    [main, footer].forEach(function (el) { if (!el) return; if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
  }
  var openedAt = 0;
  function openContents(fromHistory) {
    if (!overlay || overlay.classList.contains('is-open')) return;
    openedAt = Date.now();
    lastFocus = doc.activeElement;
    overlay.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close contents');
    lockScroll('contents', true);
    setInert(true);
    emit('besia:sheet', { name: 'contents', open: true });
    if (!fromHistory && window.history && history.pushState) history.pushState({ besiaSheet: 'contents' }, '');
    var first = overlay.querySelector('a, button');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeContents(fromHistory) {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open contents');
    lockScroll('contents', false);
    setInert(false);
    emit('besia:sheet', { name: 'contents', open: false });
    if (!fromHistory && history.state && history.state.besiaSheet === 'contents') history.back();
    if (lastFocus && lastFocus.focus) lastFocus.focus(); else toggle.focus();
  }
  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      if (overlay.classList.contains('is-open')) closeContents(); else openContents();
    });
    overlay.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      /* a Book link opens the booking sheet (booking-cart claims it in capture) */
      if (a.hasAttribute('data-book') || a.hasAttribute('data-open-chat')) { closeContents(); return; }
      /* same page: just close */
      if (a.getAttribute('href') === location.pathname.split('/').pop()) { e.preventDefault(); closeContents(); return; }
      closeContents();
    });
    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = overlay.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); toggle.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); toggle.focus(); }
    });
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !e.shiftKey && overlay.classList.contains('is-open')) {
        e.preventDefault(); var first = overlay.querySelector('a[href], button'); if (first) first.focus();
      }
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeContents(); });
    /* Back closes the sheet. A history step that lands within a breath of
       the sheet opening belongs to whatever closed just before it. */
    window.addEventListener('popstate', function () {
      if (Date.now() - openedAt < 400) return;
      if (overlay.classList.contains('is-open')) closeContents(true);
    });
  }

  /* ---------- "Ask the studio" rows open the chat without the bubble.
     The chat script (21 KB) is fetched only when somebody asks. ---------- */
  var chatLoading = null;
  doc.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    var a = e.target.closest('[data-open-chat]');
    if (!a) return;
    e.preventDefault();
    var openIt = function () { var fab = doc.querySelector('.chat-fab'); if (fab) fab.click(); };
    if (doc.querySelector('.chat-fab')) { openIt(); return; }
    if (!chatLoading) {
      chatLoading = new Promise(function (res, rej) {
        var s = doc.createElement('script'); s.src = './js/ai-chat.js'; s.onload = res; s.onerror = rej; doc.head.appendChild(s);
      });
    }
    chatLoading.then(function () { setTimeout(openIt, 50); }).catch(function () { chatLoading = null; });
  });

  /* ---------- the Book count ---------- */
  function bookCount() {
    var n = 0;
    try { var raw = JSON.parse(store('local', 'besia-picked') || '[]'); n = Array.isArray(raw) ? raw.length : 0; } catch (e) {}
    doc.querySelectorAll('[data-book-count]').forEach(function (el) { el.textContent = n ? ' · ' + n : ''; });
  }
  bookCount();
  window.addEventListener('storage', bookCount);
  doc.addEventListener('click', function () { setTimeout(bookCount, 30); });
  doc.addEventListener('besia:sheet', bookCount);

  /* ---------- reveals: one observer ---------- */
  var reveals = doc.querySelectorAll('[data-reveal], [data-reveal-stagger], [data-unveil]');
  if ('IntersectionObserver' in window && reveals.length && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-inview');
        io.unobserve(en.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-inview'); });
  }

  /* ---------- counters ---------- */
  var counters = doc.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; cio.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count')), start = null, dur = 1600;
        if (reduce || fxLite) { el.textContent = target.toLocaleString(); return; }
        (function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- open now ---------- */
  doc.querySelectorAll('[data-open-pill]').forEach(function (host) {
    var now = new Date();
    var open = window.BESIA && BESIA.isOpenNow ? BESIA.isOpenNow(now) : (now.getDay() !== 0 && now.getHours() >= 9 && now.getHours() < 19);
    host.textContent = open ? 'Open now, until 7pm' : (now.getDay() === 6 && now.getHours() >= 19 ? 'Closed, opens Monday 9am' : 'Closed, opens 9am');
    host.classList.toggle('is-closed', !open);
  });

  /* ---------- small helpers ---------- */
  doc.querySelectorAll('.newsletter-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input'), note = form.parentElement.querySelector('.newsletter-note');
      if (input && input.value.indexOf('@') > 0) { if (note) note.textContent = 'Thank you, you are on the list.'; input.value = ''; }
      else if (note) note.textContent = 'Please enter a valid email address.';
    });
  });
  doc.querySelectorAll('.field input, .field select, .field textarea').forEach(function (el) {
    var sync = function () { var f = el.closest('.field'); if (f) f.classList.toggle('is-filled', !!el.value); };
    el.addEventListener('input', sync); el.addEventListener('change', sync); sync();
  });
  doc.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- tap to skip the intro ---------- */
  if (html.classList.contains('intro')) {
    var veil = doc.querySelector('.intro-veil');
    var endIntro = function () { html.classList.remove('intro'); if (veil) veil.remove(); };
    setTimeout(endIntro, 2200);                    /* hard kill */
    doc.addEventListener('pointerdown', endIntro, { once: true });
    doc.addEventListener('keydown', endIntro, { once: true });
  }

  /* ---------- GSAP, desktop pointer only, after idle ---------- */
  if (body.hasAttribute('data-gsap') && !fxLite && !reduce &&
      matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) {
    var load = function (src) {
      return new Promise(function (res, rej) { var s = doc.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; doc.head.appendChild(s); });
    };
    var go = function () {
      load('./js/vendor/gsap.min.js').then(function () { return load('./js/vendor/ScrollTrigger.min.js'); })
        .then(function () { emit('besia:gsap'); }).catch(function () {});
    };
    window.addEventListener('load', function () {
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 4000 }); else setTimeout(go, 1500);
    });
  }
})();

/* ============================================================
   Visible motion: word-rise headlines, desktop parallax
   ============================================================ */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = html.hasAttribute('data-reduce');
  var fxLite = html.getAttribute('data-fx') === 'lite';

  /* Wrap each word of a headline so it can rise into place. Runs before
     the reveal observer sees the element, so the first paint is the
     wrapped markup and nothing jumps. */
  if (!reduce) {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      if (el.querySelector('.w')) return;
      var nodes = Array.prototype.slice.call(el.childNodes);
      var out = document.createDocumentFragment();
      nodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); out.appendChild(w);
          });
        } else if (n.nodeName === 'BR') {
          out.appendChild(document.createElement('br'));
        } else {
          var w2 = document.createElement('span'); w2.className = 'w';
          var i2 = document.createElement('span'); i2.appendChild(n.cloneNode(true));
          w2.appendChild(i2); out.appendChild(w2);
        }
      });
      el.textContent = ''; el.appendChild(out);
      el.classList.add('is-split-ready');
      if (!el.hasAttribute('data-reveal')) {
        /* give it the same observer treatment as a reveal */
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { el.classList.add('is-inview'); io.disconnect(); } }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
          io.observe(el);
        } else el.classList.add('is-inview');
      }
    });
  }

  /* Parallax on desktop: plates drift a little slower than the page. */
  document.addEventListener('besia:gsap', function () {
    if (!window.gsap || !window.ScrollTrigger || fxLite || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.t-spread > .plate img, .t-spread > .plate-wrap .reel-poster, .t-spread > .plate-wrap .reel-video, .t-opener .plate img, .t-opener .plate-wrap .reel-poster, .t-opener .plate-wrap .reel-video').forEach(function (img) {
      var holder = img.closest('.plate') || img.parentElement;
      gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none',
        scrollTrigger: { trigger: holder, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
    document.querySelectorAll('.cover-card').forEach(function (card) {
      gsap.to(card, { yPercent: 12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: card.closest('.cover'), start: 'top top', end: 'bottom top', scrub: true } });
    });
  });
})();
