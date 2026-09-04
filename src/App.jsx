import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import logo from "./assets/IMG_5520.PNG";
import "./App.css";

const SUPPORT_URL = "https://t.me/Jirmas_Trader";
const COMMUNITY_URL = "https://t.me/jirmastradezone";

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.23Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.85A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.85V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.37l3.24-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.12c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.22 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.63l3.24 2.52C7.31 7.84 9.46 6.12 12 6.12Z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="telegram-icon" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21.4 3.2 18.2 20c-.24 1.18-.87 1.47-1.77.91l-4.86-3.58-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.95 9-8.13c.39-.35-.09-.55-.61-.2L6.05 13.56 1.3 12.07c-1.03-.32-1.05-1.03.22-1.5L20.08 3.3c.87-.32 1.63.2 1.32-.1Z"
      />
    </svg>
  );
}

function LoginPage({ onLogin, loading, error }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand">
          <img src={logo} alt="Jirmas Signals" className="brand-logo" />
          <h1>JIRMAS SIGNALS</h1>
          <p>Professional Market Signals</p>
        </div>

        <button
          className="google-login-btn"
          onClick={onLogin}
          disabled={loading}
        >
          <GoogleIcon />
          <span>{loading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="login-divider">
          <span>Need help?</span>
        </div>

        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="telegram-card"
        >
          <div className="telegram-circle">
            <TelegramIcon />
          </div>

          <div className="telegram-content">
            <strong>Need Support?</strong>
            <span>Jirmas Trader</span>
          </div>

          <span className="arrow">›</span>
        </a>

        <a
          href={COMMUNITY_URL}
          target="_blank"
          rel="noreferrer"
          className="telegram-card"
        >
          <div className="telegram-circle">
            <TelegramIcon />
          </div>

          <div className="telegram-content">
            <strong>Join Our Community</strong>
            <span>Jirmas Trade Zone</span>
          </div>

          <span className="arrow">›</span>
        </a>

        <p className="login-footer">
          Secure access powered by JIRMAS SIGNALS
        </p>
      </section>
    </main>
  );
}

function Dashboard() {
  return (
    <main className="dashboard-preview">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <img src={logo} alt="Jirmas Signals" />
          <div>
            <strong>JIRMAS SIGNALS</strong>
            <span>LIVE MARKET ANALYSIS</span>
          </div>
        </div>

        <div className="live-status">
          <span /> LIVE
        </div>
      </header>

      <div className="dashboard-body">
        <div className="market-title">
          <span>EUR/USD</span>
          <small>1 MINUTE</small>
        </div>

        <div className="chart-placeholder">
          <span>LIVE MARKET CHART</span>
        </div>

        <div className="signal-placeholder">
          <small>CURRENT SIGNAL</small>
          <strong>WAIT</strong>
          <span>Live technical analysis</span>
        </div>

        <div className="stats-row">
          <div>
            <span>RSI</span>
            <strong>--</strong>
          </div>

          <div>
            <span>MACD</span>
            <strong>--</strong>
          </div>

          <div>
            <span>ATR</span>
            <strong>--</strong>
          </div>
        </div>
      </div>
    </main>
  );
}

function ActivationScreen({ onLogout }) {
  return (
    <div className="activation-screen">
      <div className="locked-dashboard">
        <Dashboard />
      </div>

      <div className="activation-overlay">
        <div className="activation-card">
          <div className="lock-icon">🔒</div>

          <div className="activation-logo">
            <img src={logo} alt="Jirmas Signals" />
          </div>

          <h2>Activate Your Access</h2>

          <p className="activation-main">
            Get Lifetime Access to Jirmas Signals
          </p>

          <p className="activation-bengali">
            লাইফটাইম সাবস্ক্রিপশন নিতে আমাদের সাথে যোগাযোগ করুন।
          </p>

          <div className="lifetime-badge">
            ✓ One-time lifetime activation
          </div>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="activation-button"
          >
            <TelegramIcon />
            Contact Us to Purchase Access
          </a>

          <a
            href={COMMUNITY_URL}
            target="_blank"
            rel="noreferrer"
            className="community-link"
          >
            Join Jirmas Trade Zone
          </a>

          <button className="logout-button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [accessActive, setAccessActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkAccess(userId) {
    const { data, error: accessError } = await supabase
      .from("user_access")
      .select("is_active")
      .eq("user_id", userId)
      .maybeSingle();

    if (accessError) {
      console.error("Access check error:", accessError);
      setAccessActive(false);
      return;
    }

    setAccessActive(data?.is_active === true);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message);
      }

      const currentSession = data?.session ?? null;

      setSession(currentSession);

      if (currentSession?.user?.id) {
        await checkAccess(currentSession.user.id);
      }

      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);

      if (newSession?.user?.id) {
        await checkAccess(newSession.user.id);
      } else {
        setAccessActive(false);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleGoogleLogin() {
    setError("");
    setLoginLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

    if (loginError) {
      setError(loginError.message);
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setAccessActive(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <img src={logo} alt="Jirmas Signals" />
        <div className="loading-spinner" />
        <span>Loading JIRMAS SIGNALS...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginPage
        onLogin={handleGoogleLogin}
        loading={loginLoading}
        error={error}
      />
    );
  }

  if (!accessActive) {
    return <ActivationScreen onLogout={handleLogout} />;
  }

  return <Dashboard />;
}