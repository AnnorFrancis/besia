# Bēsia Beauty Studio: handoff for any Claude session

This folder is **only** for the Bēsia site at **https://annorfrancis.github.io/besia/**
(repo `AnnorFrancis/besia`, branch `main`, GitHub Pages from `main` at root).
Read README.md for the full system. This file is the short version plus
the rules learned the hard way.

## Where things stand (6 Oct 2026)
- The client (Dana, owner of Bēsia Beauty Studio, Cantonments, Accra) has
  chosen this version: the magazine redesign ("The Issue").
- Next: make the changes she points out, then, once she is happy, build the
  whole system properly for production (real backend, logins, payments).
- The older pre-magazine version is NOT part of this project. It lives in
  `../BESIA-classic` (its own repo, `AnnorFrancis/besia-classic`) and will be
  reworked for a different client. Do not edit it from here.

## Run, check, deploy
```
node tools/build-all.js        # regenerates pages from js/besia-data.js and runs every check
node tools/build-video.js      # rebuilds films from tools/media-manifest.js (needs ffmpeg)
```
- Local preview: `.claude/launch.json` config `besia-verify` (port 8913).
  Port 8899 may be held by another session's server.
- Deploy = commit on `main` and `git push origin main`; Pages updates in about a minute.
- Always re-test on the **deployed** site as a returning visitor (service
  worker already installed), not just localhost.

## House rules (from the client and the developer, non-negotiable)
1. **Montserrat only**, upright, no italics, on the website and the manager.
2. **No em dashes or en dashes** anywhere a visitor can read. Use commas,
   colons, full stops, middle dots. build-all checks this.
3. **Mobile-first**: most clients are on phones on Ghanaian mobile data.
   Check 320, 375, 414, 768, 1024, 1440. No sideways scroll, nothing past
   the edge, tap targets 40px or more, inputs 16px.
4. **Readable everywhere**: every section declares `data-ground`; text colour
   comes from that ground's tokens. Never put light text on a light ground.
   build-all checks contrast.
5. **Booking is a cart**: "Add" never navigates; every "Book" opens the
   booking sheet (js/booking-cart.js); details asked once; the request lands
   in the Studio Manager. Do not reintroduce page jumps.
6. **The Studio Manager is the CMS**: prices, publish/unpublish, discounts and
   stock set there drive the website through js/besia-live.js.
   It is used by non-technical staff: plain one or two word section names and
   one plain sentence explaining each section.
7. **Grids**: never bare `1fr` where long words live; use `minmax(0, 1fr)`.
   `[hidden]` must always win (`display:none !important`).
8. **Click handlers**: any global link handler must respect
   `e.defaultPrevented` (a page-transition handler once hijacked every click).
9. Service prices (83 services) are her official list. Shop product prices
   and course fees are still placeholders: never present them as confirmed.
10. Same domain as `besia-classic`: storage keys and caches here use `besia-`,
    the classic site uses `besia-classic-`. The service worker only deletes
    its own `besia-` caches. Keep it that way.
11. Never kill processes by image name (e.g. `taskkill /IM python.exe`).
    Stop only what you started.
12. Do not claim something works until it has been exercised in a browser.

## Open items for the client
- Confirm shop prices, course fees, and that hello@besia.co is a live inbox.
- Ask for her original videos and photos sent as WhatsApp *Documents*
  (current media is WhatsApp-compressed; drop originals into
  `NEW VIDEOS AND IMAGES/` with the same names and rerun build-video.js).
- Some listings show CBK Beauty at her address; confirm the relationship.
- The manager has no login yet (promised in the contract, production work).
- `IS_PROPOSAL = true` in tools/build-seo.js keeps the site out of search
  engines. Flip to false and rebuild on the day it becomes her real site.
