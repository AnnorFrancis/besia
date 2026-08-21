# Xclusivehairdeals — Website & Business Manager

A production-grade sample for **Xclusivehairdeals** — a hair salon, wig store and beauty
store in Greater Accra, Ghana. Braids, wigs, bundles, closures and frontals, extensions,
hair colouring, nails, lashes, brows, make-up, facials and hair care products.

> Designed & Developed by [Perkins Creative](https://perkins-swart.vercel.app)

---

## What's inside

```
SALON2/
  index.html          Home — hero slideshow, services, shop teaser, stats, look book, packages, reviews
  services.html       6 service groups + before/after revamp slider + smart recommendations
  shop.html           NEW — 23 products across 6 categories, filterable, WhatsApp ordering
  gallery.html        Filterable look book (8 categories, 32 photos) with FLIP animations + lightbox
  about.html          Story, timeline, values, "Inside the Lounge" photo strip, team
  packages.html       3 packages + interactive service builder (live total -> WhatsApp)
  contact.html        4-step booking form with instant estimate + map + contact channels
  admin/
    dashboard.html    Today — appointments, money owed, quick launcher
    bookings.html     Appointments — search / filter, detail drawer, confirm & reject
    walkin.html       Walk-In — record someone who came in without booking
    clients.html      Customers — visit history and notes
    payments.html     Payments — who owes what, record a payment
    reports.html      Reports — week / month / year in plain numbers
    staff.html        Staff — the team, workload, message them
  css/    style.css · animations.css · admin.css
  js/     main.js · animations.js · gallery.js · booking.js · ai-chat.js · admin.js
  images/ Client photos, organised by category (see below)
```

## How to run

No build step. No install. Plain HTML/CSS/JS with relative paths.

- **Quickest:** double-click `index.html`.
- **Recommended:** serve the folder — `npx http-server . -p 8899`, or VS Code Live Server.
- **Hosting:** upload the folder as-is to any static host (Netlify, Vercel, cPanel, GitHub Pages).

Admin is at `/admin/dashboard.html` — deliberately not linked from the public site.
Open it directly when demoing.

## Business details baked in

- **Xclusivehairdeals** — Hair Salon · Wig Store · Beauty Store
- Greater Accra, Ghana
- Phone / WhatsApp: **055 574 7887**
- Email: **wehndieandy12@gmail.com**
- Hours: **Mon–Sun, 9am–6pm** (the "Open now" pill and the chat assistant both follow this)

## The shop

`shop.html` is the new half of the pitch — she sells product as well as service.
23 items across six filterable categories:

| Category | Items | From |
|---|---|---|
| Wigs | 6 | GHS 850 |
| Bundles | 2 | GHS 950 |
| Closures & Frontals | 3 | GHS 720 |
| Extensions | 2 | GHS 520 |
| Hair Care & Cosmetics | 5 | GHS 85 |
| Accessories | 5 | GHS 30 |

Every product button opens WhatsApp with the item name and price already written —
the customer just presses send. Prices live in the `data-order` attribute on each
card (`"Name|price"`), so changing one is a single-line edit.

## Images

Client photography, organised so it is obvious where each shot is used:

- `images/hero-gallery/` — 16 client looks, the Studio Sessions filter in the look book
- `images/salon-studio/` — interior, founder portrait, "Inside the Lounge" strip on About
- `images/wigs/`, `bundles/`, `closures-frontals/`, `extensions/`,
  `hair-care-cosmetics/`, `accessories/` — the shop catalogue
- `images/services/` — service photography plus the before/after revamp slider
- The original sample photos remain at the top level of `images/` and are still in use

## Admin — built for a non-technical owner

Plain-English labels throughout: *Dashboard*, *Appointments*, *Walk-In*, *Customers*,
*Payments*, *Reports*, *Staff*. Every page answers one question, and every action button
opens WhatsApp with the message already written — she just presses send.

**The feature to demo:** fill in the booking form on `contact.html`, then open
`admin/bookings.html`. The request is already sitting at the top of the list, tagged
**Website**, marked *Pending*, with **Confirm & message** / **Reject & reschedule**
buttons. That is the whole pitch in ten seconds.

## Demo notes (for the pitch)

- **Everything is frontend-only.** Bookings, chat, estimates and admin data are mock —
  nothing is sent anywhere. Production would add a backend (appointments database,
  WhatsApp Business API, deposits).
- WhatsApp buttons genuinely open `wa.me/233555747887` with pre-filled messages.
- The website → admin handoff runs through `localStorage`, so both pages must be opened
  from the same address — serve the folder rather than double-clicking the files.
- Dark mode (admin sidebar toggle) persists via localStorage.
- Prices live in three places that must stay in step: `SERVICE_PRICES` in `js/booking.js`,
  `data-price` in `packages.html`, and `data-order` in `shop.html`.

## Mobile

Verified at 375px across all 14 pages: **zero horizontal overflow**, every form input
≥16px so iOS never auto-zooms, admin tables scroll inside their own box, and the sticky
call / WhatsApp / book bar stays one thumb away.

## Customising

- Colours/typography: CSS variables at the top of `css/style.css` and `css/admin.css`.
- Copy: all text is plain HTML in each page.
- Look book: add/remove `.gallery-item` blocks in `gallery.html` (`data-cat`, `data-title`, `data-full`).
- Shop: add/remove `.product-card` blocks in `shop.html` (`data-cat`, `data-order`).
- Mock admin data: arrays at the top of `js/admin.js`.
- Chat answers: `INTENT_REPLIES` in `js/ai-chat.js`.
