/* ============================================================
   BĒSIA, reel.js
   Every film on the site, under one controller.

   Markup (emitted by tools/lib/reel.js so it cannot drift):
     <figure class="reel plate" data-reel="entry-film" data-mode="once"
             data-src-sm="…-480.mp4?v=x" data-src-lg="…-720.mp4?v=x">
       <img class="reel-poster" …>
       <video class="reel-video" muted playsinline preload="none" aria-hidden="true" tabindex="-1"></video>
       <button class="reel-ctl" …>pause / play / replay</button>
     </figure>

   Rules:
   - the poster is always painted first; a film that never arrives
     leaves a photograph, never a hole
   - a film gets its src 150px before it is in view, and at most two
     films hold a src at once (older ones give theirs back, so a cheap
     phone's few decoders are never exhausted)
   - one film plays at a time: the one nearest the middle of the screen
   - mode once plays through and holds its last frame, with Replay;
     mode loop repeats; mode tap only plays when asked
   - the user's pause is remembered; the tab going hidden, the page
     leaving, or any sheet opening (besia:sheet) pauses everything
   - a play() refusal (iOS Low Power Mode) shows the Play button
   - lite tier (Save-Data, 2g, reduced motion): no film loads until the
     visitor taps Play
   ============================================================ */
(function () {
  'use strict';
  var html = document.documentElement;
  var lite = html.getAttribute('data-fx') === 'lite';
  var reels = Array.prototype.slice.call(document.querySelectorAll('[data-reel]'));
  if (!reels.length) return;

  var MAX_SRC = 2;
  var loaded = [];          /* reels holding a src, oldest first */
  var sheetOpen = false;

  function setState(fig, state) {
    ['is-idle', 'is-ready', 'is-playing', 'is-paused', 'is-held', 'is-blocked'].forEach(function (c) { fig.classList.remove(c); });
    fig.classList.add(state);
    var btn = fig.querySelector('.reel-ctl');
    if (!btn) return;
    var label = state === 'is-playing' ? 'Pause film' : state === 'is-held' ? 'Play the film again' : 'Play film';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-pressed', state === 'is-playing' ? 'true' : 'false');
  }

  function srcFor(fig) {
    var sm = fig.getAttribute('data-src-sm'), lg = fig.getAttribute('data-src-lg');
    var w = fig.getBoundingClientRect().width || window.innerWidth;
    var dpr = window.devicePixelRatio || 1;
    return (w * dpr > 560 && lg) ? lg : (sm || lg);
  }

  function attach(fig) {
    var v = fig.querySelector('video');
    if (!v || v.getAttribute('src')) return;
    if (loaded.length >= MAX_SRC) release(loaded[0]);
    v.src = srcFor(fig);
    v.muted = true;
    v.loop = fig.getAttribute('data-mode') === 'loop';
    v.load();
    loaded.push(fig);
    fig.classList.add('is-ready');
  }
  function release(fig) {
    var v = fig.querySelector('video');
    if (!v) return;
    try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {}
    loaded = loaded.filter(function (f) { return f !== fig; });
    fig.classList.remove('is-ready');
    if (!fig.classList.contains('is-held')) setState(fig, 'is-idle');
  }

  function play(fig, byUser) {
    var v = fig.querySelector('video');
    if (!v) return;
    if (fig.getAttribute('data-user') === 'paused' && !byUser) return;
    if (fig.getAttribute('data-mode') === 'tap' && !byUser) return;
    attach(fig);
    var p = v.play();
    if (p && p.then) {
      p.then(function () { setState(fig, 'is-playing'); fig.removeAttribute('data-user'); })
       .catch(function () { setState(fig, 'is-blocked'); });
    } else setState(fig, 'is-playing');
  }
  function pause(fig, byUser) {
    var v = fig.querySelector('video');
    if (!v) return;
    v.pause();
    if (byUser) fig.setAttribute('data-user', 'paused');
    if (!fig.classList.contains('is-held')) setState(fig, 'is-paused');
  }

  /* the film nearest the middle of the screen plays, the rest pause */
  var visible = new Map();
  function rank() {
    if (sheetOpen || document.hidden) return;
    var best = null, bestD = Infinity, mid = window.innerHeight / 2;
    visible.forEach(function (ratio, fig) {
      if (ratio <= 0) return;
      var r = fig.getBoundingClientRect();
      var d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bestD) { bestD = d; best = fig; }
    });
    reels.forEach(function (fig) {
      if (fig === best) { if (!fig.classList.contains('is-held') && !fig.classList.contains('is-playing')) play(fig); }
      else if (fig.classList.contains('is-playing')) pause(fig);
    });
  }

  reels.forEach(function (fig) {
    var v = fig.querySelector('video');
    if (!v) return;
    setState(fig, 'is-idle');
    v.addEventListener('ended', function () {
      if (fig.getAttribute('data-mode') !== 'loop') setState(fig, 'is-held');
    });
    v.addEventListener('playing', function () { if (!fig.classList.contains('is-held')) setState(fig, 'is-playing'); });
    var btn = fig.querySelector('.reel-ctl');
    if (btn) btn.addEventListener('click', function () {
      if (fig.classList.contains('is-held')) { fig.classList.remove('is-held'); v.currentTime = 0; play(fig, true); return; }
      if (fig.classList.contains('is-playing')) pause(fig, true); else play(fig, true);
    });
  });

  /* lite: nothing loads until a tap */
  if (lite) return;

  if ('IntersectionObserver' in window) {
    var near = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) attach(en.target);
      });
    }, { rootMargin: '150px 0px 150px 0px', threshold: 0 });
    var view = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible.set(en.target, en.isIntersecting ? en.intersectionRatio : 0);
        if (!en.isIntersecting && en.target.classList.contains('is-playing')) pause(en.target);
      });
      rank();
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    reels.forEach(function (fig) {
      /* the cover film waits for load so it never competes with fonts and styles */
      if (fig.hasAttribute('data-hero')) {
        window.addEventListener('load', function () { setTimeout(function () { near.observe(fig); view.observe(fig); }, 150); });
      } else { near.observe(fig); view.observe(fig); }
    });
    var rafScroll = false;
    window.addEventListener('scroll', function () {
      if (rafScroll) return; rafScroll = true;
      requestAnimationFrame(function () { rank(); rafScroll = false; });
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) reels.forEach(function (f) { if (f.classList.contains('is-playing')) pause(f); });
    else rank();
  });
  window.addEventListener('pagehide', function () { reels.forEach(function (f) { if (f.classList.contains('is-playing')) pause(f); }); });
  document.addEventListener('besia:sheet', function (e) {
    sheetOpen = !!(e.detail && e.detail.open);
    if (sheetOpen) reels.forEach(function (f) { if (f.classList.contains('is-playing')) pause(f); });
    else rank();
  });

  /* "Watch the film": a dialog with sound and native controls */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    var a = e.target.closest('[data-watch]');
    if (!a) return;
    e.preventDefault();
    var src = a.getAttribute('data-watch');
    var dlg = document.querySelector('.film-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'film-dialog';
      dlg.innerHTML = '<video controls playsinline></video><button type="button" class="film-dialog-close" aria-label="Close">×</button>';
      document.body.appendChild(dlg);
      dlg.querySelector('.film-dialog-close').addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('close', function () { var v = dlg.querySelector('video'); v.pause(); v.removeAttribute('src'); v.load(); document.dispatchEvent(new CustomEvent('besia:sheet', { detail: { name: 'film', open: false } })); });
      dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
    }
    var v = dlg.querySelector('video');
    v.src = src; v.muted = false;
    document.dispatchEvent(new CustomEvent('besia:sheet', { detail: { name: 'film', open: true } }));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    v.play().catch(function () {});
  });
})();
