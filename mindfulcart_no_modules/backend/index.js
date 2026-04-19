const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "MindfulCart backend is running", version: "1.0.0" });
});

// ─── Score calculator ─────────────────────────────────────────────────────────
function calculateImpulseScore(data) {
  const { price, answers, monthlyIncome, goalSaved, goalAmount } = data;
  let score = 0;
  const factors = [];

  // Need level
  if (answers.need === "no") {
    score += 35;
    factors.push("You said you don't really need it");
  } else if (answers.need === "maybe") {
    score += 15;
    factors.push("You're not sure if you need it");
  }

  // Urgency / usage timing
  if (answers.urgency === "low") {
    score += 25;
    factors.push("You'd use it rarely");
  } else if (answers.urgency === "medium") {
    score += 10;
    factors.push("You'd use it this week");
  }

  // Has replacement
  if (answers.duplicate === "yes") {
    score += 20;
    factors.push("You have something that could replace it");
  }

  // Price vs income check
  const monthlyRate = monthlyIncome || 4500;
  const hourlyRate = monthlyRate / 160;
  const hoursOfWork = price / hourlyRate;
  const daysFromGoal = goalAmount && goalSaved
    ? ((price / (goalAmount - goalSaved)) * 30).toFixed(1)
    : null;

  if (price > monthlyRate * 0.2) {
    score += 15;
    factors.push("This is more than 20% of your monthly income");
  } else if (price > monthlyRate * 0.1) {
    score += 5;
  }

  // Mood check (passed from frontend)
  if (answers.mood === "bored") {
    score += 15;
    factors.push("You're feeling bored — shopping can feel exciting but fades fast");
  } else if (answers.mood === "stressed") {
    score += 10;
    factors.push("You're stressed — emotions can drive impulsive decisions");
  }

  // Late night check
  const hour = answers.hour !== undefined ? parseInt(answers.hour) : new Date().getHours();
  if (hour >= 22 || hour <= 5) {
    score += 10;
    factors.push("You're shopping late at night");
  }

  // Sale keyword detected
  if (answers.saleDetected) {
    score += 5;
    factors.push("'Sale' or discount language was detected on the page");
  }

  score = Math.min(score, 100);

  return {
    score,
    hoursOfWork: hoursOfWork.toFixed(1),
    daysFromGoal,
    factors,
    hourlyRate: hourlyRate.toFixed(2),
  };
}

// ─── AI Summary via Claude API ────────────────────────────────────────────────
async function getAISummary(scoreData, productName, price, decision, pastBehavior) {
  const {
    score,
    hoursOfWork,
    daysFromGoal,
    factors,
    hourlyRate,
  } = scoreData;

  const systemPrompt = `You are MindfulCart, a warm, supportive financial reflection assistant. 
Your job is to give honest but non-judgmental insights about purchases.
NEVER tell users what to do. Never say "you should" or "you shouldn't".
Be warm, concise, and real. Like a smart friend who knows finance.
If the user already decided to buy: celebrate it genuinely, then show real numbers without shaming.
Always end on an empowering note.
Keep response under 120 words.`;

  const userPrompt = `Product: ${productName} — $${price}
Impulse score: ${score}/100 (higher = more impulsive)
Hours of work this costs: ${hoursOfWork}h at $${hourlyRate}/hr
${daysFromGoal ? `Days further from financial goal: ${daysFromGoal} days` : ""}
Key factors: ${factors.join("; ")}
${pastBehavior ? `Past behavior note: ${pastBehavior}` : ""}
User's final decision: ${decision || "not yet decided"}

Write a warm 2-3 sentence insight. If they decided to buy, acknowledge it warmly first, then share the numbers as context only.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (err) {
    console.error("Claude API error:", err.message);
    return null; // fallback to rule-based
  }
}

// ─── Main analyze route ───────────────────────────────────────────────────────
app.post("/analyze", async (req, res) => {
  const {
    product,
    price = 0,
    answers = {},
    monthlyIncome,
    goalSaved,
    goalAmount,
    goalName,
    decision,
    pastBehavior,
  } = req.body;

  const scoreData = calculateImpulseScore({
    price,
    answers,
    monthlyIncome,
    goalSaved,
    goalAmount,
  });

  // Build rule-based fallback message
  let fallbackMessage;
  if (decision === "buy") {
    fallbackMessage = `Hope you enjoy your ${product}! For context, this costs about ${scoreData.hoursOfWork} hours of your work time${scoreData.daysFromGoal ? ` and puts you roughly ${scoreData.daysFromGoal} days further from your goal` : ""}. That's just numbers — what matters is it brings you value.`;
  } else if (scoreData.score >= 60) {
    fallbackMessage = `This looks like it might be an impulse moment — your score is ${scoreData.score}/100. This purchase costs about ${scoreData.hoursOfWork} hours of work. Maybe give it 24 hours?`;
  } else if (scoreData.score >= 30) {
    fallbackMessage = `You're on the fence (score: ${scoreData.score}/100). At ${scoreData.hoursOfWork} hours of work, it's worth a quick pause. If it still feels right tomorrow, go for it.`;
  } else {
    fallbackMessage = `This seems like a considered purchase (score: ${scoreData.score}/100). You have clear reasons for it. Trust your instincts.`;
  }

  // Try Claude AI for richer summary
  const aiSummary = await getAISummary(scoreData, product, price, decision, pastBehavior);

  res.json({
    product,
    price,
    score: scoreData.score,
    hoursOfWork: scoreData.hoursOfWork,
    daysFromGoal: scoreData.daysFromGoal,
    hourlyRate: scoreData.hourlyRate,
    factors: scoreData.factors,
    aiSummary: aiSummary || fallbackMessage,
    usingAI: !!aiSummary,
    timestamp: new Date().toISOString(),
  });
});

// ─── Store decisions (in-memory for hackathon) ────────────────────────────────
const decisions = [];

app.post("/decisions", (req, res) => {
  const record = { ...req.body, serverTimestamp: Date.now() };
  decisions.push(record);
  res.json({ ok: true, id: decisions.length - 1 });
});

app.get("/decisions", (req, res) => {
  res.json(decisions);
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ MindfulCart backend running on http://localhost:${PORT}`);
  console.log(`   AI summaries: ${process.env.ANTHROPIC_API_KEY ? "enabled" : "disabled (add ANTHROPIC_API_KEY to .env)"}`);
});
