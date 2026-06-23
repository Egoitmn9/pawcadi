/* =====================================================================
   Pawcadi — front-end interactivity
   - Product gallery
   - Color / bundle options + quantity
   - Cart (add / update / remove) with localStorage persistence
   - Cart drawer, FAQ accordion, mobile nav, newsletter
   ===================================================================== */
(function () {
  "use strict";

  const FREE_SHIP_THRESHOLD = 35;
  const PLACEHOLDER = "assets/placeholder.svg";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const money = (n) => "$" + n.toFixed(2);

  /* =================================================================
     SHOPIFY CHECKOUT  —  no API token needed.
     Uses Shopify "cart permalinks": clicking Checkout sends the cart
     straight to your secure Shopify checkout. You only need the NUMERIC
     variant ID of each color (from the variant's URL in Shopify admin).
     ================================================================= */
  const SHOPIFY = {
    domain: "pawcadi.myshopify.com",   // ✅ your Shopify store
    variantIds: {
      "Leaf Green":    "54153749725517",
      "Ocean Blue":    "54153749758285",
      "Sunset Orange": "54153749791053",
    },
  };
  const shopifyReady = () =>
    SHOPIFY.domain && Object.values(SHOPIFY.variantIds).some(Boolean);

  /* ---- Current product selection -------------------------------- */
  const selection = {
    color: "Leaf Green",
    bundle: "Single Mat",
    price: 15.0,
    units: 1, // mats per bundle (Single=1, 2-Pack=2, 3-Pack=3)
    image: "assets/images/product-1.jpg",
  };

  /* ---- Cart state ------------------------------------------------ */
  let cart = loadCart();

  function loadCart() {
    try { return JSON.parse(localStorage.getItem("pawcadi_cart")) || []; }
    catch (e) { return []; }
  }
  function saveCart() {
    localStorage.setItem("pawcadi_cart", JSON.stringify(cart));
  }

  /* ---- Gallery --------------------------------------------------- */
  const mainImg = $("#mainImg");
  $$("#thumbs .thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      $$("#thumbs .thumb").forEach((t) => t.classList.remove("is-active"));
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
      selection.color = sw.dataset.name;
      $("#colorVal").textContent = sw.dataset.name;
    });
  });

  /* ---- Bundle swatches (also sets price) ------------------------- */
  $$("#bundleSwatches .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      $$("#bundleSwatches .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      selection.bundle = sw.dataset.name;
      selection.price = parseFloat(sw.dataset.price);
      selection.units = parseInt(sw.dataset.units, 10) || 1;
      $("#displayPrice").textContent = money(selection.price);
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
      cart.push({
        id,
        title: selection.bundle,
        variant: selection.color,
        price: selection.price,
        units: selection.units,
        image: selection.image,
        qty,
      });
    }
    saveCart();
    renderCart();
    openCart();
  });

  /* ---- Render cart ---------------------------------------------- */
  const cartBody = $("#cartBody");
  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const total = cart.reduce((n, i) => n + i.qty * i.price, 0);
    $("#cartCount").textContent = count;

    if (cart.length === 0) {
      cartBody.innerHTML =
        '<div class="cart-empty"><div class="big">🐾</div>' +
        "<p>Your cart is empty.</p>" +
        '<a href="#shop" class="btn btn-ghost" id="emptyShop">Shop the Lick Mat</a></div>';
      const es = $("#emptyShop");
      if (es) es.addEventListener("click", closeCart);
    } else {
      cartBody.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <div class="ci-img"><img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></div>
          <div>
            <h4>${item.title}</h4>
            <div class="ci-meta">${item.variant}</div>
            <div class="ci-qty">
              <button data-dec="${idx}" aria-label="Decrease">−</button>
              <span>${item.qty}</span>
              <button data-inc="${idx}" aria-label="Increase">+</button>
            </div>
            <button class="ci-remove" data-remove="${idx}">Remove</button>
          </div>
          <div class="ci-price">${money(item.qty * item.price)}</div>
        </div>`).join("");
    }

    $("#cartTotal").textContent = money(total);

    const shipNote = $("#shipNote");
    if (total === 0) {
      shipNote.textContent = "Add $35.00 more for free shipping.";
    } else if (total >= FREE_SHIP_THRESHOLD) {
      shipNote.textContent = "🎉 You've unlocked FREE shipping!";
    } else {
      shipNote.textContent = `Add ${money(FREE_SHIP_THRESHOLD - total)} more for free shipping.`;
    }
  }

  /* event delegation for qty / remove inside the cart */
  cartBody.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.inc !== undefined) { cart[+t.dataset.inc].qty++; }
    else if (t.dataset.dec !== undefined) {
      const i = +t.dataset.dec;
      cart[i].qty--;
      if (cart[i].qty <= 0) cart.splice(i, 1);
    }
    else if (t.dataset.remove !== undefined) { cart.splice(+t.dataset.remove, 1); }
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
    if (cart.length === 0) { alert("Your cart is empty — add a Lick Mat first! 🐾"); return; }

    // Not configured yet → safe demo mode.
    if (!shopifyReady()) {
      alert(
        "Demo mode: checkout isn't connected yet.\n\n" +
        "Add your Shopify variant IDs at the top of js/main.js " +
        "(see README → \"Take real payments\")."
      );
      return;
    }

    // Build a Shopify cart permalink: /cart/{variantId}:{qty},{variantId}:{qty}…
    // qty = line quantity × mats per bundle (Single=1, 2-Pack=2, 3-Pack=3).
    const parts = cart
      .map((item) => {
        const id = SHOPIFY.variantIds[item.variant];
        const qty = item.qty * (item.units || 1);
        return id ? `${id}:${qty}` : null;
      })
      .filter(Boolean);

    if (parts.length === 0) {
      alert("Almost there — add your Shopify variant IDs for each color in js/main.js.");
      return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Redirecting…";
    // Sends the customer straight to your secure Shopify checkout.
    window.location.href = `https://${SHOPIFY.domain}/cart/${parts.join(",")}`;
  });

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
      if (!open) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
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
    alert("You're in! 🐶 Your 10% off code is on its way to your inbox.");
  });

  /* ---- Init ------------------------------------------------------ */
  $("#year").textContent = new Date().getFullYear();
  renderCart();
})();
