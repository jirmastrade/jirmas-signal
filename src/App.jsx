import { useState } from "react";
import { supabase } from "./lib/supabaseClient";
import logo from "./assets/IMG_5520.PNG";
import "./App.css";

const TELEGRAM_CHANNEL = "https://t.me/jirmastradezone";
const TELEGRAM_SUPPORT = "https://t.me/Jirmas_Trader";

function GoogleIcon() {
  return (
    <svg className="google-icon-svg" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.24Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.53 13.84A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.84V7.63H3.28A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.03 4.37l3.25-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.13c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.24 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.38l3.25 2.53C7.3 7.85 9.46 6.13 12 6.13Z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="telegram-icon-svg" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21.6 3.2 2.9 10.4c-1.28.51-1.27 1.22-.23 1.54l4.8 1.5 1.84 5.7c.22.61.11.86.74.86.49 0 .7-.22.96-.48l2.32-2.26 4.83 3.57c.89.49 1.53.23 1.75-.82l3.16-14.9c.32-1.27-.48-1.84-1.46-1.41Zm-3.7 3.2-7.95 7.08-.31 3.39-1.47-4.56 9.73-6.13c.43-.27.83-.12.5.22Z"
      />
    </svg>
  );
}

function App() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
      }
    } catch (error) {
      setMessage(error.message || "Google login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <main className="login-wrapper">

        {/* LOGO + BRAND */}
        <header className="brand">
          <div className="brand-logo-frame">
            <img
              src={logo}
              alt="Jirmas Trade Zone"
              className="brand-logo"
            />
          </div>

          <h1>JIRMAS SIGNALS</h1>
          <p>PROFESSIONAL 1 MIN MARKET SIGNALS</p>
        </header>

        <section className="login-card">

          {/* WELCOME */}
          <div className="welcome-section">
            <h2>Welcome Back</h2>
            <p>Sign in to access Jirmas Signals</p>
          </div>

          {/* GOOGLE */}
          <button
            className="google-login"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span className="google-logo">
              <GoogleIcon />
            </span>

            <span className="google-text">
              {loading ? "Connecting..." : "Continue with Google"}
            </span>

            {!loading && <span className="button-arrow">→</span>}
          </button>

          {message && (
            <div className="login-error">
              {message}
            </div>
          )}

          {/* DIVIDER */}
          <div className="divider">
            <span></span>
            <b>OR</b>
            <span></span>
          </div>

          {/* 1 — SUPPORT FIRST */}
          <a
            className="action-card centered-card"
            href={TELEGRAM_SUPPORT}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="telegram-logo purple">
              <TelegramIcon />
            </div>

            <div className="action-content">
              <div className="action-label">
                NEED SUPPORT?
              </div>

              <div className="action-title">
                Jirmas Trader
              </div>

              <div className="action-link">
                Contact Support <span>→</span>
              </div>
            </div>
          </a>

          {/* 2 — JOIN CHANNEL SECOND */}
          <a
            className="action-card centered-card"
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="telegram-logo blue">
              <TelegramIcon />
            </div>

            <div className="action-content">
              <div className="action-label">
                JOIN OUR COMMUNITY
              </div>

              <div className="action-title">
                Jirmas Trade Zone
              </div>

              <div className="action-link">
                Join Channel <span>→</span>
              </div>
            </div>
          </a>

          {/* SECURITY */}
          <div className="security">
            <span>🔒</span>
            <span>Secure access</span>
            <i>•</i>
            <span>Mobile ready</span>
            <i>•</i>
            <span>1 MIN</span>
          </div>
        </section>

        <footer className="footer">
          ©️ 2026 JIRMAS SIGNALS
          <span>•</span>
          1 MIN SIGNALS
        </footer>
      </main>
    </div>
  );
}

export default App;