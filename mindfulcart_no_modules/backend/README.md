# MindfulCart — Backend

Express.js API. Runs on port 3001.

## Setup

```bash
cd backend
npm install
node index.js
```

## Optional: Claude AI summaries

Create a `.env` file in this folder:
```
ANTHROPIC_API_KEY=your_key_here
```

Without the key, the backend uses rule-based fallback messages.

## Endpoints

- `GET /` — health check
- `POST /analyze` — score a purchase, returns impulse score + AI summary
- `POST /decisions` — save a decision record
- `GET /decisions` — get all saved decisions
