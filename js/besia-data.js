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
    /* The cover's intro line. Dana, 6 Oct: say that we supply beauty
       as well as do it: our products, extensions, lifestyle pieces, books. */
    intro: "Ghana's home of fusion extensions and the first vegan, formaldehyde-free texture system in the country. And a beauty supply: our own products, extensions, lifestyle pieces and books.",
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

    /* When, Mon to Sat 9am to 7pm, closed Sunday */
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
    { key: "Scalp + Bond Repair Treatments", label: "Scalp and Bond Repair", blurb: "Treatment-led care: flaxseed, GRO hot oil, Olaplex and K18.", slug: "scalp" },
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
    { cat: "Extensions", name: "ITips", price: null, from: null, to: null, mins: 240, dur: "Timed at consultation",
      short: "I-tip strands fitted with fine beads, no heat and no glue on your own hair. Priced at your consultation, by density and length." },
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
    { cat: "Scalp + Bond Repair Treatments", name: "Deep Moisture Treatment + Curl Revive", bundle: true, price: 855, was: 950, from: null, to: null, mins: 150, dur: "2 hr 30 min",
      short: "Deep hydration followed by our signature Curl Revive wash-and-go." },
    { cat: "Scalp + Bond Repair Treatments", name: "Curl Revive + Flax", bundle: true, price: 850, was: 1000, from: null, to: null, mins: 90, dur: "1 hr 30 min",
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
    { cat: "Wig Service", name: "Wig Revamp", price: null, from: null, to: null, mins: 120, dur: "Timed at consultation",
      short: "Wash, deep condition, restyle and re-customise a unit you already own, so it wears like new. Priced when we see the unit." },
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
    { cat: "General", name: "The Hair Club Blueprint", price: 500, from: null, to: null, mins: 90, dur: "1 hr 30 min",
      short: "Your one-time hair wellness plan: a full consultation, hair and scalp assessment, a written strategy, product prescription and growth timeline." },
    { cat: "General", name: "Basic Wash + Blowdry", price: 350, from: null, to: null, mins: 60, dur: "1 hr",
      short: "A refreshing wash and blow dry, styled to perfection." }
  ];

  /* ---------- Core services ----------
     Dana's own list (6 Oct 2026), in her order: the services the studio
     leads with. The home page shows one card each; a tap opens the
     booking on exactly the services beneath it. The complete menu
     above stays as it is, she asked for that too.

     `services` are exact names from SERVICES. `img` names a picture in
     media/img, `poster` a film still in media/video, `lib` a file in
     images/. They are stand-ins: she is generating one picture per
     core service, and swapping one is a one-word change here. */
  var CORE_SERVICES = [
    { slug: 'extensions', label: 'Extensions', subs: ['KTips', 'ITips', 'Tape-Ins', 'V-Light', 'Sew-Ins'], img: 'product-model-waves',
      services: ['100 grams - KTips', '150 grams - KTips', '200 grams - KTips', '250 grams - KTips', '300 grams - KTips', 'Invisible KTips', 'ITips',
                 'Seamless Tape-Ins', 'V-Light Extensions/Invisibles - Hairline', 'V-Light Extensions/Invisibles - Full Head',
                 'Classic Weave Install - One Part Leave Out', 'Closure Weave Install', 'KTip Removal', 'Weave/Ponytail Take Down'] },
    { slug: 'treatments', label: 'Treatments', subs: ['Hair CPR', 'Scalp detox', 'Flax + Aloe', 'GRO hot oil', 'Bond repair'], poster: 'wash-ritual',
      services: ['Bēsia Hair CPR Treatment', 'Scalp + Dandruff Intensive Detox', 'Flax Seed + Aloe Treatment', 'GRO Hot Oil Treatment',
                 'Hair Loss + Growth Treatment', 'Olaplex Treatment', 'K18 Treatment and Bond Repair', 'Deep Moisture Treatment'] },
    { slug: 'natural', label: 'Natural Styling', subs: ['Curl Revive', 'Styling'], img: 'editorial-curls-smile',
      services: ['Curl Revive | Wash + Go', 'Curl Revive + Flax', 'Curl Revive + GRO Hot Oil Treatment', 'Curl Revive with FlaxGRO',
                 'Deep Moisture Treatment + Curl Revive', 'Curly Cut'] },
    { slug: 'texture', label: 'Texture System', subs: ['Nanoplasty', 'Hair Botox'], img: 'model-profile-sleek',
      services: ['Vegan Keratin Treatment - Nanoplasty', 'Texture Release - Hair Botox'] },
    { slug: 'silkpress', label: 'Silk Press', subs: ['Wash, blow dry, press and style'], img: 'editorial-hair-story',
      services: ['Silkpress Xpress'] },
    { slug: 'braids', label: 'Braids', subs: ['Large braids', 'Goddess, Bora Bora, Boho'], poster: 'braid-finish',
      services: ['Large Braids', 'Braids Take Down'] },
    { slug: 'crochet', label: 'Crochet', subs: ['Illusion crochet'], img: 'texture-curls',
      services: ['Illusion Crochet'] },
    { slug: 'cornrows', label: 'Cornrows', subs: ['Cornrow updo'], img: 'abeauty-ritual', pos: 'center 30%',
      services: ['Cornrow Updo'] },
    { slug: 'wig-installs', label: 'Wig Installs', subs: ['Frontal installation'], img: 'studio-mirror-chair',
      services: ['Frontal Installation'] },
    { slug: 'wig-revamp', label: 'Wig Revamp', subs: ['Wash, restyle, re-customise'], lib: 'images/services/svc-revamp-after.jpg',
      services: ['Wig Revamp'] },
    { slug: 'colour', label: 'Colour', subs: ['All over', 'Balayage', 'Highlights', 'Custom'], img: 'moodboard-model', pos: '30% center',
      services: ['All Over Color - Short', 'All Over Color - Medium', 'All Over Color - Long', 'Balayage - Short', 'Balayage - Medium', 'Full Highlights', 'Custom Color'] },
    { slug: 'cut', label: 'Cut', subs: ['Trim', 'Precision', 'Layers'], img: 'still-tools',
      services: ['Trim', 'Precision Cut', 'Layers'] },
    { slug: 'lashes', label: 'Lashes', subs: ['Classic', 'Angel', 'Lala', 'Hybrid', 'Lifts'], img: 'product-model-blush',
      services: ['Classic Set', 'Angel Set', 'Lala Set', 'Hybrid Set', 'Classic/Angel Refill', 'Lala Refill', 'Hybrid Refill',
                 'Lash Touch Up', 'Bottom Lashes', 'Lash Lift', 'Lash Lift + Tint', 'Lash Removal', 'Patch Test'] }
  ];

  /* ---------- The shop ----------
     Rebuilt from Dana's own list (6 Oct 2026). Three shelves:

       Bēsia Lab      her own products, made in the studio. Prices are
                      the ones on her Hair Club plan (the investment
                      pages); Beard Oil, Hair Botox and the flax mask
                      are still placeholders until she prices them.
       Professional   the salon brands her plans prescribe.
       Hair           the extensions she is bringing in: bundles, fusion
                      bundles, crochet, tape-ins and frontals, by texture,
                      and for bundles by length, 16 to 30 inches. Every
                      length has its own price; she is sending them, so
                      until a length is priced the site says "Price to
                      follow" and nothing can be ordered at a made-up figure.

     A product with `lengths` is priced per length (`lengthPrices`, and
     the Studio Manager can set each one). `soon` marks hair that is
     arriving; `custom` is made to order, priced on request. A product
     with no `img` is set as a label card in the shop, never a borrowed
     photograph of something else. */
  var LENGTHS = ['16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'];

  var PRODUCT_CATEGORIES = [
    { key: 'lab',      label: 'Bēsia Lab' },
    { key: 'care',     label: 'Professional Care' },
    { key: 'bundles',  label: 'Extensions & Bundles' },
    { key: 'fusion',   label: 'KTip, ITip & Nanobead Bundles' },
    { key: 'crochet',  label: 'Crochet' },
    { key: 'tapeins',  label: 'Tape-Ins' },
    { key: 'frontals', label: 'Frontals' }
  ];

  /* One line about each hair shelf, for the shop's label cards. */
  var HAIR_NOTES = {
    bundles: 'Sixteen to thirty inches. Each length has its own price.',
    fusion: 'For KTips, ITips and nanobeads. Sixteen to thirty inches.',
    crochet: 'Pre-looped, for the Illusion Crochet look.',
    tapeins: 'Ultra-thin wefts that lay flat and move naturally.',
    frontals: '5x5 HD lace that melts at the hairline.'
  };

  function hair(cat, kind, texture, extra) {
    var p = { cat: cat, name: kind + ', ' + texture, title: texture, price: null, soon: true, img: '', blurb: HAIR_NOTES[cat] };
    for (var k in extra) p[k] = extra[k];
    return p;
  }
  function lengthed() { return { lengths: LENGTHS.slice(), lengthPrices: {} }; }

  var PRODUCTS = [
    /* Bēsia Lab, her own line */
    { cat:'lab', name:'Moringa Ginseng Follicle Fuel Hair Growth Oil', title:'Follicle Fuel Hair Growth Oil', price:380, img:'media/video/bottle-specimen-poster.webp', blurb:'Moringa and ginseng, for the scalp first. Feeds the follicle and calms the scalp, for faster, fuller growth.' },
    { cat:'lab', name:'Moringa Ginseng Follicle Fuel Beard Oil', title:'Follicle Fuel Beard Oil', price:180, img:'media/video/beard-oil-poster.webp', blurb:'The same formula in amber glass, for him. Launching soon, reserve yours.', preorder:true },
    { cat:'lab', name:'Bēsia Scalp Polish', price:350, img:'', blurb:'The Root Revival scalp polish from our Hair CPR: lifts dead skin and build-up so new growth has room.' },
    { cat:'lab', name:'Bēsia Chelating Clay Mask', price:380, img:'', blurb:'The detox step of Hair CPR. A clarifying clay that draws out build-up and hard-water minerals.' },
    { cat:'lab', name:'Bēsia Cara Scalp Refresh', price:250, img:'', blurb:'For the scalp between wash days. Made by hand in the Bēsia Lab.' },
    { cat:'lab', name:'Bēsia Hydra-Oil', price:450, img:'', blurb:'Moisture, sealed in. Our in-house oil for dry lengths and ends.' },
    { cat:'lab', name:'Bēsia Hair Botox, 250ml', title:'Bēsia Hair Botox', price:650, img:'media/img/product-hair-botox.webp', blurb:'A vegan, formaldehyde-free deep treatment, no botulinum toxin. The studio formula, to take home.', preorder:true },
    { cat:'lab', name:'Flax Seed + Aloe Hair Mask', price:190, img:'', blurb:'The in-house mask from our Flax Seed + Aloe treatment. Take it home.' },

    /* Professional care, as prescribed on her Hair Club plans */
    { cat:'care', name:'Mizani Hydrating Shampoo, 1L', title:'Mizani Hydrating Shampoo', price:850, img:'', blurb:'One litre. The wash-day shampoo we prescribe for dry, thirsty hair.' },
    { cat:'care', name:'Olaplex No.5 Bond Maintenance Conditioner, 250ml', title:'Olaplex No.5 Conditioner', price:850, img:'', blurb:'Keeps bond repair working between treatments. 250ml.' },
    { cat:'care', name:'Olaplex Bond Smoothing Leave-In', title:'Olaplex Smoothing Leave-In', price:850, img:'', blurb:'A leave-in that smooths and protects the bonds after every wash.' },

    /* Hair: her list, by texture. Pricing to follow. */
    hair('bundles', 'Bundles', 'Raw Straight',       lengthed()),
    hair('bundles', 'Bundles', 'Donor Straight',     lengthed()),
    hair('bundles', 'Bundles', 'Virgin Loose Curl',  lengthed()),

    hair('fusion', 'Fusion Bundles', 'Donor Straight',    lengthed()),
    hair('fusion', 'Fusion Bundles', 'Virgin Loose Curl', lengthed()),
    hair('fusion', 'Fusion Bundles', 'Kinky Straight',    lengthed()),
    hair('fusion', 'Fusion Bundles', 'Custom',            { custom: true, title: 'Custom Fusion Bundles', blurb: 'Made to your colour, texture and length. Tell us what you want and we quote it.' }),

    hair('crochet', 'Crochet', 'Burmese Curl',   {}),
    hair('crochet', 'Crochet', 'Kinky Straight', {}),
    hair('crochet', 'Crochet', 'French Curl',    {}),
    hair('crochet', 'Crochet', 'Loose Wave',     {}),

    hair('tapeins', 'Tape-Ins', 'Donor Straight',    {}),
    hair('tapeins', 'Tape-Ins', 'Raw Straight',      {}),
    hair('tapeins', 'Tape-Ins', 'Virgin Loose Curl', {}),
    hair('tapeins', 'Tape-Ins', 'Kinky Straight',    {}),

    hair('frontals', '5x5 HD Frontal', 'Raw Straight',      {}),
    hair('frontals', '5x5 HD Frontal', 'Donor Straight',    {}),
    hair('frontals', '5x5 HD Frontal', 'Virgin Loose Curl', {}),
    hair('frontals', '5x5 HD Frontal', 'Kinky Straight',    {})
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

  /* The School at Bēsia, also Bēsia Beauty Academy (Dana, 6 Oct: keep
     The School at Bēsia, slip the Academy in). Three hero certifications
     from her Academy brief lead (`hero`), then the other courses. Every
     course can also be taught one to one. Ids are stable because the
     manager's student records point at them. Fees are indicative bands
     for Cantonments and need the owner's sign-off; for Fusion the fee is
     per method, and two methods or all four are quoted as a bundle. */
  var COURSE_FORMATS = ['In a small group', 'One to one'];
  var FUSION_METHODS = ['K-Tip', 'I-Tip', 'Beaded Weft', 'Tape-In'];

  var COURSES = [
    {
      id: 'C-FUSION', name: 'Fusion Extension Specialist', group: 'pro', flagship: true, hero: 1,
      methods: FUSION_METHODS, img: 'product-model-waves',
      line: 'Choose your method. Build your specialty.',
      who: 'Working stylists', format: 'Cohort of four, three days per method, a model day on the last',
      days: 3, fee: 8500, unit: 'per method', seats: 4, level: 'Professional',
      blurb: 'Seamless, high-value extension services, taught with a focus on technique, hair integrity, consultation and the client experience. K-Tip, I-Tip, Beaded Weft or Tape-In: one method, two, or the complete system.',
      includes: ['Tool kit and hair samples', 'Mannequin day, then a live model', 'Manual and aftercare sheets', 'Lunch, every day', 'Three months of WhatsApp mentoring'],
      learn: ['Reading density and deciding what hair can carry', 'Sectioning and bond placement',
              'KTip application and heat control', 'Microlink fitting and tension',
              'Safe removal without breakage', 'Aftercare you can teach your own clients']
    },
    {
      id: 'C-GROWTH', name: 'Healthy Hair & Growth Specialist', group: 'pro', hero: 2, img: 'editorial-curls-smile',
      line: 'Build expertise clients can trust.',
      who: 'Stylists and treatment therapists', format: 'Cohort of four, two days',
      days: 2, fee: 5500, seats: 4, level: 'Professional',
      blurb: 'Bēsia’s approach to healthy hair: scalp care, assessment, treatment planning, retention and professional Growth Therapy. More than styling hair; becoming the person clients trust with its health.',
      includes: ['Bēsia Growth Therapy protocols', 'Treatment kit', 'Model day', 'Certificate of completion'],
      learn: ['Assess: texture, density, porosity, elasticity, damage, breakage, shedding, scalp condition',
              'Treat: professional protocols, scalp care, conditioning, strength and moisture balance, retention',
              'Build: client routines, follow-up, maintenance, home care and long-term relationships',
              'Bēsia Growth Therapy and its professional products']
    },
    {
      id: 'C-TEXTURE', name: 'Hair Botox + Nanoplasty Specialist', group: 'pro', hero: 3, img: 'model-profile-sleek',
      line: 'Add premium transformation to your skill set.',
      who: 'Working stylists', format: 'Cohort of four, two days',
      days: 2, fee: 7200, seats: 4, level: 'Professional',
      blurb: 'The vegan, formaldehyde-free smoothing systems the studio was first to bring to Ghana, from consultation to aftercare. For professionals who want to raise the value of every appointment.',
      includes: ['Starter volumes of both systems', 'Safety and ventilation protocol', 'Model day', 'Certificate of completion', 'Trade pricing afterwards'],
      learn: ['Consultation, hair history, colour and chemical history', 'Suitability assessment and preparation', 'Product selection, application and processing',
              'Heat technique and finishing', 'Aftercare and maintenance', 'Client experience, pricing and positioning']
    },
    {
      id: 'C-COLOUR', name: 'Colour on Textured Hair', group: 'pro',
      who: 'Stylists', format: 'Cohort of four, two days',
      days: 2, fee: 4800, seats: 4, level: 'Professional',
      blurb: 'Balayage, highlights and toning on dark and textured hair, without wrecking the bonds.',
      includes: ['Colour kit', 'Model day', 'Certificate of completion', 'Lunch'],
      learn: ['Colour theory on dark hair', 'Lifting safely', 'Balayage and highlights',
              'Bond protection with Olaplex and K18', 'Correcting a colour that went wrong']
    },
    {
      id: 'C-SILK', name: 'Silk Press and Blow Dry', group: 'pro',
      who: 'Stylists', format: 'Cohort of six, one day',
      days: 1, fee: 2800, seats: 6, level: 'Professional',
      blurb: 'The Silkpress Xpress method, taught properly: a press that respects the curl underneath.',
      includes: ['Heat tools guidance', 'Model', 'Certificate of completion', 'Lunch'],
      learn: ['Washing and prepping for heat', 'Brush blow-dry technique',
              'Heat settings by hair type', 'Pressing without heat damage', 'Finishing and shine']
    },
    {
      id: 'C-BRAID', name: 'Braiding and Cornrows', group: 'pro',
      who: 'Beginners and stylists', format: 'Cohort of six, two days',
      days: 2, fee: 2400, seats: 6, level: 'Foundation',
      blurb: 'Start here if you are learning from scratch. Clean parting, tension that protects the edges, speed without losing neatness.',
      includes: ['Practice head and hair', 'Certificate of completion', 'Lunch'],
      learn: ['Parting clean and even', 'Tension that protects the edges', 'Feed-in cornrows',
              'Large braids and updos', 'Speed without losing neatness', 'Pricing your own work']
    },
    {
      id: 'C-CURL', name: 'Natural Hair and Curl Care', group: 'pro',
      who: 'Beginners and stylists', format: 'Cohort of six, one day',
      days: 1, fee: 2600, seats: 6, level: 'Foundation',
      blurb: 'Curl Revive, wash-and-go and cutting for texture.',
      includes: ['Product kit', 'Model', 'Certificate of completion', 'Lunch'],
      learn: ['Curl patterns and porosity', 'Wash-and-go that lasts', 'Steam and deep conditioning',
              'Cutting curly and coily hair', 'Building a client home routine']
    },
    {
      id: 'C-LASH', name: 'Lash and Brow Certificate', group: 'pro',
      who: 'Beginners and brow artists', format: 'Cohort of four, two days',
      days: 2, fee: 4000, seats: 4, level: 'Foundation',
      blurb: 'Classic, hybrid and volume sets, lifts, lamination and brow shaping, with hygiene and patch testing throughout.',
      includes: ['Practice kit', 'Certificate of completion', 'Lunch'],
      learn: ['Eye mapping', 'Isolation and placement', 'Classic, hybrid and volume sets',
              'Brow shaping to face shape', 'Hygiene and patch testing']
    },
    {
      id: 'C-LEARN', name: 'Learn Your Hair', group: 'client',
      who: 'Clients', format: 'An evening, six people',
      days: 1, fee: 1000, seats: 6, level: 'For clients',
      blurb: 'Two and a half hours with a stylist on your own hair: what it needs, what to stop doing, and a home routine written for you. Take-home kit with Follicle Fuel.',
      includes: ['Take-home kit with Follicle Fuel', 'A written home routine', 'Tea'],
      learn: ['Your curl pattern and porosity', 'Washing, detangling, protecting at night', 'What your scalp is telling you', 'Products worth buying and products to skip']
    },
    {
      id: 'C-MOTHER', name: 'Mother and Daughter Curl Afternoon', group: 'client', unit: 'per pair',
      who: 'Pairs, daughters from six', format: 'An afternoon, four pairs',
      days: 1, fee: 1800, seats: 4, level: 'For clients',
      blurb: 'An afternoon learning to care for curls together, mother and daughter: washing, detangling, two styles that last the week, and a curl-pattern card to keep.',
      includes: ['Products used on the day', 'A light lunch', 'Curl-pattern card and a keepsake photograph'],
      learn: ['Gentle detangling', 'Two protective styles', 'A wash-day routine that works for school weeks', 'Edges and ends']
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
    coreServices: CORE_SERVICES,
    productCategories: PRODUCT_CATEGORIES,
    lengths: LENGTHS,
    hairNotes: HAIR_NOTES,
    products: PRODUCTS,
    team: TEAM,
    courses: COURSES,
    coursePayment: COURSE_PAYMENT,
    courseFormats: COURSE_FORMATS,
    fusionMethods: FUSION_METHODS,
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
