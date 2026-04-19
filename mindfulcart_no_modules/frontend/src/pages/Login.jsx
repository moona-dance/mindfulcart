import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import Nav from "../components/Nav.jsx";

export default function Login({ onNav }) {
  const { login } = useApp();
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode]   = useState("login");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError("Please fill in all fields."); return; }
    if (!email.includes("@"))          { setError("Please enter a valid email."); return; }
    login(name.trim(), email.trim());
    // AppProvider will set showOnboarding=true if needed; App.jsx Router handles the redirect
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0edff 0%, #faf9ff 60%, #edfff7 100%)" }}>
      <div className="orb" style={{ width: 400, height: 400, background: "#c4b5fd", top: -120, right: -120 }} />
      <div className="orb" style={{ width: 300, height: 300, background: "#6ee7b7", bottom: -80, left: -80 }} />
      <Nav onNav={onNav} />

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 40px" }}>
        <div className="glass fade-up" style={{ borderRadius: 28, padding: "40px 36px", width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }} className="floating">🐷</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              {mode === "login" ? "Sign in to access your insights and financial profile." : "Join MindfulCart to track your decisions."}
            </p>
          </div>

          <div style={{
            background: "var(--primary-light)", borderRadius: 14,
            padding: "14px 16px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🎯</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>Your financial goal is waiting</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Log in to see how each purchase fits into your bigger picture.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Your name</label>
              <input className="input" type="text" placeholder="Aigerim" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
            </div>
            {error && <p style={{ fontSize: 13, color: "#e11d48", marginBottom: 14, fontWeight: 600 }}>⚠️ {error}</p>}
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              {mode === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{ color: "var(--primary)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <p style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
            Demo only — data stays in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
