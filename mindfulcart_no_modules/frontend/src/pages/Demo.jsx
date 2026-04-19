import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";

const BACKEND = "http://localhost:3001";

async function callAnalyze(payload) {
  try {
    const res = await fetch(`${BACKEND}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Backend " + res.status);
    return await res.json();
  } catch (err) {
    console.warn("Backend not reachable:", err.message);
    return null;
  }
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function OptionBtn({ label, selected, onClick, icon, sublabel }) {
  return (
    <button className={`option-btn ${selected ? "selected" : ""}`} onClick={onClick} type="button">
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontWeight: 600 }}>{label}</span>
        {sublabel && <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>{sublabel}</span>}
      </span>
      {selected && <span style={{ color: "var(--primary)", fontSize: 18 }}>✓</span>}
    </button>
  );
}

function StepProgress({ current, total }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Step {current} of {total}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>
          {Math.round((current / total) * 100)}%
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}

function FlowHeader({ title, onHome }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <button
        onClick={onHome}
        title="Go to home page"
        style={{
          width: 38, height: 38, borderRadius: 10,
          background: "white", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 18, color: "var(--text-muted)",
        }}
      >
        🏠
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "var(--primary)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>🛒</div>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>
      </div>
    </div>
  );
}

// ── STEP 1: Interception ──────────────────────────────────────────────────────

function InterceptionStep({ onNext, onSkip }) {
  const { currentProduct, financialProfile, user } = useApp();

  const catColors = {
    Electronics: { bg: "#dbeafe", text: "#1d4ed8" },
    Accessories: { bg: "#fef3c7", text: "#92400e" },
    Fitness:     { bg: "#d1fae5", text: "#065f46" },
    "Home & Living": { bg: "#fee2e2", text: "#991b1b" },
    Footwear:    { bg: "#ede8ff", text: "#5b21b6" },
    Kitchen:     { bg: "#ffedd5", text: "#9a3412" },
    General:     { bg: "#f3f4f6", text: "#374151" },
  };
  const cat = catColors[currentProduct.category] || catColors.General;

  return (
    <div className="fade-up">
      {/* Detection banner */}
      <div style={{
        background: "var(--primary-light)", border: "1px solid rgba(124,92,252,0.2)",
        borderRadius: 14, padding: "12px 18px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
          🛍️ Someone is shopping!! ✨🛒💸
        </p>
      </div>

      {/* Product card — shows real data from the page the user came from */}
      <div className="glass" style={{ borderRadius: 20, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <span className="chip" style={{ background: cat.bg, color: cat.text, marginBottom: 10, fontSize: 12 }}>
              🏷 {currentProduct.category}
            </span>
            <h2 style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.3 }}>{currentProduct.name}</h2>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
            <p style={{ fontSize: 26, fontWeight: 800 }}>${currentProduct.price.toFixed(2)}</p>
          </div>
        </div>

        {currentProduct.keywords?.length > 0 && (
          <div style={{ background: "#fef3c7", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#92400e", fontWeight: 600, marginBottom: 12 }}>
            ⚡ Sale keywords detected: {currentProduct.keywords.join(", ")}
          </div>
        )}

        {/* Financial goal shown as motivation */}
        {user && (
          <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <p style={{ fontSize: 13, color: "#065f46", fontWeight: 600 }}>
              Your goal: <strong>{financialProfile.goalName}</strong> — ${financialProfile.goalSaved.toLocaleString()} / ${financialProfile.goalAmount.toLocaleString()} saved
            </p>
          </div>
        )}

        <div style={{ height: 1, background: "var(--border)", margin: "10px 0 12px" }} />
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
          Before you check out, take <strong style={{ color: "var(--text)" }}>30 seconds to reflect.</strong>{" "}
          This isn't about stopping you — it's about making sure you feel great about this decision.
        </p>
      </div>

      <button className="btn btn-primary btn-full btn-lg" onClick={onNext} style={{ marginBottom: 10 }}>
        ⚡ Start Reflection →
      </button>

      {/* Skip to purchase — goes back to original URL */}
      <button
        onClick={onSkip}
        style={{
          width: "100%", padding: "13px", borderRadius: 12,
          border: "2px solid rgba(124,92,252,0.2)", background: "transparent",
          cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600,
          fontSize: 14, color: "var(--text-muted)", transition: "all 0.18s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        Skip — take me straight to the purchase 🛒
      </button>
    </div>
  );
}

// ── STEP 2: Reflection (auto-advance on MCQ) ──────────────────────────────────

function ReflectionStep({ onNext }) {
  const { currentProduct, financialProfile, setReflectionAnswers, setAnalysisResult } = useApp();
  const [q, setQ] = useState(0);
  const [answers, setAnswers] = useState({ need: null, mood: null, replacement: "", usage: null });
  const [loading, setLoading] = useState(false);

  const totalQ = 4;

  const selectAndAdvance = async (key, value) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (q < totalQ - 1) {
      setTimeout(() => setQ(q + 1), 220);
      return;
    }

    // Last question answered — call backend then advance
    setReflectionAnswers(updated);
    setLoading(true);
    const payload = {
      product: currentProduct.name,
      price:   currentProduct.price,
      answers: {
        need:      updated.need === "Yes" ? "yes" : updated.need === "No" ? "no" : "maybe",
        duplicate: updated.replacement?.trim().length > 2 ? "yes" : "no",
        urgency:   updated.usage === "Today" ? "high" : updated.usage === "This week" ? "medium" : "low",
        mood:      updated.mood?.toLowerCase(),
        hour:      new Date().getHours(),
        saleDetected: (currentProduct.keywords?.length || 0) > 0,
      },
      monthlyIncome: financialProfile.monthlyIncome,
      goalSaved:     financialProfile.goalSaved,
      goalAmount:    financialProfile.goalAmount,
      goalName:      financialProfile.goalName,
    };
    const result = await callAnalyze(payload);
    setAnalysisResult(result);
    setLoading(false);
    onNext();
  };

  const Q0 = (
    <div key="q0" className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Do you really need this?</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>Be honest with yourself — there's no wrong answer.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OptionBtn label="Yes, I need it" icon="✅" selected={answers.need === "Yes"} onClick={() => selectAndAdvance("need", "Yes")} />
        <OptionBtn label="Maybe — I'm not sure" icon="🤔" selected={answers.need === "Maybe"} onClick={() => selectAndAdvance("need", "Maybe")} />
        <OptionBtn label="Not really, it's a want" icon="💭" selected={answers.need === "No"} onClick={() => selectAndAdvance("need", "No")} />
      </div>
    </div>
  );

  const Q1 = (
    <div key="q1" className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>How are you feeling right now?</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>Our emotions shape our decisions more than we realise.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OptionBtn label="Excited" icon="🎉" selected={answers.mood === "Excited"} onClick={() => selectAndAdvance("mood", "Excited")} />
        <OptionBtn label="Bored" icon="😑" selected={answers.mood === "Bored"} onClick={() => selectAndAdvance("mood", "Bored")} />
        <OptionBtn label="Stressed" icon="😤" selected={answers.mood === "Stressed"} onClick={() => selectAndAdvance("mood", "Stressed")} />
        <OptionBtn label="Happy & relaxed" icon="😊" selected={answers.mood === "Happy"} onClick={() => selectAndAdvance("mood", "Happy")} />
      </div>
    </div>
  );

  const Q2 = (
    <div key="q2" className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Could something you own replace this?</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>Optional — just a thought prompt.</p>
      <input
        className="input"
        placeholder="e.g. my old headphones, a library book..."
        value={answers.replacement}
        onChange={e => setAnswers({ ...answers, replacement: e.target.value })}
        style={{ fontSize: 15 }}
        autoFocus
      />
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>Leave blank if nothing comes to mind.</p>
      <button
        className="btn btn-primary btn-full"
        style={{ marginTop: 20 }}
        onClick={() => setTimeout(() => setQ(q + 1), 50)}
      >
        Next →
      </button>
    </div>
  );

  const Q3 = (
    <div key="q3" className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>When would you realistically use this?</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>Think honestly about your day-to-day life.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OptionBtn label="Today" sublabel="I have an immediate use" icon="⚡" selected={answers.usage === "Today"} onClick={() => selectAndAdvance("usage", "Today")} />
        <OptionBtn label="This week" sublabel="Soon enough" icon="📅" selected={answers.usage === "This week"} onClick={() => selectAndAdvance("usage", "This week")} />
        <OptionBtn label="Rarely" sublabel="It's more aspirational" icon="🌙" selected={answers.usage === "Rarely"} onClick={() => selectAndAdvance("usage", "Rarely")} />
      </div>
      {loading && <p style={{ textAlign: "center", marginTop: 16, color: "var(--text-muted)", fontSize: 14 }}>Analysing... ✨</p>}
    </div>
  );

  return (
    <div>
      <StepProgress current={q + 1} total={totalQ} />
      {[Q0, Q1, Q2, Q3][q]}
    </div>
  );
}

// ── STEP 3: Financial awareness ───────────────────────────────────────────────

function FinancialStep({ onNext }) {
  const { currentProduct, financialProfile, setFinancialProfile, analysisResult } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    monthlyIncome: String(financialProfile.monthlyIncome),
    goalName:      financialProfile.goalName,
    goalAmount:    String(financialProfile.goalAmount),
    goalSaved:     String(financialProfile.goalSaved),
  });

  const price        = currentProduct.price;
  const hourlyRate   = financialProfile.monthlyIncome / 160;
  const hoursWorked  = analysisResult?.hoursOfWork  || (price / hourlyRate).toFixed(1);
  const daysFromGoal = analysisResult?.daysFromGoal ||
    ((price / Math.max(1, financialProfile.goalAmount - financialProfile.goalSaved)) * 30).toFixed(0);
  const goalProgress = Math.min(100, (financialProfile.goalSaved / Math.max(1, financialProfile.goalAmount)) * 100);
  const newProgress  = Math.max(0, ((financialProfile.goalSaved - price) / Math.max(1, financialProfile.goalAmount)) * 100);

  const saveEdits = () => {
    setFinancialProfile({
      monthlyIncome: parseFloat(form.monthlyIncome) || financialProfile.monthlyIncome,
      goalName:      form.goalName || financialProfile.goalName,
      goalAmount:    parseFloat(form.goalAmount) || financialProfile.goalAmount,
      goalSaved:     parseFloat(form.goalSaved)  || financialProfile.goalSaved,
    });
    setEditing(false);
  };

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Financial context</h2>
        <button className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 14px" }} onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "✏️ Edit"}
        </button>
      </div>

      {editing ? (
        <div className="glass" style={{ borderRadius: 18, padding: 22, marginBottom: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Monthly income ($)</label>
            <input className="input" type="number" value={form.monthlyIncome} onChange={e => setForm({ ...form, monthlyIncome: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Goal name</label>
            <input className="input" value={form.goalName} onChange={e => setForm({ ...form, goalName: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div>
              <label className="label">Goal amount ($)</label>
              <input className="input" type="number" value={form.goalAmount} onChange={e => setForm({ ...form, goalAmount: e.target.value })} />
            </div>
            <div>
              <label className="label">Saved so far ($)</label>
              <input className="input" type="number" value={form.goalSaved} onChange={e => setForm({ ...form, goalSaved: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={saveEdits}>Save</button>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="glass stat-card" style={{ background: "#fffbeb" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>⏱</div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Hours of work</p>
              <p style={{ fontSize: 28, fontWeight: 800 }}>{hoursWorked}h</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>at ${hourlyRate.toFixed(0)}/hr</p>
            </div>
            <div className="glass stat-card" style={{ background: "#fff1f2" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>🎯</div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Days from goal</p>
              <p style={{ fontSize: 28, fontWeight: 800 }}>{daysFromGoal}d</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>further away</p>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 18, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>🎯 {financialProfile.goalName}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                ${financialProfile.goalSaved.toLocaleString()} / ${financialProfile.goalAmount.toLocaleString()}
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Current progress</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${goalProgress}%` }} /></div>
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#e11d48", marginBottom: 4 }}>After this purchase</p>
              <div className="progress-bar" style={{ background: "#fee2e2" }}>
                <div className="progress-fill" style={{ width: `${newProgress}%`, background: "#f87171" }} />
              </div>
            </div>
          </div>
        </>
      )}
      <button className="btn btn-primary btn-full btn-lg" onClick={onNext}>Continue →</button>
    </div>
  );
}

