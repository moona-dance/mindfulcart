// popup.js — MindfulCart extension popup

const DASHBOARD = "http://localhost:5173/demo";
const DEFAULT = { goal: { description: "My savings goal", target: 5000, saved: 1200 }, income: 4000 };

function fmt(n) {
  if (n == null || isNaN(n)) return "—";
  return "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function fmtPrice(n) {
  if (n == null || isNaN(n)) return "Not detected";
  return "$" + Number(n).toFixed(2);
}

// ── Load everything from storage ──────────────────────────────────────────
async function loadAll() {
  return new Promise(res => {
    chrome.storage.local.get(["mcGoal", "mcIncome", "mcLastProduct"], data => {
      res({
        goal:        data.mcGoal    || DEFAULT.goal,
        income:      data.mcIncome  ?? DEFAULT.income,
        lastProduct: data.mcLastProduct || null,
      });
    });
  });
}

function renderGoal({ goal, income }) {
  document.getElementById("goal-desc").textContent   = goal.description || "Set a goal.";
  document.getElementById("goal-saved").textContent  = fmt(goal.saved);
  document.getElementById("goal-target").textContent = fmt(goal.target);
  document.getElementById("goal-income").textContent = fmt(income);
  const pct = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
  document.getElementById("goal-bar").style.width    = pct + "%";
  document.getElementById("goal-pct").textContent    = Math.round(pct) + "% saved";
  document.getElementById("f-desc").value   = goal.description || "";
  document.getElementById("f-target").value = goal.target ?? "";
  document.getElementById("f-saved").value  = goal.saved  ?? "";
  document.getElementById("f-income").value = income ?? "";
}

// ── Goal form ─────────────────────────────────────────────────────────────
document.getElementById("btn-edit-goal").addEventListener("click", () => {
  const form = document.getElementById("goal-form");
  form.style.display = form.style.display === "none" ? "block" : "none";
});

document.getElementById("btn-save-goal").addEventListener("click", async () => {
  const goal = {
    description: document.getElementById("f-desc").value.trim()   || DEFAULT.goal.description,
    target:      parseFloat(document.getElementById("f-target").value) || DEFAULT.goal.target,
    saved:       parseFloat(document.getElementById("f-saved").value)  || DEFAULT.goal.saved,
  };
  const income = parseFloat(document.getElementById("f-income").value) || DEFAULT.income;
  chrome.storage.local.set({ mcGoal: goal, mcIncome: income }, async () => {
    const all = await loadAll();
    renderGoal(all);
    document.getElementById("goal-form").style.display = "none";
    const confirm = document.getElementById("save-confirm");
    confirm.style.display = "block";
    setTimeout(() => { confirm.style.display = "none"; }, 2200);
  });
});

// ── Read current tab for product info (supplement saved snapshot) ─────────
const SALE_KW = ["sale","clearance","limited time","today only","% off","flash deal","discount","deal","free shipping","cashback"];

async function readCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return null;
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (kws) => {
        // Try JSON-LD first
        let name = null, price = null;
        document.querySelectorAll('script[type="application/ld+json"]').forEach(node => {
          try {
            const d = JSON.parse(node.textContent);
            const items = Array.isArray(d) ? d : [d];
            items.forEach(item => {
              if (item["@type"] === "Product") {
                if (!name && item.name) name = item.name;
                const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                if (!price && offer?.price) price = parseFloat(offer.price);
              }
            });
          } catch {}
        });

        // Amazon-specific
        if (!name) {
          const el = document.getElementById("productTitle") || document.getElementById("title");
          if (el) name = el.innerText.trim();
        }
        if (!price) {
          const whole = document.querySelector(".a-price-whole");
          const frac  = document.querySelector(".a-price-fraction");
          if (whole) {
            const w = whole.innerText.replace(/[^0-9]/g, "");
            const f = frac ? frac.innerText.replace(/[^0-9]/g, "") : "00";
            const n = parseFloat(`${w}.${f}`);
            if (!isNaN(n) && n > 1) price = n;
          }
        }
        if (!price) {
          const meta = document.querySelector('meta[itemprop="price"]');
          if (meta?.content) { const n = parseFloat(meta.content); if (!isNaN(n) && n > 1) price = n; }
        }
        if (!name) {
          const og = document.querySelector('meta[property="og:title"]');
          if (og?.content) name = og.content.trim();
        }
        if (!name) name = document.title?.trim();

        const body = (document.body?.innerText || "").toLowerCase();
        return { name, price, url: window.location.href, keywords: kws.filter(k => body.includes(k)) };
      },
      args: [SALE_KW],
    });
    return res?.result || null;
  } catch { return null; }
}

// ── Open dashboard (passes all data as URL params) ────────────────────────
let currentTabCtx = null;
let savedSnapshot = null;

document.getElementById("btn-open").addEventListener("click", async () => {
  const all = await loadAll();
  const { goal, income } = all;

  const params = new URLSearchParams();
  params.set("source", "mindfulcart");
  params.set("time",   new Date().toISOString());

  // Prefer saved product snapshot (from product page) over current tab
  const name  = savedSnapshot?.name  || currentTabCtx?.name  || "Unknown";
  const price = savedSnapshot?.price || currentTabCtx?.price || null;
  const url   = savedSnapshot?.url   || currentTabCtx?.url   || null;

  params.set("name", name);
  if (price != null) params.set("price", String(price));
  if (url)           params.set("pageUrl", encodeURIComponent(url));
  const kw = currentTabCtx?.keywords || [];
  if (kw.length) params.set("keywords", kw.join(","));

  // Financial profile
  params.set("income",     String(income));
  params.set("goalName",   goal.description);
  params.set("goalAmount", String(goal.target));
  params.set("goalSaved",  String(goal.saved));

  chrome.tabs.create({ url: `${DASHBOARD}?${params.toString()}` });
});

// ── Init ──────────────────────────────────────────────────────────────────
async function init() {
  const all = await loadAll();
  renderGoal(all);
  savedSnapshot = all.lastProduct;

  document.getElementById("goal-form").style.display    = "none";
  document.getElementById("save-confirm").style.display = "none";

  // Show saved product snapshot
  if (savedSnapshot) {
    document.getElementById("page-name").textContent  = savedSnapshot.name  || "—";
    document.getElementById("page-price").textContent = fmtPrice(savedSnapshot.price);
    document.getElementById("page-note").textContent  = "📦 Saved from product page";
  }

  // Also read current tab for keywords + supplement if no snapshot
  const ctx = await readCurrentTab();
  currentTabCtx = ctx;
  if (ctx) {
    if (!savedSnapshot) {
      document.getElementById("page-name").textContent  = ctx.name  || "—";
      document.getElementById("page-price").textContent = fmtPrice(ctx.price);
    }
    document.getElementById("page-keywords").textContent = ctx.keywords?.length ? ctx.keywords.join(", ") : "None";
  } else if (!savedSnapshot) {
    document.getElementById("page-name").textContent = "Open a product page to detect item";
  }
}

document.addEventListener("DOMContentLoaded", init);
