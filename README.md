# Bēsia Beauty Studio: The Issue

A website and a studio manager for **Bēsia Beauty Studio**, Ghana's home of fusion
extensions, at 54 Fifth Circular Road, Cantonments, Accra. One system: a public
website built as an issue of a magazine, and a back-office Studio Manager, sharing
the same data and the same order book.

> Designed and built by [Perkins Creative](https://perkins-swart.vercel.app)

---

## Run it

No build step at runtime. No install. Plain HTML, CSS and JavaScript with relative paths.

```bash
npx http-server . -p 8899
```

Then open <http://localhost:8899>. The Studio Manager is at
`/admin/dashboard.html`, deliberately unlinked from the public site.

**Serve the folder; do not double-click the files.** The website and manager hand off
through `localStorage`, which is scoped per origin, so both halves must be opened
from the same address for the demo to connect.

---

## The one file that matters

Every price, every product, every course, the phone number and the opening hours
live in **`js/besia-data.js`**. Nothing else needs editing to change a fact.

```
js/besia-data.js
  BUSINESS            name, phone, email, address, hours, socials, storage namespace
  SERVICE_CATEGORIES  the 14 disciplines (the chapters of the complete menu)
  SERVICES            her official Fresha export (83) plus ITips, Wig Revamp and the Hair Club Blueprint
  CORE_SERVICES       Dana's 13 core services (6 Oct), each mapped to the services beneath it
  PRODUCTS            30 items: Bēsia Lab, professional care, and her hair by texture (and length)
  COURSES             The School at Bēsia / Bēsia Beauty Academy: 3 certifications and 7 more courses
  SUPPLIERS           who the studio buys hair and product from
  TEAM / REVIEWS      the collaborative, and her real 5.0 reviews
```

The pages are **generated** from it. One command rebuilds everything and runs
every check:

```bash
node tools/build-all.js
```

The steps, in the order build-all runs them:

```bash
node tools/build-services.js   # the chapter rail and the 14 chapters, every price inside its chapter
node tools/build-shop.js       # the hair library: filters and 24 product cards
node tools/build-home.js       # 02 Core services and the ticker, from CORE_SERVICES
node tools/build-packages.js   # the Hair Club pairings (with Hair CPR), the price builder
node tools/build-classes.js    # classes.html, written whole from the course data
node tools/build-gallery.js    # the contact sheet from her pictures
node tools/build-admin.js      # all 20 Studio Manager pages
node tools/build-css.js        # css/issue/*.css joined into one css/issue.css
node tools/build-chrome.js     # the masthead, Menu sheet and footer on every page
node tools/build-reels.js      # her films placed wherever a page asks for one
node tools/build-seo.js        # titles, canonicals, Open Graph, JSON-LD, sitemap, robots
node tools/add-image-dims.js   # width and height on any new <img>
node tools/build-sw.js         # the offline service worker (always last)
```

Each generator writes only between its markers (`<!--BUILD:x-->`, `<!--CHROME:x-->`,
`<!--REEL:{...}-->`), so hand-written copy around them is never touched. Re-running
is safe and idempotent.

`js/booking-cart.js`, `js/booking.js`, `js/ai-chat.js`, `js/store.js`, `js/site-sync.js`
and `js/admin.js` read the same file at runtime, through `js/besia-live.js`, which
merges the owner's changes from the manager. **A price cannot drift**: the chapters,
the booking sheet, the estimator, the chat and the manager read one number.

### Checks

Every one of these runs at the end of build-all and fails the build:

```bash
node tools/check-assets.js     # every local asset resolves, with exact case (GitHub Pages is case-sensitive)
node tools/check-css.js        # the house rules for css/issue: no colour literals outside tokens,
                               # no italics, no !important, no 100vw/100vh, no bare 1fr, at most 8 blurs
node tools/check-contrast.js   # every ground passes WCAG: text 4.5:1, lines 3:1
node tools/check-dash.js       # no em or en dash anywhere a visitor could read one
```

---

## The Issue: how the design is built

The site is Issue 01 of a magazine the studio publishes for its own clients: a
masthead, a Menu sheet, numbered chapters, plates with credits, a footer set
as a colophon. It is set in one typeface, Montserrat, at the client's request; the
editorial contrast comes from weight, scale, tracking and layout.

- **`css/issue/tokens.css`** is the only file allowed a colour literal. Eight grounds
  from her own world (Ink from the logo letters, Moss from the bottle, Espresso,
  Clay from the beard-oil sand and the A-Beauty covers, Ivory from the plaster,
  Oatmeal from her mood board, Oak from the fluted wall, Sage from the sofa). A
  section declares `data-ground="…"` and every text colour inside it comes from
  that ground, so light text can never land on light paper. `check-contrast.js`
  proves every pair.
- **`base.css`** has the typeface (self-hosted, with a 4 KB face that carries only the
  Ē so the name never flashes another glyph), the type roles (`t-mast`, `t-coverline`,
  `t-chap`, `t-h2`, `t-deck`, `t-pull`, `t-cap`, `t-label`, `t-credit`, `t-price`),
  the macron rule (the brass bar from the Ē, used as every eyebrow's opening and the
  active-page mark), fluting (the oak wall as a CSS ground) and grain.
- **`components.css`** is the chrome and the controls: the glass masthead, the Menu
  sheet, buttons, forms, the dock (one slot at the bottom of a phone, nothing else
  floats), the booking sheet (restyled, logic untouched), films, the slideshow, the
  lightbox, the chat window, reveals, the intro and the page transitions.
- **`templates.css`** is seven spreads that build every page: `t-spread`, `t-plate`,
  `t-rail`, `t-opener`, `t-index`, `t-quote`, `t-form`.
  Phones first, one column; twelve columns from 1024px. Every column is
  `minmax(0, 1fr)` and every child `min-width: 0`, so nothing can push wider than
  the page.
- **`pages.css`** is what only one page needs.

Glass is spent on four surfaces and nowhere else: the masthead once it sticks, the
Menu sheet, the booking sheet and the lightbox chrome. Everything else that
looks frosted is baked from a blurred still, which costs nothing to scroll.

The intro (ivory, her name, the rule, the studio line, the strapline) is the one the
client chose. It is kept and levelled up: the letters rise, the rule draws itself in
brass, the lines settle, and the page opens along the rule. Once per session, tap to
skip, never on slow data or for people who asked for reduced motion.

### Her films and photographs

Everything she sent arrived through WhatsApp, which throws most of the detail away.
Every picture and every film on the site has been restored with Real-ESRGAN on the
GPU and then downscaled, so the restorer's guesses average out and only cleaner
edges remain. The pipeline is one command each:

```bash
node tools/build-images.js   # tools/image-manifest.js -> media/img/*.webp (full, -sm, -blur) + index.json
node tools/build-video.js    # tools/media-manifest.js -> media/video/*-720.mp4, *-480.mp4, posters, blur + index.json
```

Both read her originals from `NEW VIDEOS AND IMAGES/` (not committed) and need the
portable restorer at `tools/_bin/realesrgan/` (not committed; download
`realesrgan-ncnn-vulkan-20220424-windows.zip` from the Real-ESRGAN releases on
GitHub and unzip it there). Without it they fall back to plain resampling. The film
build takes about three hours for all eighteen films on a laptop GPU; run
`node tools/build-reels.js` afterwards so the pages pick up the new version hashes.

A page asks for a film with one marker and `build-reels.js` writes the figure:

```html
<!--REEL:{"name":"entry-film","class":"plate plate--portrait","hero":true,"alt":"…"}-->
<!--/REEL:entry-film-->
```

`js/reel.js` then plays one film at a time (the one nearest the middle of the
screen), holds at most two in memory, pauses when a sheet opens or the tab hides,
plays `once` films through and offers Replay, and loads nothing at all on Save-Data,
2G or reduced motion until the visitor taps Play.

---

## The studio, as published

| | |
|---|---|
| **Bēsia Beauty Studio** | Hair salon · beauty collaborative |
| Address | 54 Fifth Circular Road, Cantonments, Accra |
| Phone / WhatsApp | **024 078 7993** |
| Email | hello@besia.co |
| Hours | **Monday to Saturday, 9am to 7pm** · closed Sunday |
| Rating | 5.0 from 16 reviews |
| Instagram / TikTok | [@besia.hq](https://instagram.com/besia.hq) · [@besiahq](https://www.tiktok.com/@besiahq) |

Positioning, in her own words: *Ghana's home of fusion extensions, specialising in
seamless KTips and microlinks. The first salon in Ghana to offer a safe, vegan,
formaldehyde-free straightening and texturising system.*

---

## The service menu: 14 disciplines (her Fresha export, plus three she added on 6 Oct)

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

**`classes.html`** (see "Round 2" below for the Academy structure) lists hands-on courses built from her own disciplines, 
Fusion Extensions, Braiding & Cornrows, Silk Press, Natural Hair & Curl Care,
Colour Fundamentals, and Lashes & Brows, with what each one covers, how many days
it runs and how many seats there are.

Payment works two ways, and the form does the arithmetic in front of the student:

- **Pay in full**: the whole fee, seat confirmed straight away.
- **Pay half to reserve**: 50% holds the seat, balance due before the final day.

Reserving a seat produces a reference like `CLS-260902-566` and drops the student
straight into **Classes** in the manager, where the owner sees the fee, what has
been paid and what is still owed, and can record each instalment as it arrives.
The outstanding balance also appears in **Balances** alongside customer debts, so
there is only ever one list of money owed.

> Course content and fees are a considered first draft built from her real service
> menu. **They need her sign-off**, she has not published a curriculum anywhere.

## Ordering, end to end, on the site

**Shop → Bag → Checkout → Payment → Order number → Tracking → Studio Manager**

1. `shop.html`: 30 products. Bēsia Lab and professional care sell now; hair is priced by length and shows "Price to follow" until the studio prices it in Items.
2. `checkout.html`: quantities, pickup (free) or delivery (GHS 30), then Mobile Money
   (MTN / Telecel / AT), card, or pay on pickup.
3. A simulated gateway runs, then an order number like `BES-260902-630`.
4. `track.html`: live status timeline; orders placed on that device appear as chips.
5. `admin/orders.html`: the order is already waiting. Confirm it, advance it, mark it paid.
6. **The customer's tracking page moves**, with a timestamp against each step.

*Verified end to end in this build:* order `BES-260902-630` placed for GHS 2,210,
confirmed in the manager, and the tracker updated with both timestamps.

Appointments work the same way: the booking form saves a request with a reference
like `APT-260902`, and it lands in `admin/bookings.html`.

### Payment: what is real and what is not

The payment flow is a **working simulation**, labelled on screen. No money moves and
**no card details are stored or transmitted**. For production, swap the simulated step
in `checkout.html` for **Paystack** or **Hubtel**, both handle Ghanaian MoMo and
cards, and the cart, order and tracking logic around it stays exactly as it is.

---

## The manager runs the website

The Studio Manager is not a separate report on the website, it **is** the
control room. Three files do it:

```
js/besia-data.js   the baseline catalogue, as first published
js/besia-live.js   the live view, baseline + everything changed since
js/site-sync.js    applies that live view to the public pages
```

Pages still ship as finished HTML, so search engines and the first paint get
real content. `site-sync.js` then reconciles them against the live view.

What the owner controls, and what happens the moment she does it:

| In the manager | On the website |
|---|---|
| Switch an item off in **Items** | It disappears from the shop or the price list. Group counts and every "from" figure recalculate |
| Change a price in **Items** | The new price shows on the website, the booking estimator and the chat assistant together |
| Add an item in **Items** | A new card appears in the shop, badged as a new arrival |
| Mark a new arrival | A **New in** badge appears |
| Switch on an offer in **Discounts** | Old price struck through, a **20% off** badge, a banner across the top of every page, and the checkout charges the lower price |
| Stock reaches zero in **Stock** | The card is marked **Sold out** and Add to Cart stops working |
| Confirm an order in **Shop Orders** | Stock comes off the shelf. Cancelling puts it back |

It reacts live, leave the website open in one tab, change something in the
manager in another, and the page updates itself. That is a `storage` event,
not a poll.

The overrides live in `localStorage` under `besia-catalogue` and
`besia-discounts`. In production those become two database tables and
`besia-live.js` becomes the API client. **Nothing else in the codebase
changes**, every page already reads the catalogue through that one file.

## Built for how Ghana actually works

- **Mobile Money first**: MTN, Telecel and AT at checkout and at the counter,
  alongside card and cash.
- **Part payments everywhere.** A customer can pay half at the counter and a
  student can pay half to hold a seat. Whatever is left lands in **Balances**,
  which is one list covering customers, shop orders and students.
- **Cash is still king**: the **Cash Drawer** opens with a float, tracks money
  in and out, and tells you plainly at close whether it balanced.
- **Power and data are not guaranteed.** A service worker (`sw.js`, generated
  by `tools/build-sw.js`) precaches the whole shell, so the manager keeps
  working through an outage. A message tells the operator the connection is
  gone and that their work is saved on the device.
- **Light on data.** Images are compressed and lazy-loaded; the shell is under
  a megabyte.
- **WhatsApp is a channel, not the till**: clients pay for bookings, classes and orders on the site (Dana, 6 Oct); WhatsApp stays for the studio's own confirmations, supplier reorders, class
  enquiries and the contract all hand off to it.

## The studio manager

Eighteen sections, grouped so nothing has to be hunted for. Every one carries a
**single plain sentence** under its title saying what it is for, written for
someone who has never used a management system before.

| Group | Sections |
|---|---|
| **Today** | Overview · Appointments · Sell Now |
| **Money** | Sales · Balances · Cash Drawer · Expenses |
| **Shop** | Shop Orders · Stock · Suppliers · Items · Discounts |
| **School** | Classes |
| **People** | Customers · Team |
| **Business** | Reports · Activity |
| **Set up** | Settings · Help |

What each one does:

- **Overview**: three numbers (taken today, booked in, owed) and eight big buttons.
- **Sell Now**: the counter. Tap services and products, take cash / MoMo / card,
  in full or in part. Replaces the old Walk-In page, which did half the job.
- **Sales**: everything sold in the chair, at the counter and online, by period.
- **Balances**: one list of everyone who owes: part-paid sales, students on an
  instalment, and shop orders due on collection. *Record payment* on each row.
- **Cash Drawer**: open with a float, log cash in and out, count at close.
  It tells you plainly whether the drawer matched, and by how much if not.
- **Expenses**: rent, stock, salaries, transport, by category. Feeds Reports.
- **Stock**: quantity per product with − and + buttons; flags anything at 3 or
  fewer, and marks what has finished. Selling a product takes it off the shelf.
- **Suppliers**: who to call or WhatsApp to reorder, with payment terms.
- **Classes**: the training school. Courses with seats filled, students with fees
  paid and outstanding, and one button to record an instalment.
- **Activity**: a plain log of what changed and when.
- **Items**: everything you sell. Change a price, mark a new arrival, add
  something, or switch it off the website. This page drives the public site.
- **Discounts**: build an offer, leave it switched off, switch it on when you
  want it. The website follows instantly.
- **Settings**: studio details and opening hours, plus a *Reset demo data* button.
- **Help**: ten "how do I…?" answers in plain English.

Seeded with Bēsia's real service names, real prices and the real team
(Dana, Francis, Rabs, The Hair Club). Every seeded appointment amount is
cross-checked against the published menu.

**Two moments to demo:**

1. Place an order on the site, open **Shop Orders**, it is already there, press
   *Confirm this order*, then go back to `track.html` and watch the timeline move.
2. Take a part payment in **Sell Now**, then open **Balances**, the outstanding
   amount is already waiting, and **Stock** has come down by what you sold.

---

---

## Engineering notes

- **One source of truth.** Prices live in `js/besia-data.js` only.
- **One owner of navigation.** Nothing prevents a link's default except the booking
  cart, which claims Book and Add clicks in the capture phase. Page transitions are
  cross-document View Transitions in CSS; there is no JavaScript curtain.
- **One scroll lock, one dock.** `site.js` counts locks by name, so a sheet opened
  over another cannot unlock the page early. The booking bar and the bag bar share
  one slot at the bottom of a phone; the WhatsApp circle, the chat bubble and the
  action bar became rows in the Menu and the footer.
- **Back closes sheets.** The Menu and the booking sheet each push a history entry
  when they open and close on `popstate`, so the phone's Back button hides the sheet
  instead of leaving the page.
- **Storage namespace.** All keys are prefixed `besia-` via `BESIA.key()`. Storage is
  wrapped everywhere, because Safari's private mode throws on it.
- **The service worker** precaches the public shell only (about 40 files). The
  manager's pages are cached the first time the owner opens the manager. Films are
  never answered by the worker, because Safari needs byte-range replies for them.
  The cache version is a hash of file contents, and the image cache is capped.
- **Accessibility.** Every ground is contrast-proven. Tap targets are 40px or more
  (inline text links extend their hit area without moving a line). No italics.
  Inputs are 16px so iOS never zooms. Reduced motion gets 200ms fades, posters and
  a visible Play.
- **Performance.** A single CSS file, about 100 KB uncompressed; GSAP loads only on
  desktop pointer devices after idle; films are poster-first, 480p on phones, with
  at most two in memory.
- **No dashes.** The client's standard is plain punctuation; `check-dash.js` enforces it.

### Before going live

1. `tools/build-seo.js`: set `IS_PROPOSAL = false` and change `SITE_URL` to the real
   domain, then re-run build-all. While it is a proposal every page is `noindex`.
2. Confirm with the owner the **retail prices**, the **course fees** and whether the
   250ml Hair Botox is sold to clients. Service prices are her official menu.
3. Confirm the **email address**; `hello@besia.co` is taken from her link-in-bio.
4. Replace the simulated payment step with Paystack or Hubtel.
5. Put the Studio Manager behind real authentication.
6. Ask her for the original camera or export files of the films; the restored
   WhatsApp copies are good, the originals would be better, and they drop straight
   into the same pipeline.

---

## Known limits (say these out loud in the pitch)

- **Everything is frontend-only.** Orders, bookings, payments, chat and manager data
  are held in the browser. Production needs a backend: database, real payment
  gateway, WhatsApp Business API.
- **The Studio Manager has no authentication.** It is unlinked and `robots.txt`
  disallows it, but that is not a security control.
- **Four demo orders are seeded** so the manager never looks empty.
- **The chat assistant is scripted**, not a language model.
- **Course fees and retail prices are indicative** and need her sign-off.
- Reviews shown are her real public reviews, with the stars left off. Get her
  sign-off before publishing.

---

## Media

- `media/img/` and `media/video/` are her own pictures and films, restored and
  exported by the two build scripts above. `index.json` in each folder carries sizes.
- `images/` is the licensed library carried over from the base sample, now used only
  for the hair library products that have no photograph of their own. See
  `images/CREDITS.md`.
- `styleguide.html` is a development page showing every ground and every control;
  it is `noindex` and left out of the service worker.


---

## Round 2: Dana's feedback, 6 October 2026

Everything she asked for in the chat and her voice notes, and where it lives.
The voice-note transcript and her files are in `MORE CONTENT/` (not committed).

| She asked | Done in |
|---|---|
| "Beauty with intention" centred beneath Bēsia, equal spacing | `pages.css` `.cover-mast` (centred, tracking compensated) |
| Remove 01 / 07; keep open or closed and the address | `index.html` cover folio |
| A weather update on the cover | `site.js` (Open-Meteo, Cantonments, cached 30 min, hidden if offline) |
| "On the cover" becomes "Who we are" | `index.html` |
| Intro line says we supply beauty: products, extensions, lifestyle, books | `index.html` cover deck, shop copy, chat |
| Bēsia Beauty Studio logo where appointments are | booking sheet head, home 06 Appointments, Hair Club form |
| Two spaces more between the Menu rule and the word | `components.css` `.nav-toggle` gap |
| Section 02 "Core services", her list, tap through to book | `CORE_SERVICES` in data, `build-home.js`, `booking-cart.js` (`?core=`) |
| The ticker says where to book, without sounding desperate | home ticker is one link, "Book here" between her services |
| The complete menu stays | `services.html` unchanged in structure |
| Pay on the site instead of WhatsApp; studio sorts conflicts after | booking sheet has a pay step (MoMo or card, simulated); paid bookings land in Appointments with amount and reference |
| Follicle Fuel: "Our signature products", no band over the film, rapid growth and nourishment, "Welcome to your new growth era", bold | home 03, shop opener, chat |
| Black Star Gate film continues that section; the rest of that section goes | home 03 second film; old 05 campaign section removed |
| Every video: see more of it, on phones too, and keep any words readable | `build-reels.js` writes each film's own shape; captions moved under the film; films excluded from the phone 4:3 crop and from desktop parallax zoom |
| Keep "The School at Bēsia", slip in Bēsia Beauty Academy | home 04 and classes opener |
| A one-to-one option for training | classes 07, enrol form format, no payment until agreed |
| Use her Academy brief to fill the blanks | classes: campaign line, 3 certifications, Fusion by method with pathways, methodology, upgrade path, Healthy Hair + Growth, Hair Botox + Nanoplasty, how it works, founder note, FAQ (with the licensing caveat), closing call |
| Hair Club (her PDF) | packages.html is now the Hair Club: Blueprint GHS 500, membership GHS 200 a month, journey, growth timeline, pairings, her consultation form online |
| Hair CPR as "detox + nourish" | `build-packages.js` pairing, steps from her plan |
| Her consultation form (HW Client Form) | packages.html #consult; answers travel with the Blueprint booking into Appointments |
| Shop: her list of hair, by texture, 16 to 30 inches, each length its own price | data `PRODUCTS`, `build-shop.js` length chips, `besia-live.js` `setLengthPrices`, manager Items "Set prices" |

Prices verified on her live Fresha page on 6 Oct and corrected: Curl Revive + Flax
GHS 850, Deep Moisture + Curl Revive GHS 855.
