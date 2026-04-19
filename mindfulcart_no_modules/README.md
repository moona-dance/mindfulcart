# MindfulCart 🐷

> Pause before you purchase. A gentle Chrome extension + web app that helps you make mindful spending decisions.

---

## Project Structure

```
mindfulcart/
├── backend/        ← Express API (port 3001) — scores purchases, calls Claude AI
├── frontend/       ← React + Vite website (port 5173) — decision flow UI
└── extension/      ← Chrome extension — detects purchases, opens the website
```

---

## How to Run (for the demo)

### 1. Backend

```bash
cd backend
npm install
node index.js
```

The backend runs on **http://localhost:3001**

Optional — Claude AI summaries (much better output):
```bash
# Create a file called .env in the backend folder:
ANTHROPIC_API_KEY=your_key_here
```
Without the key it still works with rule-based messages.

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The website runs on **http://localhost:5173**

Open it in your browser. You can use it without the extension — click "Try Demo" on the homepage.

---

### 3. Chrome Extension

1. Open Chrome → go to `chrome://extensions`
2. Turn on **Developer mode** (top right toggle)
3. Click **"Load unpacked"**
4. Select the `extension/` folder from this project
5. The MindfulCart icon will appear in your toolbar

Now when you go to Amazon or any shopping site and click a "Buy" or "Checkout" button, it will open the MindfulCart decision flow automatically.

---

## How It Works

```
[User on Amazon clicks "Buy Now"]
        ↓
[Extension detects it → reads price, product name, sale keywords]
        ↓
[Opens http://localhost:5173/demo?price=...&name=...&keywords=...]
        ↓
[User goes through 7-step reflection flow on the website]
        ↓
[Frontend sends answers to backend at localhost:3001/analyze]
        ↓
[Backend calculates impulse score + calls Claude AI for a human summary]
        ↓
[AI summary shown: "This costs 4.6 hours of work" / "You tend to shop late at night..."]
        ↓
[User makes their own decision — buy / delay / skip / find alternative]
        ↓
[Decision saved to Insights page with patterns over time]
```

---

## Features

### Extension
- Detects purchase buttons ("Buy Now", "Checkout", etc.)
- Detects URL-based checkout pages (Amazon, generic)
- Reads product name, price, and sale keywords from the page
- Passes all data to the website via URL parameters
- Popup shows your financial goal and current page context

### Website — Decision Flow (7 steps)
1. **Interception** — shows what was detected
2. **Reflection** — 4 MCQ questions: need level, mood, replacement, usage timing
3. **Financial context** — hours of work, days from goal, progress bars
4. **Piggy bank** — animated visual of savings impact
5. **AI insight** — Claude-generated (or rule-based fallback) summary
6. **Decision** — buy / delay 24h / skip / find alternative
7. **Post-decision** — how do you feel? (stored in insights)

### Insights page
- Total purchases, money saved by skipping
- Behavior patterns (late-night shopping, favourite categories)
- Full decision history

---

## Tech Stack

| Part      | Tech                          |
|-----------|-------------------------------|
| Backend   | Node.js + Express             |
| AI        | Anthropic Claude (Haiku)      |
| Frontend  | React 18 + Vite               |
| Styling   | Custom CSS (no framework)     |
| Extension | Chrome Manifest V3            |
| Storage   | localStorage (browser-side)   |

---

Made with 💜 at AugieHack 2026 — by Aigerim, Altynai & Bidoog
