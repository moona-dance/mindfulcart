import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Demo from "./pages/Demo.jsx";
import Insights from "./pages/Insights.jsx";
import Onboarding from "./pages/Onboarding.jsx";

function Router({ page, setPage }) {
  const { showOnboarding, user } = useApp();
  if (showOnboarding && user) return <Onboarding onNav={setPage} />;
  if (page === "login")    return <Login onNav={setPage} />;
  if (page === "demo")     return <Demo onNav={setPage} />;
  if (page === "decision") return <Demo onNav={setPage} />;
  if (page === "insights") return <Insights onNav={setPage} />;
  return <Home onNav={setPage} />;
}

export default function App() {
  const getInitialPage = () => {
    const path   = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Extension sends ?source=mindfulcart or ?name=... — go straight to demo
    // and DO NOT call simulateDetection — AppContext reads the URL params itself
    if (params.get("source") === "mindfulcart" || params.get("name")) return "demo";

    if (path.includes("decision")) return "demo";
    if (path.includes("demo"))     return "demo";
    if (path.includes("insights")) return "insights";
    if (path.includes("login"))    return "login";
    return "home";
  };

  const [page, setPage] = useState(getInitialPage);

  return (
    <AppProvider>
      <Router page={page} setPage={setPage} />
    </AppProvider>
  );
}
