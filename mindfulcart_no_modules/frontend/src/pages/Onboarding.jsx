import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function Onboarding({ onNav }) {
  const { user, financialProfile, setFinancialProfile, setShowOnboarding } = useApp();
  const [income, setIncome] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalSaved, setGoalSaved] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!income || !goalName || !goalAmount) {
      setError("Please fill in income, goal name, and target amount.");
      return;
    }
    setFinancialProfile({
      monthlyIncome: parseFloat(income) || 4500,
      goalName:      goalName.trim() || "My Goal",
      goalAmount:    parseFloat(goalAmount) || 5000,
      goalSaved:     parseFloat(goalSaved) || 0,
    });
    setShowOnboarding(false);
    onNav("demo");
  };

  const handleSkip = () => {
    setShowOnboarding(false);
    onNav("demo");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0edff 0%, #faf9ff 60%, #edfff7 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div className="orb" style={{ width: 350, height: 350, background: "#c4b5fd", top: -100, right: -80 }} />
      <div className="orb" style={{ width: 280, height: 280, background: "#6ee7b7", bottom: -60, left: -60 }} />

      <div className="glass fade-up" style={{ borderRadius: 28, padding: "40px 36px", width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }} className="floating">🎯</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            Welcome, {user?.name?.split(" ")[0]}!
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Set your financial goal once. MindfulCart will use it every time to show you what a purchase really costs.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Monthly income ($)</label>
            <input className="input" type="number" placeholder="e.g. 4500" value={income} onChange={e => { setIncome(e.target.value); setError(""); }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">What are you saving for?</label>
            <input className="input" type="text" placeholder="e.g. Emergency fund, trip to Japan..." value={goalName} onChange={e => { setGoalName(e.target.value); setError(""); }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label className="label">Goal amount ($)</label>
              <input className="input" type="number" placeholder="5000" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} />
            </div>
            <div>
              <label className="label">Already saved ($)</label>
              <input className="input" type="number" placeholder="0" value={goalSaved} onChange={e => setGoalSaved(e.target.value)} />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#e11d48", marginBottom: 12, fontWeight: 600 }}>⚠️ {error}</p>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg">
            Save & start →
          </button>
        </form>

        <button
          onClick={handleSkip}
          style={{
            width: "100%", marginTop: 12, padding: "12px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-body)",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
