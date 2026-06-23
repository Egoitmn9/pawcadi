# 🐾 Pawcadi — Lick Mat E-commerce Website

A professional, single-product e-commerce storefront for selling **dog lick mats**
in the United States. Built as a fast, dependency-free static site (HTML + CSS +
vanilla JavaScript) so it's easy to preview, edit and deploy for free.

> **Brand:** Pawcadi · **Shopify store:** `pawcadi.myshopify.com`

---

## 📁 Project structure

```
CLAUDE LICK MAT/
├── index.html            ← the whole page (all sections live here)
├── css/
│   └── styles.css        ← all styling / design
├── js/
│   └── main.js           ← cart, gallery, options, FAQ, menu
└── assets/
    ├── favicon.svg       ← little logo in the browser tab
    ├── placeholder.svg   ← shown until you add real photos
    └── images/
        └── README.md     ← 👈 where to drop your Lick Mat photos
```

---

## 👀 1. Preview the website locally

You don't need to install anything. Pick one:

**Easiest:** double-click `index.html` — it opens in your browser.

**Better (recommended)** — run a tiny local server so everything behaves like the
real web. In a terminal, from this folder:

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser. Press `Ctrl + C` to stop.

---

## 📸 2. Add your product photos

The site shows a placeholder graphic until you add real photos.
Open **`assets/images/README.md`** for the exact file names to use
(`hero.jpg`, `product-1.jpg` … `product-4.jpg`). Just drop your JPGs into
`assets/images/` with those names and refresh — done.

---

## ✏️ 3. Things you'll probably want to change

Everything below lives in **`index.html`** (open it in any text editor):

| What | Find this in `index.html` |
|------|---------------------------|
| Prices | `$15.00`, `data-price="15.00"`, the bundle buttons |
| Product name / description | the `<h2>The Pawcadi Enrichment Mat</h2>` area |
| Colors offered | the `colorSwatches` buttons (Leaf Green / Ocean Blue / Sunset Orange) |
| Reviews | the `<section id="reviews">` block |
| FAQ answers | the `<section id="faq">` block |
| Shipping threshold ($35) | `FREE_SHIP_THRESHOLD` in `js/main.js` |
| Brand colors | the variables at the top of `css/styles.css` (`--brand`, `--accent`) |

> **Current pricing:** Single **$15.00** · 2-Pack **$27.00** · 3-Pack **$36.00**
> (3-Pack clears the $35 free-shipping threshold).

---

## 🏷️ Rename the brand

The site is branded **Pawcadi**. To change it again later, search the whole
project for `Pawcadi` (and `Paw<b>cadi` in the two logos) and swap it, then update
the `<title>` and `<meta name="description">` at the top of `index.html`.

---

## 💳 4. Take real payments with Shopify

**Already connected** ✅ — and it needs **no API token**. The Checkout button uses
a *Shopify cart permalink*: it sends the cart straight to your secure Shopify
checkout (`pawcadi.myshopify.com`), where Shopify handles payment, shipping and
orders. This site stays your custom storefront.

How it works (config is at the top of **`js/main.js`**):

```js
const SHOPIFY = {
  domain: "pawcadi.myshopify.com",
  variantIds: {                 // NUMERIC variant ID per color
    "Leaf Green":    "54153749725517",
    "Ocean Blue":    "54153749758285",
    "Sunset Orange": "54153749791053",
  },
};
```

Clicking *Checkout* redirects to
`https://pawcadi.myshopify.com/cart/<variantId>:<qty>,…` — Shopify adds the items
and shows the real checkout. The bundles (2-Pack / 3-Pack) are automatic: the cart
sends the right *quantity*, so you only need one product with one variant per color.

**To find a variant's numeric ID** (if you ever change colors/products): Shopify
admin → *Products* → open the product → click a variant → the URL ends in
`.../variants/54153749725517` → that number is the ID.

> **Before going live:** make sure each variant's price is **$15.00** in Shopify
> (the prices on this site are just display — Shopify charges what's set there),
> and that your store has an active plan so checkout can accept real payments.

---

## 🚀 5. Put it online for free (GitHub Pages)

Since you're learning GitHub, this pairs nicely with it:

1. Create a new repository on GitHub and push this folder to it.
2. On GitHub, go to the repo's **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**,
   pick your `main` branch and the `/ (root)` folder, then **Save**.
4. Wait ~1 minute. GitHub gives you a public URL like
   `https://your-username.github.io/your-repo/`. That's your live store! 🎉

Other free options that also work: **Netlify** or **Cloudflare Pages**
(drag-and-drop this folder onto their dashboard).

---

## ✅ What's included

- Responsive design (looks great on phone, tablet and desktop)
- Sticky header + slide-out shopping cart (saves items between visits)
- Product gallery, color & bundle options, quantity stepper
- Benefits, "how it works", reviews, FAQ accordion, newsletter
- Accessible markup, SEO meta tags, and fast load (no frameworks)

---

*Built for the dog-toys niche. Made with 🐶 and a lot of peanut butter.*
