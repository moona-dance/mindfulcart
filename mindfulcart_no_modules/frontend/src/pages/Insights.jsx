import { useApp } from "../context/AppContext.jsx";
import Nav from "../components/Nav.jsx";
import { useEffect, useRef } from "react";

// ── Radar Chart (pure canvas, no library needed) ──────────────────────────────
function RadarChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R  = Math.min(W, H) / 2 - 40;

    ctx.clearRect(0, 0, W, H);

    const labels = data.map(d => d.label);
    const values = data.map(d => d.value); // 0-1 normalized
    const n = labels.length;
    const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

    // Draw grid rings
    for (let r = 0.25; r <= 1; r += 0.25) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = cx + Math.cos(angle(i)) * R * r;
        const y = cy + Math.sin(angle(i)) * R * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(124,92,252,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw spokes
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle(i)) * R, cy + Math.sin(angle(i)) * R);
      ctx.strokeStyle = "rgba(124,92,252,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw filled polygon
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const v = values[i];
      const x = cx + Math.cos(angle(i)) * R * v;
      const y = cy + Math.sin(angle(i)) * R * v;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(124,92,252,0.18)";
    ctx.fill();
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw dots
    for (let i = 0; i < n; i++) {
      const v = values[i];
      const x = cx + Math.cos(angle(i)) * R * v;
      const y = cy + Math.sin(angle(i)) * R * v;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#7c5cfc";
      ctx.fill();
    }

    // Draw labels
    ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#1e1a3a";
    ctx.textAlign = "center";
    for (let i = 0; i < n; i++) {
      const x = cx + Math.cos(angle(i)) * (R + 24);
      const y = cy + Math.sin(angle(i)) * (R + 24) + 4;
      ctx.fillText(labels[i], x, y);
    }
  }, [data]);

  return <canvas ref={canvasRef} width={320} height={280} style={{ maxWidth: "100%" }} />;
}

// ── Doughnut Chart (pure canvas) ──────────────────────────────────────────────
function DoughnutChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 20;
    const inner = R * 0.55;

    ctx.clearRect(0, 0, W, H);

    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;

    const COLORS = ["#10b981", "#6b7280", "#e11d48", "#f59e0b"];
    let startAngle = -Math.PI / 2;

    data.forEach((d, i) => {
      const slice = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      startAngle += slice;
    });

    // Doughnut hole
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Center label
    ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#1e1a3a";
    ctx.textAlign = "center";
    ctx.fillText("Mood", cx, cy - 4);
    ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#6b6589";
    ctx.fillText("at purchase", cx, cy + 14);
  }, [data]);

  return <canvas ref={canvasRef} width={220} height={220} style={{ maxWidth: "100%" }} />;
}

