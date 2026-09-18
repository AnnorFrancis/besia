/* ============================================================
   build-admin.js, builds every Studio Manager page from ONE
   definition, so the sidebar, the header and the one-line
   explanation at the top of each section can never drift apart.

   The body of each page lives in tools/admin-partials/<id>.html.
   On the first run any page that already exists has its body
   lifted out into a partial automatically, so nothing is lost.

   To add a section: add a row to PAGES, drop a partial in, run this.

   Run:  node tools/build-admin.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ADMIN = path.join(ROOT, 'admin');
const PARTIALS = path.join(__dirname, 'admin-partials');

/* ---------- icons (24x24, stroked, one visual family) ---------- */
const ICON = {
  overview:  '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>',
  diary:     '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18" stroke-linecap="round"/>',
  till:      '<path d="M4 9h16l-1 11H5z" stroke-linejoin="round"/><path d="M8 9V6.5A3.5 3.5 0 0 1 15 6.5V9" stroke-linecap="round"/><path d="M9.5 14h5" stroke-linecap="round"/>',
  sales:     '<path d="M4 19V5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1z" stroke-linejoin="round"/><path d="M8 11h8M8 15h5" stroke-linecap="round"/>',
  balances:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4" stroke-linecap="round"/>',
  cash:      '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01" stroke-linecap="round"/>',
  expenses:  '<path d="M12 3v18" stroke-linecap="round"/><path d="M17 7.5C17 5.6 14.8 4.5 12 4.5S7 5.6 7 7.5s2.2 2.6 5 3.2 5 1.4 5 3.3-2.2 3-5 3-5-1.1-5-3" stroke-linecap="round"/>',
  orders:    '<path d="M6 7h12l1.5 13h-15z" stroke-linejoin="round"/><path d="M9 9V6a3 3 0 0 1 6 0v3" stroke-linecap="round"/>',
  stock:     '<path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z" stroke-linejoin="round"/><path d="M3 8.5 12 13l9-4.5M12 13v7" stroke-linejoin="round"/>',
  suppliers: '<rect x="1.5" y="7" width="12" height="9" rx="1.5"/><path d="M13.5 10.5H18l3.5 3v2.5h-8z" stroke-linejoin="round"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  classes:   '<path d="M12 4 2.5 9 12 14l9.5-5z" stroke-linejoin="round"/><path d="M6.5 11.5V17c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-5.5" stroke-linecap="round"/>',
  customers: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" stroke-linecap="round"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 15c2.6.2 4.4 1.7 5 4.5" stroke-linecap="round"/>',
  team:      '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="9" r="2.6"/><path d="M7.5 17c0-2.2 2-3.4 4.5-3.4s4.5 1.2 4.5 3.4" stroke-linecap="round"/>',
  reports:   '<path d="M9 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M8 12h8M8 16h5" stroke-linecap="round"/>',
  activity:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2" stroke-linecap="round"/>',
  prices:    '<path d="M4 6h16M4 12h16M4 18h10" stroke-linecap="round"/><circle cx="18.5" cy="18" r="2.2"/>',
  settings:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.11a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 3.9 16.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H2.5a2 2 0 0 1 0-4h.11a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87L3.76 7A2 2 0 1 1 6.6 4.16l.06.06a1.7 1.7 0 0 0 1.87.34H8.6a1.7 1.7 0 0 0 1-1.55V2.5a2 2 0 0 1 4 0v.11a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 1 1 19.36 6.6l-.06.06a1.7 1.7 0 0 0-.34 1.87v.07a1.7 1.7 0 0 0 1.55 1h.11a2 2 0 0 1 0 4H20.5a1.7 1.7 0 0 0-1.55 1z" stroke-linejoin="round"/>',
  discounts: '<path d="M20.6 12.4 12.4 20.6a2 2 0 0 1-2.83 0l-6.2-6.2A2 2 0 0 1 2.8 13V4.8A2 2 0 0 1 4.8 2.8H13a2 2 0 0 1 1.4.58l6.2 6.2a2 2 0 0 1 0 2.82z" stroke-linejoin="round"/><circle cx="7.6" cy="7.6" r="1.4"/>',
  help:      '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.86.83c0 1.67-2.5 2.5-2.5 2.5" stroke-linecap="round"/><path d="M12 17h.01" stroke-linecap="round" stroke-width="2.4"/>'
};

/* ---------- every section, in nav order ----------
   `nav`   short enough to read at a glance
   `intro` one plain sentence: what this page is for. No jargon. */
