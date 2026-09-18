/* ============================================================
   BĒSIA BEAUTY STUDIO, besia-data.js
   SINGLE SOURCE OF TRUTH for the whole system.

   Every page, the booking estimator, the shop, the chat
   assistant and the admin all read from this one file.
   Change a price, a phone number or an opening hour HERE and
   it changes everywhere. Nothing else needs editing.

   Service menu, durations and prices are the studio's real
   published menu (47 services across 10 categories).
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
    { key: "Extensions", label: "Fusion Extensions", blurb: "KTips, microlinks, tape-ins and weaves, the work Bēsia is known for.", slug: "ext" },
    { key: "Texture Systems + Treatments", label: "Texture Systems", blurb: "Vegan, formaldehyde-free straightening and texture release.", slug: "tex" },
    { key: "Scalp + Bond Repair Treatments", label: "Scalp + Bond Repair", blurb: "Treatment-led care: flaxseed, GRO hot oil, Olaplex and K18.", slug: "scalp" },
    { key: "Color Service", label: "Colour", blurb: "All-over colour, balayage, highlights and custom blends.", slug: "color" },
    { key: "Naturals | Curls & Coils", label: "Naturals, Curls & Coils", blurb: "Curl Revive wash-and-go and cutting for natural texture.", slug: "nat" },
    { key: "Cut Service", label: "Cutting", blurb: "Precision, curly and coily cutting, layers and trims.", slug: "cut" },
    { key: "Braids | Cornrows", label: "Braids & Cornrows", blurb: "Cornrow updos and large braids, finished clean.", slug: "braid" },
    { key: "Hair Styling", label: "Styling", blurb: "Silkpress Xpress: signature wash, blow dry, press and style.", slug: "style" },
    { key: "Wig Service", label: "Wig Service", blurb: "Frontal installation, fitted and blended.", slug: "wig" },
    { key: "General", label: "Consultations & Basics", blurb: "Start with a consultation. The first one is free.", slug: "gen" }
  ];
  
  var SERVICES = [
    { cat: "Extensions", name: "Classic Weave Install - One Part Leave Out", price: 680, from: null, to: null, mins: 120, dur: "2 hr", featured: false,
      short: "Experience a flawless transformation with a service that includes a thorough wash, expert weave installation, and personalized styling.",
      desc: "Experience a flawless transformation with a service that includes a thorough wash, expert weave installation, and personalized styling. Enjoy a natural look with a one part leave out for seamless blending and a finish tailored to your unique style." },
    { cat: "Extensions", name: "KTip Removal", price: 850, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Enjoy a gentle and precise process to remove your KTip extensions.",
      desc: "Enjoy a gentle and precise process to remove your KTip extensions. Our skilled professionals ensure a careful release, leaving your natural hair healthy and free of damage. Trust us to help you transition seamlessly back to your beautiful natural locks." },
    { cat: "Extensions", name: "Illusion Crochet", price: null, from: 850, to: null, mins: 240, dur: "4 hr", featured: false,
      short: "Achieve a stunning look with crochet hair extensions that blend seamlessly for a natural finish.",
      desc: "Achieve a stunning look with crochet hair extensions that blend seamlessly for a natural finish. This service offers a versatile way to add length, volume, or creative style to your hair. Enjoy a comfortable installation and a refreshed appearance with this popular extension method. Price is subject to length and style." },
    { cat: "Extensions", name: "Closure Weave Install", price: 1000, from: null, to: null, mins: 120, dur: "2 hr", featured: false,
      short: "Achieve a seamless, natural-looking style with this professional weave installation.",
      desc: "Achieve a seamless, natural-looking style with this professional weave installation. Ideal for anyone seeking versatility and added length, this service creates a flawless finish using a closure for a polished appearance. Enjoy a comfortable, secure fit for everyday confidence and beauty." },
    { cat: "Extensions", name: "V-Light Extensions/Invisibles - Hairline", price: null, from: 1000, to: null, mins: 90, dur: "1 hr 30 min", featured: false,
      short: "V-Light extensions are a new, innovative hair extension method using a UV LED light to rapidly cure a special adhesive, creating nearly invisible, lightweight bonds that are seamless and comfortable.",
      desc: "V-Light extensions are a new, innovative hair extension method using a UV LED light to rapidly cure a special adhesive, creating nearly invisible, lightweight bonds that are seamless and comfortable, ideal for fine hair or covering alopecia, with quick application and removal, lasting several weeks to months depending on maintenance. The process integrates extensions with natural hair using a light-activated glue that sets in seconds, offering a natural look without sticky residue and allowing for versatile use on crowns, hairlines, or full heads" },
    { cat: "Extensions", name: "Seamless Tape-Ins", price: 1500, from: null, to: null, mins: 150, dur: "2 hr 30 min", featured: false,
      short: "Tape in service 1500ghc (wash, install style) excluding hair.",
      desc: "Tape in service 1500ghc (wash, install style) excluding hair. Looking for length and volume without commitment? Our Tape-In Extensions offer a lightweight, seamless blend that moves naturally with your hair. Installed using ultra-thin, medical-grade adhesive strips, these extensions lay flat against the scalp, making them virtually undetectable while maintaining a soft, flexible feel. Seamless & Lightweight – No bulk, just natural movement Quick & Easy Application – Installed in under 2 hours Gentle & Non-Damaging – No glue, no heat, no tension Versatile Styling – Wear it straight, curled, or in updos with ease Reusable Extensions – Can be reapplied 2-3 times with proper care How Long Do Tape-Ins Last? Tape-in extensions last 6 to 8 weeks before needing a move-up. Since your natural hair grows, the tapes must be removed and reinstalled closer to the scalp." },
    { cat: "Extensions", name: "100 grams - KTips", price: 2500, from: null, to: null, mins: 240, dur: "4 hr", featured: false,
      short: "Experience fuller, natural-looking hair with 100 grams of KTips extension service.",
      desc: "Experience fuller, natural-looking hair with 100 grams of KTips extension service. Designed to add volume and length, this option helps you achieve the hairstyle you desire with a seamless finish. Enjoy a professional, comfortable application for a refreshed, beautiful look." },
    { cat: "Extensions", name: "150 grams - KTips", price: 3000, from: null, to: null, mins: 240, dur: "4 hr", featured: false,
      short: "Add beautiful length and volume to your hair with our 150g KTips service.",
      desc: "Add beautiful length and volume to your hair with our 150g KTips service. This extension option blends seamlessly for a natural look and feel. Enjoy a refreshed style that enhances your confidence and complements your personal beauty. Perfect for anyone seeking a fuller, more luxurious hairstyle." },
    { cat: "Extensions", name: "200 grams - KTips", price: 3500, from: null, to: null, mins: 330, dur: "5 hr 30 min", featured: false,
      short: "Transform your look with 200 grams of KTipa extensions, designed to add volume and length to your natural hair.",
      desc: "Transform your look with 200 grams of KTipa extensions, designed to add volume and length to your natural hair. This service offers a seamless blend for a fuller, more luxurious style. Enjoy a refreshed appearance and confident new look with expertly applied hair extensions." },
    { cat: "Extensions", name: "250 grams - KTips", price: 4000, from: null, to: null, mins: 360, dur: "6 hr", featured: false,
      short: "Add beautiful length and volume to your hair with our 250 grams KTips service.",
      desc: "Add beautiful length and volume to your hair with our 250 grams KTips service. This option offers a seamless way to achieve fuller, natural-looking extensions tailored to your style. Enjoy a comfortable, confident look that blends perfectly with your own hair." },
    { cat: "Extensions", name: "300 grams - KTips", price: 4500, from: null, to: null, mins: 420, dur: "7 hr", featured: false,
      short: "Transform your look with 300 grams of KTips, adding impressive volume and length that blends beautifully with your natural hair.",
      desc: "Transform your look with 300 grams of KTips, adding impressive volume and length that blends beautifully with your natural hair. Ideal for anyone craving a bold change or extra fullness. Pricing increases by 500 cedis for every additional 50 grams of KTip bonds." },
    { cat: "Extensions", name: "Invisible KTips", price: null, from: 7000, to: null, mins: 600, dur: "10 hr", featured: false,
      short: "Transform your appearance effortlessly with our innovative hair extensions, designed to blend seamlessly with your natural locks.",
      desc: "Transform your appearance effortlessly with our innovative hair extensions, designed to blend seamlessly with your natural locks. Invisibles are micro KTips that are extremely undetectable. Experience the joy of stunning, fuller hair without the fuss, ideal for any occasion. Our extensions provide a luxurious look and feel, enhancing your style while maintaining a natural appearance. Discover the perfect balance of beauty and convenience at Bēsia Beauty Studio." },
    { cat: "Texture Systems + Treatments", name: "Perm Retouch and Style", price: 850, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Perm Retouch and Style at Bēsia Beauty Studio, available to book online.",
      desc: "Perm Retouch and Style at Bēsia Beauty Studio, available to book online." },
    { cat: "Texture Systems + Treatments", name: "Texture Release - Hair Botox", price: 3850, from: null, to: null, mins: 225, dur: "3 hr 45 min", featured: false,
      short: "Hair Botox is offered through our vegan keratin treatment products.",
      desc: "Hair Botox is offered through our vegan keratin treatment products. Hair botox offers hair an infusion of fullness and shine via blends of smoothing and soothing ingredients Like keratin and Vitamin B5 and E. It can help to strengthen snd repair damaged hair by permeating the hair shaft. Moisturize and give your hair elasticity and strength. Give structure or loosen texture through a custom treatment: Gives brilliance to the hair. Smoothes and loosens texture, but does not carry the function of straightening the hair completely. - Last 6-8 months or until regrowth - No formaldehyde or harsh chemicals and completely vegan formulated in Brazil Results may vary depending on the individual’s hair type, extent of damage, and the specific product used." },
    { cat: "Texture Systems + Treatments", name: "Vegan Keratin Treatment - Nanoplasty", price: 4650, from: null, to: null, mins: 270, dur: "4 hr 30 min", featured: false,
      short: "This is a luxury 5 step service to leave your hair looking and feeling brand new.",
      desc: "This is a luxury 5 step service to leave your hair looking and feeling brand new. First of all we apply an intense mask on your hair paired with a steam therapy. Then you will receive a full nanoplasty - from application, to processing and heat therapy and styling, which will leave your hair smooth and frizz free with permanent results. Our nanoplasty restores the hair instead of stripping it - leaving your hair shinier, silkier and softer." },
    { cat: "Scalp + Bond Repair Treatments", name: "GRO Hot Oil Treatment", price: 350, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Premium in-house blended olive and essential oil hot oil treatment is a hair treatment that uses warmed oil to nourish and strengthen hair.",
      desc: "Premium in-house blended olive and essential oil hot oil treatment is a hair treatment that uses warmed oil to nourish and strengthen hair. The warm oil seals the hair cuticle, which can help repair split ends and prevent breakage" },
    { cat: "Scalp + Bond Repair Treatments", name: "Deep Moisture Treatment", price: 400, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Experience ultimate hydration with our Deep Moisture Treatment.",
      desc: "Experience ultimate hydration with our Deep Moisture Treatment. This indulgent service nourishes and revitalizes your hair, leaving it soft, smooth, and full of life. Perfect for restoring balance to dry, damaged strands, this treatment is your ticket to healthier, more vibrant hair." },
    { cat: "Scalp + Bond Repair Treatments", name: "Flax Seed + Aloe Treatment", price: 450, from: null, to: null, mins: 60, dur: "1 hr", featured: true,
      short: "Our flaxseed hair mask is a hair treatment made from flaxseed and aloe which can be used to moisturize, style, and edge hair.",
      desc: "Our flaxseed hair mask is a hair treatment made from flaxseed and aloe which can be used to moisturize, style, and edge hair. Follow with a wash and go, twist out or rinse and style. Strengthens hair: Flaxseed contains fiber and omega-3 fatty acids, which can make hair stronger and more elastic. Promotes hair growth: Flaxseed can nourish hair follicles and encourage hair growth. Reduces breakage and split ends Soothes scalp: Flaxseed contains alpha-linolenic acid (ALA), which can help calm scalp irritations. Hydrates hair Reduces dandruff Prevents premature graying Adds shine Maintains curly hair Reduces hair thinning" },
    { cat: "Scalp + Bond Repair Treatments", name: "Scalp + Dandruff Intensive Detox", price: 550, from: null, to: null, mins: 45, dur: "45 min", featured: false,
      short: "Scalp & Dandruff Intensive Treatment Give your scalp the ultimate reset with our Scalp & Dandruff Intensive Treatment, designed to deeply cleanse, exf…",
      desc: "Scalp & Dandruff Intensive Treatment Give your scalp the ultimate reset with our Scalp & Dandruff Intensive Treatment, designed to deeply cleanse, exfoliate, and restore balance for a healthier scalp and stronger hair. This multi-step treatment targets buildup, flaking, and irritation, leaving you with a refreshed, soothed scalp and revitalized strands. ✨ Custom Scalp Serum Treatment – Our in-house formula penetrates deeply to nourish, rebalance, and soothe dryness or excessive oil production. ✨ Wet & Dry Salt Scrub – A gentle yet effective exfoliation to lift away dead skin, product buildup, and dandruff, promoting better scalp circulation. ✨ Head Spa & Massage – A luxurious experience that stimulates hair growth, relieves tension, and enhances product absorption. ✨ Clarifying Wash & Condition Perfect for anyone struggling with dandruff, scalp irritation, or buildup, this treatment leaves your scalp refreshed and your hair ready to thrive." },
    { cat: "Scalp + Bond Repair Treatments", name: "K18 Treatment and Bond Repair", price: 550, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Reverse hair damage with the K18 Leave-in Molecular Repair Hair Mask, a leave-in treatment mask designed to restore the hair in just four minutes.",
      desc: "Reverse hair damage with the K18 Leave-in Molecular Repair Hair Mask, a leave-in treatment mask designed to restore the hair in just four minutes. Bleach, colour treatment, chemical services and heat can all wreak havoc on the hair. Powered by the K18PEPTIDE™, this haircare treatment can help repair the damage." },
    { cat: "Scalp + Bond Repair Treatments", name: "Hair Loss + Growth Treatment", price: null, from: 700, to: 800, mins: 60, dur: "1 hr", featured: false,
      short: "Indulge in a rejuvenating experience with our Flax + Aloe with GROW Hot Oil Treatment.",
      desc: "Indulge in a rejuvenating experience with our Flax + Aloe with GROW Hot Oil Treatment. This delightful bundle focuses on nourishing and revitalizing your scalp while strengthening hair bonds. Enjoy the soothing benefits of flax and aloe, known for their hydrating and protective qualities. This treatment promotes a healthy scalp environment, supporting hair growth and restoration. Perfectly designed for those seeking to enhance their hair’s health, this package offers a convenient way to achieve silky, vibrant strands. Treat yourself today and embrace the transformation!" },
    { cat: "Scalp + Bond Repair Treatments", name: "Curl Revive + Flax", price: null, from: 850, to: 1000, mins: 90, dur: "1 hr 30 min", featured: true,
      short: "Experience the ultimate rejuvenation for your curls with this exquisite treatment bundle.",
      desc: "Experience the ultimate rejuvenation for your curls with this exquisite treatment bundle. Infused with nourishing ingredients, this service is designed to restore and revitalize your hair’s natural bounce and shine. Enjoy a deep conditioning session that focuses on hydrating and repairing your locks while a gentle scalp treatment promotes a healthy foundation for growth. This combination not only enhances texture but also adds strength, leaving your curls vibrant and beautifully defined. Treat yourself to this comprehensive service that elevates your hair care routine to a new level of indulgence." },
    { cat: "Scalp + Bond Repair Treatments", name: "Olaplex Treatment", price: 850, from: null, to: null, mins: 120, dur: "2 hr", featured: false,
      short: "Olaplex is the complete solution to repair, rebuild and restore broken hair bonds.",
      desc: "Olaplex is the complete solution to repair, rebuild and restore broken hair bonds. This is all thanks to a single molecule: Bis-Aminopropyl Diglycol Dimaleate. This patented ingredient is designed to seek out broken hair bonds in your client’s hair caused by heat, chemical, mechanical and colour damage." },
    { cat: "Scalp + Bond Repair Treatments", name: "Deep Moisture Treatment + Curl Revive", price: null, from: 855, to: 950, mins: 150, dur: "2 hr 30 min", featured: false,
      short: "Deep Moisture Treatment + Curl Revive at Bēsia Beauty Studio, available to book online.",
      desc: "Deep Moisture Treatment + Curl Revive at Bēsia Beauty Studio, available to book online." },
    { cat: "Scalp + Bond Repair Treatments", name: "Curl Revive + GRO Hot Oil Treatment", price: null, from: 855, to: 900, mins: 90, dur: "1 hr 30 min", featured: false,
      short: "Curl Revive + GRO Hot Oil Treatment at Bēsia Beauty Studio, available to book online.",
      desc: "Curl Revive + GRO Hot Oil Treatment at Bēsia Beauty Studio, available to book online." },
    { cat: "Scalp + Bond Repair Treatments", name: "Curl Revive with FlaxGRO", price: null, from: 1250, to: 1350, mins: 210, dur: "3 hr 30 min", featured: false,
      short: "Experience the ultimate hair rejuvenation with our specialized bundle designed to revive curls and nourish your scalp.",
      desc: "Experience the ultimate hair rejuvenation with our specialized bundle designed to revive curls and nourish your scalp. The Curl Revive + Flax + GROW Hot Oil treatment combines the power of hydrating ingredients to restore vitality and enhance your natural texture. Enjoy the benefits of deep conditioning and scalp repair in one convenient session, making it easier than ever to achieve healthy, beautiful hair. Let our skilled team at Bēsia Beauty Studio pamper you and elevate your hair care routine. Embrace luscious curls that radiate health and confidence." },
    { cat: "Scalp + Bond Repair Treatments", name: "Bēsia Hair CPR Treatment", price: 1500, from: null, to: null, mins: 90, dur: "1 hr 30 min", featured: false,
      short: "Revitalize your hair and scalp with Bēsia Hair CPR Treatment.",
      desc: "Revitalize your hair and scalp with Bēsia Hair CPR Treatment. This exceptional conditioning and scalp treatment works wonders to restore moisture, enhance strength, and promote healthy hair growth. Using innovative techniques, it targets damaged strands and nourishes the scalp to create a balanced environment for hair vitality. Experience a transformation as your hair receives the essential care it deserves. Embrace luscious, revitalized locks that shine with health." },
    { cat: "Color Service", name: "All Over Color - Short", price: 650, from: null, to: null, mins: 180, dur: "3 hr", featured: false,
      short: "Refresh your look with a complete hair color transformation.",
      desc: "Refresh your look with a complete hair color transformation. This service covers your hair from roots to ends in the shade of your choice, creating a uniform, vibrant finish. Perfect for those seeking a new hue or to revive their current color with a polished, even result." },
    { cat: "Color Service", name: "Balayage - Short", price: null, from: 850, to: null, mins: 120, dur: "2 hr", featured: false,
      short: "Balayage creates a natural, sun-kissed look with highlights placed throughout the hair.",
      desc: "Balayage creates a natural, sun-kissed look with highlights placed throughout the hair. Balayage can be used to create a custom look with different tones within the same overall color. Balayage is low maintenance and can last longer than traditional highlights. Balayage can be used on any hair color." },
    { cat: "Color Service", name: "All Over Color - Medium", price: 950, from: null, to: null, mins: 180, dur: "3 hr", featured: false,
      short: "Refresh your look with a complete hair color transformation.",
      desc: "Refresh your look with a complete hair color transformation. This service covers your hair from roots to ends in the shade of your choice, creating a uniform, vibrant finish. Perfect for those seeking a new hue or to revive their current color with a polished, even result." },
    { cat: "Color Service", name: "Balayage - Medium", price: null, from: 1250, to: null, mins: 90, dur: "1 hr 30 min", featured: false,
      short: "Balayage creates a natural, sun-kissed look with highlights placed throughout the hair.",
      desc: "Balayage creates a natural, sun-kissed look with highlights placed throughout the hair. Balayage can be used to create a custom look with different tones within the same overall color. Balayage is low maintenance and can last longer than traditional highlights. Balayage can be used on any hair color." },
    { cat: "Color Service", name: "All Over Color - Long", price: 1350, from: null, to: null, mins: 180, dur: "3 hr", featured: false,
      short: "Refresh your look with a complete hair color transformation.",
      desc: "Refresh your look with a complete hair color transformation. This service covers your hair from roots to ends in the shade of your choice, creating a uniform, vibrant finish. Perfect for those seeking a new hue or to revive their current color with a polished, even result." },
    { cat: "Color Service", name: "Full Highlights", price: null, from: 1500, to: null, mins: 240, dur: "4 hr", featured: false,
      short: "Brighten your look with luminous, natural-looking highlights that add radiant dimension and shine.",
      desc: "Brighten your look with luminous, natural-looking highlights that add radiant dimension and shine. Full highlights create sun-kissed streaks throughout your hair for a fresh, effortless glow. Ideal for a subtle boost or gentle update, with pricing based on hair length. Short - 1500 cedis Medium - 1850 cedis Long - 2350 cedis" },
    { cat: "Color Service", name: "Custom Color", price: null, from: 2000, to: null, mins: 120, dur: "2 hr", featured: false,
      short: "Custom balayage and highlights. Baby lights on crown Includes Toning",
      desc: "Custom balayage and highlights. Baby lights on crown Includes Toning" },
    { cat: "Naturals | Curls & Coils", name: "Curl Revive | Wash + Go", price: 550, from: null, to: null, mins: 90, dur: "1 hr 30 min", featured: true,
      short: "Our Curl Revive service is a luxurious wash-and-go experience designed to enhance your natural curls with definition…",
      desc: "Our Curl Revive service is a luxurious wash-and-go experience designed to enhance your natural curls with definition, hydration, and shine. Infusing Bēsia’s in-house natural products, we cleanse, condition, and style your curls with nourishing flaxseed, rosemary, and olive oil blends. A gentle steam treatment infuses moisture, reducing frizz and promoting healthy, bouncy curls. Perfect for all curl types, this service leaves your hair soft, defined, and beautifully refreshed." },
    { cat: "Naturals | Curls & Coils", name: "Curly Cut", price: 585, from: null, to: null, mins: 105, dur: "1 hr 45 min", featured: false,
      short: "Our Curly Cut is a specialized dry or wet cutting technique designed to shape and enhance your natural curls.",
      desc: "Our Curly Cut is a specialized dry or wet cutting technique designed to shape and enhance your natural curls. We customize each cut based on your unique curl pattern, density, and desired style to create a balanced, flattering shape that grows out beautifully. Finished with our signature Curl Revive wash-and-go service, your curls will be refreshed, defined, and full of life. Perfect for anyone looking to maintain healthy, well-shaped curls with maximum volume and movement." },
    { cat: "Cut Service", name: "Trim", price: 165, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Refresh your look and maintain healthy hair with a quick, precise trim.",
      desc: "Refresh your look and maintain healthy hair with a quick, precise trim. This service removes split ends and helps keep your style neat and tidy. Perfect for anyone who wants to keep their hair looking its best with minimal change. Enjoy a clean, polished finish every time." },
    { cat: "Cut Service", name: "Layers", price: null, from: 250, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Achieve a personalized, flattering style with a custom layer cut tailored to your hair.",
      desc: "Achieve a personalized, flattering style with a custom layer cut tailored to your hair. For best results, we suggest scheduling a consultation first to discuss your vision and preferences. Let us help you create the perfect layered look." },
    { cat: "Cut Service", name: "Precision Cut", price: 300, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Achieve flawless balance with a sharp, symmetrical cut that keeps your hair even from every angle.",
      desc: "Achieve flawless balance with a sharp, symmetrical cut that keeps your hair even from every angle. Enjoy a polished look that brings out the best in your natural style." },
    { cat: "Cut Service", name: "Coily Curly Cut", price: null, from: 450, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Transform your curls with a customized dry or wet cut designed to add or reduce volume, boost bounce, and enhance your natural styling.",
      desc: "Transform your curls with a customized dry or wet cut designed to add or reduce volume, boost bounce, and enhance your natural styling. Perfect for achieving healthy, defined coils and curls that look and feel their best." },
    { cat: "Braids | Cornrows", name: "Cornrow Updo", price: null, from: 550, to: null, mins: 90, dur: "1 hr 30 min", featured: false,
      short: "Cornrow Updo at Bēsia Beauty Studio, available to book online.",
      desc: "Cornrow Updo at Bēsia Beauty Studio, available to book online." },
    { cat: "Braids | Cornrows", name: "Large Braids", price: 650, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Includes wash and prep Hair available for purchase at 50 cedis per pack Length up to 20 inches, +50 cedis for every additional 2 inches.",
      desc: "Includes wash and prep Hair available for purchase at 50 cedis per pack Length up to 20 inches, +50 cedis for every additional 2 inches. Add Goddess, Bora Bora, Boho etc at +200 cedis incl. hair Please confirm hair colour, length and style at booking." },
    { cat: "Hair Styling", name: "Silkpress Xpress", price: 550, from: null, to: null, mins: 90, dur: "1 hr 30 min", featured: true,
      short: "Signature wash, brush blow dry, press and style",
      desc: "Signature wash, brush blow dry, press and style" },
    { cat: "Wig Service", name: "Frontal Installation", price: 500, from: null, to: null, mins: 90, dur: "1 hr 30 min", featured: false,
      short: "Transform your look effortlessly with our stunning frontal installation.",
      desc: "Transform your look effortlessly with our stunning frontal installation. This service provides a seamless application of a high-quality wig that enhances your natural beauty, offering customizable style options to match any occasion. Experience a flawless finish that elevates your confidence and style." },
    { cat: "General", name: "Free Hair Consultation", price: 0, from: null, to: null, mins: 30, dur: "30 min", featured: false,
      short: "Free Hair Consultation Not sure which style or treatment is best for your hair?",
      desc: "Free Hair Consultation Not sure which style or treatment is best for your hair? Our Free Hair Consultation is designed to help you achieve your healthiest, most beautiful hair with expert advice tailored to your unique needs. What to Expect: Hair & Scalp Analysis: We assess your hair type, texture, condition, and scalp health. Customized Recommendations: Get expert advice on styles, treatments, and products suited for your hair goals. Extension & Install Guidance: If you’re considering weaves, microlinks, or fusion extensions, we’ll help you choose the best option for a seamless and natural look. Maintenance Tips: Learn how to care for your hair at home to keep it healthy and thriving. Who Should Book? If you’re unsure which service or extensions are right for you If you’re experiencing hair thinning, breakage, or scalp issues If you want to transition to natural hair or a new hair care routine Let’s create a plan for your best hair yet!" },
    { cat: "General", name: "Hair Wellness Consultation", price: 200, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Discover the secrets to vibrant, healthy hair with our Hair Wellness Consultation.",
      desc: "Discover the secrets to vibrant, healthy hair with our Hair Wellness Consultation. Our expert stylists will assess your unique hair needs and create a personalized plan to enhance your hair’s health, shine, and overall beauty." },
    { cat: "General", name: "Basic Wash + Blowdry", price: 350, from: null, to: null, mins: 60, dur: "1 hr", featured: false,
      short: "Experience a refreshing transformation with our rejuvenating hair wash and blow dry service.",
      desc: "Experience a refreshing transformation with our rejuvenating hair wash and blow dry service. Relax as we cleanse your hair and style it to perfection, leaving you with a smooth and polished look that radiates confidence." }
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
    var lows = byCategory(catKey)
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