// ── Other UI ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, bg }) {
  return (
    <div className="glass" style={{ borderRadius: 18, padding: 22, background: bg }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function DecisionCard({ record }) {
  const styles = {
    buy:         { class: "decision-buy",   emoji: "✅", label: "Bought" },
    delay:       { class: "decision-delay", emoji: "⏰", label: "Delayed" },
    skip:        { class: "decision-skip",  emoji: "❌", label: "Skipped" },
    alternative: { class: "decision-alternative", emoji: "🔍", label: "Alternative" },
  };
  const s = styles[record.decision] || styles.buy;
  const date = new Date(record.timestamp);
  const timeStr = date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const isLateNight = record.hour >= 22 || record.hour <= 5;

  return (
    <div className={`decision-card ${s.class}`} style={{ borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{record.product?.name}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>${record.product?.price?.toFixed(2)}</p>
        </div>
        <span style={{ fontSize: 22 }}>{s.emoji}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        <span className="chip" style={{ background: "rgba(0,0,0,0.06)", color: "inherit", fontSize: 11 }}>{s.label}</span>
        {record.postFeeling && <span className="chip" style={{ background: "rgba(0,0,0,0.06)", fontSize: 11 }}>Felt: {record.postFeeling}</span>}
        {record.answers?.need && <span className="chip" style={{ background: "rgba(0,0,0,0.06)", fontSize: 11 }}>Need: {record.answers.need}</span>}
        {isLateNight && <span className="chip" style={{ background: "rgba(0,0,0,0.06)", fontSize: 11 }}>🌙 Late night</span>}
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeStr} · {record.product?.category}</p>
    </div>
  );
}

// ── Main Insights page ────────────────────────────────────────────────────────

export default function Insights({ onNav }) {
  const { decisions, financialProfile, simulateDetection } = useApp();

  const totalDecisions = decisions.length;
  const bought  = decisions.filter(d => d.decision === "buy");
  const skipped = decisions.filter(d => d.decision === "skip").length;
  const delayed = decisions.filter(d => d.decision === "delay").length;

  const totalSaved = decisions.filter(d => d.decision !== "buy")
    .reduce((s, d) => s + (d.product?.price || 0), 0);
  const hourlyRate = financialProfile.monthlyIncome / 160;
  const hoursSaved = (totalSaved / hourlyRate).toFixed(1);

  const lateNightBuys = bought.filter(d => d.hour >= 22 || d.hour <= 5);

  const categoryCount = {};
  decisions.forEach(d => {
    const cat = d.product?.category || "Unknown";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  // ── Radar chart: only "buy" decisions ─────────────────────────────────────
  // axes: avg need (no=1, maybe=0.5, yes=0), avg price (relative), avg usage (rarely=1, thisweek=0.5, today=0),
  //       % late night, avg mood stress (stressed=1, bored=0.7, neutral/happy=0.2)
  const boughtWithAnswers = bought.filter(d => d.answers);
  const radarData = boughtWithAnswers.length > 0 ? (() => {
    const needScore = boughtWithAnswers.reduce((s, d) => s + (d.answers.need === "No" ? 1 : d.answers.need === "Maybe" ? 0.5 : 0.1), 0) / boughtWithAnswers.length;
    const avgPrice  = boughtWithAnswers.reduce((s, d) => s + (d.product?.price || 0), 0) / boughtWithAnswers.length;
    const maxP = Math.max(...boughtWithAnswers.map(d => d.product?.price || 1));
    const priceScore = Math.min(1, avgPrice / Math.max(maxP, 1));
    const usageScore = boughtWithAnswers.reduce((s, d) => s + (d.answers.usage === "Rarely" ? 1 : d.answers.usage === "This week" ? 0.5 : 0.1), 0) / boughtWithAnswers.length;
    const lateScore  = boughtWithAnswers.filter(d => d.hour >= 22 || d.hour <= 5).length / boughtWithAnswers.length;
    const moodScore  = boughtWithAnswers.reduce((s, d) => s + (d.answers.mood === "Stressed" ? 1 : d.answers.mood === "Bored" ? 0.7 : d.answers.mood === "Excited" ? 0.3 : 0.2), 0) / boughtWithAnswers.length;

    return [
      { label: "Impulse need", value: needScore },
      { label: "Price",        value: priceScore },
      { label: "Rare use",     value: usageScore },
      { label: "Late night",   value: lateScore  },
      { label: "Emotion",      value: moodScore  },
    ];
  })() : null;

  // ── Doughnut chart: mood at time of bought decisions ──────────────────────
  const moodCounts = { Excited: 0, Happy: 0, Bored: 0, Stressed: 0 };
  bought.forEach(d => {
    const m = d.answers?.mood;
    if (m && moodCounts[m] !== undefined) moodCounts[m]++;
  });
  const doughnutData = [
    { label: "Excited",  value: moodCounts.Excited },
    { label: "Happy",    value: moodCounts.Happy    },
    { label: "Bored",    value: moodCounts.Bored    },
    { label: "Stressed", value: moodCounts.Stressed },
  ].filter(d => d.value > 0);

  const MOOD_COLORS = { Excited: "#10b981", Happy: "#34d399", Bored: "#6b7280", Stressed: "#e11d48" };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="orb" style={{ width: 350, height: 350, background: "#c4b5fd", top: -100, right: -80 }} />
      <Nav onNav={onNav} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 60px" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>Your Insights 📊</h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)" }}>
            Here's what your shopping patterns reveal — with care, not judgement.
          </p>
        </div>

        {totalDecisions === 0 ? (
          <div className="glass" style={{ borderRadius: 24, padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }} className="floating">🏦</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>No decisions yet</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>
              Go through the demo flow to start building your insights.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => { simulateDetection(); onNav("demo"); }}>
              Start Demo →
            </button>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
              <StatCard icon="🛒" label="Total decisions"  value={totalDecisions} bg="#f5f3ff" />
              <StatCard icon="✅" label="Purchased"        value={bought.length}  sub={`$${bought.reduce((s,d)=>s+(d.product?.price||0),0).toFixed(2)} spent`} bg="#f0fdf4" />
              <StatCard icon="❌" label="Skipped / delayed" value={skipped + delayed} sub={`$${totalSaved.toFixed(2)} saved`} bg="#fff1f2" />
              <StatCard icon="⏱" label="Hours saved"      value={`${hoursSaved}h`} sub="of work time" bg="#fffbeb" />
            </div>

            {/* Goal progress */}
            <div className="glass" style={{ borderRadius: 22, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16 }}>🎯 {financialProfile.goalName}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    ${financialProfile.goalSaved.toLocaleString()} saved of ${financialProfile.goalAmount.toLocaleString()}
                  </p>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
                  {Math.round((financialProfile.goalSaved / Math.max(1, financialProfile.goalAmount)) * 100)}%
                </p>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (financialProfile.goalSaved / Math.max(1, financialProfile.goalAmount)) * 100)}%` }} />
              </div>
            </div>

            {/* Charts row — only shown if there are buy decisions */}
            {bought.length >= 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                {/* Radar */}
                {radarData && (
                  <div className="glass" style={{ borderRadius: 22, padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🕸 Shopping Habits Radar</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Average across all purchases you bought</p>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <RadarChart data={radarData} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      {radarData.map(d => (
                        <div key={d.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: "var(--text-muted)" }}>{d.label}</span>
                          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{Math.round(d.value * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doughnut */}
                {doughnutData.length > 0 && (
                  <div className="glass" style={{ borderRadius: 22, padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>😊 Mood at Purchase</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>How you were feeling when you bought something</p>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <DoughnutChart data={doughnutData} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      {doughnutData.map(d => (
                        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: MOOD_COLORS[d.label] || "#888", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, flex: 1, color: "var(--text-muted)" }}>{d.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{d.value}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {bought.length > 0 && bought.length < 2 && (
              <div className="glass" style={{ borderRadius: 18, padding: 20, marginBottom: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                📈 Make 2+ purchases to unlock your shopping habit charts.
              </div>
            )}

            {/* Behavior patterns */}
            {(lateNightBuys.length >= 2 || topCategory) && (
              <div className="glass" style={{ borderRadius: 22, padding: 24, marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🧠 Behavior patterns</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {lateNightBuys.length >= 2 && (
                    <div style={{ background: "#ede9fe", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>🌙</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "#5b21b6" }}>Late-night shopping detected</p>
                        <p style={{ fontSize: 13, color: "#6d28d9" }}>
                          You've made {lateNightBuys.length} purchases after 10 PM. Late-night decisions are often more impulsive — worth knowing!
                        </p>
                      </div>
                    </div>
                  )}
                  {topCategory && (
                    <div style={{ background: "#dbeafe", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>📦</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8" }}>Favourite category: {topCategory[0]}</p>
                        <p style={{ fontSize: 13, color: "#2563eb" }}>
                          {topCategory[1]} out of {totalDecisions} decisions involved {topCategory[0]} products.
                        </p>
                      </div>
                    </div>
                  )}
                  {bought.length > 0 && (skipped + delayed) > bought.length && (
                    <div style={{ background: "#d1fae5", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>🌟</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "#065f46" }}>You're thoughtful with money!</p>
                        <p style={{ fontSize: 13, color: "#047857" }}>
                          You've skipped or delayed more than you've bought. That's real mindfulness.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Decision history */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📋 Decision history</h2>
              <div className="insights-grid">
                {decisions.map(record => (
                  <DecisionCard key={record.id} record={record} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