const PAGES = [
  { id: 'dashboard', file: 'dashboard.html', group: 'Today', nav: 'Overview',    icon: 'overview',
    title: 'Overview',    intro: 'Everything happening today, in one place.' },
  { id: 'bookings', countId: 'bookings-count', action: ['add-booking', 'New appointment'],  file: 'bookings.html',  group: 'Today', nav: 'Appointments', icon: 'diary',
    title: 'Appointments', intro: 'Everyone booked in. Confirm them, or let them know if something changes.' },
  { id: 'sell',      file: 'sell.html',      group: 'Today', nav: 'Sell Now',    icon: 'till',
    title: 'Sell Now',    intro: 'Someone is at the counter. Add what they are having, then take the money.' },

  { id: 'sales',     file: 'sales.html',     group: 'Money', nav: 'Sales',       icon: 'sales',
    title: 'Sales',       intro: 'Every sale you have made, in the chair, at the counter and online.' },
  { id: 'balances',  file: 'balances.html',  group: 'Money', nav: 'Balances',    icon: 'balances',
    title: 'Balances',    intro: 'Who still owes you money, and how much. Record a payment when it comes in.' },
  { id: 'cash',      file: 'cash.html',      group: 'Money', nav: 'Cash Drawer', icon: 'cash',
    title: 'Cash Drawer', intro: 'Count the cash when you open, and again when you close.' },
  { id: 'expenses',  file: 'expenses.html',  group: 'Money', nav: 'Expenses',    icon: 'expenses',
    title: 'Expenses',    intro: 'Money going out: rent, stock, salaries, transport.' },

  { id: 'orders', countId: 'orders-count',     file: 'orders.html',    group: 'Shop',  nav: 'Shop Orders', icon: 'orders',
    title: 'Shop Orders', intro: 'Orders from the website. Confirm each one, then get it ready.' },
  { id: 'stock',     file: 'stock.html',     group: 'Shop',  nav: 'Stock',       icon: 'stock',
    title: 'Stock',       intro: 'What is on the shelf right now, and what is running low.' },
  { id: 'suppliers', file: 'suppliers.html', group: 'Shop',  nav: 'Suppliers',   icon: 'suppliers',
    title: 'Suppliers',   intro: 'The people you buy hair and products from.' },

  { id: 'classes',   file: 'classes.html',   group: 'School', nav: 'Classes',    icon: 'classes',
    title: 'Classes',     intro: 'Your students, what they are learning, and what they have paid so far.' },

  { id: 'clients', countId: 'clients-count', action: ['add-client', 'New customer'],   file: 'clients.html',   group: 'People', nav: 'Customers',  icon: 'customers',
    title: 'Customers',   intro: 'Everyone who has been in. Their history, and your notes about them.' },
  { id: 'staff', action: ['add-staff', 'Add someone'],     file: 'staff.html',     group: 'People', nav: 'Team',       icon: 'team',
    title: 'Team',        intro: 'Your stylists, what each one does, and how busy they are.' },

  { id: 'reports',    file: 'reports.html',   group: 'Business', nav: 'Reports',  icon: 'reports',
    title: 'Reports',     intro: 'How the business is doing this week, this month and this year.' },
  { id: 'activity',  file: 'activity.html',  group: 'Business', nav: 'Activity', icon: 'activity',
    title: 'Activity',    intro: 'A record of what changed today, and who changed it.' },

  { id: 'prices',    file: 'prices.html',    group: 'Shop', nav: 'Items',     icon: 'prices',
    title: 'Items',       intro: 'Everything you sell. Change a price, mark something new, or take it off the website.' },
  { id: 'discounts', file: 'discounts.html', group: 'Shop', nav: 'Discounts', icon: 'discounts',
    title: 'Discounts',   intro: 'Run an offer on the website. Switch it on when you want it, off when it ends.' },
  { id: 'settings',  file: 'settings.html',  group: 'Set up', nav: 'Settings',   icon: 'settings',
    title: 'Settings',    intro: 'Your studio details: address, phone, opening hours.' },
  { id: 'payments', action: ['pay-record', 'Record a payment'],  file: 'payments.html',  group: 'Money',  nav: 'Payments',   icon: 'cash', hidden: true,
    title: 'Payments',    intro: 'Deposits taken and balances still owed.' },
  { id: 'help',      file: 'help.html',      group: 'Set up', nav: 'Help',       icon: 'help',
    title: 'Help',        intro: 'Short answers to “how do I…?”' }
];

/* payments is folded into Balances, keep the file working, hide the nav row */
const NAV = PAGES.filter(p => !p.hidden);
const GROUPS = [];
NAV.forEach(p => {
  let g = GROUPS.find(x => x.name === p.group);
  if (!g) { g = { name: p.group, items: [] }; GROUPS.push(g); }
  g.items.push(p);
});

const svg = (d, w) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.8) + '" aria-hidden="true">' + d + '</svg>';

const MARK = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 41V26a12 12 0 0 1 24 0v15"/><path d="M18.5 41V30.5" opacity=".6"/><path d="M24 41V27.5" opacity=".6"/><path d="M29.5 41V30.5" opacity=".6"/><path d="M18.5 9h11"/></svg>';

