import { createContext, useContext, useState, useEffect, useCallback } from "react";

const MOCK_PRODUCTS = [
  { name: "Wireless Noise-Cancelling Headphones", price: 129.99, category: "Electronics" },
  { name: "Minimalist Leather Wallet", price: 49.95, category: "Accessories" },
  { name: "Yoga Mat Premium", price: 78.00, category: "Fitness" },
  { name: "Scented Candle Set (3-pack)", price: 34.99, category: "Home & Living" },
  { name: "Running Shoes — Limited Edition", price: 189.00, category: "Footwear" },
  { name: "Smart Water Bottle", price: 42.50, category: "Fitness" },
  { name: "Linen Throw Blanket", price: 65.00, category: "Home & Living" },
  { name: "Portable Espresso Maker", price: 89.99, category: "Kitchen" },
];

const defaultProduct = MOCK_PRODUCTS[0];
const defaultFinancial = {
  monthlyIncome: 4500,
  goalName: "Emergency Fund",
  goalAmount: 5000,
  goalSaved: 1800,
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mc_user")) || null; } catch { return null; }
  });
  const [financialProfile, setFinancialProfileRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mc_financial")) || defaultFinancial; } catch { return defaultFinancial; }
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(defaultProduct);
  const [originalPurchaseUrl, setOriginalPurchaseUrl] = useState(null);
  const [reflectionAnswers, setReflectionAnswers] = useState({});
  const [demoStep, setDemoStep] = useState("interception");
  const [decisions, setDecisions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mc_decisions")) || []; } catch { return []; }
  });
  const [analysisResult, setAnalysisResult] = useState(null);

  const setFinancialProfile = useCallback((fp) => {
    setFinancialProfileRaw(fp);
    localStorage.setItem("mc_financial", JSON.stringify(fp));
  }, []);

  useEffect(() => {
    localStorage.setItem("mc_decisions", JSON.stringify(decisions));
  }, [decisions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name     = params.get("name");
    const price    = params.get("price");
    const category = params.get("category");
    const keywords = params.get("keywords");
    const pageUrl  = params.get("pageUrl");
    if (name && name !== "Unknown") {
      setCurrentProduct({
        name:     decodeURIComponent(name),
        price:    price && price !== "null" ? parseFloat(price) : defaultProduct.price,
        category: category ? decodeURIComponent(category) : "General",
        keywords: keywords ? keywords.split(",") : [],
      });
      setDemoStep("interception");
    }
    if (pageUrl) setOriginalPurchaseUrl(decodeURIComponent(pageUrl));
    // Sync financial data passed from extension
    const income     = params.get("income");
    const goalName   = params.get("goalName");
    const goalAmount = params.get("goalAmount");
    const goalSaved  = params.get("goalSaved");
    if (income || goalName) {
      const existing = (() => { try { return JSON.parse(localStorage.getItem("mc_financial")) || {}; } catch { return {}; } })();
      const merged = {
        ...defaultFinancial, ...existing,
        ...(income     ? { monthlyIncome: parseFloat(income) } : {}),
        ...(goalName   ? { goalName } : {}),
        ...(goalAmount ? { goalAmount: parseFloat(goalAmount) } : {}),
        ...(goalSaved  ? { goalSaved:  parseFloat(goalSaved)  } : {}),
      };
      setFinancialProfileRaw(merged);
    }
  }, []);

  const login = useCallback((name, email) => {
    const u = { name, email };
    setUser(u);
    localStorage.setItem("mc_user", JSON.stringify(u));
    const saved = (() => { try { return JSON.parse(localStorage.getItem("mc_financial")); } catch { return null; } })();
    const isDefault = !saved || (saved.goalName === defaultFinancial.goalName && saved.monthlyIncome === defaultFinancial.monthlyIncome);
    if (isDefault) setShowOnboarding(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mc_user");
  }, []);

  const addDecision = useCallback((record) => {
    setDecisions(prev => [record, ...prev].slice(0, 100));
  }, []);

  const simulateDetection = useCallback((product) => {
    const random = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
    setCurrentProduct({ ...random, ...product });
    setReflectionAnswers({});
    setAnalysisResult(null);
    setOriginalPurchaseUrl(null);
    setDemoStep("interception");
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      showOnboarding, setShowOnboarding,
      currentProduct, setCurrentProduct,
      originalPurchaseUrl, setOriginalPurchaseUrl,
      reflectionAnswers, setReflectionAnswers,
      financialProfile, setFinancialProfile,
      hourlyRate: financialProfile.monthlyIncome / 160,
      demoStep, setDemoStep,
      decisions, addDecision,
      analysisResult, setAnalysisResult,
      simulateDetection,
      mockProducts: MOCK_PRODUCTS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
