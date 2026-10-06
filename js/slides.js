/* ============================================================
   BĒSIA, slides.js
   An editorial slideshow: crossfade, six seconds a slide, a slow
   push on the active picture, Pause first in the tab order.

   Markup:
     <div class="slides" data-slides data-interval="6000">
       <div class="slide is-active"><img src="…"></div>
       <div class="slide"><img data-src="…"></div>   (lazy: set on activation)
       <div class="slides-ctl"><button data-slides-toggle>…</button>
         <button data-slides-prev>…</button><button data-slides-next>…</button>
         <span class="slides-count">01 / 04</span></div>
       <div class="slides-bar"></div>
     </div>
   Pauses on hover, focus, hidden tab, off screen. Reduced motion and
   the lite tier start paused.
   ============================================================ */
(function () {
  'use strict';
  var html = document.documentElement;
  var lite = html.getAttribute('data-fx') === 'lite';
  document.querySelectorAll('[data-slides]').forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
    if (slides.length < 2) return;
    var i = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
    var interval = parseInt(root.getAttribute('data-interval'), 10) || 6000;
    var timer = 0, running = false, inView = true, hover = false;
    var count = root.querySelector('.slides-count');
    var bar = root.querySelector('.slides-bar');
    var toggle = root.querySelector('[data-slides-toggle]');

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function load(n) {
      var img = slides[n] && slides[n].querySelector('img[data-src]');
      if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    }
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      load(i); load((i + 1) % slides.length);
      if (count) count.textContent = pad(i + 1) + ' / ' + pad(slides.length);
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      root.dispatchEvent(new CustomEvent('slides:change', { detail: { index: i } }));
    }
    function tick() { show(i + 1); }
    function start() {
      if (running) return;
      running = true; root.classList.add('is-running'); root.classList.remove('is-paused');
      if (toggle) { toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-label', 'Pause slideshow'); }
      clearInterval(timer); timer = setInterval(tick, interval);
    }
    function stop(user) {
      running = false; root.classList.remove('is-running'); root.classList.add('is-paused');
      if (toggle) { toggle.setAttribute('aria-pressed', 'true'); toggle.setAttribute('aria-label', 'Play slideshow'); }
      clearInterval(timer);
      if (user) root.setAttribute('data-user', 'paused');
    }
    function maybe() {
      if (root.getAttribute('data-user') === 'paused') return;
      if (inView && !hover && !document.hidden) start(); else stop();
    }

    show(i);
    if (toggle) toggle.addEventListener('click', function () { if (running) stop(true); else { root.removeAttribute('data-user'); start(); } });
    var prev = root.querySelector('[data-slides-prev]'), next = root.querySelector('[data-slides-next]');
    if (prev) prev.addEventListener('click', function () { show(i - 1); if (running) start(); });
    if (next) next.addEventListener('click', function () { show(i + 1); if (running) start(); });
    root.addEventListener('mouseenter', function () { hover = true; maybe(); });
    root.addEventListener('mouseleave', function () { hover = false; maybe(); });
    root.addEventListener('focusin', function () { hover = true; maybe(); });
    root.addEventListener('focusout', function () { hover = false; maybe(); });
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
    var x0 = null;
    root.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    root.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1); });
    document.addEventListener('visibilitychange', maybe);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; maybe(); }, { threshold: 0.3 }).observe(root);
    }
    if (lite) stop(true); else maybe();
  });
})();
