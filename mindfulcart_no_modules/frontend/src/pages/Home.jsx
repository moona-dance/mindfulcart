import { useApp } from "../context/AppContext.jsx";
import Nav from "../components/Nav.jsx";

const features = [
  { icon: "⏸️", color: "#ede8ff", title: "Gentle Pause", desc: "A calm moment before checkout — no pressure, just reflection." },
  { icon: "✨", color: "#dbeafe", title: "AI Insight", desc: "Personalised insights based on your mood, habits, and financial goals." },
  { icon: "🐷", color: "#d1fae5", title: "Financial Clarity", desc: "See your purchase in real terms — hours worked, days from your goal." },
  { icon: "📊", color: "#fef3c7", title: "Spending Patterns", desc: "Discover when and why you shop — and feel good about knowing." },
];

const steps = [
  { num: "01", title: "Shopping detected", desc: "MindfulCart gently intercepts before you check out." },
  { num: "02", title: "Reflect for 30 seconds", desc: "Answer four simple questions about your need and mood." },
  { num: "03", title: "See the full picture", desc: "Financial context + AI insight, presented with care." },
  { num: "04", title: "Your choice, always", desc: "Buy, delay, or explore alternatives — you decide." },
];

export default function Home({ onNav }) {
  const { user, simulateDetection } = useApp();

  const handleDemo = () => {
    simulateDetection();
    if (user) onNav("demo");
    else onNav("login");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Background orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: "#c4b5fd", top: -150, left: -150 }} />
      <div className="orb" style={{ width: 400, height: 400, background: "#6ee7b7", bottom: -100, right: -100 }} />

      <Nav onNav={onNav} />

      {/* Hero */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 60px",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }} className="fade-up">
          <div className="chip" style={{ background: "#ede8ff", color: "#7c5cfc", marginBottom: 24, fontSize: 13 }}>
            ✨ Mindful spending, reimagined
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontSize: "clamp(42px, 8vw, 72px)",
            fontWeight: 400,
            lineHeight: 1.1,
            marginBottom: 20,
            color: "var(--text)",
          }}>
            Pause before<br />you purchase.
          </h1>

          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 36, fontWeight: 500 }}>
            Make decisions you feel good about.<br />
            No guilt, no pressure — just a gentle moment of clarity.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={handleDemo}>
              Try Demo →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => onNav("insights")}>
              View Insights
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Built for your wellbeing</h2>
          <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto" }}>
            Every feature is designed to support — never judge — your relationship with spending.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {features.map(f => (
            <div key={f.title} className="glass" style={{ borderRadius: 20, padding: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: f.color, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 24, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: 16 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>How it works</h2>
          <p style={{ fontSize: 17, color: "var(--text-muted)" }}>Four gentle steps. Thirty seconds. Better decisions.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 20 }}>
          {steps.map(s => (
            <div key={s.num} className="glass" style={{ borderRadius: 20, padding: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--primary-light)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: "var(--primary)", marginBottom: 14, fontSize: 13,
              }}>
                {s.num}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }} className="floating">🐷</div>
        <h2 style={{ fontSize: 34, fontWeight: 800, marginBottom: 14 }}>Ready to be more mindful?</h2>
        <p style={{ fontSize: 17, color: "var(--text-muted)", marginBottom: 32 }}>
          Watch your piggy bank react in real time. Every mindful pause is a step toward your goals.
        </p>
        <button className="btn btn-primary btn-lg" onClick={handleDemo}>
          💜 Start your journey
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px 32px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: 14,
      }}>
        🛒 MindfulCart · Hackathon Demo · Made with 💜
      </footer>

      {/* Floating simulate button */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50 }}>
        <button className="btn btn-primary" onClick={handleDemo} style={{
          boxShadow: "0 8px 24px rgba(124,92,252,0.4)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", animation: "pulse 1.5s infinite" }} />
          Simulate Detection
        </button>
      </div>
    </div>
  );
}
