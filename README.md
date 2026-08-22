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
  services.html       6 compact service tiles + full price list (42 prices) + before/after slider
  shop.html           23 products across 6 categories, filterable, add-to-cart
  gallery.html        Filterable look book (8 categories, 32 photos) with FLIP animations + lightbox
  about.html          Story, timeline, values, "Inside the Lounge" photo strip, team
  packages.html       3 packages + interactive service builder (live total -> booking form)
  checkout.html       NEW — bag, delivery/pickup, simulated MoMo & card payment, order number
  track.html          NEW — live order tracking by order number, status timeline
  contact.html        4-step booking form with instant estimate + map + contact channels
  admin/
    dashboard.html    Today — appointments, money owed, quick launcher
    bookings.html     Appointments — search / filter, detail drawer, confirm & reject
    orders.html       NEW — Shop Orders: confirm, advance status, mark paid, cancel
    walkin.html       Walk-In — record someone who came in without booking
    clients.html      Customers — visit history and notes
    payments.html     Payments — who owes what, record a payment
    reports.html      Reports — week / month / year in plain numbers
    staff.html        Staff — the team, workload, message them
  css/    style.css · animations.css · admin.css
  js/     main.js · animations.js · gallery.js · booking.js · ai-chat.js · admin.js · store.js
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

Every product has an **Add to Cart** button. Prices live in the `data-add` attribute on
each card (`"Name|price"`), so changing one is a single-line edit.

## Images

Client photography, organised so it is obvious where each shot is used:

- `images/hero-gallery/` — 16 client looks, the Studio Sessions filter in the look book
- `images/salon-studio/` — interior, founder portrait, "Inside the Lounge" strip on About
- `images/wigs/`, `bundles/`, `closures-frontals/`, `extensions/`,
  `hair-care-cosmetics/`, `accessories/` — the shop catalogue
- `images/services/` — service photography plus the before/after revamp slider
- The original sample photos remain at the top level of `images/` and are still in use

## Ordering — end to end, on the website

Nothing is ordered or booked through WhatsApp. WhatsApp is only a contact channel.

**Shop → Cart → Checkout → Payment → Order number → Tracking → Admin**

1. `shop.html` — Add to Cart; a floating bag bar shows count and total.
2. `checkout.html` — review the bag (change quantities), enter name and phone,
   choose **pickup (free)** or **delivery (GHS 30)**, then pay by
   **Mobile Money** (MTN / Telecel / AT), **card**, or **on pickup**.
3. A simulated gateway runs (MoMo shows a prompt-approval sequence), then the customer
   gets an order number like `XHD-260822-596`.
4. `track.html` — enter that number to see a live status timeline. Orders placed on
   the device appear as one-tap chips.
5. `admin/orders.html` — the order is waiting. Confirm it, advance it
   (Ready for pickup / Out for delivery / Delivered), mark it paid, or cancel it.
6. **The customer's tracking page updates instantly** with a timestamp for each step.

Appointments work the same way: the booking form saves the request and shows a
reference like `WEB-290451`, and it lands in `admin/bookings.html`.

### Payment — what is real and what is not

The payment flow is a **working simulation**, clearly labelled on-screen. No money moves
and **no card numbers are stored or transmitted**. For production, swap the simulated
step in `checkout.html` for **Paystack** or **Hubtel** (both handle Ghanaian MoMo and
cards) — the surrounding cart, order and tracking logic stays exactly as it is.

## Admin — built for a non-technical owner

Plain-English labels throughout: *Dashboard*, *Appointments*, *Shop Orders*, *Walk-In*,
*Customers*, *Payments*, *Reports*, *Staff*. Every page answers one question.

**The feature to demo:** place an order on the website, then open
`admin/orders.html`. It is already there. Press *Confirm this order*, go back to
`track.html`, and the customer's timeline has moved — with a timestamp.

## Demo notes (for the pitch)

- **Everything is frontend-only.** Orders, bookings, payments, chat and admin data are
  mock. Production adds a backend (database, real payment gateway, WhatsApp Business API).
- The website ↔ admin handoff runs through `localStorage`, so both must be opened from
  the same address — serve the folder rather than double-clicking the files.
- Four demo orders are seeded so the admin never looks empty.
- Dark mode (admin sidebar toggle) persists via localStorage.
- Prices live in four places that must stay in step: the price list in `services.html`,
  `SERVICE_PRICES` in `js/booking.js`, `data-price` in `packages.html`,
  and `data-add` in `shop.html`.

## Mobile

Verified at 375px and 1280px across all **17 pages**: zero horizontal overflow, zero JS
errors, every form input ≥16px so iOS never auto-zooms, and every tap target ≥44px.

On phones the heavy grids collapse to a **two-up layout** rather than one tall column —
the services page dropped from 12.8 to 11.5 screens while carrying twice the content
(6 service tiles *and* a 42-line price list), and shop cards went from 559px to 327px.

## Customising

- Colours/typography: CSS variables at the top of `css/style.css` and `css/admin.css`.
- Copy: all text is plain HTML in each page.
- Look book: add/remove `.gallery-item` blocks in `gallery.html` (`data-cat`, `data-title`, `data-full`).
- Shop: add/remove `.product-card` blocks in `shop.html` (`data-cat`, `data-add`).
- Service prices: the `.price-row` blocks in `services.html`.
- Order statuses / delivery fee / seeded demo orders: `js/store.js`.
- Mock admin data: arrays at the top of `js/admin.js`.
- Chat answers: `INTENT_REPLIES` in `js/ai-chat.js`.
