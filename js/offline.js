/* ============================================================
   BĒSIA, offline.js
   Registers the service worker, and tells the owner plainly when
   the connection has gone.

   Power cuts and patchy data are normal in Accra. The Studio
   Manager holds real money in real time, so the person using it
   needs to know whether what they are seeing is live, not guess.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- register ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      var base = location.pathname.replace(/\/(admin\/)?[^\/]*$/, '/');
      navigator.serviceWorker.register(base + 'sw.js', { scope: base })
        .then(function (reg) {
          /* A new build is waiting, take it on the next page view. */
          reg.addEventListener('updatefound', function () {
            var sw = reg.installing;
            if (!sw) return;
            sw.addEventListener('statechange', function () {
              if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                sw.postMessage('skip-waiting');
              }
            });
          });
        })
        .catch(function () { /* offline support simply will not be available */ });
    });
  }

  /* ---------- the status pill ---------- */
  var pill = null;
  function ensure() {
    if (pill) return pill;
    pill = document.createElement('div');
    pill.className = 'net-pill';
    pill.setAttribute('role', 'status');
    document.body.appendChild(pill);
    return pill;
  }

  function offline() {
    var p = ensure();
    p.className = 'net-pill is-off is-in';
    p.innerHTML = '<span class="net-dot"></span>' +
      '<span><strong>No internet.</strong> You can carry on, everything you enter is ' +
      'saved on this device and will be here when you are back online.</span>';
  }

  function online() {
    if (!pill) return;
    pill.className = 'net-pill is-on is-in';
    pill.innerHTML = '<span class="net-dot"></span><span>Back online.</span>';
    setTimeout(function () {
      if (pill) { pill.classList.remove('is-in'); }
    }, 3200);
  }

  window.addEventListener('offline', offline);
  window.addEventListener('online', online);
  if (!navigator.onLine) offline();

})();