function sidebar(current) {
  const nav = GROUPS.map(g =>
    '      <div class="admin-nav-label">' + g.name + '</div>\n' +
    g.items.map(p =>
      '      <a href="./' + p.file + '"' + (p.id === current ? ' class="is-active"' : '') + '>' +
      svg(ICON[p.icon]) + p.nav + '</a>'
    ).join('\n')
  ).join('\n');

  return `  <aside class="admin-sidebar">
    <div class="admin-logo">
      ${MARK}
      <div>
        <div class="admin-logo-name">Bēsia</div>
        <div class="admin-logo-tag">Studio Manager</div>
      </div>
    </div>
    <nav class="admin-nav" aria-label="Sections">
${nav}
    </nav>
    <div class="admin-sidebar-foot">
      <button class="theme-toggle" type="button">
        <span>Dark mode</span>
        <span class="track"><span class="thumb"></span></span>
      </button>
      <a class="back-to-site" href="../index.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m6-6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        View website
      </a>
    </div>
  </aside>
  <div class="sidebar-backdrop"></div>`;
}

function shell(p, body) {
  /* Order matters: admin-pages.js seeds the shared collections that
     admin.js reads when it draws the Overview numbers. */
  const scripts = ['<script src="../js/besia-data.js" defer></script>',
                   '<script src="../js/besia-live.js" defer></script>',
                   '<script src="../js/admin-ask.js" defer></script>',
                   '<script src="../js/store.js" defer></script>',
                   '<script src="../js/admin-pages.js" defer></script>',
                   '<script src="../js/admin.js" defer></script>',
                   '<script src="../js/admin-catalogue.js" defer></script>',
                   '<script src="../js/offline.js" defer></script>'];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title} · Bēsia Studio Manager</title>
  <meta name="robots" content="noindex">
  <link rel="icon" type="image/svg+xml" href="../assets/icons/favicon.svg">
  <link rel="preload" href="../fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../css/admin.css">
  <script>try{var t=localStorage.getItem('besia-admin-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
</head>
<body class="admin" data-page="${p.id}">

<div class="admin-shell">

${sidebar(p.id)}

  <div class="admin-main">
    <header class="admin-topbar">
      <button class="sidebar-toggle" aria-label="Open menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/></svg></button>
      <div class="topbar-title">
        <h1>${p.title}</h1>
        <p class="topbar-intro">${p.intro}</p>
      </div>
      <div class="topbar-spacer"></div>
      ${p.countId ? '<span class="topbar-meta" id="' + p.countId + '">…</span>' : '<div class="topbar-date" id="today-date">…</div>'}
      ${p.action ? '<button class="a-btn a-btn--gold a-btn--sm" id="' + p.action[0] + '" type="button">' + p.action[1] + '</button>' : ''}
      <div class="topbar-avatar">B</div>
    </header>

    <main class="admin-content">
${body}
    </main>
  </div>
</div>

<!-- The slide-in detail panel. It lives OUTSIDE .admin-shell so it can sit
     above everything, and it is emitted on every page so any section can
     open a record without needing its own copy of this markup. -->
<div class="a-modal-backdrop" id="drawer-backdrop"></div>
<aside class="a-drawer" id="page-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-label="${p.title} details">
  <div class="a-drawer-head">
    <h2 id="drawer-title">${p.title}</h2>
    <button class="a-drawer-close" id="drawer-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
  </div>
  <div class="a-drawer-body" id="drawer-body"></div>
</aside>

${scripts.join('\n')}
</body>
</html>
`;
}

/* ---------- run ---------- */
if (!fs.existsSync(PARTIALS)) fs.mkdirSync(PARTIALS, { recursive: true });

let built = 0, lifted = 0, missing = [];

for (const p of PAGES) {
  const partialPath = path.join(PARTIALS, p.id + '.html');
  const pagePath = path.join(ADMIN, p.file);

  /* first run: lift the existing body out into a partial */
  if (!fs.existsSync(partialPath) && fs.existsSync(pagePath)) {
    const cur = fs.readFileSync(pagePath, 'utf8');
    const a = cur.indexOf('<main class="admin-content">');
    const b = cur.indexOf('</main>', a);
    if (a !== -1 && b !== -1) {
      let body = cur.slice(a + '<main class="admin-content">'.length, b);
      /* drop the old free-text greeting line, the intro replaces it */
      body = body.replace(/\s*<p class="dash-hello"[^>]*>[\s\S]*?<\/p>/, '');
      fs.writeFileSync(partialPath, body.replace(/^\n+|\s+$/g, '') + '\n');
      lifted++;
    }
  }

  if (!fs.existsSync(partialPath)) { missing.push(p.id); continue; }
  const body = fs.readFileSync(partialPath, 'utf8').replace(/\s+$/, '');
  fs.writeFileSync(pagePath, shell(p, body));
  built++;
}

console.log('Studio Manager rebuilt, ' + built + ' pages' + (lifted ? ', ' + lifted + ' bodies lifted into partials' : '') + '.');
console.log('  nav: ' + GROUPS.map(g => g.name + ' (' + g.items.length + ')').join(' · '));
if (missing.length) console.log('  MISSING PARTIAL for: ' + missing.join(', ') + '  -> tools/admin-partials/<id>.html');
