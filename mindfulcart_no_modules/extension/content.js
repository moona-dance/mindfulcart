// content.js — MindfulCart
// Strategy for Amazon:
//   On product pages (/dp/ URLs): silently save product name + price to storage
//   On checkout pages: load saved product data, show overlay

if (window.__mindfulCartInitialized) {
  // already running
} else {
  window.__mindfulCartInitialized = true;

  const DASHBOARD = "http://localhost:5173/demo";

  const PURCHASE_TEXTS = [
    "buy now", "add to cart", "checkout", "check out", "go to checkout",
    "proceed to checkout", "place order", "place your order",
    "complete purchase", "complete order", "confirm order",
    "pay now", "order now", "subscribe now",
    "continue to payment", "continue to checkout",
  ];

  const URL_TRIGGERS = [
    "/hz/checkout", "/gp/cart", "/gp/buy",
    "/checkout", "/cart", "/basket",
    "/payment", "/pay/", "/billing",
    "/place-order", "/buynow", "/buy-now",
  ];

  const SALE_KEYWORDS = [
    "sale", "clearance", "limited time", "today only", "flash deal",
    "% off", "percent off", "free shipping", "cashback", "cash back",
    "deal", "offer", "discount", "reimbursement",
  ];

  const EXCLUDE_PATHS = ["/order-history", "/thankyou", "thank-you", "/ap/signin", "/orders?", "/returns"];

  // ── Extract product name from page ─────────────────────────────────────────
  // Tries structured data first, then specific selectors, then title
  function extractProductName() {
    // 1. JSON-LD structured data (most reliable)
    const jsonLds = document.querySelectorAll('script[type="application/ld+json"]');
    for (const node of jsonLds) {
      try {
        const data = JSON.parse(node.textContent);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item["@type"] === "Product" && item.name) return item.name;
        }
      } catch {}
    }

    // 2. Amazon-specific
    const amzTitle = document.getElementById("productTitle") || document.getElementById("title");
    if (amzTitle) return amzTitle.innerText.trim();

    // 3. OG tag
    const og = document.querySelector('meta[property="og:title"]');
    if (og?.content) return og.content.trim();

    // 4. h1
    const h1 = document.querySelector("h1");
    if (h1) return h1.innerText.trim();

    return null;
  }

  // ── Extract price from page ────────────────────────────────────────────────
  // Returns a number or null
  function extractPrice() {
    // 1. JSON-LD structured data
    const jsonLds = document.querySelectorAll('script[type="application/ld+json"]');
    for (const node of jsonLds) {
      try {
        const data = JSON.parse(node.textContent);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item["@type"] === "Product") {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer?.price) return parseFloat(offer.price);
          }
        }
      } catch {}
    }

    // 2. meta itemprop price
    const metaPrice = document.querySelector('meta[itemprop="price"]');
    if (metaPrice?.content) {
      const n = parseFloat(metaPrice.content.replace(/[^0-9.]/g, ""));
      if (!isNaN(n) && n > 0) return n;
    }

    // 3. Amazon-specific price selectors (whole + fraction)
    const whole = document.querySelector(".a-price-whole");
    const frac  = document.querySelector(".a-price-fraction");
    if (whole) {
      const w = whole.innerText.replace(/[^0-9]/g, "");
      const f = frac ? frac.innerText.replace(/[^0-9]/g, "") : "00";
      const n = parseFloat(`${w}.${f}`);
      if (!isNaN(n) && n > 0) return n;
    }

    // 4. Generic price elements — look for ones that have $ and reasonable value
    const priceEls = document.querySelectorAll('[class*="price"],[id*="price"],[data-price]');
    for (const el of priceEls) {
      const text = el.getAttribute("data-price") || el.innerText || "";
      const match = text.match(/\$\s*([\d,]+\.?\d*)/);
      if (match) {
        const n = parseFloat(match[1].replace(/,/g, ""));
        // Ignore suspiciously small values (likely shipping) if >1
        if (!isNaN(n) && n > 1) return n;
      }
    }

    // 5. Last resort: first $ amount in body that looks like a product price (>1)
    const bodyText = document.body?.innerText || "";
    const matches = [...bodyText.matchAll(/\$\s*([\d,]+\.?\d*)/g)];
    for (const m of matches) {
      const n = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(n) && n > 1) return n;
    }

    return null;
  }

  function detectSaleKeywords() {
    const text = (document.body?.innerText || "").toLowerCase();
    return SALE_KEYWORDS.filter(kw => text.includes(kw));
  }

  // ── Is this a product page? ────────────────────────────────────────────────
  function isProductPage() {
    const path = window.location.pathname.toLowerCase();
    return (
      path.includes("/dp/") ||
      path.includes("/product/") ||
      path.includes("/item/") ||
      path.includes("/p/") ||
      document.querySelector('meta[property="og:type"]')?.content === "product" ||
      !!document.querySelector('[itemtype*="Product"]') ||
      !!document.querySelector('meta[itemprop="price"]')
    );
  }

  // ── Save product snapshot when on a product page ──────────────────────────
  function saveProductSnapshot() {
    const name  = extractProductName();
    const price = extractPrice();
    if (!name && !price) return;

    const snapshot = {
      name:    name  || document.title.trim(),
      price:   price || null,
      url:     window.location.href,
      savedAt: Date.now(),
    };
    chrome.storage.local.set({ mcLastProduct: snapshot });
  }

  // ── Load product snapshot from storage ───────────────────────────────────
  function loadProductSnapshot() {
    return new Promise(res => {
      chrome.storage.local.get(["mcLastProduct", "mcGoal", "mcIncome"], data => {
        res({
          product: data.mcLastProduct || null,
          income:     data.mcIncome || null,
          goalName:   data.mcGoal?.description || null,
          goalAmount: data.mcGoal?.target || null,
          goalSaved:  data.mcGoal?.saved || null,
        });
      });
    });
  }

  // ── Build URL for website ─────────────────────────────────────────────────
  function buildUrl(productData, financialData, pageUrl) {
    const p = new URLSearchParams();
    p.set("source",  "mindfulcart");
    p.set("time",    new Date().toISOString());
    p.set("pageUrl", encodeURIComponent(pageUrl || window.location.href));

    // Product — use saved snapshot if available, fallback to current page
    const name  = productData?.name  || extractProductName() || document.title.trim();
    const price = productData?.price || extractPrice();
    p.set("name", name || "Unknown");
    if (price != null) p.set("price", String(price));

    const keywords = detectSaleKeywords();
    if (keywords.length) p.set("keywords", keywords.join(","));

    // Financial profile
    if (financialData?.income)     p.set("income",     String(financialData.income));
    if (financialData?.goalName)   p.set("goalName",   financialData.goalName);
    if (financialData?.goalAmount) p.set("goalAmount", String(financialData.goalAmount));
    if (financialData?.goalSaved)  p.set("goalSaved",  String(financialData.goalSaved));

    return `${DASHBOARD}?${p.toString()}`;
  }

  // ── Overlay popup ─────────────────────────────────────────────────────────
  function showRedirectOverlay(productInfo, financialData, pageUrl) {
    if (document.getElementById("mc-overlay")) return;

    const displayName  = productInfo?.name  || "this item";
    const displayPrice = productInfo?.price ? `$${productInfo.price.toFixed(2)}` : null;

    const goalLine = financialData?.goalName
      ? `<div style="background:#f0fdf4;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#065f46;font-weight:600;">
           🎯 Your goal: <strong>${financialData.goalName}</strong> — $${(financialData.goalSaved||0).toLocaleString()} / $${(financialData.goalAmount||0).toLocaleString()} saved
         </div>`
      : `<div style="background:#f5f3ff;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#5b21b6;font-weight:600;">
           💡 Set your goal in the MindfulCart popup for personalised insights.
         </div>`;

    const el = document.createElement("div");
    el.id = "mc-overlay";
    el.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(15,10,40,0.72);backdrop-filter:blur(6px);
      z-index:2147483647;display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      animation:mcFadeIn 0.25s ease;
    `;
    el.innerHTML = `
      <style>@keyframes mcFadeIn{from{opacity:0}to{opacity:1}}</style>
      <div style="background:rgba(255,255,255,0.97);border-radius:24px;padding:32px 28px;max-width:380px;width:90%;box-shadow:0 24px 80px rgba(0,0,0,0.28);">
        <div style="font-size:40px;text-align:center;margin-bottom:12px;">🐷</div>
        <h2 style="font-size:20px;font-weight:800;color:#1e1a3a;text-align:center;margin:0 0 8px;">Wait a second!</h2>
        <p style="font-size:14px;color:#6b6589;text-align:center;margin:0 0 18px;line-height:1.6;">
          Before you buy <strong style="color:#1e1a3a;">${displayName}</strong>
          ${displayPrice ? ` for <strong style="color:#7c5cfc;">${displayPrice}</strong>` : ""},
          take 30 seconds to reflect. Your future self will thank you. 💜
        </p>
        ${goalLine}
        <button id="mc-yes" style="width:100%;padding:14px;border-radius:12px;border:none;background:#7c5cfc;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:10px;font-family:inherit;">
          ✨ Yes, help me reflect
        </button>
        <button id="mc-no" style="width:100%;padding:12px;border-radius:12px;border:2px solid rgba(124,92,252,0.2);background:transparent;color:#6b6589;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">
          Skip — take me straight to the purchase
        </button>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById("mc-yes").addEventListener("click", () => {
      el.remove();
      const url = buildUrl(productInfo, financialData, pageUrl);
      chrome.runtime.sendMessage({ type: "open-decision-tab", url });
    });

    document.getElementById("mc-no").addEventListener("click", () => {
      el.remove();
      try { sessionStorage.setItem("mc:skip:" + window.location.href, "1"); } catch {}
    });
  }

  // ── Main trigger ──────────────────────────────────────────────────────────
  async function triggerDecisionFlow(pageUrl) {
    const { product, income, goalName, goalAmount, goalSaved } = await loadProductSnapshot();
    // Also try reading from current page (might still have product info in checkout)
    const currentName  = extractProductName();
    const currentPrice = extractPrice();

    // Prefer saved snapshot (product page) over checkout page data
    const productInfo = {
      name:  product?.name  || currentName  || document.title.trim(),
      price: product?.price || (currentPrice > 1 ? currentPrice : null),
    };

    const financialData = { income, goalName, goalAmount, goalSaved };
    showRedirectOverlay(productInfo, financialData, pageUrl || window.location.href);
  }

  // ── URL-based trigger ─────────────────────────────────────────────────────
  function checkUrlTrigger() {
    const path = (window.location.pathname + window.location.search).toLowerCase();
    if (EXCLUDE_PATHS.some(ex => path.includes(ex))) return;
    if (!URL_TRIGGERS.some(f => path.includes(f))) return;

    const key = "mc:triggered:" + window.location.href;
    try {
      if (sessionStorage.getItem(key) || sessionStorage.getItem("mc:skip:" + window.location.href)) return;
      sessionStorage.setItem(key, "1");
    } catch {}

    triggerDecisionFlow(window.location.href);
  }

  // ── Button click trigger ──────────────────────────────────────────────────
  function normalizeText(el) {
    return (el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim().toLowerCase();
  }

  function isPurchaseButton(el) {
    const text = normalizeText(el);
    return PURCHASE_TEXTS.some(t => text.includes(t));
  }

  function attachToButtons() {
    const els = document.querySelectorAll('button, a, input[type="submit"], input[type="button"]');
    els.forEach(el => {
      if (el.__mcAttached) return;
      if (!isPurchaseButton(el)) return;
      el.__mcAttached = true;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        triggerDecisionFlow(window.location.href);
      }, { capture: true });
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    // Never intercept our own decision website
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;

    // If this is a product page, silently save the product data for later
    if (isProductPage()) {
      // Wait a moment for dynamic content to load
      setTimeout(saveProductSnapshot, 1500);
    }

    checkUrlTrigger();
    attachToButtons();

    const observer = new MutationObserver(() => attachToButtons());
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

    const origPush = history.pushState;
    history.pushState = function (...args) {
      origPush.apply(this, args);
      setTimeout(() => {
        if (isProductPage()) setTimeout(saveProductSnapshot, 1500);
        checkUrlTrigger();
      }, 150);
    };
    window.addEventListener("popstate", () => {
      setTimeout(() => {
        if (isProductPage()) setTimeout(saveProductSnapshot, 1500);
        checkUrlTrigger();
      }, 150);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}
