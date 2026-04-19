# MindfulCart 🐷

We built this at AugieHack 2026 by Aigerim, Altynai & Bidoog. 
The idea is simple — when you're about to buy something online, you get a moment to think about it first. Not a lecture, not a blocker. Just 30 seconds.

The Chrome extension detects when you're checking out, reads the item name and price from the page, and opens our website with that data. You answer a few questions about your mood and whether you actually need it, see how many hours of work the purchase costs, and then make your own call. Whatever you decide is fine. We just want you to decide on purpose.

---

## Running it

You need two terminals open and the extension loaded. All three need to be running at the same time.

**Backend** (port 3001)
```bash
cd backend
npm install
node index.js
```

**Frontend** (port 5173)
```bash
cd frontend
npm install
npm run dev
```

**Extension**

Go to `chrome://extensions`, turn on Developer mode, click Load unpacked, and select the `extension/` folder. If you make changes to any extension file, hit the reload icon on the extension card or it won't update.

If you want AI-generated summaries instead of the rule-based fallback, create a `.env` file inside `backend/` with your Anthropic API key:
```
ANTHROPIC_API_KEY=your_key_here
```

---

## How the extension actually works

Visit an Amazon product page first. The extension quietly saves the item name and price in the background. When you proceed to checkout, it reads that saved data and passes it to the website via URL parameters. This is why the website shows the real item — not the checkout page title ("Place Your Order") which is what we were accidentally showing before.

The extension won't touch anything on `localhost` so it doesn't interfere with our own website.

---

## Stack

React + Vite on the frontend, Express on the backend, Chrome Manifest V3 for the extension. Charts are drawn on raw Canvas — no chart library. Data lives in localStorage so nothing is sent anywhere.

---

## Team

Aigerim — backend   
Altynai — extension + backend suppport 
Bidoog — frontend 
