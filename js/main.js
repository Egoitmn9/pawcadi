/* =====================================================================
   Pawcadi — front-end interactivity (bilingual EN / ES, USD / EUR)
   - Language toggle + auto-detect, full i18n dictionary
   - Currency-aware pricing (USA $15 / Spain €12), updates the cart too
   - Product gallery, color/bundle options, quantity
   - Cart with localStorage, cart drawer, FAQ, mobile nav, newsletter
   - Shopify checkout via cart permalinks (no API token)
   ===================================================================== */
(function () {
  "use strict";

  const PLACEHOLDER = "assets/placeholder.svg";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =================================================================
     SHOPIFY CHECKOUT — no API token needed (cart permalinks).
     Colors are keyed in ENGLISH (do not translate these keys — they map
     to the Shopify variant IDs).
     ================================================================= */
  const SHOPIFY = {
    domain: "pawcadi.myshopify.com",
    variantIds: {
      "Leaf Green":    "54153749725517",
      "Ocean Blue":    "54153749758285",
      "Sunset Orange": "54153749791053",
    },
  };
  const shopifyReady = () =>
    SHOPIFY.domain && Object.values(SHOPIFY.variantIds).some(Boolean);

  /* ---- Language ------------------------------------------------- */
  const LANG_KEY = "pawcadi_lang";
  function detectLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "es") return saved;
    return (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en";
  }
  let lang = detectLang();

  const fmt = {
    en: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    es: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }),
  };
  const money = (n) => fmt[lang].format(n);

  /* ---- Pricing per market --------------------------------------- */
  const UNITS = { single: 1, "2pack": 2, "3pack": 3 };
  const PRICING = {
    en: {
      threshold: 35, compare: 24.95, save: "Save 40%",
      bundles: {
        single: { price: 15.0, name: "Single Mat" },
        "2pack": { price: 27.0, name: "2-Pack (Best Value)" },
        "3pack": { price: 36.0, name: "3-Pack" },
      },
    },
    es: {
      threshold: 25, compare: 19.95, save: "Ahorra 40%",
      bundles: {
        single: { price: 12.0, name: "Pack individual" },
        "2pack": { price: 22.0, name: "Pack de 2 (Más vendido)" },
        "3pack": { price: 30.0, name: "Pack de 3" },
      },
    },
  };
  const bundleOf = (key) => PRICING[lang].bundles[key];

  /* ---- Colors (English key + localized label) ------------------- */
  const COLORS = {
    "Leaf Green":    { en: "Leaf Green",    es: "Verde hoja" },
    "Ocean Blue":    { en: "Ocean Blue",    es: "Azul océano" },
    "Sunset Orange": { en: "Sunset Orange", es: "Naranja atardecer" },
  };
  const colorLabel = (key) => (COLORS[key] ? COLORS[key][lang] : key);

  /* ---- Translation dictionary ----------------------------------- */
  const I18N = {
    en: {
      "announce": "🐾 <b>FREE</b> US shipping on orders over <b>$35</b> &nbsp;·&nbsp; 30-day happy-dog guarantee",
      "nav.shop": "Shop", "nav.why": "Why Lick Mats", "nav.how": "How It Works",
      "nav.reviews": "Reviews", "nav.faq": "FAQ", "nav.cart": "Cart",
      "hero.eyebrow": "Vet-approved enrichment",
      "hero.h1": "Turn treat time into <em>20 minutes of calm</em>.",
      "hero.lead": "The Pawcadi mat slows down fast eaters, soothes anxious pups and beats boredom — just spread, freeze and let the licking begin. Easy to clean, built to last, loved by dogs across the USA.",
      "hero.cta1": "Shop the Lick Mat →", "hero.cta2": "See how it works",
      "hero.rating": "<b>4.9/5</b> from 2,400+ happy dog parents",
      "hero.card1": "Dental friendly<small>Soothes &amp; cleans</small>",
      "hero.card2": "20 min of calm<small>Per fill, on average</small>",
      "trust.silicone": "Food-grade silicone <small>100% BPA-free</small>",
      "trust.dishwasher": "Dishwasher safe <small>Clean in seconds</small>",
      "trust.shipping": "Fast US shipping <small>Free over $35</small>",
      "trust.guarantee": "30-day guarantee <small>Love it or refund</small>",
      "prod.reviews": "4.9 (2,418 reviews)",
      "prod.title": "The Pawcadi Enrichment Mat",
      "prod.subtitle": "Spread. Freeze. Lick. The simplest way to calm, entertain and slow-feed your dog every single day. 20&nbsp;cm (7.9″) of food-grade silicone.",
      "prod.tax": "Tax included. Free US shipping over $35.",
      "prod.color": "Color:", "prod.bundle": "Bundle", "prod.add": "Add to cart",
      "prod.perk1": "Slows fast eaters & aids digestion",
      "prod.perk2": "Releases calming, anxiety-easing focus",
      "prod.perk3": "Strong suction base — stays put, no mess",
      "prod.perk4": "Freezer, microwave & dishwasher safe",
      "ben.eyebrow": "Why dogs & vets love it",
      "ben.title": "More than a treat — it's enrichment",
      "ben.lead": "Licking is a natural, self-soothing behavior. A Pawcadi mat channels it into real benefits your dog feels every day.",
      "ben.1t": "Calms anxiety", "ben.1p": "Repetitive licking releases endorphins that ease stress during storms, vet visits, grooming and time alone.",
      "ben.2t": "Slows fast eaters", "ben.2p": "Spreading food across the textured surface turns a 30-second gulp into a mindful meal — better for digestion.",
      "ben.3t": "Beats boredom", "ben.3p": "Mental stimulation tires dogs out the healthy way and curbs destructive chewing, barking and pacing.",
      "ben.4t": "Supports oral health", "ben.4p": "The raised nubs gently massage gums and help scrape away plaque with every happy lick.",
      "ben.5t": "Stress-free grooming", "ben.5p": "Stick it to the tub or wall to distract your pup through baths, nail trims and brushing.",
      "ben.6t": "Effortless cleanup", "ben.6p": "One solid piece of food-grade silicone — pop it in the dishwasher and it's ready for tomorrow.",
      "how.eyebrow": "Ready in 60 seconds", "how.title": "Three steps to a calmer dog",
      "how.1t": "Spread", "how.1p": "Smear on peanut butter, yogurt, wet food, pumpkin or your dog's favorite treat.",
      "how.2t": "Freeze", "how.2p": "Pop it in the freezer for 1–2 hours to make the challenge last even longer.",
      "how.3t": "Lick", "how.3p": "Press the suction base down and let your pup enjoy 20+ minutes of happy focus.",
      "rev.eyebrow": "★★★★★ 4.9 average", "rev.title": "Loved by 2,400+ dog parents",
      "rev.lead": "Real reviews from real (very good) dogs across the United States.",
      "rev.verified": "✓ Verified",
      "rev.1p": "\"My rescue used to inhale her food in seconds. The Pawcadi mat slowed her right down and she's so much calmer at mealtimes now. Game changer.\"",
      "rev.1a": "JM", "rev.1n": "Jessica M. <small>Austin, TX</small>",
      "rev.2p": "\"Bath time was a nightmare until this. I stick it to the shower wall with peanut butter and my Lab doesn't even notice the water anymore.\"",
      "rev.2a": "DR", "rev.2n": "Derek R. <small>Denver, CO</small>",
      "rev.3p": "\"Thick, sturdy silicone — way better quality than the cheap one I had before. Goes straight in the dishwasher and the suction actually holds.\"",
      "rev.3a": "PT", "rev.3n": "Priya T. <small>Seattle, WA</small>",
      "faq.eyebrow": "Good questions", "faq.title": "Frequently asked",
      "faq.q1": "Is the Pawcadi mat safe for my dog?",
      "faq.a1": "Yes. It's made from 100% food-grade, BPA-free silicone with no fillers. As with any feeding product, always supervise your dog and replace the mat if it becomes damaged.",
      "faq.q2": "What can I put on it?",
      "faq.a2": "Anything spreadable and dog-safe: peanut butter (xylitol-free), plain yogurt, wet food, mashed banana, pumpkin purée, bone broth or wet kibble. Freeze it to make the fun last longer.",
      "faq.q3": "How do I clean it?",
      "faq.a3": "It's top-rack dishwasher safe, or rinse it under warm soapy water. The single-piece silicone design means no cracks or seams for food to hide in.",
      "faq.q4": "Will it work for any size dog?",
      "faq.a4": "Absolutely — from Chihuahuas to Great Danes. The mat suits all breeds; just match the portion size to your dog and supervise smaller pups.",
      "faq.q5": "What's your shipping & return policy?",
      "faq.a5": "We ship across the USA in 3–5 business days, free on orders over $35. Not happy? Return it within 30 days for a full refund — no questions asked.",
      "cta.title": "Give your dog a calmer, happier routine",
      "cta.lead": "Join 2,400+ dog parents and get enrichment tips, exclusive offers and 10% off your first order.",
      "cta.email": "Your email address", "cta.btn": "Get 10% off",
      "cta.note": "No spam, just good dog stuff. Unsubscribe anytime.",
      "foot.about": "Enrichment lick mats designed to calm, entertain and slow-feed the dogs we love. Made from food-grade silicone, backed by a 30-day happy-dog guarantee.",
      "foot.shopH": "Shop", "foot.shop1": "Lick Mat", "foot.shop2": "Bundles", "foot.shop3": "Gift cards",
      "foot.learnH": "Learn", "foot.learn1": "Why lick mats", "foot.learn2": "How it works", "foot.learn3": "FAQ",
      "foot.legalH": "Legal", "foot.legal1": "Returns & refunds", "foot.legal2": "Shipping policy", "foot.legal3": "Privacy policy", "foot.legal4": "Terms of service",
      "foot.rights": "All rights reserved.",
      "cart.title": "Your cart", "cart.subtotal": "Subtotal", "cart.checkout": "Checkout",
      "cart.empty": "Your cart is empty.", "cart.shopBtn": "Shop the Lick Mat", "cart.remove": "Remove",
      "cart.shipAdd": "Add %s more for free shipping.",
      "cart.shipUnlocked": "🎉 You've unlocked FREE shipping!",
      "alert.empty": "Your cart is empty — add a Lick Mat first! 🐾",
      "alert.newsletter": "You're in! 🐶 Your 10% off code is on its way to your inbox.",
    },
    es: {
      "announce": "🐾 Envío <b>GRATIS</b> en pedidos de más de <b>25&nbsp;€</b> &nbsp;·&nbsp; garantía de 30 días",
      "nav.shop": "Tienda", "nav.why": "Beneficios", "nav.how": "Cómo funciona",
      "nav.reviews": "Opiniones", "nav.faq": "Preguntas", "nav.cart": "Carrito",
      "hero.eyebrow": "Enriquecimiento aprobado por veterinarios",
      "hero.h1": "Convierte el premio en <em>20 minutos de calma</em>.",
      "hero.lead": "La alfombra Pawcadi ralentiza a los comilones, calma a los perros ansiosos y combate el aburrimiento: solo unta, congela y deja que empiece el lameteo. Fácil de limpiar, resistente y adorada por perros de toda España.",
      "hero.cta1": "Comprar la alfombra →", "hero.cta2": "Ver cómo funciona",
      "hero.rating": "<b>4,9/5</b> de más de 2.400 dueños felices",
      "hero.card1": "Cuida los dientes<small>Suaviza y limpia</small>",
      "hero.card2": "20 min de calma<small>Por relleno, de media</small>",
      "trust.silicone": "Silicona alimentaria <small>100% sin BPA</small>",
      "trust.dishwasher": "Apta para lavavajillas <small>Limpia en segundos</small>",
      "trust.shipping": "Envío rápido <small>Gratis desde 25&nbsp;€</small>",
      "trust.guarantee": "Garantía de 30 días <small>Te encanta o te devolvemos</small>",
      "prod.reviews": "4,9 (2.418 opiniones)",
      "prod.title": "La alfombra de enriquecimiento Pawcadi",
      "prod.subtitle": "Unta. Congela. Lame. La forma más sencilla de calmar, entretener y dar de comer despacio a tu perro cada día. 20&nbsp;cm (7,9″) de silicona alimentaria.",
      "prod.tax": "Impuestos incluidos. Envío gratis desde 25&nbsp;€.",
      "prod.color": "Color:", "prod.bundle": "Pack", "prod.add": "Añadir al carrito",
      "prod.perk1": "Ralentiza a los comilones y ayuda a la digestión",
      "prod.perk2": "Libera una concentración que calma la ansiedad",
      "prod.perk3": "Base de ventosa fuerte: no se mueve, sin líos",
      "prod.perk4": "Apta para congelador, microondas y lavavajillas",
      "ben.eyebrow": "Por qué les encanta a perros y veterinarios",
      "ben.title": "Más que un premio: es enriquecimiento",
      "ben.lead": "Lamer es un comportamiento natural y relajante. La alfombra Pawcadi lo convierte en beneficios reales que tu perro nota cada día.",
      "ben.1t": "Calma la ansiedad", "ben.1p": "El lameteo repetitivo libera endorfinas que alivian el estrés en tormentas, visitas al veterinario, peluquería y ratos a solas.",
      "ben.2t": "Ralentiza a los comilones", "ben.2p": "Repartir la comida por la superficie texturizada convierte un engullido de 30 segundos en una comida pausada: mejor para la digestión.",
      "ben.3t": "Combate el aburrimiento", "ben.3p": "La estimulación mental cansa al perro de forma sana y reduce mordiscos, ladridos y nervios destructivos.",
      "ben.4t": "Cuida la salud bucal", "ben.4p": "Los relieves masajean suavemente las encías y ayudan a retirar el sarro con cada lametón.",
      "ben.5t": "Aseo sin estrés", "ben.5p": "Pégala a la bañera o la pared para distraer a tu perro durante baños, cortes de uñas y cepillados.",
      "ben.6t": "Limpieza sin esfuerzo", "ben.6p": "Una sola pieza de silicona alimentaria: métela en el lavavajillas y estará lista para mañana.",
      "how.eyebrow": "Lista en 60 segundos", "how.title": "Tres pasos para un perro más tranquilo",
      "how.1t": "Unta", "how.1p": "Extiende crema de cacahuete, yogur, comida húmeda, calabaza o el premio favorito de tu perro.",
      "how.2t": "Congela", "how.2p": "Métela al congelador 1–2 horas para que el reto dure aún más.",
      "how.3t": "Lame", "how.3p": "Presiona la base de ventosa y deja que tu perro disfrute de más de 20 minutos de concentración feliz.",
      "rev.eyebrow": "★★★★★ 4,9 de media", "rev.title": "Adorada por más de 2.400 dueños",
      "rev.lead": "Opiniones reales de perros de verdad (muy buenos) de toda España.",
      "rev.verified": "✓ Verificado",
      "rev.1p": "\"Mi perra rescatada engullía la comida en segundos. La alfombra Pawcadi la frenó del todo y ahora está mucho más tranquila al comer. Un antes y un después.\"",
      "rev.1a": "LM", "rev.1n": "Laura M. <small>Madrid</small>",
      "rev.2p": "\"El baño era una pesadilla hasta esto. La pego a la pared de la ducha con crema de cacahuete y mi labrador ni se entera del agua.\"",
      "rev.2a": "CR", "rev.2n": "Carlos R. <small>Valencia</small>",
      "rev.3p": "\"Silicona gruesa y resistente, mucha mejor calidad que la barata que tenía antes. Va directa al lavavajillas y la ventosa agarra de verdad.\"",
      "rev.3a": "MT", "rev.3n": "Marta T. <small>Sevilla</small>",
      "faq.eyebrow": "Buenas preguntas", "faq.title": "Preguntas frecuentes",
      "faq.q1": "¿Es segura la alfombra Pawcadi para mi perro?",
      "faq.a1": "Sí. Está hecha de silicona 100% alimentaria, sin BPA y sin rellenos. Como con cualquier producto de alimentación, supervisa siempre a tu perro y sustituye la alfombra si se daña.",
      "faq.q2": "¿Qué le puedo poner?",
      "faq.a2": "Cualquier cosa untable y segura para perros: crema de cacahuete (sin xilitol), yogur natural, comida húmeda, plátano machacado, puré de calabaza, caldo de huesos o pienso húmedo. Congélala para que dure más.",
      "faq.q3": "¿Cómo se limpia?",
      "faq.a3": "Es apta para la bandeja superior del lavavajillas, o acláralo con agua tibia y jabón. Al ser una sola pieza de silicona, no tiene grietas ni juntas donde se esconda la comida.",
      "faq.q4": "¿Sirve para perros de cualquier tamaño?",
      "faq.a4": "Por supuesto, desde un chihuahua hasta un gran danés. La alfombra vale para todas las razas; solo ajusta la cantidad al tamaño de tu perro y supervisa a los más pequeños.",
      "faq.q5": "¿Cuál es la política de envío y devolución?",
      "faq.a5": "Enviamos a toda España en 2–4 días laborables, gratis desde 25 €. ¿No te convence? Devuélvela en 30 días y te reembolsamos el importe íntegro, sin preguntas.",
      "cta.title": "Dale a tu perro una rutina más tranquila y feliz",
      "cta.lead": "Únete a más de 2.400 dueños y recibe consejos de enriquecimiento, ofertas exclusivas y un 10% en tu primer pedido.",
      "cta.email": "Tu correo electrónico", "cta.btn": "Consigue un 10%",
      "cta.note": "Sin spam, solo cosas buenas para perros. Cancela cuando quieras.",
      "foot.about": "Alfombras de lameteo diseñadas para calmar, entretener y dar de comer despacio a los perros que queremos. De silicona alimentaria y con garantía de 30 días.",
      "foot.shopH": "Tienda", "foot.shop1": "Alfombra", "foot.shop2": "Packs", "foot.shop3": "Tarjetas regalo",
      "foot.learnH": "Aprende", "foot.learn1": "Beneficios", "foot.learn2": "Cómo funciona", "foot.learn3": "Preguntas",
      "foot.legalH": "Legal", "foot.legal1": "Devoluciones", "foot.legal2": "Política de envíos", "foot.legal3": "Privacidad", "foot.legal4": "Términos del servicio",
      "foot.rights": "Todos los derechos reservados.",
      "cart.title": "Tu carrito", "cart.subtotal": "Subtotal", "cart.checkout": "Finalizar compra",
      "cart.empty": "Tu carrito está vacío.", "cart.shopBtn": "Comprar la alfombra", "cart.remove": "Quitar",
      "cart.shipAdd": "Te faltan %s para el envío gratis.",
      "cart.shipUnlocked": "🎉 ¡Has conseguido envío GRATIS!",
      "alert.empty": "Tu carrito está vacío: ¡añade una alfombra primero! 🐾",
      "alert.newsletter": "¡Ya estás dentro! 🐶 Tu código de 10% va de camino a tu correo.",
    },
  };
  const t = (key) => (I18N[lang][key] !== undefined ? I18N[lang][key] : key);

  /* ---- Current product selection -------------------------------- */
  const selection = {
    color: "Leaf Green",   // English key (Shopify mapping)
    bundle: "single",
    image: "assets/images/product-1.jpg",
  };

  /* ---- Cart state ----------------------------------------------- */
  let cart = loadCart();
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem("pawcadi_cart")) || [];
      // Drop any stale items from the pre-bilingual cart structure.
      return raw.filter((i) => i && UNITS[i.bundle] && COLORS[i.variant] && i.qty > 0);
    } catch (e) { return []; }
  }
  function saveCart() { localStorage.setItem("pawcadi_cart", JSON.stringify(cart)); }

  /* ---- Apply a language ----------------------------------------- */
  function applyLang(next) {
    lang = next;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    $("#langCode").textContent = lang.toUpperCase();

    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });

    renderBuyBox();
    renderCart();
  }

  /* ---- Buy box (prices, labels) --------------------------------- */
  function renderBuyBox() {
    const p = PRICING[lang];
    // bundle buttons: "<name> — <price>"
    $$("#bundleSwatches .swatch").forEach((sw) => {
      const b = p.bundles[sw.dataset.bundle];
      sw.textContent = `${b.name} — ${money(b.price)}`;
    });
    // active price + compare + save
    $("#displayPrice").textContent = money(bundleOf(selection.bundle).price);
    $("#priceCompare").textContent = money(p.compare);
    $("#priceSave").textContent = p.save;
    // selected color label
    $("#colorVal").textContent = colorLabel(selection.color);
  }

  /* ---- Gallery -------------------------------------------------- */
  const mainImg = $("#mainImg");
  $$("#thumbs .thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      $$("#thumbs .thumb").forEach((t2) => t2.classList.remove("is-active"));
      thumb.classList.add("is-active");
      const src = thumb.dataset.img;
      mainImg.src = src;
      mainImg.onerror = () => { mainImg.onerror = null; mainImg.src = PLACEHOLDER; };
      selection.image = src;
    });
  });

  /* ---- Color swatches ------------------------------------------- */
  $$("#colorSwatches .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      $$("#colorSwatches .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      selection.color = sw.dataset.name; // English key
      $("#colorVal").textContent = colorLabel(selection.color);
    });
  });

  /* ---- Bundle swatches ------------------------------------------ */
  $$("#bundleSwatches .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      $$("#bundleSwatches .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      selection.bundle = sw.dataset.bundle;
      $("#displayPrice").textContent = money(bundleOf(selection.bundle).price);
    });
  });

  /* ---- Quantity stepper ----------------------------------------- */
  const qtyInput = $("#qtyInput");
  const clampQty = (v) => Math.min(20, Math.max(1, parseInt(v, 10) || 1));
  $("#qtyMinus").addEventListener("click", () => { qtyInput.value = clampQty(+qtyInput.value - 1); });
  $("#qtyPlus").addEventListener("click", () => { qtyInput.value = clampQty(+qtyInput.value + 1); });
  qtyInput.addEventListener("change", () => { qtyInput.value = clampQty(qtyInput.value); });

  /* ---- Add to cart ---------------------------------------------- */
  $("#addToCart").addEventListener("click", () => {
    const qty = clampQty(qtyInput.value);
    const id = selection.bundle + "|" + selection.color;
    const existing = cart.find((i) => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id, bundle: selection.bundle, variant: selection.color, image: selection.image, qty });
    }
    saveCart();
    renderCart();
    openCart();
  });

  /* ---- Render cart ---------------------------------------------- */
  const cartBody = $("#cartBody");
  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const total = cart.reduce((n, i) => n + i.qty * bundleOf(i.bundle).price, 0);
    $("#cartCount").textContent = count;

    if (cart.length === 0) {
      cartBody.innerHTML =
        '<div class="cart-empty"><div class="big">🐾</div>' +
        "<p>" + t("cart.empty") + "</p>" +
        '<a href="#shop" class="btn btn-ghost" id="emptyShop">' + t("cart.shopBtn") + "</a></div>";
      const es = $("#emptyShop");
      if (es) es.addEventListener("click", closeCart);
    } else {
      cartBody.innerHTML = cart.map((item, idx) => {
        const b = bundleOf(item.bundle);
        return `
        <div class="cart-item">
          <div class="ci-img"><img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></div>
          <div>
            <h4>${b.name}</h4>
            <div class="ci-meta">${colorLabel(item.variant)}</div>
            <div class="ci-qty">
              <button data-dec="${idx}" aria-label="−">−</button>
              <span>${item.qty}</span>
              <button data-inc="${idx}" aria-label="+">+</button>
            </div>
            <button class="ci-remove" data-remove="${idx}">${t("cart.remove")}</button>
          </div>
          <div class="ci-price">${money(item.qty * b.price)}</div>
        </div>`;
      }).join("");
    }

    $("#cartTotal").textContent = money(total);

    const shipNote = $("#shipNote");
    const threshold = PRICING[lang].threshold;
    if (total >= threshold && total > 0) {
      shipNote.textContent = t("cart.shipUnlocked");
    } else {
      shipNote.textContent = t("cart.shipAdd").replace("%s", money(threshold - total));
    }
  }

  /* event delegation for qty / remove inside the cart */
  cartBody.addEventListener("click", (e) => {
    const tg = e.target.closest("button");
    if (!tg) return;
    if (tg.dataset.inc !== undefined) { cart[+tg.dataset.inc].qty++; }
    else if (tg.dataset.dec !== undefined) {
      const i = +tg.dataset.dec;
      cart[i].qty--;
      if (cart[i].qty <= 0) cart.splice(i, 1);
    }
    else if (tg.dataset.remove !== undefined) { cart.splice(+tg.dataset.remove, 1); }
    else return;
    saveCart();
    renderCart();
  });

  /* ---- Cart drawer open/close ----------------------------------- */
  const drawer = $("#drawer");
  const overlay = $("#overlay");
  function openCart() { drawer.classList.add("is-open"); overlay.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeCart() { drawer.classList.remove("is-open"); overlay.classList.remove("is-open"); document.body.style.overflow = ""; }
  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  /* ---- Checkout (Shopify cart permalink) ------------------------- */
  const checkoutBtn = $("#checkoutBtn");
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) { alert(t("alert.empty")); return; }
    if (!shopifyReady()) { alert("Demo mode: add your Shopify variant IDs in js/main.js."); return; }

    const parts = cart
      .map((item) => {
        const id = SHOPIFY.variantIds[item.variant];
        const qty = item.qty * (UNITS[item.bundle] || 1);
        return id ? `${id}:${qty}` : null;
      })
      .filter(Boolean);
    if (parts.length === 0) { alert("Add your Shopify variant IDs for each color in js/main.js."); return; }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "…";
    window.location.href = `https://${SHOPIFY.domain}/cart/${parts.join(",")}`;
  });

  /* ---- Language toggle ------------------------------------------ */
  $("#langToggle").addEventListener("click", () => applyLang(lang === "en" ? "es" : "en"));

  /* ---- FAQ accordion -------------------------------------------- */
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      $$(".faq-item").forEach((other) => {
        other.classList.remove("is-open");
        $(".faq-a", other).style.maxHeight = null;
      });
      if (!open) { item.classList.add("is-open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---- Mobile nav ----------------------------------------------- */
  const header = $(".site-header");
  const navToggle = $("#navToggle");
  navToggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", open);
  });
  $$(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      header.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---- Newsletter ----------------------------------------------- */
  $("#newsletter").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    alert(t("alert.newsletter"));
  });

  /* ---- Init ----------------------------------------------------- */
  $("#year").textContent = new Date().getFullYear();
  applyLang(lang); // also runs renderBuyBox + renderCart
})();
