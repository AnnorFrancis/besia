# Bēsia Beauty Studio — Website & Studio Manager

A customised sample for **Bēsia Beauty Studio** — Ghana's home of fusion extensions,
at 54 Fifth Circular Road, Cantonments, Accra. One system: a public website and a
back-office studio manager, sharing the same data and the same order book.

> Designed & Developed by [Perkins Creative](https://perkins-swart.vercel.app)

---

## Run it

No build step. No install. Plain HTML/CSS/JS with relative paths.

```bash
npx http-server . -p 8899
```

Then open <http://localhost:8899>. The studio manager is at
`/admin/dashboard.html` — deliberately unlinked from the public site.

**Serve the folder; do not double-click the files.** The website ↔ manager handoff
runs through `localStorage`, which is scoped per origin — both halves must be opened
from the same address for the demo to connect.

---

## The one file that matters

Everything — every price, every product, the phone number, the opening hours —
lives in **`js/besia-data.js`**. Nothing else needs editing.

```
js/besia-data.js
  BUSINESS            name, phone, email, address, hours, socials, storage namespace
  SERVICE_CATEGORIES  the 10 disciplines
  SERVICES            all 47 services: price, duration, description
  PRODUCTS            23 retail items across 5 categories
  TEAM / REVIEWS      the collaborative, and the real 5.0 reviews
```

The pages are then **generated** from it:

```bash
node tools/build-services.js     # service tiles + the 47-line price list
node tools/build-shop.js         # the 23 product cards + filters
node tools/build-home.js         # home page service and shop teasers
node tools/build-packages.js     # the three bundles + the price builder
node tools/build-seo.js          # titles, canonicals, OG, JSON-LD, sitemap, robots
```

Each writes only between `<!--BUILD:x-->` markers, so hand-written copy around
them is never touched. Re-running them is safe and idempotent.

`js/booking.js`, `js/ai-chat.js`, `js/store.js` and `js/admin.js` read the same file
at runtime. **A price cannot drift** — the estimator, the chat assistant, the admin
and the printed price list are all reading one number.

### Checks

```bash
node tools/check-assets.js       # every local asset resolves, with exact case
node tools/add-image-dims.js     # stamps width/height on any new <img>
```

`check-assets.js` matters more than it looks: Windows is case-insensitive and
GitHub Pages is not, so a wrong-case path works locally and 404s in production.

---

## The studio, as published

| | |
|---|---|
| **Bēsia Beauty Studio** | Hair salon · beauty collaborative |
| Address | 54 Fifth Circular Road, Cantonments, Accra |
| Phone / WhatsApp | **024 078 7993** |
| Email | hello@besia.co |
| Hours | **Mon–Sat, 9am – 7pm** · closed Sunday |
| Rating | 5.0 from 16 reviews |
| Instagram / TikTok | [@besia.hq](https://instagram.com/besia.hq) · [@besiahq](https://www.tiktok.com/@besiahq) |

Positioning, in her own words: *Ghana's home of fusion extensions, specialising in
seamless KTips and microlinks. The first salon in Ghana to offer a safe, vegan,
formaldehyde-free straightening and texturising system.*

---

## The service menu — 47 services, 10 disciplines

Real, published prices and durations.

| Discipline | Services | From |
|---|---|---|
| Fusion Extensions | 12 | GHS 680 |
| Texture Systems (Nanoplasty, Hair Botox) | 3 | GHS 850 |
| Scalp + Bond Repair | 12 | GHS 350 |
| Colour | 7 | GHS 650 |
| Naturals, Curls & Coils | 2 | GHS 550 |
| Cutting | 4 | GHS 165 |
| Braids & Cornrows | 2 | GHS 550 |
| Styling | 1 | GHS 550 |
| Wig Service | 1 | GHS 500 |
| Consultations & Basics | 3 | GHS 200 (first consultation free) |

Every tile's "From" figure is **computed** from the cheapest line in its own group,
and `build-services.js` fails loudly if the two ever disagree. A client comparing
the tile to the list can never find a contradiction.

Brows, lashes, waxing and facials are offered too. They are not on the online
booking menu, so the site presents them as booked with the artist and priced at
consultation, rather than inventing figures.

---

## Ordering — end to end, on the site

**Shop → Bag → Checkout → Payment → Order number → Tracking → Studio Manager**

1. `shop.html` — 23 products; the Moringa line shows as **Pre-order / Launching soon**.
2. `checkout.html` — quantities, pickup (free) or delivery (GHS 30), then Mobile Money
   (MTN / Telecel / AT), card, or pay on pickup.
3. A simulated gateway runs, then an order number like `BES-260902-630`.
4. `track.html` — live status timeline; orders placed on that device appear as chips.
5. `admin/orders.html` — the order is already waiting. Confirm it, advance it, mark it paid.
6. **The customer's tracking page moves**, with a timestamp against each step.

*Verified end to end in this build:* order `BES-260902-630` placed for GHS 2,210,
confirmed in the manager, and the tracker updated with both timestamps.

Appointments work the same way: the booking form saves a request with a reference
like `APT-260902`, and it lands in `admin/bookings.html`.

### Payment — what is real and what is not

The payment flow is a **working simulation**, labelled on screen. No money moves and
**no card details are stored or transmitted**. For production, swap the simulated step
in `checkout.html` for **Paystack** or **Hubtel** — both handle Ghanaian MoMo and
cards, and the cart, order and tracking logic around it stays exactly as it is.

---

## The studio manager

Plain-English labels: *Dashboard, Appointments, Shop Orders, Walk-In, Customers,
Payments, Reports, Staff*. Every page answers one question. Dark mode included.

Seeded with Bēsia's real service names, real prices and the real team
(Dana, Francis, Rabs, The Hair Club). Every seeded appointment amount is
cross-checked against the published menu.

**The moment to demo:** place an order on the site, open `admin/orders.html` —
it is already there — press *Confirm this order*, then go back to `track.html`.

---

## Engineering notes

- **One source of truth.** Prices live in `js/besia-data.js` only. The sample this was
  forked from kept them in four places that had to be edited in step by hand.
- **Storage namespace.** All keys are prefixed `besia-` via `BESIA.key()`.
  `localStorage` is scoped per *origin*, not per path — without this, two demos on
  one GitHub Pages account would silently share a cart and an order book.
- **Subresource Integrity.** All 18 third-party script and stylesheet tags are pinned
  with `sha384` hashes and `crossorigin`, so a compromised CDN cannot execute on the
  client's site.
- **Accessibility.** The whole palette is contrast-checked; a dedicated `--gold-ink`
  token carries accent text at 6.25:1 because the original bronze failed AA at 3.7:1.
  Pointer targets meet WCAG 2.5.8. All inputs are ≥16px so iOS never auto-zooms.
- **Performance.** Images recompressed 19 MB → 13 MB; every `<img>` carries intrinsic
  `width`/`height`, so nothing reflows as the page loads.
- **SEO.** Canonical URLs, Open Graph and Twitter cards on all 9 public pages,
  `sitemap.xml`, `robots.txt` (disallowing `/admin/`), a 404 page, and JSON-LD
  `HairSalon` structured data carrying all 47 offers, the address, the hours and the rating.
- **Line endings.** Normalised to LF and pinned with `.gitattributes`; the fork
  arrived with a CRLF/LF mix that made diffs unreadable.

### Before going live

1. `tools/build-seo.js` → change `SITE_URL` to the real domain, then re-run it.
2. Confirm the **retail prices** with the owner — service prices are her real
   published menu, but the 23 shop prices are indicative placeholders.
3. Confirm the **email address**; `hello@besia.co` is taken from her link-in-bio.
4. Replace the simulated payment step with Paystack or Hubtel.
5. Put the studio manager behind real authentication — see below.

---

## Known limits (say these out loud in the pitch)

- **Everything is frontend-only.** Orders, bookings, payments, chat and manager data
  are held in the browser. Production needs a backend: database, real payment
  gateway, WhatsApp Business API.
- **The studio manager has no authentication.** It is unlinked, and `robots.txt`
  disallows it, but that is not a security control. Anyone with the URL can open it.
  Real auth is a backend task and must be scoped before launch.
- **Four demo orders are seeded** so the manager never looks empty.
- **The chat assistant is scripted**, not a language model. It matches keywords and
  answers from the live price list.
- Reviews shown are her real public Fresha reviews. Get her sign-off before publishing.

---

## Images

- `images/studio/` — **five photographs of the actual studio** (reception, styling nook,
  wash room, consultation corner, the wordmark on fluted oak). These carry the hero,
  the About page, the look book and the Open Graph card.
- `images/` — the licensed library carried over from the base sample, used for
  service and product photography. See `images/CREDITS.md`.

The palette is sampled from her own studio: fluted oak, cream plaster, black signage,
brass and monstera green. Design tokens sit at the top of `css/style.css` and
`css/admin.css`.
