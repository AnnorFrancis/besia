/* ============================================================
   BĒSIA BEAUTY STUDIO, besia-data.js
   SINGLE SOURCE OF TRUTH for the whole system.

   Every page, the booking estimator, the shop, the chat
   assistant and the admin all read from this one file.
   Change a price, a phone number or an opening hour HERE and
   it changes everywhere. Nothing else needs editing.

   Service menu, durations and prices are the studio's real
   published menu (83 services across 14 categories, official Fresha export of 9 Sep 2026).
   ============================================================ */
(function (root) {
  'use strict';

  /* ---------- The business ---------- */
  var BUSINESS = {
    name: 'Bēsia',
    nameFull: 'Bēsia Beauty Studio',
    namePlain: 'Besia Beauty Studio',
    wordmark: 'BĒSIA',
    subMark: 'BEAUTY STUDIO',
    tagline: 'Beauty with intention',
    positioning: "Ghana's home of fusion extensions",
    strapline: 'Nourish your roots. Protect your peace.',

    /* Contact */
    phone: '024 078 7993',
    phoneIntl: '+233240787993',
    whatsapp: '233240787993',
    whatsappLink: 'https://wa.me/233240787993',
    email: 'hello@besia.co',

    /* Where */
    street: '54 Fifth Circular Road',
    area: 'Cantonments',
    city: 'Accra',
    region: 'Cantonments, Accra',
    country: 'Ghana',
    addressLine: '54 Fifth Circular Road, Cantonments, Accra',
    lat: 5.57959508895874,
    lng: -0.1650283932685852,

    /* When, Mon–Sat 9am–7pm, closed Sunday */
    openDays: [1, 2, 3, 4, 5, 6],
    openHour: 9,
    closeHour: 19,
    hoursLabel: 'Mon-Sat · 9am-7pm',
    hoursShort: 'Mon-Sat, 9-7',
    closedLabel: 'Sunday',

    /* Money */
    currency: 'GHS',
    deliveryFee: 30,

    /* Elsewhere */
    instagram: 'https://instagram.com/besia.hq',
    instagramHandle: '@besia.hq',
    tiktok: 'https://www.tiktok.com/@besiahq',
    tiktokHandle: '@besiahq',
    booking: 'https://www.fresha.com/a/besia-beauty-studio-cantonments-accra-54-fifth-circular-road-efsd10dz',

    /* Proof */
    rating: 5.0,
    reviewCount: 16,

    /* Storage namespace, MUST stay unique per client build.
       localStorage is scoped per ORIGIN, not per path, so two
       demos on the same host would collide without this. */
    ns: 'besia'
  };

  var SERVICE_CATEGORIES = [
    { key: "Extensions", label: "Fusion Extensions", blurb: "KTips, tape-ins, weaves and V-Light invisibles, the work Bēsia is known for.", slug: "ext" },
    { key: "Texture Systems + Treatments", label: "Texture Systems", blurb: "Vegan, formaldehyde-free straightening and texture release.", slug: "tex" },
    { key: "Scalp + Bond Repair Treatments", label: "Scalp + Bond Repair", blurb: "Treatment-led care: flaxseed, GRO hot oil, Olaplex and K18.", slug: "scalp" },
    { key: "Naturals | Curls & Coils", label: "Naturals, Curls & Coils", blurb: "Curl Revive wash-and-go and cutting for natural texture.", slug: "nat" },
    { key: "Color Service", label: "Colour", blurb: "All-over colour, balayage, highlights and custom blends.", slug: "color" },
    { key: "Cut Service", label: "Cutting", blurb: "Precision cutting, layers and trims.", slug: "cut" },
    { key: "Braids | Cornrows", label: "Braids & Cornrows", blurb: "Cornrow updos and large braids, finished clean.", slug: "braid" },
    { key: "Hair Styling", label: "Styling", blurb: "Silkpress Xpress: signature wash, blow dry, press and style.", slug: "style" },
    { key: "Wig Service", label: "Wig Service", blurb: "Frontal installation, fitted and blended.", slug: "wig" },
    { key: "Eyelashes & Eyebrows", label: "Lashes & Brows", blurb: "Lash sets, lifts and tints. Brows waxed, laminated and tinted.", slug: "lash" },
    { key: "Facials", label: "Facials", blurb: "The Bēsia Glow, custom and deep-cleanse facials.", slug: "facial" },
    { key: "Wax Service", label: "Waxing", blurb: "Gentle waxing from brow to Brazilian, with vajacial after-care.", slug: "wax" },
    { key: "Makeup Service", label: "Make-Up", blurb: "Soft glam to full glam, plus one-to-one lessons.", slug: "makeup" },
    { key: "General", label: "Consultations & Basics", blurb: "Start with a consultation. The first one is free.", slug: "gen" }
  ];

  var SERVICES = [
    { cat: "Extensions", name: "100 grams - KTips", price: 2500, from: null, to: null, mins: 240, dur: "4 hr",
      short: "Fuller, natural-looking hair with 100 grams of KTips, applied for a seamless finish." },
    { cat: "Extensions", name: "150 grams - KTips", price: 3000, from: null, to: null, mins: 240, dur: "4 hr",
      short: "Length and volume with 150 grams of KTips that blend seamlessly for a natural look and feel." },
    { cat: "Extensions", name: "200 grams - KTips", price: 3500, from: null, to: null, mins: 330, dur: "5 hr 30 min",
      short: "200 grams of KTips for a fuller, more luxurious style with a seamless blend." },
    { cat: "Extensions", name: "250 grams - KTips", price: 4000, from: null, to: null, mins: 360, dur: "6 hr",
      short: "250 grams of KTips, tailored to your style for fuller, natural-looking extensions." },
    { cat: "Extensions", name: "300 grams - KTips", price: 4500, from: null, to: null, mins: 420, dur: "7 hr",
      short: "Bold volume and length with 300 grams of KTips. Plus GHS 500 for every additional 50 grams." },
    { cat: "Extensions", name: "Invisible KTips", price: null, from: 7000, to: null, mins: 600, dur: "10 hr",
      short: "Micro KTips so fine they are extremely undetectable. Our most seamless installation." },
    { cat: "Extensions", name: "V-Light Extensions/Invisibles - Hairline", price: null, from: 1000, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Light-cured, nearly invisible bonds along the hairline. Ideal for fine hair or covering alopecia." },
    { cat: "Extensions", name: "V-Light Extensions/Invisibles - Full Head", price: null, from: 4000, to: null, mins: 240, dur: "4 hr",
      short: "A full head of V-Light extensions: lightweight, seamless bonds set by UV light in seconds." },
    { cat: "Extensions", name: "Seamless Tape-Ins", price: 1500, from: null, to: null, mins: 150, dur: "2 hr 30 min",
      short: "Wash, install and style. Ultra-thin adhesive strips that lay flat and move naturally. Hair excluded." },
    { cat: "Extensions", name: "Classic Weave Install - One Part Leave Out", price: 680, from: null, to: null, mins: 120, dur: "2 hr",
      short: "Wash, expert weave installation and styling, with a one part leave out for seamless blending." },
    { cat: "Extensions", name: "Closure Weave Install", price: 1000, from: null, to: null, mins: 120, dur: "2 hr",
      short: "A flawless weave finish using a closure, for a polished look with no leave out." },
    { cat: "Extensions", name: "Illusion Crochet", price: null, from: 850, to: null, mins: 240, dur: "4 hr",
      short: "Crochet extensions that blend seamlessly for length, volume or creative style. Price depends on length and style." },
    { cat: "Extensions", name: "KTip Removal", aux: true, price: 850, from: null, to: null, mins: 60, dur: "1 hr",
      short: "A gentle, precise release of your KTips that leaves your natural hair healthy." },
    { cat: "Extensions", name: "Weave/Ponytail Take Down", aux: true, price: null, from: 150, to: null, mins: 60, dur: "1 hr",
      short: "Careful take down for weave extensions and ponytails." },
    { cat: "Extensions", name: "Braids Take Down", aux: true, price: null, from: 200, to: null, mins: 60, dur: "1 hr",
      short: "Careful, low-tension take down for braids." },
    { cat: "Texture Systems + Treatments", name: "Vegan Keratin Treatment - Nanoplasty", bundle: true, price: 4650, from: null, to: null, mins: 270, dur: "4 hr 30 min",
      short: "A luxury five-step service: intense mask, steam therapy, then a full nanoplasty for smooth, frizz-free, permanent results." },
    { cat: "Texture Systems + Treatments", name: "Texture Release - Hair Botox", price: 3850, from: null, to: null, mins: 210, dur: "3 hr 30 min",
      short: "A vegan infusion of fullness and shine that smooths and loosens texture without straightening it away. Lasts 6 to 8 months." },
    { cat: "Texture Systems + Treatments", name: "Perm Retouch and Style", price: 850, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Retouch for relaxed hair, finished with a style." },
    { cat: "Scalp + Bond Repair Treatments", name: "Bēsia Hair CPR Treatment", price: 1500, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Our signature conditioning and scalp treatment: restores moisture, strengthens, and promotes healthy growth." },
    { cat: "Scalp + Bond Repair Treatments", name: "Scalp + Dandruff Intensive Detox", price: 550, from: null, to: null, mins: 45, dur: "45 min",
      short: "Custom scalp serum, wet and dry salt scrub, head spa massage and a clarifying wash." },
    { cat: "Scalp + Bond Repair Treatments", name: "Flax Seed + Aloe Treatment", price: 450, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Our in-house flaxseed and aloe mask: strengthens, hydrates, soothes the scalp and defines curls." },
    { cat: "Scalp + Bond Repair Treatments", name: "GRO Hot Oil Treatment", price: 350, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Premium in-house blended olive and essential oil treatment, warmed to seal the cuticle and prevent breakage." },
    { cat: "Scalp + Bond Repair Treatments", name: "Olaplex Treatment", price: 850, from: null, to: null, mins: 120, dur: "2 hr",
      short: "The complete solution to repair, rebuild and restore broken hair bonds." },
    { cat: "Scalp + Bond Repair Treatments", name: "K18 Treatment and Bond Repair", price: 550, from: null, to: null, mins: 60, dur: "1 hr",
      short: "K18 molecular repair mask that reverses damage from bleach, colour, chemicals and heat." },
    { cat: "Scalp + Bond Repair Treatments", name: "Deep Moisture Treatment", price: 400, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Deep hydration that leaves dry, damaged strands soft, smooth and full of life." },
    { cat: "Scalp + Bond Repair Treatments", name: "Deep Moisture Treatment + Curl Revive", bundle: true, price: 950, from: null, to: null, mins: 150, dur: "2 hr 30 min",
      short: "Deep hydration followed by our signature Curl Revive wash-and-go." },
    { cat: "Scalp + Bond Repair Treatments", name: "Curl Revive + Flax", bundle: true, price: 1000, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Curl Revive paired with the flaxseed and aloe treatment: hydration and definition in one sitting." },
    { cat: "Scalp + Bond Repair Treatments", name: "Curl Revive with FlaxGRO", bundle: true, price: 1350, from: null, to: null, mins: 210, dur: "3 hr 30 min",
      short: "Curl Revive plus flax and GRO hot oil, deep conditioning and scalp repair in one session." },
    { cat: "Scalp + Bond Repair Treatments", name: "Curl Revive + GRO Hot Oil Treatment", bundle: true, price: 900, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Curl Revive paired with the warmed GRO oil treatment." },
    { cat: "Scalp + Bond Repair Treatments", name: "Hair Loss + Growth Treatment", bundle: true, price: 800, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Flax and aloe with GRO hot oil, focused on the scalp to support growth and restoration." },
    { cat: "Naturals | Curls & Coils", name: "Curl Revive | Wash + Go", price: 550, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Our luxurious wash-and-go: in-house flaxseed, rosemary and olive blends plus gentle steam for defined, bouncy curls." },
    { cat: "Naturals | Curls & Coils", name: "Curly Cut", price: 585, from: null, to: null, mins: 105, dur: "1 hr 45 min",
      short: "A specialised cut shaped to your curl pattern and density, finished with a Curl Revive wash-and-go." },
    { cat: "Color Service", name: "All Over Color - Short", price: 650, from: null, to: null, mins: 180, dur: "3 hr",
      short: "Roots-to-ends colour in the shade of your choice, on short hair." },
    { cat: "Color Service", name: "All Over Color - Medium", price: 950, from: null, to: null, mins: 180, dur: "3 hr",
      short: "Roots-to-ends colour in the shade of your choice, on medium-length hair." },
    { cat: "Color Service", name: "All Over Color - Long", price: 1350, from: null, to: null, mins: 180, dur: "3 hr",
      short: "Roots-to-ends colour in the shade of your choice, on long hair." },
    { cat: "Color Service", name: "Balayage - Short", price: null, from: 850, to: null, mins: 120, dur: "2 hr",
      short: "Hand-painted, sun-kissed highlights on short hair. Low maintenance, works on any base colour." },
    { cat: "Color Service", name: "Balayage - Medium", price: null, from: 1250, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Hand-painted, sun-kissed highlights on medium-length hair." },
    { cat: "Color Service", name: "Full Highlights", price: null, from: 1500, to: 2350, mins: 240, dur: "4 hr",
      short: "Luminous highlights throughout. Short GHS 1,500, medium GHS 1,850, long GHS 2,350." },
    { cat: "Color Service", name: "Custom Color", price: null, from: 2000, to: null, mins: 120, dur: "2 hr",
      short: "Custom balayage and highlights with baby lights on the crown. Includes toning." },
    { cat: "Cut Service", name: "Trim", price: 165, from: null, to: null, mins: 60, dur: "1 hr",
      short: "A quick, precise trim to remove split ends and keep your style neat." },
    { cat: "Cut Service", name: "Precision Cut", price: 300, from: null, to: null, mins: 60, dur: "1 hr",
      short: "A sharp, symmetrical cut that keeps your hair even from every angle." },
    { cat: "Cut Service", name: "Layers", price: null, from: 250, to: null, mins: 60, dur: "1 hr",
      short: "A custom layer cut tailored to your hair. A consultation first is recommended." },
    { cat: "Braids | Cornrows", name: "Cornrow Updo", price: null, from: 550, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Cornrows finished into a clean updo." },
    { cat: "Braids | Cornrows", name: "Large Braids", price: 650, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Includes wash and prep. Hair GHS 50 per pack, up to 20 inches. Goddess, Bora Bora or Boho finish plus GHS 200 including hair." },
    { cat: "Hair Styling", name: "Silkpress Xpress", price: 550, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Signature wash, brush blow dry, press and style." },
    { cat: "Wig Service", name: "Frontal Installation", price: 500, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "A seamless frontal application, customised and styled to match the occasion." },
    { cat: "Eyelashes & Eyebrows", name: "Classic Set", price: 400, from: null, to: null, mins: 150, dur: "2 hr 30 min",
      short: "One extension per natural lash for a longer, still-natural look. Best with plenty of natural lashes." },
    { cat: "Eyelashes & Eyebrows", name: "Angel Set", price: 430, from: null, to: null, mins: 150, dur: "2 hr 30 min",
      short: "One-to-one extensions with no fans. Between a classic and a Lala set." },
    { cat: "Eyelashes & Eyebrows", name: "Lala Set", price: 460, from: null, to: null, mins: 150, dur: "2 hr 30 min",
      short: "A fuller wet-look set, light and wispy. Ideal if your natural lashes are sparse." },
    { cat: "Eyelashes & Eyebrows", name: "Hybrid Set", price: 500, from: null, to: null, mins: 150, dur: "2 hr 30 min",
      short: "Airy but fuller than classic. Not as thick as a volume set." },
    { cat: "Eyelashes & Eyebrows", name: "Classic/Angel Refill", price: 280, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Refill within 3 weeks, with at least 40% of your set remaining. Bēsia sets only." },
    { cat: "Eyelashes & Eyebrows", name: "Lala Refill", price: 300, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Refill within 3 weeks, with at least 40% of your set remaining. Bēsia sets only." },
    { cat: "Eyelashes & Eyebrows", name: "Hybrid Refill", price: 300, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Refill within 3 weeks, with at least 40% of your set remaining. Bēsia sets only." },
    { cat: "Eyelashes & Eyebrows", name: "Lash Touch Up", price: 180, from: null, to: null, mins: 40, dur: "40 min",
      short: "A quick top-up before your two-week refill, for an event or a night out. Within 8 days of your set." },
    { cat: "Eyelashes & Eyebrows", name: "Bottom Lashes", price: 80, from: null, to: null, mins: 30, dur: "30 min",
      short: "Short extensions on the bottom lash line, volume adjusted to preference." },
    { cat: "Eyelashes & Eyebrows", name: "Lash Lift", price: 255, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Curls your natural lashes to appear longer and darker, no extensions." },
    { cat: "Eyelashes & Eyebrows", name: "Lash Lift + Tint", price: 315, from: null, to: null, mins: 60, dur: "1 hr",
      short: "A lash lift finished with tint for a darker, defined look." },
    { cat: "Eyelashes & Eyebrows", name: "Lash Removal", aux: true, price: 80, from: null, to: null, mins: 40, dur: "40 min",
      short: "Safe removal of lash extensions." },
    { cat: "Eyelashes & Eyebrows", name: "Patch Test", price: 0, from: null, to: null, mins: 5, dur: "5 min",
      short: "A free glue-allergy test before your first set. Book 2 days ahead with a lash appointment." },
    { cat: "Eyelashes & Eyebrows", name: "Brow Wax", price: 80, from: null, to: null, mins: 20, dur: "20 min",
      short: "Clean, precise brow shaping with wax." },
    { cat: "Eyelashes & Eyebrows", name: "Brow Lamination", price: 150, from: null, to: null, mins: 40, dur: "40 min",
      short: "Sets brow hairs to appear longer and darker. Includes free shaping." },
    { cat: "Eyelashes & Eyebrows", name: "Brow Lamination + Wax", price: 220, from: null, to: null, mins: 50, dur: "50 min",
      short: "Lamination with a full wax shape." },
    { cat: "Eyelashes & Eyebrows", name: "Lamination + Wax + Tint", bundle: true, price: 330, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "The complete brow service: laminated, waxed and tinted." },
    { cat: "Eyelashes & Eyebrows", name: "Wax + Tint", price: 200, from: null, to: null, mins: 45, dur: "45 min",
      short: "Brows shaped with wax and finished with tint." },
    { cat: "Eyelashes & Eyebrows", name: "Brow Tint Only", price: 100, from: null, to: null, mins: 30, dur: "30 min",
      short: "Tint alone, for darker, fuller-looking brows." },
    { cat: "Facials", name: "Bēsia Glow", price: 400, from: null, to: null, mins: 75, dur: "1 hr 15 min",
      short: "Brightening facial: turmeric soap deep cleanse, exfoliation, a brightening or turmeric-honey mask, plus light therapy." },
    { cat: "Facials", name: "Custom Facial", price: null, from: 450, to: null, mins: 75, dur: "1 hr 15 min",
      short: "Cleansing, exfoliation, extractions and masks chosen for your skin type, with facial massage." },
    { cat: "Facials", name: "Detox + Deep Cleanse Facial", price: 450, from: null, to: null, mins: 75, dur: "1 hr 15 min",
      short: "Deep pore cleansing, manual extractions and a detoxifying mask for clearer skin." },
    { cat: "Wax Service", name: "Brazilian", price: 385, from: null, to: null, mins: 45, dur: "45 min",
      short: "Complete, gentle hair removal with sensitive-skin wax." },
    { cat: "Wax Service", name: "Vajacial", price: 200, from: null, to: null, mins: 30, dur: "30 min",
      short: "A post-wax intimate facial: deep cleanse, gentle extraction, hydrating mask and soothing treatment." },
    { cat: "Wax Service", name: "Vajacial + Brazilian", bundle: true, price: 585, from: null, to: null, mins: 75, dur: "1 hr 15 min",
      short: "The Brazilian and the vajacial together, waxed then soothed in one visit." },
    { cat: "Wax Service", name: "Half Leg", price: 350, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Smooth results that last 4 to 6 weeks." },
    { cat: "Wax Service", name: "Underarm", price: 185, from: null, to: null, mins: 30, dur: "30 min",
      short: "Quick and precise, with reduced irritation." },
    { cat: "Wax Service", name: "Eyebrow", price: 200, from: null, to: null, mins: 35, dur: "35 min",
      short: "Brows cleaned and shaped with wax." },
    { cat: "Wax Service", name: "Upper Lip", price: 100, from: null, to: null, mins: 15, dur: "15 min",
      short: "Quick, gentle upper lip wax." },
    { cat: "Makeup Service", name: "Full Glam w/Lashes", price: 1875, from: null, to: null, mins: 60, dur: "1 hr",
      short: "Head-turning glam with expertly applied make-up and flawless lashes. For occasions and photoshoots." },
    { cat: "Makeup Service", name: "Soft Glam w/Lashes", price: 1625, from: null, to: null, mins: 40, dur: "40 min",
      short: "Soft, elegant and effortlessly chic, complete with lashes." },
    { cat: "Makeup Service", name: "Soft Glam [No Lashes]", price: 1250, from: null, to: null, mins: 30, dur: "30 min",
      short: "A radiant, understated finish without false lashes." },
    { cat: "Makeup Service", name: "Make-Up Bag Deep Dive", price: 750, from: null, to: null, mins: 40, dur: "40 min",
      short: "A guided look through your own products: what to keep, what to refresh, how to use it all." },
    { cat: "Makeup Service", name: "Make-Up Lesson 1:1 [90 Minutes]", price: 1500, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "A personal 90-minute lesson with our make-up artist, Giselle Ali." },
    { cat: "General", name: "Free Hair Consultation", price: 0, from: null, to: null, mins: 30, dur: "30 min",
      short: "Hair and scalp analysis, custom recommendations and extension guidance. Free, with no pressure to book." },
    { cat: "General", name: "Hair Wellness/Extension Consultation", price: 200, from: null, to: null, mins: 60, dur: "1 hr",
      short: "A full assessment and a personalised plan for your hair health and extensions." },
    { cat: "General", name: "Basic Wash + Blowdry", price: 350, from: null, to: null, mins: 60, dur: "1 hr",
      short: "A refreshing wash and blow dry, styled to perfection." }
  ];

  /* ---------- The shop ----------
     Bēsia sells hair as well as service. Categories mirror what the
     studio actually installs: fusion KTips, tape-ins, raw bundles, HD
     closures and frontals, glueless units, plus a home-care shelf built
     from the exact products named in the treatment menu (flaxseed, GRO
     hot oil, K18, Olaplex) and the Moringa line the studio has announced.

     NOTE: retail prices below are INDICATIVE PLACEHOLDERS and must be
     confirmed with the owner before launch. The SERVICE prices above are
     the studio's real published menu and are accurate.
  */
  var PRODUCT_CATEGORIES = [
    { key: 'extensions',  label: 'Extensions & Bundles' },
    { key: 'closures',    label: 'Closures & Frontals' },
    { key: 'wigs',        label: 'Wigs & Units' },
    { key: 'care',        label: 'Home Care' },
    { key: 'accessories', label: 'Studio Accessories' }
  ];

  var PRODUCTS = [
    { cat:'extensions', name:'KTip Fusion Bundle, 100g',      price:1850, img:'images/extensions/ext-1.jpg',         blurb:'Salon-grade keratin tips, the same hair we use for the 100g install.' },
    { cat:'extensions', name:'KTip Fusion Bundle, 150g',      price:2600, img:'images/extensions/ext-2.jpg',         blurb:'Fuller density for longer or thicker natural hair.' },
    { cat:'extensions', name:'Seamless Tape-In Weft Set',      price:1450, img:'images/bundles/bundle-1.jpg',         blurb:'Ultra-thin medical-grade wefts. Reusable two to three times.' },
    { cat:'extensions', name:'Raw Straight Bundle, 3 pack',   price:1200, img:'images/bundles/bundle-2.jpg',         blurb:'Unprocessed raw hair. Holds colour and heat without shedding.' },

    { cat:'closures',   name:'HD Lace Closure, 5×5',          price:980,  img:'images/closures-frontals/unit-1.jpg', blurb:'Melts clean at the parting. Knots bleached on request.' },
    { cat:'closures',   name:'HD Lace Frontal, 13×4',         price:1350, img:'images/closures-frontals/unit-2.jpg', blurb:'Ear-to-ear frontal for full styling freedom.' },
    { cat:'closures',   name:'Curly Illusion Crochet Set',     price:720,  img:'images/closures-frontals/unit-3.jpg', blurb:'Pre-looped curls for the 360 Illusion Crochet look.' },

    { cat:'wigs',       name:'Glueless Unit, Body Wave',      price:2400, img:'images/wigs/wig-1.jpg',               blurb:'Adjustable band, no glue. Ready to wear out of the box.' },
    { cat:'wigs',       name:'Glueless Unit, Kinky Straight', price:2650, img:'images/wigs/wig-2.jpg',               blurb:'Blends with relaxed and silk-pressed natural hair.' },
    { cat:'wigs',       name:'Curly Bob Unit',                 price:1900, img:'images/wigs/wig-3.jpg',               blurb:'Shoulder-skimming curl, light enough for every day.' },
    { cat:'wigs',       name:'Silk Press Straight Unit',       price:2200, img:'images/wigs/wig-4.jpg',               blurb:'Bone straight with movement, cut into soft layers.' },
    { cat:'wigs',       name:'Deep Wave Unit',                 price:2500, img:'images/wigs/wig-5.jpg',               blurb:'Defined deep wave that revives with water and product.' },
    { cat:'wigs',       name:'Pixie Curl Unit',                price:1650, img:'images/wigs/wig-6.jpg',               blurb:'Short, light and low maintenance. A holiday favourite.' },

    { cat:'care', name:'Moringa Ginseng Follicle Fuel Beard Oil', price:180, img:'images/hair-care-cosmetics/care-1.jpg', blurb:'Moringa and ginseng for follicle strength. Launching soon, reserve yours.', preorder:true },
    { cat:'care', name:'Moringa Root Fuel Scalp Oil',             price:220, img:'images/hair-care-cosmetics/care-2.jpg', blurb:'The scalp half of the Moringa line. Launching soon, reserve yours.', preorder:true },
    { cat:'care', name:'Flax Seed + Aloe Hair Mask',              price:190, img:'images/hair-care-cosmetics/care-3.jpg', blurb:'The in-house mask from our Flax Seed + Aloe treatment. Take it home.' },
    { cat:'care', name:'K18 Molecular Repair Leave-In',           price:650, img:'images/hair-care-cosmetics/care-4.jpg', blurb:'Keeps bond repair working between salon treatments.' },
    { cat:'care', name:'Olaplex No.3 Hair Perfector',             price:480, img:'images/hair-care-cosmetics/care-5.jpg', blurb:'The weekly at-home step after colour or texture work.' },

    { cat:'accessories', name:'Satin-Lined Bonnet',         price:120, img:'images/accessories/acc-1.jpg', blurb:'Protects a fresh silk press or install overnight.' },
    { cat:'accessories', name:'Wide-Tooth Detangling Comb', price:85,  img:'images/accessories/acc-2.jpg', blurb:'Detangles curls wet without snapping the bond.' },
    { cat:'accessories', name:'Microfibre Curl Towel',      price:140, img:'images/accessories/acc-3.jpg', blurb:'Dries without frizz. Essential for a wash-and-go.' },
    { cat:'accessories', name:'Silk Scrunchie Set',         price:95,  img:'images/accessories/acc-4.jpg', blurb:'Three silk scrunchies that hold without creasing.' },
    { cat:'accessories', name:'Bēsia Studio Tote',          price:150, img:'images/accessories/acc-5.jpg', blurb:'The studio tote, in Bēsia black.' }
  ];

  /* ---------- The team ---------- */
  var TEAM = [
    { name:'Dana',      role:'Founder · Fusion Extension Specialist', skills:'KTips, microlinks, texture systems', since:2023 },
    { name:'Rabs',      role:'Lash, Brow & Hair Artist',              skills:'Lash sets, brows, styling',          since:2024 },
    { name:'Francis',   role:'Senior Stylist',                        skills:'Silk press, colour, cutting',        since:2024 },
    { name:'Hair Club', role:'The Hair Club at Bēsia',                skills:'Scalp care, treatments, naturals',   since:2025 }
  ];

  /* ---------- What clients actually said (Fresha, 5.0 from 16) ---------- */
  var REVIEWS = [
    { name:'Joyce F',    date:'2026-08-10', stars:5, service:'Two services with Rabs', text:'Always a 100/10 experience!! It feels like coming home, resetting mind, spirit and obviously looks! They eat every blessed time!! Thank you.' },
    { name:'Judith O',   date:'2026-04-17', stars:5, service:'Silk press with Francis', text:'Very calm environment, great personalised service. I met the lovely owner, Dana, who was very thoughtful and a breath of fresh air. Clearly very knowledgeable.' },
    { name:'Akosua A',   date:'2026-08-05', stars:5, service:'Hybrid lash set with Rabs', text:'Great service! Very receptive and personable, willing to adjust whatever needs tweaking to achieve customer satisfaction. Keep up the good work, Rabs!' },
    { name:'Afia A',     date:'2026-08-05', stars:5, service:'Lala set with Rabs', text:'Loooooooved it! Everyone is so friendly and very skilled.' },
    { name:'Nana Aba A', date:'2026-06-15', stars:5, service:'Scalp treatment', text:'Relaxing, informative and so worth it.' },
    { name:'Ama O',      date:'2026-04-16', stars:5, service:'Regular client', text:'Great service as always.' }
  ];

  /* ---------- The training school ----------
     Bēsia teaches as well as styles. Students either pay in full or pay
     half to reserve a seat and settle the balance before the last day.

     NOTE: course content and fees are a first draft built from the
     studio's own disciplines. Confirm both with the owner.
  */
  var COURSE_PAYMENT = {
    depositPercent: 50,
    note: 'Pay in full, or half to reserve your seat and the balance before the final day.'
  };

  var COURSES = [
    {
      id: 'C-FUSION', name: 'Fusion Extensions Masterclass',
      days: 5, fee: 4500, seats: 6, level: 'Advanced',
      blurb: 'Our signature course. KTips and microlinks, start to finish.',
      learn: ['Reading density and deciding what hair can carry', 'Sectioning and bond placement',
              'KTip application and heat control', 'Microlink fitting and tension',
              'Safe removal without breakage', 'Aftercare you can teach your own clients']
    },
    {
      id: 'C-BRAID', name: 'Braiding & Cornrows',
      days: 10, fee: 2500, seats: 8, level: 'Beginner',
      blurb: 'Start here if you are learning from scratch.',
      learn: ['Parting clean and even', 'Tension that protects the edges', 'Feed-in cornrows',
              'Large braids and updos', 'Speed without losing neatness', 'Pricing your own work']
    },
    {
      id: 'C-SILK', name: 'Silk Press & Blow Dry',
      days: 3, fee: 1800, seats: 8, level: 'Beginner',
      blurb: 'The Silkpress Xpress method, taught properly.',
      learn: ['Washing and prepping for heat', 'Brush blow-dry technique',
              'Heat settings by hair type', 'Pressing without heat damage', 'Finishing and shine']
    },
    {
      id: 'C-CURL', name: 'Natural Hair & Curl Care',
      days: 4, fee: 2200, seats: 8, level: 'Beginner',
      blurb: 'Curl Revive, wash-and-go and cutting for texture.',
      learn: ['Curl patterns and porosity', 'Wash-and-go that lasts', 'Steam and deep conditioning',
              'Cutting curly and coily hair', 'Building a client home routine']
    },
    {
      id: 'C-COLOUR', name: 'Colour Fundamentals',
      days: 4, fee: 3000, seats: 6, level: 'Intermediate',
      blurb: 'Colour on textured hair, without wrecking the bonds.',
      learn: ['Colour theory on dark hair', 'Lifting safely', 'Balayage and highlights',
              'Bond protection with Olaplex and K18', 'Correcting a colour that went wrong']
    },
    {
      id: 'C-LASH', name: 'Lashes & Brows',
      days: 3, fee: 2000, seats: 6, level: 'Beginner',
      blurb: 'Classic, hybrid and volume sets, plus brow shaping.',
      learn: ['Eye mapping', 'Isolation and placement', 'Classic, hybrid and volume sets',
              'Brow shaping to face shape', 'Hygiene and patch testing']
    }
  ];

  /* ---------- Who the studio buys from ---------- */
  var SUPPLIERS = [
    { name: 'Accra Hair Imports',   supplies: 'KTip bundles, tape-in wefts, raw bundles', phone: '024 611 3390', terms: '30 days' },
    { name: 'Beauty Depot GH',      supplies: 'Olaplex, K18, colour and developer',       phone: '020 774 5512', terms: 'On delivery' },
    { name: 'Lace & Units Ltd',     supplies: 'HD closures, frontals, glueless units',    phone: '055 209 8814', terms: '14 days' },
    { name: 'Moringa Farms Co-op',  supplies: 'Raw moringa, ginseng, carrier oils',       phone: '027 480 1176', terms: 'On delivery' },
    { name: 'Studio Supplies Ltd',  supplies: 'Towels, capes, foils, gloves, bonnets',    phone: '030 291 6603', terms: '30 days' }
  ];

  /* ---------- Plain-language lists the manager uses ---------- */
  var EXPENSE_CATEGORIES = [
    'Rent', 'Salaries', 'Stock purchase', 'Electricity & water',
    'Transport', 'Marketing', 'Equipment', 'Repairs', 'Other'
  ];

  var PAYMENT_METHODS = ['Cash', 'MTN MoMo', 'Telecel Cash', 'AT Money', 'Card', 'Bank transfer'];

  /* Reorder point: below this many units, Stock flags the item. */
  var LOW_STOCK_AT = 3;

  /* ---------- Helpers every page uses ---------- */
  function money(n) { return BUSINESS.currency + ' ' + Math.round(n).toLocaleString('en-GB'); }

  function priceLabel(s) {
    if (s.price === 0) return 'Free';
    if (s.price != null) return money(s.price);
    if (s.from != null && s.to != null && s.to !== s.from) return money(s.from) + ' to ' + money(s.to);
    if (s.from != null) return 'from ' + money(s.from);
    return 'On consultation';
  }

  /* What a service actually costs, for maths (estimator, totals). */
  function priceOf(s) { return s.price != null ? s.price : (s.from != null ? s.from : 0); }

  function byCategory(catKey) {
    return SERVICES.filter(function (s) { return s.cat === catKey; });
  }

  /* Lowest real price in a category. Every tile's "from" figure is
     computed here, so a tile can never contradict its own price list. */
  function fromPrice(catKey) {
    /* Take-downs and removals (aux) are real services but they are not
       the entry price of a discipline. A tile saying "Extensions from
       GHS 150" would be quoting the take-down, not an install. */
    var pool = byCategory(catKey).filter(function (s) { return !s.aux; });
    if (!pool.length) pool = byCategory(catKey);
    var lows = pool
      .map(priceOf)
      .filter(function (n) { return n > 0; });
    return lows.length ? Math.min.apply(null, lows) : null;
  }

  function categoryOf(key) {
    for (var i = 0; i < SERVICE_CATEGORIES.length; i++) {
      if (SERVICE_CATEGORIES[i].key === key) return SERVICE_CATEGORIES[i];
    }
    return null;
  }

  function isOpenNow(now) {
    var d = now || new Date();
    if (BUSINESS.openDays.indexOf(d.getDay()) === -1) return false;
    var h = d.getHours() + d.getMinutes() / 60;
    return h >= BUSINESS.openHour && h < BUSINESS.closeHour;
  }

  /* Namespaced storage key. localStorage is scoped per ORIGIN, not per
     path, so without this every demo on the same host shares a cart. */
  function key(name) { return BUSINESS.ns + '-' + name; }

  var API = {
    business: BUSINESS,
    serviceCategories: SERVICE_CATEGORIES,
    services: SERVICES,
    productCategories: PRODUCT_CATEGORIES,
    products: PRODUCTS,
    team: TEAM,
    courses: COURSES,
    coursePayment: COURSE_PAYMENT,
    suppliers: SUPPLIERS,
    expenseCategories: EXPENSE_CATEGORIES,
    paymentMethods: PAYMENT_METHODS,
    lowStockAt: LOW_STOCK_AT,
    reviews: REVIEWS,
    money: money,
    priceLabel: priceLabel,
    priceOf: priceOf,
    fromPrice: fromPrice,
    byCategory: byCategory,
    categoryOf: categoryOf,
    isOpenNow: isOpenNow,
    key: key
  };

  root.BESIA = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

})(typeof window !== 'undefined' ? window : globalThis);
