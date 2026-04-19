import { useApp } from "../context/AppContext.jsx";

export default function Nav({ onNav }) {
  const { user, logout, simulateDetection } = useApp();

  const handleLogout = () => {
    logout();
    onNav("home");
  };

  return (
    <nav className="nav">
      <a className="nav-brand" onClick={() => onNav("home")} style={{ cursor: "pointer" }}>
        <div className="nav-logo">🛒</div>
        MindfulCart
      </a>
      <div className="nav-actions">
        {user ? (
          <>
            <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}
              onClick={() => onNav("insights")}>
              Insights
            </button>
            <button className="btn btn-outline" style={{ padding: "8px 16px", fontSize: 14 }}
              onClick={() => { simulateDetection(); onNav("demo"); }}>
              Try Demo
            </button>
            <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}
              onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}
              onClick={() => onNav("login")}>
              Sign in
            </button>
            <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 14 }}
              onClick={() => { simulateDetection(); onNav("demo"); }}>
              Try Demo
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
