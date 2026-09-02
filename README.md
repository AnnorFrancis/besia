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
  COURSES             the 6 training courses, fees and what each covers
  SUPPLIERS           who the studio buys hair and product from
  TEAM / REVIEWS      the collaborative, and the real 5.0 reviews
```

The pages are then **generated** from it. One command rebuilds everything and
runs the checks:

```bash
node tools/build-all.js
```

Or run a single step:

```bash
node tools/build-services.js     # service tiles + the 47-line price list
node tools/build-shop.js         # the 23 product cards + filters
node tools/build-home.js         # home page service and shop teasers
node tools/build-packages.js     # the three bundles + the price builder
node tools/build-classes.js      # the training school + its nav link
node tools/build-admin.js        # all 19 Studio Manager pages
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

## The training school

Bēsia teaches as well as styles, so the school is a first-class part of both halves.

**`classes.html`** lists six hands-on courses built from her own disciplines —
Fusion Extensions, Braiding & Cornrows, Silk Press, Natural Hair & Curl Care,
Colour Fundamentals, and Lashes & Brows — with what each one covers, how many days
it runs and how many seats there are.

Payment works two ways, and the form does the arithmetic in front of the student:

- **Pay in full** — the whole fee, seat confirmed straight away.
- **Pay half to reserve** — 50% holds the seat, balance due before the final day.

Reserving a seat produces a reference like `CLS-260902-566` and drops the student
straight into **Classes** in the manager, where the owner sees the fee, what has
been paid and what is still owed, and can record each instalment as it arrives.
The outstanding balance also appears in **Balances** alongside customer debts, so
there is only ever one list of money owed.

> Course content and fees are a considered first draft built from her real service
> menu. **They need her sign-off** — she has not published a curriculum anywhere.

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

Eighteen sections, grouped so nothing has to be hunted for. Every one carries a
**single plain sentence** under its title saying what it is for — written for
someone who has never used a management system before.

| Group | Sections |
|---|---|
| **Today** | Overview · Appointments · Sell Now |
| **Money** | Sales · Balances · Cash Drawer · Expenses |
| **Shop** | Shop Orders · Stock · Suppliers |
| **School** | Classes |
| **People** | Customers · Team |
| **Business** | Reports · Activity |
| **Set up** | Price List · Settings · Help |

What each one does:

- **Overview** — three numbers (taken today, booked in, owed) and eight big buttons.
- **Sell Now** — the counter. Tap services and products, take cash / MoMo / card,
  in full or in part. Replaces the old Walk-In page, which did half the job.
- **Sales** — everything sold in the chair, at the counter and online, by period.
- **Balances** — one list of everyone who owes: part-paid sales, students on an
  instalment, and shop orders due on collection. *Record payment* on each row.
- **Cash Drawer** — open with a float, log cash in and out, count at close.
  It tells you plainly whether the drawer matched, and by how much if not.
- **Expenses** — rent, stock, salaries, transport, by category. Feeds Reports.
- **Stock** — quantity per product with − and + buttons; flags anything at 3 or
  fewer, and marks what has finished. Selling a product takes it off the shelf.
- **Suppliers** — who to call or WhatsApp to reorder, with payment terms.
- **Classes** — the training school. Courses with seats filled, students with fees
  paid and outstanding, and one button to record an instalment.
- **Activity** — a plain log of what changed and when.
- **Price List** — every service, product and course price in one searchable table,
  with a note saying where prices actually live.
- **Settings** — studio details and opening hours, plus a *Reset demo data* button.
- **Help** — ten "how do I…?" answers in plain English.

Seeded with Bēsia's real service names, real prices and the real team
(Dana, Francis, Rabs, The Hair Club). Every seeded appointment amount is
cross-checked against the published menu.

**Two moments to demo:**

1. Place an order on the site, open **Shop Orders** — it is already there — press
   *Confirm this order*, then go back to `track.html` and watch the timeline move.
2. Take a part payment in **Sell Now**, then open **Balances** — the outstanding
   amount is already waiting, and **Stock** has come down by what you sold.

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
2. Confirm the **retail prices** and the **course fees** with the owner. Service
   prices are her real published menu; the 23 shop prices and the 6 course fees
   are considered placeholders.
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