// ── STEP 4: Piggy bank ────────────────────────────────────────────────────────

function PiggyBankStep({ onNext }) {
  const { currentProduct, financialProfile } = useApp();
  const [tapped, setTapped]   = useState(false);
  const [shaking, setShaking] = useState(false);

  const goalProgress = Math.min(100, (financialProfile.goalSaved / Math.max(1, financialProfile.goalAmount)) * 100);
  const newProgress  = Math.max(0, ((financialProfile.goalSaved - currentProduct.price) / Math.max(1, financialProfile.goalAmount)) * 100);

  const handleTap = () => {
    if (tapped) return;
    setShaking(true);
    setTimeout(() => { setShaking(false); setTapped(true); }, 500);
  };

  return (
    <div className="fade-up" style={{ textAlign: "center" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Your savings, visualised</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>
        Tap the piggy bank to see what ${currentProduct.price.toFixed(2)} looks like leaving your savings.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 28, alignItems: "flex-end" }}>
        {/* Before jar */}
        <div style={{ textAlign: "center" }}>
          <div className="piggy-jar" style={{ marginBottom: 10 }}>
            <div className="piggy-jar-fill" style={{ height: `${goalProgress}%` }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Now</p>
          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>{goalProgress.toFixed(0)}%</p>
        </div>

        {/* 🐷 cute pig back as requested */}
        <button
          onClick={handleTap}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            style={{ fontSize: 72 }}
            className={shaking ? "shaking" : tapped ? "" : "floating"}
          >
            🐷
          </div>
        </button>

        {/* After jar */}
        <div style={{ textAlign: "center" }}>
          <div
            className="piggy-jar"
            style={{
              marginBottom: 10,
              opacity: tapped ? 1 : 0.3,
              transition: "opacity 0.4s",
              border: tapped ? "3px solid #fca5a5" : "3px solid #e5e0f5",
            }}
          >
            <div
              className="piggy-jar-fill"
              style={{
                height: tapped ? `${newProgress}%` : `${goalProgress}%`,
                background: tapped ? "linear-gradient(180deg, #fca5a5, #ef4444)" : undefined,
                transition: "height 0.9s ease",
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>After</p>
          <p style={{ fontSize: 13, fontWeight: 800, color: tapped ? "#e11d48" : "var(--text-muted)" }}>
            {tapped ? `${newProgress.toFixed(0)}%` : "—"}
          </p>
        </div>
      </div>

      {tapped && (
        <div className="glass fade-up" style={{ borderRadius: 18, padding: "18px 22px", marginBottom: 20, textAlign: "left" }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Hope you'll really enjoy this purchase 💛</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Whatever you decide, we're rooting for you. The numbers are just context — you always know best.
          </p>
        </div>
      )}
      {!tapped && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>👆 Tap the pig to animate</p>
      )}

      <button className="btn btn-primary btn-full btn-lg" onClick={onNext}>See AI Insight →</button>
    </div>
  );
}

// ── STEP 5: AI Insight ────────────────────────────────────────────────────────

function AIInsightStep({ onNext }) {
  const { currentProduct, reflectionAnswers, analysisResult, financialProfile } = useApp();
  const [revealed, setRevealed] = useState(false);
  const hour = new Date().getHours();

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 700);
    return () => clearTimeout(t);
  }, []);

  const buildFallback = () => {
    if (reflectionAnswers.need === "No")
      return `You mentioned you don't really need the ${currentProduct.name} right now — it might be worth adding it to a wishlist and revisiting in a week.`;
    if (reflectionAnswers.mood === "Bored")
      return `You mentioned feeling bored. Shopping feels exciting in the moment, but that feeling often fades quickly.`;
    if (reflectionAnswers.mood === "Stressed")
      return `Stress can nudge us toward purchases as a way to feel better. Make sure this purchase genuinely provides that comfort.`;
    if (reflectionAnswers.usage === "Rarely")
      return `You mentioned you'd use this rarely. Consider if there's a way to try before you fully commit.`;
    if (hour >= 22 || hour <= 5)
      return `It's late — late-night browsing can sometimes lead to purchases we feel differently about in the morning.`;
    return `This looks like a considered purchase. If it adds genuine value to your day, it could well be worth it.`;
  };

  const aiSummary    = analysisResult?.aiSummary || buildFallback();
  const score        = analysisResult?.score;
  const hoursOfWork  = analysisResult?.hoursOfWork || (currentProduct.price / (financialProfile.monthlyIncome / 160)).toFixed(1);
  const daysFromGoal = analysisResult?.daysFromGoal;
  const scoreColor   = score >= 60 ? "#e11d48" : score >= 30 ? "#f59e0b" : "#10b981";

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          💡
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>AI Insight</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Based on your reflection</p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {reflectionAnswers.need  && <span className="chip" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>Need: {reflectionAnswers.need}</span>}
        {reflectionAnswers.mood  && <span className="chip" style={{ background: "#fef3c7", color: "#92400e" }}>Mood: {reflectionAnswers.mood}</span>}
        {reflectionAnswers.usage && <span className="chip" style={{ background: "#dbeafe", color: "#1d4ed8" }}>Usage: {reflectionAnswers.usage}</span>}
        {(hour >= 22 || hour <= 5) && <span className="chip" style={{ background: "#ede9fe", color: "#6d28d9" }}>🌙 Late night</span>}
      </div>

      <div
        className="insight-card"
        style={{
          marginBottom: 18,
          opacity: revealed ? 1 : 0,
          transform: revealed ? "none" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>✨</span>
          <p style={{ fontSize: 15, lineHeight: 1.7, fontWeight: 500 }}>
            {revealed ? `"${aiSummary}"` : "Analysing your responses..."}
          </p>
        </div>
        {analysisResult?.usingAI && (
          <p style={{ fontSize: 11, color: "var(--primary)", marginTop: 8, fontWeight: 600 }}>✨ Generated by Claude AI</p>
        )}
      </div>

      {score !== undefined && (
        <div className="glass" style={{ borderRadius: 18, padding: 18, marginBottom: 18, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: `conic-gradient(${scoreColor} ${score}%, #f3f4f6 ${score}%)`,
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "white" }} />
              <span style={{ position: "relative", fontWeight: 800, fontSize: 16, color: scoreColor }}>{score}</span>
            </div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>impulse score</p>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              This costs <strong style={{ color: "var(--primary)" }}>{hoursOfWork} hours</strong> of work
            </p>
            {daysFromGoal && (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>and puts you ~{daysFromGoal} days further from your goal</p>
            )}
            {analysisResult?.factors?.length > 0 && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                {analysisResult.factors.slice(0, 2).join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginBottom: 20 }}>
        This insight is supportive, not prescriptive. You always know best.
      </p>
      <button className="btn btn-primary btn-full btn-lg" onClick={onNext}>Make My Decision →</button>
    </div>
  );
}

// ── STEP 6: Decision ──────────────────────────────────────────────────────────

function DecisionStep({ onDecide }) {
  const { currentProduct } = useApp();

  const options = [
    { key: "buy",         icon: "✅", label: "Buy Now",            desc: "I'm confident in this purchase",  bg: "#f0fdf4", border: "#bbf7d0", color: "#065f46" },
    { key: "delay",       icon: "⏰", label: "Delay 24 Hours",     desc: "I'll revisit this tomorrow",       bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
    { key: "skip",        icon: "❌", label: "Skip This Time",     desc: "Not right for me right now",       bg: "#fff1f2", border: "#fecdd3", color: "#9f1239" },
    { key: "alternative", icon: "🔍", label: "Find Alternative",  desc: "Explore other options first",      bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
  ];

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Your decision</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>
        <strong>{currentProduct.name}</strong> — ${currentProduct.price.toFixed(2)}. Whatever you choose, it's the right choice for you.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => onDecide(opt.key)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "18px 20px", borderRadius: 16,
              border: `2px solid ${opt.border}`, background: opt.bg, color: opt.color,
              cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)",
              transition: "transform 0.18s, box-shadow 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span style={{ fontSize: 24 }}>{opt.icon}</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15 }}>{opt.label}</p>
              <p style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{opt.desc}</p>
            </div>
            <span style={{ marginLeft: "auto", opacity: 0.5 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── STEP 7: Post-decision feeling ─────────────────────────────────────────────

function PostDecisionStep({ decision, onDone }) {
  const messages = {
    buy:         "You went for it! 🎉 How do you feel about this decision?",
    delay:       "Smart move — giving it a day. How do you feel?",
    skip:        "You chose to skip this one. How does that feel?",
    alternative: "Exploring alternatives is always wise. How do you feel?",
  };
  const feelings = [
    { key: "Happy",   icon: "😊", label: "Happy",   bg: "#f0fdf4", border: "#bbf7d0", color: "#065f46" },
    { key: "Neutral", icon: "😐", label: "Neutral",  bg: "#f8fafc", border: "#e2e8f0", color: "#475569" },
    { key: "Regret",  icon: "😔", label: "Regret",   bg: "#fff1f2", border: "#fecdd3", color: "#9f1239" },
    { key: "Unsure",  icon: "🤷", label: "Unsure",   bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
  ];

  return (
    <div className="fade-up" style={{ textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>✅</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Decision recorded</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>{messages[decision]}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {feelings.map(f => (
          <button key={f.key} onClick={() => onDone(f.key)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "20px 16px", borderRadius: 16,
              border: `2px solid ${f.border}`, background: f.bg, color: f.color,
              cursor: "pointer", fontFamily: "var(--font-body)", transition: "transform 0.18s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <span style={{ fontSize: 32 }}>{f.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Done screen ───────────────────────────────────────────────────────────────

function DoneStep({ feeling, decision, onTryAnother, onNav }) {
  const { originalPurchaseUrl } = useApp();

  const messages = {
    Happy:   "That's wonderful! Mindful decisions feel great. 🎉",
    Neutral: "That's completely okay. Every decision is a learning moment.",
    Regret:  "Thank you for being honest with yourself. That awareness is powerful.",
    Unsure:  "Uncertainty is normal. You can always revisit this later.",
  };

  return (
    <div className="fade-up" style={{ textAlign: "center" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), #34d399)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, margin: "0 auto 20px",
      }}>✨</div>

      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>All done!</h2>
      <p style={{ fontSize: 16, color: "var(--text)", marginBottom: 6, fontWeight: 600 }}>{messages[feeling]}</p>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>Your decision has been saved to your insights.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* If they chose to buy AND we have the original URL, show the go-back button */}
        {decision === "buy" && originalPurchaseUrl && (
          <a
            href={originalPurchaseUrl}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "16px 24px", borderRadius: 12,
              background: "var(--primary)", color: "#fff",
              fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}
          >
            🛒 Go back and complete the purchase →
          </a>
        )}

        {/* If they chose buy but NO original URL (pure demo), show a friendly note */}
        {decision === "buy" && !originalPurchaseUrl && (
          <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 14, padding: "14px 18px" }}>
            <p style={{ fontSize: 14, color: "#065f46", fontWeight: 700 }}>
              Great choice! 🎉 Go back to the store and complete your purchase.
            </p>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg"
          style={{ background: decision === "buy" && originalPurchaseUrl ? "#10b981" : undefined }}
          onClick={() => onNav("insights")}>
          📊 View My Insights
        </button>

        {/* Try Another Demo only restarts with a NEW random product */}
        <button className="btn btn-ghost btn-full" onClick={onTryAnother}>
          🔀 Try Another Demo
        </button>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

const STEP_LABELS = {
  interception:    "MindfulCart",
  reflection:      "Reflect",
  financial:       "Financial Clarity",
  piggybank:       "Savings View",
  "ai-insight":   "AI Insight",
  decision:        "Your Decision",
  "post-decision": "Check In",
};

export default function Demo({ onNav }) {
  const {
    demoStep, setDemoStep,
    currentProduct, reflectionAnswers,
    addDecision, simulateDetection,
    originalPurchaseUrl,
  } = useApp();

  const [decision, setDecision] = useState(null);
  const [feeling,  setFeeling]  = useState(null);

  const saveRecord = (d, f) => {
    const record = {
      id:          (crypto.randomUUID?.() || String(Date.now())),
      timestamp:   Date.now(),
      product:     currentProduct,
      answers:     reflectionAnswers,
      decision:    d,
      postFeeling: f || null,
      hour:        new Date().getHours(),
    };
    addDecision(record);
    fetch("http://localhost:3001/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).catch(() => {});
  };

  const handleDecision = (d) => {
    setDecision(d);
    if (d === "buy") {
      // Save immediately with no feeling — go straight to Done
      saveRecord(d, null);
      setIsDone(true);
    } else {
      setDemoStep("post-decision");
    }
  };

  const handleFeeling = (f) => {
    setFeeling(f);
    saveRecord(decision, f);
    setIsDone(true);
  };

  // Skip straight to original purchase URL (or home if no URL)
  const handleSkip = () => {
    if (originalPurchaseUrl) {
      window.location.href = originalPurchaseUrl;
    } else {
      onNav("home");
    }
  };

  // "Try Another Demo" — loads a fresh random product, resets all state
  const handleTryAnother = () => {
    simulateDetection();
    setDecision(null);
    setFeeling(null);
    setIsDone(false);
    setDemoStep("interception");
  };

  const [isDone, setIsDone] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0edff 0%, #faf9ff 50%, #edfff7 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 20px",
    }}>
      <div className="orb" style={{ width: 400, height: 400, background: "#c4b5fd", top: -150, left: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: "#6ee7b7", bottom: -80, right: -80 }} />

      <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
        <div className="glass flow-card">
          {!isDone && (
            <FlowHeader
              title={STEP_LABELS[demoStep] || "MindfulCart"}
              onHome={() => onNav("home")}
            />
          )}

          {isDone ? (
            <DoneStep
              feeling={feeling}
              decision={decision}
              onTryAnother={handleTryAnother}
              onNav={onNav}
            />
          ) : demoStep === "interception" ? (
            <InterceptionStep
              onNext={() => setDemoStep("reflection")}
              onSkip={handleSkip}
            />
          ) : demoStep === "reflection" ? (
            <ReflectionStep onNext={() => setDemoStep("financial")} />
          ) : demoStep === "financial" ? (
            <FinancialStep onNext={() => setDemoStep("piggybank")} />
          ) : demoStep === "piggybank" ? (
            <PiggyBankStep onNext={() => setDemoStep("ai-insight")} />
          ) : demoStep === "ai-insight" ? (
            <AIInsightStep onNext={() => setDemoStep("decision")} />
          ) : demoStep === "decision" ? (
            <DecisionStep onDecide={handleDecision} />
          ) : demoStep === "post-decision" ? (
            <PostDecisionStep decision={decision} onDone={handleFeeling} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
